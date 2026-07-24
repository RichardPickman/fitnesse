# 013 — Settings Screen

**Blockers:** 004

## Objective
A simple settings screen for theme, default rest time, and app info.

## Acceptance
- [ ] Accessible from Home tab (gear icon in header or profile area)
- [ ] **Theme:**
  - "Appearance" section
  - Radio/segmented: System, Light, Dark
  - Persisted to local DB config table (or AsyncStorage)
- [ ] **Default rest time:**
  - Number input with presets (30, 60, 90, 120 seconds)
  - Default: 90s
  - Applied as default when creating new plan exercise entries
- [ ] **Timer sound:**
  - Pick from built-in sounds (just a selector for now — custom files are future)
  - Preview button to hear the sound
- [ ] **App info:**
  - Version number
  - "About Fitnesse" text
  - Link to GitHub repo (in-app browser)
- [ ] **Reset data:**
  - "Delete all workout data" — destructive action with confirmation + triple-tap safeguard
  - Clears all local DB tables + progress photos

## Notes
- Minimal settings — don't bloat
- Theme setting should update immediately (Zustand store re-render)
