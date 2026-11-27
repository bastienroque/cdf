export type UserRole = "user" | "admin" | "super_admin";

// Super admins can do everything admins can, plus manage users.
export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdminRole(role: string | null | undefined): boolean {
  return role === "super_admin";
}
