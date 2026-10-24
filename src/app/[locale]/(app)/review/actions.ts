"use server";

import { db } from "@/db";
import { reviews, reviewComponents } from "@/db/schema";
import { reviewSchema, type ReviewFormValues } from "@/lib/validations/review";
import { createClient } from "@/lib/supabase/server";

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY!,
        response: token,
      }),
    },
  );
  const data = await res.json();
  return data.success === true;
}

export async function submitPublicReview(
  values: ReviewFormValues,
  turnstileToken: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Precisa de iniciar sessão." };
  }

  const turnstileValid = await verifyTurnstile(turnstileToken);
  if (!turnstileValid) {
    return { error: "Verificação falhou. Tente novamente." };
  }

  const parsed = reviewSchema.parse(values);

  try {
    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(reviews)
        .values({
          restaurantFk: parsed.restaurantId,
          authorFk: user.id,
          isOfficial: false,
          status: "pending" as const,
          visitDate: parsed.visitDate,
          pricePaid: parsed.pricePaid?.toString(),
          francesinhaType: parsed.francesinhaType,
          text: parsed.text,
          photos: parsed.photos,
        })
        .returning({ id: reviews.id });

      await tx.insert(reviewComponents).values(
        parsed.components.map((c) => ({
          reviewFk: inserted.id,
          ingredientFk: c.ingredientId,
          variantFk: c.variantId,
          score: c.score,
        })),
      );
    });
  } catch (err: any) {
    if (err?.code === "P0001") {
      return {
        error:
          "Já tem 2 avaliações pendentes. Aguarde a moderação antes de submeter outra.",
      };
    }
    throw err;
  }

  return { success: true };
}
