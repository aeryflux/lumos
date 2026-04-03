export type Lang = 'en' | 'fr' | 'es' | 'de';

/** ISO 3166-1 alpha-2 country codes for flag-icons CSS */
export const LANG_COUNTRY: Record<Lang, string> = {
  en: 'gb',
  fr: 'fr',
  es: 'es',
  de: 'de',
};

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    // Home
    'tagline.explore': 'explore the world',
    'tagline.learn': 'learn to code',

    // Search
    'search.placeholder': 'Search a country...',
    'search.showcase.weather': 'Global weather',
    'search.showcase.news': 'World news',
    'search.showcase.music': 'Play jazz music',
    'search.found': 'Found:',
    'search.explore': 'Explore {name} on the globe',
    'search.explore.globe': 'Explore countries and data on the interactive globe',
    'search.try': 'Try a country name like "Japan" or "France"',

    // Showcase queries
    'showcase.1': 'Where is Japan?',
    'showcase.2': 'Tell me about Brazil',
    'showcase.3': 'What about South Korea?',
    'showcase.4': 'Show me Germany',
    'showcase.5': 'Where is Australia?',

    // Music
    'music.try': 'Try on Atlas',

    // Nav
    'nav.github': 'GitHub',
  },
  fr: {
    'tagline.explore': 'explore le monde',
    'tagline.learn': 'apprends à coder',

    'search.placeholder': 'Rechercher un pays...',
    'search.showcase.weather': 'Météo mondiale',
    'search.showcase.news': 'Actualités mondiales',
    'search.showcase.music': 'Joue du jazz',
    'search.found': 'Trouvé :',
    'search.explore': 'Explorer {name} sur le globe',
    'search.explore.globe': 'Explorez les pays et données sur le globe interactif',
    'search.try': 'Essayez un pays comme "Japon" ou "France"',

    'showcase.1': 'Où se trouve le Japon ?',
    'showcase.2': 'Parle-moi du Brésil',
    'showcase.3': 'Et la Corée du Sud ?',
    'showcase.4': 'Montre-moi l\'Allemagne',
    'showcase.5': 'Où est l\'Australie ?',

    'music.try': 'Essayer sur Atlas',

    'nav.github': 'GitHub',
  },
  es: {
    'tagline.explore': 'explora el mundo',
    'tagline.learn': 'aprende a programar',

    'search.placeholder': 'Buscar un país...',
    'search.showcase.weather': 'Clima mundial',
    'search.showcase.news': 'Noticias mundiales',
    'search.showcase.music': 'Pon algo de jazz',
    'search.found': 'Encontrado:',
    'search.explore': 'Explorar {name} en el globo',
    'search.explore.globe': 'Explora países y datos en el globo interactivo',
    'search.try': 'Prueba un país como "Japón" o "Francia"',

    'showcase.1': '¿Dónde está Japón?',
    'showcase.2': 'Háblame de Brasil',
    'showcase.3': '¿Qué hay de Corea del Sur?',
    'showcase.4': 'Muéstrame Alemania',
    'showcase.5': '¿Dónde está Australia?',

    'music.try': 'Probar en Atlas',

    'nav.github': 'GitHub',
  },
  de: {
    'tagline.explore': 'erkunde die Welt',
    'tagline.learn': 'lerne zu coden',

    'search.placeholder': 'Land suchen...',
    'search.showcase.weather': 'Globales Wetter',
    'search.showcase.news': 'Weltnachrichten',
    'search.showcase.music': 'Spiele Jazz',
    'search.found': 'Gefunden:',
    'search.explore': '{name} auf dem Globus erkunden',
    'search.explore.globe': 'Erkunde Länder und Daten auf dem interaktiven Globus',
    'search.try': 'Versuche einen Ländernamen wie "Japan" oder "Frankreich"',

    'showcase.1': 'Wo liegt Japan?',
    'showcase.2': 'Erzähl mir von Brasilien',
    'showcase.3': 'Was ist mit Südkorea?',
    'showcase.4': 'Zeig mir Deutschland',
    'showcase.5': 'Wo liegt Australien?',

    'music.try': 'Auf Atlas testen',

    'nav.github': 'GitHub',
  },
};
