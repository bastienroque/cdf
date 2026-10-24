"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const next = (formData.get("next") as string) || "/";
  const locale = (formData.get("locale") as string) || "en";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/${locale}/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
    );
  }

  // Target the exact localized layout cache
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}${next}`);
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const locale = (formData.get("locale") as string) || "en";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/${locale}/register?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}`);
}

export async function signOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || "en";
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}`);
}
