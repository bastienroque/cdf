import { Badge } from "@/components/ui/badge";
import { Languages, CheckCircle2, Clock } from "lucide-react";
import { UpdateTranslationForm } from "@/components/admin/update-translation-form";

interface CatalogItem {
  id: string;
  category: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
  translationStatus: "complete" | "pending";
  type: "ingredient" | "tag";
}

interface TranslationHubSectionProps {
  items: CatalogItem[];
  labels: {
    title: string;
    subtitle: string;
    empty: string;
    completeStatus: string;
    pendingStatus: string;
  };
}

export function TranslationHubSection({
  items,
  labels,
}: TranslationHubSectionProps) {
  return (
    <div className="space-y-4 pt-6 border-t border-border/65">
      <div>
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
          <Languages className="h-4 w-4 text-amber-500" /> {labels.title}
        </h2>
        <p className="text-xs text-muted-foreground font-body mt-0.5">
          {labels.subtitle}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {labels.empty}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-sm border border-border/60 bg-card p-4 sm:p-5 space-y-4 transition-all hover:border-amber-500/30"
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase bg-muted text-muted-foreground"
                  >
                    {item.type}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] uppercase text-amber-600 border-amber-500/30 bg-amber-500/5"
                  >
                    {item.category}
                  </Badge>
                </div>

                {item.translationStatus === "complete" ? (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-green-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                    {labels.completeStatus}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-mono text-xs text-yellow-600">
                    <Clock className="h-3.5 w-3.5" /> {labels.pendingStatus}
                  </span>
                )}
              </div>

              <UpdateTranslationForm item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
