'use client';

/**
 * AnalyticsPageClient - Client component for analytics/pilotage page
 * Story 6.3 Enhancement: Dedicated analytics page
 *
 * Provides a dedicated view for business statistics with:
 * - Dashboard summary card (Story 6.1)
 * - Sales by period card (Story 6.2)
 * - Sales by market card (Story 6.3)
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DashboardSummaryCard, SalesByPeriodCard, SalesByMarketCard } from '@/components/features/dashboard';

export function AnalyticsPageClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Get current user from Supabase
  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
      setAuthLoading(false);
    }
    getUser();
  }, []);

  // Show skeleton while loading auth
  if (authLoading) {
    return <AnalyticsPageSkeleton />;
  }

  // User not authenticated
  if (!userId) {
    return (
      <div className="py-4 px-4 text-center text-muted-foreground">
        Veuillez vous connecter pour voir les statistiques.
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-4">
      <DashboardSummaryCard userId={userId} />
      <SalesByPeriodCard userId={userId} />
      <SalesByMarketCard userId={userId} />
    </div>
  );
}

/**
 * Skeleton loader for analytics page content
 */
function AnalyticsPageSkeleton() {
  return (
    <div className="px-4 py-4 space-y-4">
      {/* Card skeletons */}
      <div className="h-32 bg-muted animate-pulse rounded-lg" />
      <div className="h-48 bg-muted animate-pulse rounded-lg" />
      <div className="h-48 bg-muted animate-pulse rounded-lg" />
    </div>
  );
}
