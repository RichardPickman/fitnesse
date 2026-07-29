// ---------------------------------------------------------------------------
// Muscle zone key ↔ granular SVG element id mapping
// ---------------------------------------------------------------------------
//
// The new SVGs (body-front.svg, body-back.svg) have granular muscle groups.
// Each DB-level zone key maps to one or more SVG element IDs.
// Old granular keys (biceps, triceps, quads, etc.) kept as aliases.
// ---------------------------------------------------------------------------

// Maps each granular SVG element ID → its parent zone key
export const SVG_ID_TO_ZONE_KEY: Record<string, string> = {
  // ── Chest ────────────────────────────────────────────────────────────────
  'upper-pectoralis': 'chest',
  'mid-lower-pectoralis': 'chest',

  // ── Shoulders ────────────────────────────────────────────────────────────
  'anterior-deltoid': 'shoulders',
  'lateral-deltoid': 'shoulders',
  'posterior-deltoid': 'shoulders',

  // ── Back ─────────────────────────────────────────────────────────────────
  'upper-trapezius': 'back',
  'lower-trapezius': 'back',
  'traps-middle': 'back',
  lats: 'back',
  lowerback: 'back',

  // ── Arms ─────────────────────────────────────────────────────────────────
  'long-head-bicep': 'arms',
  'short-head-bicep': 'arms',
  'long-head-triceps': 'arms',
  'medial-head-triceps': 'arms',
  'lateral-head-triceps': 'arms',
  'wrist-extensors': 'arms',
  'wrist-flexors': 'arms',

  // ── Core ─────────────────────────────────────────────────────────────────
  'upper-abdominals': 'core',
  'lower-abdominals': 'core',
  obliques: 'core',

  // ── Legs ─────────────────────────────────────────────────────────────────
  'rectus-femoris': 'legs',
  'outer-quadricep': 'legs',
  'inner-quadricep': 'legs',
  'inner-thigh': 'legs',
  'medial-hamstrings': 'legs',
  'lateral-hamstrings': 'legs',
  'gluteus-maximus': 'legs',
  'gluteus-medius': 'legs',
  gastrocnemius: 'legs',
  soleus: 'legs',
  tibialis: 'legs',

  // ── Other ────────────────────────────────────────────────────────────────
  neck: 'neck',
  feet: 'feet',
  groin: 'groin',
  hands: 'hands',
};

// Reverse: zone key → array of granular SVG IDs
export const ZONE_KEY_TO_SVG_IDS: Record<string, string[]> = {};

for (const [svgId, zoneKey] of Object.entries(SVG_ID_TO_ZONE_KEY)) {
  if (!ZONE_KEY_TO_SVG_IDS[zoneKey]) {
    ZONE_KEY_TO_SVG_IDS[zoneKey] = [];
  }
  ZONE_KEY_TO_SVG_IDS[zoneKey].push(svgId);
}

// Old granular zone keys → SVG IDs (backward compat)
export const ZONE_KEY_TO_SVG_ID: Record<string, string> = {
  chest: 'upper-pectoralis',
  shoulders: 'anterior-deltoid',
  'rear-delts': 'posterior-deltoid',
  biceps: 'long-head-bicep',
  triceps: 'long-head-triceps',
  forearms: 'wrist-extensors',
  abs: 'upper-abdominals',
  quads: 'rectus-femoris',
  calves: 'gastrocnemius',
  glutes: 'gluteus-maximus',
  hamstrings: 'medial-hamstrings',
  lats: 'lats',
  traps: 'upper-trapezius',
  'lower-back': 'lowerback',
  neck: 'neck',
};

// Maps a muscle group name (as stored in Supabase) to its zone key
export const MUSCLE_NAME_TO_ZONE_KEY: Record<string, string> = {
  Chest: 'chest',
  Shoulders: 'shoulders',
  Back: 'back',
  Arms: 'arms',
  Core: 'core',
  Legs: 'legs',
  Neck: 'neck',
};

// Which SVG IDs appear in each view
export const VIEW_SVG_IDS: Record<'front' | 'back', string[]> = {
  front: [
    'upper-pectoralis',
    'mid-lower-pectoralis',
    'anterior-deltoid',
    'lateral-deltoid',
    'long-head-bicep',
    'short-head-bicep',
    'wrist-extensors',
    'wrist-flexors',
    'upper-abdominals',
    'lower-abdominals',
    'obliques',
    'rectus-femoris',
    'outer-quadricep',
    'inner-quadricep',
    'inner-thigh',
    'gastrocnemius',
    'soleus',
    'tibialis',
    'upper-trapezius',
    'neck',
    'feet',
    'groin',
    'hands',
  ],
  back: [
    'posterior-deltoid',
    'lateral-deltoid',
    'long-head-triceps',
    'medial-head-triceps',
    'lateral-head-triceps',
    'wrist-extensors',
    'wrist-flexors',
    'medial-hamstrings',
    'lateral-hamstrings',
    'gluteus-maximus',
    'gluteus-medius',
    'lowerback',
    'lats',
    'lower-trapezius',
    'traps-middle',
    'upper-trapezius',
    'neck',
    'feet',
    'hands',
    'inner-thigh',
    'gastrocnemius',
    'soleus',
  ],
};


// Zone key → view (for backward compat)
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
  back: 'back',
  arms: 'front',
  core: 'front',
  legs: 'front',
};

// All known zone keys (deduplicated)
export const ALL_ZONE_KEYS = [...new Set(Object.values(SVG_ID_TO_ZONE_KEY))];

// All known granular SVG IDs
export const ALL_SVG_IDS = Object.keys(SVG_ID_TO_ZONE_KEY);

/**
 * Resolve a muscle group name to its zone key.
 * Returns null if no mapping exists.
 */
export function muscleNameToZoneKey(name: string): string | null {
  return MUSCLE_NAME_TO_ZONE_KEY[name] ?? null;
}

/**
 * Resolve a zone key to its primary SVG element id.
 * Returns null if no mapping exists.
 */
export function zoneKeyToSvgId(zoneKey: string): string | null {
  return ZONE_KEY_TO_SVG_ID[zoneKey] ?? null;
}

/**
 * Resolve a zone key to all its granular SVG element ids.
 * Returns empty array if no mapping exists.
 */
export function zoneKeyToSvgIds(zoneKey: string): string[] {
  return ZONE_KEY_TO_SVG_IDS[zoneKey] ?? [];
}

/**
 * Get the view (front/back) for a given zone key.
 */
export function zoneKeyToView(zoneKey: string): 'front' | 'back' {
  return ZONE_TO_VIEW[zoneKey] ?? 'front';
}

/**
 * Get the view for a granular SVG element ID.
 */
export function svgIdToView(svgId: string): 'front' | 'back' {
  if (VIEW_SVG_IDS.front.includes(svgId)) return 'front';
  if (VIEW_SVG_IDS.back.includes(svgId)) return 'back';
  return 'front';
}

