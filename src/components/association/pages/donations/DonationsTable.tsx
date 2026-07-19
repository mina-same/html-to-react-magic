import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { QueryState } from "@/components/common/StateViews";
import { CreditCard, Plus, Download, Upload, FileText } from "lucide-react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { Donation } from "../../types";
import { cn } from "@/lib/utils";
import {
  PAYMENT_METHOD_ICONS,
  MONTHS,
  PAGE_SIZE,
  TABLE_HEADERS,
  EXPORT_HEADERS,
  formatAmount,
  statusLabel,
} from "./constants";

interface Props {
  donations: Donation[];
  query: UseQueryResult<Donation[], unknown>;
  onCreateClick: () => void;
}

export default function DonationsTable({ donations, query, onCreateClick }: Props) {
  const [filter, setFilter] = useState("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);

  const setFilterAndReset = (v: string) => {
    setFilter(v);
    setPage(1);
    setSelected(new Set());
  };
  const setPeriodAndReset = (v: string) => {
    setPeriodFilter(v);
    setPage(1);
    setSelected(new Set());
  };

  const filtered = donations.filter((d) => {
    if (filter === "large" && d.amount < 2500) return false;
    if (filter === "pending" && d.status !== "pending") return false;
    if (filter === "completed" && d.status !== "completed") return false;
    if (periodFilter !== "all") {
      const month = new Date(d.date).getMonth() + 1;
      if (periodFilter === "week") {
        const week = new Date();
        week.setDate(week.getDate() - 7);
        if (new Date(d.date) < week) return false;
      } else if (periodFilter === "month") {
        const mo = new Date();
        mo.setMonth(mo.getMonth() - 1);
        if (new Date(d.date) < mo) return false;
      } else if (periodFilter.startsWith("month-")) {
        if (month !== parseInt(periodFilter.split("-")[1])) return false;
      }
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleExport = () => {
    const rows = filtered.map((d) => [
      d.donationNumber,
      d.name,
      d.phone,
      d.projectName,
      d.amount,
      d.paymentMethod,
      d.bank,
      d.accountNumber,
      statusLabel(d.status),
      d.source,
      d.date,
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...EXPORT_HEADERS, ...rows] as (string | number)[][]);
    XLSX.utils.book_append_sheet(wb, ws, "تبرعات");
    XLSX.writeFile(wb, `تبرعات_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const downloadTemplate = () => {
    const example = [
      "21",
      "محمد",
      "",
      "الأجهزة الطبية",
      "50",
      "بطاقة رقمية",
      "",
      "",
      "مكتمل",
      "المتجر",
      "2026-03-25",
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([...EXPORT_HEADERS, example] as string[][]);
    XLSX.utils.book_append_sheet(wb, ws, "نموذج");
    XLSX.writeFile(wb, "نموذج_تبرعات.xlsx");
  };

  const allOnPage = paginated.length > 0 && paginated.every((d) => selected.has(d.id));
  const someOnPage = paginated.some((d) => selected.has(d.id));

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b bg-gradient-to-b from-secondary/40 to-card px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[--green-mid] to-[--green-light]">
          <CreditCard size={20} className="text-white" />
        </div>
        <div className="min-w-[160px] flex-1">
          <div className="text-base font-bold text-foreground">سجل التبرعات</div>
          <div className="mt-0.5 text-sm text-muted-foreground">{filtered.length} تبرعات</div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onCreateClick} className="h-9 gap-1.5 bg-gradient-to-br from-[--green-mid] to-[--green-light] font-semibold">
            <Plus size={16} />
            تبرع جديد
          </Button>
          <Button size="sm" variant="outline" onClick={handleExport} title="تصدير إلى Excel" className="h-9 gap-1.5 border-primary/20 font-semibold text-primary">
            <Download size={16} />
            تصدير
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => document.getElementById("excel-import")?.click()}
            title="استيراد من Excel"
            className="h-9 gap-1.5 border-primary/20 font-semibold text-primary"
          >
            <Upload size={16} />
            استيراد
          </Button>
          <Button size="sm" variant="ghost" onClick={downloadTemplate} title="تحميل نموذج Excel" className="h-9 gap-1.5 font-semibold text-muted-foreground">
            <FileText size={16} />
            النموذج
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodFilter} onValueChange={setPeriodAndReset}>
            <SelectTrigger className="h-9 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الفترات</SelectItem>
              <SelectItem value="week">آخر أسبوع</SelectItem>
              <SelectItem value="month">آخر شهر</SelectItem>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={`month-${i + 1}`}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={setFilterAndReset}>
            <SelectTrigger className="h-9 w-[160px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التبرعات</SelectItem>
              <SelectItem value="large">تبرعات كبيرة +2500</SelectItem>
              <SelectItem value="pending">معلق فقط</SelectItem>
              <SelectItem value="completed">مكتملة فقط</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <QueryState<Donation[]>
        query={query}
        isEmpty={(data) => data.length === 0}
        emptyTitle="لا توجد تبرعات بعد"
        emptyHint="ابدأ بإضافة تبرع جديد أو استيراد تبرعات من ملف Excel."
        emptyIcon="🤲"
      >
        {() => (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                        onCheckedChange={(checked) => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (checked) paginated.forEach((d) => next.add(d.id));
                            else paginated.forEach((d) => next.delete(d.id));
                            return next;
                          });
                        }}
                      />
                    </TableHead>
                    {TABLE_HEADERS.map((h) => (
                      <TableHead key={h} className="whitespace-nowrap font-bold text-slate-600">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((d) => (
                    <TableRow key={d.id} className={cn(selected.has(d.id) && "bg-secondary/40")}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selected.has(d.id)}
                          onCheckedChange={(checked) => {
                            setSelected((prev) => {
                              const next = new Set(prev);
                              if (checked) next.add(d.id);
                              else next.delete(d.id);
                              return next;
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell className="text-muted-foreground">{d.donationNumber || "—"}</TableCell>
                      <TableCell className="font-bold text-foreground/80">{d.name}</TableCell>
                      <TableCell className="text-muted-foreground">{d.phone || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{d.projectName || "—"}</TableCell>
                      <TableCell className="text-sm font-extrabold text-primary">
                        {formatAmount(d.amount)} ر.س
                      </TableCell>
                      <TableCell className="text-foreground/80">
                        <span className="ml-1.5">{PAYMENT_METHOD_ICONS[d.paymentMethod] ?? ""}</span>
                        {d.paymentMethod}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1 text-xs font-bold",
                            d.status === "completed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800",
                          )}
                        >
                          {statusLabel(d.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{d.source || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">{d.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {selected.size > 0 && (
              <div className="flex items-center gap-3 border-t bg-secondary/40 px-5 py-2.5 text-sm">
                <span className="font-bold text-primary">{selected.size} محدد</span>
                <Button size="sm" variant="outline" onClick={() => setSelected(new Set())} className="h-[30px] text-xs text-muted-foreground">
                  إلغاء التحديد
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-[30px] border-primary/20 text-xs text-primary"
                  onClick={() => {
                    const rows = donations.filter((d) => selected.has(d.id));
                    const headers = [...TABLE_HEADERS];
                    const data = rows.map((d) => [
                      d.donationNumber,
                      d.name,
                      d.phone,
                      d.projectName,
                      d.amount,
                      d.paymentMethod,
                      statusLabel(d.status),
                      d.source,
                      d.date,
                    ]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(
                      wb,
                      XLSX.utils.aoa_to_sheet([headers, ...data] as (string | number)[][]),
                      "تبرعات",
                    );
                    XLSX.writeFile(wb, `تبرعات_محددة.xlsx`);
                  }}
                >
                  تصدير المحددة
                </Button>
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t px-5 py-3.5 text-sm text-muted-foreground">
                <span>
                  عرض {(safePage - 1) * PAGE_SIZE + 1}–
                  {Math.min(safePage * PAGE_SIZE, filtered.length)} من {filtered.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={safePage === 1}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm",
                      safePage === 1 ? "cursor-default bg-muted text-muted-foreground/50" : "bg-card text-foreground/70 hover:bg-muted",
                    )}
                  >
                    السابق
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                    .reduce<(number | "…")[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground/60">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          className={cn(
                            "h-8 w-8 rounded-lg border text-sm",
                            safePage === p
                              ? "border-primary bg-primary font-bold text-primary-foreground"
                              : "border-border bg-card text-foreground/70 hover:bg-muted",
                          )}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={safePage === totalPages}
                    className={cn(
                      "rounded-lg border px-3 py-1.5 text-sm",
                      safePage === totalPages ? "cursor-default bg-muted text-muted-foreground/50" : "bg-card text-foreground/70 hover:bg-muted",
                    )}
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </QueryState>
    </Card>
  );
}
