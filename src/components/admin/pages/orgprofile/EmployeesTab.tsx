import { useState } from "react";
import { useMutation, useQueryClient, type UseQueryResult } from "@tanstack/react-query";
import { toast } from "sonner";
import { employeesDb } from "@/lib/db";
import { keys } from "@/api/keys";
import { QueryState } from "@/components/common/StateViews";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Employee } from "@/components/association/types";
import { empStatusLabel, PAGE_SIZE, pagSlice } from "./constants";
import { BulkBar, Pager } from "./shared";

export function EmployeesTab({
  orgId,
  employeesQuery,
}: {
  orgId: string;
  employeesQuery: UseQueryResult<Employee[]>;
}) {
  const [page, setPage] = useState(1);
  const [sel, setSel] = useState<Set<number>>(new Set());
  const qc = useQueryClient();

  const deleteMu = useMutation({
    mutationFn: async (ids: number[]) => {
      for (const id of ids) await employeesDb.delete(id);
      return ids;
    },
    onSuccess: (ids) => {
      qc.invalidateQueries({ queryKey: keys.employees(orgId) });
      setSel(new Set());
      toast.success(`تم حذف ${ids.length} موظف`);
    },
    onError: () => toast.error("تعذّر حذف الموظفين"),
  });

  function toggleEmployee(id: number) {
    setSel((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <QueryState
      query={employeesQuery}
      isEmpty={(d) => d.length === 0}
      emptyTitle="لا يوجد موظفون مسجلون"
      emptyIcon="👥"
    >
      {(employees) => {
        const pageData = pagSlice(employees, page);
        const allPageSel = pageData.length > 0 && pageData.every((e) => sel.has(e.id));
        return (
          <div>
            <BulkBar
              count={sel.size}
              label="موظف"
              onDelete={() => deleteMu.mutate([...sel])}
              onClear={() => setSel(new Set())}
            />
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={allPageSel}
                        onCheckedChange={() => {
                          setSel((prev) => {
                            const next = new Set(prev);
                            pageData.forEach((e) => (allPageSel ? next.delete(e.id) : next.add(e.id)));
                            return next;
                          });
                        }}
                      />
                    </TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageData.map((emp) => {
                    const st = empStatusLabel(emp.status);
                    return (
                      <TableRow key={emp.id} className={cn(sel.has(emp.id) && "bg-secondary/40")}>
                        <TableCell className="text-center">
                          <Checkbox checked={sel.has(emp.id)} onCheckedChange={() => toggleEmployee(emp.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-[30px] w-[30px]">
                              <AvatarFallback style={{ background: emp.color || "#2d7a52" }} className="text-xs font-bold text-white">
                                {emp.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-foreground">{emp.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{emp.role}</TableCell>
                        <TableCell>
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ background: st.bg, color: st.color }}
                          >
                            {st.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <Pager page={page} total={employees.length} onChange={setPage} />
            </Card>
            {employees.length > PAGE_SIZE && (
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => setSel(new Set(employees.map((e) => e.id)))}>
                  تحديد الكل ({employees.length})
                </Button>
                {sel.size > 0 && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={() => setSel(new Set())}>
                    إلغاء تحديد الكل
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      }}
    </QueryState>
  );
}
