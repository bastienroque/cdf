import { Resend } from "resend";
import { getUserEmail } from "@/lib/get-user-email";

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send.");
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendReviewApprovedEmail(
  authorId: string,
  reviewUrl: string,
) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const email = await getUserEmail(authorId);
    if (!email) return;

    await resend.emails.send({
      from: "Cavaleiros da Francesinha <no-reply@cavaleirosdafrancesinha.pt>",
      to: email,
      subject: "A sua avaliação foi aprovada",
      html: `
        <p>Boas notícias! A sua avaliação foi aprovada e já está visível publicamente.</p>
        <p><a href="${reviewUrl}">Ver a avaliação</a></p>
      `,
    });
  } catch (err) {
    console.error("Falha ao enviar email de aprovação:", err);
  }
}

export async function sendReviewRejectedEmail(authorId: string) {
  const resend = getResendClient();
  if (!resend) return;

  try {
    const email = await getUserEmail(authorId);
    if (!email) return;

    await resend.emails.send({
      from: "Cavaleiros da Francesinha <no-reply@cavaleirosdafrancesinha.pt>",
      to: email,
      subject: "A sua avaliação não foi aprovada",
      html: `
        <p>A sua avaliação recente não cumpriu os critérios de publicação e não foi aprovada.</p>
        <p>Pode submeter uma nova avaliação a qualquer momento.</p>
      `,
    });
  } catch (err) {
    console.error("Falha ao enviar email de rejeição:", err);
  }
}
