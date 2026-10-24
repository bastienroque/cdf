"use server";

import { db } from "@/db";
import { events } from "@/db/schema";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import { requireAdmin } from "@/lib/auth/admin";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createEvent(values: EventFormValues) {
  await requireAdmin();
  const parsed = eventSchema.parse(values);

  await db.insert(events).values({
    title: parsed.title,
    description: parsed.description,
    date: new Date(parsed.date),
    location: parsed.location,
    restaurantFk: parsed.restaurantId,
    locale: parsed.locale,
  });

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function updateEvent(id: string, values: EventFormValues) {
  await requireAdmin();
  const parsed = eventSchema.parse(values);

  await db
    .update(events)
    .set({
      title: parsed.title,
      description: parsed.description,
      date: new Date(parsed.date),
      location: parsed.location,
      restaurantFk: parsed.restaurantId,
      locale: parsed.locale,
    })
    .where(eq(events.id, id));

  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireAdmin();
  await db.delete(events).where(eq(events.id, id));
  revalidatePath("/admin/events");
}
