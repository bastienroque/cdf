import { Link } from "@/i18n/navigation";
import { MessageSquare, Utensils, Check, X } from "lucide-react";
import {
  approveReview,
  rejectReview,
} from "@/app/[locale]/(admin)/admin/reviews/actions";

interface PendingReview {
  id: string;
  text: string | null;
  visitDate: string | null;
  restaurantName: string | null;
  authorName: string | null;
}

interface PendingReviewsSectionProps {
  reviews: PendingReview[];
  labels: {
    title: string;
    viewAll: string;
    empty: string;
    approve: string;
    reject: string;
  };
}

export function PendingReviewsSection({
  reviews,
  labels,
}: PendingReviewsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-amber-500" />
          {labels.title} ({reviews.length})
        </h2>
        <Link
          href="/admin/reviews"
          className="font-mono text-xs text-amber-600 hover:underline uppercase tracking-wider"
        >
          {labels.viewAll} &rarr;
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {labels.empty}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-sm border border-border/60 bg-card p-4 transition-all hover:border-foreground/20"
            >
              <div className="space-y-1">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-mono text-xs font-semibold text-amber-500 flex items-center gap-1 text-nowrap">
                    <Utensils className="h-3 w-3" />{" "}
                    {r.restaurantName ?? "Restaurant"}
                  </span>
                  <span className="text-muted-foreground text-xs">•</span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.authorName ?? "User"}
                  </span>
                </div>
                <p className="text-sm font-body italic text-foreground/90 line-clamp-1">
                  “{r.text}”
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <form action={approveReview.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-sm border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 font-mono text-xs font-semibold uppercase text-amber-600 hover:bg-amber-500/20 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> {labels.approve}
                  </button>
                </form>
                <form action={rejectReview.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 rounded-sm border border-red-500/40 bg-red-500/10 px-2.5 py-1 font-mono text-xs font-semibold uppercase text-red-500 hover:bg-red-500/20 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" /> {labels.reject}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
