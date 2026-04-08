# Wanderly — UI/UX Design Plan (asset-referenced)

This document translates the provided UI kit assets into an **award-level, shippable UI plan** for the Wanderly challenge.

## Reference library (what to copy + how to adapt)

These images are your north star for spacing, hierarchy, and visual language:

### Explore / Browse places
- `assets/screens/Home.png` → top header composition, hero + quick actions
- `assets/screens/Search.png` → search field styling + results rhythm
- `assets/screens/Popular Places.png` → place card layout + list density
- `assets/screens/Popular Places.png` + `assets/screens/Favorite Places.png` → “saved/added” state patterns

### Place Detail (Bottom Sheet)
- `assets/screens/Details.png` → large hero image, info blocks, CTA placement
- `assets/screens/Pop Up.png` → sheet-like layering and dim backdrop feel

### My Plan (Itinerary Builder)
- `assets/screens/Schedule.png` → timeline structure + time labels
- `assets/screens/View.png` → clean read-only itinerary presentation

### Trip Summary
- `assets/screens/View.png` → summary layout, “final plan” tone
- `assets/screens/All Popular Trip Package.png` → sectioning + grouped information blocks

### Optional polish (not required by challenge)
- `assets/screens/Splash.png` + `assets/screens/Onboard-1.png` / `Onboard-2.png` / `Onboard-3.png` → brand + onboarding motion direction

## Image assets (how we’ll use them)

Use these local images for a cohesive product feel (even if the mock data includes `picsum` URLs):

### Backgrounds
- `assets/images/bg_2.png` → Explore header background (subtle)
- `assets/images/bg_3.png` → Summary modal background (subtle)

### Place imagery (offline-friendly placeholders)
- `assets/images/dest_1.png` … `assets/images/dest_13.png`
  - Used as **fallback images** when remote loading is slow, and for skeleton states.
  - Mapped by place `id` modulo 13 (keeps it deterministic without changing mock JSON).

### Avatars / social icons (optional)
- `assets/images/face.png` + `assets/images/face_icon*.png` → “traveler” avatar placeholder (header)
- `assets/images/twitter_icon.png` → “Share plan” icon (non-functional)

## Visual direction (Jaipur-coded, modern, premium)

**Mood**: warm sandstone + modern teal accents. The UI should feel like a boutique travel app, not a utility.

### Design principles
1. **Scan-first**: every card reads in 1–2 seconds (name → category → rating → duration → CTA).
2. **One primary action per surface**: Explore = Add, Detail = Add/Remove, Plan = Reorder, Summary = Share.
3. **Motion is feedback**: sheets glide, cards respond, drag feels “physical”.
4. **Confident whitespace**: generous padding, consistent rhythm, no clutter.

### Type scale (iOS-first, but cross-platform safe)
- Screen title: 28–32, `Fonts.rounded`
- Section title: 18–20, `Fonts.rounded`
- Body: 14–16, `Fonts.sans`
- Meta (badges/time): 12–13, `Fonts.sans`

### Layout tokens (implementation targets)
- Spacing: 8 / 12 / 16 / 24
- Card radius: 16
- Chip radius: 999
- Touch target min: 44px
- Shadows: iOS subtle (y=8 blur=20), Android elevation 2–3

## Screen-by-screen implementation ideas

### Screen 1 — Explore (Browse Places)

**Goal**: let users build a plan quickly without opening details.

**Top area**
- Header: “Jaipur” + subtext “Plan your day”
- Search bar: matches `assets/screens/Search.png`
- Category chips (horizontal): All, Landmarks, Eat, Cafes, Activities, Shopping
- Sticky plan badge: pill with count (e.g., “Plan · 3”) anchored top-right

**Results list**
- Use a performant list (FlashList recommended).
- Card anatomy (based on `assets/screens/Popular Places.png`):
  - Left: image (remote with local fallback)
  - Right: name (2 lines max), category badge, rating (star), duration
  - CTA: “Add” button; becomes “Added” (filled) with checkmark when in plan

**Micro-interactions**
- Add: quick scale + haptic
- Already added: card has subtle border highlight + small check badge

**Edge states**
- 0 results → friendly empty state + “Clear filters”
- Loading → shimmer skeleton using card shape

---

### Screen 2 — Place Detail (Bottom Sheet; not a route)

**Goal**: deeper context and a decisive Add/Remove.

**Bottom sheet behavior**
- Two snap points: **peek** (40%) and **full** (90%)
- Backdrop dim; tap outside to dismiss

**Content hierarchy (from `assets/screens/Details.png`)**
1. Hero image (full width)
2. Title + rating
3. Quick facts row: duration, price level, opening hours
4. Tags (chips)
5. Description (max 6–8 lines before “Read more”)
6. Primary CTA pinned: Add/Remove (large, full width)

**Polish**
- Haptic on open + on snap
- Smooth image placeholder (fade-in)

---

### Screen 3 — My Plan (Itinerary Builder)

**Goal**: turn selected places into a believable day.

**Structure (inspired by `assets/screens/Schedule.png`)**
- Top summary card: total stops, total time, start time (9:00 AM default)
- Vertical timeline list:
  - Order number
  - Place name + category
  - Start time → end time (derived)
  - “Travel gap” row between items (e.g., 15 min) — can be mocked but consistent

**Drag-and-drop**
- Drag handle on the left; on drag the item lifts (shadow) + slight scale
- Placeholder gap shows where it will land
- Haptic tick on reorder settle

**Safety rails**
- If total duration > 10 hours → warning banner (warm tone, not scary)
- Remove action: swipe-to-delete + undo toast

**Empty state**
- Strong guidance: illustration + “Browse places” button that switches to Explore

---

### Screen 4 — Trip Summary (read-only)

**Goal**: make the plan feel “final” and share-worthy.

**Layout (from `assets/screens/View.png`)**
- Header: “Your Jaipur Day” + total stops + total time
- Timeline with times and stop blocks (no drag)
- Category breakdown row: “3 Landmarks · 2 Eat · 1 Activity”
- Cost indicator: derived from `price_level` (e.g., $=low, $$=mid, $$$=high)
- CTA: “Share Plan” button (can be non-functional but real-looking)

**Nice-to-have polish**
- Staggered fade-in of timeline items
- Tiny static map card (non-interactive)

## Component checklist (build once, reuse everywhere)

- `SearchBar`
- `CategoryChips`
- `PlaceCard`
- `AddToPlanButton`
- `PlanCountBadge`
- `PlaceDetailSheet`
- `TimelineItem`
- `SummaryBanner`
- `Toast` (undo)

## Accessibility + craft notes

- All CTAs meet 44px minimum hit target.
- Labels: Add/Remove buttons include place name in accessibilityLabel.
- Contrast: ensure chip text passes WCAG-ish contrast (especially in dark mode).
- Long names: clamp lines + keep meta readable.

## Design definition of done

A build is “design-complete” when:
- Explore feels fast, readable, and joyful with 35 items.
- Bottom sheet interactions are smooth and intentional.
- Drag-and-drop feels physical and predictable.
- Summary looks like something users would actually share.
