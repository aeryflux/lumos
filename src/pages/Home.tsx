import { lazy, Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SearchBar, type SearchBarHandle } from '../components/SearchBar';
import type { GlobeHandle } from '@aeryflux/globe/react';
import { useI18n } from '../i18n';
import './Home.css';

const COOKIE_KEY = 'aery_cookie_consent';

function BottomBar({ t }: { t: (k: string) => string }) {
  const [consent, setConsent] = useState<'accepted' | 'refused' | null>(() => {
    const v = localStorage.getItem(COOKIE_KEY);
    return v === 'accepted' || v === 'refused' ? v : null;
  });
  const [tipVisible, setTipVisible] = useState(false);

  useEffect(() => {
    if (consent !== null) {
      setTipVisible(true);
      const timer = setTimeout(() => setTipVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  const accept = () => { localStorage.setItem(COOKIE_KEY, 'accepted'); setConsent('accepted'); };
  const refuse = () => { localStorage.setItem(COOKIE_KEY, 'refused'); setConsent('refused'); };

  if (consent === null) {
    return (
      <div className="bottom-bar cookie-bar">
        <span className="bottom-bar-text">{t('cookie.text')}</span>
        <a href="/cgu" className="bottom-bar-policy">{t('cookie.policy')}</a>
        <div className="bottom-bar-actions">
          <button className="bottom-bar-btn bottom-bar-btn-refuse" onClick={refuse}>{t('cookie.refuse')}</button>
          <button className="bottom-bar-btn bottom-bar-btn-accept" onClick={accept}>{t('cookie.accept')}</button>
        </div>
      </div>
    );
  }

  if (tipVisible) {
    return (
      <div className="bottom-bar tip-bar" onClick={() => setTipVisible(false)}>
        <span className="bottom-bar-tip-icon">💡</span>
        <span className="bottom-bar-text">{t('tip.globe')}</span>
      </div>
    );
  }

  return null;
}

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

      <footer className="home-footer">
        <BottomBar t={t} />
        <nav className="home-footer-legal">
          <Link to="/docs"    className="home-footer-legal-link">Docs</Link>
          <Link to="/cgu"     className="home-footer-legal-link">CGU</Link>
          <Link to="/cgv"     className="home-footer-legal-link">CGV</Link>
          <Link to="/contact" className="home-footer-legal-link">Contact</Link>
        </nav>
        <div className="home-footer-made">
        <span className="home-footer-label">Made with</span>
        <div className="home-footer-icons">
          <a href="https://www.blender.org" target="_blank" rel="noopener noreferrer" className="home-footer-icon" title="Blender">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="#E87D0D"/>
              <path fill="white" d="M7.5 7h5c2.5 0 4 1.4 4 3.2 0 1.4-.8 2.5-2.1 3l2.6 3.8h-2.8l-2.3-3.5H10V17H7.5V7zm2.5 2v3h2c1 0 1.7-.5 1.7-1.5S13 9 12 9H10z"/>
            </svg>
          </a>
          <a href="https://threejs.org" target="_blank" rel="noopener noreferrer" className="home-footer-icon" title="Three.js">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              {/* Isometric cube wireframe — the actual Three.js logo */}
              <path stroke="white" strokeWidth="1.5" strokeLinejoin="round" d="M12 2L21 7v10L12 22 3 17V7L12 2z"/>
              <path stroke="white" strokeWidth="1.5" strokeLinecap="round" d="M12 2L12 12M21 7L12 12M3 7L12 12"/>
            </svg>
          </a>
          <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer" className="home-footer-icon" title="TypeScript">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <rect width="24" height="24" rx="3" fill="#3178C6"/>
              <text x="3" y="17" fill="white" fontSize="10.5" fontWeight="bold" fontFamily="Arial,sans-serif">TS</text>
            </svg>
          </a>
          <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="home-footer-icon" title="Hugging Face">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="12" fill="#FFD21E"/>
              <circle cx="9" cy="10" r="1.5" fill="#1a1a1a"/>
              <circle cx="15" cy="10" r="1.5" fill="#1a1a1a"/>
              <path d="M8.5 15c0 2 1.6 3 3.5 3s3.5-1 3.5-3" stroke="#1a1a1a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M7.5 8c.4-1.2 1.5-2 2.5-1.5M16.5 8c-.4-1.2-1.5-2-2.5-1.5" stroke="#1a1a1a" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            </svg>
          </a>
        </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
