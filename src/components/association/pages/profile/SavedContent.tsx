import { PenLine, ArrowLeft } from "lucide-react";
import {
  CONTENT_TABS,
  type ContentTab,
  type GeneratedContent,
} from "./constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SavedContentProps {
  latestContent: GeneratedContent | null;
  contentTab: ContentTab;
  setContentTab: (tab: ContentTab) => void;
  onNavigate: (page: string) => void;
}

/**
 * Preview of the most recent AI-generated content session, with the four
 * content-type tabs (post / story / donation / video). Followed by a link
 * card routing to the full content page.
 */
export default function SavedContent({
  latestContent,
  contentTab,
  setContentTab,
  onNavigate,
}: SavedContentProps) {
  if (!latestContent) return null;

  const item = latestContent[contentTab];

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
              <PenLine className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm">المحتوى التسويقي المُولَّد</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">آخر جلسة توليد بالذكاء الاصطناعي</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => onNavigate("content")}>
            عرض الكل
            <ArrowLeft className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Tab bar */}
          <div className="mb-3.5 flex gap-1 rounded-lg border bg-secondary/40 p-1">
            {CONTENT_TABS.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setContentTab(key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1 rounded-md py-1.5 text-xs font-medium transition-colors",
                  contentTab === key
                    ? "bg-card font-bold text-primary shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {item?.text ? (
            <>
              <div className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-muted/40 px-3.5 py-3 text-sm leading-7 text-foreground/80">
                {item.text}
              </div>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt="صورة مُولَّدة"
                  className="mt-2.5 max-h-[220px] w-full rounded-lg object-cover"
                />
              )}
            </>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              لم يُولَّد هذا النوع بعد
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link to content page */}
      <button
        onClick={() => onNavigate("content")}
        className="flex w-full items-center justify-between rounded-2xl border-2 border-primary/15 bg-gradient-to-br from-secondary to-secondary/60 px-4 py-4 transition-all hover:border-primary/30"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-card text-lg shadow-sm">
            ✍️
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-foreground">المحتوى التسويقي</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              اعرض وأدر المحتوى المُولَّد بالذكاء الاصطناعي
            </div>
          </div>
        </div>
        <ArrowLeft className="h-4 w-4 text-primary/70" />
      </button>
    </>
  );
}
