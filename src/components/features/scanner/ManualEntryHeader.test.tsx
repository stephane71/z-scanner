/**
 * Unit tests for ManualEntryHeader component
 * Story 3.5: Manual Entry Fallback
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ManualEntryHeader } from './ManualEntryHeader';

describe('ManualEntryHeader', () => {
  it('should render title "Saisie manuelle"', () => {
    render(<ManualEntryHeader />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Saisie manuelle'
    );
  });

  it('should render back link to scanner', () => {
    render(<ManualEntryHeader />);

    const backLink = screen.getByRole('link', { name: /retour/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/scan');
  });

  it('should render NF525 badge', () => {
    render(<ManualEntryHeader />);

    expect(screen.getByText('NF525')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ManualEntryHeader className="test-class" />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('test-class');
  });

  it('should be sticky positioned', () => {
    render(<ManualEntryHeader />);

    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky', 'top-0');
  });
});
