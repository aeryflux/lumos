# Contributing to Lumos

Thanks for your interest in contributing!

## Getting Started

1. Fork the repository
2. Clone: `git clone https://github.com/<you>/lumos.git`
3. Install: `npm install`
4. Dev server: `npm run dev` (port 3001)

## Development

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm test           # Unit tests (vitest)
npm run test:e2e   # E2E tests (Playwright)
npm run lint       # ESLint
```

## Architecture

```
src/
├── components/    # Reusable UI components
├── pages/         # Page components (Home, NotFound)
├── services/      # API services (news, weather, wiki)
├── __tests__/     # Unit tests
└── App.tsx        # Root component with router
```

The 3D globe is provided by `@aeryflux/globe` (npm package). See its documentation for props and customization.

## Pull Requests

- One feature per PR
- Include tests for new functionality
- Make sure CI is green (typecheck + tests + build)
- Use clear commit messages: `feat:`, `fix:`, `docs:`, `test:`, `chore:`

## Reporting Bugs

Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser, OS, and viewport size (for responsive issues)
- Screenshots if visual
