/**
 * Batch Sync API Route - Story 3.9
 * Handles batch synchronization of multiple items to Supabase
 *
 * POST /api/sync
 * Body: { items: SyncPayloadItem[] }
 * Response: { success: true, results: SyncResultItem[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Payload for a single sync item
 */
interface SyncPayloadItem {
  /** Local queue item ID */
  queueId: number;
  /** Action to perform */
  action: 'create' | 'validate' | 'cancel' | 'ocr';
  /** Entity type being synced */
  entityType: 'ticket' | 'photo' | 'market';
  /** Local entity ID */
  entityId: number;
  /** JSON stringified payload data */
  payload: string;
}

/**
 * Result for a single sync item
 */
interface SyncResultItem {
  /** Local queue item ID */
  queueId: number;
  /** Sync status */
  status: 'completed' | 'failed';
  /** Server-assigned ID (for creates) */
  serverId?: number;
  /** Error message if failed */
  error?: string;
}

/**
 * API Response type
 */
interface SyncResponse {
  success: boolean;
  results?: SyncResultItem[];
  error?: string;
}

/**
 * Validate the request body
 */
function validateRequest(body: unknown): SyncPayloadItem[] | null {
  if (!body || typeof body !== 'object') return null;

  const { items } = body as { items?: unknown };

  if (!Array.isArray(items) || items.length === 0) return null;

  // Validate each item
  for (const item of items) {
    if (
      typeof item !== 'object' ||
      typeof item.queueId !== 'number' ||
      typeof item.action !== 'string' ||
      typeof item.entityType !== 'string' ||
      typeof item.entityId !== 'number' ||
      typeof item.payload !== 'string'
    ) {
      return null;
    }
  }

  return items as SyncPayloadItem[];
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

/**
 * Sync a single ticket to Supabase
 */
async function syncTicket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  action: string,
  payload: string
): Promise<{ serverId?: number; error?: string }> {
  try {
    const data = JSON.parse(payload);

    if (action === 'create' || action === 'validate') {
      // Transform to snake_case for Supabase
      const ticketData = toSnakeCase({
        userId,
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
        marketId: data.marketId,
      });

      const { data: result, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('id')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { serverId: result.id };
    }

    if (action === 'cancel') {
      // For cancel action, we insert a new record with cancelled status (NF525 append-only)
      const ticketData = toSnakeCase({
        userId,
        dataHash: data.dataHash,
        type: data.type,
        status: 'cancelled',
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
        cancelledAt: data.cancelledAt,
        cancellationReason: data.cancellationReason,
        marketId: data.marketId,
      });

      const { data: result, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select('id')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { serverId: result.id };
    }

    return { error: `Unknown action: ${action}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Sync a single market to Supabase
 */
async function syncMarket(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  action: string,
  payload: string
): Promise<{ serverId?: number; error?: string }> {
  try {
    const data = JSON.parse(payload);

    if (action === 'create') {
      const marketData = toSnakeCase({
        userId,
        name: data.name,
        createdAt: data.createdAt,
      });

      const { data: result, error } = await supabase
        .from('markets')
        .insert(marketData)
        .select('id')
        .single();

      if (error) {
        return { error: error.message };
      }

      return { serverId: result.id };
    }

    return { error: `Unknown action for market: ${action}` };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

/**
 * Process a single sync item
 */
async function processSyncItem(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  item: SyncPayloadItem
): Promise<SyncResultItem> {
  let result: { serverId?: number; error?: string };

  switch (item.entityType) {
    case 'ticket':
      result = await syncTicket(supabase, userId, item.action, item.payload);
      break;
    case 'market':
      result = await syncMarket(supabase, userId, item.action, item.payload);
      break;
    case 'photo':
      // Photos are synced via separate endpoint due to binary data
      result = { error: 'Use /api/sync/photos for photo uploads' };
      break;
    default:
      result = { error: `Unknown entity type: ${item.entityType}` };
  }

  if (result.error) {
    return {
      queueId: item.queueId,
      status: 'failed',
      error: result.error,
    };
  }

  return {
    queueId: item.queueId,
    status: 'completed',
    serverId: result.serverId,
  };
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
        { success: false, error: 'Non authentifié' } satisfies SyncResponse,
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json().catch(() => null);
    const items = validateRequest(body);

    if (!items) {
      return NextResponse.json(
        { success: false, error: 'Corps de requête invalide' } satisfies SyncResponse,
        { status: 400 }
      );
    }

    // Process each item
    const results: SyncResultItem[] = [];
    for (const item of items) {
      const result = await processSyncItem(supabase, user.id, item);
      results.push(result);
    }

    return NextResponse.json({
      success: true,
      results,
    } satisfies SyncResponse);
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la synchronisation',
      } satisfies SyncResponse,
      { status: 500 }
    );
  }
}
