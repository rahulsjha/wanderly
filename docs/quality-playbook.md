# Quality Playbook

## Milestones

### M1 — UX System Alignment (2-3 days)
- Normalize spacing/radius/shadow tokens across screens.
- Standardize icon style and text scale hierarchy.
- Validate empty/loading/success/error states per screen.

### M2 — Engineering Hardening (2 days)
- Persisted Zustand store with selector-first access.
- Runtime schema validation for mock/API payloads.
- Add error boundary and retry paths.
- Remove duplicate derived state where possible.

### M3 — Accessibility & Product Safeguards (2 days)
- Full role/label/hint audit.
- 44x44 target audit.
- Reorder alternative actions (move up/down) for assistive tech.
- Add schedule suggestions (10h split, opening-hour conflicts, travel gap hints).

### M4 — Release Process (1 day)
- CI gates active (lint, typecheck, tests).
- PR template enforced.
- Release checklist + changelog process.

## Definition of Done
- No critical lint/type/runtime issues.
- Core user journeys pass smoke tests on iOS + Android.
- Accessibility checklist complete for modified screens.
- Release notes added.
