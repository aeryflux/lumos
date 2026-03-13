# Lumos

AeryFlux landing page — [aeryflux.com](https://aeryflux.com)

## Quick Start

```bash
npm install        # Install deps
npm run dev        # Dev server (port 3001)
npm run build      # Production build
npm run preview    # Preview build
```

## Port

**3001** (configured in vite.config.ts)

## Structure

```
lumos/
├── src/
│   ├── components/
│   │   ├── Globe/         # 3D globe (@aeryflux/globe)
│   │   ├── SmartInput/    # NL search with aura effect
│   │   └── Layout/        # Page structure
│   ├── hooks/
│   ├── i18n/              # en, fr, es, de
│   └── App.tsx
├── public/models/         # GLB files
└── vite.config.ts
```

## Tech Stack

- React 19 + Vite 5
- Three.js + @react-three/fiber
- Tailwind CSS
- react-i18next (4 languages)

## Features

- Interactive 3D globe
- SmartInput with aura glow effect
- Multi-mode search (news, wiki, weather, economy, sports)
- i18n: English, French, Spanish, German

## Deployment

Cloudflare Pages (auto-deploy on push to main)

## Related

- Uses: `@aeryflux/globe`, `xenova-bridge`
- Docs: `~/aery-doc/aeryflux/lumos.md`
