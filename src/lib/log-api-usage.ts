import { db } from "@/db";
import { apiUsageLog } from "@/db/schema";

export async function logApiUsage(
  service: "google_places" | "resend" | "turnstile",
) {
  try {
    await db.insert(apiUsageLog).values({ service });
  } catch (err) {
    console.error("Failed to log API usage:", err);
  }
}
