/**
 * Manual Entry Page - Server Component
 * Story 3.5: Manual Entry Fallback
 *
 * Server component wrapper that renders the client manual entry page.
 * Provides direct access to manual ticket entry without photo capture.
 */

import { ManualEntryClient } from './ManualEntryClient';

export default function ManualEntryPage() {
  return <ManualEntryClient />;
}
