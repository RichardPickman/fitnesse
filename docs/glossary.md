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

## Exercise Library Sync

| Term | Definition |
|------|------------|
| **Seed bundle** | Hardcoded TypeScript file (`src/db/seed-exercises.ts`) containing ~20 bodyweight exercises, 6 muscle groups, and their mappings. Used to bootstrap the local DB on first launch with no network. |
| **Delta sync** | A sync that only fetches exercises where `updated_at >= last_synced_at`, avoiding re-downloading unchanged data. |
| **Cursor-based pagination** | Pagination using the `updated_at` of the last item in a page as the cursor for the next page. More reliable than offset-based pagination on mobile. |
| **`last_synced_at`** | A timestamp stored in the `app_metadata` table indicating when the last successful cloud sync completed. Used for delta sync. |
| **`app_metadata`** | A key-value SQLite table for storing app-level metadata like `last_synced_at`. |
| **Sync screen** | A modal screen (`/sync`) where the user can manually trigger a cloud sync and see progress. |
