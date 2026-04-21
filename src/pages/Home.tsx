import { lazy, Suspense, useState, useCallback, useRef } from 'react';
import { SearchBar, type SearchBarHandle } from '../components/SearchBar';
import { useI18n } from '../i18n';
import './Home.css';

const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

export function Home() {
  const { t } = useI18n();
  const [countryData, setCountryData] = useState<Record<string, { scale: number; color?: string; extrusion?: number }>>({});
  const searchRef = useRef<SearchBarHandle>(null);

  const handleCountryHighlight = useCallback((data: Record<string, { scale: number; color?: string; extrusion?: number }>) => {
    setCountryData(data);
  }, []);

  const handleCountryClick = useCallback((name: string) => {
    setCountryData({ [name]: { scale: 1, color: '#00ff88', extrusion: 0.4 } });
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
            bloomStrength={0.15}
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
            <a href="https://atlas.aeryflux.com" className="tagline-link">{t('tagline.explore')}</a>
            <span className="tagline-separator">/</span>
            <a href="https://haki.aeryflux.com" className="tagline-link">{t('tagline.learn')}</a>
          </div>

          <SearchBar ref={searchRef} onCountryHighlight={handleCountryHighlight} />
        </div>
      </div>
    </div>
  );
}

export default Home;
