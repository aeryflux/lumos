import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
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
const SHOWCASE_INTERVAL = 7000;

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

async function fetchGlobalWeather(): Promise<Record<string, CountryHighlight> | null> {
  try {
    const res = await fetch(`${API_BASE}/api/weather/data?view=temperature`);
    if (!res.ok) return null;
    const { data } = await res.json();
    const highlights: Record<string, CountryHighlight> = {};
    for (const [country, info] of Object.entries(data as Record<string, { scale: number; color: string }>)) {
      highlights[country] = { scale: info.scale, color: info.color, extrusion: info.scale * 0.3 };
    }
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
  return COUNTRY_EN[name.toLowerCase()] || name;
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

// Map common non-English country names to English for Wikipedia
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
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (input: string) => {
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

      const countryEntities = (data.entities || []).filter((e: Entity) => e.type === 'country');
      const countries: Record<string, CountryHighlight> = {};
      for (const entity of countryEntities) {
        countries[entity.value] = { scale: 1, color: '#00ff88', extrusion: 0.4 };
      }
      onCountryHighlight?.(countries);

      setNews([]);
      setWiki(null);
      // Use entity name if found, otherwise use raw input (for globe clicks with unrecognized countries)
      const searchName = countryEntities.length > 0 ? countryEntities[0].value : input.trim();
      if (searchName) {
        fetchCountryNews(searchName).then(items => {
          if (items.length > 0) {
            setNews(items);
          } else {
            fetchWikiSnippet(searchName).then(setWiki);
          }
        });
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight, lang]);

  useImperativeHandle(ref, () => ({
    setQuery: (q: string) => {
      setQuery(q);
      setUserActive(true);
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
          if (data) onCountryHighlight?.(data);
        });
      } else if (key === '__global_news__') {
        setTypedPlaceholder(t('search.showcase.news'));
        fetchGlobalNews().then(items => {
          setLoading(false);
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
      search(typedPlaceholder);
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
    setUserActive(true);
    clearTimeout(debounceRef.current);
    if (value) {
      debounceRef.current = setTimeout(() => search(value), 400);
    } else {
      setResult(null);
      onCountryHighlight?.({});
      setUserActive(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { clearTimeout(debounceRef.current); search(query); }
    if (e.key === 'Escape') { setQuery(''); setResult(null); setUserActive(false); onCountryHighlight?.({}); inputRef.current?.blur(); }
  };

  const handleFocus = () => { setFocused(true); setUserActive(true); };
  const handleBlur = () => { setTimeout(() => { setFocused(false); if (!query) setUserActive(false); }, 150); };
  const clear = () => { setQuery(''); setResult(null); setUserActive(false); onCountryHighlight?.({}); inputRef.current?.focus(); };

  const countries = (result?.entities || []).filter(e => e.type === 'country');
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
