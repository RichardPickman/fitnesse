// ---------------------------------------------------------------------------
// Muscle zone key → SVG element id mapping
// ---------------------------------------------------------------------------

// Maps a muscle group's svg_zone_key to the SVG element id in the body SVGs
export const ZONE_KEY_TO_SVG_ID: Record<string, string> = {
  chest: 'chest',
  shoulders: 'shoulders',
  'rear-delts': 'rear-delts',
  biceps: 'biceps-l',
  triceps: 'triceps-l',
  forearms: 'forearms-l',
  abs: 'abs',
  quads: 'quads',
  calves: 'calves',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  lats: 'lats',
  traps: 'traps',
  'lower-back': 'lower-back',
  neck: 'neck',
};

// Maps a muscle group name (as stored in Supabase) to its zone key
export const MUSCLE_NAME_TO_ZONE_KEY: Record<string, string> = {
  Chest: 'chest',
  Shoulders: 'shoulders',
  'Rear Delts': 'rear-delts',
  Biceps: 'biceps',
  Triceps: 'triceps',
  Forearms: 'forearms',
  Abs: 'abs',
  Quads: 'quads',
  Calves: 'calves',
  Glutes: 'glutes',
  Hamstrings: 'hamstrings',
  Lats: 'lats',
  Traps: 'traps',
  'Lower Back': 'lower-back',
  Neck: 'neck',
};

// Which view each zone belongs to
export const ZONE_TO_VIEW: Record<string, 'front' | 'back'> = {
  chest: 'front',
  shoulders: 'front',
  biceps: 'front',
  forearms: 'front',
  abs: 'front',
  quads: 'front',
  calves: 'front',
  neck: 'front',
  'rear-delts': 'back',
  triceps: 'back',
  lats: 'back',
  traps: 'back',
  'lower-back': 'back',
  glutes: 'back',
  hamstrings: 'back',
};

// All known zone keys
export const ALL_ZONE_KEYS = Object.keys(ZONE_KEY_TO_SVG_ID);

/**
 * Resolve a muscle group name to its SVG zone key.
 * Returns null if no mapping exists.
 */
export function muscleNameToZoneKey(name: string): string | null {
  return MUSCLE_NAME_TO_ZONE_KEY[name] ?? null;
}

/**
 * Resolve a zone key to its SVG element id.
 * Returns null if no mapping exists.
 */
export function zoneKeyToSvgId(zoneKey: string): string | null {
  return ZONE_KEY_TO_SVG_ID[zoneKey] ?? null;
}

/**
 * Get the view (front/back) for a given zone key.
 */
export function zoneKeyToView(zoneKey: string): 'front' | 'back' {
  return ZONE_TO_VIEW[zoneKey] ?? 'front';
}
