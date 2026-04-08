# Wanderly — Architecture (Expo Router + TypeScript)

This app is intentionally **frontend-only**: it loads local mock data and manages the plan in-memory.

## Tech stack

- **React Native + Expo CLI** (Expo Router)
- **TypeScript** (strict)
- **State**: Zustand (small, predictable, no boilerplate)
- **Navigation**: Expo Router (built on React Navigation)
- **Lists**: FlashList for Explore performance
- **Bottom sheet**: @gorhom/bottom-sheet (detail overlay)
- **Drag-and-drop**: react-native-draggable-flatlist

## Folder structure

- `app/`
  - `(tabs)/index.tsx` → Explore (browse/search/filter + detail sheet)
  - `(tabs)/plan.tsx` → My Plan (timeline + drag reorder + warnings)
  - `summary.tsx` → Trip Summary modal
- `data/`
  - `mock_data.json` → provided challenge data
  - `mock-data.ts` → typed exports + `placesById`
- `store/`
  - `plan-store.ts` → in-memory itinerary state
- `lib/`
  - `time.ts` → timeline calculation (start/end times)
  - `format.ts` → labels + formatting + cost heuristic
  - `place-assets.ts` → local image fallbacks mapping
- `components/wanderly/`
  - UI primitives used across screens (cards, chips, buttons, toast)

## Data flow (end-to-end)

1. `data/mock_data.json` loads locally via `data/mock-data.ts`.
2. Explore reads `PLACES` and filters them in-memory (no API).
3. “Add to Plan” updates `store/plan-store.ts` (`placeIds: string[]`).
4. My Plan uses `placeIds` + durations to build a deterministic timeline using `lib/time.ts`.
5. Trip Summary derives read-only output (timeline + breakdown + cost label) from the same source-of-truth.

## State model (why it scales)

- The plan is stored as **ordered IDs** instead of duplicating full place objects.
- Place lookups use `placesById` to keep UI fast and consistent.
- Reordering is a simple `reorder(nextIds)` action.
- Undo is modeled as `lastRemoved` with `undoRemove()` to keep logic simple and testable.

## UI/UX implementation notes

- Explore uses:
  - **sticky-like header** (hero + search + category chips)
  - performance-friendly list (FlashList)
  - bottom-sheet detail overlay (required by spec)
- My Plan uses:
  - **timeline mental model** (time blocks + travel gaps)
  - drag-and-drop feedback + undo toast
  - warning banner when total duration > 10 hours
- Trip Summary is:
  - a modal with clean typography and a share-looking CTA

## Known tradeoffs (intentional)

- Travel time is a constant gap (15 min) to keep UI deterministic and avoid fake precision.
- Opening-hours conflict detection is not implemented (nice-to-have).
- Images use `picsum` with a local fallback mapping to avoid empty states.
