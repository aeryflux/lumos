import { Cloud, Thermometer, Droplets, Wind, ExternalLink } from 'lucide-react';
import type { WeatherDataMap, WeatherView } from '../services/weatherService';
import './WeatherResults.css';

interface WeatherResultsProps {
  data: WeatherDataMap;
  view?: WeatherView;
  query: string;
  isLoading?: boolean;
  onClose?: () => void;
}

export function WeatherResults({ data, view, query, isLoading, onClose }: WeatherResultsProps) {
  if (isLoading) {
    return (
      <div className="weather-results weather-results--loading">
        <div className="weather-loading">
          <Cloud size={24} className="weather-loading-icon" />
          <span>Loading weather...</span>
        </div>
      </div>
    );
  }

  const entries = Object.entries(data);

  if (entries.length === 0) {
    return (
      <div className="weather-results weather-results--empty">
        <p>No weather data for "{query}"</p>
        <button className="weather-close-btn" onClick={onClose}>
          Try another search
        </button>
      </div>
    );
  }

  // Sort by temperature (highest first)
  const sorted = entries
    .filter(([, d]) => d.temperature !== undefined)
    .sort((a, b) => (b[1].temperature ?? 0) - (a[1].temperature ?? 0))
    .slice(0, 8);

  return (
    <div className="weather-results">
      <div className="weather-header">
        <span className="weather-title">
          <Thermometer size={14} />
          {view?.name || 'Temperature'}
        </span>
        <button className="weather-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="weather-grid">
        {sorted.map(([country, countryData]) => (
          <div key={country} className="weather-card">
            <div className="weather-card-country">{country}</div>
            <div className="weather-card-temp">
              {countryData.temperature?.toFixed(0) ?? '--'}°
            </div>
            <div className="weather-card-details">
              {countryData.humidity !== undefined && (
                <span className="weather-detail">
                  <Droplets size={10} />
                  {countryData.humidity}%
                </span>
              )}
              {countryData.windSpeed !== undefined && (
                <span className="weather-detail">
                  <Wind size={10} />
                  {countryData.windSpeed?.toFixed(0)} km/h
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <a
        href={`https://atlas.aeryflux.com?mode=weather&q=${encodeURIComponent(query)}`}
        className="weather-atlas-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>View on globe</span>
        <ExternalLink size={12} />
      </a>
    </div>
  );
}

export default WeatherResults;
