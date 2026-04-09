import type { CategoryDefinition, MockData, Place } from '@/types/wanderly';
import { mockDataSchema } from './mock-data.schema';
import raw from './mock_data.json';

const parsed = mockDataSchema.safeParse(raw);

if (!parsed.success) {
  const details = parsed.error.issues
    .slice(0, 6)
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Invalid mock_data.json schema: ${details}`);
}

const data = parsed.data as MockData;

export const PLACES: Place[] = data.places;
export const CATEGORIES: CategoryDefinition[] = data.categories;

export const placesById: Record<string, Place> = PLACES.reduce(
  (acc, place) => {
    acc[place.id] = place;
    return acc;
  },
  {} as Record<string, Place>
);
