-- Security fixes (PRD v1.0, commit 1)
-- 1. Member review inserts can only be pending and unofficial.
-- 2. Admin checks use public.is_admin() everywhere, with WITH CHECK on writes.
-- 3. Content tables get explicit read/write rules.
-- 4. Review photos and blog covers: only admins can upload or delete.
-- 5. A profile row is created by a trigger when an account signs up.

-- ---------------------------------------------------------------------------
-- Reviews
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Members can create pending reviews" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_fk AND status = 'pending' AND is_official = false);

DROP POLICY IF EXISTS "Authors can update own pending reviews" ON public.reviews;
CREATE POLICY "Authors can update own pending reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = author_fk AND status = 'pending')
  WITH CHECK (auth.uid() = author_fk AND status = 'pending' AND is_official = false);

DROP POLICY IF EXISTS "Admins have full access to reviews" ON public.reviews;
CREATE POLICY "Admins have full access to reviews" ON public.reviews
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Restaurants, ingredients, tags
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins have full access to restaurants" ON public.restaurants;
CREATE POLICY "Admins have full access to restaurants" ON public.restaurants
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage ingredients" ON public.ingredients;
CREATE POLICY "Admins can manage ingredients" ON public.ingredients
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags" ON public.tags
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- Editorial content and logs (RLS is already enabled on these tables)
-- ---------------------------------------------------------------------------
CREATE POLICY "Public can view published blog posts" ON public.blog_posts
  FOR SELECT USING (published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Admins manage blog posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view events" ON public.events
  FOR SELECT USING (true);
CREATE POLICY "Admins manage events" ON public.events
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Public can view page content" ON public.page_content
  FOR SELECT USING (true);
CREATE POLICY "Admins manage page content" ON public.page_content
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view API usage" ON public.api_usage_log
  FOR SELECT TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated Delete Access for review-photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Access for review-photos" ON storage.objects;
CREATE POLICY "Admins manage review photos" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'review-photos' AND public.is_admin())
  WITH CHECK (bucket_id = 'review-photos' AND public.is_admin());

-- Blog cover uploads had no write rule at all, so uploads were refused.
CREATE POLICY "Admins manage blog covers" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'blog-covers' AND public.is_admin())
  WITH CHECK (bucket_id = 'blog-covers' AND public.is_admin());

-- ---------------------------------------------------------------------------
-- Profile row created at sign-up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.users (id, display_name, role)
  VALUES (
    new.id,
    COALESCE(
      NULLIF(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      split_part(new.email, '@', 1)
    ),
    'user'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
