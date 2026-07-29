# ADR 004 — Day Editor Redesign: Inline Body Map + Toggleable Exercise List

## Status

Accepted

## Context

The day editor screen (`app/plan/[id]/day/[dayId].tsx`) used a modal-based exercise picker. Users had to:
1. Tap "+ Add" to open a modal
2. Search/filter exercises
3. Tap an exercise to add it (modal closes)
4. Repeat for each exercise

This was two screens deep from the body map on the plan detail screen. Users couldn't see how muscle load accumulated while building a workout.

## Decision

We will redesign the day editor as a single-screen layout:

```
┌─────────────────────────────┐
│ ← Back          Save [✓]   │  Header
├─────────────────────────────┤
│     ┌──────┐ ┌──────┐      │
│     │Front │ │ Back │      │  BodyMap (compact, size=110)
│     └──────┘ └──────┘      │
├─────────────────────────────┤
│ 🔍 Search exercises...      │  SearchInput
├─────────────────────────────┤
│ [All] [Chest] [Back] ...    │  MuscleGroupChips
├─────────────────────────────┤
│ ☑ Push Up                  │
│   Chest · Shoulders        │  ExerciseList (toggleable)
│ ☐ Diamond Push Up          │
│   Chest · Triceps          │
└─────────────────────────────┘
```

### Key behaviors

1. **Toggle, not modal-add** — Each exercise row has a checkbox. Tapping toggles it in/out of a local `selectedIds: Set<string>`.
2. **Live body map** — The BodyMap recomputes intensity from the local selection using `computeBodyMapIntensity` (already exists).
3. **Config popover** — When toggling ON an exercise that isn't yet in the day, a small popover appears to set target_sets, target_reps, rest_seconds (defaults: 3, 10, 90).
4. **Batch save** — The "Save" button commits all changes at once:
   - Removes entries that were unchecked
   - Adds new entries that were checked (with their configured values)
   - Preserves existing entries that stayed checked (with their custom values)
5. **No modal** — Everything is inline. No more picker modal.

### Data flow

```
localSelected: Set<string>  ──→  computeBodyMapIntensity()  ──→  BodyMap
       │
       ▼
Save: diff localSelected vs existing entries
  → removeExerciseFromDay() for unchecked
  → addExerciseToDay() for new checked
  → skip entries that stayed checked
```

## Consequences

### Positive

- Users see muscle load accumulate in real-time as they build a workout
- No modal navigation — faster exercise selection
- Body map is always visible, reinforcing the connection between exercises and muscle groups
- Backward compatible — the `BodyMap` and `computeBodyMapIntensity` APIs stay the same

### Negative

- More complex save logic (batch diff instead of single add/remove)
- Screen is denser — need to balance body map size with list visibility
- Config popover adds a small interaction step for new exercises

## Alternatives Considered

1. **Keep modal** — Users couldn't see body map while picking exercises.
2. **Side-by-side layout** — Not enough screen space on mobile.
3. **Bottom sheet picker** — Still hides the body map behind a sheet.
