import { db } from "@/db";
import { apiUsageLog } from "@/db/schema";
import { count } from "drizzle-orm";
import { getTranslations } from "next-intl/server";

export async function ApiUsageSection() {
  const t = await getTranslations("admin.dashboard");

  const usageStats = await db
    .select({
      service: apiUsageLog.service,
      totalCalls: count(),
    })
    .from(apiUsageLog)
    .groupBy(apiUsageLog.service);

  return (
    <div className="rounded-sm border border-border bg-card p-6 space-y-6">
      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-amber-500 font-bold">
          {t("labels.apiTelemetryTitle")}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {t("labels.apiTelemetryDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {usageStats.map((stat) => (
          <div
            key={stat.service}
            className="rounded-md border border-border/60 bg-background/50 p-4 space-y-1"
          >
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {stat.service.replace("_", " ")}
            </div>
            <div className="text-2xl font-bold font-display text-foreground">
              {stat.totalCalls}
            </div>
          </div>
        ))}
        {usageStats.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground py-4 text-center">
            {t("labels.noApiUsage")}
          </div>
        )}
      </div>
    </div>
  );
}
