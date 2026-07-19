import { useState } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { StatusBadge } from "../../helpers";
import { QueryState } from "@/components/common/StateViews";
import type { Donation } from "@/components/association/types";
import { pagSlice } from "./constants";
import { Pager } from "./shared";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DonationsTab({ donationsQuery }: { donationsQuery: UseQueryResult<Donation[]> }) {
  const [page, setPage] = useState(1);

  return (
    <QueryState
      query={donationsQuery}
      isEmpty={(d) => d.length === 0}
      emptyTitle="لا توجد تبرعات مسجلة"
      emptyIcon="💰"
    >
      {(donations) => {
        const pageData = pagSlice(donations, page);
        return (
          <Card className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  {["رقم التبرع", "المتبرع", "المشروع", "المبلغ", "طريقة الدفع", "التاريخ", "الحالة"].map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((don) => (
                  <TableRow key={don.id}>
                    <TableCell>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                        {don.donationNumber || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{don.name}</TableCell>
                    <TableCell>{don.projectName || "—"}</TableCell>
                    <TableCell className="font-bold text-primary" dir="ltr">
                      {don.amount.toLocaleString()} ر.س
                    </TableCell>
                    <TableCell>{don.paymentMethod}</TableCell>
                    <TableCell>{don.date}</TableCell>
                    <TableCell>
                      <StatusBadge status={don.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {donations.length > 0 && (
              <div className="flex gap-6 border-t bg-secondary/40 px-4 py-2.5">
                <div className="text-xs text-muted-foreground">
                  إجمالي التبرعات:{" "}
                  <strong className="text-primary">
                    {donations.reduce((s, d) => s + d.amount, 0).toLocaleString()} ر.س
                  </strong>
                </div>
                <div className="text-xs text-muted-foreground">
                  مكتملة:{" "}
                  <strong className="text-emerald-700">
                    {donations.filter((d) => d.status === "completed").length}
                  </strong>
                </div>
                <div className="text-xs text-muted-foreground">
                  معلّقة:{" "}
                  <strong className="text-amber-700">
                    {donations.filter((d) => d.status === "pending").length}
                  </strong>
                </div>
              </div>
            )}
            <Pager page={page} total={donations.length} onChange={setPage} />
          </Card>
        );
      }}
    </QueryState>
  );
}
