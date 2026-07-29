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
2. `computeBodyMapIntensity` takes a list of **full Exercise objects** (not just IDs) and computes raw intensity per zone key:
   - For each exercise, look up its `difficulty` → weight (beginner: 0.3, intermediate: 0.6, advanced: 1.0).
   - For each muscle mapping, apply role multiplier (primary: 1.0, secondary: 0.5).
   - **Sum** intensities across multiple exercises targeting the same zone (stacking).
3. The raw intensity is unbounded. `BodyMap` applies a **soft-cap** (`1 - 1/(raw + 1)`) to map it to a 0–1 display value.
4. For each SVG path, look up its zone key via `SVG_ID_TO_ZONE_KEY`, get the intensity, compute fill color via a **blue→green→red gradient**.
5. Render front and back views side by side.

### Coloring

- Intensity 0 → transparent (no highlight).
- Intensity > 0 → soft-capped, then mapped through a 4-stop gradient:
  - 0.00 → blue   (rgb 59, 130, 246)
  - 0.30 → green  (rgb 74, 222, 128)
  - 0.60 → yellow (rgb 250, 204, 21)
  - 1.00 → red    (rgb 239, 68, 68)
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
