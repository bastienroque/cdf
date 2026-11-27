import { createClient } from "@supabase/supabase-js";
import { safeLocale } from "@/lib/safe-redirect";
import type { Locale } from "@/i18n/config";

function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// Email address and preferred language (saved at sign-up) of an account.
export async function getUserContact(
  userId: string,
): Promise<{ email: string; locale: Locale } | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !data.user?.email) return null;
  return {
    email: data.user.email,
    locale: safeLocale(data.user.user_metadata?.locale as string | undefined),
  };
}
