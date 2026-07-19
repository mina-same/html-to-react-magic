import { Search, Plus, FolderOpen } from "lucide-react";
import { StatusBadge } from "../helpers";
import type { Org } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrgsPageProps {
  filteredOrgs: Org[];
  orgSearch: string;
  setOrgSearch: (val: string) => void;
  orgStatusFilter: string;
  setOrgStatusFilter: (val: string) => void;
  setOrgModal: (data: { open: boolean; data: Partial<Org> | null }) => void;
  suspendOrg: (id: string) => Promise<void>;
  openOrgProfile: (org: Org) => void;
}

const HEADERS = ["الجمعية", "الترخيص", "المنطقة", "التواصل", "الحالة", "تاريخ التسجيل", "إجراءات"];

export function OrgsPage({
  filteredOrgs,
  orgSearch,
  setOrgSearch,
  orgStatusFilter,
  setOrgStatusFilter,
  setOrgModal,
  suspendOrg,
  openOrgProfile,
}: OrgsPageProps) {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="relative w-60">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pr-9"
            placeholder="ابحث عن جمعية..."
            value={orgSearch}
            onChange={(e) => setOrgSearch(e.target.value)}
          />
        </div>
        <Select value={orgStatusFilter} onValueChange={setOrgStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="pending">قيد المراجعة</SelectItem>
            <SelectItem value="suspended">موقوف</SelectItem>
          </SelectContent>
        </Select>
        <Button className="mr-auto gap-1.5" onClick={() => setOrgModal({ open: true, data: {} })}>
          <Plus className="h-3.5 w-3.5" />
          إضافة جمعية
        </Button>
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
            {filteredOrgs.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="font-bold text-foreground">{o.name}</div>
                  {o.notes && <div className="mt-0.5 text-xs text-muted-foreground">{o.notes}</div>}
                </TableCell>
                <TableCell>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">{o.license}</span>
                </TableCell>
                <TableCell>{o.region}</TableCell>
                <TableCell>
                  <div className="text-xs">{o.email}</div>
                  <div className="text-xs text-muted-foreground">{o.phone}</div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={o.status} />
                </TableCell>
                <TableCell>{o.date}</TableCell>
                <TableCell>
                  <div className="flex gap-1.5">
                    <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => openOrgProfile(o)}>
                      <FolderOpen className="h-3 w-3" />
                      فتح الملف
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOrgModal({ open: true, data: o })}>
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 border-red-300 text-xs text-destructive hover:bg-red-50"
                      onClick={() => suspendOrg(o.id)}
                    >
                      توقيف
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrgs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
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
