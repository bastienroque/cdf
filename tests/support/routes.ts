// Single source of truth for URLs. If a route changes, fix it here only.
export const ROUTES = {
  home: "/en",
  restaurants: "/en/restaurants",
  leaderboard: "/en/leaderboard",
  map: "/en/map",
  blog: "/en/blog",
  events: "/en/events",
  about: "/en/about",
  contact: "/en/contact",
  login: "/en/login",
  admin: {
    dashboard: "/en/admin/dashboard",
    restaurants: "/en/admin/restaurants",
    restaurantsNew: "/en/admin/restaurants/new",
    reviews: "/en/admin/reviews",
    reviewsNew: "/en/admin/reviews/new",
    blog: "/en/admin/blog",
    blogNew: "/en/admin/blog/new",
    events: "/en/admin/events",
  },
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.restaurants,
  ROUTES.leaderboard,
  ROUTES.map,
  ROUTES.blog,
  ROUTES.events,
  ROUTES.about,
  ROUTES.contact,
];

// Edit pages need an id. GUESSED pattern: /en/admin/<resource>/<id>/edit. Fix here if different.
export const PLACEHOLDER_ID = "e2e-nonexistent-id";
export const ADMIN_EDIT_ROUTES = [
  `/en/admin/restaurants/${PLACEHOLDER_ID}/edit`,
  `/en/admin/reviews/${PLACEHOLDER_ID}/edit`,
  `/en/admin/blog/${PLACEHOLDER_ID}/edit`,
  `/en/admin/events/${PLACEHOLDER_ID}/edit`,
];

export const ADMIN_ROUTES = [...Object.values(ROUTES.admin), ...ADMIN_EDIT_ROUTES];

// Matches links to a restaurant detail page from the public list.
export const RESTAURANT_DETAIL_HREF = /\/restaurant(e)?s\/[^/]+$/;
