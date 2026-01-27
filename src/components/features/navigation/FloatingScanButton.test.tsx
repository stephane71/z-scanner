/**
 * FloatingScanButton Component Tests
 * Story 6.3 Enhancement: Floating action button for scanner access
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FloatingScanButton } from './FloatingScanButton';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('FloatingScanButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/tickets');
  });

  it('renders on non-scan pages', () => {
    render(<FloatingScanButton />);

    const button = screen.getByRole('link', { name: 'Ouvrir le scanner' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/scan');
  });

  it('renders camera icon', () => {
    render(<FloatingScanButton />);

    // The Camera icon should be rendered (with aria-hidden)
    const link = screen.getByRole('link', { name: 'Ouvrir le scanner' });
    const icon = link.querySelector('svg');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  it('is hidden on /scan page', () => {
    mockPathname.mockReturnValue('/scan');

    render(<FloatingScanButton />);

    expect(screen.queryByRole('link', { name: 'Ouvrir le scanner' })).not.toBeInTheDocument();
  });

  it('is hidden on /scan nested routes', () => {
    mockPathname.mockReturnValue('/scan/camera');

    render(<FloatingScanButton />);

    expect(screen.queryByRole('link', { name: 'Ouvrir le scanner' })).not.toBeInTheDocument();
  });

  it('renders on /settings page', () => {
    mockPathname.mockReturnValue('/settings');

    render(<FloatingScanButton />);

    expect(screen.getByRole('link', { name: 'Ouvrir le scanner' })).toBeInTheDocument();
  });

  it('renders on /analytics page', () => {
    mockPathname.mockReturnValue('/analytics');

    render(<FloatingScanButton />);

    expect(screen.getByRole('link', { name: 'Ouvrir le scanner' })).toBeInTheDocument();
  });

  it('renders on /export page', () => {
    mockPathname.mockReturnValue('/export');

    render(<FloatingScanButton />);

    expect(screen.getByRole('link', { name: 'Ouvrir le scanner' })).toBeInTheDocument();
  });

  it('has correct positioning styles', () => {
    render(<FloatingScanButton />);

    const button = screen.getByRole('link', { name: 'Ouvrir le scanner' });
    expect(button).toHaveClass('fixed', 'right-4', 'z-60');
    // Check bottom position style is set
    expect(button).toHaveStyle({ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' });
  });

  it('has primary color styling', () => {
    render(<FloatingScanButton />);

    const button = screen.getByRole('link', { name: 'Ouvrir le scanner' });
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('has touch-friendly size (56px)', () => {
    render(<FloatingScanButton />);

    const button = screen.getByRole('link', { name: 'Ouvrir le scanner' });
    expect(button).toHaveClass('w-14', 'h-14'); // w-14 = 56px, h-14 = 56px
  });
});
