/**
 * Settings Page Tests
 * Story 6.4: Settings Page - Task 4
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SettingsPage from './page';

// Mock the settings components
vi.mock('@/components/features/settings', () => ({
  MarketListClient: () => <div data-testid="market-list-client">MarketListClient</div>,
  AccountSection: () => (
    <section data-testid="account-section">
      <h2>Mon compte</h2>
      <span data-testid="user-email">test@example.com</span>
      <button>Se déconnecter</button>
    </section>
  ),
  SyncSection: () => (
    <section data-testid="sync-section">
      <h2>Synchronisation</h2>
      <span>Tout synchronisé</span>
    </section>
  ),
  AboutSection: () => (
    <section data-testid="about-section">
      <h2>À propos</h2>
      <span>Version 0.1.0</span>
    </section>
  ),
}));

describe('SettingsPage', () => {
  it('renders page title "Paramètres"', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Paramètres')).toBeInTheDocument();
  });

  it('renders AccountSection (Mon compte)', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('account-section')).toBeInTheDocument();
    expect(screen.getByText('Mon compte')).toBeInTheDocument();
  });

  it('renders MarketListClient (Mes marchés)', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('market-list-client')).toBeInTheDocument();
  });

  it('renders SyncSection (Synchronisation)', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('sync-section')).toBeInTheDocument();
    expect(screen.getByText('Synchronisation')).toBeInTheDocument();
  });

  it('renders AboutSection (À propos)', () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('about-section')).toBeInTheDocument();
    expect(screen.getByText('À propos')).toBeInTheDocument();
  });

  it('renders all four sections in correct order', () => {
    render(<SettingsPage />);

    const sections = screen.getAllByRole('heading', { level: 2 });

    // Verify order: Mon compte, then [Mes marchés header not rendered in mock], Synchronisation, À propos
    expect(sections[0]).toHaveTextContent('Mon compte');
    expect(sections[1]).toHaveTextContent('Synchronisation');
    expect(sections[2]).toHaveTextContent('À propos');
  });
});
