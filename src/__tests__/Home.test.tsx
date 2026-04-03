import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { Home } from '../pages/Home';
import { I18nContext, useI18nProvider } from '../i18n';

vi.mock('@aeryflux/globe/react', () => ({
  Globe: () => <div data-testid="globe" />,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  const i18n = useI18nProvider();
  return (
    <I18nContext.Provider value={i18n}>
      <MemoryRouter>{children}</MemoryRouter>
    </I18nContext.Provider>
  );
}

function renderHome() {
  return render(<Home />, { wrapper: Wrapper });
}

describe('Home', () => {
  it('renders globe section', () => {
    renderHome();
    expect(document.querySelector('.globe-section')).toBeInTheDocument();
  });

  it('renders brand title', () => {
    renderHome();
    expect(screen.getByText('aeryflux')).toBeInTheDocument();
  });

  it('renders product links', () => {
    renderHome();
    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('https://atlas.aeryflux.com');
    expect(hrefs).toContain('https://haki.aeryflux.com');
    expect(hrefs).toContain('https://github.com/aeryflux');
  });

  it('has no private infrastructure references in DOM', () => {
    renderHome();
    const html = document.body.innerHTML.toLowerCase();
    expect(html).not.toContain('pythagoras');
    expect(html).not.toContain('holocron');
    expect(html).not.toContain('aeryflux-core');
  });
});
