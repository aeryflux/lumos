import { lazy, Suspense, useState, useCallback, useRef } from 'react';
import { SearchBar, type SearchBarHandle } from '../components/SearchBar';
import './Home.css';

const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

export function Home() {
  const [countryData, setCountryData] = useState<Record<string, { scale: number; color?: string; extrusion?: number }>>({});
  const searchRef = useRef<SearchBarHandle>(null);

  const handleCountryHighlight = useCallback((data: Record<string, { scale: number; color?: string; extrusion?: number }>) => {
    setCountryData(data);
  }, []);

  const handleCountryClick = useCallback((name: string) => {
    // Highlight clicked country on globe
    setCountryData({ [name]: { scale: 1, color: '#00ff88', extrusion: 0.4 } });
    // Fill search bar
    searchRef.current?.setQuery(name);
  }, []);

  return (
    <div className="home">
      <div className="globe-section">
        <Suspense fallback={<div className="globe-loading" />}>
          <Globe
            surface="dark"
            showCountries={true}
            showBorders={true}
            showGlobeFill={true}
            enableControls={true}
            rotationSpeed={0.0005}
            bloomStrength={0.3}
            glowIntensity={0.8}
            introAnimation={true}
            introDuration={2.5}
            countryData={countryData}
            onCountryClick={handleCountryClick}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      <div className="content-section">
        <div className="content-body">
          <h1>aeryflux</h1>
          <div className="taglines">
            <p>explore the world</p>
            <span className="tagline-separator">/</span>
            <p>learn to code</p>
          </div>

          <SearchBar ref={searchRef} onCountryHighlight={handleCountryHighlight} />

          <div className="links">
            <a href="https://atlas.aeryflux.com">Atlas</a>
            <a href="https://haki.aeryflux.com">Haki</a>
            <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
