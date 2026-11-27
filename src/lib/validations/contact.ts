import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.email().max(254),
  subject: z.string().max(200).optional(),
  message: z.string().min(1).max(5000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
