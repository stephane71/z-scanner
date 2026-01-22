/**
 * Ticket feature components barrel export
 * Story 4.1: Ticket List (Historique)
 * Story 4.2: Ticket Detail View
 */

// Story 4.1 Components
export { TicketCard } from './TicketCard';
export { TicketList, TicketCardSkeleton, TicketListSkeleton } from './TicketList';
export { EmptyState } from './EmptyState';
export { NF525Badge } from './NF525Badge';

// Story 4.2 Components
export { DetailHeader } from './DetailHeader';
export { TicketPhoto, TicketPhotoSkeleton } from './TicketPhoto';
export { TicketFields } from './TicketFields';
export { NF525Info } from './NF525Info';
export { CancelledBanner } from './CancelledBanner';

// Types
export type { TicketCardProps } from './TicketCard';
export type { TicketListProps } from './TicketList';
export type { DetailHeaderProps } from './DetailHeader';
export type { TicketPhotoProps } from './TicketPhoto';
export type { TicketFieldsProps } from './TicketFields';
export type { NF525InfoProps } from './NF525Info';
export type { CancelledBannerProps } from './CancelledBanner';
