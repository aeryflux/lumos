/**
 * Economy Service - Fetch economic data from Pythagoras API
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export interface EconomyIndicator {
  name: string;
  value: number;
  change: number;        // Percentage change
  trend: 'up' | 'down' | 'stable';
  unit?: string;
  date?: string;
}

export interface EconomyData {
  indicators: EconomyIndicator[];
  markets?: MarketData[];
  currencies?: CurrencyData[];
}

export interface MarketData {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  country?: string;
}

export interface CurrencyData {
  code: string;
  name: string;
  rate: number;          // Rate vs USD
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CountryEconomyData {
  [countryName: string]: {
    scale: number;          // Normalized 0-1 for globe extrusion
    lat: number | null;
    lon: number | null;
    color?: string;         // Economy-based color (green=growth, red=decline)
    gdp?: number;           // GDP in billions USD
    gdpGrowth?: number;     // GDP growth rate %
    inflation?: number;     // Inflation rate %
    trend?: 'up' | 'down' | 'stable';
  };
}

/**
 * Fetch economy data by query
 */
export async function fetchEconomyData(query?: string): Promise<EconomyData> {
  try {
    const url = new URL(`${API_BASE}/api/economy`);
    if (query) url.searchParams.set('query', query);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch economy data');

    const data = await response.json();
    return data || { indicators: [] };
  } catch (error) {
    console.error('Economy fetch error:', error);
    return { indicators: [] };
  }
}

/**
 * Fetch country economy data for globe visualization
 */
export async function fetchEconomyCountryData(query?: string): Promise<CountryEconomyData> {
  const url = new URL(`${API_BASE}/api/economy/countries`);
  if (query) url.searchParams.set('query', query);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed: ${response.status}`);

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error('Economy country data fetch error:', error);
    return {};
  }
}

/**
 * Detect if query is economy-related
 */
export function isEconomyQuery(query: string): boolean {
  const economyKeywords = [
    'economy', 'stock', 'market', 'finance', 'gdp', 'inflation',
    'bitcoin', 'crypto', 'bourse', 'economie', 'currency',
    'dollar', 'euro', 'trade', 'investment', 'nasdaq',
    'dow jones', 'cac 40', 'ftse', 'nikkei'
  ];
  const lowerQuery = query.toLowerCase();
  return economyKeywords.some(kw => lowerQuery.includes(kw));
}

/**
 * Get trend color based on value direction
 */
export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up': return '#10b981';    // Emerald (green)
    case 'down': return '#ef4444';  // Red
    case 'stable': return '#888888'; // Gray
  }
}
