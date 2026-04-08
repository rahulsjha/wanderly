export type PlaceCategory = 'landmark' | 'restaurant' | 'cafe' | 'activity' | 'shopping';

export type PriceLevel = '$' | '$$' | '$$$' | '$$$$' | 'Free';

export type Place = {
  id: string;
  name: string;
  category: PlaceCategory;
  rating: number;
  image_url: string;
  estimated_duration_min: number;
  distance_km: number;
  description: string;
  opening_hours: string;
  price_level: PriceLevel;
  tags: string[];
};

export type CategoryDefinition = {
  id: 'all' | PlaceCategory;
  label: string;
  icon: string;
};

export type MockData = {
  places: Place[];
  categories: CategoryDefinition[];
};
