import { useState } from "react";
import type { Employee } from "../types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Users, UserPlus, Pencil, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  employees: Employee[];
  onAdd: () => void;
  onEdit: (employee: Employee) => void;
  onStatusChange: (id: number, status: Employee["status"]) => void;
  onDelete: (id: number) => void;
}

const STATUS_LABEL: Record<Employee["status"], string> = {
  active: "نشط",
  away: "بعيد",
  off: "خارج العمل",
};
const STATUS_CLASS: Record<Employee["status"], string> = {
  active: "bg-emerald-100 text-emerald-800",
  away: "bg-amber-100 text-amber-800",
  off: "bg-slate-100 text-slate-600",
};
const STATUS_DOT: Record<Employee["status"], string> = {
  active: "bg-emerald-500",
  away: "bg-amber-500",
  off: "bg-slate-400",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function TeamPage({ employees, onAdd, onEdit, onStatusChange, onDelete }: Props) {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [confirmBulk, setConfirmBulk] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(employees.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = employees.slice((safePage - 1) * pageSize, safePage * pageSize);

  const activeCount = employees.filter((e) => e.status === "active").length;
  const allOnPage = paginated.length > 0 && paginated.every((e) => selected.has(e.id));
  const someOnPage = paginated.some((e) => selected.has(e.id));

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPage) paginated.forEach((e) => next.delete(e.id));
      else paginated.forEach((e) => next.add(e.id));
      return next;
    });
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    for (const id of selected) onDelete(id);
    setSelected(new Set());
    setConfirmBulk(false);
    setPage(1);
  }

  function handlePageSize(n: number) {
    setPageSize(n);
    setPage(1);
    setSelected(new Set());
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 border-b bg-gradient-to-b from-secondary/40 to-card px-5 py-4">
        <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-mid to-green-light">
          <Users size={20} className="text-white" />
        </div>
        <div>
          <div className="text-base font-bold text-foreground">الفريق</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {employees.length} موظف · {activeCount} نشط
          </div>
        </div>

        <div className="mr-auto flex flex-wrap items-center gap-2">
          <Badge className="border border-emerald-200 bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {activeCount} نشطين
          </Badge>

          {selected.size > 0 &&
            (confirmBulk ? (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-destructive">
                  حذف {selected.size} موظف؟
                </span>
                <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="h-8 text-xs">
                  تأكيد
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmBulk(false)} className="h-8 text-xs">
                  إلغاء
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmBulk(true)}
                className="h-[34px] gap-1.5 border-red-300 text-xs text-destructive hover:bg-red-50"
              >
                <Trash2 size={14} />
                حذف المحددين ({selected.size})
              </Button>
            ))}

          <Button
            size="sm"
            onClick={onAdd}
            className="h-9 gap-1.5 bg-gradient-to-br from-green-mid to-green-light font-semibold"
          >
            <UserPlus size={15} />
            إضافة موظف
          </Button>
        </div>
      </div>

      {employees.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد موظفون بعد" description="ابدأ بإضافة أحد أفراد الفريق" className="py-14" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-11 text-center">
                    <Checkbox
                      checked={allOnPage ? true : someOnPage ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                    />
                  </TableHead>
                  <TableHead>الموظف</TableHead>
                  <TableHead>المنصب</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">تغيير الحالة</TableHead>
                  <TableHead className="w-[140px] text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((emp) => {
                  const isSelected = selected.has(emp.id);
                  const isConfirming = confirmId === emp.id;

                  return (
                    <TableRow key={emp.id} className={cn(isSelected && "bg-secondary/40")}>
                      <TableCell className="text-center">
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(emp.id)} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="relative shrink-0">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback
                                style={{ background: emp.color }}
                                className="text-sm font-bold text-white"
                              >
                                {emp.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span
                              className={cn(
                                "absolute bottom-0.5 left-0.5 h-2.5 w-2.5 rounded-full border-2 border-white",
                                STATUS_DOT[emp.status],
                              )}
                            />
                          </div>
                          <span className="font-semibold text-foreground">{emp.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">{emp.role || "—"}</TableCell>

                      <TableCell className="text-center">
                        <span
                          className={cn(
                            "inline-block rounded-full px-3 py-1 text-xs font-bold",
                            STATUS_CLASS[emp.status],
                          )}
                        >
                          {STATUS_LABEL[emp.status]}
                        </span>
                      </TableCell>

                      <TableCell className="text-center">
                        <Select
                          value={emp.status}
                          onValueChange={(v) => onStatusChange(emp.id, v as Employee["status"])}
                        >
                          <SelectTrigger className="mx-auto h-8 w-[130px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">نشط</SelectItem>
                            <SelectItem value="away">بعيد</SelectItem>
                            <SelectItem value="off">خارج العمل</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-center">
                        {isConfirming ? (
                          <div className="inline-flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-destructive">تأكيد؟</span>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                onDelete(emp.id);
                                setConfirmId(null);
                              }}
                              className="h-7 text-xs"
                            >
                              نعم
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setConfirmId(null)} className="h-7 text-xs">
                              لا
                            </Button>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-[30px] w-[30px] text-primary hover:bg-secondary"
                              title="تعديل"
                              onClick={() => onEdit(emp)}
                            >
                              <Pencil size={13} />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-[30px] w-[30px] border-red-300 text-destructive hover:bg-red-50"
                              title="حذف"
                              onClick={() => setConfirmId(emp.id)}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Pagination footer */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-t bg-muted/20 px-5 py-3">
            <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
              <span>عدد الصفوف:</span>
              <div className="flex gap-1">
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => handlePageSize(n)}
                    className={cn(
                      "h-7 w-8 rounded-md border text-xs transition-colors",
                      pageSize === n
                        ? "border-primary bg-primary font-bold text-primary-foreground"
                        : "border-border bg-card text-foreground/70 hover:bg-muted",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <span className="text-muted-foreground/50">|</span>
              <span>
                {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, employees.length)} من{" "}
                {employees.length}
              </span>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className={cn(
                    "flex h-[30px] w-[30px] items-center justify-center rounded-lg border",
                    safePage === 1
                      ? "cursor-default bg-muted text-muted-foreground/50"
                      : "bg-card text-foreground/70 hover:bg-muted",
                  )}
                >
                  <ChevronRight size={15} />
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
                      <span key={`el-${i}`} className="px-1 text-sm text-muted-foreground/60">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={cn(
                          "flex h-[30px] w-[30px] items-center justify-center rounded-lg border text-sm",
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
                    "flex h-[30px] w-[30px] items-center justify-center rounded-lg border",
                    safePage === totalPages
                      ? "cursor-default bg-muted text-muted-foreground/50"
                      : "bg-card text-foreground/70 hover:bg-muted",
                  )}
                >
                  <ChevronLeft size={15} />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
