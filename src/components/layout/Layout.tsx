import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Github } from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { Logo } from '../Logo';
import { GridBackground } from '../GridBackground';
import { useEffectsOptional } from '../../contexts/EffectsContext';
import { useTranslation } from '../../i18n';
import { useThemeColors } from '../../hooks/useThemeColors';
import './Layout.css';

export function Layout() {
  const location = useLocation();
  const { t } = useTranslation();
  const effects = useEffectsOptional();
  const themeColors = useThemeColors();
  const isHome = location.pathname === '/';

  return (
    <div className="layout">
      {/* Global grid background - connected to effects system */}
      <GridBackground
        variant="grid"
        size={50}
        opacity={0.15}
        fade={false}
        className="layout-bg"
        effect={effects?.effect}
        effectColor={effects?.effectColor}
        effectTrigger={effects?.effectTrigger}
      />

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <Logo size={36} />
            <span className="brand-name">
              <span style={{ color: themeColors.titleAery }}>AERY</span>
              <span style={{ color: themeColors.titleFlux }}>FLUX</span>
            </span>
          </Link>

          <div className="nav-actions">
            <Link to="/docs" className="nav-link-minimal">
              <FileText size={16} />
              <span className="nav-link-label">{t('nav.docs')}</span>
            </Link>
            <a
              href="https://github.com/aeryflux/aeryflux"
              className="nav-link-minimal"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} />
              <span className="nav-link-label">GitHub</span>
            </a>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main">
        <Outlet />
      </main>

      {/* Footer - Hidden on homepage */}
      {!isHome && (
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-links">
                <Link to="/docs">{t('nav.docs')}</Link>
                <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer">GitHub</a>
                <Link to="/legal/privacy">{t('footer.privacy')}</Link>
                <Link to="/legal/terms">{t('footer.terms')}</Link>
              </div>
              <p className="footer-copyright">
                {t('footer.copyright', { year: new Date().getFullYear() })}
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default Layout;
