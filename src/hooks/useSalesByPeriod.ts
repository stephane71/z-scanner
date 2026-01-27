/**
 * Sales by Period Hook
 * Story 6.2: Sales by Period
 *
 * Provides reactive period-based sales aggregations using useLiveQuery.
 * Returns stats for this week, this month, and this quarter with trend comparisons.
 *
 * Pure functions are exported for testability (following Story 6.1 pattern).
 */

'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  getThisWeek,
  getLastWeek,
  getThisMonth,
  getLastMonth,
  getThisQuarter,
  getLastQuarter,
} from '@/lib/utils/date-ranges';

/** Single breakdown item for daily/weekly/monthly details */
export interface BreakdownItem {
  /** Label for the period (e.g., "Lundi", "Semaine 1", "Janvier") */
  label: string;
  /** Number of tickets in this sub-period */
  ticketCount: number;
  /** Revenue in centimes */
  revenue: number;
}

/** Stats for a single period */
export interface PeriodStats {
  /** Number of validated tickets in the period */
  ticketCount: number;
  /** Total revenue in centimes */
  revenue: number;
  /** Previous period revenue for comparison (in centimes) */
  previousRevenue: number;
  /** Percentage change from previous period (-100 to +∞) */
  trend: number;
  /** Breakdown items for expandable view */
  breakdown: BreakdownItem[];
}

/** Result from useSalesByPeriod hook */
export interface SalesByPeriodResult {
  thisWeek: PeriodStats;
  thisMonth: PeriodStats;
  thisQuarter: PeriodStats;
  isLoading: boolean;
}

/** Type for ticket fields needed for aggregation */
interface TicketForAggregation {
  total?: number | null;
}

/**
 * Calculate trend percentage between current and previous period revenue.
 * Pure function for testability.
 *
 * @param current - Current period revenue
 * @param previous - Previous period revenue
 * @returns Percentage change rounded to nearest integer
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Filter a ticket by date range and validated status.
 * Pure function for testability.
 *
 * @param ticket - Ticket to filter
 * @param start - Start date (YYYY-MM-DD)
 * @param end - End date (YYYY-MM-DD)
 * @returns true if ticket should be included
 */
export function filterTicketsForPeriod(
  ticket: { impressionDate?: string | null; status?: string },
  start: string,
  end: string
): boolean {
  const ticketDate = ticket.impressionDate?.slice(0, 10);
  if (!ticketDate) return false;
  return ticketDate >= start && ticketDate <= end && ticket.status === 'validated';
}

/**
 * Aggregate tickets into count and revenue.
 * Pure function for testability.
 *
 * @param tickets - Array of tickets with total field
 * @returns Aggregated count and revenue
 */
export function aggregatePeriodStats(tickets: TicketForAggregation[]): {
  count: number;
  revenue: number;
} {
  let revenue = 0;
  for (const ticket of tickets) {
    revenue += ticket.total ?? 0;
  }
  return { count: tickets.length, revenue };
}

/** French day names for week breakdown */
const FRENCH_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** French month names for quarter breakdown */
const FRENCH_MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/**
 * Compute daily breakdown for a week period.
 * Pure function for testability.
 */
export function computeWeeklyBreakdown(
  tickets: { impressionDate?: string | null; status?: string; total?: number | null }[],
  weekStart: string
): BreakdownItem[] {
  const startDate = new Date(weekStart);
  const breakdown: BreakdownItem[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);
    const dayStr = dayDate.toISOString().slice(0, 10);

    const dayTickets = tickets.filter((t) => {
      const ticketDate = t.impressionDate?.slice(0, 10);
      return ticketDate === dayStr && t.status === 'validated';
    });

    const stats = aggregatePeriodStats(dayTickets);
    breakdown.push({
      label: FRENCH_DAYS[i],
      ticketCount: stats.count,
      revenue: stats.revenue,
    });
  }

  return breakdown;
}

/**
 * Compute weekly breakdown for a month period.
 * Pure function for testability.
 */
export function computeMonthlyBreakdown(
  tickets: { impressionDate?: string | null; status?: string; total?: number | null }[],
  monthStart: string,
  monthEnd: string
): BreakdownItem[] {
  const startDate = new Date(monthStart);
  const endDate = new Date(monthEnd);
  const breakdown: BreakdownItem[] = [];

  let weekNum = 1;
  let weekStart = new Date(startDate);

  while (weekStart <= endDate) {
    // Week ends on Sunday or end of month, whichever comes first
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const actualEnd = weekEnd > endDate ? endDate : weekEnd;

    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const weekEndStr = actualEnd.toISOString().slice(0, 10);

    const weekTickets = tickets.filter((t) => {
      const ticketDate = t.impressionDate?.slice(0, 10);
      if (!ticketDate) return false;
      return ticketDate >= weekStartStr && ticketDate <= weekEndStr && t.status === 'validated';
    });

    const stats = aggregatePeriodStats(weekTickets);
    breakdown.push({
      label: `Semaine ${weekNum}`,
      ticketCount: stats.count,
      revenue: stats.revenue,
    });

    weekNum++;
    weekStart = new Date(actualEnd);
    weekStart.setDate(weekStart.getDate() + 1);
  }

  return breakdown;
}

/**
 * Compute monthly breakdown for a quarter period.
 * Pure function for testability.
 */
export function computeQuarterlyBreakdown(
  tickets: { impressionDate?: string | null; status?: string; total?: number | null }[],
  quarterStart: string
): BreakdownItem[] {
  const startDate = new Date(quarterStart);
  const startMonth = startDate.getMonth();
  const year = startDate.getFullYear();
  const breakdown: BreakdownItem[] = [];

  for (let i = 0; i < 3; i++) {
    const monthIndex = startMonth + i;
    const monthStart = new Date(year, monthIndex, 1);
    const monthEnd = new Date(year, monthIndex + 1, 0);

    const monthStartStr = monthStart.toISOString().slice(0, 10);
    const monthEndStr = monthEnd.toISOString().slice(0, 10);

    const monthTickets = tickets.filter((t) => {
      const ticketDate = t.impressionDate?.slice(0, 10);
      if (!ticketDate) return false;
      return ticketDate >= monthStartStr && ticketDate <= monthEndStr && t.status === 'validated';
    });

    const stats = aggregatePeriodStats(monthTickets);
    breakdown.push({
      label: FRENCH_MONTHS[monthIndex],
      ticketCount: stats.count,
      revenue: stats.revenue,
    });
  }

  return breakdown;
}

/** Default period stats (zeros) */
const defaultPeriodStats: PeriodStats = {
  ticketCount: 0,
  revenue: 0,
  previousRevenue: 0,
  trend: 0,
  breakdown: [],
};

/**
 * Hook for reactive sales by period statistics.
 * Uses useLiveQuery for real-time updates from IndexedDB.
 *
 * @param userId - User ID to filter tickets
 * @returns Period stats for week, month, quarter with loading state
 */
export function useSalesByPeriod(userId: string): SalesByPeriodResult {
  const result = useLiveQuery(
    async () => {
      if (!userId) {
        return {
          thisWeek: defaultPeriodStats,
          thisMonth: defaultPeriodStats,
          thisQuarter: defaultPeriodStats,
        };
      }

      // Fetch all user tickets once
      const tickets = await db.tickets.where('userId').equals(userId).toArray();

      // Get date ranges for all periods
      const periods = [
        { current: getThisWeek(), previous: getLastWeek(), key: 'thisWeek' as const },
        { current: getThisMonth(), previous: getLastMonth(), key: 'thisMonth' as const },
        { current: getThisQuarter(), previous: getLastQuarter(), key: 'thisQuarter' as const },
      ];

      const stats: Record<string, PeriodStats> = {};

      for (const period of periods) {
        // Filter tickets for current and previous periods
        const currentTickets = tickets.filter((t) =>
          filterTicketsForPeriod(t, period.current.start, period.current.end)
        );
        const previousTickets = tickets.filter((t) =>
          filterTicketsForPeriod(t, period.previous.start, period.previous.end)
        );

        // Aggregate stats
        const current = aggregatePeriodStats(currentTickets);
        const previous = aggregatePeriodStats(previousTickets);

        // Compute breakdown based on period type
        let breakdown: BreakdownItem[] = [];
        if (period.key === 'thisWeek') {
          breakdown = computeWeeklyBreakdown(tickets, period.current.start);
        } else if (period.key === 'thisMonth') {
          breakdown = computeMonthlyBreakdown(tickets, period.current.start, period.current.end);
        } else if (period.key === 'thisQuarter') {
          breakdown = computeQuarterlyBreakdown(tickets, period.current.start);
        }

        stats[period.key] = {
          ticketCount: current.count,
          revenue: current.revenue,
          previousRevenue: previous.revenue,
          trend: calculateTrend(current.revenue, previous.revenue),
          breakdown,
        };
      }

      return stats as {
        thisWeek: PeriodStats;
        thisMonth: PeriodStats;
        thisQuarter: PeriodStats;
      };
    },
    [userId]
  );

  return {
    thisWeek: result?.thisWeek ?? defaultPeriodStats,
    thisMonth: result?.thisMonth ?? defaultPeriodStats,
    thisQuarter: result?.thisQuarter ?? defaultPeriodStats,
    isLoading: result === undefined,
  };
}
