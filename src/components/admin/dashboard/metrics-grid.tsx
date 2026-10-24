import { LucideIcon } from "lucide-react";

interface StatItem {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
}

export function MetricsGrid({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="flex flex-col justify-between rounded-sm border border-border/60 bg-card p-4 transition-all hover:border-amber-500/40"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {stat.title}
                </span>
                <Icon className="h-4 w-4 text-amber-500/70" />
              </div>
              <div className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                {stat.value}
              </div>
            </div>
            <div className="mt-4 border-t border-border/40 pt-3 font-mono text-[10px] text-muted-foreground">
              {stat.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
