/**
 * Z-Scanner Design Tokens
 *
 * These tokens mirror the CSS custom properties defined in globals.css
 * for use in JavaScript/TypeScript contexts (e.g., dynamic styling, charts).
 *
 * IMPORTANT: Keep in sync with src/app/globals.css @theme definitions
 */

export const colors = {
  // Emotional Design Colors
  primary: '#16A34A',        // Green - Validation, soulagement
  primaryHover: '#15803D',   // Darker green for hover
  trust: '#1D4ED8',          // Blue - NF525 badge, confiance
  trustHover: '#1E40AF',     // Darker blue for hover
  danger: '#DC2626',         // Red - Annulation, erreurs
  dangerHover: '#B91C1C',    // Darker red for hover
  warning: '#F59E0B',        // Orange - Sync pending

  // Neutral Colors
  background: '#FFFFFF',
  surface: '#F8FAFC',
  foreground: '#0F172A',
  muted: '#64748B',
  mutedForeground: '#94A3B8',
  border: '#E2E8F0',
} as const;

export const spacing = {
  // Touch Targets - Mobile UX (per Apple/Google guidelines)
  minTouch: '48px',
  buttonPrimary: '64px',
  buttonHero: '80px',

  // Spacing
  marginScreen: '16px',
} as const;

export const radius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  thumb: '12px',
} as const;

export const typography = {
  fontSans: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
} as const;

// Dark mode variants
export const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  foreground: '#F8FAFC',
  muted: '#94A3B8',
  mutedForeground: '#64748B',
  border: '#334155',
} as const;
