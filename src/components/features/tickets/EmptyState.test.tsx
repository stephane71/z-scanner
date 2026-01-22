/**
 * EmptyState component tests
 * Story 4.1: Ticket List (Historique)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders empty state container', () => {
    render(<EmptyState />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('displays title "Aucun ticket"', () => {
    render(<EmptyState />);
    expect(screen.getByText('Aucun ticket')).toBeInTheDocument();
  });

  it('displays encouraging message', () => {
    render(<EmptyState />);
    expect(
      screen.getByText(/Scannez votre premier ticket Z/)
    ).toBeInTheDocument();
  });

  it('renders CTA link to /scan', () => {
    render(<EmptyState />);
    const cta = screen.getByTestId('scan-cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute('href', '/scan');
  });

  it('CTA has accessible text', () => {
    render(<EmptyState />);
    expect(screen.getByText('Scanner un ticket')).toBeInTheDocument();
  });
});
