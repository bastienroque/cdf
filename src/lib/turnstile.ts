import { logApiUsage } from "@/lib/log-api-usage";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Verifies a Cloudflare Turnstile token on the server.
// When TURNSTILE_SECRET_KEY is not configured, the check is skipped so the
// form keeps working until the keys are added in Vercel.
export async function verifyTurnstile(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("TURNSTILE_SECRET_KEY not set; skipping bot check.");
    return true;
  }
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);

    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success?: boolean };
    await logApiUsage("turnstile");
    return data.success === true;
  } catch (err) {
    console.error("Turnstile verification failed:", err);
    return false;
  }
}
