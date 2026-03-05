/**
 * Logo - Themable AeryFlux Logo using CSS filters
 *
 * Uses the original PNG with CSS filters for theme adaptation.
 * The logo is black/white so we can use filters to colorize it.
 */

import './Logo.css';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}aeryflux.png`}
      alt="AeryFlux"
      width={size}
      height={size}
      className={`aeryflux-logo ${className}`}
    />
  );
}

export default Logo;
