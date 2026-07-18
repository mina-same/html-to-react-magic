import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { donationsDb } from "@/lib/db";
import { keys } from "@/api/keys";
import type { Donation } from "../../types";
import { POSSIBLE_FIELDS, selStyle } from "./constants";

/** A single imported row, indexed by column position. */
type ImportRow = unknown[];

interface Props {
  assocId?: string;
}

/**
 * Self-contained xlsx import flow: owns the hidden file input, header→field
 * mapping UI, preview, and the batch insert. Always mounted so the toolbar's
 * "استيراد" button (which clicks `#excel-import`) works at any time.
 */
export default function ImportModal({ assocId }: Props) {
  const qc = useQueryClient();
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importData, setImportData] = useState<ImportRow[]>([]);

  const importM = useMutation({
    mutationFn: async ({
      rows,
      mapping,
    }: {
      rows: ImportRow[];
      mapping: Record<string, string>;
    }) => {
      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          const payload: Partial<Omit<Donation, "id">> & Record<string, unknown> = {};
          for (const [headerIndex, targetField] of Object.entries(mapping)) {
            const idx = parseInt(headerIndex);
            const value = row[idx];

            if (targetField === "amount") {
              const num = Number(value);
              if (!isNaN(num)) payload.amount = num;
            } else if (targetField === "status") {
              const statusStr = String(value).trim();
              payload.status = statusStr === "مكتمل" ? "completed" : "pending";
            } else if (targetField === "date") {
              if (value instanceof Date) {
                const d = new Date(value);
                d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                payload.date = d.toISOString().slice(0, 10);
              } else {
                payload.date = String(value ?? "");
              }
            } else {
              payload[targetField] = String(value ?? "");
            }
          }

          if (!payload.name || !payload.amount || payload.amount <= 0) {
            errorCount++;
            continue;
          }

          // Set defaults
          payload.status = payload.status || "pending";
          payload.paymentMethod = payload.paymentMethod || "نقد";
          payload.date = payload.date || new Date().toISOString().split("T")[0];

          const created = await donationsDb.create(
            assocId as string,
            payload as Omit<Donation, "id">,
          );
          if (created) successCount++;
          else errorCount++;
        } catch {
          errorCount++;
        }
      }

      return { successCount, errorCount };
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: keys.donations(assocId ?? "") });
      if (res.successCount > 0) {
        toast.success(`تم استيراد ${res.successCount} تبرعات بنجاح`);
      }
      if (res.errorCount > 0) {
        toast.error(`فشل استيراد ${res.errorCount} تبرعات`);
      }
    },
  });

  const resetImportState = () => {
    setImportFile(null);
    setImportHeaders([]);
    setImportMapping({});
    setImportData([]);
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<ImportRow>(firstSheet, {
          header: 1,
        });

        if (jsonData.length === 0) {
          toast.error("الملف فارغ");
          return;
        }

        const headers = jsonData[0] as unknown as string[];
        const rows = jsonData
          .slice(1)
          .filter((row) => row.some((cell) => cell !== "" && cell !== null && cell !== undefined));

        setImportFile(file);
        setImportHeaders(headers);
        setImportData(rows);

        // Set default mapping: first column to name, second to amount
        const defaultMapping: Record<string, string> = {};
        if (headers.length >= 1) {
          defaultMapping[0] = "name";
        }
        if (headers.length >= 2) {
          defaultMapping[1] = "amount";
        }

        // Try to auto-map by header name too
        headers.forEach((header, idx) => {
          const h = header.toString().trim();
          if (h.includes("اسم") || h.includes("متبرع")) defaultMapping[idx] = "name";
          if (h.includes("قيمة") || h.includes("مبلغ") || h.includes("مبلغ"))
            defaultMapping[idx] = "amount";
          if (h.includes("رقم") && h.includes("تبرع")) defaultMapping[idx] = "donationNumber";
          if (h.includes("جوال") || h.includes("هاتف")) defaultMapping[idx] = "phone";
          if (h.includes("مشروع")) defaultMapping[idx] = "projectName";
          if (h.includes("دفع") || h.includes("طريقة")) defaultMapping[idx] = "paymentMethod";
          if (h.includes("بنك")) defaultMapping[idx] = "bank";
          if (h.includes("حساب")) defaultMapping[idx] = "accountNumber";
          if (h.includes("حالة")) defaultMapping[idx] = "status";
          if (h.includes("مصدر")) defaultMapping[idx] = "source";
          if (h.includes("تاريخ") || h.includes("وقت")) defaultMapping[idx] = "date";
        });

        setImportMapping(defaultMapping);
        setImportOpen(true);
      } catch {
        toast.error("تعذر قراءة الملف");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = "";
  };

  const handleImport = () => {
    if (!assocId) {
      toast.error("يلزم تسجيل الدخول أولاً.");
      return;
    }

    const requiredFields = ["name", "amount"];
    const hasRequired = requiredFields.every((field) =>
      Object.values(importMapping).includes(field),
    );

    if (!hasRequired) {
      toast.error("يرجى تعيين حقلي اسم المتبرع وقيمة التبرع");
      return;
    }

    importM.mutate(
      { rows: importData, mapping: importMapping },
      {
        onSettled: () => {
          setImportOpen(false);
          resetImportState();
        },
      },
    );
  };

  const importing = importM.isPending;

  return (
    <>
      <input
        id="excel-import"
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleImportFileSelect}
        style={{ display: "none" }}
      />

      <Dialog
        open={importOpen}
        onOpenChange={(open) => {
          setImportOpen(open);
          if (!open) resetImportState();
        }}
      >
        <DialogContent
          style={{
            maxWidth: 800,
            width: "95vw",
            fontFamily: "'Tajawal','Cairo',sans-serif",
            direction: "rtl",
            maxHeight: "90vh",
            overflowY: "auto",
            overflowX: "auto",
            borderRadius: 16,
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{
                fontFamily: "'Tajawal','Cairo',sans-serif",
                fontSize: "1.2rem",
                fontWeight: 800,
                color: "#111827",
              }}
            >
              استيراد التبرعات
            </DialogTitle>
          </DialogHeader>
          <div>
            <p
              style={{
                marginBottom: 20,
                color: "#6b7280",
                fontSize: "0.9rem",
                lineHeight: 1.6,
              }}
            >
              قم بتعيين الأعمدة من الملف إلى الحقول المناسبة
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {importHeaders.map((header, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "#f9fafb",
                    padding: "10px 14px",
                    borderRadius: 12,
                  }}
                >
                  <div
                    style={{
                      minWidth: 160,
                      padding: "8px 12px",
                      background: "white",
                      borderRadius: 8,
                      fontSize: "0.87rem",
                      border: "1px solid #e5e7eb",
                      fontWeight: 600,
                    }}
                  >
                    {header}
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "1.1rem" }}>→</span>
                  <select
                    value={importMapping[idx] || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        setImportMapping({ ...importMapping, [idx]: e.target.value });
                      } else {
                        const newMapping = { ...importMapping };
                        delete newMapping[idx];
                        setImportMapping(newMapping);
                      }
                    }}
                    style={{ ...selStyle, flex: 1 }}
                  >
                    <option value="">تجاهل هذا العمود</option>
                    {POSSIBLE_FIELDS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {importData.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <p
                  style={{
                    marginBottom: 12,
                    color: "#4b5563",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  معاينة البيانات ({importData.length} صف):
                </p>
                <div style={{ overflowX: "auto", background: "#f9fafb", borderRadius: 12 }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "0.8rem",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f3f4f6" }}>
                        {importHeaders.map((h, i) => (
                          <th
                            key={i}
                            style={{
                              padding: "10px 14px",
                              borderBottom: "1px solid #e5e7eb",
                              color: "#4b5563",
                              whiteSpace: "nowrap",
                              textAlign: "right",
                              fontWeight: 700,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {importData.slice(0, 3).map((row, i) => (
                        <tr key={i}>
                          {importHeaders.map((_, j) => {
                            const cell = row[j];
                            return (
                              <td
                                key={j}
                                style={{
                                  padding: "10px 14px",
                                  borderBottom: "1px solid #f3f4f6",
                                  color: "#374151",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {cell instanceof Date
                                  ? cell.toISOString().slice(0, 10)
                                  : ((cell as string | number | undefined) ?? "")}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 24,
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportOpen(false);
                resetImportState();
              }}
              disabled={importing}
              style={{
                borderRadius: 10,
                borderColor: "#e5e7eb",
                color: "#4b5563",
                fontWeight: 600,
              }}
            >
              إلغاء
            </Button>
            <Button
              size="sm"
              onClick={handleImport}
              disabled={importing}
              style={{
                background: importing
                  ? "linear-gradient(135deg, #6b9e85, #8bbfa0)"
                  : "linear-gradient(135deg, #2d7a52, #4a9e70)",
                color: "white",
                borderRadius: 10,
                fontWeight: 600,
                cursor: importing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {importing && (
                <span
                  className="animate-spin"
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    display: "inline-block",
                  }}
                />
              )}
              {importing ? "جاري الاستيراد..." : `استيراد ${importData.length} تبرعات`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
