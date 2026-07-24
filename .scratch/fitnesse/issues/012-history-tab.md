# 012 — History Tab

**Blockers:** 003, 004

## Objective
Build the History tab: session list, session detail, and progress photo access.

## Acceptance
- [ ] **Session list:**
  - Chronological list (most recent first)
  - Each row: date (formatted), plan name, duration, exercises count
  - Tap → pushes session detail screen
  - Empty state: "No workouts yet" with subtle prompt to start
  - Pagination: load 20, load more on scroll to bottom
- [ ] **Session detail screen:**
  - Session date + time
  - Plan name + version hash (subtle, not screaming)
  - Exercise list with each set logged (reps_actual vs target)
  - Notes text and rating (if provided)
  - Thumbnails of photos taken that session (tap to view full-screen)
- [ ] **Progress Photos screen:**
  - Accessible from History tab (header button or tab)
  - Grid of all progress photos, grouped by month
  - Tap photo → full-screen view with date overlay
  - Pinch-to-zoom on full-screen
  - Compare mode: side-by-side with another photo (future — not in v1)
- [ ] **Delete session:** swipe or long-press → confirmation dialog → removes session + associated photos

## Notes
- Photos are local file paths — use expo-file-system to verify they still exist before showing thumbnail
- Use `expo-image` for efficient image loading
- Pagination is simple offset-based
