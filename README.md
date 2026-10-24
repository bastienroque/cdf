# Cavaleiros da Francesinha

A full-stack web platform dedicated to discovering, reviewing, and rating Francesinha restaurants across Portugal. Built with performance, internationalization, and geospatial mapping in mind.

## Features

- **Public Directory & Filterable Search:** Browse published restaurants by city, price range, and score, with localized routing (PT, EN, FR).
- **Interactive Map Layer:** Leaflet-powered cluster mapping to discover nearby Francesinhas directly from a geospatial view, with Google Maps API integration for place lookup, geocoding, and directions.
- **Honor Roll Leaderboard:** Dynamic leaderboard ranking top-scoring establishments using weighted community and official expert reviews.
- **Blog:** Create, edit, and publish localized blog posts about Francesinha culture, restaurant spotlights, and community news.
- **Events:** Create and manage Francesinha events, such as tastings, meetups, and restaurant crawls, with dates, locations, and details.
- **Transactional Emails:** Email delivery powered by Resend for notifications such as review moderation updates and event announcements.
- **Secure Admin Dashboard:** Role-Based Access Control (RBAC) protecting a central dashboard for:
  - Data review (restaurants, review and users count and API usage)
  - Restaurant management
  - Review creation and moderation queues
  - Blog post creation and editing
  - Event creation and management
  - Translation hubs
- **Automated E2E Testing:** Robust test coverage with Playwright across desktop and mobile viewports.

## Tech Stack

- **Framework:** Next.js (App Router, Server Actions) with React 19 & TypeScript
- **Styling:** Tailwind CSS & Lucide React icons
- **Database & ORM:** PostgreSQL (hosted on Supabase) managed via Drizzle ORM
- **Internationalization:** `next-intl`
- **Maps:** Leaflet & React Leaflet, Google Maps API
- **Email:** Resend
- **Testing:** Playwright
