import raw from './mock_data.json';
import type { MockData, Place, CategoryDefinition } from '@/types/wanderly';

const data = raw as MockData;

export const PLACES: Place[] = data.places;
export const CATEGORIES: CategoryDefinition[] = data.categories;

export const placesById: Record<string, Place> = PLACES.reduce(
  (acc, place) => {
    acc[place.id] = place;
    return acc;
  },
  {} as Record<string, Place>
);
