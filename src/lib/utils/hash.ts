/**
 * Hash utility functions
 * Shared cryptographic utilities for NF525 compliance
 */

/**
 * Generate SHA-256 hash for NF525 compliance
 * Hash is computed from ticket data for integrity verification.
 *
 * @param data - String data to hash (e.g., "date|total|type|status|userId")
 * @returns Hex-encoded SHA-256 hash (64 characters)
 *
 * @example
 * ```ts
 * const hashInput = `${date}|${total}|${type}|${status}|${userId}`;
 * const dataHash = await generateDataHash(hashInput);
 * ```
 */
export async function generateDataHash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
