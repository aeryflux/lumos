/**
 * DemoPreview - Real data preview for auto-demo mode
 *
 * Displays actual useful information based on the search results:
 * - News: First article with link, source, theme badge, relative time
 * - Weather: Temperature, humidity, wind, condition icon
 * - Wiki: Article count with Wikipedia link, or global stats
 * - Sports: Sports news with league/team info
 * - Economy: Market indicators with trends
 */

import { useState, useEffect, useRef } from 'react';
import { Newspaper, Cloud, BookOpen, Globe, ExternalLink, MapPin, TrendingUp, TrendingDown, Trophy, DollarSign, Wind, Droplets, Clock } from 'lucide-react';
import { useTranslation } from '../i18n';
import type { SearchMode } from '../services/searchService';
import type { NewsArticle } from '../services/newsService';
import type { WeatherCountryData } from '../services/weatherService';
import type { SportsArticle } from '../services/sportsService';
import type { EconomyIndicator } from '../services/economyService';
import './DemoPreview.css';

interface GlobalStats {
  avgTemp?: number;
  minTemp?: number;
  maxTemp?: number;
  totalArticles?: number;
  totalMatches?: number;
  marketsTracked?: number;
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
  /** Sports article for Sports mode */
  sportsArticle?: SportsArticle;
  /** Economy indicator for Economy mode */
  economyIndicator?: EconomyIndicator;
}

// Mode-specific icons and colors
const MODE_CONFIG: Record<SearchMode, { icon: typeof Newspaper; color: string }> = {
  auto: { icon: Globe, color: '#00ff88' },
  news: { icon: Newspaper, color: '#ef4444' },
  weather: { icon: Cloud, color: '#3b82f6' },
  wiki: { icon: BookOpen, color: '#888888' },
  sports: { icon: Trophy, color: '#f59e0b' },
  economy: { icon: DollarSign, color: '#10b981' },
};

/**
 * Format date as relative time (e.g., "2h ago")
 */
function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

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
  sportsArticle,
  economyIndicator,
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
    sportsArticle,
    economyIndicator,
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
          sportsArticle,
          economyIndicator,
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
        sportsArticle,
        economyIndicator,
      });
    }
  }, [query, mode, isGlobal, targetCountry, article, weatherData, articleCount, globalStats, sportsArticle, economyIndicator]);

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
      case 'sports':
        return renderSportsContent();
      case 'economy':
        return renderEconomyContent();
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
        <div className="demo-preview-news-meta">
          {displayData.article.source && (
            <span className="demo-preview-source">{displayData.article.source}</span>
          )}
          {displayData.article.theme && (
            <span
              className="demo-preview-theme-badge"
              style={{ backgroundColor: displayData.article.theme.color }}
            >
              {displayData.article.theme.name}
            </span>
          )}
          {displayData.article.date && (
            <span className="demo-preview-time">
              <Clock size={10} />
              {formatRelativeTime(displayData.article.date)}
            </span>
          )}
        </div>
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

    const { temperature, condition, humidity, windSpeed } = displayData.weatherData;
    const weatherIcon = condition ? WEATHER_CONDITIONS[condition] || '🌡️' : '🌡️';

    return (
      <div className="demo-preview-weather">
        <div className="demo-preview-weather-main">
          <span className="demo-preview-weather-icon">{weatherIcon}</span>
          <span className="demo-preview-weather-temp">
            {temperature !== undefined ? `${Math.round(temperature)}°C` : '--'}
          </span>
        </div>
        <div className="demo-preview-weather-details">
          {humidity !== undefined && (
            <span className="demo-preview-weather-detail">
              <Droplets size={10} />
              {humidity}%
            </span>
          )}
          {windSpeed !== undefined && (
            <span className="demo-preview-weather-detail">
              <Wind size={10} />
              {windSpeed} km/h
            </span>
          )}
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

  const renderSportsContent = () => {
    if (!displayData.sportsArticle) {
      return (
        <div className="demo-preview-empty">
          <span>{t('search.loading')}</span>
        </div>
      );
    }

    return (
      <div className="demo-preview-sports">
        <a
          href={displayData.sportsArticle.link}
          target="_blank"
          rel="noopener noreferrer"
          className="demo-preview-article demo-preview-article--sports"
        >
          <span className="demo-preview-article-title">
            {displayData.sportsArticle.title.length > 80
              ? displayData.sportsArticle.title.slice(0, 80) + '...'
              : displayData.sportsArticle.title}
          </span>
          <ExternalLink size={12} className="demo-preview-article-icon" />
        </a>
        <div className="demo-preview-sports-meta">
          {displayData.sportsArticle.source && (
            <span className="demo-preview-source">{displayData.sportsArticle.source}</span>
          )}
          {displayData.sportsArticle.league && (
            <span className="demo-preview-league">{displayData.sportsArticle.league}</span>
          )}
          {displayData.sportsArticle.sport && (
            <span className="demo-preview-sport-badge">{displayData.sportsArticle.sport}</span>
          )}
          {displayData.sportsArticle.date && (
            <span className="demo-preview-time">
              <Clock size={10} />
              {formatRelativeTime(displayData.sportsArticle.date)}
            </span>
          )}
        </div>
        {displayData.sportsArticle.teams && displayData.sportsArticle.teams.length > 0 && (
          <div className="demo-preview-teams">
            {displayData.sportsArticle.teams.slice(0, 2).map((team, i) => (
              <span key={i} className="demo-preview-team">{team}</span>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderEconomyContent = () => {
    if (!displayData.economyIndicator) {
      return (
        <div className="demo-preview-empty">
          <span>{t('search.loading')}</span>
        </div>
      );
    }

    const indicator = displayData.economyIndicator;
    const TrendIconComponent = indicator.trend === 'up' ? TrendingUp : indicator.trend === 'down' ? TrendingDown : null;

    return (
      <div className="demo-preview-economy">
        <div className="demo-preview-economy-main">
          <div className="demo-preview-economy-header">
            <span className="demo-preview-economy-name">{indicator.name}</span>
            {TrendIconComponent && (
              <TrendIconComponent
                size={14}
                className={`demo-preview-economy-trend demo-preview-economy-trend--${indicator.trend}`}
              />
            )}
          </div>
          <div className="demo-preview-economy-value">
            {indicator.value.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            {indicator.unit}
          </div>
          <div className={`demo-preview-economy-change demo-preview-economy-change--${indicator.trend}`}>
            {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(2)}%
          </div>
        </div>
        {displayData.targetCountry && (
          <div className="demo-preview-country">
            <MapPin size={12} />
            <span>{displayData.targetCountry}</span>
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
