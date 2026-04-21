import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Docs.css';

export function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const name    = (f.elements.namedItem('name')    as HTMLInputElement).value;
    const email   = (f.elements.namedItem('email')   as HTMLInputElement).value;
    const message = (f.elements.namedItem('message') as HTMLTextAreaElement).value;
    window.location.href =
      `mailto:contact@aeryflux.com?subject=${encodeURIComponent(`Contact — ${name}`)}&body=${encodeURIComponent(`${message}\n\n${email}`)}`;
    setSent(true);
  };

  return (
    <div className="legal">
      <div className="legal-container">
        <Link to="/docs" className="legal-back">← Docs</Link>

        <div className="legal-header">
          <span className="docs-tag">Contact</span>
          <h1 className="legal-title">Nous contacter</h1>
        </div>

        {sent ? (
          <p className="docs-body docs-sent">Message envoyé. On revient vers toi rapidement.</p>
        ) : (
          <form className="docs-contact-form" onSubmit={handleSubmit}>
            <input name="name"    type="text"  placeholder="Nom"     className="docs-input" required />
            <input name="email"   type="email" placeholder="Email"   className="docs-input" required />
            <textarea name="message" placeholder="Message" className="docs-textarea" rows={6} required />
            <button type="submit" className="docs-submit">Envoyer</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Contact;
