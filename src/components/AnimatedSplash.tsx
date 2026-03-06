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
  const getHexPoints = (size: number) => {
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

      {/* Logo layer */}
      <div className="splash-logo">
        <svg viewBox="0 0 1024 1024" className="splash-logo-svg">
          {/* Background circle */}
          <g transform="translate(0, 1024) scale(0.1, -0.1)">
            <path
              className="splash-logo-bg"
              d="M4615 7734 c-16 -2 -73 -9 -125 -15 -636 -71 -1217 -371 -1640 -849 -494 -557 -710 -1289 -595 -2015 115 -726 517 -1364 1115 -1770 333 -226 728 -379 1130 -436 168 -24 512 -24 680 0 402 57 797 210 1130 436 598 406 1000 1044 1115 1770 115 726 -101 1458 -595 2015 -423 478 -1004 778 -1640 849 -122 14 -514 25 -575 15z"
            />
          </g>
          {/* Sphere stripes */}
          <g transform="translate(0, 1024) scale(0.1, -0.1)" className="splash-logo-sphere">
            <path d="M4900 7729 c-307 -32 -692 -175 -905 -336 -120 -90 -334 -305 -423 -425 -185 -248 -315 -525 -383 -818 -33 -141 -33 -365 -1 -470 53 -167 138 -281 269 -359 349 -207 855 -114 1335 246 164 123 281 228 567 508 377 368 533 494 736 595 153 76 255 102 395 102 297 0 578 -164 796 -467 86 -119 188 -328 219 -447 14 -52 22 -73 19 -48 -16 129 -104 393 -189 568 -117 241 -242 418 -424 600 -451 453 -1024 631 -1571 491 -519 -134 -977 -546 -1271 -1144 -136 -278 -190 -476 -189 -700 0 -66 4 -138 9 -160 6 -22 9 -41 8 -42 -7 -6 -130 32 -184 58 -265 126 -319 401 -168 859 102 308 317 645 574 900 159 157 279 246 446 329 199 99 328 133 605 160 83 8 81 8 -55 8 -77 0 -174 -3 -215 -8z" />
            <path d="M6475 6255 c-78 -22 -187 -80 -277 -148 -46 -34 -238 -215 -428 -402 -354 -349 -440 -427 -640 -576 -464 -346 -984 -528 -1396 -489 -174 16 -385 81 -508 155 -192 116 -353 313 -419 515 -60 183 -71 408 -31 630 4 24 4 24 -5 3 -17 -37 -60 -272 -71 -382 -14 -143 -13 -262 4 -356 17 -95 23 -112 42 -119 8 -3 14 -10 14 -16 0 -22 169 -236 216 -275 27 -22 61 -52 76 -68 l26 -27 -29 76 c-16 42 -28 78 -26 80 1 2 16 -27 31 -64 172 -404 493 -667 916 -749 103 -20 324 -22 430 -4 130 22 339 80 450 126 353 144 659 339 1170 745 299 238 437 310 594 311 157 1 254 -74 318 -247 20 -52 22 -78 22 -234 0 -191 -12 -270 -75 -473 -143 -464 -468 -906 -850 -1157 -52 -34 -115 -73 -141 -86 -75 -38 -242 -102 -320 -123 -106 -28 -56 -25 74 4 593 134 1136 507 1468 1007 183 276 273 611 274 1013 1 334 -54 602 -174 850 -106 220 -238 373 -385 446 -82 41 -89 43 -193 45 -71 2 -124 -1 -157 -11z" />
            <path d="M6270 4409 c-19 -12 -66 -47 -105 -79 -355 -289 -789 -546 -1160 -688 -307 -117 -539 -164 -810 -164 -238 -1 -425 38 -614 128 -175 83 -302 179 -434 328 -38 43 -68 75 -66 70 14 -33 162 -237 223 -306 98 -111 265 -275 351 -343 181 -145 435 -290 648 -369 116 -43 285 -88 421 -111 114 -19 316 -34 310 -23 -3 5 28 8 68 8 46 0 81 5 93 14 11 7 45 21 75 31 142 45 357 168 510 292 171 138 380 381 488 569 91 158 172 387 172 488 0 62 -19 116 -50 148 -34 34 -72 36 -120 7z" />
          </g>
        </svg>
      </div>

      {/* Text */}
      <div className="splash-text">
        <span className="splash-title">LUMOS</span>
        <span className="splash-subtitle">by AeryFlux</span>
      </div>
    </div>
  );
}

export default AnimatedSplash;
