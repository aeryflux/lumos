/**
 * GridBackground - Interactive grid background with effect triggers
 *
 * Features:
 * - CSS-only patterns (dots, grid, stars, cosmic)
 * - Effect triggers: pulse, ripple, burst, shift, laser-scan
 * - Scroll-reactive animations
 * - Mode change transitions
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import './GridBackground.css';

// Effect types that can be triggered
export type GridEffect = 'pulse' | 'ripple' | 'burst' | 'shift' | 'laser-scan' | 'none';

interface GridBackgroundProps {
  /** Pattern variant */
  variant?: 'dots' | 'grid' | 'stars' | 'cosmic';
  /** Pattern size in pixels (not used for cosmic variant) */
  size?: number;
  /** Pattern opacity (0-1) */
  opacity?: number;
  /** Additional className */
  className?: string;
  /** Use radial fade mask */
  fade?: boolean | 'wide';
  /** Enable twinkling animation (cosmic variant only) */
  twinkle?: boolean;
  /** Active effect (triggered externally) */
  effect?: GridEffect;
  /** Effect color (for colored effects) */
  effectColor?: string;
  /** Callback when effect animation completes */
  onEffectComplete?: () => void;
  /** Enable scroll-reactive effects */
  scrollReactive?: boolean;
  /** Children to render on top */
  children?: React.ReactNode;
}

export function GridBackground({
  variant = 'dots',
  size = 20,
  opacity = 0.15,
  className = '',
  fade = true,
  twinkle = false,
  effect = 'none',
  effectColor,
  onEffectComplete,
  scrollReactive = false,
  children,
}: GridBackgroundProps) {
  const [activeEffect, setActiveEffect] = useState<GridEffect>('none');
  const [scrollProgress, setScrollProgress] = useState(0);
  const effectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle external effect triggers
  useEffect(() => {
    if (effect !== 'none') {
      setActiveEffect(effect);

      // Clear previous timeout
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }

      // Auto-clear effect after animation
      effectTimeoutRef.current = setTimeout(() => {
        setActiveEffect('none');
        onEffectComplete?.();
      }, 1000); // Effect duration
    }

    return () => {
      if (effectTimeoutRef.current) {
        clearTimeout(effectTimeoutRef.current);
      }
    };
  }, [effect, onEffectComplete]);

  // Scroll-reactive behavior
  useEffect(() => {
    if (!scrollReactive) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollY / docHeight, 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollReactive]);

  const patternClass = `grid-bg grid-bg--${variant}`;
  const fadeClass = fade === true ? 'grid-bg--fade' : fade === 'wide' ? 'grid-bg--fade-wide' : '';
  const twinkleClass = twinkle && variant === 'cosmic' ? 'grid-bg--twinkle' : '';
  const effectClass = activeEffect !== 'none' ? `grid-bg--effect-${activeEffect}` : '';
  const scrollClass = scrollReactive ? 'grid-bg--scroll-reactive' : '';

  return (
    <div
      className={`${patternClass} ${fadeClass} ${twinkleClass} ${effectClass} ${scrollClass} ${className}`}
      style={{
        '--grid-size': `${size}px`,
        '--grid-opacity': opacity,
        '--grid-effect-color': effectColor || 'var(--accent, #00ff88)',
        '--grid-scroll-progress': scrollProgress,
      } as React.CSSProperties}
    >
      {/* Effect overlay layers */}
      <div className="grid-effect-layer grid-effect-layer--1" />
      <div className="grid-effect-layer grid-effect-layer--2" />
      {children}
    </div>
  );
}

// Hook to trigger effects from anywhere in the app
export function useGridEffects() {
  const [effect, setEffect] = useState<GridEffect>('none');
  const [effectColor, setEffectColor] = useState<string | undefined>();

  const triggerEffect = useCallback((type: GridEffect, color?: string) => {
    setEffectColor(color);
    setEffect(type);
  }, []);

  const clearEffect = useCallback(() => {
    setEffect('none');
  }, []);

  return {
    effect,
    effectColor,
    triggerEffect,
    clearEffect,
  };
}

export default GridBackground;
