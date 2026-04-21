import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import './Docs.css';

const PACKAGES = [
  {
    name: '@aeryflux/globe',
    description: '3D interactive globe for React and React Native. Hex-tiled WebGL rendering, country highlights, data-driven extrusion, flyTo animation.',
    npm: 'npm install @aeryflux/globe',
    github: 'https://github.com/aeryflux/globe',
    npmUrl: 'https://www.npmjs.com/package/@aeryflux/globe',
  },
  {
    name: '@aeryflux/design',
    description: 'Shared design tokens, CSS variables and base components across the Aeryflux stack. Dark-first, themeable.',
    npm: 'npm install @aeryflux/design',
    github: 'https://github.com/aeryflux/design',
    npmUrl: 'https://www.npmjs.com/package/@aeryflux/design',
  },
  {
    name: '@aeryflux/xenova-bridge',
    description: 'Local NLP inference layer built on Transformers.js. Runs entirely in the browser — no API key, no server.',
    npm: 'npm install @aeryflux/xenova-bridge',
    github: 'https://github.com/aeryflux/xenova-bridge',
    npmUrl: 'https://www.npmjs.com/package/@aeryflux/xenova-bridge',
  },
];

export function Docs() {
  return (
    <div className="docs">

      {/* ── Main 2-col ── */}
      <div className="docs-container">
        <div className="docs-col-left">
          <section className="docs-hero">
            <span className="docs-tag">Open Source</span>
            <h1 className="docs-title">Built in the open.</h1>
            <p className="docs-subtitle">
              Aeryflux follows an open-core model. The infrastructure —
              3D rendering, design system, AI inference — is MIT-licensed and
              published on npm. The products built on top are proprietary.
            </p>
          </section>

          <section className="docs-section">
            <h2 className="docs-section-title">Open Core</h2>
            <p className="docs-body">
              Core packages and front-end applications —{' '}
              <span className="docs-em">aeryflux.com</span>,{' '}
              <a href="https://haki.aeryflux.com" className="docs-link">Haki</a> — are
              open source. The closed core is{' '}
              <span className="docs-em">aeryflux-core</span> : the{' '}
              <a href="https://atlas.aeryflux.com" className="docs-link">Atlas</a> product,
              the Pythagoras API, and the Holocron back-office.
            </p>
            <p className="docs-body">
              Contributions, issues and feature requests are welcome on{' '}
              <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer" className="docs-link">
                github.com/aeryflux
              </a>.
            </p>
          </section>

          <div className="docs-notice">
            <span className="docs-notice-dot" />
            Full API documentation is in progress.
          </div>
        </div>

        <div className="docs-col-right">
          <h2 className="docs-section-title">Packages</h2>
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
                <p className="docs-card-desc">{pkg.description}</p>
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
