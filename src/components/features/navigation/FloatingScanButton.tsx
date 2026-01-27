/**
 * FloatingScanButton Component
 * Story 6.3 Enhancement: Floating action button for scanner access
 *
 * Provides quick access to the scanner page from anywhere in the app.
 * Features:
 * - Floating button positioned bottom-right, above the bottom navigation
 * - Hidden on the scanner page itself (/scan and nested routes)
 * - 56px touch target for easy mobile interaction
 * - Elevated with shadow for visual prominence
 * - Uses primary color for emphasis
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FloatingScanButton() {
  const pathname = usePathname();

  // Hide on scanner pages
  const isScanPage = pathname === '/scan' || pathname.startsWith('/scan/');

  if (isScanPage) {
    return null;
  }

  return (
    <Link
      href="/scan"
      aria-label="Ouvrir le scanner"
      className={cn(
        // Positioning: fixed, bottom-right, above bottom nav (nav is h-16 + safe area)
        'fixed z-60 right-4',
        // Size: 56px circle with centered content
        'w-14 h-14 rounded-full',
        // Flexbox for centering icon
        'flex items-center justify-center',
        // Colors: primary background with white icon
        'bg-primary text-primary-foreground',
        // Shadow for elevation
        'shadow-lg shadow-primary/25',
        // Hover and active states
        'hover:bg-primary/90 active:scale-95',
        // Transition
        'transition-all duration-150',
        // Focus state for accessibility
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
      // Position above nav: 64px (nav height) + 16px margin + safe area
      style={{ bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))' }}
    >
      <Camera className="h-6 w-6" aria-hidden="true" />
    </Link>
  );
}
