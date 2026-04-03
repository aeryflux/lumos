import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import './SearchBar.css';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000' : 'https://api.aeryflux.com';

const SHOWCASE_QUERIES = [
  'Where is Japan?',
  '__global_weather__',
  'Tell me about Brazil',
  '__global_news__',
  'What about South Korea?',
  '__global_music__',
  'Show me Germany',
  '__global_weather__',
  'Where is Australia?',
];

const TYPING_SPEED = 45;
const SHOWCASE_INTERVAL = 7000;

interface Entity {
  type: string;
  value: string;
  normalizedValue: string;
}

interface SearchResult {
  intent?: { category: string };
  entities?: Entity[];
  feedback?: string;
  suggestions?: string[];
  actions?: Array<{ type: string; payload?: Record<string, unknown> }>;
}

interface CountryHighlight {
  scale: number;
  color?: string;
  extrusion?: number;
}

interface SearchBarProps {
  onCountryHighlight?: (countries: Record<string, CountryHighlight>) => void;
}

export interface SearchBarHandle {
  setQuery: (q: string) => void;
}

interface WikiSnippet {
  title: string;
  extract: string;
  url: string;
}

interface NewsItem {
  title: string;
  link: string;
  source?: string;
  color?: string;
}

interface MusicTrack {
  title: string;
  artist: string;
  genre?: string;
  previewUrl?: string;
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
  } catch {
    return null;
  }
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
  } catch {
    return [];
  }
}

async function fetchMusicTracks(): Promise<MusicTrack[]> {
  try {
    const res = await fetch(`${API_BASE}/api/music/tracks`);
    if (!res.ok) return [];
    const { tracks } = await res.json();
    return (tracks || []).slice(0, 3).map((t: Record<string, unknown>) => ({
      title: t.title as string,
      artist: t.artist as string,
      genre: t.genre as string,
      previewUrl: t.previewUrl as string,
    }));
  } catch {
    return [];
  }
}

async function fetchWikiSnippet(country: string): Promise<WikiSnippet | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(country)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title,
      extract: data.extract?.slice(0, 120) + (data.extract?.length > 120 ? '...' : ''),
      url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${country}`,
    };
  } catch {
    return null;
  }
}

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(function SearchBar({ onCountryHighlight }, ref) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userActive, setUserActive] = useState(false);
  const [showcaseIndex, setShowcaseIndex] = useState(0);
  const [typedPlaceholder, setTypedPlaceholder] = useState('');
  const [wiki, setWiki] = useState<WikiSnippet | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [music, setMusic] = useState<MusicTrack[]>([]);
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
        body: JSON.stringify({ input, context: { currentMode: null, language: 'en', currentTheme: 'dark' } }),
      });
      const data = await res.json();
      setResult(data);

      const countryEntities = (data.entities || []).filter((e: Entity) => e.type === 'country');
      const countries: Record<string, CountryHighlight> = {};
      for (const entity of countryEntities) {
        countries[entity.value] = { scale: 1, color: '#00ff88', extrusion: 0.4 };
      }
      onCountryHighlight?.(countries);

      // Fetch wiki snippet for first country
      if (countryEntities.length > 0) {
        fetchWikiSnippet(countryEntities[0].value).then(setWiki);
      } else {
        setWiki(null);
      }
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [onCountryHighlight]);

  useImperativeHandle(ref, () => ({
    setQuery: (q: string) => {
      setQuery(q);
      setUserActive(true);
      search(q);
    },
  }));

  // Showcase: typing effect + global weather
  useEffect(() => {
    if (userActive || focused || query) {
      setTypedPlaceholder('');
      return;
    }

    const target = SHOWCASE_QUERIES[showcaseIndex];

    // Special showcase modes
    if (target.startsWith('__global_')) {
      setWiki(null);
      setResult(null);
      setNews([]);
      setMusic([]);

      setLoading(true);
      if (target === '__global_weather__') {
        setTypedPlaceholder('Global weather');
        fetchGlobalWeather().then(data => {
          setLoading(false);
          if (data) onCountryHighlight?.(data);
        });
      } else if (target === '__global_news__') {
        setTypedPlaceholder('World news');
        fetchGlobalNews().then(items => {
          setLoading(false);
          setNews(items);
          // Highlight random countries for news visual
          const newsHighlights: Record<string, CountryHighlight> = {};
          const newsCountries = ['United States', 'China', 'France', 'United Kingdom', 'Russia', 'Japan', 'Germany', 'Brazil', 'India', 'Australia'];
          for (const c of newsCountries) {
            newsHighlights[c] = { scale: 0.7, color: '#ef4444', extrusion: 0.2 };
          }
          onCountryHighlight?.(newsHighlights);
        });
      } else if (target === '__global_music__') {
        setTypedPlaceholder('Discover music');
        onCountryHighlight?.({});
        fetchMusicTracks().then(items => {
          setLoading(false);
          setMusic(items);
        });
      }
      return;
    }

    // Reset previous showcase data
    setWiki(null);
    setResult(null);
    setNews([]);
    setMusic([]);
    onCountryHighlight?.({});

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
  }, [showcaseIndex, userActive, focused, query, onCountryHighlight]);

  // Showcase: trigger search when typing finishes (non-weather)
  useEffect(() => {
    if (userActive || focused || query) return;

    const target = SHOWCASE_QUERIES[showcaseIndex];
    if (target !== '__global_weather__' && typedPlaceholder === target) {
      search(target);
    }
  }, [typedPlaceholder, showcaseIndex, userActive, focused, query, search]);

  // Showcase: rotate queries
  useEffect(() => {
    if (userActive || focused || query) return;

    const interval = setInterval(() => {
      setShowcaseIndex(prev => (prev + 1) % SHOWCASE_QUERIES.length);
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
    if (e.key === 'Enter') {
      clearTimeout(debounceRef.current);
      search(query);
    }
    if (e.key === 'Escape') {
      setQuery('');
      setResult(null);
      setUserActive(false);
      onCountryHighlight?.({});
      inputRef.current?.blur();
    }
  };

  const handleFocus = () => {
    setFocused(true);
    setUserActive(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFocused(false);
      if (!query) setUserActive(false);
    }, 150);
  };

  const clear = () => {
    setQuery('');
    setResult(null);
    setUserActive(false);
    onCountryHighlight?.({});
    inputRef.current?.focus();
  };

  const countries = (result?.entities || []).filter(e => e.type === 'country');
  const hasResults = countries.length > 0 || wiki || news.length > 0 || music.length > 0;
  const showResults = hasResults && (focused || !userActive);

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
          placeholder={!userActive && typedPlaceholder ? typedPlaceholder : 'Search a country...'}
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
          {music.length > 0 && (
            <div className="search-music-list">
              {music.map((track, i) => (
                <div key={i} className="search-music-track">
                  <span className="search-music-title">{track.title}</span>
                  <span className="search-music-artist">{track.artist}</span>
                  {track.genre && <span className="search-music-genre">{track.genre}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
