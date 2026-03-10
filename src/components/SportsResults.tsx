import { ExternalLink, Trophy, Clock } from 'lucide-react';
import type { SportsArticle } from '../services/sportsService';
import './SportsResults.css';

interface SportsResultsProps {
  articles: SportsArticle[];
  query: string;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Format date as relative time (e.g., "2h ago", "3 days ago")
 */
function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function SportsResults({ articles, query, isLoading, onClose }: SportsResultsProps) {
  if (isLoading) {
    return (
      <div className="sports-results sports-results--loading">
        <div className="sports-loading">
          <Trophy size={24} className="sports-loading-icon" />
          <span>Searching sports news...</span>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="sports-results sports-results--empty">
        <p>No sports news found for "{query}"</p>
        <button className="sports-close-btn" onClick={onClose}>
          Try another search
        </button>
      </div>
    );
  }

  return (
    <div className="sports-results">
      <div className="sports-header">
        <span className="sports-count">{articles.length} articles</span>
        <button className="sports-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="sports-list">
        {articles.slice(0, 5).map((article, index) => (
          <a
            key={index}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="sports-item"
            style={{ '--article-color': article.color || '#f59e0b' } as React.CSSProperties}
          >
            <span className="sports-item-badge" />
            <div className="sports-item-content">
              <h3 className="sports-item-title">{article.title}</h3>
              <p className="sports-item-snippet">{article.snippet}</p>
              <div className="sports-item-meta">
                {article.source && <span className="sports-source">{article.source}</span>}
                {article.sport && (
                  <span className="sports-sport">{article.sport}</span>
                )}
                {article.league && (
                  <span className="sports-league">{article.league}</span>
                )}
                {article.date && (
                  <span className="sports-date">
                    <Clock size={9} />
                    {formatRelativeTime(article.date)}
                  </span>
                )}
              </div>
              {article.teams && article.teams.length > 0 && (
                <div className="sports-teams">
                  {article.teams.map((team, i) => (
                    <span key={i} className="sports-team">{team}</span>
                  ))}
                </div>
              )}
            </div>
            <ExternalLink size={14} className="sports-item-icon" />
          </a>
        ))}
      </div>

      {articles.length > 5 && (
        <div className="sports-more">
          <span>+{articles.length - 5} more articles</span>
        </div>
      )}
    </div>
  );
}

export default SportsResults;
