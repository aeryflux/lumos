# Lumos Design System

This document outlines the design patterns, components, and utilities used in the Lumos landing page.

## Design Tokens

All design tokens are defined in `index.css` and can be used throughout the application.

### Animation Durations

```css
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 800ms;
```

### Easing Functions

```css
--ease-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Spacing Scale

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;
```

### Shadows

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.15);
--shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.2);
--shadow-glow: 0 0 20px var(--accent-glow);
```

### Frosted Glass

```css
--glass-bg: rgba(15, 15, 25, 0.6);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur: 12px;
```

## Utility Classes

### Animation Utilities

#### `.animate-in`
Applies a fadeInUp animation on page load with staggered delays.

```tsx
<div className="animate-in animate-delay-1">First item</div>
<div className="animate-in animate-delay-2">Second item</div>
<div className="animate-in animate-delay-3">Third item</div>
```

Available delay classes: `animate-delay-1` through `animate-delay-6` (100ms increments).

#### `.hover-lift`
Applies a subtle lift effect on hover.

```tsx
<div className="card hover-lift">Card content</div>
```

### Glass Morphism

#### `.glass`
Applies frosted glass effect with backdrop blur.

```tsx
<div className="feature-card glass">
  Card with frosted glass background
</div>
```

#### `.glass-strong`
Stronger blur effect for more prominent glass effect.

```tsx
<nav className="glass-strong">Navigation</nav>
```

### Accessibility

#### `.sr-only`
Screen reader only content - visually hidden but accessible.

```tsx
<button>
  <Icon />
  <span className="sr-only">Accessible label</span>
</button>
```

## Components

### ScrollAnimate

Scroll-triggered animation component using Intersection Observer.

```tsx
import { ScrollAnimate } from '../components/ScrollAnimate';

// Basic usage
<ScrollAnimate>
  <YourContent />
</ScrollAnimate>

// With variant
<ScrollAnimate variant="scale">
  <YourContent />
</ScrollAnimate>

// With stagger delay
<ScrollAnimate stagger={1}>
  <Card />
</ScrollAnimate>
<ScrollAnimate stagger={2}>
  <Card />
</ScrollAnimate>
```

**Props:**
- `variant`: Animation type - `'default'` | `'fade'` | `'scale'` | `'left'` | `'right'`
- `threshold`: Intersection threshold (0-1). Default `0.1`
- `rootMargin`: Trigger offset. Default `'-50px'`
- `stagger`: Delay index (1-6) for staggered animations
- `className`: Additional CSS classes
- `as`: HTML tag to render. Default `'div'`

### StarryBackground

Interactive starfield background with CSS patterns and effects.

```tsx
import { StarryBackground } from '../components/StarryBackground';

<StarryBackground
  variant="cosmic"
  opacity={0.4}
  twinkle
  scrollReactive
  effect={effect}
  effectColor={effectColor}
/>
```

**Variants:**
- `dots`: Small subtle dots
- `grid`: Subtle grid lines
- `stars`: Larger, more visible dots
- `cosmic`: OpenClaw-inspired positioned dots with twinkle

## Accessibility

### Reduced Motion Support

All animations respect `prefers-reduced-motion`. Users with motion sensitivity will see static content without animations.

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

## Themes

Three themes are available, controlled via `data-theme` attribute:

- **dark**: Default dark theme with white accents
- **green**: Cyberpunk-inspired green (#00ff88) theme
- **light**: Light mode with dark accents

Theme switching is handled by `ThemeSwitcher` component and persisted in localStorage.

## Hooks

### useScrollAnimation

Hook for custom scroll-triggered animations.

```tsx
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function MyComponent() {
  const { ref, isVisible, hasAnimated } = useScrollAnimation({
    threshold: 0.2,
    rootMargin: '-100px',
    once: true,
  });

  return (
    <div ref={ref} className={isVisible ? 'visible' : ''}>
      Content
    </div>
  );
}
```

### useThemeColors

Hook to access current theme colors programmatically.

```tsx
import { useThemeColors } from '../hooks/useThemeColors';

function MyComponent() {
  const { globeFill, globeBorder, isLightTheme } = useThemeColors();

  return <Globe fillColor={globeFill} />;
}
```

## File Structure

```
src/
├── components/
│   ├── ScrollAnimate.tsx     # Scroll-triggered animations
│   ├── StarryBackground.tsx  # Interactive starfield
│   └── StarryBackground.css
├── hooks/
│   ├── useScrollAnimation.ts # Scroll animation hook
│   └── useThemeColors.ts     # Theme colors hook
├── contexts/
│   └── EffectsContext.tsx    # Global effects state
├── index.css                 # Design tokens & utilities
└── pages/
    ├── Home.tsx              # Landing page
    └── Home.css              # Landing page styles
```
