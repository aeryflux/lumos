/**
 * Weather Service - Fetch weather data from Pythagoras API
 */

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export interface WeatherView {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon?: string;
  unit?: string;
  description?: string;
}

export interface WeatherCountryData {
  scale: number;
  lat: number | null;
  lon: number | null;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  color?: string;
  normalizedValue?: number;
  viewValue?: number;
  viewUnit?: string;
  viewName?: string;
}

export type WeatherDataMap = Record<string, WeatherCountryData>;

/**
 * Fetch weather views (temperature, humidity, etc.)
 */
export async function fetchWeatherViews(): Promise<WeatherView[]> {
  try {
    const response = await fetch(`${API_BASE}/api/weather/views`);
    if (!response.ok) throw new Error('Failed to fetch views');

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Weather views fetch error:', error);
    return [];
  }
}

/**
 * Fetch weather data for globe visualization
 */
export async function fetchWeatherData(query?: string, view?: string): Promise<{ data: WeatherDataMap; view?: WeatherView }> {
  const url = new URL(`${API_BASE}/api/weather/data`);
  if (query) url.searchParams.set('query', query);
  if (view) url.searchParams.set('view', view);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Failed: ${response.status}`);

    const result = await response.json();
    return { data: result.data || {}, view: result.view };
  } catch (error) {
    console.error('Weather data fetch error:', error);
    return { data: {} };
  }
}

/**
 * Detect if query is weather-related
 */
export function isWeatherQuery(query: string): boolean {
  const weatherKeywords = [
    'weather', 'météo', 'meteo', 'temperature', 'temp',
    'climate', 'climat', 'tropical', 'arctic', 'polar',
    'rain', 'pluie', 'sun', 'soleil', 'cloud', 'nuage',
    'wind', 'vent', 'humidity', 'humidité', 'forecast',
    'hot', 'cold', 'chaud', 'froid', 'storm', 'orage',
    'snow', 'neige', 'sunny', 'ensoleillé', 'foggy', 'brouillard'
  ];
  const lowerQuery = query.toLowerCase();
  return weatherKeywords.some(kw => lowerQuery.includes(kw));
}
