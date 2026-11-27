export interface AdminLink {
  href: string;
  labelKey: string;
  superAdminOnly?: boolean;
}

export const adminLinks: AdminLink[] = [
  { href: "/admin/dashboard", labelKey: "dashboard" },
  { href: "/admin/restaurants", labelKey: "restaurants" },
  { href: "/admin/reviews", labelKey: "reviews" },
  { href: "/admin/blog", labelKey: "blog" },
  { href: "/admin/events", labelKey: "events" },
  { href: "/admin/users", labelKey: "users", superAdminOnly: true },
];
