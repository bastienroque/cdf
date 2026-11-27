import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Scroll, Tag } from "lucide-react";
import Image from "next/image";

export interface FormattedReviewScore {
  label: string;
  score: number;
  tags?: string[];
}

export interface FormattedReview {
  id: string;
  text: string | null;
  photos?: string[];
  isOfficial: boolean;
  visitDate: string | null;
  pricePaid: number | null;
  francesinhaType: string | null;
  score: number | null;
  authorName: string;
  ingredientScores: FormattedReviewScore[];
  experienceScores: FormattedReviewScore[];
}

interface RestaurantReviewsProps {
  reviews: FormattedReview[];
  labels: {
    decreesHeader: string;
    recordsBadge: string;
    noDecrees: string;
    officialDecree: string;
    communityScroll: string;
    price: string;
    score: string;
  };
  locale: string;
}

export function RestaurantReviews({ reviews, labels, locale }: RestaurantReviewsProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value);

  return (
    <div className="mt-12 border-t border-border/60 pt-8">
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Scroll className="hidden md:block h-5 w-5 text-amber-500" />
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
            {labels.decreesHeader}
          </h2>
        </div>
        <Badge className="rounded-sm border border-amber-500/30 bg-amber-500/10 font-mono text-xs uppercase text-amber-600">
          {labels.recordsBadge}
        </Badge>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-sm border border-dashed border-border/80 bg-muted/20 py-12 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {labels.noDecrees}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              id={`review-${review.id}`}
              className="scroll-mt-24 rounded-sm border border-amber-500/20 bg-card p-4 md:p-6 transition-all hover:border-amber-500/40"
            >
              <div className="mb-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  <span className="font-display font-semibold text-foreground text-base">
                    {review.authorName}
                  </span>
                </div>
                <Badge
                  className={
                    review.isOfficial
                      ? "rounded-sm border border-amber-500/40 bg-amber-500/20 font-mono text-xs uppercase text-amber-600 font-bold"
                      : "rounded-sm border border-border bg-muted font-mono text-xs uppercase text-muted-foreground"
                  }
                >
                  {review.isOfficial
                    ? labels.officialDecree
                    : labels.communityScroll}
                </Badge>
              </div>

              {/* Score, price paid and Francesinha type */}
              {(review.score !== null || review.pricePaid !== null || review.francesinhaType) && (
                <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs uppercase tracking-wider">
                  {review.score !== null && (
                    <span className="rounded-sm border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-600">
                      <span className="sr-only">{labels.score} </span>
                      {review.score.toFixed(1)}/10
                    </span>
                  )}
                  {review.pricePaid !== null && (
                    <span className="rounded-sm border border-border bg-muted/50 px-2 py-0.5 text-foreground">
                      {labels.price} {formatPrice(review.pricePaid)}
                    </span>
                  )}
                  {review.francesinhaType && (
                    <span className="text-muted-foreground normal-case tracking-normal">
                      {review.francesinhaType}
                    </span>
                  )}
                </div>
              )}

              {review.text && (
                <p className="font-body text-sm leading-relaxed text-foreground/90 mb-4">
                  {review.text}
                </p>
              )}

              {/* Review Photos: Horizontal Scroll Carousel on Mobile, Grid on Tablet/Desktop */}
              {review.photos && review.photos.length > 0 && (
                <div className="mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid sm:grid-cols-3 md:grid-cols-4 gap-2 overflow-x-auto sm:overflow-visible snap-x snap-mandatory scrollbar-none">
                  {review.photos.map((photoUrl, idx) => (
                    <div
                      key={photoUrl}
                      className="relative aspect-video w-[80%] shrink-0 snap-align-start overflow-hidden rounded-sm border border-border/80 bg-muted sm:w-full"
                    >
                      <Image
                        src={photoUrl}
                        alt={`${review.authorName} review photo ${idx + 1}`}
                        fill
                        className="object-cover transition-transform"
                        sizes="(max-width: 640px) 80vw, (max-width: 768px) 33vw, 25vw"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Ingredient & Experience Score Badges with Inline Tags */}
              {(review.ingredientScores.length > 0 ||
                review.experienceScores.length > 0) && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-3">
                  {review.ingredientScores.map((s, i) => (
                    <div
                      key={`ing-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      <span className="text-foreground font-medium">
                        {s.label}
                      </span>
                      {s.tags && s.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/20">
                          <Tag className="h-2.5 w-2.5" />
                          {s.tags.join(", ")}
                        </span>
                      )}
                      <span>:</span>
                      <span className="text-amber-600 font-bold">
                        {s.score}/10
                      </span>
                    </div>
                  ))}

                  {review.experienceScores.map((s, i) => (
                    <div
                      key={`exp-${i}`}
                      className="inline-flex items-center gap-1.5 rounded-sm border border-amber-500/30 bg-amber-500/5 px-2.5 py-1 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                    >
                      <span className="text-amber-600 font-medium">
                        {s.label}
                      </span>
                      {s.tags && s.tags.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/20">
                          <Tag className="h-2.5 w-2.5" />
                          {s.tags.join(", ")}
                        </span>
                      )}
                      <span>:</span>
                      <span className="text-amber-600 font-bold">
                        {s.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {review.visitDate && (
                <span className="flex items-center gap-1 mt-4 font-mono text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(review.visitDate).toLocaleDateString(locale, {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
