/**
 * StarryBackground - Interactive starfield with effect triggers
 *
 * Features:
 * - CSS-only dot/grid patterns (dots, grid, stars, cosmic)
 * - Effect triggers: pulse, ripple, burst, shift
 * - Scroll-reactive animations
 * - Mode change transitions
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import './StarryBackground.css';

// Effect types that can be triggered
export type StarryEffect = 'pulse' | 'ripple' | 'burst' | 'shift' | 'laser-scan' | 'none';

interface StarryBackgroundProps {
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
  effect?: StarryEffect;
  /** Effect color (for colored effects) */
  effectColor?: string;
  /** Callback when effect animation completes */
  onEffectComplete?: () => void;
  /** Enable scroll-reactive effects */
  scrollReactive?: boolean;
  /** Children to render on top */
  children?: React.ReactNode;
}

export function StarryBackground({
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
}: StarryBackgroundProps) {
  const [activeEffect, setActiveEffect] = useState<StarryEffect>('none');
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

  const patternClass = `starry-bg starry-bg--${variant}`;
  const fadeClass = fade === true ? 'starry-bg--fade' : fade === 'wide' ? 'starry-bg--fade-wide' : '';
  const twinkleClass = twinkle && variant === 'cosmic' ? 'starry-bg--twinkle' : '';
  const effectClass = activeEffect !== 'none' ? `starry-bg--effect-${activeEffect}` : '';
  const scrollClass = scrollReactive ? 'starry-bg--scroll-reactive' : '';

  return (
    <div
      className={`${patternClass} ${fadeClass} ${twinkleClass} ${effectClass} ${scrollClass} ${className}`}
      style={{
        '--starry-size': `${size}px`,
        '--starry-opacity': opacity,
        '--starry-effect-color': effectColor || 'var(--accent, #00ff88)',
        '--starry-scroll-progress': scrollProgress,
      } as React.CSSProperties}
    >
      {/* Effect overlay layers */}
      <div className="starry-effect-layer starry-effect-layer--1" />
      <div className="starry-effect-layer starry-effect-layer--2" />
      {children}
    </div>
  );
}

// Hook to trigger effects from anywhere in the app
export function useStarryEffects() {
  const [effect, setEffect] = useState<StarryEffect>('none');
  const [effectColor, setEffectColor] = useState<string | undefined>();

  const triggerEffect = useCallback((type: StarryEffect, color?: string) => {
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

export default StarryBackground;
