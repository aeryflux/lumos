import { Link } from 'react-router-dom';
import {
  BookOpen,
  Rocket,
  Globe,
  Palette,
  ArrowRight,
  ExternalLink,
  Github,
  Package
} from 'lucide-react';
import { useTranslation } from '../i18n';
import './Docs.css';

export function Docs() {
  const { t } = useTranslation();

  const docCategories = [
    {
      title: 'Getting Started',
      desc: 'Quick start guides and installation',
      icon: <Rocket size={24} />,
      links: [
        { title: 'Introduction', href: '/docs/introduction' },
        { title: 'Quick Start', href: '/docs/quickstart' },
      ]
    },
    {
      title: '@aeryflux/globe',
      desc: 'React 3D globe component',
      icon: <Globe size={24} />,
      links: [
        { title: 'Overview', href: '/docs/globe' },
        { title: 'Props Reference', href: '/docs/globe/props' },
        { title: 'Integration', href: '/docs/globe/integration' },
      ]
    },
    {
      title: 'Design System',
      desc: 'Colors, typography, and guidelines',
      icon: <Palette size={24} />,
      links: [
        { title: 'Design System', href: '/docs/design' },
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
            <div key={category.title} className="docs-card">
              <div className="docs-card-header">
                <div className="docs-card-icon">{category.icon}</div>
                <h3>{category.title}</h3>
              </div>
              <p className="docs-card-description">{category.desc}</p>
              <ul className="docs-card-links">
                {category.links.map((link) => (
                  <li key={link.href}>
                    <Link to={link.href}>
                      {link.title}
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
          <h3>Resources</h3>
          <div className="docs-external-grid">
            <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer" className="docs-external-card">
              <Github size={20} />
              <span>GitHub Organization</span>
              <ExternalLink size={14} />
            </a>
            <a href="https://www.npmjs.com/package/@aeryflux/globe" target="_blank" rel="noopener noreferrer" className="docs-external-card">
              <Package size={20} />
              <span>npm Package</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Docs;
