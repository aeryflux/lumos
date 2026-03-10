import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import type { EconomyData, CountryEconomyData } from '../services/economyService';
import './EconomyResults.css';

interface EconomyResultsProps {
  data: EconomyData;
  countryData?: CountryEconomyData;
  query: string;
  isLoading?: boolean;
  onClose?: () => void;
}

/**
 * Get icon based on trend direction
 */
function TrendIcon({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  switch (trend) {
    case 'up': return <TrendingUp size={12} className="economy-trend-icon economy-trend-icon--up" />;
    case 'down': return <TrendingDown size={12} className="economy-trend-icon economy-trend-icon--down" />;
    default: return <Minus size={12} className="economy-trend-icon economy-trend-icon--stable" />;
  }
}

/**
 * Format number with appropriate precision
 */
function formatValue(value: number, unit?: string): string {
  if (unit === '%') {
    return `${value.toFixed(1)}%`;
  }
  if (Math.abs(value) >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  }
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  }
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

/**
 * Format change percentage
 */
function formatChange(change: number): string {
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function EconomyResults({ data, countryData, query, isLoading, onClose }: EconomyResultsProps) {
  if (isLoading) {
    return (
      <div className="economy-results economy-results--loading">
        <div className="economy-loading">
          <DollarSign size={24} className="economy-loading-icon" />
          <span>Loading economic data...</span>
        </div>
      </div>
    );
  }

  const hasIndicators = data.indicators && data.indicators.length > 0;
  const hasMarkets = data.markets && data.markets.length > 0;
  const hasCurrencies = data.currencies && data.currencies.length > 0;
  const hasCountries = countryData && Object.keys(countryData).length > 0;

  if (!hasIndicators && !hasMarkets && !hasCurrencies && !hasCountries) {
    return (
      <div className="economy-results economy-results--empty">
        <p>No economic data found for "{query}"</p>
        <button className="economy-close-btn" onClick={onClose}>
          Try another search
        </button>
      </div>
    );
  }

  return (
    <div className="economy-results">
      <div className="economy-header">
        <span className="economy-title">Economic Data</span>
        <button className="economy-close-btn" onClick={onClose}>×</button>
      </div>

      <div className="economy-content">
        {/* Indicators */}
        {hasIndicators && (
          <div className="economy-section">
            <h4 className="economy-section-title">Indicators</h4>
            <div className="economy-indicators">
              {data.indicators.slice(0, 4).map((indicator, index) => (
                <div key={index} className="economy-indicator">
                  <div className="economy-indicator-header">
                    <span className="economy-indicator-name">{indicator.name}</span>
                    <TrendIcon trend={indicator.trend} />
                  </div>
                  <div className="economy-indicator-value">
                    {formatValue(indicator.value, indicator.unit)}
                  </div>
                  <div className={`economy-indicator-change economy-indicator-change--${indicator.trend}`}>
                    {formatChange(indicator.change)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Markets */}
        {hasMarkets && (
          <div className="economy-section">
            <h4 className="economy-section-title">Markets</h4>
            <div className="economy-markets">
              {data.markets!.slice(0, 4).map((market, index) => (
                <div key={index} className="economy-market">
                  <div className="economy-market-header">
                    <span className="economy-market-name">{market.name}</span>
                    {market.country && (
                      <span className="economy-market-country">{market.country}</span>
                    )}
                  </div>
                  <div className="economy-market-data">
                    <span className="economy-market-value">
                      {formatValue(market.value)}
                    </span>
                    <span className={`economy-market-change economy-market-change--${market.trend}`}>
                      <TrendIcon trend={market.trend} />
                      {formatChange(market.change)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Currencies */}
        {hasCurrencies && (
          <div className="economy-section">
            <h4 className="economy-section-title">Currencies (vs USD)</h4>
            <div className="economy-currencies">
              {data.currencies!.slice(0, 4).map((currency, index) => (
                <div key={index} className="economy-currency">
                  <span className="economy-currency-code">{currency.code}</span>
                  <span className="economy-currency-rate">{currency.rate.toFixed(4)}</span>
                  <span className={`economy-currency-change economy-currency-change--${currency.trend}`}>
                    <TrendIcon trend={currency.trend} />
                    {formatChange(currency.change)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Country data */}
        {hasCountries && (
          <div className="economy-section">
            <h4 className="economy-section-title">By Country</h4>
            <div className="economy-countries">
              {Object.entries(countryData!).slice(0, 5).map(([country, info]) => (
                <div key={country} className="economy-country-item">
                  <span className="economy-country-name">{country}</span>
                  <div className="economy-country-stats">
                    {info.gdp && (
                      <span className="economy-country-gdp">
                        GDP: ${formatValue(info.gdp)}B
                      </span>
                    )}
                    {info.gdpGrowth !== undefined && (
                      <span className={`economy-country-growth economy-country-growth--${info.trend || 'stable'}`}>
                        {formatChange(info.gdpGrowth)}
                      </span>
                    )}
                    {info.inflation !== undefined && (
                      <span className="economy-country-inflation">
                        Inflation: {info.inflation.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EconomyResults;
