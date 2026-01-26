import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddMarketForm } from './AddMarketForm';

// Mock hooks
const mockAddMarket = vi.fn();
const mockQueueCreate = vi.fn();
vi.mock('@/hooks', () => ({
  addMarket: (...args: unknown[]) => mockAddMarket(...args),
  queueCreate: (...args: unknown[]) => mockQueueCreate(...args),
}));

describe('AddMarketForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAddMarket.mockResolvedValue(1);
    mockQueueCreate.mockResolvedValue(1);
  });

  it('renders input and submit button', () => {
    render(<AddMarketForm userId="user-123" />);

    expect(screen.getByPlaceholderText(/nom du marché/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajouter/i })).toBeInTheDocument();
  });

  it('rejects empty name with validation', async () => {
    render(<AddMarketForm userId="user-123" />);

    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    await user.click(submitButton);

    expect(mockAddMarket).not.toHaveBeenCalled();
  });

  it('calls addMarket and queueCreate on valid submit', async () => {
    render(<AddMarketForm userId="user-123" />);

    const input = screen.getByPlaceholderText(/nom du marché/i);
    await user.type(input, 'Marché Bastille');

    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddMarket).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Marché Bastille',
          userId: 'user-123',
        })
      );
    });

    await waitFor(() => {
      expect(mockQueueCreate).toHaveBeenCalledWith(
        'market',
        1,
        expect.objectContaining({
          name: 'Marché Bastille',
          userId: 'user-123',
        })
      );
    });
  });

  it('clears input after successful creation', async () => {
    render(<AddMarketForm userId="user-123" />);

    const input = screen.getByPlaceholderText(/nom du marché/i);
    await user.type(input, 'Marché Test');

    const submitButton = screen.getByRole('button', { name: /ajouter/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});
