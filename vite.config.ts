import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Default port for Lumos (Alpha 0.1)
const DEFAULT_PORT = 3001;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, './', '');

  // Railway-friendly: process.env.PORT takes priority
  const PORT = parseInt(
    process.env.PORT ||           // Railway/PaaS deployment
    env.PORT_LUMOS ||             // Explicit override
    env.VITE_PORT ||              // Legacy Vite var
    String(DEFAULT_PORT),
    10
  );

  // For custom domain (aeryflux.com), base should be '/'
  // Only use '/lumos/' for github.io subdirectory deployment
  const isGitHubPages = process.env.GITHUB_PAGES === 'true';
  const base = isGitHubPages ? '/lumos/' : '/';

  return {
    plugins: [react()],
    base,
    server: {
      port: PORT,
      host: true,
    },
    preview: {
      port: PORT,
      host: true,
    },
    build: {
      outDir: 'dist',
    },
  };
})
