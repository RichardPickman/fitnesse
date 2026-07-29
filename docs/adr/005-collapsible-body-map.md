# ADR 005 — Collapsible Body Map on Plan Detail Screen

## Status

Accepted

## Context

The plan detail screen shows a BodyMap for each training day. While visually impressive on first use, seeing the same body map every day for weeks/months becomes redundant. Users must scroll past it to reach the exercise list and "Start Workout" button, adding friction to the daily workflow.

## Decision

We will add a `collapsible` prop to the `BodyMap` component. When enabled:

1. The body map is wrapped in a touchable accordion header
2. Header shows "Muscle Map" label + a chevron icon (▼ when expanded, ▶ when collapsed)
3. Tapping the header toggles expand/collapse with a simple animation
4. Default state is **expanded** — new users see the body map immediately
5. Collapse state is local (per day, per session) — not persisted

### Props added to BodyMap

```typescript
interface BodyMapProps {
  muscleIntensity?: Record<string, number>;
  /** Show as collapsible accordion (default: false) */
  collapsible?: boolean;
  /** Start expanded when collapsible (default: true) */
  defaultExpanded?: boolean;
  /** Width of each body view (front/back) in px (default: 140) */
  size?: number;
}
```

### Plan detail screen changes

Each day's BodyMap gets `collapsible={true}`. The collapse state is managed per day via a `useState<Record<string, boolean>>` map keyed by day ID.

## Consequences

### Positive

- Frequent users can collapse the body map to save scroll space
- New users still see it by default (expanded)
- No persistence needed — lightweight UI affordance
- Backward compatible — existing usage without `collapsible` works unchanged

### Negative

- Slightly more complex BodyMap component
- Collapse state resets on screen re-focus (acceptable — it's a preference, not data)
