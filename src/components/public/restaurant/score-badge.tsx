import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score: string | number | null | undefined;
  noReviewsLabel: string;
}

export function ScoreBadge({ score, noReviewsLabel }: ScoreBadgeProps) {
  if (score == null || score === "") {
    return (
      <Badge className="rounded-sm border border-border bg-muted font-mono text-xs uppercase text-muted-foreground">
        {noReviewsLabel}
      </Badge>
    );
  }

  return (
    <Badge className="rounded-sm border border-amber-500/30 bg-amber-500/20 font-mono font-bold text-amber-600">
      {score} / 10
    </Badge>
  );
}
