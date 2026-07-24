# 011 — End of Workout Flow

**Blockers:** 010

## Objective
After the last exercise is completed: celebration animation, workout summary, notes, photo prompt, and save.

## Acceptance
- [ ] After last set of last exercise → brief celebration
  - Green confetti animation (skippable by tap)
  - "Workout Complete!" text
  - Duration: ~2 seconds auto-advance, or tap to skip
- [ ] **Workout Summary screen:**
  - Total duration (formatted: "45 min 12 sec")
  - Exercises completed (e.g., "6/6")
  - Total volume (total reps × weight)
  - Per-exercise quick stats: name, planned sets vs completed sets
- [ ] **Notes prompt:**
  - "How did it feel?" — text input (optional, 1-2 sentences)
  - "How was the energy?" — 1-5 star/tap rating (optional)
- [ ] **Photo prompt:**
  - "Take a progress photo?" — two buttons: "Yes" / "Skip"
  - "Yes" → opens camera (expo-camera) → user takes photo → saved to `progress_photos` table + filesystem
  - "Skip" → dismissed, never prompts again for this session
- [ ] **"Done" button** → saves all data, navigates back to Home tab
- [ ] Session marked as completed in `workout_sessions`

## Notes
- expo-camera for photo capture
- Photos stored in `FileSystem.documentDirectory + 'progress/'` with timestamp filename
- Confetti can use `react-native-confetti-cannon` or a simple custom animation
