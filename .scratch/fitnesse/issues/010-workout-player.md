# 010 — Workout Player

**Blockers:** 003, 005, 009

## Objective
Build the full-screen workout player — the core experience. Exercise display, set tracking, rest timer, progress.

## Acceptance
- [ ] Full-screen modal pushed over tab bar when "Start Workout" tapped
- [ ] **Exercise display:**
  - Exercise name (large, bold)
  - Exercise illustration (from local cache, or placeholder)
  - Sets counter (e.g., "Set 2/3")
  - Target reps (tappable → adjusts actual reps for this set only)
  - Weight display (if applicable, otherwise hidden)
  - Rest target time displayed
- [ ] **Complete Set button:**
  - Tap → logs set (reps_actual = target or adjusted), increments set counter
  - Button label changes based on state (Complete Set, Skip Rest, Start Set, Next Exercise)
- [ ] **Rep adjustment:**
  - Tap on reps number → opens quick numpad/scroll input
  - Adjusted value is for this set only — does not change plan targets
- [ ] **Rest timer:**
  - Appears after "Complete Set" for non-final sets
  - Timer starts manually (user taps "Start Rest" or similar)
  - Large countdown display
  - "Skip Rest" small button to cut rest short
  - Sound/vibration on timer end (expo-av for sound)
- [ ] **Final set of exercise:**
  - After completing last set → button becomes "Next Exercise" (no rest)
- [ ] **Skip set:**
  - "Skip remaining sets" small text button → skips to next exercise, logs 0 reps for remaining sets
- [ ] **Progress bar:**
  - Bottom of screen shows overall session progress (e.g., "Exercise 3/8 · 65%")
- [ ] **Exit / Back:**
  - Back button → confirmation dialog: "End workout early? Unsaved progress will be lost." (or "Save progress?")
- [ ] **Supersets:**
  - If exercise has a superset_group, after completing it → immediately shows paired exercise (no rest)
  - Rest timer fires after both superset exercises are done
- [ ] **Data persistence:**
  - Session saved to `workout_sessions` and `set_logs` tables on completion
  - Partial saves on app suspend? (Future — not required in v1)
- [ ] **Offline:** fully functional without internet

## Notes
- This is the heart of the app — get the UX right
- Timer sound: use a simple built-in beep or melody (expo-av with bundled audio file)
- State machine for workout flow: EXERCISE → REST → NEXT_SET | NEXT_EXERCISE → COMPLETE
