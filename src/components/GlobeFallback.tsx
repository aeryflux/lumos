/**
 * GlobeFallback - Static SVG fallback when WebGL is unavailable
 *
 * Displays a minimalist animated globe using CSS animations.
 * Used when WebGL context cannot be created (limit reached, unsupported, etc.)
 */

import type { CSSProperties } from 'react';

export interface GlobeFallbackProps {
  className?: string;
  style?: CSSProperties;
  borderColor?: string;
  showMessage?: boolean;
}

export function GlobeFallback({
  className,
  style,
  borderColor = '#00ff88',
  showMessage = false,
}: GlobeFallbackProps) {
  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        ...style,
      }}
    >
      {/* Animated SVG Globe */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          animation: 'globeFallbackPulse 4s ease-in-out infinite',
        }}
      >
        <svg
          viewBox="0 0 200 200"
          style={{
            width: '100%',
            height: '100%',
            filter: `drop-shadow(0 0 20px ${borderColor}40)`,
          }}
        >
          {/* Globe circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={borderColor}
            strokeWidth="1.5"
            opacity="0.6"
          />

          {/* Latitude lines */}
          <ellipse cx="100" cy="100" rx="80" ry="30" fill="none" stroke={borderColor} strokeWidth="0.8" opacity="0.4" />
          <ellipse cx="100" cy="100" rx="80" ry="55" fill="none" stroke={borderColor} strokeWidth="0.8" opacity="0.3" />
          <ellipse cx="100" cy="100" rx="80" ry="75" fill="none" stroke={borderColor} strokeWidth="0.8" opacity="0.2" />

          {/* Longitude lines (animated rotation effect) */}
          <g style={{ animation: 'globeFallbackRotate 20s linear infinite' }}>
            <ellipse cx="100" cy="100" rx="30" ry="80" fill="none" stroke={borderColor} strokeWidth="0.8" opacity="0.4" />
            <ellipse cx="100" cy="100" rx="55" ry="80" fill="none" stroke={borderColor} strokeWidth="0.8" opacity="0.3" />
            <ellipse cx="100" cy="100" rx="75" ry="80" fill="none" stroke={borderColor} strokeWidth="0.8" opacity="0.2" />
          </g>

          {/* Center dot */}
          <circle cx="100" cy="100" r="3" fill={borderColor} opacity="0.8" />

          {/* Accent arcs */}
          <path
            d="M 40 100 Q 100 60 160 100"
            fill="none"
            stroke={borderColor}
            strokeWidth="2"
            opacity="0.7"
            style={{ animation: 'globeFallbackArc 3s ease-in-out infinite' }}
          />
          <path
            d="M 60 140 Q 100 180 140 140"
            fill="none"
            stroke={borderColor}
            strokeWidth="1.5"
            opacity="0.5"
            style={{ animation: 'globeFallbackArc 3s ease-in-out infinite 0.5s' }}
          />
        </svg>

        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            inset: '10%',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${borderColor}15 0%, transparent 70%)`,
            animation: 'globeFallbackGlow 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Optional message */}
      {showMessage && (
        <p
          style={{
            marginTop: '24px',
            color: borderColor,
            opacity: 0.7,
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          3D globe temporarily unavailable
          <br />
          <span style={{ opacity: 0.5, fontSize: '12px' }}>
            Try closing other tabs with 3D content
          </span>
        </p>
      )}

      <style>{`
        @keyframes globeFallbackPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.9; }
        }
        @keyframes globeFallbackRotate {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
        @keyframes globeFallbackGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        @keyframes globeFallbackArc {
          0%, 100% { opacity: 0.7; stroke-dashoffset: 0; }
          50% { opacity: 1; stroke-dashoffset: 10; }
        }
      `}</style>
    </div>
  );
}

export default GlobeFallback;
