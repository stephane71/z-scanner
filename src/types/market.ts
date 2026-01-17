/**
 * Market types for Z-Scanner local database
 * Markets represent physical selling locations (marchés, points de vente)
 * NF525: Soft-delete pattern - markets are never truly deleted
 */

/**
 * Market entity stored in IndexedDB
 * Users can organize their tickets by market/location
 */
export interface Market {
  /** Auto-increment primary key (undefined before insert) */
  id?: number;
  /** Market name (e.g., "Marché de Rungis", "Marché du Dimanche") */
  name: string;
  /** Supabase auth.uid() of the market owner */
  userId: string;
  /** ISO 8601 timestamp when market was created */
  createdAt: string;
  /** ISO 8601 soft-delete timestamp (NF525: markets are never truly deleted) */
  deletedAt?: string;
}
