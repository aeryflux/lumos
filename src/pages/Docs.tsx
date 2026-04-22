import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useI18n } from '../i18n';
import './Docs.css';

const PACKAGES = [
  {
    name: '@aeryflux/globe',
    descKey: 'docs.globe.desc',
    npm: 'npm install @aeryflux/globe',
    github: 'https://github.com/aeryflux/globe',
    npmUrl: 'https://www.npmjs.com/package/@aeryflux/globe',
  },
  {
    name: '@aeryflux/design',
    descKey: 'docs.design.desc',
    npm: 'npm install @aeryflux/design',
    github: 'https://github.com/aeryflux/design',
    npmUrl: 'https://www.npmjs.com/package/@aeryflux/design',
  },
  {
    name: '@aeryflux/xenova-bridge',
    descKey: 'docs.xenova.desc',
    npm: 'npm install @aeryflux/xenova-bridge',
    github: 'https://github.com/aeryflux/xenova-bridge',
    npmUrl: 'https://www.npmjs.com/package/@aeryflux/xenova-bridge',
  },
] as const;

export function Docs() {
  const { t } = useI18n();

  return (
    <div className="docs">

      {/* ── Main 2-col ── */}
      <div className="docs-container">
        <div className="docs-col-left">
          <section className="docs-hero">
            <span className="docs-tag">{t('docs.tag')}</span>
            <h1 className="docs-title">{t('docs.hero.title')}</h1>
            <p className="docs-subtitle">{t('docs.hero.subtitle')}</p>
          </section>

          <section className="docs-section">
            <h2 className="docs-section-title">{t('docs.opencore.title')}</h2>
            <p className="docs-body">
              {t('docs.opencore.body1')}
            </p>
            <p className="docs-body">
              {t('docs.opencore.body2')}
            </p>
          </section>

          <div className="docs-notice">
            <span className="docs-notice-dot" />
            {t('docs.notice')}
          </div>
        </div>

        <div className="docs-col-right">
          <h2 className="docs-section-title">{t('docs.packages.title')}</h2>
          <div className="docs-packages">
            {PACKAGES.map(pkg => (
              <div key={pkg.name} className="docs-card">
                <div className="docs-card-header">
                  <span className="docs-card-name">{pkg.name}</span>
                  <div className="docs-card-links">
                    <a href={pkg.github} target="_blank" rel="noopener noreferrer" className="docs-card-link" title="GitHub">
                      <Github size={14} />
                    </a>
                    <a href={pkg.npmUrl} target="_blank" rel="noopener noreferrer" className="docs-card-link docs-card-link-npm" title="npm">
                      npm
                    </a>
                  </div>
                </div>
                <p className="docs-card-desc">{t(pkg.descKey as any)}</p>
                <div className="docs-card-install">
                  <code>{pkg.npm}</code>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="docs-footer">
        <nav className="docs-footer-nav">
          <Link to="/cgu"     className="docs-footer-link">CGU</Link>
          <Link to="/cgv"     className="docs-footer-link">CGV</Link>
          <Link to="/contact" className="docs-footer-link">Contact</Link>
        </nav>
        <p className="docs-footer-copy">© {new Date().getFullYear()} Aeryflux</p>
      </footer>

    </div>
  );
}

export default Docs;
