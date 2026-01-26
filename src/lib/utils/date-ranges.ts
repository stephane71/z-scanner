/**
 * Date range utilities for export period selection
 * Story 5.1: Export Page & Period Selection
 *
 * Provides helper functions to calculate common date ranges
 * for export presets (Ce mois, Mois dernier, etc.)
 */

/** Date range with start and end in YYYY-MM-DD format */
export interface DateRange {
  start: string;
  end: string;
}

/** Export preset identifiers */
export type ExportPreset =
  | 'this-month'
  | 'last-month'
  | 'this-quarter'
  | 'last-quarter'
  | 'this-year'
  | 'custom';

/** Preset configuration with label and getter */
export interface PresetConfig {
  id: ExportPreset;
  label: string;
  getRange: () => DateRange;
}

/**
 * Format a date as YYYY-MM-DD in local timezone (avoids UTC conversion issues)
 */
function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get the first and last day of the current month
 */
export function getThisMonth(): DateRange {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // First day of month
  const startDay = 1;
  // Last day of month (day 0 of next month = last day of current month)
  const lastDay = new Date(year, month + 1, 0).getDate();

  const monthStr = String(month + 1).padStart(2, '0');

  return {
    start: `${year}-${monthStr}-${String(startDay).padStart(2, '0')}`,
    end: `${year}-${monthStr}-${String(lastDay).padStart(2, '0')}`,
  };
}

/**
 * Get the first and last day of the previous month
 */
export function getLastMonth(): DateRange {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() - 1;

  // Handle January -> December of previous year
  if (month < 0) {
    month = 11;
    year -= 1;
  }

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: formatLocalDate(firstDay),
    end: formatLocalDate(lastDay),
  };
}

/**
 * Get the first and last day of the current quarter
 */
export function getThisQuarter(): DateRange {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), quarter * 3, 1);
  const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);

  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  };
}

/**
 * Get the first and last day of the previous quarter
 */
export function getLastQuarter(): DateRange {
  const now = new Date();
  let quarter = Math.floor(now.getMonth() / 3) - 1;
  let year = now.getFullYear();

  // Handle Q1 -> Q4 of previous year
  if (quarter < 0) {
    quarter = 3;
    year -= 1;
  }

  const start = new Date(year, quarter * 3, 1);
  const end = new Date(year, (quarter + 1) * 3, 0);

  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  };
}

/**
 * Get the first and last day of the current year
 */
export function getThisYear(): DateRange {
  const year = new Date().getFullYear();

  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
}

/**
 * Get all export presets configuration
 */
export function getExportPresets(): PresetConfig[] {
  return [
    { id: 'this-month', label: 'Ce mois', getRange: getThisMonth },
    { id: 'last-month', label: 'Mois dernier', getRange: getLastMonth },
    { id: 'this-quarter', label: 'Ce trimestre', getRange: getThisQuarter },
    { id: 'last-quarter', label: 'Trim. dernier', getRange: getLastQuarter },
    { id: 'this-year', label: 'Cette année', getRange: getThisYear },
  ];
}
