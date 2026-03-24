/**
 * AnimatedSplash - Hexagonal fractal splash screen for web
 *
 * Web adaptation of Atlas AnimatedSplash using CSS animations.
 * Features breathing hexagons with wave effect and AeryFlux logo.
 */

import { useEffect, useState, useCallback } from 'react';
import { useThemeColors } from '../hooks/useThemeColors';
import './AnimatedSplash.css';

interface AnimatedSplashProps {
  isReady: boolean;
  onComplete: () => void;
  minDuration?: number;
}

// Hexagon layout constants
const HEX_SIZE = 28;
const INNER_RADIUS = 52;
const OUTER_RADIUS = 95;

// Calculate hexagon positions
const hexagonOffsets = [
  // Inner ring - 6 hexagons
  ...Array.from({ length: 6 }, (_, i) => ({
    x: Math.cos((i * 60 - 90) * Math.PI / 180) * INNER_RADIUS,
    y: Math.sin((i * 60 - 90) * Math.PI / 180) * INNER_RADIUS,
    size: HEX_SIZE,
    ring: 'inner' as const,
  })),
  // Outer ring - 6 hexagons, offset 30deg
  ...Array.from({ length: 6 }, (_, i) => ({
    x: Math.cos((i * 60 - 60) * Math.PI / 180) * OUTER_RADIUS,
    y: Math.sin((i * 60 - 60) * Math.PI / 180) * OUTER_RADIUS,
    size: HEX_SIZE * 0.75,
    ring: 'outer' as const,
  })),
];

export function AnimatedSplash({ isReady, onComplete, minDuration = 1200 }: AnimatedSplashProps) {
  const themeColors = useThemeColors();
  const [phase, setPhase] = useState<'enter' | 'breathing' | 'exit' | 'done'>('enter');
  const [startTime] = useState(() => Date.now());

  const handleExit = useCallback(() => {
    setPhase('exit');
    // Exit animation duration
    setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 300);
  }, [onComplete]);

  useEffect(() => {
    // Enter phase completes after 600ms
    const enterTimer = setTimeout(() => {
      setPhase('breathing');
    }, 600);

    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (phase === 'breathing' && isReady) {
      // Ensure minimum duration before exit
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDuration - elapsed);

      const exitTimer = setTimeout(handleExit, remaining);
      return () => clearTimeout(exitTimer);
    }
  }, [phase, isReady, startTime, minDuration, handleExit]);

  if (phase === 'done') return null;

  // Get hexagon SVG points
  const getHexPoints = (_size: number) => {
    return Array.from({ length: 6 }, (_, i) => {
      const angle = (i * 60 - 90) * Math.PI / 180;
      return `${50 + Math.cos(angle) * 45},${50 + Math.sin(angle) * 45}`;
    }).join(' ');
  };

  // Map theme colors to splash colors
  const splashBg = themeColors.globeFill || '#050508';
  const splashAccent = themeColors.globeBorder || '#00ff88';
  const splashText = themeColors.titleAery || '#ffffff';

  return (
    <div
      className={`splash splash--${phase}`}
      style={{
        '--splash-bg': splashBg,
        '--splash-accent': splashAccent,
        '--splash-text': splashText,
      } as React.CSSProperties}
    >
      {/* Hexagon layer */}
      <div className="splash-hex-layer">
        {hexagonOffsets.map((hex, i) => (
          <div
            key={i}
            className={`splash-hex splash-hex--${hex.ring}`}
            style={{
              '--hex-x': `${hex.x}px`,
              '--hex-y': `${hex.y}px`,
              '--hex-size': `${hex.size * 2}px`,
              '--hex-delay': `${(i % 6) * 0.1}s`,
              '--ring-delay': hex.ring === 'outer' ? '0.3s' : '0s',
            } as React.CSSProperties}
          >
            <svg viewBox="0 0 100 100" className="splash-hex-svg">
              <polygon
                points={getHexPoints(hex.size)}
                className="splash-hex-shape"
              />
            </svg>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AnimatedSplash;
