import { Link } from "@/i18n/navigation";
import { EntityCard } from "@/components/ui/entity-card";
import { Badge } from "@/components/ui/badge";

interface TopRestaurantsProps {
  restaurants: any[];
  labels: {
    tag: string;
    title: string;
    leaderboardLink: string;
    empty: string;
  };
  priceLabels: string[];
}

export function TopRestaurants({
  restaurants,
  labels,
  priceLabels,
}: TopRestaurantsProps) {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-2 border-b border-border/40 pb-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {labels.tag}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {labels.title}
            </h2>
          </div>
          <Link
            href="/leaderboard"
            className="font-body text-sm font-medium text-action hover:underline flex items-center gap-1"
          >
            {labels.leaderboardLink}
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <p className="font-body text-muted-foreground">{labels.empty}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r) => (
              <EntityCard
                key={r.id}
                href={`/restaurants/${r.slug}`}
                image={r.photos?.[0]}
                title={r.name}
                meta={`${r.city} · ${priceLabels[r.priceRange - 1]}`}
                badge={
                  r.avgScore && (
                    <Badge className="bg-amber-500/20 text-amber-600 border border-amber-500/30 rounded-sm font-mono font-bold">
                      {r.avgScore} / 10
                    </Badge>
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
