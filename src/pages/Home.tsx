import { lazy, Suspense } from 'react';
import { DemoPreview } from '../components/DemoPreview';
import './Home.css';

const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

export function Home() {
  return (
    <div className="home">
      {/* Globe — fullscreen background */}
      <div className="home-globe">
        <Suspense fallback={<div className="home-globe-loading" />}>
          <Globe
            surface="dark"
            rotationSpeed={0.0003}
            glowIntensity={1.2}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      {/* Content overlay */}
      <div className="home-content">
        <h1 className="home-title">aeryflux</h1>
        <p className="home-tagline">explore the world</p>

        {/* Demo preview — interactive showcase */}
        <DemoPreview />

        <div className="home-links">
          <a href="https://atlas.aeryflux.com" className="home-cta">
            Atlas
          </a>
          <a href="https://github.com/aeryflux" className="home-link" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}

export default Home;
