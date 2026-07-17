import { describe, it, expect } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { StoreProvider } from '@/hooks/store';
import { PracticePage } from './PracticePage';

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/practice']}>
      <StoreProvider>
        <PracticePage />
      </StoreProvider>
    </MemoryRouter>,
  );
}

describe('Practice flow', () => {
  it('hides the answer and explanation until the learner submits, then reveals them', async () => {
    const user = userEvent.setup();
    renderPage();

    // Constrain to single-choice so exactly one selection is needed.
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: 'Single' }));

    // Explanation content is not shown before submitting.
    expect(screen.queryByText(/key exam clue/i)).toBeNull();

    const options = screen.getByRole('radiogroup', { name: /answer options/i });
    const firstOption = within(options).getAllByRole('radio')[0];
    await user.click(firstOption);

    const submit = screen.getByRole('button', { name: /submit answer/i });
    expect(submit).toBeEnabled();
    await user.click(submit);

    // After submission the full explanation is revealed.
    expect(screen.getByText(/key exam clue/i)).toBeInTheDocument();
    expect(screen.getByText(/learning objective/i)).toBeInTheDocument();
    // And a way to continue appears.
    expect(screen.getByRole('button', { name: /next|restart set/i })).toBeInTheDocument();
  });

  it('keeps the submit button disabled until a selection is made', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: 'Single' }));
    expect(screen.getByRole('button', { name: /submit answer/i })).toBeDisabled();
  });

  it('lets the learner bookmark a question after answering', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole('button', { name: /filters/i }));
    await user.click(screen.getByRole('button', { name: 'Single' }));
    // Collapse the filter panel so its "Bookmarked" focus chip is not on screen.
    await user.click(screen.getByRole('button', { name: /filters/i }));
    const options = screen.getByRole('radiogroup', { name: /answer options/i });
    await user.click(within(options).getAllByRole('radio')[0]);
    await user.click(screen.getByRole('button', { name: /submit answer/i }));
    const bookmark = screen.getByRole('button', { name: /^bookmark$/i });
    fireEvent.click(bookmark);
    expect(screen.getByRole('button', { name: /^bookmarked$/i })).toBeInTheDocument();
  });
});
