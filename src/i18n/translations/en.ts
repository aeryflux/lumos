/**
 * English translations for Lumos
 */

export const en = {
  // Navigation
  nav: {
    home: 'Home',
    status: 'Status',
    docs: 'Docs',
    blog: 'Blog',
    download: 'Download',
  },

  // Hero Section
  hero: {
    badge: 'Open Source',
    titleLine1: 'Explore the',
    titleAccent: 'World',
    subtitle: 'An open source interactive 3D globe experience bringing music, news, weather, and knowledge from every corner of the planet to your fingertips.',
    cta: 'Download',
    tryAtlas: 'Try Atlas',
    learnMore: 'Learn More',
    viewOnGithub: 'View on GitHub',
  },

  // Features Section - Multiplatform
  features: {
    title: 'One App, Every Platform',
    subtitle: 'Explore the globe wherever you are - mobile, web, or desktop',
    mobile: {
      title: 'Mobile',
      desc: 'Touch, rotate, and explore the 3D globe with intuitive gestures. Available on iOS and Android.',
    },
    web: {
      title: 'Web',
      desc: 'No download required. Access the full experience directly in your browser with WebGL rendering.',
    },
    desktop: {
      title: 'Desktop',
      desc: 'Native performance on Windows, macOS, and Linux. Coming soon with system integration.',
    },
  },

  // Akimbo Drawer Feature
  akimbo: {
    title: 'Akimbo Navigation',
    subtitle: 'Dual-drawer interface for seamless exploration',
    desc: 'Swipe left to access exploration modes. Swipe right to customize your experience. Long-press to reorder your favorites.',
    left: {
      title: 'Left Drawer',
      desc: 'Switch between News, Music, Weather, Wiki, and Challenge modes',
    },
    right: {
      title: 'Right Drawer',
      desc: 'Theme selection, globe settings, and profile options',
    },
  },

  // Modes Section
  modes: {
    title: 'Exploration Modes',
    subtitle: 'Each mode transforms the globe with unique data and tools',
    news: 'News',
    newsDesc: 'Real-time global headlines from 35+ international RSS sources',
    newsTool: 'Themes: Filter by topic colors',
    music: 'Music',
    musicDesc: 'Discover tracks from around the world with country-specific playlists',
    musicTool: 'Genres: Electronic, Jazz, Pop & more',
    weather: 'Weather',
    weatherDesc: 'Live weather data displayed on a hexagonal Goldberg globe',
    weatherTool: 'Views: Temperature, Wind, Humidity',
    wiki: 'Wiki',
    wikiDesc: 'Explore Wikipedia articles geolocated on the interactive globe',
    wikiTool: 'Portal: Categories & deep links',
    challenge: 'Challenge',
    challengeDesc: 'Interactive globe challenges and daily missions to earn AeryTri △',
    challengeTool: 'Daily & Weekly challenges',
  },

  // Currency System
  currency: {
    title: 'Dual Currency System',
    subtitle: 'Earn rewards through gameplay, unlock cosmetics and features',
    aerytri: {
      tagline: 'Earned through challenges',
      features: [
        'Complete daily challenges',
        'Win interactive globe challenges',
        'Explore new countries',
        'Streaks & achievements',
      ],
    },
    aeryhex: {
      tagline: 'Premium currency',
      features: [
        'Exclusive globe themes',
        'Animated profile avatars',
        'Special badges & titles',
        'HD globe textures',
      ],
    },
    flow: {
      challenges: 'Complete Challenges',
      earn: 'Earn AeryTri △',
      unlock: 'Unlock Rewards',
    },
  },

  // Pricing Section
  pricing: {
    title: 'Choose Your Adventure',
    subtitle: 'Start free, earn AeryTri △ through challenges',
    currency: '€',
    perMonth: '/month',
    currencyInfo: {
      aerytri: 'AeryTri △ - Earn through challenges',
      aeryhex: 'AeryHex ⬡ - Premium currency',
    },
    free: {
      name: 'Free to Play',
      price: '0',
      cta: 'Play Free',
      features: [
        'Full globe exploration',
        'All 5 modes included',
        'Daily challenges',
        'Earn AeryTri △ rewards',
      ],
    },
    starter: {
      name: 'Starter',
      price: '2.99',
      badge: 'Popular',
      cta: 'Get Started',
      features: [
        'Everything in Free',
        '+500 AeryHex ⬡',
        '+10% AeryTri △ bonus',
        '3 themes, 1 badge',
      ],
    },
    support: {
      name: 'Support',
      price: '14.99',
      cta: 'Support Us',
      features: [
        'Everything in Starter',
        '+2000 AeryHex ⬡',
        '+25% AeryTri △ bonus',
        '10 themes, bonus challenges',
      ],
    },
    sailor: {
      name: 'Sailor',
      price: '49.99',
      cta: 'Become Sailor',
      features: [
        'Everything in Support',
        '+10000 AeryHex ⬡',
        '+50% AeryTri △ bonus',
        'All cosmetics, HD globe',
      ],
    },
  },

  // Waitlist / Community Section
  waitlist: {
    title: 'Join the Community',
    subtitle: 'Star the repo, contribute, or follow updates. Open source means everyone can help shape the future of AeryFlux.',
    placeholder: 'Enter your email',
    button: 'Subscribe for Updates',
    success: "You're subscribed! We'll keep you updated.",
    stats: 'developers interested',
    starOnGithub: 'Star on GitHub',
    contribute: 'Contribute',
    discord: 'Join Discord',
  },

  // Stack Section - User-focused
  stack: {
    title: 'Powered by TypeScript',
    subtitle: 'A unified codebase for a consistent experience across all platforms',
    fast: {
      title: 'Instant Loading',
      desc: 'Optimized 3D rendering and smart caching for a smooth experience',
    },
    typeSafe: {
      title: 'Reliable',
      desc: 'Built with strict type safety for fewer bugs and better stability',
    },
    unified: {
      title: 'Seamless Sync',
      desc: 'Your progress, themes, and preferences sync across all devices',
    },
  },

  // Footer
  footer: {
    tagline: 'Open source interactive globe. Explore the world, one challenge at a time.',
    product: 'Product',
    resources: 'Resources',
    community: 'Community',
    legal: 'Legal',
    features: 'Features',
    pricing: 'Pricing',
    download: 'Download',
    status: 'Status',
    documentation: 'Documentation',
    blog: 'Blog',
    github: 'GitHub',
    contributing: 'Contributing',
    discord: 'Discord',
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    cookies: 'Cookies',
    license: 'MIT License',
    copyright: '© {year} AeryFlux. Open source under MIT License.',
  },

  // Status Page
  status: {
    title: 'System Status',
    subtitle: 'Real-time status of AeryFlux services',
    allOperational: 'All Systems Operational',
    someIssues: 'Some Systems Experiencing Issues',
    operational: 'Operational',
    degraded: 'Degraded',
    down: 'Down',
    standby: 'Standby',
    checking: 'Checking...',
    lastChecked: 'Last checked',
    refresh: 'Refresh',
    services: {
      title: 'Services',
      api: 'API (Pythagoras)',
      apiDesc: 'Backend API & orchestration',
      web: 'Atlas Web',
      webDesc: 'Web application',
      mobile: 'Atlas Mobile',
      mobileDesc: 'iOS & Android apps',
      lumos: 'Lumos Landing',
      lumosDesc: 'Landing page & docs',
      holocron: 'Holocron Backoffice',
      holocronDesc: 'Admin & content management',
      database: 'Database',
      databaseDesc: 'PostgreSQL data store',
      cdn: 'CDN',
      cdnDesc: 'Static assets & globe models',
    },
    incidents: {
      title: 'Recent Incidents',
      noIncidents: 'No incidents reported in the last 30 days.',
    },
    subscribe: {
      title: 'Stay Informed',
      desc: 'Subscribe to receive notifications about service status updates.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
    },
  },

  // Docs Page
  docs: {
    title: 'Documentation',
    subtitle: 'Everything you need to explore, build, and customize AeryFlux',
    search: 'Search documentation...',
    categories: {
      gettingStarted: {
        title: 'Getting Started',
        desc: 'Quick start guides and installation instructions',
      },
      atlasMobile: {
        title: 'Atlas Mobile',
        desc: 'Mobile app features, modes, and customization',
      },
      api: {
        title: 'API Reference',
        desc: 'Pythagoras API endpoints and integration',
      },
      holocronAdmin: {
        title: 'Holocron Admin',
        desc: 'Backoffice dashboard and content management',
      },
      globe: {
        title: '3D Globe',
        desc: 'Three.js globe rendering and customization',
      },
      designSystem: {
        title: 'Design System',
        desc: 'Colors, typography, and component guidelines',
      },
    },
    links: {
      introduction: 'Introduction',
      quickStart: 'Quick Start',
      installation: 'Installation',
      globeNavigation: 'Globe Navigation',
      explorationModes: 'Exploration Modes',
      challengesStars: 'Challenges & AeryTri',
      authentication: 'Authentication',
      countries: 'Countries',
      musicMedia: 'Music & Media',
      configuration: 'Configuration',
      troubleshooting: 'Troubleshooting',
      dashboard: 'Dashboard',
      contentManagement: 'Content Management',
      userManagement: 'User Management',
      globeVariants: 'Globe Variants',
      customThemes: 'Custom Themes',
      performance: 'Performance',
      colorsThemes: 'Colors & Themes',
      typography: 'Typography',
      components: 'Components',
    },
    external: {
      title: 'External Resources',
      github: 'GitHub Repository',
      discord: 'Discord Community',
    },
  },

  // Blog Page
  blog: {
    title: 'Blog',
    subtitle: 'News, updates, and technical deep-dives from the AeryFlux team',
    featured: 'Recent Posts',
    readMore: 'Read more',
    minRead: 'min read',
    categories: {
      announcement: 'Announcement',
      tutorial: 'Tutorial',
      engineering: 'Technical',
    },
    posts: {
      intro: {
        title: 'Introducing AeryFlux: Explore the World in 3D',
        excerpt: "Today we're excited to announce AeryFlux, an interactive 3D globe experience that brings music, news, weather, and knowledge from every corner of the planet.",
      },
      hexGlobe: {
        title: 'Building a Hexagonal Weather Globe with Three.js',
        excerpt: 'A deep dive into how we created our unique hexagonal Goldberg polyhedron globe for displaying weather data with optimal performance on mobile devices.',
      },
      journey: {
        title: 'The Journey to 1.0: Lessons Learned',
        excerpt: "From a simple idea to a full-fledged monorepo with 6 apps, here's what we learned building AeryFlux over the past year.",
      },
    },
    subscribe: {
      title: 'Stay Updated',
      desc: 'Subscribe to our newsletter for the latest news and updates.',
      placeholder: 'Enter your email',
      button: 'Subscribe',
    },
  },

  // Search / DemoPreview
  search: {
    placeholder: 'Try "news Japan" or "weather France"...',
    loading: 'Searching...',
    noResults: 'No results found',
    error: 'Search failed. Please try again.',
    resultsFor: 'Results for "{query}"',
    viewAll: 'View all',
    articles: '{count} articles',
    countries: '{count} countries',
    subjects: 'related subjects',
    readMore: 'Read article',
    learnMore: 'Learn more',
    seeOnGlobe: 'See on globe',
    modes: {
      auto: 'Auto',
      news: 'News',
      weather: 'Weather',
      wiki: 'Wiki',
      sports: 'Sports',
      economy: 'Economy',
    },
    global: {
      weather: 'World Weather',
      news: 'World News',
      wiki: 'World Encyclopedia',
      sports: 'World Sports',
      economy: 'Global Economy',
      avg: 'Avg',
      min: 'Min',
      max: 'Max',
      articles: '{count} recent articles',
      indexed: '{count} indexed articles',
      matches: '{count} matches today',
      markets: '{count} markets tracked',
    },
    wiki: {
      search: 'Search "{query}"',
    },
    weather: {
      temperature: 'Temperature',
      humidity: 'Humidity',
      wind: 'Wind',
      feelsLike: 'Feels like',
      condition: 'Condition',
    },
    hints: {
      news: 'Search global news headlines',
      weather: 'Get weather for any country',
      wiki: 'Explore Wikipedia articles by topic',
      sports: 'Get sports news and match scores',
      economy: 'Track markets and economic indicators',
    },
  },

  // Download Page
  download: {
    title: 'Download AeryFlux',
    subtitle: 'Choose your platform and join the waitlist for early access',
    badge: 'Alpha Access',
    waitlist: 'Waitlist',
    platforms: {
      mobile: 'Mobile',
      desktop: 'Desktop',
      web: 'Web',
    },
    features: {
      title: 'Included Features',
    },
    mobile: {
      title: 'Atlas Mobile',
      desc: 'The full AeryFlux experience on iOS and Android',
      ios: 'iOS (iPhone & iPad)',
      iosReq: 'Requires iOS 15.0 or later',
      android: 'Android',
      androidReq: 'Requires Android 10 or later',
      features: [
        'Interactive 3D globe with touch controls',
        '6 exploration modes (Music, News, Weather...)',
        'Daily challenges & AeryTri △ rewards',
        'Offline mode for saved countries',
      ],
    },
    desktop: {
      title: 'Atlas Desktop',
      desc: 'Desktop application coming soon',
      windows: 'Windows',
      windowsReq: 'Windows 10 or later (64-bit)',
      macos: 'macOS',
      macosReq: 'macOS 11 Big Sur or later',
      linux: 'Linux',
      linuxReq: 'AppImage (Ubuntu, Fedora, etc.)',
      features: [
        'Native desktop experience',
        'System tray integration',
        'Auto-updates',
        'Coming in a future release',
      ],
    },
    web: {
      title: 'Atlas Web',
      desc: 'Access AeryFlux directly in your browser',
      browser: 'Web App',
      browserReq: 'Chrome, Firefox, Safari, Edge',
      features: [
        'No installation required',
        'Full 3D globe experience',
        'Cross-platform sync',
        'PWA installable',
      ],
    },
    waitlistForm: {
      title: 'Join the Alpha Waitlist',
      desc: 'Be the first to know when {platform} is available.',
      placeholder: 'Enter your email',
      button: 'Join Waitlist',
      success: "You're on the list! We'll notify you when it's ready.",
    },
  },
};

export type TranslationKeys = typeof en;
