import { categoryLabel, priceScore, totalCostLabel } from '@/lib/format';
import type { Place, PlaceCategory } from '@/types/wanderly';

const CATEGORY_ORDER: PlaceCategory[] = ['landmark', 'restaurant', 'cafe', 'activity', 'shopping'];

export function buildDurationsById(placeIds: string[], placeMap: Record<string, Place>): Record<string, number> {
  const durations: Record<string, number> = {};
  for (const id of placeIds) {
    durations[id] = placeMap[id]?.estimated_duration_min ?? 45;
  }
  return durations;
}

export function buildBreakdownText(placeIds: string[], placeMap: Record<string, Place>, separator = ' · '): string {
  const counts: Partial<Record<PlaceCategory, number>> = {};

  for (const id of placeIds) {
    const place = placeMap[id];
    if (!place) continue;
    counts[place.category] = (counts[place.category] ?? 0) + 1;
  }

  const parts: string[] = [];
  for (const category of CATEGORY_ORDER) {
    const count = counts[category] ?? 0;
    if (!count) continue;
    parts.push(`${count} ${categoryLabel(category)}${count > 1 ? 's' : ''}`);
  }

  return parts.length ? parts.join(separator) : '—';
}

export function buildCostLabel(placeIds: string[], placeMap: Record<string, Place>): string {
  if (!placeIds.length) return '—';

  const avgScore =
    placeIds.map((id) => priceScore(placeMap[id]?.price_level ?? '$')).reduce((sum, score) => sum + score, 0) /
    Math.max(1, placeIds.length);

  return totalCostLabel(avgScore);
}
