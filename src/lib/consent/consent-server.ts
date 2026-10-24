import { cookies } from "next/headers";
import { CONSENT_COOKIE_NAME, type ConsentState } from "@/lib/consent/consent";

export async function getServerConsent(): Promise<ConsentState> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CONSENT_COOKIE_NAME)?.value;
  if (value === "accepted" || value === "rejected") return value;
  return "undetermined";
}
