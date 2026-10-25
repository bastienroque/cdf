import {
  pgTable,
  pgSchema,
  pgEnum,
  uuid,
  text,
  timestamp,
  numeric,
  smallint,
  integer,
  boolean,
  date,
  check,
  unique,
  jsonb,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// --- Auth Schema Reference ---
const authSchema = pgSchema("auth");
const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

// --- User Profile & RBAC ---
export const userRoleEnum = pgEnum("user_role", ["admin", "user"]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  role: userRoleEnum("role").notNull().default("user"),
  display_name: text("display_name").notNull(),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

// --- Restaurants ---
export const restaurantStatusEnum = pgEnum("restaurant_status", [
  "draft",
  "published",
]);

export const restaurants = pgTable(
  "restaurants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    address: text("address").notNull(),
    city: text("city").notNull(),
    lat: numeric("lat").notNull(),
    lng: numeric("lng").notNull(),
    phone: text("phone"),
    website: text("website"),
    priceRange: smallint("price_range").notNull(),
    photos: text("photos").array(),
    status: restaurantStatusEnum("restaurant_status")
      .notNull()
      .default("draft"),
    avgScore: numeric("avg_score"),
    reviewCount: integer("review_count").notNull().default(0),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    check(
      "avg_score_range",
      sql`${table.avgScore} >= 0 AND ${table.avgScore} <= 10`,
    ),
  ],
);

// --- Translation Status Enum ---
export const translationStatusEnum = pgEnum("translation_status", [
  "pending",
  "complete",
]);

// --- Dynamic Ingredients Catalog ---
export const ingredients = pgTable("ingredients", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  slug: text("slug").notNull().unique(),
  namePt: text("name_pt").notNull(),
  nameEn: text("name_en"),
  nameFr: text("name_fr"),
  createdLanguage: text("created_language").notNull().default("pt"),
  translationStatus: translationStatusEnum("translation_status")
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Dynamic Attribute Tags Catalog ---
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(),
  slug: text("slug").notNull().unique(),
  namePt: text("name_pt").notNull(),
  nameEn: text("name_en"),
  nameFr: text("name_fr"),
  createdLanguage: text("created_language").notNull().default("pt"),
  translationStatus: translationStatusEnum("translation_status")
    .notNull()
    .default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- Reviews ---
export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "published",
  "rejected",
]);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    restaurantFk: uuid("restaurant_fk")
      .notNull()
      .references(() => restaurants.id, { onDelete: "restrict" }),
    authorFk: uuid("author_fk")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    isOfficial: boolean("is_official").notNull().default(false),
    status: reviewStatusEnum("status").notNull().default("pending"),
    visitDate: date("visit_date").notNull(),
    pricePaid: numeric("price_paid"),
    francesinhaType: text("francesinha_type").notNull(),
    text: text("text").notNull(),
    photos: text("photos").array(),

    // --- JSONB Structured Evaluations ---
    ingredientEvaluations: jsonb("ingredient_evaluations")
      .$type<
        {
          ingredientId: string;
          score: number;
          tagIds: string[];
        }[]
      >()
      .default([]),

    experienceScores: jsonb("experience_scores")
      .$type<
        {
          key: string;
          score: number;
        }[]
      >()
      .default([]),

    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    check("visit_date_check", sql`${table.visitDate} <= CURRENT_DATE`),
  ],
);

// --- Editorial Content ---
export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  authorFk: uuid("author_fk")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  coverImage: text("cover_image"),
  tags: text("tags").array(),
  publishedAt: timestamp("published_at"),
  locale: text("locale").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  location: text("location").notNull(),
  restaurantFk: uuid("restaurant_fk").references(() => restaurants.id, {
    onDelete: "set null",
  }),
  locale: text("locale").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// --- API Logging ---
export const apiUsageLog = pgTable("api_usage_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  service: text("service").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
