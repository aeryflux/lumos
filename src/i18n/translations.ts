export type Lang = 'en' | 'fr' | 'es' | 'de' | 'it' | 'pt' | 'ru' | 'ja' | 'ko';

/** ISO 3166-1 alpha-2 country codes for flag-icons CSS */
export const LANG_COUNTRY: Record<Lang, string> = {
  en: 'gb',
  fr: 'fr',
  es: 'es',
  de: 'de',
  it: 'it',
  pt: 'br',
  ru: 'ru',
  ja: 'jp',
  ko: 'kr',
};

export const translations: Record<Lang, Record<string, string>> = {
  en: {
    'tagline.explore': 'explore the world',
    'tagline.learn': 'learn to code',

    'search.placeholder': 'Search a country...',
    'search.showcase.weather': 'Global weather',
    'search.showcase.news': 'World news',
    'search.showcase.music': 'Play jazz music',
    'search.found': 'Found:',
    'search.explore': 'Explore {name} on the globe',
    'search.explore.globe': 'Explore countries and data on the interactive globe',
    'search.try': 'Try a country name like "Japan" or "France"',

    'showcase.1': 'Where is Japan?',
    'showcase.2': 'Tell me about Brazil',
    'showcase.3': 'What about South Korea?',
    'showcase.4': 'Show me Germany',
    'showcase.5': 'Where is Australia?',

    'music.try': 'Try on Atlas',
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
  it: {
    'tagline.explore': 'esplora il mondo',
    'tagline.learn': 'impara a programmare',

    'search.placeholder': 'Cerca un paese...',
    'search.showcase.weather': 'Meteo mondiale',
    'search.showcase.news': 'Notizie mondiali',
    'search.showcase.music': 'Suona del jazz',
    'search.found': 'Trovato:',
    'search.explore': 'Esplora {name} sul globo',
    'search.explore.globe': 'Esplora paesi e dati sul globo interattivo',
    'search.try': 'Prova un paese come "Giappone" o "Francia"',

    'showcase.1': 'Dov\'è il Giappone?',
    'showcase.2': 'Parlami del Brasile',
    'showcase.3': 'E la Corea del Sud?',
    'showcase.4': 'Mostrami la Germania',
    'showcase.5': 'Dov\'è l\'Australia?',

    'music.try': 'Prova su Atlas',
    'nav.github': 'GitHub',
  },
  pt: {
    'tagline.explore': 'explore o mundo',
    'tagline.learn': 'aprenda a programar',

    'search.placeholder': 'Buscar um país...',
    'search.showcase.weather': 'Clima mundial',
    'search.showcase.news': 'Notícias mundiais',
    'search.showcase.music': 'Tocar jazz',
    'search.found': 'Encontrado:',
    'search.explore': 'Explorar {name} no globo',
    'search.explore.globe': 'Explore países e dados no globo interativo',
    'search.try': 'Tente um país como "Japão" ou "França"',

    'showcase.1': 'Onde fica o Japão?',
    'showcase.2': 'Fale-me sobre o Brasil',
    'showcase.3': 'E a Coreia do Sul?',
    'showcase.4': 'Mostre-me a Alemanha',
    'showcase.5': 'Onde fica a Austrália?',

    'music.try': 'Experimentar no Atlas',
    'nav.github': 'GitHub',
  },
  ru: {
    'tagline.explore': 'исследуй мир',
    'tagline.learn': 'учись программировать',

    'search.placeholder': 'Поиск страны...',
    'search.showcase.weather': 'Погода в мире',
    'search.showcase.news': 'Мировые новости',
    'search.showcase.music': 'Играть джаз',
    'search.found': 'Найдено:',
    'search.explore': 'Исследовать {name} на глобусе',
    'search.explore.globe': 'Исследуйте страны и данные на интерактивном глобусе',
    'search.try': 'Попробуйте название страны, например «Япония» или «Франция»',

    'showcase.1': 'Где находится Япония?',
    'showcase.2': 'Расскажи мне о Бразилии',
    'showcase.3': 'А что насчёт Южной Кореи?',
    'showcase.4': 'Покажи мне Германию',
    'showcase.5': 'Где находится Австралия?',

    'music.try': 'Попробовать на Atlas',
    'nav.github': 'GitHub',
  },
  ja: {
    'tagline.explore': '世界を探索する',
    'tagline.learn': 'コードを学ぶ',

    'search.placeholder': '国を検索...',
    'search.showcase.weather': '世界の天気',
    'search.showcase.news': '世界のニュース',
    'search.showcase.music': 'ジャズを再生',
    'search.found': '見つかりました:',
    'search.explore': '{name}をグローブで探索',
    'search.explore.globe': 'インタラクティブなグローブで国やデータを探索',
    'search.try': '「日本」や「フランス」など国名を入力してみてください',

    'showcase.1': '日本はどこ？',
    'showcase.2': 'ブラジルについて教えて',
    'showcase.3': '韓国はどう？',
    'showcase.4': 'ドイツを見せて',
    'showcase.5': 'オーストラリアはどこ？',

    'music.try': 'Atlasで試す',
    'nav.github': 'GitHub',
  },
  ko: {
    'tagline.explore': '세계를 탐험하다',
    'tagline.learn': '코딩을 배우다',

    'search.placeholder': '국가 검색...',
    'search.showcase.weather': '세계 날씨',
    'search.showcase.news': '세계 뉴스',
    'search.showcase.music': '재즈 재생',
    'search.found': '발견됨:',
    'search.explore': '{name}을(를) 지구본에서 탐험',
    'search.explore.globe': '인터랙티브 지구본에서 국가와 데이터 탐험',
    'search.try': '"일본"이나 "프랑스" 같은 국가명을 입력해보세요',

    'showcase.1': '일본은 어디에 있나요?',
    'showcase.2': '브라질에 대해 알려줘',
    'showcase.3': '한국은?',
    'showcase.4': '독일을 보여줘',
    'showcase.5': '호주는 어디에 있나요?',

    'music.try': 'Atlas에서 시도',
    'nav.github': 'GitHub',
  },
};
