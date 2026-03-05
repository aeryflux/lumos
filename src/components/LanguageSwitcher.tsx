/**
 * LanguageSwitcher - Cycles through available languages (EN/FR/ES/DE)
 *
 * Pattern mirroring ThemeSwitcher:
 * - Persists to localStorage
 * - Sets data-language attribute on documentElement
 * - Uses flagcdn.com for SVG flag images (no npm dependency required)
 * - Auto-detects browser language on first visit
 */

import { useState, useEffect } from 'react';
import './LanguageSwitcher.css';

export type Language = 'en' | 'fr' | 'es' | 'de';

interface LanguageConfig {
  countryCode: string;
  label: string;
  nativeName: string;
}

const languageConfigs: Record<Language, LanguageConfig> = {
  en: { countryCode: 'gb', label: 'EN', nativeName: 'English' },
  fr: { countryCode: 'fr', label: 'FR', nativeName: 'Français' },
  es: { countryCode: 'es', label: 'ES', nativeName: 'Español' },
  de: { countryCode: 'de', label: 'DE', nativeName: 'Deutsch' },
};

const STORAGE_KEY = 'lumos-language';
const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'es', 'de'];

/**
 * Detect browser language from navigator.language
 */
function getBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';
  const browserLang = navigator.language.split('-')[0].toLowerCase();
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }
  return 'en';
}

export function LanguageSwitcher() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';

    // Check localStorage for user preference
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && saved in languageConfigs) {
      return saved as Language;
    }

    // First visit: detect browser language
    return getBrowserLanguage();
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-language', language);
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const cycleLanguage = () => {
    const langs: Language[] = ['en', 'fr', 'es', 'de'];
    const currentIndex = langs.indexOf(language);
    const nextIndex = (currentIndex + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const config = languageConfigs[language];
  const flagUrl = `https://flagcdn.com/w40/${config.countryCode}.png`;

  return (
    <button
      className="language-switcher"
      onClick={cycleLanguage}
      title={`${config.nativeName} - Click to change language`}
      aria-label={`Current language: ${config.nativeName}. Click to switch.`}
    >
      <img
        src={flagUrl}
        alt={config.nativeName}
        className="language-flag"
        width={20}
        height={14}
      />
      <span className="language-label">{config.label}</span>
    </button>
  );
}

export default LanguageSwitcher;
