import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import './Docs.css';

type FormState = 'idle' | 'sending' | 'sent' | 'error';

export function Contact() {
  const { t } = useI18n();
  const [state, setState] = useState<FormState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setState('sending');
    setErrorMsg('');

    const f = e.currentTarget;
    const name    = (f.elements.namedItem('name')    as HTMLInputElement).value.trim();
    const email   = (f.elements.namedItem('email')   as HTMLInputElement).value.trim();
    const message = (f.elements.namedItem('message') as HTMLTextAreaElement).value.trim();

    try {
      const apiBase = import.meta.env.VITE_API_URL ?? '';
      const res = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setState('sent');
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? t('contact.error.server'));
        setState('error');
      }
    } catch {
      setErrorMsg(t('contact.error.server'));
      setState('error');
    }
  };

  return (
    <div className="legal">
      <div className="legal-container">
        <Link to="/docs" className="legal-back">{t('legal.back')}</Link>

        <div className="legal-header">
          <span className="docs-tag">{t('contact.tag')}</span>
          <h1 className="legal-title">{t('contact.title')}</h1>
        </div>

        {state === 'sent' ? (
          <p className="docs-body docs-sent">{t('contact.sent')}</p>
        ) : (
          <form className="docs-contact-form" onSubmit={handleSubmit}>
            <input name="name"    type="text"  placeholder={t('contact.name')}    className="docs-input"    required disabled={state === 'sending'} />
            <input name="email"   type="email" placeholder={t('contact.email')}   className="docs-input"    required disabled={state === 'sending'} />
            <textarea name="message" placeholder={t('contact.message')} className="docs-textarea" rows={6} required disabled={state === 'sending'} />
            {state === 'error' && (
              <p className="docs-error">{errorMsg}</p>
            )}
            <button type="submit" className="docs-submit" disabled={state === 'sending'}>
              {state === 'sending' ? t('contact.sending') : t('contact.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Contact;
