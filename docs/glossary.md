# Fitnesse — Domain Glossary

## Body Map

| Term | Definition |
|------|------------|
| **Zone key** | A high-level muscle region identifier (e.g., `chest`, `shoulders`, `legs`). Used as the API between exercise data and the body map. |
| **Granular SVG ID** | A specific SVG `<g>` element ID in the body SVGs (e.g., `upper-pectoralis`, `lateral-deltoid`). Multiple granular IDs map to one zone key. |
| **Intensity** | A 0–1 float indicating how much a muscle zone is targeted. 0 = not targeted, 1 = primary target. |
| **Body outline** | The `id="body"` SVG group that draws the anatomical outline/stroke of the figure. Always rendered with stroke color, no fill. |
| **View** | Either `front` or `back`, indicating which side of the body the SVG paths belong to. |

## Muscle Mapping

| Term | Definition |
|------|------------|
| **Muscle group** | A database entity (`muscle_groups` table) with an `svg_zone_key` field linking it to a zone key. |
| **Primary muscle** | The main muscle(s) targeted by an exercise (intensity = 1.0). |
| **Secondary muscle** | Supporting muscle(s) targeted by an exercise (intensity = 0.5). |
| **Exercise-muscle mapping** | The join table (`exercise_muscle_mapping`) linking exercises to muscle groups with a role (primary/secondary). |

## SVG Path Extraction

| Term | Definition |
|------|------------|
| **`body-paths.ts`** | Auto-generated TypeScript file containing extracted `d` attributes from all `<path>` elements in the body SVGs. |
| **`MUSCLE_PATHS`** | Array of `{ id, d, view }` objects, one per granular SVG group. |
| **`MUSCLE_PATH_BY_ID`** | Lookup object mapping SVG ID → its path data for O(1) access. |
| **`BODY_OUTLINE_IDS`** | Array of SVG IDs that represent the body outline (currently just `["body"]`). |
