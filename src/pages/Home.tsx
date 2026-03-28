import { lazy, Suspense } from 'react';
import { DemoPreview } from '../components/DemoPreview';
import './Home.css';

const Globe = lazy(() => import('@aeryflux/globe/react').then(m => ({ default: m.Globe })));

export function Home() {
  return (
    <div className="home">
      {/* Globe — left side */}
      <div className="globe-section">
        <Suspense fallback={<div className="globe-loading" />}>
          <Globe
            surface="dark"
            showCountries={true}
            showBorders={true}
            showGlobeFill={true}
            rotationSpeed={0.0003}
            glowIntensity={1.2}
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>

      {/* Content — right side */}
      <div className="content-section">
        <div className="content-body">
          <h1>aeryflux</h1>
          <p>explore the world</p>

          <DemoPreview />

          <div className="links">
            <a href="https://atlas.aeryflux.com">Atlas</a>
            <a href="https://haki.aeryflux.com">Haki</a>
            <a href="https://github.com/aeryflux" target="_blank" rel="noopener noreferrer">GitHub</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
