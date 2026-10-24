"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  reviewSchema,
  type ReviewFormInput,
  type ReviewFormValues,
} from "@/lib/validations/review";
import {
  createReview,
  updateReview,
} from "@/app/[locale]/(admin)/admin/reviews/actions";
import { PrimaryButton } from "@/components/form/form-field";
import { ReviewGeneralSection } from "./sections/review-general-section";
import { ReviewIngredientsSection } from "./sections/review-ingredients-section";
import { ReviewExperienceSection } from "./sections/review-experience-section";
import { ReviewMediaSection } from "./sections/review-media-section";

export type Ingredient = {
  id: string;
  category: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
};

export type Tag = {
  id: string;
  category: string;
  namePt: string;
  nameEn: string | null;
  nameFr: string | null;
};

type Restaurant = { id: string; name: string };

export function ReviewForm({
  reviewId,
  defaultValues,
  restaurants = [],
  ingredients = [],
  tags = [],
}: {
  reviewId?: string;
  defaultValues?: Partial<ReviewFormInput>;
  restaurants: Restaurant[];
  ingredients?: Ingredient[];
  tags?: Tag[];
}) {
  const t = useTranslations("admin.reviews.form");
  const tCommon = useTranslations("common");
  const methods = useForm<ReviewFormInput>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      restaurantId: "",
      visitDate: "",
      francesinhaType: "",
      text: "",
      photos: [],
      scoreService: 5,
      scoreDigestion: 5,
      scoreVibe: 5,
      reviewIngredients: [],
      ...defaultValues,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  async function onSubmit(values: ReviewFormInput) {
    const parsedValues = values as ReviewFormValues;
    if (reviewId) await updateReview(reviewId, parsedValues);
    else await createReview(parsedValues);
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        <ReviewGeneralSection restaurants={restaurants} />
        <ReviewIngredientsSection
          availableIngredients={ingredients}
          availableTags={tags}
        />
        <ReviewExperienceSection />
        <ReviewMediaSection />
        <div className="pt-4 border-t border-border/60">
          <PrimaryButton type="submit" disabled={isSubmitting}>
            {reviewId ? tCommon("actions.save") : t("publishReview")}
          </PrimaryButton>
        </div>
      </form>
    </FormProvider>
  );
}
