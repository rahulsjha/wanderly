import type { PlaceCategory, PriceLevel } from '@/types/wanderly';

export function categoryLabel(category: PlaceCategory): string {
  switch (category) {
    case 'landmark':
      return 'Landmark';
    case 'restaurant':
      return 'Eat';
    case 'cafe':
      return 'Cafe';
    case 'activity':
      return 'Activity';
    case 'shopping':
      return 'Shopping';
  }
}

export function priceScore(price: PriceLevel): number {
  if (price === 'Free') return 0;
  return price.length;
}

export function totalCostLabel(avgScore: number): string {
  if (avgScore <= 0.25) return 'Mostly Free';
  if (avgScore <= 1.25) return 'Budget';
  if (avgScore <= 2.25) return 'Mid-range';
  if (avgScore <= 3.25) return 'Premium';
  return 'Luxury';
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
