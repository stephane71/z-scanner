/**
 * Export types for Z-Scanner CSV export feature
 * Story 5.2: CSV Export Generation
 */

/**
 * Payment line data formatted for CSV export
 * One line per payment mode (a ticket with multiple payments generates multiple lines)
 * Joins ticket data with market name
 */
export interface ExportTicket {
  /** Impression date (YYYY-MM-DD) */
  date: string;
  /** Payment amount in centimes (not ticket total) */
  montantTtc: number;
  /** Payment mode for this line */
  modeReglement: string;
  /** Ticket number */
  numeroTicket: number;
  /** Market name (resolved from marketId) or empty string */
  marche: string;
  /** Ticket status: 'Validé' or 'Annulé' */
  statut: "Validé" | "Annulé";
  /** SHA-256 hash for NF525 */
  hash: string;
  /** Validation timestamp (ISO 8601) */
  validatedAt: string;
}

/**
 * Result from useExportTickets hook
 */
export interface UseExportTicketsResult {
  tickets: ExportTicket[];
  isLoading: boolean;
}

/**
 * Result from useGenerateExport hook
 */
export interface UseGenerateExportResult {
  /** Generate CSV string for the selected period */
  generateCsv: () => string | null;
  /** Whether CSV is currently being generated */
  isGenerating: boolean;
  /** Error message if generation failed */
  error: string | null;
}
