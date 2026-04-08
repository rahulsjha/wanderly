export type TimeOfDay = { hour: number; minute: number };

export const DEFAULT_START: TimeOfDay = { hour: 9, minute: 0 };

export function minutesFromTime(t: TimeOfDay): number {
  return t.hour * 60 + t.minute;
}

export function timeFromMinutes(totalMinutes: number): TimeOfDay {
  const clamped = Math.max(0, totalMinutes);
  return { hour: Math.floor(clamped / 60) % 24, minute: clamped % 60 };
}

export function formatTime(t: TimeOfDay): string {
  const h12 = ((t.hour + 11) % 12) + 1;
  const ampm = t.hour >= 12 ? 'PM' : 'AM';
  const mm = String(t.minute).padStart(2, '0');
  return `${h12}:${mm} ${ampm}`;
}

export function addMinutes(t: TimeOfDay, delta: number): TimeOfDay {
  return timeFromMinutes(minutesFromTime(t) + delta);
}

export type TimelineRow = {
  id: string;
  start: TimeOfDay;
  end: TimeOfDay;
  durationMin: number;
  travelGapMinBefore?: number;
};

export function buildTimeline(
  placeIds: string[],
  durationsById: Record<string, number>,
  opts?: { start?: TimeOfDay; travelGapMin?: number }
): { rows: TimelineRow[]; totalDurationMin: number; end: TimeOfDay } {
  const start = opts?.start ?? DEFAULT_START;
  const travelGapMin = opts?.travelGapMin ?? 15;

  let cursor = start;
  const rows: TimelineRow[] = [];

  placeIds.forEach((id, idx) => {
    if (idx > 0) cursor = addMinutes(cursor, travelGapMin);
    const durationMin = durationsById[id] ?? 45;
    const rowStart = cursor;
    const rowEnd = addMinutes(cursor, durationMin);
    rows.push({
      id,
      start: rowStart,
      end: rowEnd,
      durationMin,
      travelGapMinBefore: idx === 0 ? undefined : travelGapMin,
    });
    cursor = rowEnd;
  });

  const totalDurationMin = minutesFromTime(cursor) - minutesFromTime(start);
  return { rows, totalDurationMin, end: cursor };
}
