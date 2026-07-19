import { Settings as SettingsIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";

export function SettingsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2.5 space-y-0 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <SettingsIcon className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-sm">إعدادات المنصة</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">الإعدادات العامة للمنصة</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <EmptyState
          icon={SettingsIcon}
          title="الإعدادات قيد التطوير"
          description="ستتوفر هذه الصفحة قريباً"
        />
      </CardContent>
    </Card>
  );
}
