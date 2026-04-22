import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Github, Menu, X } from 'lucide-react';
import { useI18n, LANGS } from '../../i18n';
import { LANG_COUNTRY } from '../../i18n/translations';
import './Layout.css';

export function Layout() {
  const { lang, setLang } = useI18n();
  const [flagsOpen, setFlagsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

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
