/**
 * Tests for CSV generation utility
 * Story 5.2: CSV Export Generation
 */

import { describe, it, expect } from "vitest";
import {
  generateCsv,
  formatCurrencyForCsv,
  escapeCsvField,
  CSV_BOM,
  CSV_DELIMITER,
  CSV_LINE_ENDING,
} from "./csv";
import type { ExportTicket } from "@/types";

describe("CSV constants", () => {
  it("should have UTF-8 BOM", () => {
    expect(CSV_BOM).toBe("\uFEFF");
  });

  it("should use semicolon delimiter for French Excel", () => {
    expect(CSV_DELIMITER).toBe(";");
  });

  it("should use CRLF line endings for Windows compatibility", () => {
    expect(CSV_LINE_ENDING).toBe("\r\n");
  });
});

describe("formatCurrencyForCsv", () => {
  it("should format centimes to euros with comma decimal", () => {
    expect(formatCurrencyForCsv(1250)).toBe("12,50");
  });

  it("should format whole euros correctly", () => {
    expect(formatCurrencyForCsv(10000)).toBe("100,00");
  });

  it("should format zero correctly", () => {
    expect(formatCurrencyForCsv(0)).toBe("0,00");
  });

  it("should handle large amounts without thousands separator", () => {
    // CSV export uses no thousands separator for better software compatibility
    expect(formatCurrencyForCsv(123456)).toBe("1234,56");
  });

  it("should NOT include € symbol", () => {
    const result = formatCurrencyForCsv(1250);
    expect(result).not.toContain("€");
  });
});

describe("escapeCsvField", () => {
  it("should wrap field with quotes if it contains semicolon", () => {
    expect(escapeCsvField("Marché; Centre")).toBe('"Marché; Centre"');
  });

  it("should wrap field with quotes if it contains quotes", () => {
    expect(escapeCsvField('Marché "Test"')).toBe('"Marché ""Test"""');
  });

  it("should double internal quotes when escaping", () => {
    expect(escapeCsvField('Test "quoted" value')).toBe(
      '"Test ""quoted"" value"'
    );
  });

  it("should return field as-is if no special characters", () => {
    expect(escapeCsvField("Marché de Rungis")).toBe("Marché de Rungis");
  });

  it("should handle empty string", () => {
    expect(escapeCsvField("")).toBe("");
  });

  it("should wrap field with quotes if it contains newline", () => {
    expect(escapeCsvField("Line1\nLine2")).toBe('"Line1\nLine2"');
  });
});

describe("generateCsv", () => {
  const mockTickets: ExportTicket[] = [
    {
      date: "2026-01-26",
      montantTtc: 12550,
      modeReglement: "CB",
      numeroTicket: 1234,
      marche: "Marché de Rungis",
      statut: "Validé",
      hash: "abc123def456",
      validatedAt: "2026-01-26T14:30:00.000Z",
    },
    {
      date: "2026-01-25",
      montantTtc: 4500,
      modeReglement: "Espèces",
      numeroTicket: 1233,
      marche: "",
      statut: "Validé",
      hash: "def456ghi789",
      validatedAt: "2026-01-25T10:15:00.000Z",
    },
    {
      date: "2026-01-24",
      montantTtc: 8025,
      modeReglement: "CB",
      numeroTicket: 1232,
      marche: "Marché du Dimanche",
      statut: "Annulé",
      hash: "ghi789jkl012",
      validatedAt: "2026-01-24T09:00:00.000Z",
    },
  ];

  it("should generate correct CSV header", () => {
    const csv = generateCsv(mockTickets);
    const lines = csv.split(CSV_LINE_ENDING);

    // First line after BOM is header
    const header = lines[0].replace(CSV_BOM, "");
    expect(header).toBe(
      "date;montant_ttc;mode_reglement;numero_ticket;marche;statut;hash;validated_at"
    );
  });

  it("should include UTF-8 BOM at start", () => {
    const csv = generateCsv(mockTickets);
    expect(csv.startsWith(CSV_BOM)).toBe(true);
  });

  it("should use CRLF line endings", () => {
    const csv = generateCsv(mockTickets);
    // Should contain CRLF between lines
    expect(csv).toContain("\r\n");
    // Should NOT have bare LF (Unix-style)
    const withoutCrlf = csv.replace(/\r\n/g, "");
    expect(withoutCrlf).not.toContain("\n");
  });

  it("should format amounts as euros with comma decimal", () => {
    const csv = generateCsv(mockTickets);
    // First ticket: 12550 centimes = 125,50 euros
    expect(csv).toContain("125,50");
    // Second ticket: 4500 centimes = 45,00 euros
    expect(csv).toContain("45,00");
    // Third ticket: 8025 centimes = 80,25 euros
    expect(csv).toContain("80,25");
  });

  it("should format dates as dd/MM/yyyy", () => {
    const csv = generateCsv(mockTickets);
    expect(csv).toContain("26/01/2026");
    expect(csv).toContain("25/01/2026");
    expect(csv).toContain("24/01/2026");
  });

  it("should format validated_at as dd/MM/yyyy HH:mm", () => {
    const csv = generateCsv(mockTickets);
    // Check for datetime format pattern (dd/MM/yyyy HH:mm)
    // Times vary by timezone, so we check the format pattern exists
    const datetimePattern = /\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/g;
    const matches = csv.match(datetimePattern) || [];
    // Should have 3 datetime values (one per ticket)
    expect(matches.length).toBe(3);
  });

  it("should map status to French (Validé/Annulé)", () => {
    const csv = generateCsv(mockTickets);
    // Should have 2 Validé and 1 Annulé
    const validatedCount = (csv.match(/Validé/g) || []).length;
    const cancelledCount = (csv.match(/Annulé/g) || []).length;
    expect(validatedCount).toBe(2);
    expect(cancelledCount).toBe(1);
  });

  it("should handle empty market name", () => {
    const csv = generateCsv(mockTickets);
    // Second ticket has empty market - check for double semicolon in that row
    const lines = csv.split(CSV_LINE_ENDING);
    const secondDataLine = lines[2]; // Header + first data + second data
    expect(secondDataLine).toContain(";;"); // Empty market between numero_ticket and statut
  });

  it("should handle empty payments array (empty mode_reglement)", () => {
    const ticketWithNoPayment: ExportTicket = {
      date: "2026-01-20",
      montantTtc: 1000,
      modeReglement: "",
      numeroTicket: 1230,
      marche: "",
      statut: "Validé",
      hash: "xyz",
      validatedAt: "2026-01-20T12:00:00.000Z",
    };

    const csv = generateCsv([ticketWithNoPayment]);
    expect(csv).toContain("10,00;;1230"); // Empty mode_reglement
  });

  it("should escape semicolons in market names", () => {
    const ticketWithSemicolon: ExportTicket = {
      date: "2026-01-20",
      montantTtc: 1000,
      modeReglement: "CB",
      numeroTicket: 1230,
      marche: "Marché; Centre-Ville",
      statut: "Validé",
      hash: "xyz",
      validatedAt: "2026-01-20T12:00:00.000Z",
    };

    const csv = generateCsv([ticketWithSemicolon]);
    expect(csv).toContain('"Marché; Centre-Ville"');
  });

  it("should escape quotes in market names", () => {
    const ticketWithQuotes: ExportTicket = {
      date: "2026-01-20",
      montantTtc: 1000,
      modeReglement: "CB",
      numeroTicket: 1230,
      marche: 'Marché "Local"',
      statut: "Validé",
      hash: "xyz",
      validatedAt: "2026-01-20T12:00:00.000Z",
    };

    const csv = generateCsv([ticketWithQuotes]);
    expect(csv).toContain('"Marché ""Local"""');
  });

  it("should return empty CSV with only header for empty tickets array", () => {
    const csv = generateCsv([]);
    const lines = csv.split(CSV_LINE_ENDING).filter((line) => line.length > 0);
    // Should only have header (after removing BOM)
    expect(lines).toHaveLength(1);
    expect(lines[0].replace(CSV_BOM, "")).toBe(
      "date;montant_ttc;mode_reglement;numero_ticket;marche;statut;hash;validated_at"
    );
  });

  it("should generate correct number of lines", () => {
    const csv = generateCsv(mockTickets);
    const lines = csv.split(CSV_LINE_ENDING).filter((line) => line.length > 0);
    // 1 header + 3 data rows
    expect(lines).toHaveLength(4);
  });
});
