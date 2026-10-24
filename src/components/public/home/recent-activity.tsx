import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

interface RecentActivityProps {
  reviews: any[];
  labels: {
    tag: string;
    title: string;
    empty: string;
  };
  badges: {
    official: string;
    community: string;
  };
}

export function RecentActivity({
  reviews,
  labels,
  badges,
}: RecentActivityProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 border-b border-border/40 pb-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {labels.tag}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {labels.title}
          </h2>
        </div>

        {reviews.length === 0 ? (
          <p className="font-body text-muted-foreground">{labels.empty}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <Link
                  href={`/restaurants/${review.restaurantSlug}`}
                  className="focus-ring flex items-start justify-between gap-4 rounded-sm border border-border/60 bg-card p-5 hover:border-foreground/30 transition-all"
                >
                  <div>
                    <p className="font-display font-semibold text-foreground text-base">
                      {review.restaurantName}
                    </p>
                    <p className="mt-1 line-clamp-2 font-body text-sm text-muted-foreground">
                      &ldquo;{review.text}&rdquo;
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      review.isOfficial
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-600 rounded-sm font-mono text-[10px] tracking-wider uppercase"
                        : "border-border bg-muted/50 text-muted-foreground rounded-sm font-mono text-[10px] tracking-wider uppercase"
                    }
                  >
                    {review.isOfficial ? badges.official : badges.community}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
