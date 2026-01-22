/**
 * NF525Badge component tests
 * Story 4.1: Ticket List (Historique)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NF525Badge } from './NF525Badge';

describe('NF525Badge', () => {
  it('renders badge with NF525 text', () => {
    render(<NF525Badge />);
    expect(screen.getByText('NF525')).toBeInTheDocument();
  });

  it('has aria-label for accessibility', () => {
    render(<NF525Badge />);
    const badge = screen.getByTestId('nf525-badge');
    expect(badge).toHaveAttribute('aria-label', 'Conforme NF525');
  });

  it('has title attribute for tooltip', () => {
    render(<NF525Badge />);
    const badge = screen.getByTestId('nf525-badge');
    expect(badge).toHaveAttribute('title', 'Conforme NF525');
  });

  it('uses blue trust color styling', () => {
    render(<NF525Badge />);
    const badge = screen.getByTestId('nf525-badge');
    expect(badge).toHaveClass('text-blue-700');
    expect(badge).toHaveClass('bg-blue-50');
  });
});
