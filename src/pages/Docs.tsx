import { Link } from 'react-router-dom';
import {
  BookOpen,
  Rocket,
  Code2,
  Smartphone,
  Server,
  Globe,
  Palette,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from '../i18n';
import './Docs.css';

export function Docs() {
  const { t } = useTranslation();

  const docCategories = [
    {
      titleKey: 'docs.categories.gettingStarted.title',
      descKey: 'docs.categories.gettingStarted.desc',
      icon: <Rocket size={24} />,
      links: [
        { titleKey: 'docs.links.introduction', href: '/docs/introduction' },
        { titleKey: 'docs.links.quickStart', href: '/docs/quickstart' },
        { titleKey: 'docs.links.installation', href: '/docs/installation' },
      ]
    },
    {
      titleKey: 'docs.categories.atlasMobile.title',
      descKey: 'docs.categories.atlasMobile.desc',
      icon: <Smartphone size={24} />,
      links: [
        { titleKey: 'docs.links.globeNavigation', href: '/docs/atlas/navigation' },
        { titleKey: 'docs.links.explorationModes', href: '/docs/atlas/modes' },
        { titleKey: 'docs.links.challengesStars', href: '/docs/atlas/challenges' },
      ]
    },
    {
      titleKey: 'docs.categories.api.title',
      descKey: 'docs.categories.api.desc',
      icon: <Code2 size={24} />,
      links: [
        { titleKey: 'docs.links.authentication', href: '/docs/api/auth' },
        { titleKey: 'docs.links.countries', href: '/docs/api/countries' },
        { titleKey: 'docs.links.musicMedia', href: '/docs/api/music' },
      ]
    },
    {
      titleKey: 'docs.categories.holocronAdmin.title',
      descKey: 'docs.categories.holocronAdmin.desc',
      icon: <Server size={24} />,
      links: [
        { titleKey: 'docs.links.dashboard', href: '/docs/holocron/dashboard' },
        { titleKey: 'docs.links.contentManagement', href: '/docs/holocron/content' },
        { titleKey: 'docs.links.userManagement', href: '/docs/holocron/users' },
      ]
    },
    {
      titleKey: 'docs.categories.globe.title',
      descKey: 'docs.categories.globe.desc',
      icon: <Globe size={24} />,
      links: [
        { titleKey: 'docs.links.globeVariants', href: '/docs/globe/variants' },
        { titleKey: 'docs.links.customThemes', href: '/docs/globe/themes' },
        { titleKey: 'docs.links.performance', href: '/docs/globe/performance' },
      ]
    },
    {
      titleKey: 'docs.categories.designSystem.title',
      descKey: 'docs.categories.designSystem.desc',
      icon: <Palette size={24} />,
      links: [
        { titleKey: 'docs.links.colorsThemes', href: '/docs/design/colors' },
        { titleKey: 'docs.links.typography', href: '/docs/design/typography' },
        { titleKey: 'docs.links.components', href: '/docs/design/components' },
      ]
    },
  ];

  return (
    <div className="docs-page">
      <div className="docs-container">
        {/* Header */}
        <div className="docs-header">
          <div className="docs-header-icon">
            <BookOpen size={32} />
          </div>
          <h1>{t('docs.title')}</h1>
          <p>{t('docs.subtitle')}</p>
        </div>

        {/* Search */}
        <div className="docs-search">
          <input
            type="text"
            placeholder={t('docs.search')}
            className="docs-search-input"
          />
        </div>

        {/* Categories Grid */}
        <div className="docs-grid">
          {docCategories.map((category) => (
            <div key={category.titleKey} className="docs-card">
              <div className="docs-card-header">
                <div className="docs-card-icon">{category.icon}</div>
                <h3>{t(category.titleKey)}</h3>
              </div>
              <p className="docs-card-description">{t(category.descKey)}</p>
              <ul className="docs-card-links">
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href}>
                      {t(link.titleKey)}
                      <ArrowRight size={14} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* External Resources */}
        <div className="docs-external">
          <h3>{t('docs.external.title')}</h3>
          <div className="docs-external-grid">
            <a href="https://github.com/aeryflux" target="_blank" rel="noopener" className="docs-external-card">
              <Server size={20} />
              <span>{t('docs.external.github')}</span>
              <ExternalLink size={14} />
            </a>
            <a href="https://discord.gg/aeryflux" target="_blank" rel="noopener" className="docs-external-card">
              <Globe size={20} />
              <span>{t('docs.external.discord')}</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Docs;
