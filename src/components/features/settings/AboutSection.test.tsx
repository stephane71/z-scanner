/**
 * AboutSection Component Tests
 * Story 6.4: Settings Page - Task 3
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AboutSection } from './AboutSection';

describe('AboutSection', () => {
  it('renders section title "À propos"', () => {
    render(<AboutSection />);

    expect(screen.getByText('À propos')).toBeInTheDocument();
  });

  it('displays app version', () => {
    render(<AboutSection />);

    // Version should be displayed (format: "Version X.X.X")
    expect(screen.getByText(/Version/)).toBeInTheDocument();
  });

  it('displays NF525 compliance badge', () => {
    render(<AboutSection />);

    expect(screen.getByText('Conforme NF525')).toBeInTheDocument();
    expect(screen.getByTestId('nf525-check-icon')).toBeInTheDocument();
  });

  it('displays support email link with accessible label', () => {
    render(<AboutSection />);

    const emailLink = screen.getByRole('link', { name: /contacter le support/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:support@z-scanner.fr');
    expect(emailLink).toHaveAttribute('aria-label', 'Contacter le support par email');
  });

  it('displays developer credit', () => {
    render(<AboutSection />);

    expect(screen.getByText(/Développé par/)).toBeInTheDocument();
  });
});
