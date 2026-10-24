import { Badge } from "@/components/ui/badge";
import { Languages } from "lucide-react";

interface LocalizationSummaryCardProps {
  pendingCount: number;
  labels: {
    title: string;
    pendingLabel: string;
    description: string;
  };
}

export function LocalizationSummaryCard({
  pendingCount,
  labels,
}: LocalizationSummaryCardProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
          <Languages className="h-4 w-4 text-amber-500" /> {labels.title}
        </h2>
      </div>

      <div className="rounded-sm border border-border/60 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground uppercase">
            {labels.pendingLabel}
          </span>
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 font-mono text-xs uppercase text-amber-600 px-2.5 py-0.5"
          >
            {pendingCount}
          </Badge>
        </div>
        <p className="font-body text-xs text-muted-foreground">
          {labels.description}
        </p>
      </div>
    </div>
  );
}
