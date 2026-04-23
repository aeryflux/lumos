import { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { EntityExtractor, detectMode } from '@aeryflux/xenova-bridge';
import { useI18n } from '../i18n';
import './SearchBar.css';

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://api.aeryflux.com';

// Showcase sequence: 3 wiki → 3 weather → 3 news
const SHOWCASE_SEQUENCE = [
  'showcase.1',   // wiki — Japan
  'showcase.2',   // wiki — Brazil
  'showcase.3',   // wiki — South Korea
  'showcase.w1',  // weather — Colombia
  'showcase.w2',  // weather — Iceland
  'showcase.w3',  // weather — India
  'showcase.n1',  // news — sports
  'showcase.n2',  // news — technology
  '__global_news__', // news — world
];

const TYPING_SPEED = 45;
const SHOWCASE_INTERVAL = 10000;

// English country name for wiki showcase keys — bypasses NLP for non-Latin scripts
const SHOWCASE_COUNTRY_MAP: Record<string, string> = {
  'showcase.1': 'Japan',
  'showcase.2': 'Brazil',
  'showcase.3': 'South Korea',
};

// Country for weather showcase keys
const SHOWCASE_WEATHER_MAP: Record<string, string> = {
  'showcase.w1': 'Colombia',
  'showcase.w2': 'Iceland',
  'showcase.w3': 'India',
};

// Topic for news showcase keys
const SHOWCASE_NEWS_MAP: Record<string, string> = {
  'showcase.n1': 'sports',
  'showcase.n2': 'technology',
};

interface Entity { type: string; value: string; normalizedValue: string }
interface SearchResult { intent?: { category: string }; entities?: Entity[] }
interface CountryHighlight { scale: number; color?: string; extrusion?: number }
interface WikiSnippet { title: string; extract: string; url: string; rawExtract?: string; articleLinks?: string[] }
interface NewsItem { title: string; link: string; source?: string; color?: string; country?: string }
interface WeatherCard { temperature: number; condition: string; color: string; unit: string; countryName?: string }
interface WeatherSummaryItem { name: string; temperature: number; color: string }
interface GlobalWeatherSummary { hottest: WeatherSummaryItem[]; coldest: WeatherSummaryItem[] }

type SearchMode = 'auto' | 'news' | 'weather' | 'wiki';

interface SearchBarProps {
  onCountryHighlight?: (countries: Record<string, CountryHighlight>) => void;
}

export interface SearchBarHandle {
  setQuery: (q: string) => void;
}

// In-memory cache for global weather (expensive API call)
let weatherCache: Record<string, CountryHighlight> | null = null;
let weatherCacheTime = 0;
const WEATHER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
type RawWeatherEntry = { scale: number; color: string; temperature: number; condition: string; viewUnit: string };
let weatherRawData: Record<string, RawWeatherEntry> | null = null;

async function fetchGlobalWeather(): Promise<Record<string, CountryHighlight> | null> {
  if (weatherCache && Date.now() - weatherCacheTime < WEATHER_CACHE_TTL) return weatherCache;
  try {
    const res = await fetch(`${API_BASE}/api/weather/data?view=temperature`);
    if (!res.ok) return null;
    const { data } = await res.json();
    weatherRawData = data as Record<string, RawWeatherEntry>;
    const highlights: Record<string, CountryHighlight> = {};
    for (const [country, info] of Object.entries(data as Record<string, { scale: number; color: string }>)) {
      highlights[country] = { scale: info.scale, color: info.color, extrusion: info.scale * 0.3 };
    }
    weatherCache = highlights;
    weatherCacheTime = Date.now();
    return highlights;
  } catch { return null; }
}

function getGlobalWeatherSummary(): GlobalWeatherSummary | null {
  if (!weatherRawData) return null;
  const entries = Object.entries(weatherRawData)
    .filter(([, v]) => typeof v.temperature === 'number')
    .sort((a, b) => b[1].temperature - a[1].temperature);
  return {
    hottest: entries.slice(0, 3).map(([name, v]) => ({ name, temperature: v.temperature, color: v.color })),
    coldest: entries.slice(-3).reverse().map(([name, v]) => ({ name, temperature: v.temperature, color: v.color })),
  };
}

// Condition labels for all supported languages — no extra API call needed
const CONDITION_LABELS: Record<string, Partial<Record<string, string>>> = {
  sunny:         { en: 'Sunny', fr: 'Ensoleillé', es: 'Soleado', de: 'Sonnig', it: 'Soleggiato', pt: 'Ensolarado', ru: 'Солнечно', ja: '晴れ', ko: '맑음', zh: '晴天', nl: 'Zonnig', pl: 'Słonecznie', tr: 'Güneşli', sv: 'Soligt', id: 'Cerah' },
  partly_cloudy: { en: 'Partly cloudy', fr: 'Partiellement nuageux', es: 'Parcialmente nublado', de: 'Teils bewölkt', it: 'Parzialmente nuvoloso', pt: 'Parcialmente nublado', ru: 'Переменная облачность', ja: '曇り時々晴れ', ko: '구름 조금', zh: '多云', nl: 'Gedeeltelijk bewolkt', pl: 'Częściowo pochmurno', tr: 'Parçalı bulutlu', sv: 'Delvis molnigt', id: 'Berawan sebagian' },
  cloudy:        { en: 'Cloudy', fr: 'Nuageux', es: 'Nublado', de: 'Bewölkt', it: 'Nuvoloso', pt: 'Nublado', ru: 'Пасмурно', ja: '曇り', ko: '흐림', zh: '阴天', nl: 'Bewolkt', pl: 'Pochmurno', tr: 'Bulutlu', sv: 'Molnigt', id: 'Berawan' },
  rainy:         { en: 'Rainy', fr: 'Pluvieux', es: 'Lluvioso', de: 'Regnerisch', it: 'Piovoso', pt: 'Chuvoso', ru: 'Дождливо', ja: '雨', ko: '비', zh: '雨天', nl: 'Regenachtig', pl: 'Deszczowo', tr: 'Yağmurlu', sv: 'Regnigt', id: 'Hujan' },
  snowy:         { en: 'Snowy', fr: 'Neigeux', es: 'Nevado', de: 'Verschneit', it: 'Nevoso', pt: 'Nevado', ru: 'Снежно', ja: '雪', ko: '눈', zh: '雪天', nl: 'Sneeuwachtig', pl: 'Śnieżnie', tr: 'Karlı', sv: 'Snöigt', id: 'Bersalju' },
  stormy:        { en: 'Stormy', fr: 'Orageux', es: 'Tormentoso', de: 'Stürmisch', it: 'Tempestoso', pt: 'Tempestuoso', ru: 'Штормовой', ja: '嵐', ko: '폭풍', zh: '暴风雨', nl: 'Stormachtig', pl: 'Burzowo', tr: 'Fırtınalı', sv: 'Stormigt', id: 'Badai' },
  foggy:         { en: 'Foggy', fr: 'Brumeux', es: 'Neblinoso', de: 'Neblig', it: 'Nebbioso', pt: 'Nebuloso', ru: 'Туманно', ja: '霧', ko: '안개', zh: '雾天', nl: 'Mistig', pl: 'Mgliście', tr: 'Sisli', sv: 'Dimmigt', id: 'Berkabut' },
  fog:           { en: 'Foggy', fr: 'Brumeux', es: 'Neblinoso', de: 'Neblig', it: 'Nebbioso', pt: 'Nebuloso', ru: 'Туманно', ja: '霧', ko: '안개', zh: '雾天', nl: 'Mistig', pl: 'Mgliście', tr: 'Sisli', sv: 'Dimmigt', id: 'Berkabut' },
  rain:          { en: 'Rainy', fr: 'Pluvieux', es: 'Lluvioso', de: 'Regnerisch', it: 'Piovoso', pt: 'Chuvoso', ru: 'Дождливо', ja: '雨', ko: '비', zh: '雨天', nl: 'Regenachtig', pl: 'Deszczowo', tr: 'Yağmurlu', sv: 'Regnigt', id: 'Hujan' },
  snow:          { en: 'Snowy', fr: 'Neigeux', es: 'Nevado', de: 'Verschneit', it: 'Nevoso', pt: 'Nevado', ru: 'Снежно', ja: '雪', ko: '눈', zh: '雪天', nl: 'Sneeuwachtig', pl: 'Śnieżnie', tr: 'Karlı', sv: 'Snöigt', id: 'Bersalju' },
  storm:         { en: 'Stormy', fr: 'Orageux', es: 'Tormentoso', de: 'Stürmisch', it: 'Tempestoso', pt: 'Tempestuoso', ru: 'Штормовой', ja: '嵐', ko: '폭풍', zh: '暴风雨', nl: 'Stormachtig', pl: 'Burzowo', tr: 'Fırtınalı', sv: 'Stormigt', id: 'Badai' },
};

function translateCondition(condition: string, lang: string): string {
  return CONDITION_LABELS[condition]?.[lang] || CONDITION_LABELS[condition]?.en || condition;
}

// Representative IANA timezone per country (English name as used in globe/Pythagoras)
const COUNTRY_TIMEZONE: Record<string, string> = {
  'France': 'Europe/Paris', 'Germany': 'Europe/Berlin', 'United Kingdom': 'Europe/London',
  'Italy': 'Europe/Rome', 'Spain': 'Europe/Madrid', 'Netherlands': 'Europe/Amsterdam',
  'Belgium': 'Europe/Brussels', 'Switzerland': 'Europe/Zurich', 'Austria': 'Europe/Vienna',
  'Portugal': 'Europe/Lisbon', 'Sweden': 'Europe/Stockholm', 'Norway': 'Europe/Oslo',
  'Denmark': 'Europe/Copenhagen', 'Finland': 'Europe/Helsinki', 'Poland': 'Europe/Warsaw',
  'Greece': 'Europe/Athens', 'Romania': 'Europe/Bucharest', 'Hungary': 'Europe/Budapest',
  'Ukraine': 'Europe/Kyiv', 'Turkey': 'Europe/Istanbul',
  'Russia': 'Europe/Moscow',
  'United States': 'America/New_York', 'Canada': 'America/Toronto',
  'Mexico': 'America/Mexico_City', 'Brazil': 'America/Sao_Paulo',
  'Argentina': 'America/Argentina/Buenos_Aires', 'Colombia': 'America/Bogota',
  'Chile': 'America/Santiago', 'Peru': 'America/Lima', 'Venezuela': 'America/Caracas',
  'Japan': 'Asia/Tokyo', 'China': 'Asia/Shanghai', 'South Korea': 'Asia/Seoul',
  'India': 'Asia/Kolkata', 'Pakistan': 'Asia/Karachi', 'Bangladesh': 'Asia/Dhaka',
  'Indonesia': 'Asia/Jakarta', 'Malaysia': 'Asia/Kuala_Lumpur',
  'Vietnam': 'Asia/Ho_Chi_Minh', 'Thailand': 'Asia/Bangkok',
  'Philippines': 'Asia/Manila', 'Singapore': 'Asia/Singapore',
  'Saudi Arabia': 'Asia/Riyadh', 'United Arab Emirates': 'Asia/Dubai',
  'Iran': 'Asia/Tehran', 'Iraq': 'Asia/Baghdad', 'Israel': 'Asia/Jerusalem',
  'Australia': 'Australia/Sydney', 'New Zealand': 'Pacific/Auckland',
  'South Africa': 'Africa/Johannesburg', 'Nigeria': 'Africa/Lagos',
  'Kenya': 'Africa/Nairobi', 'Ethiopia': 'Africa/Addis_Ababa',
  'Egypt': 'Africa/Cairo', 'Morocco': 'Africa/Casablanca',
  'Algeria': 'Africa/Algiers', 'Tanzania': 'Africa/Dar_es_Salaam',
  'Ghana': 'Africa/Accra', 'Senegal': 'Africa/Dakar',
  'Iceland': 'Atlantic/Reykjavik',
};

function getLocalTime(countryName: string): string | null {
  const tz = COUNTRY_TIMEZONE[countryName];
  if (!tz) return null;
  try {
    return new Intl.DateTimeFormat([], {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date());
  } catch { return null; }
}

async function fetchGlobalNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/news/articles?query=world`);
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).slice(0, 3).map((a: Record<string, unknown>) => ({
      title: (a.title as string)?.slice(0, 80) + ((a.title as string)?.length > 80 ? '...' : ''),
      link: a.link as string,
      source: a.source as string,
      color: a.color as string || (a.theme as Record<string, string>)?.color,
    }));
  } catch { return []; }
}

function toEnglish(name: string): string {
  return COUNTRY_EN[name.toLowerCase()] || name.replace(/\b\w/g, c => c.toUpperCase());
}

const WEATHER_KEYWORDS = ['meteo', 'météo', 'weather', 'temperature', 'température', 'climat', 'temps', 'forecast', 'wetter', 'tiempo'];
const GLOBAL_KEYWORDS = ['mondial', 'world', 'global', 'partout', 'everywhere'];
const NEWS_KEYWORDS = ['news', 'actu', 'actualité', 'actualite', 'actualités', 'actualites', 'info', 'infos'];

async function fetchTopicNews(topic: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/news/articles?query=${encodeURIComponent(topic)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).slice(0, 20).map((a: Record<string, unknown>) => ({
      title: (a.title as string)?.slice(0, 80) + ((a.title as string)?.length > 80 ? '...' : ''),
      link: a.link as string,
      source: a.source as string,
      color: a.color as string || (a.theme as Record<string, string>)?.color,
      country: a.country as string | undefined,
    }));
  } catch { return []; }
}

function highlightNewsCountries(
  items: NewsItem[],
  onHighlight: ((c: Record<string, CountryHighlight>) => void) | undefined,
  extractor?: EntityExtractor
) {
  if (!onHighlight) return;
  const highlights: Record<string, CountryHighlight> = {};
  // Feed publisher country — strong signal
  for (const item of items) {
    if (item.country) {
      highlights[item.country] = { scale: 0.9, color: '#4a9eff', extrusion: 0.7 };
    }
  }
  // Countries mentioned in article titles — weaker signal (e.g. "Italian GP", "Monaco Grand Prix")
  if (extractor) {
    for (const item of items) {
      const entities = extractor.extract(item.title).filter((e: { type: string }) => e.type === 'country');
      for (const entity of entities) {
        const name = toEnglish(entity.value);
        if (!highlights[name]) {
          highlights[name] = { scale: 0.6, color: '#4a9eff', extrusion: 0.5 };
        }
      }
    }
  }
  if (Object.keys(highlights).length > 0) onHighlight(highlights);
}

function normalizeSimple(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function hasWeatherIntent(input: string): boolean {
  const n = normalizeSimple(input);
  return WEATHER_KEYWORDS.some(k => n.includes(normalizeSimple(k)));
}

function hasGlobalIntent(input: string): boolean {
  const n = normalizeSimple(input);
  return GLOBAL_KEYWORDS.some(k => n.includes(k));
}

function hasNewsIntent(input: string): boolean {
  const n = normalizeSimple(input);
  return NEWS_KEYWORDS.some(k => n.includes(k));
}

async function fetchCountryNews(country: string): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${API_BASE}/api/news/articles?query=${encodeURIComponent(toEnglish(country))}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (Array.isArray(data) ? data : []).slice(0, 3).map((a: Record<string, unknown>) => ({
      title: (a.title as string)?.slice(0, 80) + ((a.title as string)?.length > 80 ? '...' : ''),
      link: a.link as string,
      source: a.source as string,
      color: a.color as string || (a.theme as Record<string, string>)?.color,
    }));
  } catch { return []; }
}

// Map common non-English country names to English for Wikipedia + globe highlight.
// Split per language to avoid TS1117 duplicate-key errors (same word, different languages).
const COUNTRY_EN: Record<string, string> = Object.assign(
  // French + Spanish + German + shared legacy
  {
    'corée': 'South Korea', 'coree': 'South Korea', 'corée du sud': 'South Korea',
    'japon': 'Japan', 'allemagne': 'Germany', 'brésil': 'Brazil', 'bresil': 'Brazil',
    'espagne': 'Spain', 'italie': 'Italy', 'chine': 'China', 'inde': 'India',
    'russie': 'Russia', 'australie': 'Australia', 'mexique': 'Mexico',
    'états-unis': 'United States', 'etats-unis': 'United States', 'royaume-uni': 'United Kingdom',
    'turquie': 'Turkey', 'égypte': 'Egypt', 'egypte': 'Egypt',
    'afrique du sud': 'South Africa', 'thaïlande': 'Thailand', 'thailande': 'Thailand',
    'corea del sur': 'South Korea', 'japón': 'Japan', 'alemania': 'Germany',
    'francia': 'France', 'brasil': 'Brazil', 'españa': 'Spain', 'italia': 'Italy',
    'estados unidos': 'United States', 'reino unido': 'United Kingdom',
    'südkorea': 'South Korea', 'frankreich': 'France', 'brasilien': 'Brazil',
    'spanien': 'Spain', 'italien': 'Italy', 'vereinigte staaten': 'United States',
    'tanzanie': 'Tanzania', 'algérie': 'Algeria', 'algerie': 'Algeria',
    'maroc': 'Morocco', 'tunisie': 'Tunisia', 'sénégal': 'Senegal', 'senegal': 'Senegal',
    'côte d\'ivoire': 'Ivory Coast', 'cameroun': 'Cameroon', 'éthiopie': 'Ethiopia',
    'ethiopie': 'Ethiopia', 'nigeria': 'Nigeria', 'kenya': 'Kenya', 'ghana': 'Ghana',
    'pologne': 'Poland', 'suède': 'Sweden', 'suede': 'Sweden', 'norvège': 'Norway',
    'norvege': 'Norway', 'danemark': 'Denmark', 'finlande': 'Finland',
    'pays-bas': 'Netherlands', 'belgique': 'Belgium', 'suisse': 'Switzerland',
    'autriche': 'Austria', 'portugal': 'Portugal', 'grèce': 'Greece', 'grece': 'Greece',
    'hongrie': 'Hungary', 'roumanie': 'Romania', 'ukraine': 'Ukraine',
    'arabie saoudite': 'Saudi Arabia', 'émirats arabes unis': 'United Arab Emirates',
    'iran': 'Iran', 'irak': 'Iraq', 'israël': 'Israel', 'israel': 'Israel',
    'pakistan': 'Pakistan', 'bangladesh': 'Bangladesh', 'vietnam': 'Vietnam',
    'indonésie': 'Indonesia', 'indonesie': 'Indonesia', 'malaisie': 'Malaysia',
    'philippines': 'Philippines', 'nouvelle-zélande': 'New Zealand',
    'argentine': 'Argentina', 'colombie': 'Colombia', 'chili': 'Chile',
    'venezuela': 'Venezuela', 'pérou': 'Peru', 'perou': 'Peru',
  },
  // Portuguese
  {
    'japão': 'Japan', 'japao': 'Japan', 'coreia do sul': 'South Korea',
    'alemanha': 'Germany', 'espanha': 'Spain',
    'rússia': 'Russia', 'russia': 'Russia',
    'austrália': 'Australia', 'australia': 'Australia', 'méxico': 'Mexico', 'mexico': 'Mexico',
    'turquia': 'Turkey', 'egito': 'Egypt', 'África do sul': 'South Africa', 'africa do sul': 'South Africa',
    'tailândia': 'Thailand', 'tailandia': 'Thailand', 'índia': 'India', 'india': 'India',
    'colômbia': 'Colombia', 'colombia': 'Colombia', 'chile': 'Chile',
    'perú': 'Peru', 'marrocos': 'Morocco', 'nigéria': 'Nigeria',
    'quênia': 'Kenya', 'quenia': 'Kenya', 'etiópia': 'Ethiopia', 'etiopia': 'Ethiopia',
    'tanzânia': 'Tanzania', 'tanzania': 'Tanzania', 'argélia': 'Algeria', 'argelia': 'Algeria',
    'camarões': 'Cameroon', 'camaroes': 'Cameroon',
    'países baixos': 'Netherlands', 'paises baixos': 'Netherlands',
    'bélgica': 'Belgium', 'belgica': 'Belgium', 'suíça': 'Switzerland', 'suica': 'Switzerland',
    'áustria': 'Austria', 'austria': 'Austria', 'grécia': 'Greece', 'grecia': 'Greece',
    'polônia': 'Poland', 'polonia': 'Poland', 'suécia': 'Sweden', 'suecia': 'Sweden',
    'noruega': 'Norway', 'dinamarca': 'Denmark', 'finlândia': 'Finland', 'finlandia': 'Finland',
    'hungria': 'Hungary', 'romênia': 'Romania', 'romenia': 'Romania', 'ucrânia': 'Ukraine', 'ucrania': 'Ukraine',
    'arábia saudita': 'Saudi Arabia', 'arabia saudita': 'Saudi Arabia',
    'emirados árabes': 'United Arab Emirates', 'emirados arabes': 'United Arab Emirates',
    'paquistão': 'Pakistan', 'paquistao': 'Pakistan',
    'indonésia': 'Indonesia', 'indonesia': 'Indonesia', 'malásia': 'Malaysia', 'malasia': 'Malaysia',
    'nova zelândia': 'New Zealand', 'nova zelandia': 'New Zealand',
  },
  // Italian
  {
    'giappone': 'Japan', 'cina': 'China', 'corea del sud': 'South Korea',
    'germania': 'Germany', 'brasile': 'Brazil', 'spagna': 'Spain',
    'stati uniti': 'United States',
    'messico': 'Mexico', 'turchia': 'Turkey', 'egitto': 'Egypt',
    'sudafrica': 'South Africa', 'tailandia': 'Thailand',
    'paesi bassi': 'Netherlands', 'belgio': 'Belgium', 'svizzera': 'Switzerland',
    'grecia': 'Greece', 'polonia': 'Poland', 'svezia': 'Sweden',
    'norvegia': 'Norway', 'danimarca': 'Denmark', 'finlandia': 'Finland',
    'portogallo': 'Portugal', 'ungheria': 'Hungary', 'romania': 'Romania',
    'ucraina': 'Ukraine', 'israele': 'Israel',
    'emirati arabi uniti': 'United Arab Emirates',
    'malesia': 'Malaysia', 'nuova zelanda': 'New Zealand',
    'cile': 'Chile', 'perù': 'Peru', 'colombia': 'Colombia',
    'marocco': 'Morocco', 'nigeria': 'Nigeria', 'etiopia': 'Ethiopia',
    'tanzania': 'Tanzania', 'algeria': 'Algeria', 'senegal': 'Senegal',
    'camerun': 'Cameroon',
  },
  // Dutch
  {
    'japan': 'Japan', 'brazilië': 'Brazil', 'brazilie': 'Brazil',
    'duitsland': 'Germany', 'spanje': 'Spain', 'verenigd koninkrijk': 'United Kingdom',
    'verenigde staten': 'United States', 'rusland': 'Russia',
    'australië': 'Australia', 'australie': 'Australia',
    'turkije': 'Turkey', 'egypte': 'Egypt', 'zuid-afrika': 'South Africa',
    'thailand': 'Thailand', 'india': 'India', 'argentinië': 'Argentina', 'argentinie': 'Argentina',
    'chili': 'Chile', 'peru': 'Peru', 'marokko': 'Morocco',
    'kenia': 'Kenya', 'ethiopië': 'Ethiopia', 'ethiopie': 'Ethiopia',
    'algerije': 'Algeria',
    'nederland': 'Netherlands', 'belgie': 'Belgium', 'belgië': 'Belgium',
    'zwitserland': 'Switzerland', 'oostenrijk': 'Austria', 'griekenland': 'Greece',
    'polen': 'Poland', 'zweden': 'Sweden', 'noorwegen': 'Norway',
    'denemarken': 'Denmark', 'finland': 'Finland', 'hongarije': 'Hungary',
    'roemenië': 'Romania', 'roemenie': 'Romania', 'oekraïne': 'Ukraine', 'oekraine': 'Ukraine',
    'indonesie': 'Indonesia', 'indonesië': 'Indonesia', 'maleisie': 'Malaysia', 'maleisië': 'Malaysia',
    'nieuw-zeeland': 'New Zealand', 'zuid-korea': 'South Korea',
  },
  // Polish
  {
    'japonia': 'Japan', 'brazylia': 'Brazil', 'niemcy': 'Germany',
    'hiszpania': 'Spain', 'wielka brytania': 'United Kingdom', 'stany zjednoczone': 'United States',
    'rosja': 'Russia', 'meksyk': 'Mexico',
    'turcja': 'Turkey', 'egipt': 'Egypt', 'republika poludniowej afryki': 'South Africa',
    'tajlandia': 'Thailand', 'indie': 'India', 'argentyna': 'Argentina',
    'chile': 'Chile', 'maroko': 'Morocco',
    'algieria': 'Algeria', 'holandia': 'Netherlands',
    'belgia': 'Belgium', 'szwajcaria': 'Switzerland', 'austria': 'Austria',
    'grecja': 'Greece', 'polska': 'Poland', 'szwecja': 'Sweden',
    'norwegia': 'Norway', 'dania': 'Denmark',
    'wegry': 'Hungary', 'węgry': 'Hungary', 'rumunia': 'Romania',
    'ukraina': 'Ukraine', 'indonezja': 'Indonesia', 'malezja': 'Malaysia',
    'nowa zelandia': 'New Zealand', 'korea poludniowa': 'South Korea', 'korea południowa': 'South Korea',
  },
  // Turkish
  {
    'japonya': 'Japan', 'brezilya': 'Brazil', 'almanya': 'Germany',
    'ispanya': 'Spain', 'birlesik krallik': 'United Kingdom', 'birleşik krallık': 'United Kingdom',
    'abd': 'United States', 'rusya': 'Russia', 'avustralya': 'Australia',
    'misir': 'Egypt', 'mısır': 'Egypt', 'gney afrika': 'South Africa', 'güney afrika': 'South Africa',
    'tayland': 'Thailand', 'hindistan': 'India', 'arjantin': 'Argentina',
    'sili': 'Chile', 'fas': 'Morocco', 'nijerya': 'Nigeria',
    'etiyopya': 'Ethiopia', 'tanzanya': 'Tanzania', 'cezayir': 'Algeria',
    'hollanda': 'Netherlands', 'belcika': 'Belgium', 'belçika': 'Belgium',
    'isvicre': 'Switzerland', 'isviçre': 'Switzerland', 'yunanistan': 'Greece',
    'polonya': 'Poland', 'isvec': 'Sweden', 'isveç': 'Sweden',
    'norvec': 'Norway', 'danimarka': 'Denmark',
    'macaristan': 'Hungary', 'romanya': 'Romania', 'ukrayna': 'Ukraine',
    'endonezya': 'Indonesia', 'malezya': 'Malaysia', 'yeni zelanda': 'New Zealand',
    'gney kore': 'South Korea', 'güney kore': 'South Korea',
  },
  // Swedish
  {
    'tysklnd': 'Germany', 'tyskland': 'Germany',
    'storbritannien': 'United Kingdom', 'usa': 'United States',
    'ryssland': 'Russia', 'australien': 'Australia', 'mexiko': 'Mexico',
    'turkiet': 'Turkey', 'egypten': 'Egypt', 'sydafrika': 'South Africa',
    'indien': 'India', 'argentina': 'Argentina',
    'marocko': 'Morocco', 'etiopien': 'Ethiopia',
    'belgien': 'Belgium', 'schweiz': 'Switzerland', 'osterrike': 'Austria', 'österrike': 'Austria',
    'grekland': 'Greece', 'sverige': 'Sweden',
    'norge': 'Norway', 'danmark': 'Denmark',
    'ungern': 'Hungary', 'rumänien': 'Romania', 'rumanien': 'Romania',
    'indonesien': 'Indonesia', 'malaysia': 'Malaysia',
    'nya zeeland': 'New Zealand', 'sydkorea': 'South Korea',
  },
  // Historical / alternate names (encyclopedia articles)
  {
    'soviet union': 'Russia', 'union sovietique': 'Russia', 'urss': 'Russia', 'ussr': 'Russia',
    'russian empire': 'Russia', 'empire russe': 'Russia',
    'third reich': 'Germany', 'nazi germany': 'Germany', 'allemagne nazie': 'Germany',
    'weimar republic': 'Germany', 'west germany': 'Germany', 'east germany': 'Germany',
    'german democratic republic': 'Germany', 'holy roman empire': 'Germany',
    'austro-hungarian empire': 'Austria', 'austria-hungary': 'Austria',
    'ottoman empire': 'Turkey', 'empire ottoman': 'Turkey',
    'british empire': 'United Kingdom', 'great britain': 'United Kingdom', 'grande-bretagne': 'United Kingdom',
    'roman empire': 'Italy', 'empire romain': 'Italy',
    'byzantine empire': 'Greece',
  },
  // Indonesian
  {
    'jepang': 'Japan', 'jerman': 'Germany',
    'spanyol': 'Spain', 'inggris': 'United Kingdom', 'amerika serikat': 'United States',
    'rusia': 'Russia', 'meksiko': 'Mexico',
    'turki': 'Turkey', 'mesir': 'Egypt', 'afrika selatan': 'South Africa',
    'maroko': 'Morocco',
    'aljazair': 'Algeria',
    'belanda': 'Netherlands', 'swiss': 'Switzerland',
    'yunani': 'Greece', 'polandia': 'Poland',
    'swedia': 'Sweden', 'denmark': 'Denmark',
    'hungaria': 'Hungary', 'rumania': 'Romania',
    'selandia baru': 'New Zealand', 'korea selatan': 'South Korea',
  },
);

// Cache for resolved Wikipedia titles per language (avoids repeated langlinks lookups)
const wikiTitleCache: Record<string, Record<string, string>> = {};

// Resolve the correct Wikipedia article title in the target language using langlinks.
// e.g. "Japan" → "fr" → "Japon" (fr.wikipedia.org/wiki/Japan is a disambiguation stub)
async function resolveWikiTitle(englishName: string, lang: string): Promise<string> {
  if (lang === 'en') return englishName;
  if (wikiTitleCache[lang]?.[englishName]) return wikiTitleCache[lang][englishName];
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(englishName)}&prop=langlinks&lllang=${lang}&format=json&redirects=1&origin=*`;
    const res = await fetch(url);
    if (!res.ok) return englishName;
    const data = await res.json();
    const pages = data.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as Record<string, unknown>;
      const langlinks = page?.langlinks as Array<Record<string, string>> | undefined;
      const localTitle = langlinks?.[0]?.['*'];
      if (localTitle) {
        if (!wikiTitleCache[lang]) wikiTitleCache[lang] = {};
        wikiTitleCache[lang][englishName] = localTitle;
        return localTitle;
      }
    }
  } catch { /* ignore, fall through */ }
  return englishName;
}

async function fetchWikiSnippet(country: string, lang = 'en'): Promise<WikiSnippet | null> {
  const englishName = COUNTRY_EN[country.toLowerCase()] || country.replace(/\b\w/g, c => c.toUpperCase());
  try {
    const title = await resolveWikiTitle(englishName, lang);
    const res = await fetch(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
    if (!res.ok) {
      if (lang !== 'en') return fetchWikiSnippet(country, 'en');
      return null;
    }
    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract?.slice(0, 120) + (data.extract?.length > 120 ? '...' : ''),
      url: data.content_urls?.desktop?.page || `https://${lang}.wikipedia.org/wiki/${title}`,
    };
  } catch { return null; }
}

// Detect script/language from query characters for non-Latin queries
function detectQueryLang(query: string): string | null {
  if (/[\u3000-\u9fff\uf900-\ufaff\u3400-\u4dbf]/.test(query)) return 'ja'; // CJK
  if (/[\u0400-\u04ff]/.test(query)) return 'ru'; // Cyrillic
  if (/[\u0600-\u06ff]/.test(query)) return 'ar'; // Arabic
  if (/[\uac00-\ud7af]/.test(query)) return 'ko'; // Korean
  return null;
}

// Universal Wikipedia search — returns up to 3 article snippets for any keyword.
// Two requests:
//   1. list=search → get ranked titles
//   2. prop=extracts|info|links on all titles (+ pllimit=50 for first article) → one round-trip
// Links from the first (most relevant) article are used to find related countries that
// the intro text doesn't mention explicitly (e.g. WWII intro says "Allies / Axis" not country names).
async function fetchWikiSearch(query: string, lang = 'en'): Promise<WikiSnippet[]> {
  if (!query.trim()) return [];
  const scriptLang = detectQueryLang(query);
  const targetLang = scriptLang ?? lang;
  try {
    const searchRes = await fetch(
      `https://${targetLang}.wikipedia.org/w/api.php?` +
      new URLSearchParams({ action: 'query', list: 'search', srsearch: query,
        format: 'json', origin: '*', utf8: '1', srlimit: '3' })
    );
    if (!searchRes.ok) return targetLang !== 'en' ? fetchWikiSearch(query, 'en') : [];
    const searchData = await searchRes.json();
    const hits: Array<{ title: string }> = searchData.query?.search ?? [];
    if (hits.length === 0) return targetLang !== 'en' ? fetchWikiSearch(query, 'en') : [];
    // Fetch extracts + internal links in one request
    // Links are fetched only for the first (most relevant) result via pllimit
    const titles = hits.map(h => h.title).join('|');
    const extractRes = await fetch(
      `https://${targetLang}.wikipedia.org/w/api.php?` +
      new URLSearchParams({ action: 'query', titles, prop: 'extracts|info|links',
        exintro: '1', explaintext: '1', exsectionformat: 'plain',
        exlimit: '3', inprop: 'url', pllimit: '80', plnamespace: '0',
        format: 'json', origin: '*' })
    );
    if (!extractRes.ok) return hits.map(h => ({
      title: h.title, extract: '',
      url: `https://${targetLang}.wikipedia.org/wiki/${encodeURIComponent(h.title)}`,
    }));
    const extractData = await extractRes.json();
    const pages = Object.values(extractData.query?.pages ?? {}) as Array<{
      title: string; extract?: string; fullurl?: string;
      links?: Array<{ title: string }>;
    }>;
    const pageMap = new Map(pages.map(p => [p.title, p]));
    return hits.map((h, idx) => {
      const page = pageMap.get(h.title);
      const extract = page?.extract ?? '';
      return {
        title: h.title,
        extract: extract.slice(0, 160) + (extract.length > 160 ? '...' : ''),
        rawExtract: extract.slice(0, 600),
        // Carry article links only for the first result — used for country extraction
        articleLinks: idx === 0 ? (page?.links ?? []).map(l => l.title) : undefined,
        url: page?.fullurl ?? `https://${targetLang}.wikipedia.org/wiki/${encodeURIComponent(h.title)}`,
      };
    }).filter(r => r.title);
  } catch { return []; }
}

async function translateTexts(texts: string[], lang: string): Promise<string[]> {
  if (lang === 'en' || !texts.length) return texts;
  try {
    const res = await fetch(`${API_BASE}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts, from: 'en', to: lang }),
    });
    if (!res.ok) return texts;
    const data = await res.json();
    return data.translations || texts;
  } catch { return texts; }
}

async function translateTitles(items: NewsItem[], lang: string): Promise<NewsItem[]> {
  if (lang === 'en') return items;
  const titles = items.map(i => i.title);
  const translated = await translateTexts(titles, lang);
  return items.map((item, i) => ({ ...item, title: translated[i] ?? item.title }));
}

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar({ onCountryHighlight }, ref) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [wiki, setWiki] = useState<WikiSnippet | null>(null);
  const [wikiResults, setWikiResults] = useState<WikiSnippet[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode>('auto');
  const [showcasePlaying, setShowcasePlaying] = useState(true);
  const showcasePlayingRef = useRef(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [localEntities, setLocalEntities] = useState<{ value: string }[]>([]);
  const [countryWeather, setCountryWeather] = useState<WeatherCard | null>(null);
  const [globalWeatherSummary, setGlobalWeatherSummary] = useState<GlobalWeatherSummary | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const userActiveRef = useRef(false);

  // Prefetch global weather on mount so cache is warm when showcase reaches __global_weather__
  useEffect(() => { fetchGlobalWeather(); }, []);

  // Local entity extractor — browser-safe, synchronous, no network
  const extractor = useMemo(() => new EntityExtractor(), []);

  // Extract country entities from input locally (~1ms, no network)
  const extractCountries = useCallback((input: string) => {
    if (!input.trim()) return [];
    return extractor.extract(input).filter((e: { type: string }) => e.type === 'country');
  }, [extractor]);

  // Highlight globe from local entity extraction — called immediately on input change
  const highlightCountries = useCallback((countryEntities: { value: string }[]) => {
    const highlights: Record<string, CountryHighlight> = {};
    for (const entity of countryEntities) {
      highlights[toEnglish(entity.value)] = { scale: 1, color: '#00ff88', extrusion: 0.8 };
    }
    onCountryHighlight?.(highlights);
  }, [onCountryHighlight]);

  // Fetch enrichment — routes to weather, news, or wiki based on intent keywords
  const fetchEnrichment = useCallback(async (countryName: string, rawInput: string, isShowcase = false) => {
    setNews([]);
    setWiki(null);
    setCountryWeather(null);
    setGlobalWeatherSummary(null);
    setLoading(true);
    try {
      if (hasWeatherIntent(rawInput)) {
        // Fetch full weather data (uses global cache if warm), then filter for the target country
        await fetchGlobalWeather();
        // Cancel only if showcase is running AND user has started typing — never cancel user-triggered fetches
        if (isShowcase && userActiveRef.current) return;
        // In showcase keep the single-country highlight — don't override with global heatmap
        if (!isShowcase && weatherCache) onCountryHighlight?.(weatherCache);
        const englishName = toEnglish(countryName);
        const entry = weatherRawData?.[englishName];
        if (entry) {
          setCountryWeather({ temperature: entry.temperature, condition: entry.condition, color: entry.color, unit: entry.viewUnit || '°C', countryName: englishName });
        }
      } else if (isShowcase) {
        const w = await fetchWikiSnippet(countryName, lang);
        if (!userActiveRef.current) setWiki(w);
      } else if (hasNewsIntent(rawInput)) {
        const items = await fetchCountryNews(countryName);
        if (!userActiveRef.current && items.length > 0) {
          const translated = await translateTitles(items, lang);
          if (!userActiveRef.current) setNews(translated);
        }
      } else {
        const items = await fetchCountryNews(countryName);
        if (!userActiveRef.current && items.length > 0) {
          const translated = await translateTitles(items, lang);
          if (!userActiveRef.current) setNews(translated);
        } else if (!userActiveRef.current) {
          const w = await fetchWikiSnippet(countryName, lang);
          setWiki(w);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight, lang]);

  // Wiki universal search — fetches up to 3 Wikipedia articles for any keyword,
  // extracts country entities from results for globe highlight (silver/white)
  const handleWikiSearch = useCallback(async (input: string) => {
    setNews([]); setWiki(null); setCountryWeather(null); setGlobalWeatherSummary(null);    setLoading(true);
    try {
      const results = await fetchWikiSearch(input, lang);
      if (!userActiveRef.current) return;
      setWikiResults(results);
      const highlights: Record<string, CountryHighlight> = {};

      // Pass 1 — extract from text (title + intro up to 600 chars)
      // Strip French/Italian/Spanish elisions ("l'Allemagne" → " Allemagne") so
      // the tokenizer sees the country name as a standalone token.
      for (const r of results) {
        const rawText = (r.rawExtract ?? r.extract).replace(/\b[ldnjcmts]'/gi, ' ');
        const entities = extractor.extract(r.title + ' ' + rawText)
          .filter((e: { type: string }) => e.type === 'country');
        for (const entity of entities) {
          const name = toEnglish(entity.value);
          if (!highlights[name]) highlights[name] = { scale: 0.7, color: '#e2e8f0', extrusion: 0.6 };
        }
      }

      // Pass 2 — scan article links from the first result.
      // Wikipedia internally links to every country it discusses, so this reliably catches
      // countries that only appear deep in the article — beyond the intro snippet —
      // e.g. "Seconde Guerre mondiale" intro says "Alliés / Axe" without naming countries.
      if (results[0]?.articleLinks) {
        for (const linkTitle of results[0].articleLinks) {
          const cleaned = linkTitle.replace(/\b[ldnjcmts]'/gi, ' ');
          const entities = extractor.extract(cleaned)
            .filter((e: { type: string }) => e.type === 'country');
          for (const entity of entities) {
            const name = toEnglish(entity.value);
            if (!highlights[name]) highlights[name] = { scale: 0.6, color: '#e2e8f0', extrusion: 0.4 };
          }
        }
      }

      if (Object.keys(highlights).length > 0) onCountryHighlight?.(highlights);
    } finally { setLoading(false); }
  }, [lang, extractor, onCountryHighlight]);

  // Full Pythagoras pipeline — used for showcase and complex intents (no country found locally)
  const search = useCallback(async (input: string, isShowcase = false) => {
    if (!input.trim()) {
      setResult(null);
      setWiki(null);
      onCountryHighlight?.({});
      return;
    }

    // Clear stale showcase/previous results before any async work
    setWiki(null); setNews([]); setCountryWeather(null);
    setGlobalWeatherSummary(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/intent/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context: { currentMode: null, language: lang, currentTheme: 'dark' } }),
      });
      const data = await res.json();
      setResult(data);

      let countryEntities = (data.entities || []).filter((e: Entity) => e.type === 'country');

      // Fallback: Pythagoras (old xenova-bridge) may miss accented names — try local extraction
      if (countryEntities.length === 0) {
        countryEntities = extractCountries(input) as Entity[];
      }

      highlightCountries(countryEntities);

      const searchName = countryEntities.length > 0 ? countryEntities[0].value : null;
      if (searchName) {
        fetchEnrichment(searchName, input, isShowcase);
      } else if (data.intent?.category === 'search' || detectMode(input) === 'news') {
        fetchTopicNews(input).then(async items => {
          if (!userActiveRef.current) return;
          if (items.length > 0) {
            highlightNewsCountries(items, onCountryHighlight, extractor);
            const translated = await translateTitles(items, lang);
            if (userActiveRef.current) setNews(translated);
          }
        }).catch(() => {});
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight, lang, highlightCountries, fetchEnrichment, extractCountries, extractor]);

  useImperativeHandle(ref, () => ({
    setQuery: (q: string) => {
      setQuery(q);
      // Do NOT set userActive — external calls (globe click) must not block fetchEnrichment guards
      search(q);
    },
  }));

  // Reset showcase when language changes
  useEffect(() => {
    if (!userActive) setShowcaseIndex(0);
  }, [lang, userActive]);

  // Showcase: typing effect + special modes
  useEffect(() => {
    if (userActive || focused || query || !showcasePlaying) {
      setTypedPlaceholder('');
      return;
    }

    const key = SHOWCASE_SEQUENCE[showcaseIndex];

    // __global_news__ special mode
    if (key === '__global_news__') {
      setWiki(null); setResult(null); setNews([]);      setCountryWeather(null); setGlobalWeatherSummary(null); setLoading(true);
      setTypedPlaceholder(t('search.showcase.news'));
      fetchGlobalNews().then(async items => {
        setLoading(false);
        if (userActiveRef.current) return;
        const translated = await translateTitles(items, lang);
        if (userActiveRef.current) return;
        setNews(translated);
        const newsHighlights: Record<string, CountryHighlight> = {};
        for (const c of ['United States', 'China', 'France', 'United Kingdom', 'Russia', 'Japan', 'Germany', 'Brazil', 'India', 'Australia']) {
          newsHighlights[c] = { scale: 0.7, color: '#ef4444', extrusion: 0.6 };
        }
        onCountryHighlight?.(newsHighlights);
      });
      return;
    }

    // Regular typed query — reset + type
    setWiki(null); setResult(null); setNews([]);    setCountryWeather(null); setGlobalWeatherSummary(null);
    onCountryHighlight?.({});

    const target = t(key);
    let charIndex = 0;
    setTypedPlaceholder('');

    const typeTimer = setInterval(() => {
      if (charIndex < target.length) {
        setTypedPlaceholder(target.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeTimer);
      }
    }, TYPING_SPEED);

    return () => clearInterval(typeTimer);
  }, [showcaseIndex, userActive, focused, query, showcasePlaying, onCountryHighlight, t, lang]);

  // Showcase: trigger enrichment when typing finishes
  // Routes to wiki / weather / news based on the showcase key type.
  useEffect(() => {
    if (userActive || focused || query || !showcasePlaying) return;
    const key = SHOWCASE_SEQUENCE[showcaseIndex];
    if (key === '__global_news__' || typedPlaceholder !== t(key)) return;

    const wikiCountry = SHOWCASE_COUNTRY_MAP[key];
    const weatherCountry = SHOWCASE_WEATHER_MAP[key];
    const newsTopic = SHOWCASE_NEWS_MAP[key];

    if (wikiCountry) {
      // Wiki: highlight globe + fetch Wikipedia snippet
      highlightCountries([{ value: wikiCountry }]);
      fetchEnrichment(wikiCountry, typedPlaceholder, true);
    } else if (weatherCountry) {
      // Weather showcase: strong single-country extrusion, then show weather card + local time
      onCountryHighlight?.({ [weatherCountry]: { scale: 1.2, color: '#00ff88', extrusion: 0.8 } });
      fetchEnrichment(weatherCountry, 'météo', true);
    } else if (newsTopic) {
      // News: fetch topic articles + highlight countries from results
      setLoading(true);
      fetchTopicNews(newsTopic).then(async items => {
        setLoading(false);
        if (userActiveRef.current || !items.length) return;
        highlightNewsCountries(items, onCountryHighlight, extractor);
        const translated = await translateTitles(items, lang);
        if (!userActiveRef.current) setNews(translated);
      }).catch(() => setLoading(false));
    } else {
      search(typedPlaceholder, true);
    }
  }, [typedPlaceholder, showcaseIndex, userActive, focused, query, showcasePlaying, search, t, highlightCountries, fetchEnrichment, onCountryHighlight, extractor, lang]);

  // Showcase: rotate
  useEffect(() => {
    if (userActive || focused || query || !showcasePlaying) return;
    const interval = setInterval(() => {
      setShowcaseIndex(prev => (prev + 1) % SHOWCASE_SEQUENCE.length);
    }, SHOWCASE_INTERVAL);
    return () => clearInterval(interval);
  }, [userActive, focused, query, showcasePlaying]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActive(true);
    clearTimeout(debounceRef.current);

    if (!value) {
      setResult(null);
      setWiki(null);
      setWikiResults([]);
      setNews([]);
      setCountryWeather(null);
      setGlobalWeatherSummary(null);
      onCountryHighlight?.({});
      setActive(false);
      return;
    }

    // 1. Immediate: local entity extraction → globe highlight, no network
    const localCountries = extractCountries(value);
    setLocalEntities(localCountries);
    highlightCountries(localCountries);

    // 2. Debounced enrichment — forced mode takes priority over auto-detection
    if (searchMode === 'wiki') {
      // Forced wiki: exact country name → direct enrichment (avoids noisy multi-results)
      // Generic keyword → Wikipedia search
      setNews([]); setWiki(null); setCountryWeather(null); setGlobalWeatherSummary(null);
      if (localCountries.length > 0) {
        debounceRef.current = setTimeout(() => fetchEnrichment(localCountries[0].value, value), 400);
      } else {
        debounceRef.current = setTimeout(() => handleWikiSearch(value), 400);
      }
    } else if (searchMode === 'news') {
      // Forced news: always fetch topic news
      setWikiResults([]); setWiki(null); setCountryWeather(null); setGlobalWeatherSummary(null);      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const items = await fetchTopicNews(value);
          if (!userActiveRef.current) return;
          if (items.length > 0) {
            highlightNewsCountries(items, onCountryHighlight, extractor);
            const translated = await translateTitles(items, lang);
            if (userActiveRef.current) setNews(translated);
          }
        } finally { setLoading(false); }
      }, 400);
    } else if (searchMode === 'weather') {
      // Forced weather
      setWikiResults([]); setNews([]); setWiki(null);      if (hasGlobalIntent(value)) {
        debounceRef.current = setTimeout(() => {
          setLoading(true);
          fetchGlobalWeather().then(data => {
            setLoading(false);
            if (!userActiveRef.current) return;
            if (data) onCountryHighlight?.(data);
            setGlobalWeatherSummary(getGlobalWeatherSummary());
          });
        }, 400);
      } else if (localCountries.length > 0) {
        debounceRef.current = setTimeout(() => fetchEnrichment(localCountries[0].value, 'météo ' + value), 400);
      } else {
        // No country specified → show global weather
        debounceRef.current = setTimeout(() => {
          setLoading(true);
          fetchGlobalWeather().then(data => {
            setLoading(false);
            if (!userActiveRef.current) return;
            if (data) onCountryHighlight?.(data);
            setGlobalWeatherSummary(getGlobalWeatherSummary());
          });
        }, 400);
      }
    } else {
      // Auto mode — existing routing + wiki as universal fallback
      if (hasWeatherIntent(value) && hasGlobalIntent(value)) {
        setWikiResults([]);
        debounceRef.current = setTimeout(() => {
          setLoading(true);
          fetchGlobalWeather().then(data => {
            setLoading(false);
            if (!userActiveRef.current) return;
            if (data) onCountryHighlight?.(data);
            setGlobalWeatherSummary(getGlobalWeatherSummary());
          });
        }, 400);
      } else if (localCountries.length > 0) {
        setWikiResults([]);
        debounceRef.current = setTimeout(() => fetchEnrichment(localCountries[0].value, value), 400);
      } else if (detectMode(value) === 'news') {
        setWikiResults([]); setWiki(null); setCountryWeather(null); setGlobalWeatherSummary(null);        debounceRef.current = setTimeout(async () => {
          setLoading(true);
          try {
            const items = await fetchTopicNews(value);
            if (!userActiveRef.current) return;
            if (items.length > 0) {
              highlightNewsCountries(items, onCountryHighlight, extractor);
              const translated = await translateTitles(items, lang);
              if (userActiveRef.current) setNews(translated);
            }
          } finally { setLoading(false); }
        }, 400);
      } else {
        // Universal wiki fallback — replaces old Pythagoras pipeline for free-form queries
        setNews([]); setWiki(null); setCountryWeather(null); setGlobalWeatherSummary(null);        debounceRef.current = setTimeout(() => handleWikiSearch(value), 400);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { clearTimeout(debounceRef.current); search(query); }
    if (e.key === 'Escape') { setQuery(''); setResult(null); setWiki(null); setWikiResults([]); setNews([]); setCountryWeather(null); setGlobalWeatherSummary(null); setActive(false); onCountryHighlight?.({}); inputRef.current?.blur(); }
  };

  const setActive = (v: boolean) => { setUserActive(v); userActiveRef.current = v; };
  const toggleShowcase = () => {
    setShowcasePlaying(prev => {
      showcasePlayingRef.current = !prev;
      return !prev;
    });
  };
  const handleFocus = () => { setFocused(true); setActive(true); };
  const handleBlur = () => { setTimeout(() => { setFocused(false); if (!query) setActive(false); }, 150); };
  const clear = () => { setQuery(''); setResult(null); setWiki(null); setWikiResults([]); setNews([]); setCountryWeather(null); setGlobalWeatherSummary(null); setLocalEntities([]); setActive(false); onCountryHighlight?.({}); inputRef.current?.focus(); };
  const toggleMode = (mode: SearchMode) => {
    const next = searchMode === mode ? 'auto' : mode;
    setSearchMode(next);
    // Pause showcase so it doesn't override the explicit mode selection
    setShowcasePlaying(false);
    showcasePlayingRef.current = false;
    clearTimeout(debounceRef.current);
    setWikiResults([]); setWiki(null); setNews([]); setCountryWeather(null); setGlobalWeatherSummary(null);

    if (next === 'wiki') {
      if (query.trim()) debounceRef.current = setTimeout(() => handleWikiSearch(query), 0);
    } else if (next === 'news') {
      const q = query.trim() || 'world';
      setLoading(true);
      fetchTopicNews(q).then(async items => {
        setLoading(false);
        if (!items.length) return;
        highlightNewsCountries(items, onCountryHighlight, extractor);
        const translated = await translateTitles(items, lang);
        setNews(translated);
      }).catch(() => setLoading(false));
    } else if (next === 'weather') {
      const localCountriesForMode = extractCountries(query);
      if (localCountriesForMode.length > 0) {
        fetchEnrichment(localCountriesForMode[0].value, 'météo ' + query);
      } else {
        setLoading(true);
        fetchGlobalWeather().then(data => {
          setLoading(false);
          if (data) onCountryHighlight?.(data);
          setGlobalWeatherSummary(getGlobalWeatherSummary());
        }).catch(() => setLoading(false));
      }
    } else {
      // back to auto
      if (query.trim()) debounceRef.current = setTimeout(() => search(query), 0);
    }
  };

  // Derive which mode dot to highlight — reflects forced mode, showcase, or auto-detected query intent
  const activeDisplayMode: SearchMode = (() => {
    if (searchMode !== 'auto') return searchMode;
    if (!userActive && !query && showcasePlaying) {
      const key = SHOWCASE_SEQUENCE[showcaseIndex];
      if (key === '__global_news__' || SHOWCASE_NEWS_MAP[key]) return 'news';
      if (SHOWCASE_WEATHER_MAP[key]) return 'weather';
      return 'wiki';
    }
    if (query) {
      if (hasWeatherIntent(query)) return 'weather';
      if (hasNewsIntent(query) || detectMode(query) === 'news') return 'news';
    }
    return 'wiki';
  })();

  // Use local entities for immediate UI feedback, fallback to Pythagoras result for complex intents
  const countries = localEntities.length > 0
    ? localEntities
    : (result?.entities || []).filter((e: Entity) => e.type === 'country');
  const hasResults = countries.length > 0 || wiki || wikiResults.length > 0 || news.length > 0 || countryWeather !== null || globalWeatherSummary !== null;
  const showResults = hasResults;

  return (
    <div
      className={`search-bar ${focused ? 'focused' : ''} ${!userActive && typedPlaceholder ? 'showcasing' : ''}`}
      data-mode={searchMode !== 'auto' ? searchMode : undefined}
    >
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={!userActive && typedPlaceholder ? typedPlaceholder : t('search.placeholder')}
          className="search-input"
          spellCheck={false}
          autoComplete="off"
        />
        <div className="search-mode-selector" aria-label="Search mode">
          <button
            className="search-showcase-toggle"
            onClick={toggleShowcase}
            aria-label={showcasePlaying ? t('showcase.pause') : t('showcase.play')}
            data-label={showcasePlaying ? t('showcase.pause') : t('showcase.play')}
            type="button"
          >
            {showcasePlaying ? (
              <svg viewBox="0 0 10 10" width="11" height="11" fill="currentColor">
                <rect x="1.5" y="1" width="2.5" height="8" rx="1"/>
                <rect x="6" y="1" width="2.5" height="8" rx="1"/>
              </svg>
            ) : (
              <svg viewBox="0 0 10 10" width="11" height="11" fill="currentColor">
                <polygon points="1.5,0.5 9.5,5 1.5,9.5"/>
              </svg>
            )}
          </button>
          <button
            className={`search-mode-btn${activeDisplayMode === 'news' ? ' active' : ''}${searchMode === 'news' ? ' forced' : ''}`}
            data-mode="news"
            data-label={t('mode.news')}
            onClick={() => toggleMode('news')}
            aria-label={t('mode.news')}
            type="button"
          />
          <button
            className={`search-mode-btn${activeDisplayMode === 'weather' ? ' active' : ''}${searchMode === 'weather' ? ' forced' : ''}`}
            data-mode="weather"
            data-label={t('mode.weather')}
            onClick={() => toggleMode('weather')}
            aria-label={t('mode.weather')}
            type="button"
          />
          <button
            className={`search-mode-btn${activeDisplayMode === 'wiki' ? ' active' : ''}${searchMode === 'wiki' ? ' forced' : ''}`}
            data-mode="wiki"
            data-label={t('mode.wiki')}
            onClick={() => toggleMode('wiki')}
            aria-label={t('mode.wiki')}
            type="button"
          />
        </div>
        {loading && <span className="search-spinner" />}
        {query && !loading && (
          <button className="search-clear" onClick={clear} aria-label="Clear">×</button>
        )}
      </div>

      {loading && (query || !userActive) && (
        <div className="search-results-loading">
          <div className="search-skeleton" />
          <div className="search-skeleton" />
          <div className="search-skeleton" />
        </div>
      )}

      {showResults && !loading && (
        <div className="search-results">
          {countries.length > 0 && (
            <div className="search-countries">
              {countries.map((c, i) => (
                <span key={i} className="search-country-tag">
                  {c.value.charAt(0).toUpperCase() + c.value.slice(1)}
                </span>
              ))}
            </div>
          )}
          {countryWeather && (() => {
            const localTime = countryWeather.countryName ? getLocalTime(countryWeather.countryName) : null;
            return (
              <div className="search-weather-card" style={{ borderLeftColor: countryWeather.color }}>
                <span className="search-weather-temp" style={{ color: countryWeather.color }}>
                  {countryWeather.temperature}{countryWeather.unit}
                </span>
                <div className="search-weather-meta">
                  <span className="search-weather-condition">
                    {translateCondition(countryWeather.condition, lang)}
                  </span>
                  <span className="search-weather-avg">{t('weather.average')}</span>
                </div>
                {localTime && (
                  <span className="search-weather-time">{localTime}</span>
                )}
              </div>
            );
          })()}
          {globalWeatherSummary && (
            <div className="search-weather-summary">
              <div className="search-weather-group">
                <span className="search-weather-group-label">{t('weather.hottest')}</span>
                {globalWeatherSummary.hottest.map((item, i) => (
                  <div key={i} className="search-weather-row">
                    <span className="search-weather-country">{item.name}</span>
                    <span className="search-weather-value" style={{ color: item.color }}>{item.temperature}°C</span>
                  </div>
                ))}
              </div>
              <div className="search-weather-group">
                <span className="search-weather-group-label">{t('weather.coldest')}</span>
                {globalWeatherSummary.coldest.map((item, i) => (
                  <div key={i} className="search-weather-row">
                    <span className="search-weather-country">{item.name}</span>
                    <span className="search-weather-value" style={{ color: item.color }}>{item.temperature}°C</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {wiki && (
            <a href={wiki.url} target="_blank" rel="noopener noreferrer" className="search-wiki">
              <span className="search-wiki-title">{wiki.title}</span>
              <span className="search-wiki-extract">{wiki.extract}</span>
            </a>
          )}
          {wikiResults.length > 0 && (
            <div className="search-wiki-results">
              {wikiResults.map((item, i) => (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="search-wiki-card">
                  <span className="search-wiki-card-title">{item.title}</span>
                  {item.extract && <span className="search-wiki-card-extract">{item.extract}</span>}
                </a>
              ))}
            </div>
          )}
          {news.length > 0 && (
            <div className="search-news-grid">
              {news.map((item, i) => (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" className="search-news-card" style={{ borderLeftColor: item.color || 'var(--color-primary)' }}>
                  <span className="search-news-title">{item.title}</span>
                  {item.source && <span className="search-news-source">{item.source}</span>}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
