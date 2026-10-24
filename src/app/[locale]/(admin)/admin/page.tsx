import { db } from "@/db";
import { reviews } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";
import { Link } from "@/i18n/navigation";

async function getDashboardStats() {
  const [[{ pendingReviews }]] = await Promise.all([
    db
      .select({ pendingReviews: count() })
      .from(reviews)
      .where(and(eq(reviews.status, "pending"), eq(reviews.isOfficial, false))),
  ]);
  return { pendingReviews };
}

export default async function AdminDashboardPage() {
  const { pendingReviews } = await getDashboardStats();

  return (
    <div className="p-6">
      <h1 className="mb-6 font-display text-h1 font-semibold tracking-tight text-foreground">
        Admin dashboard
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/reviews"
          className="focus-ring rounded-lg bg-card p-6 ring-1 ring-foreground/10 hover:ring-foreground/20"
        >
          <p className="font-body text-ui text-muted-foreground">
            Pending reviews
          </p>
          <p className="mt-1 font-display text-h1 font-semibold text-foreground">
            {pendingReviews}
          </p>
        </Link>
      </div>
    </div>
  );
}
