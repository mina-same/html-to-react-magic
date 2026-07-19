import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/dashboard/EmptyState";

export function ReportsPage() {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2.5 space-y-0 border-b">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <BarChart3 className="h-4 w-4" />
        </div>
        <div>
          <CardTitle className="text-sm">التقارير</CardTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">التقارير قيد التطوير</p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <EmptyState
          icon={BarChart3}
          title="التقارير قيد التطوير"
          description="ستتوفر هذه الصفحة قريباً"
        />
      </CardContent>
    </Card>
  );
}
