'use client';

/**
 * DashboardSummaryCard - Activity summary card for the dashboard
 * Story 6.1: Activity Dashboard
 *
 * Displays three key metrics for the current month:
 * - Total validated tickets
 * - Total revenue
 * - Number of unique markets visited
 */

import Link from 'next/link';
import { Receipt, Euro, MapPin, Sparkles, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks';
import { formatCurrency } from '@/lib/utils/format';

interface DashboardSummaryCardProps {
  /** Supabase auth.uid() of the user */
  userId: string;
}

/**
 * Dashboard summary card showing activity metrics for the current month
 */
export function DashboardSummaryCard({ userId }: DashboardSummaryCardProps) {
  const { ticketsThisMonth, revenueThisMonth, marketsVisited, isLoading } =
    useDashboardStats(userId);

  const isEmpty = ticketsThisMonth === 0 && !isLoading;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Mon activité ce mois
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <DashboardLoadingSkeleton />
        ) : isEmpty ? (
          <DashboardEmptyState />
        ) : (
          <StatsGrid
            tickets={ticketsThisMonth}
            revenue={revenueThisMonth}
            markets={marketsVisited}
          />
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for dashboard stats
 * Exported for reuse in other dashboard components
 */
export function DashboardLoadingSkeleton() {
  return (
    <div
      data-testid="dashboard-skeleton"
      className="grid grid-cols-3 gap-4"
    >
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state encouraging first ticket scan
 * Exported for reuse in other dashboard components
 */
export function DashboardEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-4 text-center">
      <Sparkles className="h-8 w-8 text-muted-foreground mb-2" aria-hidden="true" />
      <p className="font-medium text-sm">Prêt à commencer !</p>
      <p className="text-muted-foreground text-xs mt-1 mb-3">
        Scannez votre premier ticket Z pour voir vos statistiques ici
      </p>
      <Link
        href="/scan"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors min-h-[48px]"
        data-testid="dashboard-scan-cta"
      >
        <Camera className="w-4 h-4" aria-hidden="true" />
        <span>Scanner un ticket</span>
      </Link>
    </div>
  );
}

interface StatsGridProps {
  tickets: number;
  revenue: number;
  markets: number;
}

/**
 * Grid displaying the three key metrics
 */
function StatsGrid({ tickets, revenue, markets }: StatsGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4" role="group" aria-label="Statistiques du mois">
      <StatItem
        icon={<Receipt className="h-4 w-4" />}
        value={tickets.toString()}
        label={tickets === 1 ? 'ticket' : 'tickets'}
        ariaLabel={`${tickets} ${tickets === 1 ? 'ticket' : 'tickets'} ce mois`}
      />
      <StatItem
        icon={<Euro className="h-4 w-4" />}
        value={formatCurrency(revenue)}
        label=""
        isRevenue
        ariaLabel={`Revenu: ${formatCurrency(revenue)}`}
      />
      <StatItem
        icon={<MapPin className="h-4 w-4" />}
        value={markets.toString()}
        label={markets === 1 ? 'marché' : 'marchés'}
        ariaLabel={`${markets} ${markets === 1 ? 'marché visité' : 'marchés visités'}`}
      />
    </div>
  );
}

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  isRevenue?: boolean;
  ariaLabel?: string;
}

/**
 * Individual stat item with icon, value, and label
 * Uses sr-only pattern for accessible screen reader text
 */
function StatItem({ icon, value, label, isRevenue = false, ariaLabel }: StatItemProps) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Screen reader accessible text */}
      {ariaLabel && <span className="sr-only">{ariaLabel}</span>}
      {/* Visual elements hidden from screen readers when ariaLabel is provided */}
      <div className="flex items-center gap-1 text-muted-foreground mb-1" aria-hidden="true">
        {icon}
      </div>
      <span
        className={`font-semibold ${isRevenue ? 'text-sm' : 'text-xl'}`}
        aria-hidden={!!ariaLabel}
      >
        {value}
      </span>
      {label && (
        <span className="text-xs text-muted-foreground" aria-hidden={!!ariaLabel}>
          {label}
        </span>
      )}
    </div>
  );
}
