-- Super admin role (PRD v1.0, commit 6), part 2 of 2.
-- Super admins count as admins everywhere, and only they can change a
-- user's role or name through the API. The owner's account is promoted
-- separately (not in this public file).

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'super_admin') FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT role = 'super_admin' FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

CREATE POLICY "Super admins can update users" ON public.users
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
