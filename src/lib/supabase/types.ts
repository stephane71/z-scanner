/**
 * Supabase Database Types
 *
 * This file will contain auto-generated TypeScript types for the Supabase database.
 *
 * To generate types from your Supabase schema, run:
 * ```bash
 * npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts
 * ```
 *
 * Or using the Supabase CLI:
 * ```bash
 * supabase gen types typescript --local > src/lib/supabase/types.ts
 * ```
 *
 * @see https://supabase.com/docs/guides/api/rest/generating-types
 *
 * TODO: Generate actual types when database schema is created in Story 3.1
 */

/**
 * Placeholder Database type - will be replaced with generated types
 * This allows type-safe client creation before schema exists
 */
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

/**
 * Helper type to extract table row types
 * Usage: type Ticket = Tables<'tickets'>
 */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Row: infer R } ? R : never

/**
 * Helper type to extract insert types (for creating new rows)
 * Usage: type NewTicket = TablesInsert<'tickets'>
 */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Insert: infer I } ? I : never

/**
 * Helper type to extract update types (for updating rows)
 * Usage: type TicketUpdate = TablesUpdate<'tickets'>
 */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T] extends { Update: infer U } ? U : never
