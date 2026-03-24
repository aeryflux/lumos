/**
 * Logo - AeryFlux brand logo from aery-assets (bg_false variant)
 */

import './Logo.css';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}aeryflux_logo.png`}
      alt="AeryFlux"
      width={size}
      height={size}
      className={`aeryflux-logo ${className}`}
    />
  );
}

export default Logo;
