/**
 * OCR API Route for Z-Scanner
 * Processes Z-ticket (Statistique Totaux) images using Claude 3.5 Haiku Vision API
 *
 * POST /api/ocr
 * Body: { image: string (base64) }
 * Response: OcrResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAnthropicClient, OCR_MODEL, OCR_MAX_TOKENS } from '@/lib/ocr/anthropic';
import { EXTRACTION_PROMPT } from '@/lib/ocr/prompts';
import type {
  OcrResult,
  OcrResponse,
  OcrConfidence,
  TicketType,
  PaymentMode,
  Payment,
} from '@/lib/ocr/types';
import { createEmptyConfidence } from '@/lib/ocr/types';

/**
 * Maximum request body size (20MB)
 * Prevents large payloads from overwhelming the server
 */
const MAX_BODY_SIZE = 20 * 1024 * 1024;

/**
 * Valid ticket types
 */
const VALID_TICKET_TYPES: TicketType[] = ['STATISTIQUES', 'PLU', 'PLU-GROUPES', 'OPERATEUR'];

/**
 * Valid payment modes
 */
const VALID_PAYMENT_MODES: PaymentMode[] = ['CB', 'ESPECES', 'CHEQUE', 'VIREMENT'];

/**
 * Validate request body
 */
function validateRequest(body: unknown): { image: string } | null {
  if (!body || typeof body !== 'object') return null;

  const { image } = body as { image?: unknown };

  if (!image || typeof image !== 'string') return null;
  if (image.length === 0) return null;

  // Check if it's valid base64 (rough check)
  if (!/^[A-Za-z0-9+/=]+$/.test(image.replace(/\s/g, ''))) return null;

  return { image };
}

/**
 * Parse Claude response into OcrResult
 */
function parseOcrResponse(text: string): OcrResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Parse payments array
    const payments: Payment[] = [];
    if (Array.isArray(parsed.payments)) {
      for (const payment of parsed.payments) {
        const mode = validatePaymentMode(payment?.mode);
        const value = typeof payment?.value === 'number' ? payment.value : null;
        if (mode && value !== null) {
          payments.push({ mode, value });
        }
      }
    }

    // Validate and normalize the response
    return {
      type: validateTicketType(parsed.type),
      impressionDate: typeof parsed.impressionDate === 'string' ? parsed.impressionDate : null,
      lastResetDate: typeof parsed.lastResetDate === 'string' ? parsed.lastResetDate : null,
      resetNumber: typeof parsed.resetNumber === 'number' ? parsed.resetNumber : null,
      ticketNumber: typeof parsed.ticketNumber === 'number' ? parsed.ticketNumber : null,
      discountValue: typeof parsed.discountValue === 'number' ? parsed.discountValue : null,
      cancelValue: typeof parsed.cancelValue === 'number' ? parsed.cancelValue : null,
      cancelNumber: typeof parsed.cancelNumber === 'number' ? parsed.cancelNumber : null,
      payments,
      total: typeof parsed.total === 'number' ? parsed.total : null,
      confidence: parseConfidence(parsed.confidence),
    };
  } catch {
    // Return empty result with zero confidence if parsing fails
    return {
      type: null,
      impressionDate: null,
      lastResetDate: null,
      resetNumber: null,
      ticketNumber: null,
      discountValue: null,
      cancelValue: null,
      cancelNumber: null,
      payments: [],
      total: null,
      confidence: createEmptyConfidence(),
    };
  }
}

/**
 * Parse confidence object from response
 */
function parseConfidence(confidence: unknown): OcrConfidence {
  if (!confidence || typeof confidence !== 'object') {
    return createEmptyConfidence();
  }

  const c = confidence as Record<string, unknown>;

  return {
    type: normalizeConfidence(c.type),
    impressionDate: normalizeConfidence(c.impressionDate),
    lastResetDate: normalizeConfidence(c.lastResetDate),
    resetNumber: normalizeConfidence(c.resetNumber),
    ticketNumber: normalizeConfidence(c.ticketNumber),
    discountValue: normalizeConfidence(c.discountValue),
    cancelValue: normalizeConfidence(c.cancelValue),
    cancelNumber: normalizeConfidence(c.cancelNumber),
    payments: normalizeConfidence(c.payments),
    total: normalizeConfidence(c.total),
  };
}

/**
 * Validate ticket type enum
 */
function validateTicketType(value: unknown): TicketType | null {
  if (typeof value === 'string' && VALID_TICKET_TYPES.includes(value as TicketType)) {
    return value as TicketType;
  }
  return null;
}

/**
 * Validate payment mode enum
 */
function validatePaymentMode(value: unknown): PaymentMode | null {
  if (typeof value === 'string' && VALID_PAYMENT_MODES.includes(value as PaymentMode)) {
    return value as PaymentMode;
  }
  return null;
}

/**
 * Normalize confidence score to 0-1 range
 */
function normalizeConfidence(value: unknown): number {
  if (typeof value !== 'number') return 0;
  return Math.max(0, Math.min(1, value));
}

/**
 * Determine media type from base64 image
 * Defaults to webp if no signature detected
 */
function detectMediaType(
  base64: string
): 'image/webp' | 'image/jpeg' | 'image/png' | 'image/gif' {
  // Check first few characters of base64 for magic bytes
  const decoded = Buffer.from(base64.substring(0, 16), 'base64');

  // JPEG: FFD8FF
  if (decoded[0] === 0xff && decoded[1] === 0xd8 && decoded[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89504E47
  if (
    decoded[0] === 0x89 &&
    decoded[1] === 0x50 &&
    decoded[2] === 0x4e &&
    decoded[3] === 0x47
  ) {
    return 'image/png';
  }

  // GIF: 474946
  if (decoded[0] === 0x47 && decoded[1] === 0x49 && decoded[2] === 0x46) {
    return 'image/gif';
  }

  // WebP: 52494646...57454250 (RIFF...WEBP)
  if (
    decoded[0] === 0x52 &&
    decoded[1] === 0x49 &&
    decoded[2] === 0x46 &&
    decoded[3] === 0x46
  ) {
    return 'image/webp';
  }

  // Default to webp (our primary format)
  return 'image/webp';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image trop volumineuse (max 20MB)' } satisfies OcrResponse,
        { status: 413 }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);
    const validated = validateRequest(body);

    if (!validated) {
      return NextResponse.json(
        { success: false, error: 'Image requise (base64)' } satisfies OcrResponse,
        { status: 400 }
      );
    }

    const { image } = validated;
    const mediaType = detectMediaType(image);

    // Get Anthropic client
    const anthropic = getAnthropicClient();

    // Call Claude 3.5 Haiku Vision API
    const message = await anthropic.messages.create({
      model: OCR_MODEL,
      max_tokens: OCR_MAX_TOKENS,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image,
              },
            },
            {
              type: 'text',
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
    });

    // Extract text from response
    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        { success: false, error: "Réponse inattendue de l'API" } satisfies OcrResponse,
        { status: 500 }
      );
    }

    // Parse the OCR result
    const result = parseOcrResponse(content.text);

    return NextResponse.json({
      success: true,
      data: result,
    } satisfies OcrResponse);
  } catch (error) {
    console.error('OCR API error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('ANTHROPIC_API_KEY')) {
        return NextResponse.json(
          { success: false, error: 'Configuration API manquante' } satisfies OcrResponse,
          { status: 500 }
        );
      }

      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        return NextResponse.json(
          { success: false, error: 'Trop de requêtes, réessayez dans quelques instants' } satisfies OcrResponse,
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Erreur lors de l'analyse du ticket" } satisfies OcrResponse,
      { status: 500 }
    );
  }
}
