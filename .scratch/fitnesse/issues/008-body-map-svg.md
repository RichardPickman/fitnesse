# 008 — Body Map SVG

**Blockers:** 007

## Objective
Create the front + back SVG body map illustrations and implement the muscle highlight system.

## Acceptance
- [ ] `src/assets/body-front.svg` — front view human figure with identifiable muscle zone regions
- [ ] `src/assets/body-back.svg` — back view human figure with identifiable muscle zone regions
- [ ] Muscle zones are identifiable by SVG element id (e.g., `#chest`, `#lats`, `#quads`)
- [ ] Zone mapping file: `src/utils/muscle-mapping.ts`:
  - Maps muscle_group.svg_zone_key → SVG element id
  - Maps muscle_group name → SVG zone key
- [ ] `BodyMap` React component:
  - Props: `muscleIntensity: Record<string, number>` (muscle zone key → 0-1 intensity)
  - Renders front + back SVGs side by side
  - Highlights zones based on intensity (color overlay: more intense = brighter)
  - Supports dark + light mode (different base colors)
- [ ] `BodyMap` component used in Plan Editor (issue 007) and Plan Detail (issue 006)
- [ ] No highlights by default (show base figure only)

## Notes
- SVGs should be clean, minimalist — not photorealistic
- Can use a free SVG body template and adapt
- Color scheme: lime-green accent highlights on dark, darker accents on light
