export interface NavLink {
  href: string;
  labelKey: string;
}

export interface NavGroup {
  labelKey: string;
  links: NavLink[];
}

export const navGroups: NavGroup[] = [
  {
    labelKey: "discover",
    links: [
      { href: "/restaurants", labelKey: "restaurants" },
      { href: "/leaderboard", labelKey: "leaderboard" },
      { href: "/map", labelKey: "map" },
    ],
  },
  {
    labelKey: "community",
    links: [
      { href: "/blog", labelKey: "blog" },
      { href: "/events", labelKey: "events" },
    ],
  },
  {
    labelKey: "about",
    links: [
      { href: "/about", labelKey: "about" },
      { href: "/contact", labelKey: "contact" },
    ],
  },
];

// Flatten all links across groups into a single array
export const flatNavLinks: NavLink[] = navGroups.flatMap(
  (group) => group.links,
);
