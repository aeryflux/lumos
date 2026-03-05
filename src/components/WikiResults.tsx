import { BookOpen, ExternalLink, MapPin, FileText } from 'lucide-react';
import type { WikiDataMap } from '../services/wikiService';
import './WikiResults.css';

interface WikiResultsProps {
  data: WikiDataMap;
  query: string;
  isLoading?: boolean;
  onClose?: () => void;
}

export function WikiResults({ data, query, isLoading, onClose }: WikiResultsProps) {
  if (isLoading) {
    return (
      <div className="wiki-results wiki-results--loading">
        <div className="wiki-loading">
          <BookOpen size={24} className="wiki-loading-icon" />
          <span>Searching Wikipedia...</span>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div className="wiki-results wiki-results--empty">
        <p>No Wikipedia data for "{query}"</p>
        <button className="wiki-close-btn" onClick={onClose}>
          Try another search
        </button>
      </div>
    );
  }

  // Sort by scale (most relevant first)
  const sorted = entries
    .sort((a, b) => (b[1].scale ?? 0) - (a[1].scale ?? 0))
    .slice(0, 6);

  return (
    <div className="wiki-results">
      <div className="wiki-header">
        <span className="wiki-title">
          <BookOpen size={14} />
          Wikipedia
        </span>
        <button className="wiki-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="wiki-list">
        {sorted.map(([country, countryData]) => {
          const relevance = Math.round(countryData.scale * 100);
          return (
            <a
              key={country}
              href={`https://en.wikipedia.org/wiki/${encodeURIComponent(country)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wiki-item"
              style={{ '--wiki-color': countryData.color || '#888888' } as React.CSSProperties}
            >
              <MapPin size={14} className="wiki-item-icon" />
              <div className="wiki-item-content">
                <span className="wiki-item-country">{country}</span>
                <div className="wiki-item-bar">
                  <div
                    className="wiki-item-bar-fill"
                    style={{ width: `${relevance}%` }}
                  />
                </div>
              </div>
              <div className="wiki-item-meta">
                {countryData.articleCount && (
                  <span className="wiki-item-count">
                    <FileText size={10} />
                    {countryData.articleCount}
                  </span>
                )}
                <span className="wiki-item-scale">{relevance}%</span>
              </div>
              <ExternalLink size={12} className="wiki-item-link" />
            </a>
          );
        })}
      </div>

      <a
        href={`https://atlas.aeryflux.com?mode=wiki&q=${encodeURIComponent(query)}`}
        className="wiki-atlas-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Explore on globe</span>
        <ExternalLink size={12} />
      </a>
    </div>
  );
}

export default WikiResults;
