"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
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

  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}${next}`);
}

export async function signUp(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const locale = (formData.get("locale") as string) || "en";

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

  // Save the user profile into your public.users table using Drizzle
  if (data.user) {
    try {
      await db.insert(users).values({
        id: data.user.id,
        display_name: username,
        role: "user", // defaults to regular user awaiting review
      });
    } catch (dbError) {
      console.error("Failed to insert into public.users:", dbError);
    }
  }

  redirect(`/${locale}/register?registered=true`);
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;
  const locale = (formData.get("locale") as string) || "en";
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/${locale}/reset-password`,
  });

  if (error) {
    redirect(
      `/${locale}/forgot-password?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/${locale}/forgot-password?success=true`);
}

export async function signOut(formData: FormData) {
  const locale = (formData.get("locale") as string) || "en";
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath(`/${locale}`, "layout");
  redirect(`/${locale}`);
}
