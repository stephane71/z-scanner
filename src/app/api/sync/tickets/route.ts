/**
 * Ticket Sync API Route - Story 3.9
 * Handles individual ticket synchronization to Supabase
 *
 * POST /api/sync/tickets
 * Body: { localId, action, data }
 * Response: { success: true, data: { serverId } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Ticket, Payment } from '@/types';

/**
 * Request body for ticket sync
 */
interface TicketSyncRequest {
  /** Local ticket ID */
  localId: number;
  /** Sync action */
  action: 'create' | 'validate' | 'cancel';
  /** Ticket data to sync */
  data: {
    dataHash: string;
    type: string;
    status: string;
    impressionDate: string;
    lastResetDate: string;
    resetNumber: number;
    ticketNumber: number;
    discountValue: number;
    cancelValue: number;
    cancelNumber: number;
    payments: Payment[];
    total: number;
    clientTimestamp: string;
    validatedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    marketId?: number;
  };
}

/**
 * API Response type
 */
interface TicketSyncResponse {
  success: boolean;
  data?: {
    serverId: number;
    serverTimestamp: string;
  };
  error?: string;
}

/**
 * Validate the request body
 */
function validateRequest(body: unknown): TicketSyncRequest | null {
  if (!body || typeof body !== 'object') return null;

  const { localId, action, data } = body as {
    localId?: unknown;
    action?: unknown;
    data?: unknown;
  };

  if (typeof localId !== 'number') return null;
  if (!['create', 'validate', 'cancel'].includes(action as string)) return null;
  if (!data || typeof data !== 'object') return null;

  const ticketData = data as TicketSyncRequest['data'];

  // Validate required fields
  if (typeof ticketData.dataHash !== 'string') return null;
  if (typeof ticketData.type !== 'string') return null;
  if (typeof ticketData.status !== 'string') return null;
  if (typeof ticketData.total !== 'number') return null;

  return { localId, action: action as 'create' | 'validate' | 'cancel', data: ticketData };
}

/**
 * Transform camelCase to snake_case for Supabase
 */
function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Create Supabase client with auth context
    const supabase = await createClient();

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' } satisfies TicketSyncResponse,
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json().catch(() => null);
    const validated = validateRequest(body);

    if (!validated) {
      return NextResponse.json(
        { success: false, error: 'Corps de requête invalide' } satisfies TicketSyncResponse,
        { status: 400 }
      );
    }

    const { data } = validated;

    // Prepare ticket data for Supabase (snake_case)
    const ticketData = toSnakeCase({
      userId: user.id,
      dataHash: data.dataHash,
      type: data.type,
      status: data.status,
      impressionDate: data.impressionDate,
      lastResetDate: data.lastResetDate,
      resetNumber: data.resetNumber,
      ticketNumber: data.ticketNumber,
      discountValue: data.discountValue,
      cancelValue: data.cancelValue,
      cancelNumber: data.cancelNumber,
      payments: data.payments,
      total: data.total,
      clientTimestamp: data.clientTimestamp,
      validatedAt: data.validatedAt,
      cancelledAt: data.cancelledAt,
      cancellationReason: data.cancellationReason,
      marketId: data.marketId,
    });

    // Insert ticket into Supabase (NF525: always insert, never update)
    const { data: result, error } = await supabase
      .from('tickets')
      .insert(ticketData)
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: error.message } satisfies TicketSyncResponse,
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        serverId: result.id,
        serverTimestamp: result.created_at,
      },
    } satisfies TicketSyncResponse);
  } catch (error) {
    console.error('Ticket sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la synchronisation du ticket',
      } satisfies TicketSyncResponse,
      { status: 500 }
    );
  }
}
