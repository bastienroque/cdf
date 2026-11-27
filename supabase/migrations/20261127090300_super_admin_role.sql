-- Super admin role (PRD v1.0, commit 6), part 1 of 2.
-- A new enum value can't be used in the same transaction that adds it,
-- so the rules that use it are in the next migration.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'super_admin';
