/**
 * Lumos i18n Hook
 * Provides translations with reactive language switching
 * Automatically detects browser language on first visit
 */

import { useState, useEffect, useCallback } from 'react';
import { en } from './translations/en';
import { fr } from './translations/fr';
import { es } from './translations/es';
import { de } from './translations/de';

export type Language = 'en' | 'fr' | 'es' | 'de';

const translations: Record<Language, typeof en> = { en, fr, es, de };
const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'es', 'de'];

/**
 * Detect browser language from navigator.language
 * Returns the primary language code if supported, otherwise 'en'
 */
export function getBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'en';

  // navigator.language returns 'en-US', 'fr-FR', etc.
  // Extract primary language code (before hyphen)
  const browserLang = navigator.language.split('-')[0].toLowerCase();

  // Check if browser language is supported
  if (SUPPORTED_LANGUAGES.includes(browserLang as Language)) {
    return browserLang as Language;
  }

  return 'en';
}

/**
 * Hook for accessing translations with reactive language switching.
 * Listens to data-language attribute changes via MutationObserver.
 * On first visit, detects browser language automatically.
 */
export function useTranslation() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';

    // Check if user has previously selected a language
    const saved = localStorage.getItem('lumos-language');
    if (saved && SUPPORTED_LANGUAGES.includes(saved as Language)) {
      return saved as Language;
    }

    // First visit: detect browser language
    return getBrowserLanguage();
  });

  // Listen for language changes via MutationObserver
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-language') {
          const lang = document.documentElement.getAttribute('data-language') as Language;
          if (lang && lang !== language && translations[lang]) {
            setLanguage(lang);
          }
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-language'],
    });

    // Sync initial state
    const currentLang = document.documentElement.getAttribute('data-language') as Language;
    if (currentLang && currentLang !== language && translations[currentLang]) {
      setLanguage(currentLang);
    }

    return () => observer.disconnect();
  }, [language]);

  /**
   * Get a translation by dot-notation key.
   * Supports parameter interpolation: t('footer.copyright', { year: 2025 })
   * Always returns a string (arrays are joined with newlines, use tList for raw arrays).
   */
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const keys = key.split('.');
      let value: unknown = translations[language];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          // Key not found, return the key itself
          return key;
        }
      }

      // Convert arrays to string (join with newlines)
      if (Array.isArray(value)) {
        return value.join('\n');
      }

      if (typeof value !== 'string') {
        return key;
      }

      // Parameter interpolation: {param} → value
      if (params) {
        return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
          return String(params[paramKey] ?? `{${paramKey}}`);
        });
      }

      return value;
    },
    [language]
  );

  /**
   * Get a translation as an array (for feature lists, bullet points, etc.)
   * Returns empty array if key not found or not an array.
   */
  const tList = useCallback(
    (key: string): string[] => {
      const keys = key.split('.');
      let value: unknown = translations[language];

      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return [];
        }
      }

      if (Array.isArray(value)) {
        return value;
      }

      return [];
    },
    [language]
  );

  return { t, tList, language };
}

export default useTranslation;
