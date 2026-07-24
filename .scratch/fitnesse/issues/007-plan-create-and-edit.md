# 007 — Plan Create and Edit

**Blockers:** 002, 003, 004

## Objective
Build the plan creation and editing screen — the most complex UI in the app. Includes name, equipment filter, day assignment, exercise picker, and real-time body map.

## Acceptance
- [ ] **Step 1 — Basic Info:**
  - Plan name text input
  - Equipment multi-select (chips: bodyweight, dumbbells, barbell, bands, gym)
  - Description (optional text area)
- [ ] **Step 2 — Day Configuration:**
  - 7 day-of-week toggles (Mon-Sun)
  - Tap day → enters exercise editing for that day
  - Days can be toggled on/off
- [ ] **Step 3 — Day Exercise Editor:**
  - Body map (front + back SVG) pinned at top — highlights real-time as exercises are added/removed
  - Exercise list for the selected day:
    - Name, target sets, target reps, rest time, optional weight
    - Reorder (drag handle)
    - Delete (swipe or icon)
    - Superset toggle — link two consecutive exercises as superset pair
  - "Add Exercise" button → opens bottom sheet
- [ ] **Exercise Picker (bottom sheet):**
  - Search bar
  - Filter chips: by muscle group (pre-populated from Supabase)
  - Exercise cards: illustration thumbnail + name + primary muscle
  - Tap to add → exercise appears in the day's list
  - Sheet stays open after adding (add multiple) — swipe down to close
- [ ] **Review & Save:**
  - Summary: days configured, total exercises, total sets
  - Full body map view
  - "Save Plan" → writes to local SQLite, generates version_hash
  - On save: pre-download exercise illustrations to local cache for offline use
- [ ] **Editing existing plan:** loads current data into same flow, "Save" creates new version_hash

## Notes
- This is the biggest UI piece — consider breaking into sub-screens if too long
- Body map SVG files: front.svg and back.svg in `src/assets/`
- Muscle group → SVG zone mapping in `src/utils/muscle-mapping.ts`
- Exercise cache download: use expo-file-system to save illustration URLs to local paths
