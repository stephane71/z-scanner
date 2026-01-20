/**
 * Unit tests for CurrencyInput component
 * Story 3.4: Verification Screen - Task 11
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyInput } from './currency-input';

describe('CurrencyInput', () => {
  describe('Rendering', () => {
    it('should render with formatted value', () => {
      render(<CurrencyInput value={1250} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('12,50');
    });

    it('should render euro symbol by default', () => {
      render(<CurrencyInput value={1000} onChange={vi.fn()} />);

      expect(screen.getByText('€')).toBeInTheDocument();
    });

    it('should hide euro symbol when showSymbol is false', () => {
      render(<CurrencyInput value={1000} onChange={vi.fn()} showSymbol={false} />);

      expect(screen.queryByText('€')).not.toBeInTheDocument();
    });

    it('should format zero correctly', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('0,00');
    });

    it('should format large amounts with thousands separator', () => {
      render(<CurrencyInput value={123456} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      // French locale uses non-breaking space as thousands separator
      expect(input.getAttribute('value')).toMatch(/1\s?234,56/);
    });
  });

  describe('Focus Behavior', () => {
    it('should show plain value on focus', () => {
      render(<CurrencyInput value={123456} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      // Should show plain format without thousands separator
      expect(input).toHaveValue('1234,56');
    });

    it('should call onFocus when provided', () => {
      const onFocus = vi.fn();
      render(<CurrencyInput value={1000} onChange={vi.fn()} onFocus={onFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(onFocus).toHaveBeenCalled();
    });
  });

  describe('Blur Behavior', () => {
    it('should format value on blur', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={1000} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '25,50' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith(2550);
    });

    it('should revert to previous value on invalid input', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={1000} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'abc' } });
      fireEvent.blur(input);

      // Should not call onChange with invalid value
      expect(onChange).not.toHaveBeenCalled();
      expect(input).toHaveValue('10,00');
    });

    it('should call onBlur when provided', () => {
      const onBlur = vi.fn();
      render(<CurrencyInput value={1000} onChange={vi.fn()} onBlur={onBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.blur(input);

      expect(onBlur).toHaveBeenCalled();
    });
  });

  describe('Input Handling', () => {
    it('should allow typing decimal values', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '12,34' } });

      expect(input).toHaveValue('12,34');
    });

    it('should filter out non-numeric characters', () => {
      render(<CurrencyInput value={0} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '12abc34' } });

      expect(input).toHaveValue('1234');
    });

    it('should handle empty input', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={1000} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.blur(input);

      // Should revert to previous value
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should use comma as decimal separator', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={0} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '15,99' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith(1599);
    });

    it('should also accept dot as decimal separator', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={0} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '15.99' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith(1599);
    });
  });

  describe('Negative Values', () => {
    it('should reject negative values by default', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={1000} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '-10,00' } });
      fireEvent.blur(input);

      // Should revert to previous value
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should accept negative values when allowNegative is true', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={0} onChange={onChange} allowNegative />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: '-10,00' } });
      fireEvent.blur(input);

      expect(onChange).toHaveBeenCalledWith(-1000);
    });
  });

  describe('Accessibility', () => {
    it('should have decimal input mode', () => {
      render(<CurrencyInput value={1000} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('inputMode', 'decimal');
    });

    it('should be disabled when disabled prop is passed', () => {
      render(<CurrencyInput value={1000} onChange={vi.fn()} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should pass through aria attributes', () => {
      render(
        <CurrencyInput
          value={1000}
          onChange={vi.fn()}
          aria-label="Montant"
          aria-describedby="help-text"
        />
      );

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-label', 'Montant');
      expect(input).toHaveAttribute('aria-describedby', 'help-text');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single centime', () => {
      render(<CurrencyInput value={1} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('0,01');
    });

    it('should handle very large amounts', () => {
      render(<CurrencyInput value={99999999} onChange={vi.fn()} />);

      const input = screen.getByRole('textbox');
      // Should have formatted value with thousands separator
      expect(input.getAttribute('value')).toMatch(/999\s?999,99/);
    });

    it('should round to nearest centime', () => {
      const onChange = vi.fn();
      render(<CurrencyInput value={0} onChange={onChange} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      // User types value with more precision
      fireEvent.change(input, { target: { value: '10,555' } });
      fireEvent.blur(input);

      // Should be rounded to nearest centime
      expect(onChange).toHaveBeenCalledWith(1056); // 10.56 * 100 rounded
    });
  });
});
