import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Scanner - Z-Scanner',
  description: 'Scanner de tickets pour professionnels des marchés',
  robots: 'noindex',
}

/**
 * Scan page - Main app home for authenticated users.
 *
 * This is a placeholder page that will be fully implemented in Epic 3.
 * @see Story 3.2 (camera-capture-ui) - Camera capture interface
 * @see Story 3.3 (ocr-processing-tesseract-js) - OCR processing
 */
export default function ScanPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Scanner</h1>

      <div
        className="rounded-lg border border-border bg-muted/50 p-6 text-center"
        role="status"
        aria-label="Fonctionnalité en cours de développement"
      >
        <p className="text-muted-foreground mb-4">
          Scanner de tickets en cours de développement
        </p>
        <p className="text-sm text-muted-foreground">
          Cette fonctionnalité sera disponible dans Epic 3
        </p>
      </div>

      {/* Camera capture will be added in Story 3.2 */}
      {/* OCR processing will be added in Story 3.3 */}
      {/* Verification screen will be added in Story 3.4 */}
    </div>
  )
}
