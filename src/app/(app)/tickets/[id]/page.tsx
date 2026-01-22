/**
 * Ticket Detail Page - Server component
 * Story 4.2: Ticket Detail View
 *
 * Dynamic route for viewing individual ticket details.
 * Renders TicketDetailClient for data fetching and display.
 */

import type { Metadata } from 'next';
import { TicketDetailClient } from './TicketDetailClient';

export const metadata: Metadata = {
  title: 'Détail du ticket | Z-Scanner',
  description: 'Consultez les détails complets de votre ticket Z validé',
};

export default function TicketDetailPage() {
  return <TicketDetailClient />;
}
