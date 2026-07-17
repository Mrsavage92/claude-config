import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/hooks/store';
import { App } from './App';

function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <StoreProvider>
        <App />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('App shell', () => {
  it('renders the dashboard with the persistent disclaimer', () => {
    renderApp('/');
    expect(screen.getByText(/Independent study application\. Not affiliated with/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Dashboard/i, level: 1 })).toBeInTheDocument();
    // Skip navigation link for accessibility.
    expect(screen.getByRole('link', { name: /skip to main content/i })).toBeInTheDocument();
  });

  it('navigates between routes via the sidebar', async () => {
    const user = userEvent.setup();
    renderApp('/');
    const nav = screen.getByRole('navigation', { name: /primary/i });
    await user.click(within(nav).getByRole('link', { name: /^Learn$/i }));
    expect(await screen.findByRole('heading', { name: /Prepare by domain|Learn/i })).toBeInTheDocument();
    // The seven domains render as cards.
    expect(screen.getByText(/Prompting and Task Execution/i)).toBeInTheDocument();
  });

  it('renders the sources & attribution page', async () => {
    renderApp('/sources');
    expect(await screen.findByText(/not endorsed by, affiliated with, or sponsored by/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /CC BY 4\.0/i })).toBeInTheDocument();
  });

  it('shows a 404 for unknown routes', async () => {
    renderApp('/does-not-exist');
    expect(await screen.findByText(/404|not found/i)).toBeTruthy();
  });
});
