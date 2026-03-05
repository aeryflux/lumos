import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Map existing CSS variables to Tailwind
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          secondary: 'var(--accent-secondary)',
          glow: 'var(--accent-glow)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          hover: 'var(--border-hover)',
          glow: 'var(--border-glow)',
        },
        mode: {
          music: 'var(--mode-music)',
          news: 'var(--mode-news)',
          weather: 'var(--mode-weather)',
          wiki: 'var(--mode-wiki)',
          challenge: 'var(--mode-challenge)',
        },
        status: {
          danger: 'var(--danger)',
          warning: 'var(--warning)',
          success: 'var(--success)',
        },
      },
      fontFamily: {
        display: ['HemiHead', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'monospace'],
      },
      borderRadius: {
        card: '20px',
        btn: '12px',
      },
      boxShadow: {
        'accent-glow': '0 4px 20px rgba(0, 255, 136, 0.3)',
        'accent-hover': '0 8px 30px rgba(0, 255, 136, 0.4)',
        'card': '0 10px 40px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 40px var(--accent-glow)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
