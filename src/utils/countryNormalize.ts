/**
 * Country Name Normalization
 *
 * Since geojsonto3D v2 (globe@0.5.4+), GLB mesh names match API names directly.
 * This file provides compatibility functions that pass through names unchanged.
 *
 * The mapping is now handled at the source level in:
 * tools/geojsonto3D/data/country_name_mapping.json
 */

/**
 * Normalize a country name from API format to GLB mesh format
 * Since mesh names now match API names, this just lowercases and trims.
 */
export function normalizeToGlobe(apiName: string): string {
  return apiName.toLowerCase().trim();
}

/**
 * Normalize a country name from GLB format to API format
 * Since mesh names match API names, this is a simple passthrough.
 */
export function normalizeToApi(globeName: string): string {
  return globeName.toLowerCase().trim();
}

/**
 * Normalize a CountryDataMap - now just lowercases keys for consistency
 */
export function normalizeCountryDataMap<T extends Record<string, unknown>>(
  data: T
): T {
  const normalized = {} as T;

  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().trim();
    (normalized as Record<string, unknown>)[normalizedKey] = value;
  }

  return normalized;
}

/**
 * Build multiple lookup keys for a country name
 * Returns array of possible keys for flexible matching
 */
export function getCountryLookupKeys(name: string): string[] {
  const lower = name.toLowerCase().trim();
  const keys = [lower];

  // Add underscore version (used by globe mesh names)
  keys.push(lower.replace(/\s+/g, '_'));

  // Add no-space version
  keys.push(lower.replace(/\s+/g, ''));

  return [...new Set(keys)]; // Remove duplicates
}
