-- Scoring (PRD v1.0, commit 4)
-- Each restaurant gets two scores out of 10:
--   avg_score / review_count:                     the Knights' score (official reviews), drives the ranking
--   community_avg_score / community_review_count: members' reviews, shown beside it
-- A review's score is the plain average of its components (rated ingredients
-- plus experience scores); a restaurant's score is the average of its review
-- scores. The app recalculates on every review change; this migration
-- recalculates every restaurant once.

ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS community_avg_score numeric,
  ADD COLUMN IF NOT EXISTS community_review_count integer NOT NULL DEFAULT 0;

ALTER TABLE public.restaurants
  ADD CONSTRAINT community_avg_score_range
  CHECK (community_avg_score >= 0 AND community_avg_score <= 10);

WITH review_scores AS (
  SELECT
    r.restaurant_fk,
    r.is_official,
    (
      SELECT avg(c.score)
      FROM (
        SELECT (e ->> 'score')::numeric AS score
        FROM jsonb_array_elements(
          CASE WHEN jsonb_typeof(r.ingredient_evaluations) = 'array'
               THEN r.ingredient_evaluations ELSE '[]'::jsonb END
        ) AS e
        WHERE jsonb_typeof(e -> 'score') = 'number'
        UNION ALL
        SELECT (e ->> 'score')::numeric
        FROM jsonb_array_elements(
          CASE WHEN jsonb_typeof(r.experience_scores) = 'array'
               THEN r.experience_scores ELSE '[]'::jsonb END
        ) AS e
        WHERE jsonb_typeof(e -> 'score') = 'number'
      ) AS c
      WHERE c.score > 0
    ) AS score
  FROM public.reviews r
  WHERE r.status = 'published'
),
per_restaurant AS (
  SELECT
    restaurant_fk,
    round(avg(score) FILTER (WHERE is_official), 1)     AS knights_score,
    count(*)         FILTER (WHERE is_official)         AS knights_count,
    round(avg(score) FILTER (WHERE NOT is_official), 1) AS community_score,
    count(*)         FILTER (WHERE NOT is_official)     AS community_count
  FROM review_scores
  WHERE score IS NOT NULL
  GROUP BY restaurant_fk
)
UPDATE public.restaurants AS rest
SET
  avg_score              = p.knights_score,
  review_count           = COALESCE(p.knights_count, 0),
  community_avg_score    = p.community_score,
  community_review_count = COALESCE(p.community_count, 0)
FROM public.restaurants AS base
LEFT JOIN per_restaurant AS p ON p.restaurant_fk = base.id
WHERE rest.id = base.id;
