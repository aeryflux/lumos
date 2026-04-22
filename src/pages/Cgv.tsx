import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Docs.css';

export function Cgv() {
  const { t } = useI18n();

  const sections = [1, 2, 3, 4, 5, 6, 7] as const;

  return (
    <div className="legal">
      <div className="legal-container">
        <Link to="/docs" className="legal-back">{t('legal.back')}</Link>

        <div className="legal-header">
          <span className="docs-tag">{t('legal.tag')}</span>
          <h1 className="legal-title">{t('cgv.title')}</h1>
          <p className="legal-updated">{t('legal.updated', { year: String(new Date().getFullYear()) })}</p>
        </div>

        {sections.map(n => (
          <div key={n} className="legal-section">
            <h2>{t(`cgv.${n}.title` as any)}</h2>
            <p>{t(`cgv.${n}.body` as any)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cgv;
