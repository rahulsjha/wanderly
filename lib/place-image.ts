import type { Place, PlaceCategory } from '@/types/wanderly';

function normalizeQuery(input: string) {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[\u2019']/g, '')
    .toLowerCase();
}

function categoryHint(category: PlaceCategory) {
  switch (category) {
    case 'landmark':
      return 'palace fort architecture';
    case 'restaurant':
      return 'restaurant rajasthan food';
    case 'cafe':
      return 'cafe chai coffee';
    case 'activity':
      return 'culture india experience';
    case 'shopping':
      return 'bazaar market textiles';
    default:
      return '';
  }
}

/**
 * Jaipur-specific imagery using Unsplash Source.
 * No API key required; returns a URL that resolves to a contextual photo.
 */
export function unsplashPlaceImageUrl(
  place: Pick<Place, 'name' | 'category'>,
  size = { w: 1400, h: 1050 },
  extraKeyword?: string
) {
  const base = `https://source.unsplash.com/${size.w}x${size.h}/?`;
  const query = normalizeQuery(
    `${place.name} jaipur ${categoryHint(place.category)}${extraKeyword ? ` ${extraKeyword}` : ''}`
  );
  return `${base}${encodeURIComponent(query)}`;
}
