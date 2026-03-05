/**
 * SpecialThanks - Minimal footer acknowledging open-source projects
 */

import './SpecialThanks.css';

interface ThankItem {
  name: string;
  url: string;
  svg: string;
}

const THANKS: ThankItem[] = [
  {
    name: 'Blender',
    url: 'https://www.blender.org',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M32 8C18.745 8 8 18.745 8 32s10.745 24 24 24 24-10.745 24-24S45.255 8 32 8zm0 4c11.046 0 20 8.954 20 20s-8.954 20-20 20-20-8.954-20-20 8.954-20 20-20zm-6.5 10l-9 7 9 7v-5h13v-4h-13v-5zm13 12v5l9-7-9-7v5h-13v4h13z"/></svg>`,
  },
  {
    name: 'Three.js',
    url: 'https://threejs.org',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M12 16l20-8 20 8v32l-20 8-20-8V16zm20-4l-16 6.4V44l16 6.4 16-6.4V18.4L32 12zm0 8a4 4 0 100 8 4 4 0 000-8z"/></svg>`,
  },
  {
    name: 'React',
    url: 'https://react.dev',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor"><circle cx="32" cy="32" r="4"/><ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="2"/><ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(120 32 32)"/></svg>`,
  },
  {
    name: 'Vite',
    url: 'https://vitejs.dev',
    svg: `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M56 16L32 56 8 16h18l6 16 6-16h18zM32 32l-4-10h8l-4 10z"/></svg>`,
  },
];

export function SpecialThanks() {
  return (
    <footer className="special-thanks">
      <div className="special-thanks-inner">
        <span className="special-thanks-label">Built with</span>
        <div className="special-thanks-logos">
          {THANKS.map((item) => (
            <a
              key={item.name}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="special-thanks-link"
              title={item.name}
              dangerouslySetInnerHTML={{ __html: item.svg }}
            />
          ))}
        </div>
      </div>
    </footer>
  );
}

export default SpecialThanks;
