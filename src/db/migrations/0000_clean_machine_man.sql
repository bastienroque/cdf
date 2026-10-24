-- Drop existing tables if re-running from scratch
DROP TABLE IF EXISTS "reviews" CASCADE;
DROP TABLE IF EXISTS "restaurants" CASCADE;
DROP TABLE IF EXISTS "ingredients" CASCADE;
DROP TABLE IF EXISTS "tags" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "blog_posts" CASCADE;
DROP TABLE IF EXISTS "events" CASCADE;
DROP TABLE IF EXISTS "page_content" CASCADE;
DROP TABLE IF EXISTS "api_usage_log" CASCADE;

-- Create Enums
CREATE TYPE "public"."restaurant_status" AS ENUM('draft', 'published');
CREATE TYPE "public"."review_status" AS ENUM('pending', 'published', 'rejected');
CREATE TYPE "public"."translation_status" AS ENUM('pending', 'complete');
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');

-- Create Tables
CREATE TABLE "api_usage_log" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "service" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "blog_posts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "slug" text NOT NULL,
    "content" text NOT NULL,
    "author_fk" uuid NOT NULL,
    "cover_image" text,
    "tags" text[],
    "published_at" timestamp,
    "locale" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "blog_posts_slug_unique" UNIQUE("slug")
);

CREATE TABLE "events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "date" timestamp NOT NULL,
    "location" text NOT NULL,
    "restaurant_fk" uuid,
    "locale" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "ingredients" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category" text NOT NULL,
    "slug" text NOT NULL,
    "name_pt" text NOT NULL,
    "name_en" text,
    "name_fr" text,
    "created_language" text DEFAULT 'pt' NOT NULL,
    "translation_status" "translation_status" DEFAULT 'pending' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "ingredients_slug_unique" UNIQUE("slug")
);

CREATE TABLE "page_content" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "page_key" text NOT NULL,
    "locale" text NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "page_key_locale_unique" UNIQUE("page_key","locale")
);

CREATE TABLE "restaurants" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" text NOT NULL,
    "slug" text NOT NULL,
    "address" text NOT NULL,
    "city" text NOT NULL,
    "lat" numeric NOT NULL,
    "lng" numeric NOT NULL,
    "phone" text,
    "website" text,
    "price_range" smallint NOT NULL,
    "photos" text[],
    "restaurant_status" "restaurant_status" DEFAULT 'draft' NOT NULL,
    "avg_score" numeric,
    "review_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "restaurants_slug_unique" UNIQUE("slug"),
    CONSTRAINT "avg_score_range" CHECK ("restaurants"."avg_score" >= 0 AND "restaurants"."avg_score" <= 10)
);

CREATE TABLE "tags" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "category" text NOT NULL,
    "slug" text NOT NULL,
    "name_pt" text NOT NULL,
    "name_en" text,
    "name_fr" text,
    "created_language" text DEFAULT 'pt' NOT NULL,
    "translation_status" "translation_status" DEFAULT 'pending' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);

CREATE TABLE "users" (
    "id" uuid PRIMARY KEY NOT NULL,
    "role" "user_role" DEFAULT 'user' NOT NULL,
    "display_name" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "reviews" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "restaurant_fk" uuid NOT NULL,
    "author_fk" uuid NOT NULL,
    "is_official" boolean DEFAULT false NOT NULL,
    "status" "review_status" DEFAULT 'pending' NOT NULL,
    "visit_date" date NOT NULL,
    "price_paid" numeric,
    "francesinha_type" text NOT NULL,
    "text" text NOT NULL,
    "photos" text[],
    "ingredient_evaluations" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "experience_scores" jsonb DEFAULT '[]'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- Foreign Key Constraints
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_fk_users_id_fk" FOREIGN KEY ("author_fk") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "events" ADD CONSTRAINT "events_restaurant_fk_restaurants_id_fk" FOREIGN KEY ("restaurant_fk") REFERENCES "public"."restaurants"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_restaurant_fk_restaurants_id_fk" FOREIGN KEY ("restaurant_fk") REFERENCES "public"."restaurants"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_author_fk_users_id_fk" FOREIGN KEY ("author_fk") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- REVIEWS POLICIES
CREATE POLICY "Public can view published reviews"
ON reviews FOR SELECT
USING (status = 'published');

CREATE POLICY "Users can create reviews"
ON reviews FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = author_fk);

CREATE POLICY "Authors can update own pending reviews"
ON reviews FOR UPDATE
TO authenticated
USING (auth.uid() = author_fk AND status = 'pending')
With CHECK (auth.uid() = author_fk AND status = 'pending');

CREATE POLICY "Admins have full access to reviews"
ON reviews FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- RESTAURANTS POLICIES
CREATE POLICY "Public can view published restaurants"
ON restaurants FOR SELECT
USING (restaurant_status = 'published');

CREATE POLICY "Admins have full access to restaurants"
ON restaurants FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

-- INGREDIENTS & TAGS POLICIES
CREATE POLICY "Public can view ingredients"
ON ingredients FOR SELECT
USING (true);

CREATE POLICY "Public can view tags"
ON tags FOR SELECT
USING (true);

CREATE POLICY "Admins can manage ingredients"
ON ingredients FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);

CREATE POLICY "Admins can manage tags"
ON tags FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid() AND users.role = 'admin'
  )
);