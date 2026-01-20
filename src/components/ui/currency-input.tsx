'use client';

/**
 * CurrencyInput - French currency input component
 * Story 3.4: Verification Screen
 *
 * Input accepts decimal euros, stores as centimes.
 * Uses French number formatting (comma decimal separator).
 * Clear formatting on focus, format on blur.
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps
  extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange' | 'type'> {
  /** Value in centimes */
  value: number;
  /** Callback when value changes (in centimes) */
  onChange: (value: number) => void;
  /** Show euro symbol */
  showSymbol?: boolean;
  /** Whether to allow negative values */
  allowNegative?: boolean;
}

/**
 * Format centimes to display value (French format: 1 234,56)
 */
function formatToDisplay(centimes: number): string {
  const euros = centimes / 100;
  return euros.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Parse display value to centimes
 */
function parseFromDisplay(display: string): number | null {
  // Remove spaces (thousands separator in French)
  let normalized = display.replace(/\s/g, '');
  // Replace comma with dot for parsing
  normalized = normalized.replace(',', '.');
  // Remove trailing dot
  normalized = normalized.replace(/\.$/, '');

  const parsed = parseFloat(normalized);

  if (isNaN(parsed)) {
    return null;
  }

  // Convert to centimes and round to avoid floating point issues
  return Math.round(parsed * 100);
}

/**
 * Clean input to only allow valid currency characters
 * Always preserves minus for validation at blur time
 */
function cleanInput(input: string): string {
  // Allow: digits, comma, dot, spaces, and minus (filtering happens at blur)
  const pattern = /[^\d,.\s-]/g;
  let cleaned = input.replace(pattern, '');

  // Only allow one decimal separator
  const parts = cleaned.split(/[,.]/).filter(Boolean);
  if (parts.length > 2) {
    // Keep only first part and limit decimals to 2
    cleaned = parts[0] + ',' + parts.slice(1).join('').slice(0, 2);
  }

  return cleaned;
}

function CurrencyInput({
  className,
  value,
  onChange,
  showSymbol = true,
  allowNegative = false,
  onFocus,
  onBlur,
  ...props
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState(() => formatToDisplay(value));
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update display when external value changes (and not focused)
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatToDisplay(value));
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Clear formatting: show plain number with comma decimal
    const euros = (value / 100).toFixed(2).replace('.', ',');
    setDisplayValue(euros);
    // Select all text for easy editing
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    // Parse and validate
    const parsed = parseFromDisplay(displayValue);
    // Check if input contained a minus sign (for negative rejection when not allowed)
    const hadMinus = displayValue.includes('-');
    const isValidNegative = allowNegative || !hadMinus;

    if (parsed !== null && isValidNegative && (allowNegative || parsed >= 0)) {
      onChange(parsed);
      setDisplayValue(formatToDisplay(parsed));
    } else {
      // Reset to previous valid value
      setDisplayValue(formatToDisplay(value));
    }
    onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = cleanInput(e.target.value);
    setDisplayValue(cleaned);
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        data-slot="input"
        className={cn(
          'text-foreground file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
          'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          'text-right',
          showSymbol && 'pr-8'
        )}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />
      {showSymbol && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          €
        </span>
      )}
    </div>
  );
}

export { CurrencyInput };
export type { CurrencyInputProps };
