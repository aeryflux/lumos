import { useState, useRef, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react';
import { EntityExtractor } from '@aeryflux/xenova-bridge';
import { useI18n } from '../i18n';
import './SearchBar.css';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.aeryflux.com';

// Showcase sequence: translated keys or special modes
const SHOWCASE_SEQUENCE = [
  'showcase.1',
  '__global_weather__',
  'showcase.2',
  '__global_news__',
  'showcase.3',
  '__global_music__',
  'showcase.4',
  '__global_weather__',
  'showcase.5',
];

const TYPING_SPEED = 45;
const SHOWCASE_INTERVAL = 10000;

// English country name for each showcase key — used to bypass NLP for non-Latin languages
// (ja/ko/ru showcase queries can't be parsed by the Latin-only EntityExtractor)
const SHOWCASE_COUNTRY_MAP: Record<string, string> = {
  'showcase.1': 'Japan',
  'showcase.2': 'Brazil',
  'showcase.3': 'South Korea',
  'showcase.4': 'Germany',
  'showcase.5': 'Australia',
};

interface Entity { type: string; value: string; normalizedValue: string }
interface SearchResult { intent?: { category: string }; entities?: Entity[] }
interface CountryHighlight { scale: number; color?: string; extrusion?: number }
interface WikiSnippet { title: string; extract: string; url: string }
interface NewsItem { title: string; link: string; source?: string; color?: string }
interface WeatherCard { temperature: number; condition: string; color: string; unit: string }
interface WeatherSummaryItem { name: string; temperature: number; color: string }
interface GlobalWeatherSummary { hottest: WeatherSummaryItem[]; coldest: WeatherSummaryItem[] }

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
};

function translateCondition(condition: string, lang: string): string {
  return CONDITION_LABELS[condition]?.[lang] || CONDITION_LABELS[condition]?.en || condition;
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
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showMusic, setShowMusic] = useState(false);
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
      highlights[toEnglish(entity.value)] = { scale: 1, color: '#00ff88', extrusion: 0.4 };
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
      if (isShowcase) {
        const w = await fetchWikiSnippet(countryName, lang);
        if (!userActiveRef.current) setWiki(w);
      } else if (hasWeatherIntent(rawInput)) {
        // Fetch full weather data (uses global cache if warm), then filter for the target country
        const highlights = await fetchGlobalWeather();
        if (!userActiveRef.current) return;
        if (highlights) onCountryHighlight?.(highlights);
        const englishName = toEnglish(countryName);
        const entry = weatherRawData?.[englishName];
        if (entry) {
          setCountryWeather({ temperature: entry.temperature, condition: entry.condition, color: entry.color, unit: entry.viewUnit || '°C' });
        }
      } else if (hasNewsIntent(rawInput)) {
        const items = await fetchCountryNews(countryName);
        if (userActiveRef.current && items.length > 0) {
          const translated = await translateTitles(items, lang);
          if (userActiveRef.current) setNews(translated);
        }
      } else {
        const items = await fetchCountryNews(countryName);
        if (userActiveRef.current && items.length > 0) {
          const translated = await translateTitles(items, lang);
          if (userActiveRef.current) setNews(translated);
        } else if (userActiveRef.current) {
          const w = await fetchWikiSnippet(countryName, lang);
          setWiki(w);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight, lang]);

  // Full Pythagoras pipeline — used for showcase and complex intents (no country found locally)
  const search = useCallback(async (input: string, isShowcase = false) => {
    if (!input.trim()) {
      setResult(null);
      setWiki(null);
      onCountryHighlight?.({});
      return;
    }

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
      if (searchName) fetchEnrichment(searchName, input, isShowcase);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight, lang, highlightCountries, fetchEnrichment, extractCountries]);

  useImperativeHandle(ref, () => ({
    setQuery: (q: string) => {
      setQuery(q);
      setActive(true);
      search(q);
    },
  }));

  // Reset showcase when language changes
  useEffect(() => {
    if (!userActive) setShowcaseIndex(0);
  }, [lang, userActive]);

  // Showcase: typing effect + special modes
  useEffect(() => {
    if (userActive || focused || query) {
      setTypedPlaceholder('');
      return;
    }

    const key = SHOWCASE_SEQUENCE[showcaseIndex];

    // Special showcase modes
    if (key.startsWith('__global_')) {
      setWiki(null);
      setResult(null);
      setNews([]);
      setShowMusic(false);
      setCountryWeather(null);
      setGlobalWeatherSummary(null);
      setLoading(true);

      if (key === '__global_weather__') {
        setTypedPlaceholder(t('search.showcase.weather'));
        fetchGlobalWeather().then(data => {
          setLoading(false);
          if (userActiveRef.current) return;
          if (data) onCountryHighlight?.(data);
          setGlobalWeatherSummary(getGlobalWeatherSummary());
        });
      } else if (key === '__global_news__') {
        setTypedPlaceholder(t('search.showcase.news'));
        fetchGlobalNews().then(async items => {
          setLoading(false);
          if (userActiveRef.current) return;
          const translated = await translateTitles(items, lang);
          if (userActiveRef.current) return;
          setNews(translated);
          const newsHighlights: Record<string, CountryHighlight> = {};
          for (const c of ['United States', 'China', 'France', 'United Kingdom', 'Russia', 'Japan', 'Germany', 'Brazil', 'India', 'Australia']) {
            newsHighlights[c] = { scale: 0.7, color: '#ef4444', extrusion: 0.2 };
          }
          onCountryHighlight?.(newsHighlights);
        });
      } else if (key === '__global_music__') {
        setTypedPlaceholder(t('search.showcase.music'));
        setLoading(false);
        setShowMusic(true);
        onCountryHighlight?.({});
      }
      return;
    }

    // Regular query — reset + type
    setWiki(null);
    setResult(null);
    setNews([]);
    setShowMusic(false);
    setCountryWeather(null);
    setGlobalWeatherSummary(null);
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
  }, [showcaseIndex, userActive, focused, query, onCountryHighlight, t, lang]);

  // Showcase: trigger enrichment when typing finishes
  // Use SHOWCASE_COUNTRY_MAP to bypass NLP — ja/ko/ru queries can't be parsed by the Latin EntityExtractor
  useEffect(() => {
    if (userActive || focused || query) return;
    const key = SHOWCASE_SEQUENCE[showcaseIndex];
    if (!key.startsWith('__global_') && typedPlaceholder === t(key)) {
      const countryName = SHOWCASE_COUNTRY_MAP[key];
      if (countryName) {
        highlightCountries([{ value: countryName }]);
        fetchEnrichment(countryName, typedPlaceholder, true);
      } else {
        search(typedPlaceholder, true);
      }
    }
  }, [typedPlaceholder, showcaseIndex, userActive, focused, query, search, t, highlightCountries, fetchEnrichment]);

  // Showcase: rotate
  useEffect(() => {
    if (userActive || focused || query) return;
    const interval = setInterval(() => {
      setShowcaseIndex(prev => (prev + 1) % SHOWCASE_SEQUENCE.length);
    }, SHOWCASE_INTERVAL);
    return () => clearInterval(interval);
  }, [userActive, focused, query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setActive(true);
    clearTimeout(debounceRef.current);

    if (!value) {
      setResult(null);
      setWiki(null);
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

    // 2. Debounced enrichment
    if (hasWeatherIntent(value) && hasGlobalIntent(value)) {
      // "météo mondiale" → global weather heatmap + summary
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
      // Country found → enrichment (weather/news/wiki based on intent keywords)
      debounceRef.current = setTimeout(() => {
        fetchEnrichment(localCountries[0].value, value);
      }, 400);
    } else {
      // No country, no weather global → full Pythagoras pipeline (complex intents)
      debounceRef.current = setTimeout(() => search(value), 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { clearTimeout(debounceRef.current); search(query); }
    if (e.key === 'Escape') { setQuery(''); setResult(null); setWiki(null); setNews([]); setCountryWeather(null); setGlobalWeatherSummary(null); setActive(false); onCountryHighlight?.({}); inputRef.current?.blur(); }
  };

  const setActive = (v: boolean) => { setUserActive(v); userActiveRef.current = v; };
  const handleFocus = () => { setFocused(true); setActive(true); };
  const handleBlur = () => { setTimeout(() => { setFocused(false); if (!query) setActive(false); }, 150); };
  const clear = () => { setQuery(''); setResult(null); setWiki(null); setNews([]); setCountryWeather(null); setGlobalWeatherSummary(null); setLocalEntities([]); setActive(false); onCountryHighlight?.({}); inputRef.current?.focus(); };

  // Use local entities for immediate UI feedback, fallback to Pythagoras result for complex intents
  const countries = localEntities.length > 0
    ? localEntities
    : (result?.entities || []).filter((e: Entity) => e.type === 'country');
  const hasResults = countries.length > 0 || wiki || news.length > 0 || showMusic || countryWeather !== null || globalWeatherSummary !== null;
  const showResults = hasResults;

  return (
    <div className={`search-bar ${focused ? 'focused' : ''} ${!userActive && typedPlaceholder ? 'showcasing' : ''}`}>
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
          {countryWeather && (
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
            </div>
          )}
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
          {showMusic && (
            <div className="search-music-cta">
              <span className="search-music-label">{t('search.showcase.music')}</span>
              <a href="https://atlas.aeryflux.com" className="search-music-btn">
                {t('music.try')} →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
});
