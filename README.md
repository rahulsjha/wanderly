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

## Tech notes

- Framework: Expo + Expo Router
- Language: TypeScript
- Data: local JSON (no backend)

## What I’d improve with more time

- More nuanced travel time estimation
- Opening-hours conflict detection
- Offline-friendly image pipeline (prefetch + caching strategy)
