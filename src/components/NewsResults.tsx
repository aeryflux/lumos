import { ExternalLink, Newspaper, Clock } from 'lucide-react';
import type { NewsArticle } from '../services/newsService';
import './NewsResults.css';

interface NewsResultsProps {
  articles: NewsArticle[];
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

export function NewsResults({ articles, query, isLoading, onClose }: NewsResultsProps) {
  if (isLoading) {
    return (
      <div className="news-results news-results--loading">
        <div className="news-loading">
          <Newspaper size={24} className="news-loading-icon" />
          <span>Searching news...</span>
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="news-results news-results--empty">
        <p>No news found for "{query}"</p>
        <button className="news-close-btn" onClick={onClose}>
          Try another search
        </button>
      </div>
    );
  }

  return (
    <div className="news-results">
      <div className="news-header">
        <span className="news-count">{articles.length} articles</span>
        <button className="news-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="news-list">
        {articles.slice(0, 5).map((article, index) => (
          <a
            key={index}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="news-item"
            style={{ '--article-color': article.theme?.color || article.color } as React.CSSProperties}
          >
            {article.theme && (
              <span
                className="news-item-badge"
                style={{ backgroundColor: article.theme.color }}
              />
            )}
            <div className="news-item-content">
              <h3 className="news-item-title">{article.title}</h3>
              <p className="news-item-snippet">{article.snippet}</p>
              <div className="news-item-meta">
                {article.source && <span className="news-source">{article.source}</span>}
                {article.date && (
                  <span className="news-date">
                    <Clock size={9} />
                    {formatRelativeTime(article.date)}
                  </span>
                )}
                {article.theme && (
                  <span className="news-theme" style={{ color: article.theme.color }}>
                    {article.theme.name}
                  </span>
                )}
              </div>
            </div>
            <ExternalLink size={14} className="news-item-icon" />
          </a>
        ))}
      </div>

      {articles.length > 5 && (
        <div className="news-more">
          <span>+{articles.length - 5} more articles</span>
        </div>
      )}
    </div>
  );
}

export default NewsResults;
