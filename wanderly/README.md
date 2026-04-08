# Wanderly — Trip Day Planner (UI/UX-focused)

Wanderly is a trip day planner app where users explore points of interest, build a personalized day itinerary with drag-and-drop, and review a clean trip summary.

This repo is structured to prioritize **craft and UI polish** over backend work (mock data only).

## Quick start

```bash
npm install
npx expo start
```

## Screens (required)

- **Explore**: browse + search + filter, add places to plan
- **Place detail (bottom sheet)**: snap points, add/remove, rich info
- **My Plan**: drag-and-drop timeline, auto duration, warnings
- **Trip Summary**: read-only overview + share-looking CTA

## Design plan (uses your attached assets)

See: `docs/design.md`

It maps the provided UI kit screenshots in `assets/screens/` and the images in `assets/images/` to each required Wanderly screen, with component and interaction guidance.

## Architecture

See: `docs/architecture.md`

Highlights:
- Mock data is loaded locally from `data/mock_data.json`.
- Zustand stores the plan as an ordered `placeIds: string[]` (simple, predictable, fast).
- Expo Router provides navigation (tabs + summary modal) and integrates with React Navigation.
- Explore uses FlashList for smooth scrolling; Place Detail is a bottom sheet overlay.
- My Plan uses drag-and-drop reorder and derives the timeline from pure time utilities.

## Tech notes

- Framework: Expo + Expo Router
- Language: TypeScript
- Data: local JSON (no backend)

## What I’d improve with more time

- More nuanced travel time estimation
- Opening-hours conflict detection
- Offline-friendly image pipeline (prefetch + caching strategy)
