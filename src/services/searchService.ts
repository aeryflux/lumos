/**
 * Unified Search Service - Routes queries to appropriate mode services
 */

import { fetchNewsArticles, fetchNewsCountryData, isNewsQuery, type NewsArticle, type CountryNewsData } from './newsService';
import { fetchWikiData, isWikiQuery, type WikiDataMap } from './wikiService';
import { fetchWeatherData, isWeatherQuery, type WeatherDataMap, type WeatherView } from './weatherService';

export type SearchMode = 'auto' | 'news' | 'wiki' | 'weather';

export interface SearchResult {
  mode: SearchMode;
  query: string;
  // News results
  articles?: NewsArticle[];
  newsCountryData?: CountryNewsData;
  // Wiki results (for globe visualization)
  wikiData?: WikiDataMap;
  // Weather results
  weatherData?: WeatherDataMap;
  weatherView?: WeatherView;
  // Fallback to Atlas
  fallbackToAtlas?: boolean;
}

export const MODE_COLORS: Record<SearchMode, string> = {
  auto: '#888888',
  news: '#ef4444',
  wiki: '#888888',
  weather: '#3b82f6',
};

export const MODE_LABELS: Record<SearchMode, string> = {
  auto: 'Auto',
  news: 'News',
  wiki: 'Wiki',
  weather: 'Weather',
};

/**
 * Detect query mode from text
 */
export function detectMode(query: string): SearchMode {
  if (isNewsQuery(query)) return 'news';
  if (isWeatherQuery(query)) return 'weather';
  if (isWikiQuery(query)) return 'wiki';
  return 'auto';
}

/**
 * Execute search based on mode
 */
export async function executeSearch(query: string, mode: SearchMode = 'auto'): Promise<SearchResult> {
  // Auto-detect mode if not specified
  const effectiveMode = mode === 'auto' ? detectMode(query) : mode;

  const result: SearchResult = {
    mode: effectiveMode,
    query,
  };

  try {
    switch (effectiveMode) {
      case 'news': {
        // Fetch articles and country data in parallel
        const [articles, countryData] = await Promise.all([
          fetchNewsArticles(query),
          fetchNewsCountryData(query),
        ]);
        result.articles = articles;
        result.newsCountryData = countryData;
        break;
      }

      case 'wiki': {
        const wikiData = await fetchWikiData(query);
        result.wikiData = wikiData;
        break;
      }

      case 'weather': {
        const { data, view } = await fetchWeatherData(query, 'temperature');
        result.weatherData = data;
        result.weatherView = view;
        break;
      }

      default:
        // No specific mode detected, fallback to Atlas
        result.fallbackToAtlas = true;
        break;
    }
  } catch (error) {
    console.error('Search error:', error);
    result.fallbackToAtlas = true;
  }

  return result;
}
