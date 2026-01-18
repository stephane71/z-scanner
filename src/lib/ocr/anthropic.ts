/**
 * Anthropic SDK initialization for Claude 3.5 Haiku Vision API
 * Server-side only - NEVER import this file on the client
 */

import Anthropic from '@anthropic-ai/sdk';

/**
 * Get Anthropic client instance
 * Uses ANTHROPIC_API_KEY environment variable
 * @throws Error if API key is not configured
 */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      'ANTHROPIC_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.'
    );
  }

  return new Anthropic({
    apiKey,
  });
}

/**
 * Claude model to use for OCR
 * Using Claude 3.5 Haiku for cost-effective vision processing
 */
export const OCR_MODEL = 'claude-3-5-haiku-20241022';

/**
 * Maximum tokens for OCR response
 * JSON extraction typically requires ~200-500 tokens
 */
export const OCR_MAX_TOKENS = 1024;
