import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsPage from './page';

// Mock the auth component
vi.mock('@/components/features/auth/LogoutButton', () => ({
  LogoutButton: () => <button>Se déconnecter</button>,
}));

// Mock the market list component
vi.mock('@/components/features/settings', () => ({
  MarketListClient: () => <div data-testid="market-list-client">MarketListClient</div>,
}));

describe('SettingsPage', () => {
  it('renders Mon compte section with LogoutButton', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Mon compte')).toBeInTheDocument();
    expect(screen.getByText('Se déconnecter')).toBeInTheDocument();
  });

  it('renders Mes marchés section with MarketListClient', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('market-list-client')).toBeInTheDocument();
  });
});
