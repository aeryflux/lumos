import { Outlet, Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useI18n } from '../../i18n';
import './Layout.css';

export function Layout() {
  const { flag, nextLang } = useI18n();

  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="brand-name">aeryflux</span>
          </Link>
          <div className="nav-actions">
            <button className="lang-toggle" onClick={nextLang} aria-label="Change language">
              {flag}
            </button>
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
