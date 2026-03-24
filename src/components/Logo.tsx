/**
 * Logo - AeryFlux brand logo from aery-assets
 *
 * Uses official brand logos with theme-aware variant selection.
 * Dark/green themes use bg_true (black bg), white theme uses bg_false.
 */

import { useThemeColors } from '../hooks/useThemeColors';
import './Logo.css';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  const { isLightTheme } = useThemeColors();
  const logoSrc = isLightTheme
    ? `${import.meta.env.BASE_URL}aeryflux_logo_light.png`
    : `${import.meta.env.BASE_URL}aeryflux_logo.png`;

  return (
    <img
      src={logoSrc}
      alt="AeryFlux"
      width={size}
      height={size}
      className={`aeryflux-logo ${className}`}
    />
  );
}

export default Logo;
