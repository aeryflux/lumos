import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('@aeryflux/globe/react', () => ({
  Globe: () => <div data-testid="globe" />,
}));

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  );
}

describe('App', () => {
  it('renders without crashing', () => {
    renderApp();
    expect(document.querySelector('.layout')).toBeInTheDocument();
  });

  it('renders nav with brand name', () => {
    renderApp();
    expect(screen.getAllByText('aeryflux').length).toBeGreaterThanOrEqual(1);
    expect(document.querySelector('.brand-name')).toBeInTheDocument();
  });

  it('renders nav links', () => {
    renderApp();
    const atlasLinks = screen.getAllByText('Atlas');
    expect(atlasLinks[0]).toHaveAttribute('href', 'https://atlas.aeryflux.com');
  });

  it('renders GitHub link', () => {
    renderApp();
    const ghLink = document.querySelector('a[href="https://github.com/aeryflux"]');
    expect(ghLink).toBeInTheDocument();
  });
});
