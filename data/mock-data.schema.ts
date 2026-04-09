import { z } from 'zod';

export const placeCategorySchema = z.enum(['landmark', 'restaurant', 'cafe', 'activity', 'shopping']);
export const priceLevelSchema = z.union([
  z.literal('Free'),
  z.literal('$'),
  z.literal('$$'),
  z.literal('$$$'),
  z.literal('$$$$'),
]);

export const placeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: placeCategorySchema,
  rating: z.number().min(0).max(5),
  image_url: z.string().url(),
  estimated_duration_min: z.number().int().positive(),
  distance_km: z.number().min(0),
  description: z.string().min(1),
  opening_hours: z.string().min(1),
  price_level: priceLevelSchema,
  tags: z.array(z.string().min(1)),
});

export const categorySchema = z.object({
  id: z.union([z.literal('all'), placeCategorySchema]),
  label: z.string().min(1),
  icon: z.string().min(1),
});

export const mockDataSchema = z.object({
  places: z.array(placeSchema),
  categories: z.array(categorySchema),
});

export type MockDataParsed = z.infer<typeof mockDataSchema>;
