import { useState } from "react";
import { StatusBadge } from "../../helpers";
import type { CampaignRequest } from "../../types";
import { pagSlice } from "./constants";
import { Pager } from "./shared";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function RequestsTab({ requests }: { requests: CampaignRequest[] }) {
  const [page, setPage] = useState(1);
  const pageData = pagSlice(requests, page);

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            {["المؤثر", "النوع", "الميزانية", "المدة", "التاريخ", "الرسالة", "الحالة"].map((h) => (
              <TableHead key={h}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageData.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="font-semibold">{req.infName}</TableCell>
              <TableCell>{req.type}</TableCell>
              <TableCell>{req.budget.toLocaleString()} ر.س</TableCell>
              <TableCell>{req.duration}</TableCell>
              <TableCell>{req.date}</TableCell>
              <TableCell>
                <div className="max-w-[180px] truncate text-xs text-muted-foreground" title={req.message}>
                  {req.message || "—"}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={req.status} />
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                <div className="mb-2 text-3xl">📋</div>
                لا توجد طلبات حملات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <Pager page={page} total={requests.length} onChange={setPage} />
    </Card>
  );
}
