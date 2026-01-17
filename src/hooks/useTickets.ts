/**
 * React hooks for ticket operations with useLiveQuery
 * Provides reactive queries and CRUD operations for tickets
 *
 * @see https://dexie.org/docs/dexie-react-hooks/useLiveQuery()
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import type { Ticket, TicketStatus } from '@/types';

/**
 * Hook to get all tickets for a user with reactive updates
 * @param userId - Supabase auth.uid() of the user
 * @returns Object with tickets array and loading state
 */
export function useTickets(userId: string) {
  const tickets = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.tickets
        .where('userId')
        .equals(userId)
        .reverse()
        .sortBy('createdAt');
    },
    [userId]
  );

  return {
    tickets,
    isLoading: tickets === undefined,
  };
}

/**
 * Hook to get a single ticket by ID
 * @param id - Ticket ID to fetch
 * @returns Object with ticket and loading state
 */
export function useTicketById(id: number | undefined) {
  const ticket = useLiveQuery(
    async () => (id !== undefined ? db.tickets.get(id) : undefined),
    [id]
  );

  return {
    ticket,
    isLoading: ticket === undefined && id !== undefined,
  };
}

/**
 * Hook to get tickets filtered by status
 * @param userId - Supabase auth.uid() of the user
 * @param status - Ticket status to filter by
 * @returns Object with filtered tickets and loading state
 */
export function useTicketsByStatus(userId: string, status: TicketStatus) {
  const tickets = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.tickets
        .where({ userId, status })
        .reverse()
        .sortBy('createdAt');
    },
    [userId, status]
  );

  return {
    tickets,
    isLoading: tickets === undefined,
  };
}

/**
 * Hook to get tickets filtered by market
 * @param userId - Supabase auth.uid() of the user
 * @param marketId - Market ID to filter by
 * @returns Object with filtered tickets and loading state
 */
export function useTicketsByMarket(userId: string, marketId: number) {
  const tickets = useLiveQuery(
    async () => {
      if (!userId) return [];
      return db.tickets
        .where({ userId, marketId })
        .reverse()
        .sortBy('createdAt');
    },
    [userId, marketId]
  );

  return {
    tickets,
    isLoading: tickets === undefined,
  };
}

/**
 * Hook to get tickets count for a user
 * @param userId - Supabase auth.uid() of the user
 * @returns Object with count and loading state
 */
export function useTicketsCount(userId: string) {
  const count = useLiveQuery(
    async () => {
      if (!userId) return 0;
      return db.tickets.where('userId').equals(userId).count();
    },
    [userId]
  );

  return {
    count,
    isLoading: count === undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// CRUD Operations (non-reactive)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Add a new ticket to the database
 * NF525: This is an append-only operation
 * @param ticket - Ticket data to insert
 * @returns Promise with the new ticket ID
 */
export async function addTicket(ticket: Omit<Ticket, 'id'>): Promise<number> {
  const id = await db.tickets.add(ticket as Ticket);
  return id as number;
}

/**
 * Get a ticket by ID (non-reactive)
 * @param id - Ticket ID to fetch
 * @returns Promise with the ticket or undefined
 */
export async function getTicket(id: number): Promise<Ticket | undefined> {
  return db.tickets.get(id);
}

/**
 * Validate a draft ticket
 * NF525: Changes status from 'draft' to 'validated' (immutable after)
 * Uses transaction for atomicity to prevent race conditions
 * @param id - Ticket ID to validate
 * @returns Promise that resolves when complete
 */
export async function validateTicket(id: number): Promise<void> {
  await db.transaction('rw', db.tickets, async () => {
    const ticket = await db.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    if (ticket.status !== 'draft') {
      throw new Error(`Cannot validate ticket with status: ${ticket.status}`);
    }

    await db.tickets.update(id, {
      status: 'validated',
      validatedAt: new Date().toISOString(),
    });
  });
}

/**
 * Cancel a ticket
 * NF525: Changes status to 'cancelled' with required reason (immutable after)
 * Uses transaction for atomicity to prevent race conditions
 * @param id - Ticket ID to cancel
 * @param reason - Cancellation reason (required for NF525)
 * @returns Promise that resolves when complete
 */
export async function cancelTicket(id: number, reason: string): Promise<void> {
  if (!reason.trim()) {
    throw new Error('Cancellation reason is required (NF525 compliance)');
  }

  await db.transaction('rw', db.tickets, async () => {
    const ticket = await db.tickets.get(id);
    if (!ticket) throw new Error(`Ticket ${id} not found`);
    if (ticket.status === 'cancelled') {
      throw new Error('Ticket is already cancelled');
    }

    await db.tickets.update(id, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancellationReason: reason,
    });
  });
}
