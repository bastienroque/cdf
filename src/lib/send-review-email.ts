import { Resend } from "resend";
import { getTranslations } from "next-intl/server";
import { getUserContact } from "@/lib/get-user-email";
import { escapeHtml } from "@/lib/escape-html";
import { logApiUsage } from "@/lib/log-api-usage";
import { siteUrl } from "@/lib/site-url";

const FROM = `Cavaleiros da Francesinha <${
  process.env.REVIEW_EMAIL_FROM || "no-reply@cavaleirosdafrancesinha.com"
}>`;

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}


export async function sendReviewApprovedEmail(
  authorId: string,
  restaurantSlug: string,
  reviewId: string,
) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const contact = await getUserContact(authorId);
    if (!contact) return;

    const t = await getTranslations({ locale: contact.locale, namespace: "common.emails" });
    const url = `${siteUrl()}/${contact.locale}/restaurants/${encodeURIComponent(restaurantSlug)}#review-${reviewId}`;

    await resend.emails.send({
      from: FROM,
      to: contact.email,
      subject: t("approved.subject"),
      html: `
        <p>${escapeHtml(t("approved.body"))}</p>
        <p><a href="${escapeHtml(url)}">${escapeHtml(t("approved.cta"))}</a></p>
      `,
    });
    await logApiUsage("resend");
  } catch (err) {
    console.error("Failed to send approval email:", err);
  }
}

export async function sendReviewRejectedEmail(authorId: string, reason?: string) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const contact = await getUserContact(authorId);
    if (!contact) return;

    const t = await getTranslations({ locale: contact.locale, namespace: "common.emails" });
    const reasonBlock = reason?.trim()
      ? `<p><strong>${escapeHtml(t("rejected.reasonLabel"))}</strong> ${escapeHtml(reason.trim())}</p>`
      : "";

    await resend.emails.send({
      from: FROM,
      to: contact.email,
      subject: t("rejected.subject"),
      html: `
        <p>${escapeHtml(t("rejected.body"))}</p>
        ${reasonBlock}
        <p>${escapeHtml(t("rejected.retry"))}</p>
      `,
    });
    await logApiUsage("resend");
  } catch (err) {
    console.error("Failed to send rejection email:", err);
  }
}
