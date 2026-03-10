/**
 * Unified Search Service - Routes queries to appropriate mode services
 * Uses @aeryflux/xenova-bridge for intent classification and entity extraction
 */

import { IntentEngine, EntityExtractor, type ClassifiedIntent, type ExtractedEntity } from '@aeryflux/xenova-bridge';
import { fetchNewsArticles, fetchNewsGlobeData, type NewsArticle, type CountryNewsData, type CityNewsData } from './newsService';
import { fetchWikiData, type WikiDataMap } from './wikiService';
import { fetchWeatherData, type WeatherDataMap, type WeatherView } from './weatherService';
import { fetchSportsArticles, fetchSportsCountryData, type SportsArticle, type CountrySportsData } from './sportsService';
import { fetchEconomyData, fetchEconomyCountryData, type EconomyData, type CountryEconomyData } from './economyService';

export type SearchMode = 'auto' | 'news' | 'wiki' | 'weather' | 'sports' | 'economy';

// Keyword patterns for mode detection
const SPORTS_KEYWORDS = ['football', 'soccer', 'basketball', 'tennis', 'match', 'score', 'league', 'champion', 'fifa', 'nba', 'nfl', 'sport', 'rugby', 'hockey', 'baseball', 'golf', 'formula', 'f1', 'racing', 'olympics', 'world cup', 'coupe du monde', 'ligue', 'championnat'];
const ECONOMY_KEYWORDS = ['economy', 'stock', 'market', 'finance', 'gdp', 'inflation', 'bitcoin', 'crypto', 'bourse', 'économie', 'economie', 'currency', 'dollar', 'euro', 'trade', 'investment', 'nasdaq', 'dow jones', 'cac 40', 'ftse', 'nikkei'];

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
  newsCityData?: CityNewsData;
  // Wiki results (for globe visualization)
  wikiData?: WikiDataMap;
  // Weather results
  weatherData?: WeatherDataMap;
  weatherView?: WeatherView;
  // Sports results
  sportsArticles?: SportsArticle[];
  sportsCountryData?: CountrySportsData;
  // Economy results
  economyData?: EconomyData;
  economyCountryData?: CountryEconomyData;
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
  sports: '#f59e0b',   // Amber (Challenge color)
  economy: '#10b981',  // Emerald
};

export const MODE_LABELS: Record<SearchMode, string> = {
  auto: 'Auto',
  news: 'News',
  wiki: 'Wiki',
  weather: 'Weather',
  sports: 'Sports',
  economy: 'Economy',
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
 * Detect query mode from text using xenova-bridge and keyword patterns
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
      sports: 'sports',
      economy: 'economy',
    };
    const detectedMode = modeMap[modeEntity.normalizedValue] || 'auto';
    return { mode: detectedMode, intent, entities };
  }

  // Check for sports keywords (before falling back to intent)
  const lowerQuery = query.toLowerCase();
  if (SPORTS_KEYWORDS.some(kw => lowerQuery.includes(kw))) {
    return { mode: 'sports', intent, entities };
  }

  // Check for economy keywords
  if (ECONOMY_KEYWORDS.some(kw => lowerQuery.includes(kw))) {
    return { mode: 'economy', intent, entities };
  }

  // Fallback to intent-based detection
  const mode = intentToMode(intent);

  // If still 'auto', fallback to news (instead of Atlas redirect)
  if (mode === 'auto') {
    return { mode: 'news', intent, entities };
  }

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
        // Fetch articles and globe data (countries + cities) in parallel
        const [articles, globeData] = await Promise.all([
          fetchNewsArticles(query),
          fetchNewsGlobeData(query),
        ]);
        result.articles = articles;
        result.newsCountryData = globeData.countryData;
        result.newsCityData = globeData.cityData;
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

      case 'sports': {
        // Fetch sports articles and country data in parallel
        const [articles, countryData] = await Promise.all([
          fetchSportsArticles(query),
          fetchSportsCountryData(query),
        ]);
        result.sportsArticles = articles;
        result.sportsCountryData = countryData;
        break;
      }

      case 'economy': {
        // Fetch economy data and country data in parallel
        const [data, countryData] = await Promise.all([
          fetchEconomyData(query),
          fetchEconomyCountryData(query),
        ]);
        result.economyData = data;
        result.economyCountryData = countryData;
        break;
      }

      default: {
        // Fallback to news mode instead of Atlas redirect
        const [articles, globeData] = await Promise.all([
          fetchNewsArticles(query),
          fetchNewsGlobeData(query),
        ]);
        result.articles = articles;
        result.newsCountryData = globeData.countryData;
        result.newsCityData = globeData.cityData;
        result.mode = 'news';
        break;
      }
    }
  } catch (error) {
    console.error('Search error:', error);
    // On error, still try news as fallback instead of Atlas
    try {
      const [articles, globeData] = await Promise.all([
        fetchNewsArticles(query),
        fetchNewsGlobeData(query),
      ]);
      result.articles = articles;
      result.newsCountryData = globeData.countryData;
      result.newsCityData = globeData.cityData;
      result.mode = 'news';
    } catch {
      // Last resort: fallback to Atlas
      result.fallbackToAtlas = true;
    }
  }

  return result;
}
