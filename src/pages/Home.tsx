import { lazy, Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useEffects } from '../contexts/EffectsContext';
import { SmartInput } from '../components/SmartInput';
import { DemoPreview } from '../components/DemoPreview';
import { NewsResults } from '../components/NewsResults';
import { WeatherResults } from '../components/WeatherResults';
import { WikiResults } from '../components/WikiResults';
import { HexLoader } from '../components/HexLoader';
import { SpecialThanks } from '../components/SpecialThanks';
import { executeSearch, type SearchMode } from '../services/searchService';
import type { NewsArticle, CountryNewsData } from '../services/newsService';
import type { WeatherDataMap, WeatherView, WeatherCountryData } from '../services/weatherService';
import type { WikiDataMap } from '../services/wikiService';
import type { CountryDataMap } from '@aeryflux/globe/react';
import './Home.css';

// Lazy load the 3D globe for performance
const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

type QueryState = 'idle' | 'loading' | 'results';

interface SearchResults {
  mode: SearchMode;
  query: string;
  articles?: NewsArticle[];
  newsCountryData?: CountryNewsData;
  weatherData?: WeatherDataMap;
  weatherView?: WeatherView;
  wikiData?: WikiDataMap;
  fallbackToAtlas?: boolean;
}

// Mode-specific colors for globe highlights
const MODE_HIGHLIGHT_COLORS: Record<SearchMode, string> = {
  auto: '#00ff88',
  news: '#ef4444',
  wiki: '#888888',
  weather: '#3b82f6',
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

// Resolve country name from ISO code or return as-is
function resolveCountryName(code?: string): string | undefined {
  if (!code) return undefined;
  // If it's already a full name (more than 2-3 chars), return as-is
  if (code.length > 3) return code;
  return ISO_TO_COUNTRY[code.toUpperCase()] || code;
}

// Simple keyword-based mode detection for demo queries
function detectModeFromQuery(query: string): SearchMode {
  const lower = query.toLowerCase();
  if (lower.includes('news') || lower.includes('headline') || lower.includes('update')) {
    return 'news';
  }
  if (lower.includes('weather') || lower.includes('temperature') || lower.includes('climate') || lower.includes('météo')) {
    return 'weather';
  }
  if (lower.includes('about') || lower.includes('history') || lower.includes('wiki') || lower.includes('geography') || lower.includes('culture')) {
    return 'wiki';
  }
  return 'auto';
}

// Check if query is a global/worldwide request (no specific country)
function isGlobalQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return lower.includes('world') || lower.includes('global') ||
         lower.includes('worldwide') || lower.includes('mondial') ||
         lower.includes('international');
}

// Extract country name from query (simple approach)
function extractCountryFromQuery(query: string): string | undefined {
  const lower = query.toLowerCase();
  // Common country patterns in queries
  const countries = [
    'france', 'japan', 'germany', 'italy', 'spain', 'brazil', 'china', 'india',
    'russia', 'canada', 'australia', 'mexico', 'egypt', 'nigeria', 'kenya',
    'south africa', 'argentina', 'chile', 'peru', 'colombia', 'turkey',
    'thailand', 'vietnam', 'indonesia', 'malaysia', 'philippines', 'korea',
    'united states', 'usa', 'uk', 'united kingdom', 'britain',
  ];
  for (const country of countries) {
    if (lower.includes(country)) {
      // Capitalize first letter
      return country.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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
  // Auto-demo state: shows preview data on globe without full results panel
  const [demoData, setDemoData] = useState<{ countryData: CountryDataMap; color: string } | null>(null);
  // Track current demo data for the preview module
  const [demoInfo, setDemoInfo] = useState<{
    query: string;
    mode: SearchMode;
    countryCount: number;
    isGlobal: boolean;
    targetCountry?: string;
    article?: NewsArticle;
    weatherData?: WeatherCountryData;
    articleCount?: number;
    // Global stats
    globalStats?: {
      avgTemp?: number;
      minTemp?: number;
      maxTemp?: number;
      totalArticles?: number;
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

      // For API query: use extracted country name, or empty for global
      // "News Japan" → search with "Japan", not "News Japan"
      const searchQuery = isGlobal ? '' : (queryCountry || query);
      const searchResult = await executeSearch(searchQuery, effectiveMode !== 'auto' ? effectiveMode : mode);
      const highlightColor = MODE_HIGHLIGHT_COLORS[effectiveMode] || '#00ff88';

      // Extract country data based on mode
      let countryData: CountryDataMap = {};

      // Use query-extracted country, or resolve from API
      const rawTargetCountry = queryCountry || searchResult.targetCountry;
      const targetCountry = resolveCountryName(rawTargetCountry);

      // Mode-specific data extraction
      let article: NewsArticle | undefined;
      let weatherData: WeatherCountryData | undefined;
      let articleCount: number | undefined;
      let resolvedCountryForDisplay = targetCountry;
      let globalStats: { avgTemp?: number; minTemp?: number; maxTemp?: number; totalArticles?: number } | undefined;

      if (effectiveMode === 'news') {
        // Get first article for preview
        if (searchResult.articles && searchResult.articles.length > 0) {
          article = searchResult.articles[0];
        }
        // Build country data for globe
        if (searchResult.newsCountryData) {
          for (const [country, info] of Object.entries(searchResult.newsCountryData)) {
            countryData[country] = { scale: info.scale, color: info.color || highlightColor };
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
            countryData[country] = { scale: info.scale, color: info.color || highlightColor };
            if (info.temperature !== undefined) {
              temps.push(info.temperature);
            }
            // If specific country requested, extract its data
            if (!isGlobal && targetCountry && country.toLowerCase() === targetCountry.toLowerCase()) {
              weatherData = info;
              resolvedCountryForDisplay = country;
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
            countryData[country] = { scale: info.scale, color: info.color || highlightColor };
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
      }

      const countryCount = Object.keys(countryData).length;

      if (countryCount > 0) {
        triggerEffect('laser-scan', '#00ff88');
        setDemoData({ countryData, color: highlightColor });
        setDemoInfo({
          query,
          mode: effectiveMode,
          countryCount,
          isGlobal,
          targetCountry: isGlobal ? undefined : resolvedCountryForDisplay,
          article,
          weatherData: isGlobal ? undefined : weatherData,
          articleCount: isGlobal ? undefined : articleCount,
          globalStats,
        });
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

    const searchResult = await executeSearch(query, mode);

    setResults({
      mode: searchResult.mode,
      query: searchResult.query,
      articles: searchResult.articles,
      newsCountryData: searchResult.newsCountryData,
      weatherData: searchResult.weatherData,
      weatherView: searchResult.weatherView,
      wikiData: searchResult.wikiData,
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

    // Convert based on mode
    switch (results.mode) {
      case 'news':
        if (results.newsCountryData) {
          const data: CountryDataMap = {};
          for (const [country, info] of Object.entries(results.newsCountryData)) {
            data[country] = {
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
            data[country] = {
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
            data[country] = {
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

  // Get highlight color based on current mode
  const dataHighlightColor = useMemo(() => {
    if (results) return MODE_HIGHLIGHT_COLORS[results.mode];
    // Use demo color when idle
    return demoData?.color;
  }, [results, demoData]);

  // Globe props - animations disabled by default for minimalism
  const globeProps = useMemo(() => ({
    modelUrl: '/models/atlas_hex_subdiv_6.glb',
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
    dataHighlightColor,
    enableControls: true, // Enable mouse/touch drag rotation
  }), [themeColors, globeCountryData, dataHighlightColor]);

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
      default:
        return null;
    }
  };

  const hasResults = queryState !== 'idle';

  return (
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
              href="https://github.com/aeryflux/aeryflux"
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
  );
}

export default Home;
