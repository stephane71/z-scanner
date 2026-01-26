import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteMarketDialog } from './DeleteMarketDialog';
import type { Market } from '@/types';

// Mock hooks
const mockDeleteMarket = vi.fn();
vi.mock('@/hooks', () => ({
  deleteMarket: (...args: unknown[]) => mockDeleteMarket(...args),
}));

const mockMarket: Market = {
  id: 1,
  name: 'Marché Bastille',
  userId: 'user-123',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('DeleteMarketDialog', () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockDeleteMarket.mockResolvedValue(undefined);
  });

  it('shows confirmation dialog with market name', () => {
    render(
      <DeleteMarketDialog market={mockMarket} open={true} onOpenChange={mockOnOpenChange} />
    );

    expect(screen.getByText(/marché bastille/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('calls deleteMarket and closes on confirm', async () => {
    render(
      <DeleteMarketDialog market={mockMarket} open={true} onOpenChange={mockOnOpenChange} />
    );

    const deleteButton = screen.getByRole('button', { name: /supprimer/i });
    await user.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteMarket).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('does not delete on cancel', async () => {
    render(
      <DeleteMarketDialog market={mockMarket} open={true} onOpenChange={mockOnOpenChange} />
    );

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    expect(mockDeleteMarket).not.toHaveBeenCalled();
  });
});
