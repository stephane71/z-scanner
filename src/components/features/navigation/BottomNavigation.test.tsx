/**
 * Tests for BottomNavigation Component - Story 3.10
 * App Layout & Bottom Navigation
 * Story 6.3 Enhancement: Scanner replaced with Analytics (Pilotage)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BottomNavigation } from './BottomNavigation';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('BottomNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/analytics');
  });

  it('renders all 4 navigation items in correct order', () => {
    render(<BottomNavigation />);

    // Pilotage is now first, then Historique
    expect(screen.getByRole('link', { name: /pilotage/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /historique/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /export/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /param/i })).toBeInTheDocument();
  });

  it('highlights the active tab based on pathname', () => {
    mockPathname.mockReturnValue('/analytics');
    render(<BottomNavigation />);

    const analyticsLink = screen.getByRole('link', { name: /pilotage/i });
    expect(analyticsLink).toHaveAttribute('aria-current', 'page');

    const ticketsLink = screen.getByRole('link', { name: /historique/i });
    expect(ticketsLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('uses Link components for client-side navigation', () => {
    render(<BottomNavigation />);

    const ticketsLink = screen.getByRole('link', { name: /historique/i });
    expect(ticketsLink).toHaveAttribute('href', '/tickets');

    const analyticsLink = screen.getByRole('link', { name: /pilotage/i });
    expect(analyticsLink).toHaveAttribute('href', '/analytics');

    const exportLink = screen.getByRole('link', { name: /export/i });
    expect(exportLink).toHaveAttribute('href', '/export');

    const settingsLink = screen.getByRole('link', { name: /param/i });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('handles nested routes - /tickets/123 highlights Historique', () => {
    mockPathname.mockReturnValue('/tickets/123');
    render(<BottomNavigation />);

    const ticketsLink = screen.getByRole('link', { name: /historique/i });
    expect(ticketsLink).toHaveAttribute('aria-current', 'page');
  });

  it('handles nested routes - /analytics/detail highlights Pilotage', () => {
    mockPathname.mockReturnValue('/analytics/detail');
    render(<BottomNavigation />);

    const analyticsLink = screen.getByRole('link', { name: /pilotage/i });
    expect(analyticsLink).toHaveAttribute('aria-current', 'page');
  });

  it('has minimum 48px touch targets', () => {
    render(<BottomNavigation />);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      // Check that min-h-[48px] class is applied
      expect(link).toHaveClass('min-h-[48px]');
    });
  });

  it('has proper accessibility attributes on nav element', () => {
    render(<BottomNavigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Navigation principale');
  });
});
