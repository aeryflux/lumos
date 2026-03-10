/**
 * Documentation Content
 *
 * Static documentation content for Lumos.
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
        description: 'Welcome to AeryFlux - explore the world in 3D',
        category: 'Getting Started',
        content: `
          <h2>What is AeryFlux?</h2>
          <p>AeryFlux is an interactive 3D globe platform for exploring global data. Search for news, weather, economy, sports, and wiki information from around the world with a beautiful hexagonal globe visualization.</p>

          <h3>Key Features</h3>
          <ul>
            <li><strong>Interactive 3D Globe</strong> - 422 countries and 200 cities on a Goldberg polyhedron</li>
            <li><strong>Multiple Modes</strong> - News, Weather, Economy, Sports, Wiki</li>
            <li><strong>Real-time Data</strong> - Live updates from global sources</li>
            <li><strong>Multi-language</strong> - Available in English, French, Spanish, German</li>
          </ul>

          <h3>Open Source</h3>
          <p>AeryFlux is built with open source technologies:</p>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Description</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Lumos</strong></td>
                <td>Landing page (this site)</td>
                <td><a href="https://github.com/aeryflux/lumos" target="_blank">GitHub</a></td>
              </tr>
              <tr>
                <td><strong>@aeryflux/globe</strong></td>
                <td>3D Globe React component</td>
                <td><a href="https://www.npmjs.com/package/@aeryflux/globe" target="_blank">npm</a></td>
              </tr>
              <tr>
                <td><strong>Haki</strong></td>
                <td>Learn-to-code platform</td>
                <td><a href="https://github.com/aeryflux/haki" target="_blank">GitHub</a></td>
              </tr>
            </tbody>
          </table>

          <h3>Getting Help</h3>
          <ul>
            <li>Check the <a href="/docs/globe">Globe Documentation</a></li>
            <li>Report issues on <a href="https://github.com/aeryflux/lumos/issues" target="_blank">GitHub</a></li>
          </ul>
        `,
      },
      {
        slug: 'quickstart',
        title: 'Quick Start',
        description: 'Get up and running with AeryFlux in minutes',
        category: 'Getting Started',
        content: `
          <h2>Quick Start Guide</h2>
          <p>Try AeryFlux right now on this page!</p>

          <h3>Using the Search</h3>
          <p>The SmartInput at the top of the page lets you explore:</p>
          <ol>
            <li>Click the mode icon to switch between News, Weather, Economy, Sports, or Wiki</li>
            <li>Type your query (e.g., "weather in Paris" or "news about Tokyo")</li>
            <li>Watch the globe highlight relevant countries and cities</li>
            <li>View results in the panel below</li>
          </ol>

          <h3>Search Modes</h3>
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Color</th>
                <th>Example Query</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>News</strong></td>
                <td style="color: #ef4444;">Red</td>
                <td>"news france" or "latest world news"</td>
              </tr>
              <tr>
                <td><strong>Weather</strong></td>
                <td style="color: #3b82f6;">Blue</td>
                <td>"weather tokyo" or "global weather"</td>
              </tr>
              <tr>
                <td><strong>Economy</strong></td>
                <td style="color: #10b981;">Green</td>
                <td>"economy germany" or "market news"</td>
              </tr>
              <tr>
                <td><strong>Sports</strong></td>
                <td style="color: #f59e0b;">Orange</td>
                <td>"sports uk" or "football scores"</td>
              </tr>
              <tr>
                <td><strong>Wiki</strong></td>
                <td style="color: #888888;">Gray</td>
                <td>"wiki japan" or "about brazil"</td>
              </tr>
            </tbody>
          </table>

          <h3>Globe Interaction</h3>
          <ul>
            <li><strong>Drag</strong> - Rotate the globe</li>
            <li><strong>Scroll</strong> - Zoom in/out</li>
            <li><strong>Hover</strong> - See country highlights</li>
          </ul>

          <h3>Next Steps</h3>
          <ul>
            <li>Learn about the <a href="/docs/globe">Globe Component</a></li>
            <li>Integrate it in your project with <a href="/docs/globe/integration">npm</a></li>
          </ul>
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
          <p>A React component for rendering interactive 3D globes with country and city data visualization.</p>

          <h3>Features</h3>
          <ul>
            <li>Goldberg polyhedron (hexagonal) globe geometry</li>
            <li>422 countries with accurate borders</li>
            <li>200 major world cities</li>
            <li>Data-driven highlighting with colors and extrusion</li>
            <li>Multiple surface themes (dark, green, white)</li>
            <li>WebGL with automatic fallback</li>
            <li>React and React Native support</li>
          </ul>

          <h3>Installation</h3>
          <pre><code>npm install @aeryflux/globe three @types/three</code></pre>

          <h3>Basic Usage</h3>
          <pre><code>import { Globe } from '@aeryflux/globe/react';

function App() {
  return (
    &lt;Globe
      surface="green"
      modelUrl="/models/atlas_hex_subdiv_7.glb"
      countryData={{
        france: { scale: 0.8, color: '#00ff88' },
        germany: { scale: 0.6, color: '#00d4ff' }
      }}
    /&gt;
  );
}</code></pre>

          <h3>Globe Models</h3>
          <p>The package includes pre-built GLB models:</p>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>Cells</th>
                <th>Size</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>atlas_hex_subdiv_5.glb</td>
                <td>2,562</td>
                <td>2.5 MB</td>
                <td>Mobile</td>
              </tr>
              <tr>
                <td>atlas_hex_subdiv_6.glb</td>
                <td>10,242</td>
                <td>7.5 MB</td>
                <td>Desktop</td>
              </tr>
              <tr>
                <td>atlas_hex_subdiv_7.glb</td>
                <td>40,962</td>
                <td>20 MB</td>
                <td>High-detail</td>
              </tr>
            </tbody>
          </table>

          <div class="doc-callout doc-callout-info">
            <strong>Note:</strong> Host GLB files yourself or use a CDN for best performance.
          </div>
        `,
      },
      {
        slug: 'globe/props',
        title: 'Props Reference',
        description: 'Complete props documentation',
        category: 'Globe Component',
        content: `
          <h2>Globe Props</h2>
          <p>Complete reference for all Globe component props.</p>

          <h3>Basic Props</h3>
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>modelUrl</code></td>
                <td>string</td>
                <td>bundled</td>
                <td>URL to GLB model file</td>
              </tr>
              <tr>
                <td><code>surface</code></td>
                <td>'dark' | 'green' | 'white'</td>
                <td>'dark'</td>
                <td>Color theme preset</td>
              </tr>
              <tr>
                <td><code>rotationSpeed</code></td>
                <td>number</td>
                <td>0.0003</td>
                <td>Auto-rotation speed</td>
              </tr>
              <tr>
                <td><code>enableControls</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Enable drag rotation</td>
              </tr>
            </tbody>
          </table>

          <h3>Data Props</h3>
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>countryData</code></td>
                <td>Record&lt;string, CountryHighlight&gt;</td>
                <td>Country highlight data</td>
              </tr>
              <tr>
                <td><code>cityData</code></td>
                <td>Record&lt;string, CityHighlight&gt;</td>
                <td>City highlight data</td>
              </tr>
              <tr>
                <td><code>dataHighlightColor</code></td>
                <td>string</td>
                <td>Accent color for highlights</td>
              </tr>
            </tbody>
          </table>

          <h3>CountryHighlight Type</h3>
          <pre><code>interface CountryHighlight {
  scale: number;      // 0-1 intensity
  color?: string;     // Custom hex color
  extrusion?: number; // 0-1 displacement
}</code></pre>

          <h3>CityHighlight Type</h3>
          <pre><code>interface CityHighlight {
  scale: number;      // 0-1 intensity
  color?: string;     // Custom hex color
  extrusion?: number; // 0-1 displacement
}</code></pre>

          <h3>Visual Props</h3>
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bloomStrength</code></td>
                <td>number</td>
                <td>1.0</td>
                <td>Post-processing bloom</td>
              </tr>
              <tr>
                <td><code>glowIntensity</code></td>
                <td>number</td>
                <td>1.2</td>
                <td>Border glow intensity</td>
              </tr>
              <tr>
                <td><code>showCountries</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Show country fills</td>
              </tr>
              <tr>
                <td><code>showCities</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Show city markers</td>
              </tr>
              <tr>
                <td><code>borderColor</code></td>
                <td>string</td>
                <td>theme</td>
                <td>Custom border color</td>
              </tr>
            </tbody>
          </table>
        `,
      },
      {
        slug: 'globe/integration',
        title: 'Integration Guide',
        description: 'Integrate the globe in your React project',
        category: 'Globe Component',
        content: `
          <h2>Integration Guide</h2>
          <p>Step-by-step guide to add the globe to your React project.</p>

          <h3>1. Install Dependencies</h3>
          <pre><code>npm install @aeryflux/globe three @types/three</code></pre>

          <h3>2. Copy GLB Models</h3>
          <p>Copy the GLB files to your public folder:</p>
          <pre><code># From node_modules
cp node_modules/@aeryflux/globe/models/*.glb public/models/</code></pre>

          <h3>3. Import and Use</h3>
          <pre><code>import { Globe } from '@aeryflux/globe/react';

function MyGlobe() {
  const [countryData, setCountryData] = useState({});

  // Fetch data and update state
  useEffect(() => {
    fetchWeatherData().then(data => {
      setCountryData(data);
    });
  }, []);

  return (
    &lt;div style={{ width: '100%', height: '500px' }}&gt;
      &lt;Globe
        surface="green"
        modelUrl="/models/atlas_hex_subdiv_6.glb"
        countryData={countryData}
        showCountries
        enableControls
      /&gt;
    &lt;/div&gt;
  );
}</code></pre>

          <h3>4. Handle Loading</h3>
          <pre><code>import { Globe, GlobeFallback } from '@aeryflux/globe/react';

function MyGlobe() {
  return (
    &lt;Suspense fallback={&lt;GlobeFallback /&gt;}&gt;
      &lt;Globe modelUrl="/models/atlas_hex_subdiv_6.glb" /&gt;
    &lt;/Suspense&gt;
  );
}</code></pre>

          <h3>Country Name Matching</h3>
          <p>The globe uses Natural Earth country names. Common aliases are supported:</p>
          <ul>
            <li><code>usa</code>, <code>us</code> → United States of America</li>
            <li><code>uk</code> → United Kingdom</li>
            <li><code>uae</code> → United Arab Emirates</li>
            <li><code>south_korea</code> → South Korea</li>
          </ul>

          <h3>City Name Matching</h3>
          <p>Cities use their English names. Common aliases:</p>
          <ul>
            <li><code>nyc</code>, <code>new_york</code> → New York</li>
            <li><code>la</code> → Los Angeles</li>
            <li><code>kyiv</code> ↔ <code>kiev</code></li>
            <li><code>sao_paulo</code> ↔ <code>são_paulo</code></li>
          </ul>

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
  'design': {
    title: 'Design System',
    articles: [
      {
        slug: 'design',
        title: 'Design System',
        description: 'Colors, typography, and visual guidelines',
        category: 'Design System',
        content: `
          <h2>AeryFlux Design System</h2>
          <p>Visual guidelines for the AeryFlux ecosystem.</p>

          <h3>Colors</h3>
          <h4>Brand Colors</h4>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Hex</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Primary Green</td>
                <td><code>#00ff88</code></td>
                <td>Accent, highlights, CTAs</td>
              </tr>
              <tr>
                <td>Cyan</td>
                <td><code>#00d4ff</code></td>
                <td>Secondary accent, links</td>
              </tr>
              <tr>
                <td>Background</td>
                <td><code>#050508</code></td>
                <td>Main background</td>
              </tr>
              <tr>
                <td>Surface</td>
                <td><code>#0a0a0f</code></td>
                <td>Cards, panels</td>
              </tr>
            </tbody>
          </table>

          <h4>Mode Colors</h4>
          <table>
            <thead>
              <tr>
                <th>Mode</th>
                <th>Color</th>
                <th>Hex</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>News</td>
                <td style="color: #ef4444;">Red</td>
                <td><code>#ef4444</code></td>
              </tr>
              <tr>
                <td>Weather</td>
                <td style="color: #3b82f6;">Blue</td>
                <td><code>#3b82f6</code></td>
              </tr>
              <tr>
                <td>Economy</td>
                <td style="color: #10b981;">Green</td>
                <td><code>#10b981</code></td>
              </tr>
              <tr>
                <td>Sports</td>
                <td style="color: #f59e0b;">Orange</td>
                <td><code>#f59e0b</code></td>
              </tr>
              <tr>
                <td>Wiki</td>
                <td style="color: #888888;">Gray</td>
                <td><code>#888888</code></td>
              </tr>
            </tbody>
          </table>

          <h3>Typography</h3>
          <table>
            <thead>
              <tr>
                <th>Element</th>
                <th>Font</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Headings</td>
                <td>HemiHead</td>
                <td>Bold</td>
              </tr>
              <tr>
                <td>Body</td>
                <td>Inter</td>
                <td>Regular</td>
              </tr>
              <tr>
                <td>Code</td>
                <td>JetBrains Mono</td>
                <td>Regular</td>
              </tr>
            </tbody>
          </table>

          <h3>Globe Themes</h3>
          <table>
            <thead>
              <tr>
                <th>Theme</th>
                <th>Accent</th>
                <th>Background</th>
                <th>Use Case</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>dark</td>
                <td>#ffffff</td>
                <td>#050508</td>
                <td>Minimal, neutral</td>
              </tr>
              <tr>
                <td>green</td>
                <td>#00ff88</td>
                <td>#050508</td>
                <td>Default, branded</td>
              </tr>
              <tr>
                <td>white</td>
                <td>#1a1a1a</td>
                <td>#ffffff</td>
                <td>Light mode</td>
              </tr>
            </tbody>
          </table>
        `,
      },
    ],
  },
};

/**
 * Get a document by its slug
 */
export function getDocBySlug(slug: string): DocArticle | undefined {
  for (const category of Object.values(docContent)) {
    const article = category.articles.find(a => a.slug === slug);
    if (article) return article;
  }
  return undefined;
}

/**
 * Get all documents as a flat array
 */
export function getAllDocs(): DocArticle[] {
  const docs: DocArticle[] = [];
  for (const category of Object.values(docContent)) {
    docs.push(...category.articles);
  }
  return docs;
}

/**
 * Get previous and next documents for navigation
 */
export function getAdjacentDocs(slug: string): { prev?: DocArticle; next?: DocArticle } {
  const allDocs = getAllDocs();
  const index = allDocs.findIndex(d => d.slug === slug);

  return {
    prev: index > 0 ? allDocs[index - 1] : undefined,
    next: index < allDocs.length - 1 ? allDocs[index + 1] : undefined,
  };
}
