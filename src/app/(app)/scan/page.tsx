import type { Metadata } from 'next';
import { ScanPageClient } from './ScanPageClient';

export const metadata: Metadata = {
  title: 'Scanner - Z-Scanner',
  description: 'Scanner de tickets pour professionnels des marchés',
  robots: 'noindex',
};

/**
 * Scan page - Main app home for authenticated users.
 *
 * Direct to scanner per UX spec - camera viewfinder is displayed immediately.
 * @see Story 3.2 (camera-capture-ui) - Camera capture interface
 * @see Story 3.3 (ocr-processing-tesseract-js) - OCR processing
 * @see Story 3.4 (verification-screen) - Verification screen
 */
export default function ScanPage() {
  return <ScanPageClient />;
}
