import { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Github, Menu, X, Settings } from 'lucide-react';
import { useI18n, LANGS } from '../../i18n';
import { LANG_COUNTRY } from '../../i18n/translations';
import './Layout.css';

const REDUCE_MOTION_KEY = 'aery_reduce_motion';
const COOKIE_KEY = 'aery_cookie_consent';

export function Layout() {
  const { lang, setLang, t } = useI18n();
  const [flagsOpen, setFlagsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem(REDUCE_MOTION_KEY) === 'true');
  const [cleared, setCleared] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  const closeDrawer = () => setDrawerOpen(false);

  // Close settings panel on outside click
  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [settingsOpen]);

  // Apply reduce-motion class to root + notify sibling components (Globe in Home)
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
    window.dispatchEvent(new CustomEvent('aery-reduce-motion', { detail: reduceMotion }));
  }, [reduceMotion]);

  const clearCache = () => {
    localStorage.removeItem(COOKIE_KEY);
    localStorage.removeItem(REDUCE_MOTION_KEY);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  };

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={closeDrawer}>
            <span className="brand-name">aeryflux</span>
          </Link>
          <div className="nav-actions">
            <div className="lang-flags">
              <button
                className="lang-flag-toggle"
                onClick={() => setFlagsOpen(o => !o)}
                aria-label="Change language"
              >
                <span className={`fi fi-${LANG_COUNTRY[lang]}`} />
                <span className="lang-flag-chevron">{flagsOpen ? '▲' : '▼'}</span>
              </button>
              <div className={`lang-flag-list${flagsOpen ? ' open' : ''}`}>
                {LANGS.map(l => (
                  <button
                    key={l.id}
                    className={`lang-flag-btn${lang === l.id ? ' active' : ''}`}
                    onClick={() => { setLang(l.id); setFlagsOpen(false); }}
                    aria-label={l.label}
                    title={l.label}
                  >
                    <span className={`fi fi-${LANG_COUNTRY[l.id]}`} />
                  </button>
                ))}
              </div>
            </div>
            {/* Desktop links */}
            <Link to="/docs" className="nav-link-minimal nav-desktop">Docs</Link>
            <a href="https://atlas.aeryflux.com" className="nav-link-minimal nav-desktop">Atlas</a>
            <a href="https://haki.aeryflux.com" className="nav-link-minimal nav-desktop">Haki</a>
            <a href="https://github.com/aeryflux" className="nav-link-minimal nav-desktop" target="_blank" rel="noopener noreferrer">
              <Github size={16} />
            </a>
            {/* Settings gear */}
            <div className="nav-settings-wrap nav-desktop" ref={settingsRef}>
              <button
                className="nav-link-minimal nav-settings-btn"
                onClick={() => setSettingsOpen(o => !o)}
                aria-label={t('settings.title')}
                title={t('settings.title')}
              >
                <Settings size={16} />
              </button>
              {settingsOpen && (
                <div className="nav-settings-panel">
                  <div className="nav-settings-title">{t('settings.title')}</div>
                  <label className="nav-settings-row">
                    <span className="nav-settings-label">{t('settings.photosensitive')}</span>
                    <input
                      type="checkbox"
                      checked={reduceMotion}
                      onChange={e => setReduceMotion(e.target.checked)}
                      className="nav-settings-check"
                    />
                  </label>
                  <button className="nav-settings-clear" onClick={clearCache}>
                    {cleared ? t('settings.cleared') : t('settings.clear_cache')}
                  </button>
                </div>
              )}
            </div>
            {/* Mobile hamburger */}
            <button
              className="nav-hamburger"
              onClick={() => setDrawerOpen(o => !o)}
              aria-label={drawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={drawerOpen}
            >
              {drawerOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-drawer${drawerOpen ? ' open' : ''}`} aria-hidden={!drawerOpen}>
        <Link to="/docs" className="nav-drawer-link" onClick={closeDrawer}>Docs</Link>
        <a href="https://atlas.aeryflux.com" className="nav-drawer-link" onClick={closeDrawer}>Atlas</a>
        <a href="https://haki.aeryflux.com" className="nav-drawer-link" onClick={closeDrawer}>Haki</a>
        <a href="https://github.com/aeryflux" className="nav-drawer-link" target="_blank" rel="noopener noreferrer" onClick={closeDrawer}>
          <Github size={14} />
          <span>GitHub</span>
        </a>
      </div>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
