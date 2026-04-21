import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useI18n, LANGS } from '../../i18n';
import { LANG_COUNTRY } from '../../i18n/translations';
import './Layout.css';

export function Layout() {
  const { lang, setLang } = useI18n();
  const [flagsOpen, setFlagsOpen] = useState(false);

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="brand-name">aeryflux</span>
          </Link>
          <div className="nav-actions">
            <div className="lang-flags">
              {/* Mobile: single flag toggle */}
              <button
                className="lang-flag-toggle"
                onClick={() => setFlagsOpen(o => !o)}
                aria-label="Change language"
              >
                <span className={`fi fi-${LANG_COUNTRY[lang]}`} />
                <span className="lang-flag-chevron">{flagsOpen ? '▲' : '▼'}</span>
              </button>
              {/* All flags (desktop inline / mobile dropdown) */}
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
            <a href="https://atlas.aeryflux.com" className="nav-link-minimal">Atlas</a>
            <a href="https://haki.aeryflux.com" className="nav-link-minimal">Haki</a>
            <a href="https://github.com/aeryflux" className="nav-link-minimal" target="_blank" rel="noopener noreferrer">
              <Github size={16} />
            </a>
          </div>
        </div>
      </nav>

      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
