/**
 * DateFilterEmpty component tests
 * Story 4.3: Filter by Date
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DateFilterEmpty } from './DateFilterEmpty';

describe('DateFilterEmpty', () => {
  it('renders the empty state message for filtered results', () => {
    render(<DateFilterEmpty />);

    expect(
      screen.getByText('Aucun ticket pour cette période')
    ).toBeInTheDocument();
  });

  it('renders an icon illustration', () => {
    render(<DateFilterEmpty />);

    // The component should have a testid for the container
    const container = screen.getByTestId('date-filter-empty');
    expect(container).toBeInTheDocument();

    // Should contain an icon (in a circular container)
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
