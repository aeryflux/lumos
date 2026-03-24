import { Link } from 'react-router-dom';
import { useTranslation } from '../i18n';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '6rem', margin: 0, opacity: 0.3 }}>404</h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.6, marginBottom: '2rem' }}>
        {t('errors.notFound') || 'Page not found'}
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.2)',
          color: 'inherit',
          textDecoration: 'none',
          transition: 'background 0.2s',
        }}
      >
        {t('nav.home') || 'Back to home'}
      </Link>
    </div>
  );
}

export default NotFound;
