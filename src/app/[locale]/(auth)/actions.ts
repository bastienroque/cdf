"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createClient } from "@/lib/supabase/server";
import { safeLocale, safeNextPath } from "@/lib/safe-redirect";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const next = safeNextPath(formData.get("next")?.toString());
  const locale = safeLocale(formData.get("locale")?.toString());

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      `/${locale}/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`,
    );
  }

  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}${next}`);
}

export async function signUp(formData: FormData) {
  const username = formData.get("username")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirmPassword")?.toString() ?? "";
  const locale = safeLocale(formData.get("locale")?.toString());

  if (password !== confirmPassword) {
    redirect(
      `/${locale}/register?error=${encodeURIComponent("Passwords do not match.")}`,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
    },
  });

  if (error) {
    redirect(`/${locale}/register?error=${encodeURIComponent(error.message)}`);
  }

  // A database trigger on auth.users creates the profile row. This insert is a
  // fallback for databases where the trigger isn't installed yet; it does
  // nothing when the row already exists.
  if (data.user) {
    try {
      await db
        .insert(users)
        .values({ id: data.user.id, display_name: username, role: "user" })
        .onConflictDoNothing();
    } catch (dbError) {
      console.error("Failed to insert into public.users:", dbError);
    }
  }

  redirect(`/${locale}/register?registered=true`);
}

export async function signOut(formData: FormData) {
  const locale = safeLocale(formData.get("locale")?.toString());
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}`);
}
