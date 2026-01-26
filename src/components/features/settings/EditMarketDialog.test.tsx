import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditMarketDialog } from './EditMarketDialog';
import type { Market } from '@/types';

// Mock hooks
const mockUpdateMarketName = vi.fn();
vi.mock('@/hooks', () => ({
  updateMarketName: (...args: unknown[]) => mockUpdateMarketName(...args),
}));

const mockMarket: Market = {
  id: 1,
  name: 'Marché Bastille',
  userId: 'user-123',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('EditMarketDialog', () => {
  const user = userEvent.setup();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdateMarketName.mockResolvedValue(undefined);
  });

  it('pre-fills input with current market name', () => {
    render(
      <EditMarketDialog market={mockMarket} open={true} onOpenChange={mockOnOpenChange} />
    );

    const input = screen.getByDisplayValue('Marché Bastille');
    expect(input).toBeInTheDocument();
  });

  it('rejects empty name on save', async () => {
    render(
      <EditMarketDialog market={mockMarket} open={true} onOpenChange={mockOnOpenChange} />
    );

    const input = screen.getByDisplayValue('Marché Bastille');
    await user.clear(input);

    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(saveButton);

    expect(mockUpdateMarketName).not.toHaveBeenCalled();
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });

  it('calls updateMarketName and closes dialog on valid save', async () => {
    render(
      <EditMarketDialog market={mockMarket} open={true} onOpenChange={mockOnOpenChange} />
    );

    const input = screen.getByDisplayValue('Marché Bastille');
    await user.clear(input);
    await user.type(input, 'Marché Aligre');

    const saveButton = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateMarketName).toHaveBeenCalledWith(1, 'Marché Aligre');
    });

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
