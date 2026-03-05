/**
 * EffectsContext - Global effect trigger system
 *
 * Provides a way to trigger background effects from anywhere in the app.
 * Effects include: pulse, ripple, burst, shift, laser-scan
 *
 * Usage:
 * - Wrap app with <EffectsProvider>
 * - Use useEffects() hook to trigger effects
 * - GridBackground consumes this context automatically
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GridEffect } from '../components/GridBackground';

// Mode colors for effect theming
export const MODE_COLORS = {
  news: '#ef4444',
  music: '#8b5cf6',
  weather: '#3b82f6',
  wiki: '#888888',
  challenge: '#f59e0b',
  default: '#00ff88',
} as const;

export type ModeId = keyof typeof MODE_COLORS;

interface EffectsContextValue {
  // Current effect state
  effect: GridEffect;
  effectColor: string | undefined;

  // Trigger an effect
  triggerEffect: (type: GridEffect, color?: string) => void;

  // Trigger effect based on mode (uses mode color)
  triggerModeEffect: (mode: ModeId, effectType?: GridEffect) => void;

  // Clear current effect
  clearEffect: () => void;

  // Scroll progress (0-1)
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
}

const EffectsContext = createContext<EffectsContextValue | null>(null);

interface EffectsProviderProps {
  children: ReactNode;
}

export function EffectsProvider({ children }: EffectsProviderProps) {
  const [effect, setEffect] = useState<GridEffect>('none');
  const [effectColor, setEffectColor] = useState<string | undefined>();
  const [scrollProgress, setScrollProgress] = useState(0);

  const triggerEffect = useCallback((type: GridEffect, color?: string) => {
    setEffectColor(color);
    setEffect(type);

    // Auto-clear after animation (matches 1.5s CSS animation + buffer)
    setTimeout(() => {
      setEffect('none');
    }, 1700);
  }, []);

  const triggerModeEffect = useCallback((mode: ModeId, effectType: GridEffect = 'pulse') => {
    const color = MODE_COLORS[mode] || MODE_COLORS.default;
    triggerEffect(effectType, color);
  }, [triggerEffect]);

  const clearEffect = useCallback(() => {
    setEffect('none');
  }, []);

  return (
    <EffectsContext.Provider
      value={{
        effect,
        effectColor,
        triggerEffect,
        triggerModeEffect,
        clearEffect,
        scrollProgress,
        setScrollProgress,
      }}
    >
      {children}
    </EffectsContext.Provider>
  );
}

export function useEffects() {
  const context = useContext(EffectsContext);
  if (!context) {
    throw new Error('useEffects must be used within an EffectsProvider');
  }
  return context;
}

// Optional hook that doesn't throw if outside provider
export function useEffectsOptional() {
  return useContext(EffectsContext);
}

export default EffectsContext;
