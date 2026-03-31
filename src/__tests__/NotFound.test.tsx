import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';

vi.mock('@aeryflux/globe/react', () => ({
  Globe: () => <div data-testid="globe" />,
}));

describe('404 page', () => {
  it('renders on unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/test']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText("this page doesn't exist")).toBeInTheDocument();
  });

  it('has a link back to home', () => {
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );
    const link = screen.getByText('back to home');
    expect(link).toHaveAttribute('href', '/');
  });
});
