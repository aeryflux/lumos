import { lazy, Suspense, useState, useCallback, useRef } from 'react';
import { SearchBar, type SearchBarHandle } from '../components/SearchBar';
import type { GlobeHandle } from '@aeryflux/globe/react';
import { useI18n } from '../i18n';
import './Home.css';

const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

// Ocean tint: idle = deep navy, active (country highlighted) = slightly brighter
const OCEAN_TINT_IDLE   = '#040d1a';
const OCEAN_TINT_ACTIVE = '#071e3d';

export function Home() {
  const { t } = useI18n();
  const [countryData, setCountryData] = useState<Record<string, { scale: number; color?: string; extrusion?: number }>>({});
  const [oceanTint, setOceanTint] = useState(OCEAN_TINT_IDLE);
  const searchRef = useRef<SearchBarHandle>(null);
  const globeRef = useRef<GlobeHandle>(null);

  const handleCountryHighlight = useCallback((data: Record<string, { scale: number; color?: string; extrusion?: number }>) => {
    setCountryData(data);
    const keys = Object.keys(data);
    if (keys.length === 1) {
      globeRef.current?.flyTo(keys[0]);
      setOceanTint(OCEAN_TINT_ACTIVE);
    } else {
      setOceanTint(OCEAN_TINT_IDLE);
    }
  }, []);

  const handleCountryClick = useCallback((name: string) => {
    setCountryData({ [name]: { scale: 1, color: '#00ff88', extrusion: 0.4 } });
    searchRef.current?.setQuery(name);
    globeRef.current?.flyTo(name);
    setOceanTint(OCEAN_TINT_ACTIVE);
  }, []);

  return (
    <div className="home">
      <div className="globe-section">
        <Suspense fallback={<div className="globe-loading" />}>
          <Globe
            ref={globeRef}
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
            globeFillTint={oceanTint}
            globeFillAnimation={true}
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
