import { useState, useEffect } from 'react';

export type SurfaceId = 'dark' | 'green' | 'light';

export interface ThemeColors {
  themeId: SurfaceId;
  globeFill: string;
  globeCountry: string;
  globeBorder: string;
  globeCity: string;
  titleAery: string;
  titleFlux: string;
  isLightTheme: boolean;
}

const DEFAULT_COLORS: ThemeColors = {
  themeId: 'dark',
  globeFill: '#0a0a0f',
  globeCountry: '#c0c0c0',
  globeBorder: '#ffffff',
  globeCity: '#ffffff',
  titleAery: '#ffffff',
  titleFlux: '#888899',
  isLightTheme: false,
};

/**
 * Hook to read CSS variable values for the current theme.
 * Updates when theme changes.
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_COLORS);

  useEffect(() => {
    const updateColors = () => {
      const style = getComputedStyle(document.documentElement);
      const themeId = (document.documentElement.getAttribute('data-theme') || 'dark') as SurfaceId;

      const globeFill = style.getPropertyValue('--globe-fill').trim();
      const globeCountry = style.getPropertyValue('--globe-country').trim();
      const globeBorder = style.getPropertyValue('--globe-border').trim();
      const globeCity = style.getPropertyValue('--globe-city').trim();
      const titleAery = style.getPropertyValue('--title-aery').trim();
      const titleFlux = style.getPropertyValue('--title-flux').trim();

      setColors({
        themeId,
        globeFill: globeFill || DEFAULT_COLORS.globeFill,
        globeCountry: globeCountry || DEFAULT_COLORS.globeCountry,
        globeBorder: globeBorder || DEFAULT_COLORS.globeBorder,
        globeCity: globeCity || DEFAULT_COLORS.globeCity,
        titleAery: titleAery || DEFAULT_COLORS.titleAery,
        titleFlux: titleFlux || DEFAULT_COLORS.titleFlux,
        isLightTheme: themeId === 'light',
      });
    };

    // Initial read with small delay to ensure CSS is loaded
    const timeoutId = setTimeout(updateColors, 100);
    updateColors(); // Also try immediately

    // Watch for theme changes via MutationObserver on data-theme attribute
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          // Small delay to let CSS variables update
          setTimeout(updateColors, 50);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return colors;
}

export default useThemeColors;
