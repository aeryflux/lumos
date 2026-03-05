import './HexLoader.css';

interface HexLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export function HexLoader({ size = 'md', color, className = '' }: HexLoaderProps) {
  const sizeClass = `hex-loader--${size}`;

  return (
    <div
      className={`hex-loader ${sizeClass} ${className}`}
      style={color ? { '--hex-color': color } as React.CSSProperties : undefined}
    >
      <div className="hex-grid">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="hex-cell" style={{ '--delay': i } as React.CSSProperties}>
            <svg viewBox="0 0 100 115" className="hex-svg">
              <polygon
                points="50 0, 100 28.75, 100 86.25, 50 115, 0 86.25, 0 28.75"
                className="hex-shape"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HexLoader;
