/**
 * Documentation Content
 *
 * Central documentation for the AeryFlux ecosystem.
 * Lumos is the single source of truth for all docs.
 */

export interface DocArticle {
  slug: string;
  title: string;
  description?: string;
  category: string;
  content: string;
}

export interface DocCategory {
  title: string;
  articles: DocArticle[];
}

export const docContent: Record<string, DocCategory> = {
  'getting-started': {
    title: 'Getting Started',
    articles: [
      {
        slug: 'introduction',
        title: 'Introduction',
        description: 'Welcome to AeryFlux — explore the world in 3D',
        category: 'Getting Started',
        content: `
          <h2>What is AeryFlux?</h2>
          <p>AeryFlux is an interactive 3D globe platform for exploring global data through music, news, weather, and knowledge. Built with a hexagonal Goldberg polyhedron visualization.</p>

          <h3>Key Features</h3>
          <ul>
            <li><strong>Interactive 3D Globe</strong> — Hexagonal cells on a Goldberg polyhedron with country borders</li>
            <li><strong>Music Mode</strong> — SoundCloud integration with DanceDirector choreography</li>
            <li><strong>News, Weather, Wiki</strong> — Real-time global data visualization</li>
            <li><strong>Studio Recording</strong> — Export cinematic .mp4 videos (Android + Web)</li>
            <li><strong>Cross-platform</strong> — Web, Android (Expo Go), iOS</li>
          </ul>

          <h3>Open-Core Architecture</h3>
          <table>
            <thead>
              <tr><th>Project</th><th>Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>Lumos</strong></td><td>Open source</td><td>Landing page + documentation (this site)</td></tr>
              <tr><td><strong>@aeryflux/globe</strong></td><td>Open source</td><td>3D Globe React/React Native component (npm)</td></tr>
              <tr><td><strong>Haki</strong></td><td>Open source</td><td>Learn-to-code platform</td></tr>
              <tr><td><strong>Atlas</strong></td><td>Private</td><td>Mobile app (Expo) — all modes + SoundCloud + recording</td></tr>
              <tr><td><strong>Pythagoras</strong></td><td>Private</td><td>API server — data aggregation, SoundCloud proxy, ffmpeg encoding</td></tr>
              <tr><td><strong>Holocron</strong></td><td>Private</td><td>Admin dashboard — waitlist, analytics, user management</td></tr>
            </tbody>
          </table>

          <h3>Links</h3>
          <ul>
            <li><a href="https://aeryflux.com" target="_blank">aeryflux.com</a> — Landing page</li>
            <li><a href="https://atlas.aeryflux.com" target="_blank">atlas.aeryflux.com</a> — Web app</li>
            <li><a href="https://www.npmjs.com/package/@aeryflux/globe" target="_blank">npm: @aeryflux/globe</a></li>
            <li><a href="https://github.com/aeryflux" target="_blank">GitHub: @aeryflux</a></li>
          </ul>
        `,
      },
    ],
  },
  'atlas': {
    title: 'Atlas',
    articles: [
      {
        slug: 'atlas',
        title: 'Overview',
        description: 'Atlas mobile and web app',
        category: 'Atlas',
        content: `
          <h2>Atlas</h2>
          <p>Atlas is the main AeryFlux application — a cross-platform 3D globe explorer built with Expo (React Native) and Three.js.</p>

          <h3>Modes</h3>
          <table>
            <thead><tr><th>Mode</th><th>Color</th><th>Data Source</th></tr></thead>
            <tbody>
              <tr><td><strong>Music</strong></td><td style="color: #ff6a00;">Orange</td><td>SoundCloud (OAuth proxy via Pythagoras)</td></tr>
              <tr><td><strong>News</strong></td><td style="color: #ef4444;">Red</td><td>RSS feeds aggregated by Pythagoras</td></tr>
              <tr><td><strong>Weather</strong></td><td style="color: #3b82f6;">Blue</td><td>OpenWeather API</td></tr>
              <tr><td><strong>Wiki</strong></td><td style="color: #888888;">Gray</td><td>Wikipedia API</td></tr>
            </tbody>
          </table>

          <h3>Music + DanceDirector</h3>
          <p>When music plays, the DanceDirector automatically choreographs the globe:</p>
          <ul>
            <li><strong>Hola</strong> — Directional wave sweep across countries</li>
            <li><strong>Pulse</strong> — All countries pulse in sync with the beat</li>
            <li><strong>Scatter</strong> — Random country groups light up in bursts</li>
            <li><strong>Breathe</strong> — Slow, full-globe expansion/contraction</li>
          </ul>
          <p>Audio simulation uses BPM-synced sine waves with genre-specific intensity profiles (20+ genres). Studio recording mode forces high-energy sequences with progressive intensity curves.</p>

          <h3>Studio Recording</h3>
          <p>Record cinematic globe videos directly from the app:</p>
          <ul>
            <li><strong>Web</strong> — Canvas MediaRecorder captures .webm with audio</li>
            <li><strong>Android</strong> — GLView frame capture at 12fps, uploaded to Pythagoras for ffmpeg encoding → .mp4 with audio + branded outro (logo, title, URLs)</li>
          </ul>

          <h3>Globe Models</h3>
          <table>
            <thead><tr><th>Platform</th><th>Model</th><th>Cells</th><th>Optimization</th></tr></thead>
            <tbody>
              <tr><td>Mobile</td><td>atlas_hex_subdiv_55</td><td>2,562</td><td>-7.3% vertices, no closing faces</td></tr>
              <tr><td>Web</td><td>atlas_hex_subdiv_66</td><td>10,242</td><td>-3% faces, no closing faces</td></tr>
            </tbody>
          </table>
        `,
      },
    ],
  },
  'globe': {
    title: 'Globe Component',
    articles: [
      {
        slug: 'globe',
        title: 'Overview',
        description: 'The @aeryflux/globe npm package',
        category: 'Globe Component',
        content: `
          <h2>@aeryflux/globe</h2>
          <p>A React/React Native component for rendering interactive 3D globes with data visualization. MIT licensed.</p>

          <h3>Installation</h3>
          <pre><code>npm install @aeryflux/globe three @types/three</code></pre>

          <h3>Basic Usage</h3>
          <pre><code>import { Globe } from '@aeryflux/globe/react';

function App() {
  return (
    &lt;Globe
      surface="green"
      countryData={{
        france: { scale: 0.8, color: '#00ff88' },
        germany: { scale: 0.6, color: '#00d4ff' }
      }}
    /&gt;
  );
}</code></pre>

          <h3>Exports</h3>
          <table>
            <thead><tr><th>Import</th><th>Usage</th></tr></thead>
            <tbody>
              <tr><td><code>@aeryflux/globe</code></td><td>Core utilities (buildGlobeIndex, materials, animations)</td></tr>
              <tr><td><code>@aeryflux/globe/react</code></td><td>React web component (Globe, GlobeDevTools)</td></tr>
              <tr><td><code>@aeryflux/globe/react-native</code></td><td>React Native component (Expo compatible)</td></tr>
              <tr><td><code>@aeryflux/globe/models/*</code></td><td>Pre-built GLB model files</td></tr>
            </tbody>
          </table>

          <h3>Globe Models</h3>
          <table>
            <thead><tr><th>Model</th><th>Cells</th><th>Size</th><th>Use Case</th></tr></thead>
            <tbody>
              <tr><td>atlas_hex_subdiv_5.glb</td><td>2,562</td><td>2.5 MB</td><td>Mobile</td></tr>
              <tr><td>atlas_hex_subdiv_6.glb</td><td>10,242</td><td>5.7 MB</td><td>Desktop</td></tr>
              <tr><td>atlas_hex_subdiv_7.glb</td><td>40,962</td><td>20 MB</td><td>High-detail / CDN</td></tr>
            </tbody>
          </table>

          <h3>Props Reference</h3>
          <table>
            <thead><tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td><code>modelUrl</code></td><td>string</td><td>bundled</td><td>URL to GLB model file</td></tr>
              <tr><td><code>surface</code></td><td>'dark' | 'green' | 'white'</td><td>'dark'</td><td>Color theme</td></tr>
              <tr><td><code>rotationSpeed</code></td><td>number</td><td>0.0003</td><td>Auto-rotation speed</td></tr>
              <tr><td><code>enableControls</code></td><td>boolean</td><td>false</td><td>Enable drag rotation</td></tr>
              <tr><td><code>countryData</code></td><td>Record&lt;string, CountryHighlight&gt;</td><td>{}</td><td>Country highlight data</td></tr>
              <tr><td><code>bloomStrength</code></td><td>number</td><td>1.0</td><td>Post-processing bloom</td></tr>
              <tr><td><code>showCountries</code></td><td>boolean</td><td>false</td><td>Show country fills</td></tr>
            </tbody>
          </table>

          <h3>Performance Tips</h3>
          <ul>
            <li>Use <code>subdiv_5</code> for mobile (2,562 cells)</li>
            <li>Use <code>subdiv_6</code> for desktop (10,242 cells)</li>
            <li>Memoize <code>countryData</code> to prevent re-renders</li>
            <li>Set <code>bloomStrength={0}</code> on low-end devices</li>
          </ul>
        `,
      },
    ],
  },
  'architecture': {
    title: 'Architecture',
    articles: [
      {
        slug: 'architecture',
        title: 'Open-Core Architecture',
        description: 'How the AeryFlux ecosystem is structured',
        category: 'Architecture',
        content: `
          <h2>Open-Core Architecture</h2>
          <p>AeryFlux follows an open-core model: the globe visualization and landing page are open source, while the full application stack is private.</p>

          <h3>Repository Structure</h3>
          <pre><code>aeryflux-core/          # Private monorepo
  apps/
    atlas/              # Mobile app (Expo + Three.js)
    pythagoras/          # API server (Express + PostgreSQL)
    holocron/            # Admin dashboard
  packages/
    globe/               # Shared globe utilities (internal)

globe/                   # Open source npm package (@aeryflux/globe)
lumos/                   # Open source landing page
haki/                    # Open source learn-to-code
globe-demo/              # Open source globe showcase</code></pre>

          <h3>Data Flow</h3>
          <pre><code>SoundCloud API ──┐
OpenWeather API ─┤
RSS Feeds ───────┤──▶ Pythagoras (API) ──▶ Atlas (App)
Wikipedia API ───┤                         ├── Web (atlas.aeryflux.com)
                 │                         ├── Android (Expo Go / EAS)
                 │                         └── iOS (Expo Go / EAS)
                 │
                 └──▶ Holocron (Admin) ──▶ Waitlist, Analytics</code></pre>

          <h3>Globe Model Pipeline</h3>
          <pre><code>GeoJSON (Natural Earth)
    │
    ▼
geojsonto3D (Blender Python)
    │  └── ICO mode: triangular icosphere
    │  └── HEX mode: Goldberg polyhedron dual
    ▼
GLB Models (.glb)
    │  └── atlas_hex_subdiv_5  (mobile, 2.5K cells)
    │  └── atlas_hex_subdiv_6  (desktop, 10K cells)
    │  └── atlas_hex_subdiv_7  (ultra, 40K cells)
    ▼
@aeryflux/globe (npm)   ──▶  Lumos, Globe-Demo
Atlas local assets       ──▶  Atlas (optimized lite models)</code></pre>

          <h3>Studio Recording Pipeline</h3>
          <pre><code>Atlas (Mobile)                 Pythagoras (Server)
─────────────────               ──────────────────
1. Tap record
2. Music + orbit + dance
3. GLView.takeSnapshotAsync ──▶ POST /api/studio/encode
   (12fps JPEG frames)          4. Download audio (SoundCloud)
                                5. ffmpeg: frames + audio + title → .mp4
                           ◀──  6. GET /api/studio/download/:id
7. Share .mp4 via browser</code></pre>

          <h3>CLI</h3>
          <pre><code># aery CLI (PowerShell)
aery launch core        # Start full open-core stack
aery launch dashboard   # Atlas + Pythagoras (dev)
aery ps                 # List running processes
aery status             # System health check
aery-gh status          # Git status across all repos
aery-gh sync            # Pull all repos</code></pre>
        `,
      },
    ],
  },
  'design': {
    title: 'Design System',
    articles: [
      {
        slug: 'design',
        title: 'Design System',
        description: 'Colors, typography, and visual guidelines',
        category: 'Design System',
        content: `
          <h2>Design System</h2>

          <h3>Brand Colors</h3>
          <table>
            <thead><tr><th>Name</th><th>Hex</th><th>Usage</th></tr></thead>
            <tbody>
              <tr><td>Primary Green</td><td><code>#00ff88</code></td><td>Accent, highlights, CTAs</td></tr>
              <tr><td>Orange</td><td><code>#ff6a00</code></td><td>Music mode, AeryFlux brand</td></tr>
              <tr><td>Cyan</td><td><code>#00d4ff</code></td><td>Secondary accent, links</td></tr>
              <tr><td>Background</td><td><code>#050508</code></td><td>Main background</td></tr>
            </tbody>
          </table>

          <h3>Mode Colors</h3>
          <table>
            <thead><tr><th>Mode</th><th>Hex</th></tr></thead>
            <tbody>
              <tr><td>Music</td><td><code>#ff6a00</code></td></tr>
              <tr><td>News</td><td><code>#ef4444</code></td></tr>
              <tr><td>Weather</td><td><code>#3b82f6</code></td></tr>
              <tr><td>Wiki</td><td><code>#888888</code></td></tr>
            </tbody>
          </table>

          <h3>Typography</h3>
          <table>
            <thead><tr><th>Element</th><th>Font</th><th>Weight</th></tr></thead>
            <tbody>
              <tr><td>Headings</td><td>HemiHead</td><td>Bold</td></tr>
              <tr><td>Body</td><td>Inter</td><td>Regular</td></tr>
              <tr><td>Code</td><td>JetBrains Mono</td><td>Regular</td></tr>
            </tbody>
          </table>

          <h3>Globe Themes</h3>
          <table>
            <thead><tr><th>Theme</th><th>Accent</th><th>Background</th></tr></thead>
            <tbody>
              <tr><td>dark</td><td>#ffffff</td><td>#050508</td></tr>
              <tr><td>green</td><td>#00ff88</td><td>#050508</td></tr>
              <tr><td>white</td><td>#1a1a2e</td><td>#f5f5f0</td></tr>
            </tbody>
          </table>
        `,
      },
    ],
  },
};
