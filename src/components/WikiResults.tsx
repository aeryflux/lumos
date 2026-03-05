import { BookOpen, ExternalLink, Globe } from 'lucide-react';
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
        {sorted.map(([country, countryData]) => (
          <a
            key={country}
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(country)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="wiki-item"
            style={{ '--wiki-color': countryData.color || '#888888' } as React.CSSProperties}
          >
            <Globe size={14} className="wiki-item-icon" />
            <span className="wiki-item-country">{country}</span>
            <span className="wiki-item-scale">
              {(countryData.scale * 100).toFixed(0)}%
            </span>
          </a>
        ))}
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
