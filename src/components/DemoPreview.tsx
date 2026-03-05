/**
 * DemoPreview - Interactive preview module for auto-demo mode
 *
 * Shows contextual information based on the current demo query
 * with smooth fade transitions between states.
 */

import { useState, useEffect, useRef } from 'react';
import { Newspaper, Cloud, BookOpen, Globe, TrendingUp, MapPin } from 'lucide-react';
import type { SearchMode } from '../services/searchService';
import './DemoPreview.css';

interface DemoPreviewProps {
  query: string;
  mode: SearchMode;
  isVisible: boolean;
  /** Country data from current demo search */
  countryCount?: number;
  /** Primary country from demo results */
  primaryCountry?: string;
}

// Mode-specific icons and colors
const MODE_CONFIG: Record<SearchMode, { icon: typeof Newspaper; color: string; label: string }> = {
  auto: { icon: Globe, color: '#00ff88', label: 'Explorer' },
  news: { icon: Newspaper, color: '#ef4444', label: 'Actualités' },
  weather: { icon: Cloud, color: '#3b82f6', label: 'Météo' },
  wiki: { icon: BookOpen, color: '#888888', label: 'Encyclopédie' },
};

// Demo insights based on mode
const MODE_INSIGHTS: Record<SearchMode, string[]> = {
  auto: [
    'Recherche intelligente',
    'Détection automatique du contexte',
    'Multi-sources',
  ],
  news: [
    'Sources mondiales',
    'Mise à jour en temps réel',
    'Couverture internationale',
  ],
  weather: [
    'Données météo globales',
    'Prévisions actualisées',
    'Températures mondiales',
  ],
  wiki: [
    'Connaissances encyclopédiques',
    'Données géographiques',
    'Histoire & culture',
  ],
};

export function DemoPreview({
  query,
  mode,
  isVisible,
  countryCount = 0,
  primaryCountry,
}: DemoPreviewProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayQuery, setDisplayQuery] = useState(query);
  const [displayMode, setDisplayMode] = useState(mode);
  const prevQueryRef = useRef(query);

  const modeConfig = MODE_CONFIG[displayMode] || MODE_CONFIG.auto;
  const ModeIcon = modeConfig.icon;
  const insights = MODE_INSIGHTS[displayMode] || MODE_INSIGHTS.auto;

  // Handle query/mode changes with animation
  useEffect(() => {
    if (query !== prevQueryRef.current) {
      setIsAnimating(true);

      // Wait for fade out, then update content
      const timer = setTimeout(() => {
        setDisplayQuery(query);
        setDisplayMode(mode);
        setIsAnimating(false);
      }, 200);

      prevQueryRef.current = query;
      return () => clearTimeout(timer);
    }
  }, [query, mode]);

  if (!isVisible) return null;

  return (
    <div className={`demo-preview ${isAnimating ? 'demo-preview--animating' : ''}`}>
      {/* Mode indicator */}
      <div className="demo-preview-header">
        <div
          className="demo-preview-mode"
          style={{ '--mode-color': modeConfig.color } as React.CSSProperties}
        >
          <ModeIcon size={14} />
          <span>{modeConfig.label}</span>
        </div>
        {countryCount > 0 && (
          <div className="demo-preview-stat">
            <MapPin size={12} />
            <span>{countryCount} pays</span>
          </div>
        )}
      </div>

      {/* Query display */}
      <div className="demo-preview-query">
        <span className="demo-preview-query-text">{displayQuery}</span>
      </div>

      {/* Insights chips */}
      <div className="demo-preview-insights">
        {insights.slice(0, 2).map((insight, i) => (
          <span key={i} className="demo-preview-chip">
            <TrendingUp size={10} />
            {insight}
          </span>
        ))}
      </div>

      {/* Primary country highlight */}
      {primaryCountry && (
        <div className="demo-preview-highlight">
          <Globe size={12} />
          <span>{primaryCountry}</span>
        </div>
      )}
    </div>
  );
}

export default DemoPreview;
