# 006 — Plans List and Detail

**Blockers:** 003, 004

## Objective
Build the Plans tab — list all user's plans, view plan detail with exercises per day.

## Acceptance
- [ ] Fetches plans from local SQLite (`db.getAllPlans()`)
- [ ] Empty state: illustration + "Create your first plan" CTA
- [ ] Plan list:
  - Cards with plan name, equipment tags (chips), days assigned, last used date
  - Tap → pushes Plan Detail screen
- [ ] Plan Detail screen:
  - Days listed horizontally (or vertically) — Mon, Tue, Wed, etc.
  - Tap a day → scrollable exercise list for that day (name, sets, reps, rest, weight)
  - Body map summary (SVG) showing full-plan muscle coverage
  - "Edit Plan" button → pushes Plan Editor (issue 007)
  - "Duplicate Plan" button
  - "Delete Plan" with confirmation dialog
- [ ] FAB/Create button → pushes Create Plan flow (issue 007)

## Notes
- Body map SVG doesn't need to be pixel-perfect in this issue — just show the muscle regions
- Real-time highlighting of the body map is part of issue 007 (Plan Editor)
