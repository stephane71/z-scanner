/**
 * Sales by Period Card Component
 * Story 6.2: Sales by Period
 *
 * Displays sales statistics grouped by period (week, month, quarter)
 * with trend comparisons to previous periods.
 */

'use client';

import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSalesByPeriod, type PeriodStats } from '@/hooks';
import { formatCurrency } from '@/lib/utils/format';
import { cn } from '@/lib/utils';
import { PeriodBreakdown } from './PeriodBreakdown';

interface SalesByPeriodCardProps {
  userId: string;
}

interface PeriodSectionProps {
  label: string;
  stats: PeriodStats;
  comparisonLabel: string;
  breakdownLabel: string;
}

/**
 * Loading skeleton for SalesByPeriodCard
 */
export function SalesByPeriodLoadingSkeleton() {
  return (
    <Card data-testid="sales-by-period-skeleton">
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Trend indicator component with icon and percentage
 */
function TrendIndicator({ trend, comparisonLabel }: { trend: number; comparisonLabel: string }) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const colorClass = isPositive
    ? 'text-green-600'
    : isNegative
      ? 'text-red-600'
      : 'text-muted-foreground';

  const trendText = isPositive ? `+${trend}%` : `${trend}%`;
  const srText = isPositive
    ? `augmentation de ${trend}%`
    : isNegative
      ? `diminution de ${Math.abs(trend)}%`
      : 'pas de changement';

  return (
    <div className={cn('flex items-center gap-1 text-sm', colorClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span>{trendText}</span>
      <span className="sr-only">{srText} vs {comparisonLabel}</span>
    </div>
  );
}

/**
 * Period section displaying stats for a single period with expandable breakdown
 */
function PeriodSection({ label, stats, comparisonLabel, breakdownLabel }: PeriodSectionProps) {
  return (
    <div className="space-y-1 text-center">
      <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      <p className="text-sm text-muted-foreground">
        <span className="sr-only">Nombre de tickets: </span>
        {stats.ticketCount} tickets
      </p>
      <p className="text-lg font-semibold">
        <span className="sr-only">Revenu: </span>
        {formatCurrency(stats.revenue)}
      </p>
      <TrendIndicator trend={stats.trend} comparisonLabel={comparisonLabel} />
      {stats.breakdown && stats.breakdown.length > 0 && (
        <div className="pt-2">
          <PeriodBreakdown
            title="Détail"
            items={stats.breakdown}
            comparisonLabel={breakdownLabel}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Sales by Period Card - displays period-based sales statistics
 */
export function SalesByPeriodCard({ userId }: SalesByPeriodCardProps) {
  const { thisWeek, thisMonth, thisQuarter, isLoading } = useSalesByPeriod(userId);

  if (isLoading) {
    return <SalesByPeriodLoadingSkeleton />;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span>Ventes par période</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <PeriodSection
            label="Cette semaine"
            stats={thisWeek}
            comparisonLabel="la semaine dernière"
            breakdownLabel="par jour"
          />
          <PeriodSection
            label="Ce mois"
            stats={thisMonth}
            comparisonLabel="le mois dernier"
            breakdownLabel="par semaine"
          />
          <PeriodSection
            label="Ce trimestre"
            stats={thisQuarter}
            comparisonLabel="le trimestre dernier"
            breakdownLabel="par mois"
          />
        </div>
      </CardContent>
    </Card>
  );
}
