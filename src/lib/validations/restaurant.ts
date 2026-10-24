import { z } from "zod";

export const restaurantSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  address: z.string().min(1, "Morada obrigatória"),
  city: z.string().min(1, "Cidade obrigatória"),
  lat: z.number(),
  lng: z.number(),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().url("URL inválido").optional().or(z.literal("")),
  priceRange: z.number().int().min(1).max(4),
  photos: z.array(z.string().url()).max(2, "Máximo 2 fotos"),
  status: z.enum(["draft", "published"]),
});

export type RestaurantFormValues = z.infer<typeof restaurantSchema>;
