import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.string().min(1, "Date is required"),
  location: z.string().min(1, "Location is required"),
  restaurantId: z.string().uuid().nullable(),
  locale: z.enum(["pt", "en", "fr"]),
});

export type EventFormValues = z.infer<typeof eventSchema>;
