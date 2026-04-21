import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { translations, LANG_COUNTRY, type Lang } from './translations';

interface I18nContextValue {
  lang: Lang;
  flag: string;
  setLang: (lang: Lang) => void;
  nextLang: () => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LANG_ORDER: Lang[] = ['en', 'fr', 'es', 'de', 'it'];

export const I18nContext = createContext<I18nContextValue>(null!);

export const LANGS: { id: Lang; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'fr', label: 'FR' },
  { id: 'es', label: 'ES' },
  { id: 'de', label: 'DE' },
  { id: 'it', label: 'IT' },
];

function detectLang(): Lang {
  const nav = navigator.language?.slice(0, 2) || 'en';
  if (nav in translations) return nav as Lang;
  return 'en';
}

export function useI18nProvider() {
  const [lang, setLangState] = useState<Lang>(detectLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.documentElement.lang = l;
  }, []);

  const nextLang = useCallback(() => {
    setLangState(prev => {
      const idx = LANG_ORDER.indexOf(prev);
      const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const flag = LANG_COUNTRY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string, params?: Record<string, string>) => {
    let str = translations[lang]?.[key] || translations.en[key] || key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  }, [lang]);

  return useMemo(() => ({ lang, flag, setLang, nextLang, t }), [lang, flag, setLang, nextLang, t]);
}

export function useI18n() {
  return useContext(I18nContext);
}

export type { Lang };
