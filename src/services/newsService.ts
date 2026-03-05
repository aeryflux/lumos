/**
 * News Service - Fetch news from Pythagoras API
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export interface NewsArticle {
  title: string;
  link: string;
  date: string;
  snippet: string;
  color: string;
  source?: string;
  theme?: {
    id: number;
    name: string;
    color: string;
  };
}

export interface CountryNewsData {
  [countryName: string]: {
    scale: number;          // Normalized 0-1 for globe extrusion
    lat: number | null;
    lon: number | null;
    color?: string;         // Theme-based color from analysis
    themeId?: number;       // Detected theme ID
    themeName?: string;     // Detected theme name
  };
}

export interface NewsTheme {
  id: number;
  name: string;
  color: string;
  keywords: string[];
}

/**
 * Fetch news articles by query
 */
export async function fetchNewsArticles(query?: string): Promise<NewsArticle[]> {
  try {
    const url = new URL(`${API_BASE}/api/news/articles`);
    if (query) url.searchParams.set('query', query);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch news');

    const data = await response.json();
    // API returns array directly or { data: [] }
    return Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error('News fetch error:', error);
    return [];
  }
}

/**
 * Fetch country news data for globe visualization
 */
export async function fetchNewsCountryData(query?: string): Promise<CountryNewsData> {
  const url = new URL(`${API_BASE}/api/news/data`);
  if (query) url.searchParams.set('query', query);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed: ${response.status}`);

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error('News data fetch error:', error);
    return {};
  }
}

/**
 * Fetch available news themes
 */
export async function fetchNewsThemes(): Promise<NewsTheme[]> {
  try {
    const response = await fetch(`${API_BASE}/api/news/themes`);
    if (!response.ok) throw new Error('Failed to fetch themes');

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Themes fetch error:', error);
    return [];
  }
}

/**
 * Detect if query is news-related
 */
export function isNewsQuery(query: string): boolean {
  const newsKeywords = [
    'news', 'article', 'headline', 'report',
    'actualité', 'nouvelle', 'info',
    'what happened', 'latest', 'today',
    'breaking', 'update'
  ];
  const lowerQuery = query.toLowerCase();
  return newsKeywords.some(kw => lowerQuery.includes(kw)) ||
    lowerQuery.startsWith('news ') ||
    lowerQuery.includes(' news');
}
