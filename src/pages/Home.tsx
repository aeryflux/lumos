import { lazy, Suspense, useState, useCallback, useMemo, useEffect } from 'react';
import { Github, ExternalLink } from 'lucide-react';
import { useThemeColors } from '../hooks/useThemeColors';
import { useEffects } from '../contexts/EffectsContext';
import { SmartInput } from '../components/SmartInput';
import { NewsResults } from '../components/NewsResults';
import { WeatherResults } from '../components/WeatherResults';
import { WikiResults } from '../components/WikiResults';
import { HexLoader } from '../components/HexLoader';
import { SpecialThanks } from '../components/SpecialThanks';
import { executeSearch, type SearchMode } from '../services/searchService';
import type { NewsArticle, CountryNewsData } from '../services/newsService';
import type { WeatherDataMap, WeatherView } from '../services/weatherService';
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

export function Home() {
  const themeColors = useThemeColors();
  const { triggerEffect } = useEffects();
  const [inputFocused, setInputFocused] = useState(false);
  const [queryState, setQueryState] = useState<QueryState>('idle');
  const [results, setResults] = useState<SearchResults | null>(null);
  // Auto-demo state: shows preview data on globe without full results panel
  const [demoData, setDemoData] = useState<{ countryData: CountryDataMap; color: string } | null>(null);

  // Trigger laser scan effect on page load (uses theme accent color)
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      triggerEffect('laser-scan'); // No color = uses theme accent
    }, 100);
    return () => clearTimeout(timer);
  }, [triggerEffect]);

  // Handle auto-demo: search in background and update globe only
  const handleDemoChange = useCallback(async (query: string, mode: SearchMode) => {
    try {
      const searchResult = await executeSearch(query, mode);
      const highlightColor = MODE_HIGHLIGHT_COLORS[searchResult.mode] || '#00ff88';

      // Extract country data based on mode
      let countryData: CountryDataMap = {};
      if (searchResult.mode === 'news' && searchResult.newsCountryData) {
        for (const [country, info] of Object.entries(searchResult.newsCountryData)) {
          countryData[country] = { scale: info.scale, color: info.color || highlightColor };
        }
      } else if (searchResult.mode === 'weather' && searchResult.weatherData) {
        for (const [country, info] of Object.entries(searchResult.weatherData)) {
          countryData[country] = { scale: info.scale, color: info.color || highlightColor };
        }
      } else if (searchResult.mode === 'wiki' && searchResult.wikiData) {
        for (const [country, info] of Object.entries(searchResult.wikiData)) {
          countryData[country] = { scale: info.scale, color: info.color || highlightColor };
        }
      }

      // Only trigger effect and update if we have data
      if (Object.keys(countryData).length > 0) {
        triggerEffect('laser-scan');
        setDemoData({ countryData, color: highlightColor });
      }
    } catch (error) {
      console.error('Demo search error:', error);
    }
  }, [triggerEffect]);

  const handleQuery = useCallback(async (query: string, mode: SearchMode) => {
    // Clear demo mode when user submits real query
    setDemoData(null);
    setQueryState('loading');

    // Trigger laser scan effect with consistent green color
    triggerEffect('laser-scan');

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
    showCities: false,
    countryColor: themeColors.globeCountry,
    globeFillColor: themeColors.globeFill,
    isLightTheme: themeColors.isLightTheme,
    forceTransparent: true,
    countryData: globeCountryData,
    dataHighlightColor,
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
          {/* Logo/Title */}
          <h1 className="home-title">
            <span className="home-title-text">AeryFlux</span>
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
