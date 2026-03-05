/**
 * Documentation Content
 *
 * Static documentation content for Lumos.
 * In the future, this could be fetched from Pythagoras API.
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
          <p>AeryFlux is an interactive 3D globe platform that brings together music, news, weather, and knowledge from every corner of the planet. Explore countries, discover new music, stay informed about global events, and complete interactive globe challenges.</p>

          <h3>Key Features</h3>
          <ul>
            <li><strong>Interactive 3D Globe</strong> - Explore a beautiful hexagonal globe with smooth animations</li>
            <li><strong>Multiple Modes</strong> - Switch between Music, News, Weather, Wiki, and Challenge modes</li>
            <li><strong>Cross-Platform</strong> - Available on Web, iOS, Android, and Desktop</li>
            <li><strong>Earn Stars</strong> - Complete daily challenges to earn virtual currency</li>
            <li><strong>Customization</strong> - Personalize your experience with themes and settings</li>
          </ul>

          <h3>The AeryFlux Ecosystem</h3>
          <table>
            <thead>
              <tr>
                <th>App</th>
                <th>Description</th>
                <th>Platform</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Atlas</strong></td>
                <td>Main mobile app with 3D globe</td>
                <td>Web, iOS, Android</td>
              </tr>
              <tr>
                <td><strong>Lumos</strong></td>
                <td>Landing page & documentation</td>
                <td>Web</td>
              </tr>
              <tr>
                <td><strong>Holocron</strong></td>
                <td>Admin backoffice & content management</td>
                <td>Web</td>
              </tr>
              <tr>
                <td><strong>Edison</strong></td>
                <td>Developer hub</td>
                <td>Web, Mobile</td>
              </tr>
            </tbody>
          </table>

          <h3>Getting Help</h3>
          <p>If you have questions or need help:</p>
          <ul>
            <li>Check the <a href="/docs/quickstart">Quick Start Guide</a></li>
            <li>Browse the <a href="/docs">Documentation</a></li>
            <li>Join our <a href="https://discord.gg/aeryflux" target="_blank">Discord Community</a></li>
            <li>Report issues on <a href="https://github.com/aeryflux" target="_blank">GitHub</a></li>
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
          <p>Get started with AeryFlux in just a few minutes.</p>

          <h3>1. Choose Your Platform</h3>

          <div class="doc-callout doc-callout-info">
            <strong>Web (Recommended for first-time users)</strong><br>
            Visit <a href="https://atlas.aeryflux.io">atlas.aeryflux.io</a> to try Atlas instantly in your browser.
          </div>

          <h4>Mobile (iOS & Android)</h4>
          <ol>
            <li>Download Atlas from the <a href="/download">App Store or Google Play</a></li>
            <li>Open the app and create an account (or continue as guest)</li>
            <li>Start exploring the globe!</li>
          </ol>

          <h4>Desktop (Coming Soon)</h4>
          <div class="doc-callout doc-callout-info">
            Desktop application is coming in a future release. Use the Web version for now!
          </div>

          <h3>2. Explore the Globe</h3>
          <p>Once you're in Atlas:</p>
          <ul>
            <li><strong>Drag</strong> to rotate the globe</li>
            <li><strong>Pinch/Scroll</strong> to zoom in and out</li>
            <li><strong>Tap</strong> on a country to select it</li>
            <li><strong>Swipe</strong> from the edges to open the drawers</li>
          </ul>

          <h3>3. Switch Modes</h3>
          <p>Open the left drawer and select a mode:</p>
          <ul>
            <li><strong>Music</strong> - Discover music from selected countries</li>
            <li><strong>News</strong> - Read headlines from around the world</li>
            <li><strong>Weather</strong> - View real-time weather data</li>
            <li><strong>Wiki</strong> - Learn about countries and landmarks</li>
            <li><strong>Challenge</strong> - Complete interactive globe challenges</li>
          </ul>

          <h3>4. Earn Stars</h3>
          <p>Complete daily challenges to earn Stars:</p>
          <ul>
            <li>Login daily for bonus Stars</li>
            <li>Complete interactive challenges</li>
            <li>Explore new countries</li>
            <li>Share your discoveries</li>
          </ul>

          <h3>Next Steps</h3>
          <ul>
            <li>Learn about <a href="/docs/atlas/navigation">Globe Navigation</a></li>
            <li>Discover all <a href="/docs/atlas/modes">Exploration Modes</a></li>
            <li>Check out <a href="/docs/atlas/challenges">Challenges & Stars</a></li>
          </ul>
        `,
      },
      {
        slug: 'installation',
        title: 'Installation',
        description: 'Detailed installation instructions for all platforms',
        category: 'Getting Started',
        content: `
          <h2>Installation Guide</h2>
          <p>Detailed instructions for installing AeryFlux on all supported platforms.</p>

          <h3>System Requirements</h3>

          <h4>Web Browser</h4>
          <ul>
            <li>Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+</li>
            <li>WebGL 2.0 support</li>
            <li>Minimum 4GB RAM recommended</li>
          </ul>

          <h4>Mobile</h4>
          <ul>
            <li><strong>iOS:</strong> iOS 14.0 or later, iPhone 8 or newer</li>
            <li><strong>Android:</strong> Android 8.0 or later, 3GB RAM minimum</li>
          </ul>

          <h4>Desktop (Coming Soon)</h4>
          <div class="doc-callout doc-callout-info">
            Desktop application is planned for a future release. Use the Web version for now!
          </div>

          <h3>Installing Atlas Mobile</h3>

          <h4>iOS</h4>
          <ol>
            <li>Open the App Store on your iPhone or iPad</li>
            <li>Search for "AeryFlux Atlas"</li>
            <li>Tap "Get" and authenticate with Face ID/Touch ID</li>
            <li>Wait for the download to complete</li>
            <li>Open Atlas from your home screen</li>
          </ol>

          <h4>Android</h4>
          <ol>
            <li>Open Google Play Store</li>
            <li>Search for "AeryFlux Atlas"</li>
            <li>Tap "Install"</li>
            <li>Wait for the download to complete</li>
            <li>Open Atlas from your app drawer</li>
          </ol>

          <h3>Troubleshooting</h3>
          <p>Having issues? Check these common solutions:</p>
          <ul>
            <li><strong>Globe not loading:</strong> Ensure WebGL is enabled in your browser</li>
            <li><strong>Slow performance:</strong> Try lowering the graphics quality in Settings</li>
            <li><strong>App crashes:</strong> Make sure you have the latest version installed</li>
          </ul>
          <p>Still stuck? Check our <a href="/docs">documentation</a> or join our <a href="https://discord.gg/aeryflux">Discord</a>.</p>
        `,
      },
    ],
  },
  'atlas': {
    title: 'Atlas Mobile',
    articles: [
      {
        slug: 'atlas/navigation',
        title: 'Globe Navigation',
        description: 'Master the 3D globe controls',
        category: 'Atlas Mobile',
        content: `
          <h2>Globe Navigation</h2>
          <p>Learn how to navigate the 3D globe in Atlas.</p>

          <h3>Basic Controls</h3>

          <h4>Touch/Mouse Controls</h4>
          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Touch</th>
                <th>Mouse</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rotate globe</td>
                <td>Drag with one finger</td>
                <td>Click and drag</td>
              </tr>
              <tr>
                <td>Zoom in/out</td>
                <td>Pinch with two fingers</td>
                <td>Scroll wheel</td>
              </tr>
              <tr>
                <td>Select country</td>
                <td>Tap on country</td>
                <td>Click on country</td>
              </tr>
              <tr>
                <td>Open left drawer</td>
                <td>Swipe from left edge</td>
                <td>Click menu icon</td>
              </tr>
              <tr>
                <td>Open right drawer</td>
                <td>Swipe from right edge</td>
                <td>Click settings icon</td>
              </tr>
            </tbody>
          </table>

          <h3>Globe Types</h3>
          <p>Atlas uses different globe types depending on the mode:</p>

          <h4>Atlas Globe (Hexagonal)</h4>
          <p>Used in Music, News, Wiki, and Challenge modes. Features:</p>
          <ul>
            <li>Goldberg polyhedron with hexagonal cells</li>
            <li>Grouped country meshes for better performance</li>
            <li>Glowing green borders between countries</li>
            <li>Smooth shading for softer visuals</li>
          </ul>

          <h4>Weather Globe</h4>
          <p>Used in Weather mode. Features:</p>
          <ul>
            <li>Individual hexagonal cells for data visualization</li>
            <li>Color-coded temperature/weather data per cell</li>
            <li>162 cells on mobile, 2562 on desktop for detail</li>
          </ul>

          <h3>Country Selection</h3>
          <p>When you tap/click on a country:</p>
          <ol>
            <li>The country highlights with a glow effect</li>
            <li>The globe rotates to center the country</li>
            <li>A card appears with information based on current mode</li>
            <li>You can tap the card to see more details</li>
          </ol>

          <h3>Keyboard Shortcuts (Desktop)</h3>
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td><code>Arrow Keys</code></td><td>Rotate globe</td></tr>
              <tr><td><code>+</code> / <code>-</code></td><td>Zoom in/out</td></tr>
              <tr><td><code>R</code></td><td>Reset view</td></tr>
              <tr><td><code>F</code></td><td>Toggle fullscreen</td></tr>
              <tr><td><code>1-5</code></td><td>Switch modes</td></tr>
            </tbody>
          </table>

          <h3>Performance Tips</h3>
          <ul>
            <li>Enable "Low Quality Mode" in settings for older devices</li>
            <li>Close other apps to free up memory</li>
            <li>The web version performs best in Chrome</li>
          </ul>
        `,
      },
      {
        slug: 'atlas/modes',
        title: 'Exploration Modes',
        description: 'Discover all the ways to explore the world',
        category: 'Atlas Mobile',
        content: `
          <h2>Exploration Modes</h2>
          <p>Atlas offers five distinct modes for exploring the world.</p>

          <h3>News Mode (Default)</h3>
          <div class="doc-mode-card" style="border-left-color: #ef4444;">
            <strong>Color:</strong> Red (#ef4444)
          </div>
          <p>Stay informed about global events:</p>
          <ul>
            <li>Real-time news headlines from selected countries</li>
            <li>Multiple news sources per country</li>
            <li>Save articles to read later</li>
            <li>Share articles with friends</li>
          </ul>

          <h3>Music Mode</h3>
          <div class="doc-mode-card" style="border-left-color: #8b5cf6;">
            <strong>Color:</strong> Purple (#8b5cf6)
          </div>
          <p>Discover music from around the world:</p>
          <ul>
            <li>Top tracks from each country</li>
            <li>Explore different genres</li>
            <li>Preview tracks directly in the app</li>
            <li>Open in Spotify or Apple Music</li>
          </ul>

          <h3>Weather Mode</h3>
          <div class="doc-mode-card" style="border-left-color: #3b82f6;">
            <strong>Color:</strong> Blue (#3b82f6)
          </div>
          <p>View real-time weather data:</p>
          <ul>
            <li>Temperature displayed on hexagonal cells</li>
            <li>Weather conditions and forecasts</li>
            <li>Color-coded heat map visualization</li>
            <li>Support for Celsius and Fahrenheit</li>
          </ul>

          <h3>Wiki Mode</h3>
          <div class="doc-mode-card" style="border-left-color: #888888;">
            <strong>Color:</strong> Gray (#888888)
          </div>
          <p>Learn about countries and landmarks:</p>
          <ul>
            <li>Quick facts about each country</li>
            <li>Capital cities and major landmarks</li>
            <li>Population and area statistics</li>
            <li>Links to Wikipedia for more info</li>
          </ul>

          <h3>Challenge Mode</h3>
          <div class="doc-mode-card" style="border-left-color: #f59e0b;">
            <strong>Color:</strong> Gold (#f59e0b)
          </div>
          <p>Complete interactive globe challenges:</p>
          <ul>
            <li>Daily challenges with increasing difficulty</li>
            <li>Find countries, capitals, and flags</li>
            <li>Earn Stars for correct answers</li>
            <li>Compete on leaderboards</li>
          </ul>

          <h3>Switching Modes</h3>
          <p>To switch modes:</p>
          <ol>
            <li>Open the left drawer (swipe from left edge or tap menu icon)</li>
            <li>Select the desired mode from the list</li>
            <li>The globe will update with mode-specific visuals</li>
          </ol>

          <div class="doc-callout doc-callout-info">
            <strong>Pro Tip:</strong> Long-press on a mode to rearrange the order in the drawer!
          </div>
        `,
      },
      {
        slug: 'atlas/challenges',
        title: 'Challenges & Stars',
        description: 'Earn rewards by completing challenges',
        category: 'Atlas Mobile',
        content: `
          <h2>Challenges & Stars</h2>
          <p>Complete challenges to earn Stars and unlock rewards.</p>

          <h3>What are Stars?</h3>
          <p>Stars are AeryFlux's virtual currency. Use them to:</p>
          <ul>
            <li>Unlock premium themes</li>
            <li>Purchase cosmetic items</li>
            <li>Skip challenge cooldowns</li>
            <li>Support the project</li>
          </ul>

          <h3>Earning Stars</h3>

          <h4>Daily Rewards</h4>
          <ul>
            <li><strong>Login Bonus:</strong> +10 Stars daily</li>
            <li><strong>Streak Bonus:</strong> +5 Stars per consecutive day (max +50)</li>
          </ul>

          <h4>Challenges</h4>
          <ul>
            <li><strong>Easy:</strong> +5 Stars</li>
            <li><strong>Medium:</strong> +15 Stars</li>
            <li><strong>Hard:</strong> +30 Stars</li>
            <li><strong>Expert:</strong> +50 Stars</li>
          </ul>

          <h4>Exploration</h4>
          <ul>
            <li><strong>First visit to country:</strong> +2 Stars</li>
            <li><strong>Discover all countries in continent:</strong> +25 Stars</li>
            <li><strong>Visit 100 countries:</strong> +100 Stars</li>
          </ul>

          <h3>Challenge Types</h3>

          <h4>Country Challenges</h4>
          <p>Identify countries based on:</p>
          <ul>
            <li>Shape outline</li>
            <li>Position on globe</li>
            <li>Flag</li>
            <li>Capital city</li>
          </ul>

          <h4>Speed Challenges</h4>
          <p>Find as many countries as possible in:</p>
          <ul>
            <li>30 seconds (Easy)</li>
            <li>60 seconds (Medium)</li>
            <li>90 seconds (Hard)</li>
          </ul>

          <h4>Daily Challenge</h4>
          <p>A new unique challenge every day. Complete it for bonus Stars!</p>

          <h3>Leaderboards</h3>
          <p>Compete with other explorers:</p>
          <ul>
            <li><strong>Daily:</strong> Top scorers of the day</li>
            <li><strong>Weekly:</strong> Weekly rankings</li>
            <li><strong>All-Time:</strong> Hall of fame</li>
            <li><strong>Friends:</strong> Compare with friends</li>
          </ul>

          <h3>Purchasing Stars</h3>
          <p>Support development by purchasing Star packs:</p>
          <table>
            <thead>
              <tr>
                <th>Pack</th>
                <th>Stars</th>
                <th>Price</th>
                <th>Bonus</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Starter</td>
                <td>500</td>
                <td>$2.99</td>
                <td>+3 themes</td>
              </tr>
              <tr>
                <td>Support</td>
                <td>2,000</td>
                <td>$14.99</td>
                <td>+10 themes</td>
              </tr>
              <tr>
                <td>Sailor</td>
                <td>10,000</td>
                <td>$49.99</td>
                <td>All cosmetics</td>
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
