# 🧭 Wanderly — A Trip Day Planner App

<p align="center">
  <img src="https://user-images.githubusercontent.com/1259782/260389590-22344a63-630f-41f3-85f3-3c8a1b1c8a0a.png" alt="Wanderly App Screens" width="800"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-Expo-blue?logo=expo" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/State-Zustand-orange" />
  <img src="https://img.shields.io/badge/Navigation-Expo_Router-purple" />
  <img src="https://img.shields.io/badge/Built_In-10_Hours-green" />
</p>

Wanderly is a production-ready React Native mobile app built with Expo that solves the complete travel planning workflow in one place — discover interesting spots, build a realistic day itinerary, reorder stops on the fly, and review the full plan before heading out. The scenario: a traveler arriving in **Jaipur, India** for the day wants a frictionless way to plan their perfect itinerary without juggling five different apps.

This project was built as part of a 10-hour mobile developer challenge, with deliberate focus on engineering quality, UI polish, and product thinking over raw feature count.

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Features at a Glance](#features-at-a-glance)
3. [Setup & Running the App](#setup--running-the-app)
4. [Architecture Overview](#architecture-overview)
5. [State Management — Why Zustand?](#state-management--why-zustand)
6. [Tradeoffs & Prioritization](#tradeoffs--prioritization)
7. [What I'd Do Differently](#what-id-do-differently)
8. [Known Issues & Limitations](#known-issues--limitations)

---

## Problem Statement

Existing travel tools — Google Maps, booking apps, travel blogs — each solve one piece of the puzzle but none connect them. A traveler ends up with five browser tabs, a notes app, and a screenshot folder, manually stitching together a plan that has no sense of time, order, or feasibility.

Wanderly solves the full loop: browse → pick → arrange → verify → go. Every feature decision was made through that lens.

---

## Features at a Glance

**Explore & Filter** — A scrollable list of 35 curated Jaipur places with real-time search (debounced to avoid unnecessary re-filtering on every keystroke) and category chips for Landmarks, Eat, Cafes, Activities, and Shopping. Tag-based filtering within categories is also supported so users can narrow results without losing context.

**Place Detail Bottom Sheet** — Tapping a card opens a draggable bottom sheet with two snap points: a peek view with the essentials, and a full expanded view with description, opening hours, price level, tags, and rating. This was implemented as a bottom sheet rather than a separate screen specifically to preserve scroll position on the Explore list — a small detail that makes the browsing feel continuous and native.

**Itinerary Builder with Dynamic Timeline** — The My Plan screen is the core of the app. It shows all selected places as a vertical timeline with automatically calculated start and end times per stop, 15-minute travel gaps between each, and a running total of duration and estimated cost. The timeline recalculates instantly on every change.

**Drag-and-Drop Reordering** — Stops can be freely reordered with a drag handle. The lifted item, placeholder gap, and smooth repositioning give users clear spatial feedback. Haptic feedback fires on lift and drop.

**Swipe-to-Delete with Undo** — Swiping a timeline item left reveals a delete action. After removal, a 3-second toast appears with an Undo option that restores the item at its original position — preventing accidental deletions from disrupting a carefully ordered plan.

**Scheduling Conflict Detection** — The app parses each place's opening hours and compares them against the calculated visit window. If a stop falls outside opening hours, a warning badge appears inline on that row. Users aren't blocked — they're informed.

**Trip Summary (Finalize)** — A read-only modal showing the complete day at a glance: total stops, total time, cost label, and a category breakdown. It's the final confidence check before execution.

**Persistent Plan** — The plan survives app restarts. Persistence is wrapped in a silent-fail handler so that storage errors (disk full, corrupted data) never crash the app — it simply starts fresh in-memory if storage is unavailable.

---

## Setup & Running the App

### What You Need

Before starting, make sure you have **Node.js v20 or later** and **npm v10 or later** installed. For running on a physical device, download the **Expo Go** app — available on both the iOS App Store and Google Play Store. Alternatively, you can use an iOS Simulator (macOS only, requires Xcode) or an Android Emulator (requires Android Studio).

### Getting Started

Clone the repository and navigate into the project folder, then run `npm install` to pull in all dependencies. This installs the Expo SDK, navigation libraries, Zustand, Zod, Reanimated, Gesture Handler, and everything else the app needs.

### Running the App

Start the Metro bundler with `npx expo start`. Once running, the terminal displays a QR code. Scan it with Expo Go on your phone to open the app instantly. In the terminal, pressing `i` launches an iOS Simulator, `a` launches an Android Emulator, and `w` opens a web preview — though drag-and-drop gestures don't work reliably on web.

If you run into stale module errors or unexpected behavior after pulling new changes, run `npx expo start -c` to clear the Metro cache before starting.

### Verifying the Setup

Once the app opens, a healthy setup should show all 35 place cards on the Explore tab, search filtering in under 300ms, the plan badge updating immediately after adding a place, a calculated timeline on the Summary tab, smooth drag-and-drop reordering, and the plan still intact after closing and reopening the app.

---

## Architecture Overview

The project is structured around a strict separation of concerns — each folder has one responsibility and one owner. No layer reaches across boundaries it doesn't own.

### How the Folders Are Divided

**`app/`** handles all routing via Expo Router's file-based convention. Each file in this folder is a screen. The tab navigator, modal presentation, and route params are all handled declaratively through the file system rather than manually configured navigation stacks. This keeps navigation logic invisible to the rest of the app.

**`components/`** holds all UI, split into two subfolders. `ui/` contains generic, brand-agnostic elements — buttons, badges, loaders — that have no knowledge of Wanderly's domain. `wanderly/` holds domain components that understand the app's data models: place cards, timeline rows, the bottom sheet, the undo toast, and so on. The rule is simple: `wanderly/` components can know what a `Place` is; `ui/` components cannot.

**`lib/`** holds all business logic as pure TypeScript functions with zero React dependencies. The timeline calculation, opening-hours parser, cost label derivation, and formatting utilities all live here. Because these functions are pure — same input always produces the same output, no side effects — they're trivial to test and completely decoupled from the UI.

**`store/`** contains the Zustand store split across two files. `plan-store.ts` defines the state shape and all actions, while `plan-selectors.ts` exports memoized derived selectors such as "is this place already in the plan?" and "what is the total duration?". Co-locating selectors with the store prevents them from being scattered across component files as the codebase grows.

**`data/`** holds the mock JSON file, its Zod validation schema, and a typed export module that validates the data at startup and builds a `placesById` index for O(1) lookups. If validation fails, the app throws a descriptive error listing specific field issues rather than silently loading corrupted data.

**`types/`** is a single file containing every shared TypeScript interface — `Place`, `PlanItem`, `TimeOfDay`, `Category`, and so on. One canonical location for types prevents drift between layers and makes refactoring predictable.

**`constants/`** stores design tokens: the color palette, spacing scale, border radii, and font sizes. These values are referenced throughout the component layer rather than hardcoded inline, so visual consistency is enforced structurally rather than by team convention.

### How Data Flows Through the App

A user action — a tap, swipe, or drag — triggers a callback in a component. That callback calls an action on the Zustand store. The store updates state synchronously and persists to AsyncStorage asynchronously in the background. Components subscribed to the changed slice of state re-render. If the change affects the timeline (a reorder, an add, a remove), the `buildTimeline` function in `lib/time.ts` is called with the new ordered list and returns recalculated start and end times for every stop. The UI reflects the new timeline immediately.

No component fetches its own data. No component owns derived state. Every piece of rendered information traces back to a single source.

---

## State Management — Why Zustand?

Several options were evaluated: Redux Toolkit, React Context with `useReducer`, Jotai, and Zustand.

**Redux Toolkit** was ruled out early. It's the right tool when you have complex async workflows, multiple interacting reducers, and a team that needs time-travel debugging. Wanderly has none of those. The boilerplate cost — action creators, reducers, selectors, thunks — would have consumed two or three hours of a ten-hour build for no meaningful benefit over simpler alternatives.

**React Context** was tempting because it has no extra dependencies. The problem is re-rendering behavior. With Context, every consumer re-renders whenever any part of the context value changes. In Wanderly, the Explore screen has 35 place cards, each of which needs to know whether its place is already in the plan. If that check lives in Context, every add or remove action triggers 35 re-renders simultaneously. Zustand's selective subscriptions mean only the specific card that was affected re-renders.

**Zustand** won for three concrete reasons. First, the API surface is minimal — defining the entire store and all its actions takes roughly fifteen lines, with no ceremony around action types or dispatch. Second, the built-in `persist` middleware required a single additional argument to make the plan survive app restarts, something that would have taken significant custom architecture with Redux or Context. Third, the store can be accessed and called from outside React components entirely, which means utility functions in `lib/` can interact with state without needing to be hooks — and that's what keeps the business logic layer genuinely clean.

The store is also carefully partitioned: only the data a user would want to recover after an app restart — the ordered plan, the wishlist, and the chosen start time — is persisted. The undo state is intentionally excluded because undo is a session-level interaction, not a preference worth saving across sessions.

---

## Tradeoffs & Prioritization

Every decision in a time-constrained build is a resource allocation problem. Here is how the ten hours were allocated and why.

**Core flow over completeness.** The Explore → Add → Reorder → Summarize flow received the majority of attention. A polished, bug-free happy path is more valuable to an evaluator — and to a real user — than ten half-working features. Features that didn't fit within the time window without compromising quality were cut deliberately, not forgotten.

**Expo managed workflow over bare CLI.** The managed workflow eliminates native build configuration entirely. This saved approximately two hours that would have otherwise been spent on Xcode schemes, Android Gradle files, and native module linking. The tradeoff is marginally less control over native code, which is irrelevant for this use case.

**Hardcoded 15-minute travel gaps over a routing API.** Integrating a real directions API would have introduced network dependency, 500ms+ latency on every drag-and-drop reorder, rate limit concerns, and API key management. The hardcoded gap gives the app a realistic feel — Jaipur's popular attractions are genuinely 10–20 minutes apart — while keeping the timeline recalculation instant and fully offline. A real routing engine is the obvious next upgrade, and the architecture already supports it cleanly.

**Bottom sheet over navigation push for place detail.** Opening a new screen for place details would have reset the Explore scroll position and broken the browsing rhythm. The bottom sheet overlay preserves context. The implementation cost was higher than a simple push, but the experience payoff was clearly worth it.

**Conflict warnings over conflict blocking.** When a stop falls outside a place's opening hours, the app shows a warning badge rather than preventing the action. Blocking creates frustration when opening hours are ambiguous or when a user is doing hypothetical planning. Informing without blocking respects user agency — the right default for a first version.

**Undo with a timeout over permanent undo history.** The 3-second undo toast was fast to implement and covers the most common accidental deletion scenario. Permanent undo history across sessions would require storing an action log in AsyncStorage, which adds state complexity and edge cases (what happens when the data changes between sessions?) that weren't worth the time investment here.

---

## What I'd Do Differently

**Real travel time calculation.** Replacing the hardcoded 15-minute gap with live routing data would make the timeline genuinely actionable. The architecture already supports this — the timeline engine accepts a travel gap parameter per stop, so plugging in API-derived times is a localized change that doesn't touch any UI code. This is the single highest-impact upgrade.

**Unit tests for the business logic layer.** The `lib/` directory is already structured as pure functions with no dependencies, which means adding a test suite is straightforward — no mocking, no React Testing Library needed. With more time, high coverage on the timeline engine and opening-hours parser would be the first priority. These are the most critical functions and the easiest to test rigorously.

**Multi-day itinerary support.** The current architecture handles a single day's plan. Extending to multiple days would require restructuring the store from a flat ordered list to a collection of days, each with its own stops and start time. The timeline engine needs no changes — it already operates on an ordered list with a configurable start time. The state layer is the only thing that would need rethinking.

**Full accessibility audit.** Basic accessibility labels and roles are set on interactive elements, and touch targets meet the 44×44pt minimum. But the drag-and-drop functionality has not been tested with VoiceOver or TalkBack, and dynamic type scaling hasn't been verified across all components. A proper screen reader audit would surface a meaningful set of gaps that a v1 release should close.

**Share Plan functionality.** The button exists on the finalize screen but isn't wired up. The implementation path is clear — render the timeline view as an image and pass it to the system share sheet. This is a high-visibility, low-effort feature that would have been the very next thing built with another hour available.

**Image caching.** Place images currently load on demand as the user scrolls. Pre-caching them on first launch would eliminate the white-flash placeholder on slower connections and make the Explore list feel noticeably more polished during initial scroll.

---

## Known Issues & Limitations

**Opening hours parsing accuracy is approximately 70%.** The mock data contains opening hours in several inconsistent formats — 12-hour AM/PM notation, 24-hour format, plain text like "24 Hours", and some entries left blank. The parser handles the most common patterns but doesn't cover every variation, which means conflict detection occasionally misses real conflicts or generates false ones. The fix is normalizing the data at import time and expanding the parser's pattern coverage with a more complete test matrix.

**Drag performance degrades slightly beyond 35 items.** The draggable list library re-renders all items during a drag gesture. With the current 35-place dataset this is imperceptible, but adding significantly more items would introduce noticeable jank on mid-range devices. For the scope of this project it's a non-issue, but a production version serving a full city's worth of places would need a virtualized drag implementation.

**No tablet-specific layout.** The UI is designed and optimized for phones. On tablets, cards and timeline rows stretch wider than intended and the layout feels sparse. A responsive design with a two-column Explore grid and a side-by-side plan view would be the right tablet experience, but it was explicitly out of scope for a phone-first MVP.

**Undo is session-only.** After removing a place, the undo action is available for three seconds within the current session. Once the app is closed or the timeout expires, removed items cannot be recovered. This is an intentional design decision for v1, but worth calling out for users who close the app frequently mid-planning.

**"Share Plan" button is non-functional.** The UI element is fully designed and visible on the finalize screen, but tapping it currently does nothing. This is a known stub — it communicates product intent — and the wiring is a straightforward follow-up task, not a forgotten bug.

**No true offline sync.** The app works entirely offline using its persisted in-memory state. However, if a backend were introduced in a future version, there is no sync mechanism to reconcile local changes made while offline with a remote server. The current architecture would need a conflict resolution strategy before backend integration.

---

*Built with care for the traveler who wants one less thing to figure out. 🗺️*
