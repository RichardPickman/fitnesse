# 005 — Home Tab

**Blockers:** 003, 004

## Objective
Build the Home tab screen: today's workout card, quick stats, start/resume workout logic.

## Acceptance
- [ ] Greeting + date displayed at top
- [ ] Logic resolves "today's workout" from the plan that has a matching day_of_week
- [ ] If matching day found:
  - Card shows: plan name, day name, exercise count, estimated duration
  - "Start Workout" button → navigates to Workout Player (issue 010)
- [ ] If rest day:
  - Card shows "Rest 🌿" with subtle text: "Update your plans to add workouts"
- [ ] Quick stat cards below main card:
  - Last session: volume, duration, exercises done
  - If no sessions yet: subtle "No workouts yet" state
- [ ] If an incomplete session exists (started but not finished):
  - "Resume Workout" button appears instead of "Start Workout"

## Notes
- Use Zustand store for "current exercise state" — whether a session is in progress
- Theme respect (dark/light) throughout
