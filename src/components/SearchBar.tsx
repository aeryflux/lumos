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

interface Entity { type: string; value: string; normalizedValue: string }
interface SearchResult { intent?: { category: string }; entities?: Entity[] }
interface CountryHighlight { scale: number; color?: string; extrusion?: number }
interface WikiSnippet { title: string; extract: string; url: string }
interface NewsItem { title: string; link: string; source?: string; color?: string }

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

async function fetchGlobalWeather(): Promise<Record<string, CountryHighlight> | null> {
  if (weatherCache && Date.now() - weatherCacheTime < WEATHER_CACHE_TTL) return weatherCache;
  try {
    const res = await fetch(`${API_BASE}/api/weather/data?view=temperature`);
    if (!res.ok) return null;
    const { data } = await res.json();
    const highlights: Record<string, CountryHighlight> = {};
    for (const [country, info] of Object.entries(data as Record<string, { scale: number; color: string }>)) {
      highlights[country] = { scale: info.scale, color: info.color, extrusion: info.scale * 0.3 };
    }
    weatherCache = highlights;
    weatherCacheTime = Date.now();
    return highlights;
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

// Map common non-English country names to English for Wikipedia + globe highlight
const COUNTRY_EN: Record<string, string> = {
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
  // French country names missing from xenova-bridge toEnglish path
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
};

async function fetchWikiSnippet(country: string): Promise<WikiSnippet | null> {
  const englishName = COUNTRY_EN[country.toLowerCase()] || country;
  try {
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(englishName)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract?.slice(0, 120) + (data.extract?.length > 120 ? '...' : ''),
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${country}`,
    };
  } catch { return null; }
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
    return extractor.extract(input).filter(e => e.type === 'country');
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
    setLoading(true);
    try {
      if (isShowcase) {
        const w = await fetchWikiSnippet(countryName);
        if (!userActiveRef.current) setWiki(w);
      } else if (hasWeatherIntent(rawInput)) {
        // "météo france" → country weather data on globe
        const res = await fetch(`${API_BASE}/api/weather/data?view=temperature&country=${encodeURIComponent(toEnglish(countryName))}`);
        if (res.ok) {
          const { data } = await res.json();
          if (data && userActiveRef.current) onCountryHighlight?.(data);
        }
      } else if (hasNewsIntent(rawInput)) {
        // "actu france / news france" → news articles
        const items = await fetchCountryNews(countryName);
        if (userActiveRef.current && items.length > 0) setNews(items);
      } else {
        // Default: wiki snippet
        const items = await fetchCountryNews(countryName);
        if (userActiveRef.current && items.length > 0) {
          setNews(items);
        } else if (userActiveRef.current) {
          const w = await fetchWikiSnippet(countryName);
          setWiki(w);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight]);

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
      setLoading(true);

      if (key === '__global_weather__') {
        setTypedPlaceholder(t('search.showcase.weather'));
        fetchGlobalWeather().then(data => {
          setLoading(false);
          if (data && !userActiveRef.current) onCountryHighlight?.(data);
        });
      } else if (key === '__global_news__') {
        setTypedPlaceholder(t('search.showcase.news'));
        fetchGlobalNews().then(items => {
          setLoading(false);
          if (userActiveRef.current) return;
          setNews(items);
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
  }, [showcaseIndex, userActive, focused, query, onCountryHighlight, t]);

  // Showcase: trigger search when typing finishes
  useEffect(() => {
    if (userActive || focused || query) return;
    const key = SHOWCASE_SEQUENCE[showcaseIndex];
    if (!key.startsWith('__global_') && typedPlaceholder === t(key)) {
      search(typedPlaceholder, true);
    }
  }, [typedPlaceholder, showcaseIndex, userActive, focused, query, search, t]);

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
      // "météo mondiale" → global weather heatmap
      debounceRef.current = setTimeout(() => {
        setLoading(true);
        fetchGlobalWeather().then(data => {
          setLoading(false);
          if (data && userActiveRef.current) onCountryHighlight?.(data);
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
    if (e.key === 'Escape') { setQuery(''); setResult(null); setWiki(null); setNews([]); setActive(false); onCountryHighlight?.({}); inputRef.current?.blur(); }
  };

  const setActive = (v: boolean) => { setUserActive(v); userActiveRef.current = v; };
  const handleFocus = () => { setFocused(true); setActive(true); };
  const handleBlur = () => { setTimeout(() => { setFocused(false); if (!query) setActive(false); }, 150); };
  const clear = () => { setQuery(''); setResult(null); setWiki(null); setNews([]); setLocalEntities([]); setActive(false); onCountryHighlight?.({}); inputRef.current?.focus(); };

  // Use local entities for immediate UI feedback, fallback to Pythagoras result for complex intents
  const countries = localEntities.length > 0
    ? localEntities
    : (result?.entities || []).filter((e: Entity) => e.type === 'country');
  const hasResults = countries.length > 0 || wiki || news.length > 0 || showMusic;
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
                <span key={i} className="search-country-tag">{c.value}</span>
              ))}
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
