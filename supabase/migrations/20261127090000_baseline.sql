-- Baseline: the live production schema as of 2026-11-26 (from pg_dump).
-- Already applied in production; recorded with 'supabase migration repair --status applied'.

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.12 (Homebrew)

--
-- Name: restaurant_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.restaurant_status AS ENUM (
    'draft',
    'published'
);

ALTER TYPE public.restaurant_status OWNER TO postgres;

--
-- Name: review_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.review_status AS ENUM (
    'pending',
    'published',
    'rejected'
);

ALTER TYPE public.review_status OWNER TO postgres;

--
-- Name: translation_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.translation_status AS ENUM (
    'pending',
    'complete'
);

ALTER TYPE public.translation_status OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'admin',
    'user'
);

ALTER TYPE public.user_role OWNER TO postgres;

--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

ALTER FUNCTION public.is_admin() OWNER TO postgres;

--
-- Name: api_usage_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.api_usage_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.api_usage_log OWNER TO postgres;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    content text NOT NULL,
    author_fk uuid NOT NULL,
    cover_image text,
    tags text[],
    published_at timestamp without time zone,
    locale text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.blog_posts OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date timestamp without time zone NOT NULL,
    location text NOT NULL,
    restaurant_fk uuid,
    locale text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.events OWNER TO postgres;

--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    slug text NOT NULL,
    name_pt text NOT NULL,
    name_en text,
    name_fr text,
    created_language text DEFAULT 'pt'::text NOT NULL,
    translation_status public.translation_status DEFAULT 'pending'::public.translation_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.ingredients OWNER TO postgres;

--
-- Name: page_content; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.page_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_key text NOT NULL,
    locale text NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.page_content OWNER TO postgres;

--
-- Name: restaurants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restaurants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    lat numeric NOT NULL,
    lng numeric NOT NULL,
    phone text,
    website text,
    price_range smallint NOT NULL,
    photos text[],
    restaurant_status public.restaurant_status DEFAULT 'draft'::public.restaurant_status NOT NULL,
    avg_score numeric,
    review_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT avg_score_range CHECK (((avg_score >= (0)::numeric) AND (avg_score <= (10)::numeric)))
);

ALTER TABLE public.restaurants OWNER TO postgres;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    restaurant_fk uuid NOT NULL,
    author_fk uuid NOT NULL,
    is_official boolean DEFAULT false NOT NULL,
    status public.review_status DEFAULT 'pending'::public.review_status NOT NULL,
    visit_date date NOT NULL,
    price_paid numeric,
    francesinha_type text NOT NULL,
    text text NOT NULL,
    photos text[],
    ingredient_evaluations jsonb DEFAULT '[]'::jsonb NOT NULL,
    experience_scores jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.reviews OWNER TO postgres;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tags (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    slug text NOT NULL,
    name_pt text NOT NULL,
    name_en text,
    name_fr text,
    created_language text DEFAULT 'pt'::text NOT NULL,
    translation_status public.translation_status DEFAULT 'pending'::public.translation_status NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.tags OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    display_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.users OWNER TO postgres;

--
-- Name: api_usage_log api_usage_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.api_usage_log
    ADD CONSTRAINT api_usage_log_pkey PRIMARY KEY (id);

--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);

--
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);

--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);

--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);

--
-- Name: ingredients ingredients_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_slug_unique UNIQUE (slug);

--
-- Name: page_content page_content_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_pkey PRIMARY KEY (id);

--
-- Name: page_content page_key_locale_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_key_locale_unique UNIQUE (page_key, locale);

--
-- Name: restaurants restaurants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_pkey PRIMARY KEY (id);

--
-- Name: restaurants restaurants_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restaurants
    ADD CONSTRAINT restaurants_slug_unique UNIQUE (slug);

--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);

--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);

--
-- Name: tags tags_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_slug_unique UNIQUE (slug);

--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Name: blog_posts blog_posts_author_fk_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_author_fk_users_id_fk FOREIGN KEY (author_fk) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: events events_restaurant_fk_restaurants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_restaurant_fk_restaurants_id_fk FOREIGN KEY (restaurant_fk) REFERENCES public.restaurants(id) ON DELETE SET NULL;

--
-- Name: reviews reviews_author_fk_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_author_fk_users_id_fk FOREIGN KEY (author_fk) REFERENCES public.users(id) ON DELETE RESTRICT;

--
-- Name: reviews reviews_restaurant_fk_restaurants_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_restaurant_fk_restaurants_id_fk FOREIGN KEY (restaurant_fk) REFERENCES public.restaurants(id) ON DELETE RESTRICT;

--
-- Name: users users_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_users_id_fk FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

--
-- Name: ingredients Admins can manage ingredients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage ingredients" ON public.ingredients TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));

--
-- Name: tags Admins can manage tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can manage tags" ON public.tags TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));

--
-- Name: users Admins can view all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO authenticated USING (public.is_admin());

--
-- Name: restaurants Admins have full access to restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins have full access to restaurants" ON public.restaurants TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));

--
-- Name: reviews Admins have full access to reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins have full access to reviews" ON public.reviews TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.users
  WHERE ((users.id = auth.uid()) AND (users.role = 'admin'::public.user_role)))));

--
-- Name: reviews Authors can update own pending reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authors can update own pending reviews" ON public.reviews FOR UPDATE TO authenticated USING (((auth.uid() = author_fk) AND (status = 'pending'::public.review_status))) WITH CHECK (((auth.uid() = author_fk) AND (status = 'pending'::public.review_status)));

--
-- Name: ingredients Public can view ingredients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view ingredients" ON public.ingredients FOR SELECT USING (true);

--
-- Name: restaurants Public can view published restaurants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view published restaurants" ON public.restaurants FOR SELECT USING ((restaurant_status = 'published'::public.restaurant_status));

--
-- Name: reviews Public can view published reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view published reviews" ON public.reviews FOR SELECT USING ((status = 'published'::public.review_status));

--
-- Name: tags Public can view tags; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Public can view tags" ON public.tags FOR SELECT USING (true);

--
-- Name: reviews Users can create reviews; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK ((auth.uid() = author_fk));

--
-- Name: users Users can view own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO authenticated USING ((auth.uid() = id));

--
-- Name: api_usage_log; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.api_usage_log ENABLE ROW LEVEL SECURITY;

--
-- Name: blog_posts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: ingredients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

--
-- Name: page_content; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

--
-- Name: restaurants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

--
-- Name: reviews; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

--
-- Name: tags; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.users TO authenticated;
GRANT SELECT ON TABLE public.users TO anon;

--
-- PostgreSQL database dump complete
--


-- Storage policies (live)
CREATE POLICY "Admin full access for restaurant images" ON storage.objects TO authenticated USING (((bucket_id = 'restaurant-photos'::text) AND public.is_admin())) WITH CHECK (((bucket_id = 'restaurant-photos'::text) AND public.is_admin()));
CREATE POLICY "Authenticated Delete Access for review-photos" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'review-photos'::text));
CREATE POLICY "Authenticated Upload Access for review-photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'review-photos'::text));
CREATE POLICY "Public Read Access for review-photos" ON storage.objects FOR SELECT USING ((bucket_id = 'review-photos'::text));
CREATE POLICY "Public read access for restaurant images" ON storage.objects FOR SELECT USING ((bucket_id = 'restaurant-photos'::text));
CREATE POLICY public_select_blog_covers ON storage.objects FOR SELECT USING ((bucket_id = 'blog-covers'::text));
CREATE POLICY public_select_restaurant_photos ON storage.objects FOR SELECT USING ((bucket_id = 'restaurant-photos'::text));
