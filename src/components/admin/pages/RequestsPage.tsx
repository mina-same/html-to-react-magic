import { toast } from "sonner";
import { StatusBadge } from "../helpers";
import type { CampaignRequest } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RequestsPageProps {
  filteredReqs: CampaignRequest[];
  reqStatusFilter: string;
  setReqStatusFilter: (val: string) => void;
  setReqModal: (data: { open: boolean; data: Partial<CampaignRequest> | null }) => void;
  saveReq: (req: CampaignRequest) => Promise<void>;
  rejectReq: (id: number) => Promise<void>;
}

const HEADERS = ["#", "الجمعية", "المؤثر", "النوع", "الميزانية", "المدة", "التاريخ", "الحالة", "إجراءات"];

export function RequestsPage({
  filteredReqs,
  reqStatusFilter,
  setReqStatusFilter,
  setReqModal,
  saveReq,
  rejectReq,
}: RequestsPageProps) {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Select value={reqStatusFilter} onValueChange={setReqStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
            <SelectItem value="approved">مقبول</SelectItem>
            <SelectItem value="completed">مكتمل</SelectItem>
            <SelectItem value="rejected">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {HEADERS.map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReqs.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="text-muted-foreground">#{r.id}</TableCell>
                <TableCell>{r.orgName}</TableCell>
                <TableCell>{r.infName}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.budget.toLocaleString()} ر.س</TableCell>
                <TableCell>{r.duration}</TableCell>
                <TableCell>{r.date}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setReqModal({ open: true, data: r })}>
                      عرض
                    </Button>
                    {r.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            saveReq({ ...r, status: "approved" });
                            toast.success("✅ تم قبول الطلب");
                          }}
                        >
                          قبول
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 border-red-300 text-xs text-destructive hover:bg-red-50"
                          onClick={() => rejectReq(r.id)}
                        >
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredReqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                  لا توجد نتائج
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
