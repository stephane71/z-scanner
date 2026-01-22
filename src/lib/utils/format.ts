/**
 * Formatting utilities for dates and currency
 * Centralized formatters to prevent duplication across components
 */

/**
 * Format ISO date string to French locale (dd/MM/yyyy)
 * @param isoDate - ISO 8601 date string
 * @returns Formatted date string
 */
export function formatDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Format ISO datetime string to French locale (dd/MM/yyyy HH:mm)
 * @param isoDate - ISO 8601 datetime string
 * @returns Formatted datetime string
 */
export function formatDateTime(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

/**
 * Format centimes to euro currency display (1250 → "12,50 €")
 * @param centimes - Amount in centimes (integer)
 * @returns Formatted currency string
 */
export function formatCurrency(centimes: number): string {
  const euros = centimes / 100;
  return euros.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}
