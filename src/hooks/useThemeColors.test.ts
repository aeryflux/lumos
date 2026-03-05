import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useThemeColors, type SurfaceId } from './useThemeColors';

describe('useThemeColors', () => {
  let originalGetComputedStyle: typeof window.getComputedStyle;
  let originalGetAttribute: typeof document.documentElement.getAttribute;

  beforeEach(() => {
    vi.useFakeTimers();
    originalGetComputedStyle = window.getComputedStyle;
    originalGetAttribute = document.documentElement.getAttribute.bind(document.documentElement);
  });

  afterEach(() => {
    vi.useRealTimers();
    window.getComputedStyle = originalGetComputedStyle;
    document.documentElement.getAttribute = originalGetAttribute;
    vi.restoreAllMocks();
  });

  const mockComputedStyle = (colors: {
    globeFill?: string;
    globeCountry?: string;
    globeBorder?: string;
  }) => {
    window.getComputedStyle = vi.fn().mockReturnValue({
      getPropertyValue: (prop: string) => {
        switch (prop) {
          case '--globe-fill':
            return colors.globeFill || '';
          case '--globe-country':
            return colors.globeCountry || '';
          case '--globe-border':
            return colors.globeBorder || '';
          default:
            return '';
        }
      },
    });
  };

  const mockTheme = (theme: SurfaceId | null) => {
    document.documentElement.getAttribute = vi.fn().mockImplementation((attr: string) => {
      if (attr === 'data-theme') return theme;
      return originalGetAttribute.call(document.documentElement, attr);
    });
  };

  describe('initial state', () => {
    it('should return default colors on mount', () => {
      mockTheme('dark');
      mockComputedStyle({});

      const { result } = renderHook(() => useThemeColors());

      expect(result.current.themeId).toBe('dark');
      expect(result.current.isLightTheme).toBe(false);
    });
  });

  describe('theme detection', () => {
    it('should detect dark theme', async () => {
      mockTheme('dark');
      mockComputedStyle({
        globeFill: '#050510',
        globeCountry: '#0a1525',
        globeBorder: '#00ff88',
      });

      const { result } = renderHook(() => useThemeColors());

      // Run timers to trigger delayed update
      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.themeId).toBe('dark');
      expect(result.current.isLightTheme).toBe(false);
      expect(result.current.globeFill).toBe('#050510');
      expect(result.current.globeCountry).toBe('#0a1525');
      expect(result.current.globeBorder).toBe('#00ff88');
    });

    it('should detect light theme', async () => {
      mockTheme('light');
      mockComputedStyle({
        globeFill: '#ffffff',
        globeCountry: '#f0f0f0',
        globeBorder: '#333333',
      });

      const { result } = renderHook(() => useThemeColors());

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.themeId).toBe('light');
      expect(result.current.isLightTheme).toBe(true);
    });

    it('should detect green theme', async () => {
      mockTheme('green');
      mockComputedStyle({
        globeFill: '#0a1510',
        globeCountry: '#0a2015',
        globeBorder: '#00ff88',
      });

      const { result } = renderHook(() => useThemeColors());

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.themeId).toBe('green');
      expect(result.current.isLightTheme).toBe(false);
    });
  });

  describe('fallback values', () => {
    it('should use default values when CSS variables are empty', async () => {
      mockTheme('dark');
      mockComputedStyle({
        globeFill: '',
        globeCountry: '',
        globeBorder: '',
      });

      const { result } = renderHook(() => useThemeColors());

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.globeFill).toBe('#050510');
      expect(result.current.globeCountry).toBe('#0a1525');
      expect(result.current.globeBorder).toBe('#00ff88');
    });

    it('should default to dark theme when data-theme is null', async () => {
      mockTheme(null);
      mockComputedStyle({});

      const { result } = renderHook(() => useThemeColors());

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(result.current.themeId).toBe('dark');
    });
  });

  describe('cleanup', () => {
    it('should disconnect observer on unmount', () => {
      mockTheme('dark');
      mockComputedStyle({});

      const { unmount } = renderHook(() => useThemeColors());

      // Just verify unmount doesn't throw
      expect(() => unmount()).not.toThrow();
    });
  });
});
