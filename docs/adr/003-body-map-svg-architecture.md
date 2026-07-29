# ADR 003: SVG Body Map — Path Extraction & Coloring Architecture

## Status

Accepted

## Context

The app needs a visual body map that highlights muscle groups based on workout data. The existing `BodyMap.tsx` used hand-crafted SVG paths that were crude approximations of human anatomy. We have two detailed SVGs (`body-front.svg`, `body-back.svg`) with granular muscle group elements (e.g., `upper-pectoralis`, `lateral-deltoid`, `medial-hamstrings`).

The problem: React Native's `react-native-svg` cannot render `<use>` elements or external SVG files directly. We need to extract the path data from the SVGs and render them as inline `<Path>` components.

## Decision

We will:

1. **Extract path data** from the SVGs into a TypeScript module (`src/assets/body-paths.ts`) using a build-time script.
2. **Map granular SVG IDs to zone keys** via `src/utils/muscle-mapping.ts` (already exists).
3. **Render paths inline** using `react-native-svg`'s `<Path>` component, coloring each muscle group based on intensity data.
4. **Compute intensity** from the exercise store's muscle group mappings — each exercise targets muscle groups, and we aggregate across a plan day to produce a `Record<zoneKey, intensity>`.

## Architecture

```
body-front.svg ─┐
                ├──→ extract-body-paths.ts (build script) ──→ src/assets/body-paths.ts
body-back.svg  ─┘                                              │
                                                               │ exports MUSCLE_PATHS[]
                                                               │         MUSCLE_PATH_BY_ID{}
                                                               ▼
                                                    BodyMap.tsx (rewritten)
                                                         │
                                                         │ uses
                                                         ▼
                                              src/utils/muscle-mapping.ts
                                              (SVG_ID_TO_ZONE_KEY, ZONE_KEY_TO_SVG_IDS)
```

### Data Flow

1. `useExerciseStore` loads exercises, muscle groups, and mappings from Supabase.
2. A new hook `computeBodyMapIntensity` (or inline logic) takes a list of exercise IDs and computes intensity per zone key:
   - For each exercise, look up its primary/secondary muscle groups.
   - Map each muscle group's `svg_zone_key` to granular SVG IDs via `ZONE_KEY_TO_SVG_IDS`.
   - Aggregate: primary = intensity 1.0, secondary = intensity 0.5.
3. `BodyMap` receives `muscleIntensity: Record<string, number>` (zone key → 0–1).
4. For each SVG path, look up its zone key via `SVG_ID_TO_ZONE_KEY`, get the intensity, compute fill color.
5. Render front and back views side by side.

### Coloring

- Intensity 0 → transparent (no highlight).
- Intensity > 0 → `rgba(74, 222, 128, alpha)` where `alpha = min(intensity * 0.6, 0.6)`.
- The body outline paths (`id="body"`) are always rendered with `stroke="#484a68"` and no fill.

## Consequences

### Positive

- Accurate anatomical representation from the detailed SVGs.
- Granular muscle group highlighting (e.g., upper vs lower chest, medial vs lateral hamstrings).
- Backward compatible — the `muscleIntensity` prop API stays the same.
- Build-time extraction means no runtime SVG parsing.

### Negative

- The `body-paths.ts` file is large (~60KB) due to the detailed path data.
- Adding new SVG elements requires regenerating the paths file.
- The SVGs use `currentColor` for fill, which we replace with computed colors.

## Alternatives Considered

1. **Render SVGs as images** — couldn't color individual muscle groups.
2. **Use `<use>` elements** — not supported by `react-native-svg`.
3. **Parse SVGs at runtime** — unnecessary complexity, slower startup.
4. **Keep hand-crafted paths** — inaccurate anatomy, poor UX.
