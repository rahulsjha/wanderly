export type OpenNowStatus =
  | { kind: 'unknown' }
  | { kind: 'open' }
  | { kind: 'closed' };

function minutesFrom12Hour(h: number, m: number, ampm: 'AM' | 'PM') {
  const hh = h % 12;
  const hour24 = ampm === 'PM' ? hh + 12 : hh;
  return hour24 * 60 + m;
}

function parseTimeToken(token: string): number | null {
  const m = token.trim().match(/(\d{1,2})\s*:\s*(\d{2})\s*(AM|PM)/i);
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  const ampm = m[3].toUpperCase() as 'AM' | 'PM';
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return minutesFrom12Hour(hh, mm, ampm);
}

function isWithinRange(nowMin: number, startMin: number, endMin: number) {
  if (startMin === endMin) return true;
  if (endMin > startMin) return nowMin >= startMin && nowMin <= endMin;
  // Overnight (e.g., 7 PM - 2 AM)
  return nowMin >= startMin || nowMin <= endMin;
}

/**
 * Heuristic parser for the mock `opening_hours` strings in `data/mock_data.json`.
 * Returns open/closed for simple ranges and 24h markers, otherwise `unknown`.
 */
export function getOpenNowStatus(openingHours: string, now = new Date()): OpenNowStatus {
  const raw = openingHours.trim();
  const lower = raw.toLowerCase();

  if (!raw) return { kind: 'unknown' };
  if (lower.includes('open 24 hours')) return { kind: 'open' };
  if (lower.includes('shows at')) return { kind: 'unknown' };

  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Handles: "6:00 AM - 12:00 PM, 3:00 PM - 9:00 PM"
  const segments = raw.split(',').map((s) => s.trim()).filter(Boolean);
  let anyParsed = false;

  for (const seg of segments) {
    const parts = seg.split('-');
    if (parts.length !== 2) continue;
    const start = parseTimeToken(parts[0]);
    const end = parseTimeToken(parts[1]);
    if (start == null || end == null) continue;
    anyParsed = true;
    if (isWithinRange(nowMin, start, end)) return { kind: 'open' };
  }

  if (!anyParsed) return { kind: 'unknown' };
  return { kind: 'closed' };
}
