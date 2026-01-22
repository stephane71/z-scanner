/**
 * NF525Info component tests
 * Story 4.2: Ticket Detail View
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { NF525Info } from './NF525Info';

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: { writeText: mockWriteText },
});

describe('NF525Info', () => {
  const defaultProps = {
    dataHash: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
    validatedAt: '2026-01-15T14:30:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  it('renders NF525 badge with shield icon', () => {
    render(<NF525Info {...defaultProps} />);

    expect(screen.getByText('Conforme NF525')).toBeInTheDocument();
    expect(screen.getByTestId('nf525-info')).toBeInTheDocument();
  });

  it('displays formatted validation timestamp', () => {
    render(<NF525Info {...defaultProps} />);

    expect(screen.getByText('Validé le :')).toBeInTheDocument();
    expect(screen.getByText(/15\/01\/2026/)).toBeInTheDocument();
  });

  it('displays truncated dataHash', () => {
    render(<NF525Info {...defaultProps} />);

    // Should show first 8 chars...last 8 chars
    expect(screen.getByText(/a1b2c3d4.*c9d0e1f2/)).toBeInTheDocument();
  });

  it('copies full hash to clipboard when button clicked', async () => {
    render(<NF525Info {...defaultProps} />);

    const copyButton = screen.getByTestId('copy-hash-button');

    await act(async () => {
      fireEvent.click(copyButton);
    });

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(defaultProps.dataHash);
    });
  });

  it('shows tooltip when info button is clicked', () => {
    render(<NF525Info {...defaultProps} />);

    // Tooltip should not be visible initially
    expect(screen.queryByTestId('hash-tooltip')).not.toBeInTheDocument();

    // Click info button
    const infoButton = screen.getByTestId('info-button');
    fireEvent.click(infoButton);

    // Tooltip should be visible
    expect(screen.getByTestId('hash-tooltip')).toBeInTheDocument();
    expect(screen.getByText(/garantit l'intégrité/)).toBeInTheDocument();
  });

  it('hides tooltip when close button inside tooltip is clicked', () => {
    render(<NF525Info {...defaultProps} />);

    // Open tooltip
    fireEvent.click(screen.getByTestId('info-button'));
    expect(screen.getByTestId('hash-tooltip')).toBeInTheDocument();

    // Close tooltip
    fireEvent.click(screen.getByText('Fermer'));
    expect(screen.queryByTestId('hash-tooltip')).not.toBeInTheDocument();
  });
});
