/**
 * Verification Page - Server Component
 * Story 3.4: Verification Screen
 *
 * Server component wrapper that renders the client verification page.
 * Extracts ticket ID from route params and passes to client component.
 */

import { VerifyPageClient } from './VerifyPageClient';

interface VerifyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { id } = await params;

  // Parse ticket ID from route params
  const ticketId = parseInt(id, 10);

  // Validate that ID is a valid number
  if (isNaN(ticketId) || ticketId <= 0) {
    // Invalid ID - client component will handle redirect
    return <VerifyPageClient ticketId={-1} />;
  }

  return <VerifyPageClient ticketId={ticketId} />;
}
