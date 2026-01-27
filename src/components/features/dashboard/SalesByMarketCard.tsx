/**
 * Sales by Market Card Component
 * Story 6.3: Sales by Market
 *
 * Displays sales statistics grouped by market with clickable rows
 * that navigate to filtered ticket list.
 */

'use client';

import { MapPin, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalesByMarket } from '@/hooks';
import { MarketRow } from './MarketRow';

interface SalesByMarketCardProps {
  userId: string;
  /** Optional start date filter (YYYY-MM-DD), defaults to current month */
  startDate?: string | null;
  /** Optional end date filter (YYYY-MM-DD), defaults to current month */
  endDate?: string | null;
}

/**
 * Loading skeleton for SalesByMarketCard
 */
export function SalesByMarketLoadingSkeleton() {
  return (
    <Card data-testid="sales-by-market-skeleton">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no sales data
 */
function EmptyState() {
  return (
    <div className="py-6 text-center">
      <Package className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <p className="mt-2 text-sm text-muted-foreground">
        Aucune vente sur cette période
      </p>
    </div>
  );
}

/**
 * Sales by Market Card - displays market-based sales statistics
 * Respects date filter when provided.
 */
export function SalesByMarketCard({ userId, startDate, endDate }: SalesByMarketCardProps) {
  const { markets, unassigned, isLoading } = useSalesByMarket(userId, startDate, endDate);

  if (isLoading) {
    return <SalesByMarketLoadingSkeleton />;
  }

  const hasMarkets = markets.length > 0;
  const hasUnassigned = unassigned.ticketCount > 0;
  const isEmpty = !hasMarkets && !hasUnassigned;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>Ventes par marché</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="divide-y">
            {markets.map((market) => (
              <MarketRow key={market.marketId} stats={market} />
            ))}
            {hasUnassigned && (
              <MarketRow stats={unassigned} isUnassigned />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
