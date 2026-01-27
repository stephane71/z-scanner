/**
 * Analytics Page - Server Component
 * Story 6.3 Enhancement: Dedicated analytics page
 *
 * Provides a dedicated page for viewing business statistics and analytics.
 * Renders the AnalyticsPageClient component which handles:
 * - Date range filtering
 * - Market filtering
 * - Dashboard summary card (Story 6.1)
 * - Sales by period card (Story 6.2)
 * - Sales by market card (Story 6.3)
 */

import { Suspense } from 'react';
import { AnalyticsPageClient } from './AnalyticsPageClient';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <AnalyticsPageClient />
    </Suspense>
  );
}

/**
 * Skeleton loader for analytics page
 */
function AnalyticsPageSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Filter skeleton */}
      <div className="flex items-center gap-2">
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      </div>
      {/* Card skeletons */}
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-48 bg-muted animate-pulse rounded-lg" />
      <div className="h-48 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
