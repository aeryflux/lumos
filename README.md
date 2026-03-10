# Lumos

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-19-61DAFB.svg)
![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)
![Three.js](https://img.shields.io/badge/Three.js-r169-black.svg)

Modern landing page with 3D globe visualization.

## Features

- Interactive 3D globe with real-time data visualization (422 countries, 200 cities)
- Minimalist dark theme inspired by OpenClaw
- SmartInput with Kaspersky-style aura effect
- Multi-mode search: News, Wiki, Weather, Economy, Sports
- Internationalization (EN, FR, ES, DE)
- HexLoader honeycomb animation
- Responsive design

## Quick Start

```bash
# Clone
git clone https://github.com/aeryflux/lumos.git
cd lumos

# Install
npm install

# Development
npm run dev
```

Open http://localhost:3001

## Tech Stack

- **Framework**: React 19
- **Build**: Vite 5
- **3D**: Three.js
- **Styling**: Tailwind CSS
- **Testing**: Vitest + Playwright

## Project Structure

```
lumos/
├── src/
│   ├── components/     # React components
│   │   ├── SmartInput.tsx
│   │   ├── HexLoader.tsx
│   │   └── ...
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── App.tsx
├── public/             # Static assets
├── tests/              # E2E tests
└── index.html
```

## Components

### Globe

Interactive 3D globe via [@aeryflux/globe](https://www.npmjs.com/package/@aeryflux/globe).

```tsx
import { Globe } from '@aeryflux/globe/react';

<Globe
  surface="green"
  modelUrl="/models/atlas_hex_subdiv_7.glb"
  countryData={{ france: { scale: 0.8, color: '#00ff88' } }}
  cityData={{ paris: { scale: 1.0, color: '#00d4ff' } }}
/>
```

### SmartInput

Search input with animated aura effect.

```tsx
<SmartInput
  mode="news"
  onSearch={(query) => handleSearch(query)}
/>
```

### HexLoader

Honeycomb loading animation.

```tsx
<HexLoader />
```

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run unit tests
npm run test:e2e  # Run E2E tests
```

## Environment

Create `.env` for API configuration:

```env
VITE_API_URL=http://localhost:3000
```

## Design System

### Colors

| Name | Hex |
|------|-----|
| Primary Green | `#00ff88` |
| Cyan | `#00d4ff` |
| Background | `#050508` |

### Mode Colors

| Mode | Color |
|------|-------|
| News | `#ef4444` |
| Weather | `#3b82f6` |
| Wiki | `#888888` |
| Economy | `#10b981` |
| Sports | `#f59e0b` |

### Typography

- Headings: HemiHead
- Body: Inter

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feat/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feat/amazing-feature`)
5. Open Pull Request

## Related Projects

- [geojsonto3D](https://github.com/martinbaud/geojsonto3D) - GeoJSON to 3D globe converter
- [AeryFlux](https://github.com/aeryflux) - Full platform

## License

MIT - see [LICENSE](LICENSE)
