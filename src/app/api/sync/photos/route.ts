/**
 * Photo Sync API Route - Story 3.9
 * Handles photo upload to Supabase Storage
 *
 * POST /api/sync/photos
 * Body: FormData with photoId, ticketId, image (base64)
 * Response: { success: true, data: { storagePath } }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * API Response type
 */
interface PhotoSyncResponse {
  success: boolean;
  data?: {
    storagePath: string;
    publicUrl?: string;
  };
  error?: string;
}

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate base64 image and extract data
 */
function validateBase64Image(
  base64: string
): { data: Buffer; contentType: string } | null {
  // Check for data URL format
  const dataUrlMatch = base64.match(/^data:([^;]+);base64,(.+)$/);

  if (dataUrlMatch) {
    const [, contentType, data] = dataUrlMatch;
    if (!['image/webp', 'image/jpeg', 'image/png'].includes(contentType)) {
      return null;
    }
    try {
      return { data: Buffer.from(data, 'base64'), contentType };
    } catch {
      return null;
    }
  }

  // Try plain base64
  try {
    const buffer = Buffer.from(base64, 'base64');
    // Default to webp (our primary format)
    return { data: buffer, contentType: 'image/webp' };
  } catch {
    return null;
  }
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
        { success: false, error: 'Non authentifié' } satisfies PhotoSyncResponse,
        { status: 401 }
      );
    }

    // Parse request body (JSON with base64 image)
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Corps de requête invalide' } satisfies PhotoSyncResponse,
        { status: 400 }
      );
    }

    const { photoId, ticketId, image } = body as {
      photoId?: unknown;
      ticketId?: unknown;
      image?: unknown;
    };

    if (typeof photoId !== 'number' || typeof ticketId !== 'number') {
      return NextResponse.json(
        { success: false, error: 'photoId et ticketId requis' } satisfies PhotoSyncResponse,
        { status: 400 }
      );
    }

    if (typeof image !== 'string' || image.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Image requise (base64)' } satisfies PhotoSyncResponse,
        { status: 400 }
      );
    }

    // Validate and extract image data
    const imageData = validateBase64Image(image);
    if (!imageData) {
      return NextResponse.json(
        { success: false, error: 'Format image invalide' } satisfies PhotoSyncResponse,
        { status: 400 }
      );
    }

    // Check file size
    if (imageData.data.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Image trop volumineuse (max 5MB)' } satisfies PhotoSyncResponse,
        { status: 413 }
      );
    }

    // Generate storage path: ticket-photos/{userId}/{ticketId}/{photoId}.webp
    const extension = imageData.contentType === 'image/jpeg' ? 'jpg' : 'webp';
    const storagePath = `${user.id}/${ticketId}/${photoId}.${extension}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('ticket-photos')
      .upload(storagePath, imageData.data, {
        contentType: imageData.contentType,
        upsert: false, // Don't overwrite existing files (NF525 compliance)
      });

    if (uploadError) {
      // If file already exists, consider it a success (idempotent)
      if (uploadError.message.includes('already exists')) {
        const {
          data: { publicUrl },
        } = supabase.storage.from('ticket-photos').getPublicUrl(storagePath);

        return NextResponse.json({
          success: true,
          data: {
            storagePath,
            publicUrl,
          },
        } satisfies PhotoSyncResponse);
      }

      console.error('Supabase storage error:', uploadError);
      return NextResponse.json(
        { success: false, error: uploadError.message } satisfies PhotoSyncResponse,
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from('ticket-photos').getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      data: {
        storagePath,
        publicUrl,
      },
    } satisfies PhotoSyncResponse);
  } catch (error) {
    console.error('Photo sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de l'upload de la photo",
      } satisfies PhotoSyncResponse,
      { status: 500 }
    );
  }
}
