import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

const locales = ["pt", "en", "fr"] as const;
type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;

  const locale =
    requested && locales.includes(requested as Locale)
      ? (requested as Locale)
      : null;

  if (!locale) {
    notFound();
  }

  // Load all modularized translation files in parallel
  const [
    common,
    auth,
    home,
    about,
    restaurants,
    restaurantDetails,
    reviews,
    leaderboard,
    map,
    blog,
    events,
    contact,
    legal,
    adminDashboard,
    adminUsers,
    adminReviews,
    adminRestaurants,
    adminCatalog,
    adminGlossary,
    adminEvents,
    adminBlog,
    adminContacts,
  ] = await Promise.all([
    import(`../../messages/${locale}/common.json`).then((m) => m.default),
    import(`../../messages/${locale}/auth.json`).then((m) => m.default),
    import(`../../messages/${locale}/public/home.json`).then((m) => m.default),
    import(`../../messages/${locale}/public/about.json`).then((m) => m.default),
    import(`../../messages/${locale}/public/restaurants.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/public/restaurant-details.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/public/reviews.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/public/leaderboard.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/public/map.json`).then((m) => m.default),
    import(`../../messages/${locale}/public/blog.json`).then((m) => m.default),
    import(`../../messages/${locale}/public/events.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/public/contact.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/public/legal.json`).then((m) => m.default),
    import(`../../messages/${locale}/admin/dashboard.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/admin/users.json`).then((m) => m.default),
    import(`../../messages/${locale}/admin/reviews.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/admin/restaurants.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/admin/catalog.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/admin/glossary.json`).then(
      (m) => m.default,
    ),
    import(`../../messages/${locale}/admin/events.json`).then((m) => m.default),
    import(`../../messages/${locale}/admin/blog.json`).then((m) => m.default),
    import(`../../messages/${locale}/admin/contacts.json`).then(
      (m) => m.default,
    ),
  ]);

  return {
    locale,
    messages: {
      common,
      auth,
      // Wrap public folder contents under the 'public' namespace object
      public: {
        home,
        about,
        restaurants,
        restaurantDetails,
        reviews,
        leaderboard,
        map,
        blog,
        events,
        contact,
        legal,
      },
      // Spread admin files so `admin.navTrigger`, `admin.links`, etc. resolve properly
      admin: {
        ...adminDashboard,
        users: adminUsers,
        reviews: adminReviews,
        restaurants: adminRestaurants,
        catalog: adminCatalog,
        glossary: adminGlossary,
        events: adminEvents,
        blog: adminBlog,
        contacts: adminContacts,
      },
    },
  };
});
