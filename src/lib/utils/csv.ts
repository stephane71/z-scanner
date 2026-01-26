/**
 * CSV generation utilities for export
 * Story 5.2: CSV Export Generation
 *
 * Generates French-compatible CSV files with:
 * - Semicolon delimiter (French Excel default)
 * - UTF-8 BOM for Excel compatibility
 * - CRLF line endings for Windows compatibility
 * - Proper quote escaping
 */

import type { ExportTicket } from "@/types";
import { formatDate, formatDateTime } from "./format";

/** UTF-8 BOM for Excel compatibility */
export const CSV_BOM = "\uFEFF";

/** Semicolon delimiter for French Excel */
export const CSV_DELIMITER = ";";

/** CRLF line endings for Windows compatibility */
export const CSV_LINE_ENDING = "\r\n";

/** CSV column headers */
const CSV_HEADERS = [
  "date",
  "montant_ttc",
  "mode_reglement",
  "numero_ticket",
  "marche",
  "statut",
  "hash",
  "validated_at",
];

/**
 * Format centimes to euros for CSV (no € symbol)
 * @param centimes - Amount in centimes
 * @returns String formatted as "12,50" (no thousands separator for CSV compatibility)
 */
export function formatCurrencyForCsv(centimes: number): string {
  const euros = centimes / 100;
  // Format with 2 decimal places, comma as decimal separator
  // Use fixed-point notation to avoid thousands separators (which use non-breaking space in French locale)
  const [intPart, decPart = "00"] = euros.toFixed(2).split(".");
  return `${intPart},${decPart}`;
}

/**
 * Escape a CSV field if it contains special characters
 * @param field - Field value to escape
 * @returns Escaped field value
 */
export function escapeCsvField(field: string): string {
  if (!field) return "";

  // Check if field needs quoting
  const needsQuoting =
    field.includes(CSV_DELIMITER) ||
    field.includes('"') ||
    field.includes("\n") ||
    field.includes("\r");

  if (needsQuoting) {
    // Double any existing quotes and wrap in quotes
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}

/**
 * Generate CSV string from export tickets
 * @param tickets - Array of tickets to export
 * @returns CSV string with BOM, headers, and data rows
 */
export function generateCsv(tickets: ExportTicket[]): string {
  const lines: string[] = [];

  // Add header row
  lines.push(CSV_HEADERS.join(CSV_DELIMITER));

  // Add data rows
  for (const ticket of tickets) {
    const row = [
      formatDate(ticket.date),
      formatCurrencyForCsv(ticket.montantTtc),
      escapeCsvField(ticket.modeReglement),
      ticket.numeroTicket.toString(),
      escapeCsvField(ticket.marche),
      ticket.statut,
      ticket.hash,
      ticket.validatedAt ? formatDateTime(ticket.validatedAt) : "",
    ];

    lines.push(row.join(CSV_DELIMITER));
  }

  // Join with CRLF and prepend BOM
  return CSV_BOM + lines.join(CSV_LINE_ENDING) + CSV_LINE_ENDING;
}
