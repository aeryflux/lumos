/**
 * AppLogo - Logo d'application AeryFlux pour Vite/web (Lumos)
 *
 * Utilise Lucide icons avec les couleurs définies localement.
 */

import {
  Globe,
  Zap,
  Box,
  Sun,
  Lightbulb,
  Triangle,
  Hand,
  Rocket,
  Shield,
  Leaf,
  Palette,
  BookOpen,
  Circle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'

/** Types d'applications disponibles */
type AppId =
  | 'atlas'
  | 'aptx'
  | 'holocron'
  | 'lumos'
  | 'edison'
  | 'pythagoras'
  | 'haki'
  | 'spaceship'
  | 'splinter'
  | 'mokuton'
  | 'pikaso'
  | 'grimoire'
  | 'geosphere'

/** Configuration de couleur par app */
interface AppColorConfig {
  baseColor: string
  glowColor: string
  useDarkIcon?: boolean
}

/** Mapping des couleurs (sync avec Pikaso) */
const APP_COLORS: Record<AppId, AppColorConfig> = {
  atlas: { baseColor: '#6b7280', glowColor: '#9ca3af' },
  aptx: { baseColor: '#3b82f6', glowColor: '#60a5fa' },
  holocron: { baseColor: '#1f2937', glowColor: '#4b5563' },
  lumos: { baseColor: '#fef9c3', glowColor: '#fef9c3', useDarkIcon: true },
  edison: { baseColor: '#eab308', glowColor: '#fcd34d' },
  pythagoras: { baseColor: '#8b5cf6', glowColor: '#a78bfa' },
  haki: { baseColor: '#f97316', glowColor: '#fb923c' },
  spaceship: { baseColor: '#78350f', glowColor: '#a16207' },
  splinter: { baseColor: '#14532d', glowColor: '#22c55e' },
  mokuton: { baseColor: '#22c55e', glowColor: '#4ade80' },
  pikaso: { baseColor: '#ec4899', glowColor: '#f472b6' },
  grimoire: { baseColor: '#dc2626', glowColor: '#ef4444' },
  geosphere: { baseColor: '#06b6d4', glowColor: '#22d3ee' },
}

/** Mapping des icônes Lucide par app */
const APP_ICONS: Record<AppId, LucideIcon> = {
  atlas: Globe,
  aptx: Zap,
  holocron: Box,
  lumos: Sun,
  edison: Lightbulb,
  pythagoras: Triangle,
  haki: Hand,
  spaceship: Rocket,
  splinter: Shield,
  mokuton: Leaf,
  pikaso: Palette,
  grimoire: BookOpen,
  geosphere: Circle,
}

interface AppLogoProps {
  appId: string
  size?: number
  borderRadius?: number
  glow?: boolean
  onClick?: () => void
  className?: string
  style?: React.CSSProperties
}

export function AppLogo({
  appId,
  size = 32,
  borderRadius,
  glow = false,
  onClick,
  className = '',
  style = {},
}: AppLogoProps) {
  const normalizedId = appId.toLowerCase() as AppId
  const config = APP_COLORS[normalizedId] ?? { baseColor: '#888888', glowColor: '#aaaaaa' }
  const Icon = APP_ICONS[normalizedId] ?? HelpCircle
  const iconColor = config.useDarkIcon ? '#1f2937' : '#ffffff'
  const computedBorderRadius = borderRadius ?? Math.round(size / 4)
  const iconSize = Math.round(size * 0.55)

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: computedBorderRadius,
    backgroundColor: config.baseColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'transform 150ms ease, box-shadow 200ms ease',
    boxShadow: glow ? `0 0 ${size / 2}px ${config.glowColor}40` : 'none',
    flexShrink: 0,
    ...style,
  }

  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <div
      className={`app-logo ${className}`}
      style={containerStyle}
      onClick={handleClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      title={appId.charAt(0).toUpperCase() + appId.slice(1)}
    >
      <Icon size={iconSize} color={iconColor} strokeWidth={2} />
    </div>
  )
}

export default AppLogo
