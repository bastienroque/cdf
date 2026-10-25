import { createClient } from "@/lib/supabase/server";
import { getRecentReviews, getTopRestaurants } from "@/lib/get-recent-activity";
import { getTranslations } from "next-intl/server";

import { Hero } from "@/components/public/home/hero";
import { TopRestaurants } from "@/components/public/home/top-restaurants";
import { HowItWorks } from "@/components/public/home/how-it-works";
import { RecentActivity } from "@/components/public/home/recent-activity";
import { MapTeaser } from "@/components/public/home/map-teaser";
import { CtaBand } from "@/components/public/home/cta-band";
import { ComingSoonReviews } from "@/components/public/home/coming-soon";

const priceLabels = ["€", "€€", "€€€", "€€€€"];

export default async function HomePage() {
  const [topRestaurants, recentReviews, t, tCommon] = await Promise.all([
    getTopRestaurants(),
    getRecentReviews(),
    getTranslations("public.home"),
    getTranslations("common"),
  ]);

  return (
    <>
      <Hero
        badge={t("hero.badge")}
        title={t("hero.title")}
        subtitle={t("hero.subtitle")}
        exploreAction={t("hero.exploreAction")}
        mapAction={t("hero.mapAction")}
      />

      <TopRestaurants
        restaurants={topRestaurants}
        priceLabels={priceLabels}
        labels={{
          tag: t("topRated.tag"),
          title: t("topRated.title"),
          leaderboardLink: t("topRated.leaderboardLink"),
          empty: t("topRated.empty"),
        }}
      />

      <ComingSoonReviews
        labels={{
          tag: t("comingSoon.tag"),
          title: t("comingSoon.title"),
          description: t("comingSoon.description"),
        }}
      />

      <HowItWorks
        labels={{
          tag: t("decree.tag"),
          title: t("decree.title"),
          step1Title: t("decree.step1Title"),
          step1Desc: t("decree.step1Desc"),
          step2Title: t("decree.step2Title"),
          step2Desc: t("decree.step2Desc"),
        }}
      />

      <RecentActivity
        reviews={recentReviews}
        labels={{
          tag: t("recentActivity.tag"),
          title: t("recentActivity.title"),
          empty: t("recentActivity.empty"),
        }}
        badges={{
          official: tCommon("badges.official"),
          community: tCommon("badges.community"),
        }}
      />

      <MapTeaser
        labels={{
          title: t("mapTeaser.title"),
          subtitle: t("mapTeaser.subtitle"),
          cta: t("mapTeaser.cta"),
        }}
      />
    </>
  );
}
