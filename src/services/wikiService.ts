/**
 * Wiki Service - Fetch Wikipedia data from Pythagoras API
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export interface WikiPortal {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  keywords?: string[];
  description?: string;
}

export interface WikiCountryData {
  scale: number;
  lat: number | null;
  lon: number | null;
  color?: string;
  articleCount?: number;
}

export type WikiDataMap = Record<string, WikiCountryData>;

/**
 * Fetch wiki portals (categories)
 */
export async function fetchWikiPortals(): Promise<WikiPortal[]> {
  try {
    const response = await fetch(`${API_BASE}/api/wiki/portals`);
    if (!response.ok) throw new Error('Failed to fetch portals');

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Wiki portals fetch error:', error);
    return [];
  }
}

/**
 * Fetch wiki data for globe visualization
 */
export async function fetchWikiData(query?: string, portalIds?: number[]): Promise<WikiDataMap> {
  const url = new URL(`${API_BASE}/api/wiki/data`);
  if (query) url.searchParams.set('query', query);
  if (portalIds?.length) url.searchParams.set('portals', portalIds.join(','));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed: ${response.status}`);

    const result = await response.json();
    return result.data || result || {};
  } catch (error) {
    console.error('Wiki data fetch error:', error);
    return {};
  }
}

/**
 * Detect if query is wiki-related
 */
export function isWikiQuery(query: string): boolean {
  const wikiKeywords = [
    'wiki', 'wikipedia', 'article', 'history', 'about',
    'what is', 'who is', 'define', 'definition',
    'explain', 'learn', 'knowledge', 'encyclopedia'
  ];
  const lowerQuery = query.toLowerCase();
  return wikiKeywords.some(kw => lowerQuery.includes(kw));
}
