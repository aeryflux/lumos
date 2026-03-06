/**
 * DemoPreview - Real data preview for auto-demo mode
 *
 * Displays actual useful information based on the search results:
 * - News: First article with link, or global article count
 * - Weather: Temperature for country, or global temp range
 * - Wiki: Article count with Wikipedia link, or global stats
 */

import { useState, useEffect, useRef } from 'react';
import { Newspaper, Cloud, BookOpen, Globe, ExternalLink, MapPin, TrendingUp } from 'lucide-react';
import { useTranslation } from '../i18n';
import type { SearchMode } from '../services/searchService';
import type { NewsArticle } from '../services/newsService';
import type { WeatherCountryData } from '../services/weatherService';
import './DemoPreview.css';

interface GlobalStats {
  avgTemp?: number;
  minTemp?: number;
  maxTemp?: number;
  totalArticles?: number;
}

interface DemoPreviewProps {
  query: string;
  mode: SearchMode;
  isVisible: boolean;
  isGlobal?: boolean;
  /** Target country for specific queries */
  targetCountry?: string;
  /** First news article for News mode */
  article?: NewsArticle;
  /** Weather data for target country */
  weatherData?: WeatherCountryData;
  /** Article count for Wiki mode */
  articleCount?: number;
  /** Number of countries with data */
  countryCount?: number;
  /** Global statistics for worldwide queries */
  globalStats?: GlobalStats;
}

// Mode-specific icons and colors
const MODE_CONFIG: Record<SearchMode, { icon: typeof Newspaper; color: string }> = {
  auto: { icon: Globe, color: '#00ff88' },
  news: { icon: Newspaper, color: '#ef4444' },
  weather: { icon: Cloud, color: '#3b82f6' },
  wiki: { icon: BookOpen, color: '#888888' },
};

// Weather condition icons
const WEATHER_CONDITIONS: Record<string, string> = {
  sunny: '☀️',
  clear: '☀️',
  partly_cloudy: '⛅',
  cloudy: '☁️',
  overcast: '☁️',
  rain: '🌧️',
  drizzle: '🌧️',
  snow: '❄️',
  storm: '⛈️',
  fog: '🌫️',
  mist: '🌫️',
};

export function DemoPreview({
  query,
  mode,
  isVisible,
  isGlobal = false,
  targetCountry,
  article,
  weatherData,
  articleCount,
  countryCount = 0,
  globalStats,
}: DemoPreviewProps) {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayData, setDisplayData] = useState({
    query,
    mode,
    isGlobal,
    targetCountry,
    article,
    weatherData,
    articleCount,
    globalStats,
  });
  const prevQueryRef = useRef(query);

  const modeConfig = MODE_CONFIG[displayData.mode] || MODE_CONFIG.auto;
  const ModeIcon = modeConfig.icon;
  const modeLabel = t(`search.modes.${displayData.mode}`);

  // Handle data changes with animation
  useEffect(() => {
    if (query !== prevQueryRef.current) {
      setIsAnimating(true);

      const timer = setTimeout(() => {
        setDisplayData({
          query,
          mode,
          isGlobal,
          targetCountry,
          article,
          weatherData,
          articleCount,
          globalStats,
        });
        setIsAnimating(false);
      }, 200);

      prevQueryRef.current = query;
      return () => clearTimeout(timer);
    } else {
      setDisplayData({
        query,
        mode,
        isGlobal,
        targetCountry,
        article,
        weatherData,
        articleCount,
        globalStats,
      });
    }
  }, [query, mode, isGlobal, targetCountry, article, weatherData, articleCount, globalStats]);

  if (!isVisible) return null;

  // Render content based on mode and global flag
  const renderContent = () => {
    if (displayData.isGlobal) {
      return renderGlobalContent();
    }
    switch (displayData.mode) {
      case 'news':
        return renderNewsContent();
      case 'weather':
        return renderWeatherContent();
      case 'wiki':
        return renderWikiContent();
      default:
        return renderDefaultContent();
    }
  };

  const renderGlobalContent = () => {
    const stats = displayData.globalStats;

    if (displayData.mode === 'weather' && stats) {
      return (
        <div className="demo-preview-global">
          <div className="demo-preview-global-title">
            <Globe size={16} />
            <span>{t('search.global.weather')}</span>
          </div>
          <div className="demo-preview-global-stats">
            <div className="demo-preview-stat-item">
              <span className="demo-preview-stat-label">{t('search.global.avg')}</span>
              <span className="demo-preview-stat-value">
                {stats.avgTemp !== undefined ? `${Math.round(stats.avgTemp)}°C` : '--'}
              </span>
            </div>
            <div className="demo-preview-stat-item">
              <span className="demo-preview-stat-label">{t('search.global.min')}</span>
              <span className="demo-preview-stat-value demo-preview-stat-cold">
                {stats.minTemp !== undefined ? `${Math.round(stats.minTemp)}°C` : '--'}
              </span>
            </div>
            <div className="demo-preview-stat-item">
              <span className="demo-preview-stat-label">{t('search.global.max')}</span>
              <span className="demo-preview-stat-value demo-preview-stat-hot">
                {stats.maxTemp !== undefined ? `${Math.round(stats.maxTemp)}°C` : '--'}
              </span>
            </div>
          </div>
        </div>
      );
    }

    if (displayData.mode === 'news' && stats?.totalArticles) {
      return (
        <div className="demo-preview-global">
          <div className="demo-preview-global-title">
            <Newspaper size={16} />
            <span>{t('search.global.news')}</span>
          </div>
          <div className="demo-preview-global-highlight">
            <TrendingUp size={14} />
            <span>{t('search.global.articles', { count: stats.totalArticles })}</span>
          </div>
          {displayData.article && (
            <a
              href={displayData.article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="demo-preview-article demo-preview-article--compact"
            >
              <span className="demo-preview-article-title">
                {displayData.article.title.length > 60
                  ? displayData.article.title.slice(0, 60) + '...'
                  : displayData.article.title}
              </span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      );
    }

    if (displayData.mode === 'wiki' && stats?.totalArticles) {
      return (
        <div className="demo-preview-global">
          <div className="demo-preview-global-title">
            <BookOpen size={16} />
            <span>{t('search.global.wiki')}</span>
          </div>
          <div className="demo-preview-global-highlight">
            <Globe size={14} />
            <span>{t('search.global.indexed', { count: stats.totalArticles.toLocaleString() })}</span>
          </div>
        </div>
      );
    }

    return renderDefaultContent();
  };

  const renderNewsContent = () => {
    if (!displayData.article) {
      return (
        <div className="demo-preview-empty">
          <span>{t('search.loading')}</span>
        </div>
      );
    }

    return (
      <div className="demo-preview-news">
        <a
          href={displayData.article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="demo-preview-article"
        >
          <span className="demo-preview-article-title">
            {displayData.article.title.length > 80
              ? displayData.article.title.slice(0, 80) + '...'
              : displayData.article.title}
          </span>
          <ExternalLink size={12} className="demo-preview-article-icon" />
        </a>
        {displayData.targetCountry && (
          <div className="demo-preview-country">
            <MapPin size={12} />
            <span>{displayData.targetCountry}</span>
          </div>
        )}
      </div>
    );
  };

  const renderWeatherContent = () => {
    if (!displayData.weatherData || !displayData.targetCountry) {
      return (
        <div className="demo-preview-empty">
          <span>{t('search.loading')}</span>
        </div>
      );
    }

    const { temperature, condition } = displayData.weatherData;
    const weatherIcon = condition ? WEATHER_CONDITIONS[condition] || '🌡️' : '🌡️';

    return (
      <div className="demo-preview-weather">
        <div className="demo-preview-weather-main">
          <span className="demo-preview-weather-icon">{weatherIcon}</span>
          <span className="demo-preview-weather-temp">
            {temperature !== undefined ? `${Math.round(temperature)}°C` : '--'}
          </span>
        </div>
        <div className="demo-preview-weather-location">
          <MapPin size={12} />
          <span>{displayData.targetCountry}</span>
        </div>
        {condition && (
          <span className="demo-preview-weather-condition">
            {condition.replace('_', ' ')}
          </span>
        )}
      </div>
    );
  };

  const renderWikiContent = () => {
    const wikiUrl = displayData.targetCountry
      ? `https://en.wikipedia.org/wiki/${encodeURIComponent(displayData.targetCountry)}`
      : `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(displayData.query)}`;

    return (
      <div className="demo-preview-wiki">
        <a
          href={wikiUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="demo-preview-wiki-link"
        >
          <BookOpen size={14} />
          <span>
            {displayData.targetCountry
              ? `Wikipedia: ${displayData.targetCountry}`
              : t('search.wiki.search', { query: displayData.query })}
          </span>
          <ExternalLink size={12} />
        </a>
        {displayData.articleCount !== undefined && displayData.articleCount > 0 && (
          <div className="demo-preview-wiki-count">
            <span>{t('search.articles', { count: displayData.articleCount.toLocaleString() })}</span>
          </div>
        )}
      </div>
    );
  };

  const renderDefaultContent = () => (
    <div className="demo-preview-default">
      <span className="demo-preview-query-text">{displayData.query}</span>
    </div>
  );

  return (
    <div className={`demo-preview ${isAnimating ? 'demo-preview--animating' : ''}`}>
      {/* Header with mode and country count - hide mode indicator for 'auto' */}
      <div className="demo-preview-header">
        {displayData.mode !== 'auto' && (
          <div
            className="demo-preview-mode"
            style={{ '--mode-color': modeConfig.color } as React.CSSProperties}
          >
            <ModeIcon size={14} />
            <span>{modeLabel}</span>
          </div>
        )}
        {countryCount > 0 && (
          <div className="demo-preview-stat">
            <Globe size={12} />
            <span>{t('search.countries', { count: countryCount })}</span>
          </div>
        )}
      </div>

      {/* Mode-specific content */}
      <div className="demo-preview-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default DemoPreview;
