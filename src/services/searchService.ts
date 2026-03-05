/**
 * Unified Search Service - Routes queries to appropriate mode services
 * Uses @aeryflux/xenova-bridge for intent classification and entity extraction
 */

import { IntentEngine, EntityExtractor, type ClassifiedIntent, type ExtractedEntity } from '@aeryflux/xenova-bridge';
import { fetchNewsArticles, fetchNewsCountryData, type NewsArticle, type CountryNewsData } from './newsService';
import { fetchWikiData, type WikiDataMap } from './wikiService';
import { fetchWeatherData, type WeatherDataMap, type WeatherView } from './weatherService';

export type SearchMode = 'auto' | 'news' | 'wiki' | 'weather';

// Xenova Bridge instances (singleton pattern)
const intentEngine = new IntentEngine({ debug: false });
const entityExtractor = new EntityExtractor({ debug: false });

export interface SearchResult {
  mode: SearchMode;
  query: string;
  // Intent classification
  intent?: ClassifiedIntent;
  entities?: ExtractedEntity[];
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
  // Detected country for focused queries
  targetCountry?: string;
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
 * Map intent category to search mode
 */
function intentToMode(intent: ClassifiedIntent): SearchMode {
  // Check for mode entity first (explicit "show weather", "news about", etc.)
  if (intent.category === 'navigation' || intent.category === 'search') {
    return 'auto'; // Will be determined by entities
  }
  if (intent.category === 'info') {
    return 'wiki';
  }
  return 'auto';
}

/**
 * Detect query mode from text using xenova-bridge
 */
export async function detectMode(query: string): Promise<{ mode: SearchMode; intent: ClassifiedIntent; entities: ExtractedEntity[] }> {
  // Classify intent
  const intent = await intentEngine.classify(query, {
    currentMode: 'news',
    currentTheme: 'dark',
    language: 'en',
  });

  // Extract entities
  const entities = entityExtractor.extract(query);

  // Check for explicit mode entity
  const modeEntity = entities.find(e => e.type === 'mode');
  if (modeEntity) {
    const modeMap: Record<string, SearchMode> = {
      news: 'news',
      weather: 'weather',
      wiki: 'wiki',
    };
    const detectedMode = modeMap[modeEntity.normalizedValue] || 'auto';
    return { mode: detectedMode, intent, entities };
  }

  // Fallback to intent-based detection
  const mode = intentToMode(intent);
  return { mode, intent, entities };
}

/**
 * Execute search based on mode
 */
export async function executeSearch(query: string, mode: SearchMode = 'auto'): Promise<SearchResult> {
  // Auto-detect mode and extract entities
  const detection = await detectMode(query);
  const effectiveMode = mode === 'auto' ? detection.mode : mode;

  // Extract target country if present
  const countryEntity = detection.entities.find(e => e.type === 'country');
  const targetCountry = countryEntity?.normalizedValue;

  const result: SearchResult = {
    mode: effectiveMode,
    query,
    intent: detection.intent,
    entities: detection.entities,
    targetCountry,
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
