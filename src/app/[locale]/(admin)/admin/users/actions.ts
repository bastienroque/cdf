"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const ASSIGNABLE_ROLES = ["user", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

// The super admin can't change or suspend themselves or another super admin,
// so the owner can never be locked out from this page.
async function assertManageable(actorId: string, targetId: string) {
  if (actorId === targetId) throw new Error("You can't change your own account.");
  const [target] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, targetId))
    .limit(1);
  if (!target) throw new Error("User not found.");
  if (target.role === "super_admin") throw new Error("Super admins can't be changed here.");
}

// Used as `setUserRole.bind(null, id)` in a form with a "role" field.
export async function setUserRole(userId: string, formData: FormData) {
  const actorId = await requireSuperAdmin();
  const role = formData.get("role")?.toString() as AssignableRole | undefined;
  if (!role || !ASSIGNABLE_ROLES.includes(role)) throw new Error("Invalid role.");

  await assertManageable(actorId, userId);
  await db.update(users).set({ role }).where(eq(users.id, userId));
  revalidatePath("/[locale]/admin/users", "page");
}

// Suspending bans the account in Supabase Auth: it can't sign in or refresh
// its session until reactivated.
export async function suspendUser(userId: string) {
  const actorId = await requireSuperAdmin();
  await assertManageable(actorId, userId);

  const { error } = await createAdminClient().auth.admin.updateUserById(userId, {
    ban_duration: "876000h", // about 100 years
  });
  if (error) throw error;
  revalidatePath("/[locale]/admin/users", "page");
}

export async function reactivateUser(userId: string) {
  const actorId = await requireSuperAdmin();
  await assertManageable(actorId, userId);

  const { error } = await createAdminClient().auth.admin.updateUserById(userId, {
    ban_duration: "none",
  });
  if (error) throw error;
  revalidatePath("/[locale]/admin/users", "page");
}
