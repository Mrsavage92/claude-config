import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/hooks/store';
import { FlashFirePage } from './FlashFirePage';

function renderPage() {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <FlashFirePage />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('Flash Fire progression', () => {
  it('runs a short round to completion and shows a score', async () => {
    const user = userEvent.setup();
    renderPage();

    // Pick the smallest round (10 cards) and start.
    await user.click(screen.getByRole('button', { name: '10' }));
    await user.click(screen.getByRole('button', { name: /start flash fire/i }));

    // Progress through every card: answer, then advance.
    for (let i = 0; i < 10; i++) {
      const group = await screen.findByRole('radiogroup', { name: /options/i });
      const first = within(group).getAllByRole('radio')[0];
      await user.click(first);
      // Feedback appears with a Next / See results button.
      const advance = screen.getByRole('button', { name: /next|see results/i });
      await user.click(advance);
    }

    // Results screen shows a Score tile and a "New round" action.
    expect(await screen.findByText(/^Score$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new round/i })).toBeInTheDocument();
  });
});
