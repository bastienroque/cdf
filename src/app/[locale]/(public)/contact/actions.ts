"use server";

import { logApiUsage } from "@/lib/log-api-usage";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export type ContactFormState = {
  success?: boolean;
  error?: string;
};

export async function sendContactEmail(
  prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = formData.get("name")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const subject =
    formData.get("subject")?.toString().trim() || "New Contact Message";
  const message = formData.get("message")?.toString().trim();

  if (!name || !email || !message) {
    return { success: false, error: "Please fill in all required fields." };
  }

  try {
    const toEmail = process.env.CONTACT_FORM_TO_EMAIL;
    const fromEmail =
      process.env.CONTACT_FORM_FROM_EMAIL || "onboarding@resend.dev";

    if (!toEmail) {
      throw new Error("Missing CONTACT_FORM_TO_EMAIL environment variable.");
    }

    const { error } = await resend.emails.send({
      from: `Message d'un écuyer <${fromEmail}>`,
      to: [toEmail],
      replyTo: email,
      subject: `[Message d'un écuyer] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; color: #1f2937;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: 4px solid #d97706; border-radius: 4px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              
              <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.025em; text-transform: uppercase;">
                Nouveau message de contact
              </h2>

              <div style="background-color: #f3f4f6; border-radius: 4px; padding: 16px; margin-bottom: 24px; font-size: 14px; line-height: 1.5;">
                <p style="margin: 0 0 8px 0;"><strong>De:</strong> ${name} (<a href="mailto:${email}" style="color: #d97706; text-decoration: none;">${email}</a>)</p>
                <p style="margin: 0;"><strong>Sujet:</strong> ${subject}</p>
              </div>

              <div style="font-size: 15px; line-height: 1.6; color: #374151; white-space: pre-wrap; word-break: break-word;">${message}</div>

              <hr style="border: 0; border-top: 1px solid #f3f4f6; margin: 32px 0 16px 0;" />
              
              <p style="margin: 0; font-size: 12px; color: #9ca3af; font-family: monospace;">
                Envoyé depuis le formulaire de contact des Cavaleiros da Francesinha
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return {
        success: false,
        error: "Failed to send message via email dispatch.",
      };
    }

    await logApiUsage("resend");

    return { success: true };
  } catch (err) {
    console.error("Contact action exception:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}
