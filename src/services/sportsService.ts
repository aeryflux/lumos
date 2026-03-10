/**
 * Sports Service - Fetch sports news from Pythagoras API
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export interface SportsArticle {
  title: string;
  link: string;
  date: string;
  snippet: string;
  color: string;
  source?: string;
  sport?: string;
  league?: string;
  teams?: string[];
}

export interface CountrySportsData {
  [countryName: string]: {
    scale: number;          // Normalized 0-1 for globe extrusion
    lat: number | null;
    lon: number | null;
    color?: string;         // Sport-based color
    sport?: string;         // Primary sport
    matchCount?: number;    // Number of matches/events
  };
}

/**
 * Fetch sports articles by query
 */
export async function fetchSportsArticles(query?: string): Promise<SportsArticle[]> {
  try {
    const url = new URL(`${API_BASE}/api/sports/articles`);
    if (query) url.searchParams.set('query', query);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch sports');

    const data = await response.json();
    // API returns array directly or { data: [] }
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('Sports fetch error:', error);
    return [];
  }
}

/**
 * Fetch country sports data for globe visualization
 */
export async function fetchSportsCountryData(query?: string): Promise<CountrySportsData> {
  const url = new URL(`${API_BASE}/api/sports/countries`);
  if (query) url.searchParams.set('query', query);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed: ${response.status}`);

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error('Sports data fetch error:', error);
    return {};
  }
}

/**
 * Detect if query is sports-related
 */
export function isSportsQuery(query: string): boolean {
  const sportsKeywords = [
    'football', 'soccer', 'basketball', 'tennis', 'match', 'score',
    'league', 'champion', 'fifa', 'nba', 'nfl', 'sport', 'rugby',
    'hockey', 'baseball', 'golf', 'formula', 'f1', 'racing',
    'olympics', 'world cup', 'coupe du monde', 'ligue', 'championnat'
  ];
  const lowerQuery = query.toLowerCase();
  return sportsKeywords.some(kw => lowerQuery.includes(kw));
}
