/**
 * Unit tests for OcrLoading component
 * Story 3.3: OCR Processing (Claude Haiku 4.5 API)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OcrLoading } from './OcrLoading';

describe('OcrLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render loading message', () => {
    render(<OcrLoading />);

    expect(screen.getByText('Analyse en cours...')).toBeInTheDocument();
  });

  it('should render custom message', () => {
    render(<OcrLoading message="Custom loading..." />);

    expect(screen.getByText('Custom loading...')).toBeInTheDocument();
  });

  it('should have aria-busy attribute', () => {
    render(<OcrLoading />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  it('should have progress bar', () => {
    render(<OcrLoading />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should show time remaining', () => {
    render(<OcrLoading />);

    // At start, should show ~5s remaining
    expect(screen.getByText(/restantes/)).toBeInTheDocument();
  });

  it('should have progress bar element', () => {
    render(<OcrLoading />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuemin', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '100');
  });

  it('should show time remaining initially', () => {
    render(<OcrLoading />);

    // At start, should show time remaining
    expect(screen.getByText(/restantes/)).toBeInTheDocument();
  });

  it('should have screen reader text', () => {
    render(<OcrLoading />);

    expect(
      screen.getByText(/Analyse du ticket en cours/i)
    ).toBeInTheDocument();
  });
});
