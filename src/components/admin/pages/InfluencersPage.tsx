import { Search, Plus } from "lucide-react";
import { StatusBadge, PlatBadge, fmt, infColor } from "../helpers";
import type { Influencer } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InfluencersPageProps {
  filteredInfs: Influencer[];
  infSearch: string;
  setInfSearch: (val: string) => void;
  infPlatFilter: string;
  setInfPlatFilter: (val: string) => void;
  setInfModal: (data: { open: boolean; data: Partial<Influencer> | null }) => void;
  deleteInf: (id: number) => Promise<void>;
}

export function InfluencersPage({
  filteredInfs,
  infSearch,
  setInfSearch,
  infPlatFilter,
  setInfPlatFilter,
  setInfModal,
  deleteInf,
}: InfluencersPageProps) {
  return (
    <div>
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <div className="relative w-60">
          <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pr-9"
            placeholder="ابحث عن مؤثر..."
            value={infSearch}
            onChange={(e) => setInfSearch(e.target.value)}
          />
        </div>
        <Select value={infPlatFilter} onValueChange={setInfPlatFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المنصات</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="X">X</SelectItem>
            <SelectItem value="TikTok">TikTok</SelectItem>
            <SelectItem value="YouTube">YouTube</SelectItem>
            <SelectItem value="Snapchat">Snapchat</SelectItem>
          </SelectContent>
        </Select>
        <Button className="mr-auto gap-1.5" onClick={() => setInfModal({ open: true, data: {} })}>
          <Plus className="h-3.5 w-3.5" />
          إضافة مؤثر
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredInfs.map((inf) => (
          <Card key={inf.id} className="transition-all hover:border-primary/40 hover:shadow-md">
            <CardContent className="p-4">
              <div className="mb-2.5 flex items-center gap-2.5">
                <Avatar className="h-[42px] w-[42px] shrink-0">
                  <AvatarFallback style={{ background: infColor(inf.id) }} className="text-sm font-bold text-white">
                    {inf.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-foreground">{inf.name}</div>
                  <div className="mt-0.5 truncate text-xs text-muted-foreground">{inf.niche}</div>
                </div>
                <StatusBadge status={inf.status} />
              </div>
              <div className="mb-2 flex items-center gap-1.5">
                <PlatBadge platform={inf.platform} />
                <span className="text-xs text-muted-foreground">{inf.price.toLocaleString()} ر.س/حملة</span>
              </div>
              <div className="my-2.5 grid grid-cols-3 gap-1.5">
                {[
                  { num: fmt(inf.followers), lbl: "متابع" },
                  { num: `${inf.engagement}%`, lbl: "تفاعل" },
                  { num: inf.price.toLocaleString(), lbl: "ر.س" },
                ].map((s) => (
                  <div key={s.lbl} className="rounded-md bg-secondary/40 px-1 py-1.5 text-center">
                    <div className="text-sm font-bold text-foreground">{s.num}</div>
                    <div className="mt-0.5 text-[0.62rem] text-muted-foreground">{s.lbl}</div>
                  </div>
                ))}
              </div>
              {inf.notes && (
                <div className="mb-2.5 rounded-md bg-secondary/40 px-2.5 py-1.5 text-xs text-muted-foreground">
                  {inf.notes}
                </div>
              )}
              <div className="flex gap-1.5">
                <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setInfModal({ open: true, data: inf })}>
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-xs text-destructive hover:bg-red-50"
                  onClick={() => deleteInf(inf.id)}
                >
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredInfs.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground">لا توجد نتائج</div>
        )}
      </div>
    </div>
  );
}
