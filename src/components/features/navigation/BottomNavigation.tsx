/**
 * BottomNavigation Component - Story 3.10
 * App Layout & Bottom Navigation
 *
 * Provides bottom tab bar for main app sections:
 * - Scanner (Camera icon) - /scan
 * - Historique (List icon) - /tickets
 * - Export (Download icon) - /export
 * - Paramètres (Settings icon) - /settings
 *
 * Features:
 * - Fixed bottom positioning with safe area handling
 * - Touch targets 48px minimum (AC: #1, #3)
 * - Active tab highlighting (AC: #1, #2)
 * - Client-side navigation with Next.js Link (AC: #2, #4)
 * - Nested route support (AC: #2)
 * - Accessibility: aria-current, aria-labels
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Camera, List, Download, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation items configuration
 * Each item maps to a main app section
 */
const navItems = [
  { href: '/scan', icon: Camera, label: 'Scanner' },
  { href: '/tickets', icon: List, label: 'Historique' },
  { href: '/export', icon: Download, label: 'Export' },
  { href: '/settings', icon: Settings, label: 'Paramètres' },
] as const;

/**
 * Check if a pathname matches the given route
 * Handles exact matches and nested routes (e.g., /tickets/123)
 */
function isActiveRoute(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      role="navigation"
      aria-label="Navigation principale"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = isActiveRoute(pathname, href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={cn(
                // Base styles - touch targets and centering
                'flex flex-col items-center justify-center w-full h-full min-h-[48px]',
                // Transition for smooth active state change
                'transition-colors duration-150',
                // Focus visible state for keyboard navigation
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                // Active/inactive color states
                isActive
                  ? 'text-primary' // Green (#16A34A)
                  : 'text-muted-foreground hover:text-foreground' // Gray (#64748B) -> dark on hover
              )}
            >
              <Icon className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
