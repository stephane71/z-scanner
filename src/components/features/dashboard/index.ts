/**
 * Dashboard components barrel export
 * Story 6.1: Activity Dashboard
 * Story 6.2: Sales by Period
 * Story 6.3: Sales by Market
 */

export {
  DashboardSummaryCard,
  DashboardLoadingSkeleton,
  DashboardEmptyState,
} from './DashboardSummaryCard';

export {
  SalesByPeriodCard,
  SalesByPeriodLoadingSkeleton,
} from './SalesByPeriodCard';

export {
  PeriodBreakdown,
  PeriodBreakdownTrigger,
  PeriodBreakdownContent,
  type BreakdownItem,
} from './PeriodBreakdown';

export {
  SalesByMarketCard,
  SalesByMarketLoadingSkeleton,
} from './SalesByMarketCard';

export { MarketRow, type MarketRowProps } from './MarketRow';
