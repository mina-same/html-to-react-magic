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
import { Loader2, ArrowLeft } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { donationsDb } from "@/lib/db";
import { keys } from "@/api/keys";
import type { Donation } from "../../types";
import { POSSIBLE_FIELDS } from "./constants";

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
        <DialogContent className="max-w-[800px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-extrabold">استيراد التبرعات</DialogTitle>
          </DialogHeader>
          <div>
            <p className="mb-5 text-sm leading-6 text-muted-foreground">
              قم بتعيين الأعمدة من الملف إلى الحقول المناسبة
            </p>
            <div className="flex flex-col gap-3">
              {importHeaders.map((header, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3.5 py-2.5">
                  <div className="min-w-[160px] rounded-lg border bg-card px-3 py-2 text-sm font-semibold">
                    {header}
                  </div>
                  <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Select
                    value={importMapping[idx] || "_ignore_"}
                    onValueChange={(v) => {
                      if (v !== "_ignore_") {
                        setImportMapping({ ...importMapping, [idx]: v });
                      } else {
                        const newMapping = { ...importMapping };
                        delete newMapping[idx];
                        setImportMapping(newMapping);
                      }
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_ignore_">تجاهل هذا العمود</SelectItem>
                      {POSSIBLE_FIELDS.map((f) => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {importData.length > 0 && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-foreground/70">
                  معاينة البيانات ({importData.length} صف):
                </p>
                <div className="overflow-x-auto rounded-xl bg-muted/40">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/60 hover:bg-muted/60">
                        {importHeaders.map((h, i) => (
                          <TableHead key={i} className="whitespace-nowrap font-bold text-foreground/70">
                            {h}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importData.slice(0, 3).map((row, i) => (
                        <TableRow key={i}>
                          {importHeaders.map((_, j) => {
                            const cell = row[j];
                            return (
                              <TableCell key={j} className="whitespace-nowrap text-foreground/80">
                                {cell instanceof Date
                                  ? cell.toISOString().slice(0, 10)
                                  : ((cell as string | number | undefined) ?? "")}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setImportOpen(false);
                resetImportState();
              }}
              disabled={importing}
            >
              إلغاء
            </Button>
            <Button size="sm" onClick={handleImport} disabled={importing} className="gap-2">
              {importing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {importing ? "جاري الاستيراد..." : `استيراد ${importData.length} تبرعات`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
