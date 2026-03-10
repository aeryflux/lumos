import { lazy, Suspense, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useEffects } from '../contexts/EffectsContext';
import { SmartInput } from '../components/SmartInput';
import { DemoPreview } from '../components/DemoPreview';
import { NewsResults } from '../components/NewsResults';
import { WeatherResults } from '../components/WeatherResults';
import { WikiResults } from '../components/WikiResults';
import { SportsResults } from '../components/SportsResults';
import { EconomyResults } from '../components/EconomyResults';
import { HexLoader } from '../components/HexLoader';
import { SpecialThanks } from '../components/SpecialThanks';
import { AnimatedSplash } from '../components/AnimatedSplash';
import { executeSearch, type SearchMode } from '../services/searchService';
import type { NewsArticle, CountryNewsData, CityNewsData } from '../services/newsService';
import type { WeatherDataMap, WeatherView, WeatherCountryData } from '../services/weatherService';
import type { WikiDataMap } from '../services/wikiService';
import type { SportsArticle, CountrySportsData } from '../services/sportsService';
import type { EconomyData, EconomyIndicator, CountryEconomyData } from '../services/economyService';
import type { CountryDataMap } from '@aeryflux/globe/react';
import { normalizeToGlobe } from '../utils/countryNormalize';
import './Home.css';

// Lazy load the 3D globe for performance
const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

type QueryState = 'idle' | 'loading' | 'results';

interface SearchResults {
  mode: SearchMode;
  query: string;
  articles?: NewsArticle[];
  newsCountryData?: CountryNewsData;
  newsCityData?: CityNewsData;
  weatherData?: WeatherDataMap;
  weatherView?: WeatherView;
  wikiData?: WikiDataMap;
  sportsArticles?: SportsArticle[];
  sportsCountryData?: CountrySportsData;
  economyData?: EconomyData;
  economyCountryData?: CountryEconomyData;
  fallbackToAtlas?: boolean;
}

// Mode-specific colors for globe highlights
const MODE_HIGHLIGHT_COLORS: Record<SearchMode, string> = {
  auto: '#00ff88',
  news: '#ef4444',
  wiki: '#888888',
  weather: '#3b82f6',
  sports: '#f59e0b',
  economy: '#10b981',
};

// ISO code to country name mapping
const ISO_TO_COUNTRY: Record<string, string> = {
  AF: 'Afghanistan', AL: 'Albania', DZ: 'Algeria', AR: 'Argentina', AU: 'Australia',
  AT: 'Austria', BD: 'Bangladesh', BE: 'Belgium', BR: 'Brazil', BG: 'Bulgaria',
  CA: 'Canada', CL: 'Chile', CN: 'China', CO: 'Colombia', HR: 'Croatia',
  CZ: 'Czech Republic', DK: 'Denmark', EG: 'Egypt', FI: 'Finland', FR: 'France',
  DE: 'Germany', GR: 'Greece', HU: 'Hungary', IN: 'India', ID: 'Indonesia',
  IR: 'Iran', IQ: 'Iraq', IE: 'Ireland', IL: 'Israel', IT: 'Italy',
  JP: 'Japan', KE: 'Kenya', KR: 'South Korea', MY: 'Malaysia', MX: 'Mexico',
  MA: 'Morocco', NL: 'Netherlands', NZ: 'New Zealand', NG: 'Nigeria', NO: 'Norway',
  PK: 'Pakistan', PE: 'Peru', PH: 'Philippines', PL: 'Poland', PT: 'Portugal',
  RO: 'Romania', RU: 'Russia', SA: 'Saudi Arabia', ZA: 'South Africa', ES: 'Spain',
  SE: 'Sweden', CH: 'Switzerland', TH: 'Thailand', TR: 'Turkey', UA: 'Ukraine',
  AE: 'United Arab Emirates', GB: 'United Kingdom', US: 'United States', VN: 'Vietnam',
};

// Country to capital city mapping (normalized names for globe mesh matching)
const COUNTRY_TO_CAPITAL: Record<string, string> = {
  'France': 'paris', 'Germany': 'berlin', 'Italy': 'rome', 'Spain': 'madrid',
  'United Kingdom': 'london', 'Netherlands': 'amsterdam', 'Belgium': 'brussels',
  'Portugal': 'lisbon', 'Poland': 'warsaw', 'Austria': 'vienna',
  'Switzerland': 'zurich', 'Sweden': 'stockholm', 'Norway': 'oslo',
  'Denmark': 'copenhagen', 'Finland': 'helsinki', 'Greece': 'athens',
  'Czech Republic': 'prague', 'Hungary': 'budapest', 'Romania': 'bucharest',
  'Ireland': 'dublin', 'Russia': 'moscow', 'Ukraine': 'kyiv',
  'Turkey': 'istanbul', 'Egypt': 'cairo', 'South Africa': 'johannesburg',
  'Nigeria': 'lagos', 'Kenya': 'nairobi', 'Morocco': 'casablanca',
  'United States': 'new_york', 'Canada': 'toronto', 'Mexico': 'mexico_city',
  'Brazil': 'sao_paulo', 'Argentina': 'buenos_aires', 'Colombia': 'bogota',
  'Chile': 'santiago', 'Peru': 'lima',
  'China': 'beijing', 'Japan': 'tokyo', 'India': 'delhi',
  'South Korea': 'seoul', 'Indonesia': 'jakarta', 'Thailand': 'bangkok',
  'Vietnam': 'hanoi', 'Malaysia': 'kuala_lumpur', 'Philippines': 'manila',
  'Singapore': 'singapore', 'Australia': 'sydney', 'New Zealand': 'auckland',
  'United Arab Emirates': 'dubai', 'Saudi Arabia': 'riyadh', 'Israel': 'tel_aviv',
  'Iran': 'tehran', 'Iraq': 'baghdad', 'Pakistan': 'karachi',
};

// Resolve country name from ISO code or return as-is
function resolveCountryName(code?: string): string | undefined {
  if (!code) return undefined;
  // If it's already a full name (more than 2-3 chars), return as-is
  if (code.length > 3) return code;
  return ISO_TO_COUNTRY[code.toUpperCase()] || code;
}

// Simple keyword-based mode detection for demo queries (EN + FR)
function detectModeFromQuery(query: string): SearchMode {
  const lower = query.toLowerCase();
  // Sports keywords (EN + FR) - check first for specificity
  if (lower.includes('football') || lower.includes('soccer') || lower.includes('basketball') ||
      lower.includes('tennis') || lower.includes('match') || lower.includes('score') ||
      lower.includes('league') || lower.includes('champion') || lower.includes('fifa') ||
      lower.includes('nba') || lower.includes('nfl') || lower.includes('sport') ||
      lower.includes('rugby') || lower.includes('hockey') || lower.includes('olympics') ||
      lower.includes('world cup') || lower.includes('coupe du monde') || lower.includes('ligue') ||
      lower.includes('championnat')) {
    return 'sports';
  }
  // Economy keywords (EN + FR)
  if (lower.includes('economy') || lower.includes('stock') || lower.includes('market') ||
      lower.includes('finance') || lower.includes('gdp') || lower.includes('inflation') ||
      lower.includes('bitcoin') || lower.includes('crypto') || lower.includes('bourse') ||
      lower.includes('économie') || lower.includes('economie') || lower.includes('currency') ||
      lower.includes('dollar') || lower.includes('euro') || lower.includes('nasdaq')) {
    return 'economy';
  }
  // News keywords (EN + FR)
  if (lower.includes('news') || lower.includes('headline') || lower.includes('update') ||
      lower.includes('actualité') || lower.includes('info')) {
    return 'news';
  }
  // Weather keywords (EN + FR)
  if (lower.includes('weather') || lower.includes('temperature') || lower.includes('climate') ||
      lower.includes('météo') || lower.includes('climat') || lower.includes('température')) {
    return 'weather';
  }
  // Wiki keywords (EN + FR)
  if (lower.includes('about') || lower.includes('history') || lower.includes('wiki') ||
      lower.includes('geography') || lower.includes('culture') ||
      lower.includes('à propos') || lower.includes('histoire') || lower.includes('géographie')) {
    return 'wiki';
  }
  // Fallback to news instead of auto (prevents Atlas redirect)
  return 'news';
}

// Check if query is a global/worldwide request (no specific country)
function isGlobalQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return lower.includes('world') || lower.includes('global') || lower.includes('globale') ||
         lower.includes('worldwide') || lower.includes('mondial') || lower.includes('mondiales') ||
         lower.includes('international');
}

// Extract country name from query (EN + FR country names)
function extractCountryFromQuery(query: string): string | undefined {
  const lower = query.toLowerCase();
  // Map of country patterns to canonical English names
  const countryMap: Record<string, string> = {
    // English names
    'france': 'France', 'japan': 'Japan', 'germany': 'Germany', 'italy': 'Italy',
    'spain': 'Spain', 'brazil': 'Brazil', 'china': 'China', 'india': 'India',
    'russia': 'Russia', 'canada': 'Canada', 'australia': 'Australia', 'mexico': 'Mexico',
    'egypt': 'Egypt', 'nigeria': 'Nigeria', 'kenya': 'Kenya', 'south africa': 'South Africa',
    'argentina': 'Argentina', 'chile': 'Chile', 'peru': 'Peru', 'colombia': 'Colombia',
    'turkey': 'Turkey', 'thailand': 'Thailand', 'vietnam': 'Vietnam', 'indonesia': 'Indonesia',
    'malaysia': 'Malaysia', 'philippines': 'Philippines', 'korea': 'South Korea',
    'united states': 'United States', 'usa': 'United States', 'uk': 'United Kingdom',
    'united kingdom': 'United Kingdom', 'britain': 'United Kingdom',
    // French names → English canonical
    'japon': 'Japan', 'allemagne': 'Germany', 'italie': 'Italy', 'espagne': 'Spain',
    'brésil': 'Brazil', 'bresil': 'Brazil', 'chine': 'China', 'inde': 'India',
    'russie': 'Russia', 'australie': 'Australia', 'mexique': 'Mexico', 'égypte': 'Egypt',
    'egypte': 'Egypt', 'nigéria': 'Nigeria', 'afrique du sud': 'South Africa',
    'turquie': 'Turkey', 'thaïlande': 'Thailand', 'thailande': 'Thailand',
    'indonésie': 'Indonesia', 'malaisie': 'Malaysia', 'corée': 'South Korea', 'coree': 'South Korea',
    'états-unis': 'United States', 'etats-unis': 'United States', 'royaume-uni': 'United Kingdom',
    'europe': 'Europe', 'asie': 'Asia', 'asia': 'Asia', 'amériques': 'Americas', 'americas': 'Americas',
  };
  for (const [pattern, canonical] of Object.entries(countryMap)) {
    if (lower.includes(pattern)) {
      return canonical;
    }
  }
  return undefined;
}

// Extract city name from query (major world cities, EN + FR)
function extractCityFromQuery(query: string): { name: string; country: string } | undefined {
  const lower = query.toLowerCase();
  // Map of city patterns to { name, country }
  const cityMap: Record<string, { name: string; country: string }> = {
    // Asia
    'tokyo': { name: 'Tokyo', country: 'Japan' },
    'osaka': { name: 'Osaka', country: 'Japan' },
    'shanghai': { name: 'Shanghai', country: 'China' },
    'beijing': { name: 'Beijing', country: 'China' },
    'pekin': { name: 'Beijing', country: 'China' },
    'hong kong': { name: 'Hong Kong', country: 'Hong Kong S.A.R.' },
    'singapore': { name: 'Singapore', country: 'Singapore' },
    'seoul': { name: 'Seoul', country: 'South Korea' },
    'bangkok': { name: 'Bangkok', country: 'Thailand' },
    'mumbai': { name: 'Mumbai', country: 'India' },
    'delhi': { name: 'Delhi', country: 'India' },
    'jakarta': { name: 'Jakarta', country: 'Indonesia' },
    'manila': { name: 'Manila', country: 'Philippines' },
    'taipei': { name: 'Taipei', country: 'Taiwan' },
    // Europe
    'paris': { name: 'Paris', country: 'France' },
    'london': { name: 'London', country: 'United Kingdom' },
    'londres': { name: 'London', country: 'United Kingdom' },
    'berlin': { name: 'Berlin', country: 'Germany' },
    'madrid': { name: 'Madrid', country: 'Spain' },
    'barcelona': { name: 'Barcelona', country: 'Spain' },
    'barcelone': { name: 'Barcelona', country: 'Spain' },
    'rome': { name: 'Rome', country: 'Italy' },
    'amsterdam': { name: 'Amsterdam', country: 'Netherlands' },
    'moscow': { name: 'Moscow', country: 'Russia' },
    'moscou': { name: 'Moscow', country: 'Russia' },
    'istanbul': { name: 'Istanbul', country: 'Turkey' },
    // Americas
    'new york': { name: 'New York', country: 'United States of America' },
    'los angeles': { name: 'Los Angeles', country: 'United States of America' },
    'chicago': { name: 'Chicago', country: 'United States of America' },
    'miami': { name: 'Miami', country: 'United States of America' },
    'san francisco': { name: 'San Francisco', country: 'United States of America' },
    'toronto': { name: 'Toronto', country: 'Canada' },
    'mexico city': { name: 'Mexico City', country: 'Mexico' },
    'sao paulo': { name: 'São Paulo', country: 'Brazil' },
    'rio de janeiro': { name: 'Rio de Janeiro', country: 'Brazil' },
    'rio': { name: 'Rio de Janeiro', country: 'Brazil' },
    'buenos aires': { name: 'Buenos Aires', country: 'Argentina' },
    'lima': { name: 'Lima', country: 'Peru' },
    'bogota': { name: 'Bogotá', country: 'Colombia' },
    // Middle East & Africa
    'dubai': { name: 'Dubai', country: 'United Arab Emirates' },
    'dubay': { name: 'Dubai', country: 'United Arab Emirates' },
    'cairo': { name: 'Cairo', country: 'Egypt' },
    'le caire': { name: 'Cairo', country: 'Egypt' },
    'lagos': { name: 'Lagos', country: 'Nigeria' },
    'tehran': { name: 'Tehran', country: 'Iran' },
    // Oceania
    'sydney': { name: 'Sydney', country: 'Australia' },
    'melbourne': { name: 'Melbourne', country: 'Australia' },
  };
  for (const [pattern, data] of Object.entries(cityMap)) {
    if (lower.includes(pattern)) {
      return data;
    }
  }
  return undefined;
}

export function Home() {
  const themeColors = useThemeColors();
  const { triggerEffect } = useEffects();
  const [inputFocused, setInputFocused] = useState(false);
  const [queryState, setQueryState] = useState<QueryState>('idle');
  const [results, setResults] = useState<SearchResults | null>(null);
  // Splash screen state
  const [showSplash, setShowSplash] = useState(true);
  const initialDataLoaded = useRef(false);
  // Auto-demo state: shows preview data on globe without full results panel
  const [demoData, setDemoData] = useState<{ countryData: CountryDataMap; cityData?: CountryDataMap; color: string } | null>(null);
  // Track current demo data for the preview module
  const [demoInfo, setDemoInfo] = useState<{
    query: string;
    mode: SearchMode;
    countryCount: number;
    isGlobal: boolean;
    targetCountry?: string;
    targetCity?: string;
    article?: NewsArticle;
    weatherData?: WeatherCountryData;
    articleCount?: number;
    sportsArticle?: SportsArticle;
    economyIndicator?: EconomyIndicator;
    // Global stats
    globalStats?: {
      avgTemp?: number;
      minTemp?: number;
      maxTemp?: number;
      totalArticles?: number;
      totalMatches?: number;
      marketsTracked?: number;
    };
  } | null>(null);

  // Trigger laser scan effect on page load
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      triggerEffect('laser-scan', '#00ff88');
    }, 100);
    return () => clearTimeout(timer);
  }, [triggerEffect]);

  // Handle auto-demo: search in background and update globe only
  const handleDemoChange = useCallback(async (query: string, mode: SearchMode) => {
    try {
      // Determine effective mode BEFORE search
      let effectiveMode: SearchMode = mode;
      if (mode === 'auto') {
        effectiveMode = detectModeFromQuery(query);
      }

      // Check if this is a global query (no specific country)
      const isGlobal = isGlobalQuery(query);
      // Try to extract country from query directly
      const queryCountry = extractCountryFromQuery(query);
      // Try to extract city from query
      const queryCity = extractCityFromQuery(query);

      // For API query: use extracted country name, or empty for global
      // "News Japan" → search with "Japan", not "News Japan"
      const searchQuery = isGlobal ? '' : (queryCity?.country || queryCountry || query);
      const searchResult = await executeSearch(searchQuery, effectiveMode !== 'auto' ? effectiveMode : mode);
      const highlightColor = MODE_HIGHLIGHT_COLORS[effectiveMode] || '#00ff88';

      // Extract country data based on mode
      let countryData: CountryDataMap = {};
      let cityData: CountryDataMap = {};

      // Use query-extracted country, or resolve from API
      const rawTargetCountry = queryCity?.country || queryCountry || searchResult.targetCountry;
      const targetCountry = resolveCountryName(rawTargetCountry);
      const targetCity = queryCity?.name;

      // Mode-specific data extraction
      let article: NewsArticle | undefined;
      let weatherData: WeatherCountryData | undefined;
      let articleCount: number | undefined;
      let sportsArticle: SportsArticle | undefined;
      let economyIndicator: EconomyIndicator | undefined;
      let resolvedCountryForDisplay = targetCountry;
      let globalStats: { avgTemp?: number; minTemp?: number; maxTemp?: number; totalArticles?: number; totalMatches?: number; marketsTracked?: number } | undefined;

      if (effectiveMode === 'news') {
        // Get first article for preview
        if (searchResult.articles && searchResult.articles.length > 0) {
          article = searchResult.articles[0];
        }
        // Build country data for globe
        if (searchResult.newsCountryData) {
          for (const [country, info] of Object.entries(searchResult.newsCountryData)) {
            // Normalize country name for globe mesh matching
            const normalizedCountry = normalizeToGlobe(country);
            countryData[normalizedCountry] = { scale: info.scale, color: info.color || highlightColor };
          }
        }
        // Build city data for globe (from API mentions-based scoring)
        if (searchResult.newsCityData) {
          for (const [city, info] of Object.entries(searchResult.newsCityData)) {
            cityData[city] = {
              scale: info.scale,
              color: info.color || highlightColor,
              extrusion: info.extrusion,
            };
          }
        }
        // For global queries, count total articles (we'd need this from API)
        if (isGlobal && searchResult.articles) {
          globalStats = { totalArticles: searchResult.articles.length };
        }
      } else if (effectiveMode === 'weather') {
        if (searchResult.weatherData) {
          const entries = Object.entries(searchResult.weatherData);
          const temps: number[] = [];

          for (const [country, info] of entries) {
            // Normalize country name for globe mesh matching
            const normalizedCountry = normalizeToGlobe(country);
            countryData[normalizedCountry] = { scale: info.scale, color: info.color || highlightColor };
            if (info.temperature !== undefined) {
              temps.push(info.temperature);
            }
            // If specific country requested, extract its data
            if (!isGlobal && targetCountry && country.toLowerCase() === targetCountry.toLowerCase()) {
              weatherData = info;
              resolvedCountryForDisplay = country;
            }

            // Add capital city to cityData for weather mode (extrusion based on temperature)
            const capital = COUNTRY_TO_CAPITAL[country];
            if (capital && info.temperature !== undefined) {
              // Normalize temperature to extrusion (0-1 scale, hotter = more extrusion)
              // -40°C = 0.0, +40°C = 1.0
              const tempNormalized = Math.max(0, Math.min(1, (info.temperature + 40) / 80));
              cityData[capital] = {
                scale: 1.0,
                color: info.color || highlightColor,
                extrusion: tempNormalized * 1.5, // Cities extrude more than countries
              };
            }
          }

          // For global queries, calculate global stats
          if (isGlobal && temps.length > 0) {
            const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
            const minTemp = Math.min(...temps);
            const maxTemp = Math.max(...temps);
            globalStats = { avgTemp, minTemp, maxTemp };
          } else if (!weatherData && !isGlobal && entries.length > 0) {
            // Fallback to hottest if no match (shouldn't happen with queryCountry)
            const sorted = entries.sort((a, b) => (b[1].temperature || 0) - (a[1].temperature || 0));
            weatherData = sorted[0][1];
            resolvedCountryForDisplay = sorted[0][0];
          }
        }
      } else if (effectiveMode === 'wiki') {
        if (searchResult.wikiData) {
          const entries = Object.entries(searchResult.wikiData);
          let totalArticles = 0;

          for (const [country, info] of entries) {
            // Normalize country name for globe mesh matching
            const normalizedCountry = normalizeToGlobe(country);
            countryData[normalizedCountry] = { scale: info.scale, color: info.color || highlightColor };
            if (info.articleCount) totalArticles += info.articleCount;
            // If specific country requested, extract its data
            if (!isGlobal && targetCountry && country.toLowerCase() === targetCountry.toLowerCase()) {
              articleCount = info.articleCount;
              resolvedCountryForDisplay = country;
            }
          }

          // For global queries, show total
          if (isGlobal) {
            globalStats = { totalArticles };
          } else if (articleCount === undefined && !isGlobal && entries.length > 0) {
            // Fallback to country with most articles
            const sorted = entries.sort((a, b) => (b[1].articleCount || 0) - (a[1].articleCount || 0));
            articleCount = sorted[0][1].articleCount;
            resolvedCountryForDisplay = sorted[0][0];
          }
        }
      } else if (effectiveMode === 'sports') {
        // Get first sports article for preview
        if (searchResult.sportsArticles && searchResult.sportsArticles.length > 0) {
          sportsArticle = searchResult.sportsArticles[0];
        }
        // Build country data for globe from sports data
        if (searchResult.sportsCountryData) {
          for (const [country, info] of Object.entries(searchResult.sportsCountryData)) {
            const normalizedCountry = normalizeToGlobe(country);
            countryData[normalizedCountry] = { scale: info.scale, color: info.color || highlightColor };
          }
        }
        // For global queries, count total matches
        if (isGlobal && searchResult.sportsArticles) {
          globalStats = { totalMatches: searchResult.sportsArticles.length };
        }
      } else if (effectiveMode === 'economy') {
        // Get first economy indicator for preview
        if (searchResult.economyData?.indicators && searchResult.economyData.indicators.length > 0) {
          economyIndicator = searchResult.economyData.indicators[0];
        }
        // Build country data for globe from economy data
        if (searchResult.economyCountryData) {
          for (const [country, info] of Object.entries(searchResult.economyCountryData)) {
            const normalizedCountry = normalizeToGlobe(country);
            countryData[normalizedCountry] = { scale: info.scale, color: info.color || highlightColor };
          }
        }
        // For global queries, count markets
        if (isGlobal && searchResult.economyCountryData) {
          globalStats = { marketsTracked: Object.keys(searchResult.economyCountryData).length };
        }
      }

      const countryCount = Object.keys(countryData).length;

      // Add city highlight if a city was detected
      if (targetCity) {
        // Normalize city name for globe mesh matching (lowercase, underscores)
        const normalizedCity = targetCity.toLowerCase().replace(/\s+/g, '_');
        cityData[normalizedCity] = { scale: 1.0, color: highlightColor };
      }

      if (countryCount > 0 || Object.keys(cityData).length > 0) {
        triggerEffect('laser-scan', '#00ff88');
        setDemoData({
          countryData,
          cityData: Object.keys(cityData).length > 0 ? cityData : undefined,
          color: highlightColor,
        });
        setDemoInfo({
          query,
          mode: effectiveMode,
          countryCount,
          isGlobal,
          targetCountry: isGlobal ? undefined : resolvedCountryForDisplay,
          targetCity,
          article,
          weatherData: isGlobal ? undefined : weatherData,
          articleCount: isGlobal ? undefined : articleCount,
          sportsArticle,
          economyIndicator,
          globalStats,
        });
        // Mark initial data as loaded for splash screen
        if (!initialDataLoaded.current) {
          initialDataLoaded.current = true;
        }
      }
    } catch (error) {
      console.error('Demo search error:', error);
    }
  }, [triggerEffect]);

  const handleQuery = useCallback(async (query: string, mode: SearchMode) => {
    // Clear demo mode when user submits real query
    setDemoData(null);
    setDemoInfo(null);
    setQueryState('loading');

    // Trigger laser scan effect with consistent green color
    triggerEffect('laser-scan', '#00ff88');

    // Determine effective mode and extract country/city (same logic as handleDemoChange)
    let effectiveMode: SearchMode = mode;
    if (mode === 'auto') {
      effectiveMode = detectModeFromQuery(query);
    }
    const isGlobal = isGlobalQuery(query);
    const queryCountry = extractCountryFromQuery(query);
    const queryCity = extractCityFromQuery(query);

    // Use extracted city's country or country name as search query
    // "news paris" → search with "France", not "news paris"
    const searchQuery = isGlobal ? '' : (queryCity?.country || queryCountry || query);
    const searchResult = await executeSearch(searchQuery, effectiveMode !== 'auto' ? effectiveMode : mode);

    // When user searches for a specific city, show ONLY that city (not API-returned cities)
    let mergedCityData = searchResult.newsCityData;
    if (queryCity && searchResult.mode === 'news') {
      const normalizedCity = queryCity.name.toLowerCase().replace(/\s+/g, '_');
      const highlightColor = MODE_HIGHLIGHT_COLORS[searchResult.mode] || '#ef4444';
      // Only show the searched city, ignore API-returned cities
      mergedCityData = {
        [normalizedCity]: {
          scale: 1.0, // Full intensity for searched city
          color: highlightColor,
          extrusion: 0.8, // Strong extrusion for visibility
        },
      };
    }

    setResults({
      mode: searchResult.mode,
      query: searchResult.query,
      articles: searchResult.articles,
      newsCountryData: searchResult.newsCountryData,
      newsCityData: mergedCityData,
      weatherData: searchResult.weatherData,
      weatherView: searchResult.weatherView,
      wikiData: searchResult.wikiData,
      sportsArticles: searchResult.sportsArticles,
      sportsCountryData: searchResult.sportsCountryData,
      economyData: searchResult.economyData,
      economyCountryData: searchResult.economyCountryData,
      fallbackToAtlas: searchResult.fallbackToAtlas,
    });

    setQueryState('results');
  }, [triggerEffect]);

  const handleCloseResults = useCallback(() => {
    setQueryState('idle');
    setResults(null);
  }, []);

  // Convert search results to CountryDataMap for globe visualization
  const globeCountryData = useMemo((): CountryDataMap | undefined => {
    // Priority: real results > demo data
    if (!results || queryState !== 'results') {
      // Use demo data when idle
      return demoData?.countryData;
    }

    // Get highlight color based on mode
    const highlightColor = MODE_HIGHLIGHT_COLORS[results.mode] || '#00ff88';

    // Convert based on mode (with country name normalization)
    switch (results.mode) {
      case 'news':
        if (results.newsCountryData) {
          const data: CountryDataMap = {};
          for (const [country, info] of Object.entries(results.newsCountryData)) {
            const normalizedCountry = normalizeToGlobe(country);
            data[normalizedCountry] = {
              scale: info.scale,
              lat: info.lat,
              lon: info.lon,
              color: info.color || highlightColor,
            };
          }
          return data;
        }
        break;

      case 'weather':
        if (results.weatherData) {
          const data: CountryDataMap = {};
          for (const [country, info] of Object.entries(results.weatherData)) {
            const normalizedCountry = normalizeToGlobe(country);
            data[normalizedCountry] = {
              scale: info.scale,
              lat: info.lat,
              lon: info.lon,
              color: info.color || highlightColor,
            };
          }
          return data;
        }
        break;

      case 'wiki':
        if (results.wikiData) {
          const data: CountryDataMap = {};
          for (const [country, info] of Object.entries(results.wikiData)) {
            const normalizedCountry = normalizeToGlobe(country);
            data[normalizedCountry] = {
              scale: info.scale,
              lat: info.lat,
              lon: info.lon,
              color: info.color || highlightColor,
            };
          }
          return data;
        }
        break;

      case 'sports':
        if (results.sportsCountryData) {
          const data: CountryDataMap = {};
          for (const [country, info] of Object.entries(results.sportsCountryData)) {
            const normalizedCountry = normalizeToGlobe(country);
            data[normalizedCountry] = {
              scale: info.scale,
              lat: info.lat,
              lon: info.lon,
              color: info.color || highlightColor,
            };
          }
          return data;
        }
        break;

      case 'economy':
        if (results.economyCountryData) {
          const data: CountryDataMap = {};
          for (const [country, info] of Object.entries(results.economyCountryData)) {
            const normalizedCountry = normalizeToGlobe(country);
            data[normalizedCountry] = {
              scale: info.scale,
              lat: info.lat,
              lon: info.lon,
              color: info.color || highlightColor,
            };
          }
          return data;
        }
        break;
    }

    return undefined;
  }, [results, queryState, demoData]);

  // Convert city data for globe visualization
  const globeCityData = useMemo((): CountryDataMap | undefined => {
    // Use demo city data when idle
    if (!results || queryState !== 'results') {
      return demoData?.cityData;
    }

    const highlightColor = MODE_HIGHLIGHT_COLORS[results.mode] || '#00ff88';

    // News mode: use city data from API (mentions-based scoring)
    if (results.mode === 'news' && results.newsCityData) {
      const cityData: CountryDataMap = {};
      for (const [city, info] of Object.entries(results.newsCityData)) {
        cityData[city] = {
          scale: info.scale,
          color: info.color || highlightColor,
          extrusion: info.extrusion,
        };
      }
      return Object.keys(cityData).length > 0 ? cityData : undefined;
    }

    // Weather mode: capitals with temperature-based extrusion
    if (results.mode === 'weather' && results.weatherData) {
      const cityData: CountryDataMap = {};
      for (const [country, info] of Object.entries(results.weatherData)) {
        const capital = COUNTRY_TO_CAPITAL[country];
        if (capital && info.temperature !== undefined) {
          // Normalize temperature to extrusion (0-1 scale, hotter = more extrusion)
          const tempNormalized = Math.max(0, Math.min(1, (info.temperature + 40) / 80));
          cityData[capital] = {
            scale: 1.0,
            color: info.color || highlightColor,
            extrusion: tempNormalized * 1.5, // Cities extrude more than countries
          };
        }
      }
      return Object.keys(cityData).length > 0 ? cityData : undefined;
    }

    return undefined;
  }, [results, queryState, demoData]);

  // Get highlight color based on current mode
  const dataHighlightColor = useMemo(() => {
    if (results) return MODE_HIGHLIGHT_COLORS[results.mode];
    // Use demo color when idle
    return demoData?.color;
  }, [results, demoData]);

  // Globe props - animations disabled by default for minimalism
  // Using subdiv_7 for best country/city coverage (422 countries, 186 cities)
  const globeProps = useMemo(() => ({
    modelUrl: '/models/atlas_hex_subdiv_7.glb',
    borderColor: themeColors.globeBorder,
    glowIntensity: 0.6,
    rotationSpeed: 0.0002,
    bloomStrength: 0.4,
    showCountries: true,
    showCities: true,
    countryColor: themeColors.globeCountry,
    globeFillColor: themeColors.globeFill,
    isLightTheme: themeColors.isLightTheme,
    forceTransparent: true,
    countryData: globeCountryData,
    cityData: globeCityData,
    dataHighlightColor,
    enableControls: true, // Enable mouse/touch drag rotation
  }), [themeColors, globeCountryData, globeCityData, dataHighlightColor]);

  // Render results based on mode
  const renderResults = () => {
    if (queryState === 'loading') {
      return (
        <div className="home-loading">
          <HexLoader size="md" />
          <span className="home-loading-text">Searching...</span>
        </div>
      );
    }

    if (!results) return null;

    // Fallback to Atlas CTA
    if (results.fallbackToAtlas) {
      return (
        <div className="atlas-cta" onClick={handleCloseResults}>
          <p className="atlas-cta-text">
            <span className="atlas-cta-query">{results.query}</span>
          </p>
          <a
            href={`https://atlas.aeryflux.com?q=${encodeURIComponent(results.query)}`}
            className="atlas-cta-btn"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <span>Open in Atlas</span>
            <ExternalLink size={14} />
          </a>
        </div>
      );
    }

    // Mode-specific results
    switch (results.mode) {
      case 'news':
        return (
          <NewsResults
            articles={results.articles || []}
            query={results.query}
            onClose={handleCloseResults}
          />
        );
      case 'weather':
        return (
          <WeatherResults
            data={results.weatherData || {}}
            view={results.weatherView}
            query={results.query}
            onClose={handleCloseResults}
          />
        );
      case 'wiki':
        return (
          <WikiResults
            data={results.wikiData || {}}
            query={results.query}
            onClose={handleCloseResults}
          />
        );
      case 'sports':
        return (
          <SportsResults
            articles={results.sportsArticles || []}
            query={results.query}
            onClose={handleCloseResults}
          />
        );
      case 'economy':
        return (
          <EconomyResults
            data={results.economyData || { indicators: [] }}
            countryData={results.economyCountryData}
            query={results.query}
            onClose={handleCloseResults}
          />
        );
      default:
        return null;
    }
  };

  const hasResults = queryState !== 'idle';

  return (
    <>
      {/* Splash screen */}
      {showSplash && (
        <AnimatedSplash
          isReady={initialDataLoaded.current}
          onComplete={() => setShowSplash(false)}
          minDuration={1500}
        />
      )}

      <section className={`home ${hasResults ? 'home--has-results' : ''}`}>
        {/* Globe - centered background */}
        <div className="home-globe">
        <Suspense fallback={
          <div className="home-globe-loader">
            <HexLoader size="lg" />
          </div>
        }>
          <Globe {...globeProps} />
        </Suspense>
      </div>

      {/* Content - overlay */}
      <div className="home-content">
        <div className="home-inner">
          {/* Logo/Title - Split colors */}
          <h1 className="home-title">
            <span className="home-title-text">
              <span style={{ color: themeColors.titleAery }}>Aery</span>
              <span style={{ color: themeColors.titleFlux }}>Flux</span>
            </span>
          </h1>

          {/* Input */}
          <SmartInput
            onSubmit={handleQuery}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            isActive={inputFocused}
            autoDemo
            onDemoChange={handleDemoChange}
          />

          {/* Demo Preview - shown during auto-demo when idle */}
          {queryState === 'idle' && demoInfo && (
            <DemoPreview
              query={demoInfo.query}
              mode={demoInfo.mode}
              isVisible={!inputFocused}
              countryCount={demoInfo.countryCount}
              isGlobal={demoInfo.isGlobal}
              targetCountry={demoInfo.targetCountry}
              article={demoInfo.article}
              weatherData={demoInfo.weatherData}
              articleCount={demoInfo.articleCount}
              sportsArticle={demoInfo.sportsArticle}
              economyIndicator={demoInfo.economyIndicator}
              globalStats={demoInfo.globalStats}
            />
          )}

          {/* Results */}
          {queryState !== 'idle' && (
            <div className="home-results">
              {renderResults()}
            </div>
          )}

          {/* Footer link */}
          {queryState === 'idle' && (
            <a
              href="https://github.com/aeryflux"
              className="home-github"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={14} />
              <span>Open Source</span>
            </a>
          )}
        </div>
      </div>

      {/* Special Thanks footer */}
      <SpecialThanks />
    </section>
    </>
  );
}

export default Home;
