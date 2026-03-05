import { Cloud, Thermometer, Droplets, Wind, ExternalLink, Sun, CloudRain, Snowflake, CloudLightning } from 'lucide-react';
import type { WeatherDataMap, WeatherView } from '../services/weatherService';
import './WeatherResults.css';

interface WeatherResultsProps {
  data: WeatherDataMap;
  view?: WeatherView;
  query: string;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Get weather icon based on condition
 */
function getWeatherIcon(condition?: string) {
  if (!condition) return <Cloud size={16} />;
  const c = condition.toLowerCase();
  if (c.includes('sun') || c.includes('clear')) return <Sun size={16} />;
  if (c.includes('rain') || c.includes('shower')) return <CloudRain size={16} />;
  if (c.includes('snow')) return <Snowflake size={16} />;
  if (c.includes('thunder') || c.includes('storm')) return <CloudLightning size={16} />;
  return <Cloud size={16} />;
}

/**
 * Get temperature color based on value
 */
function getTempColor(temp: number): string {
  if (temp < -10) return '#60a5fa';  // Cold blue
  if (temp < 0) return '#93c5fd';    // Light blue
  if (temp < 15) return '#fcd34d';   // Yellow
  if (temp < 25) return '#fb923c';   // Orange
  return '#ef4444';                   // Hot red
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
        {sorted.map(([country, countryData]) => {
          const temp = countryData.temperature ?? 0;
          const tempColor = getTempColor(temp);
          return (
            <div
              key={country}
              className="weather-card"
              style={{ '--temp-color': tempColor } as React.CSSProperties}
            >
              <div className="weather-card-header">
                <span className="weather-card-icon">{getWeatherIcon(countryData.condition)}</span>
                <span className="weather-card-country">{country}</span>
              </div>
              <div className="weather-card-temp" style={{ color: tempColor }}>
                {temp.toFixed(0)}°
              </div>
              {countryData.condition && (
                <div className="weather-card-condition">{countryData.condition}</div>
              )}
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
          );
        })}
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
