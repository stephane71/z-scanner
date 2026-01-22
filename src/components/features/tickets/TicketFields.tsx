'use client';

/**
 * TicketFields - Display all ticket data fields
 * Story 4.2: Ticket Detail View
 *
 * Shows ticket information: date, total (hero), ticket number,
 * payments breakdown, discount/cancel values, and market name.
 * Total displayed in 36px per UX spec.
 */

import { useMarketById } from '@/hooks/useMarkets';
import { formatDate, formatCurrency } from '@/lib/utils/format';
import type { Ticket } from '@/types';

interface TicketFieldsProps {
  /** Ticket data to display */
  ticket: Ticket;
}

export function TicketFields({ ticket }: TicketFieldsProps) {
  const { market } = useMarketById(ticket.marketId);

  return (
    <div className="space-y-4" data-testid="ticket-fields">
      {/* Total - Hero style (36px per UX spec) */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          Total TTC
        </p>
        <p
          className="text-4xl font-bold text-foreground"
          data-testid="ticket-total"
        >
          {formatCurrency(ticket.total)}
        </p>
      </div>

      {/* Fields grid */}
      <div className="bg-card rounded-lg border border-border divide-y divide-border">
        {/* Date */}
        <div className="flex justify-between items-center p-3">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="text-sm font-medium text-foreground">
            {formatDate(ticket.impressionDate)}
          </span>
        </div>

        {/* Ticket number */}
        <div className="flex justify-between items-center p-3">
          <span className="text-sm text-muted-foreground">N° Ticket</span>
          <span className="text-sm font-medium text-foreground">
            #{ticket.ticketNumber}
          </span>
        </div>

        {/* Reset info */}
        <div className="flex justify-between items-center p-3">
          <span className="text-sm text-muted-foreground">N° RAZ</span>
          <span className="text-sm font-medium text-foreground">
            {ticket.resetNumber}
          </span>
        </div>

        {/* Market (if assigned) */}
        {market && (
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-muted-foreground">Marché</span>
            <span className="text-sm font-medium text-foreground">
              {market.name}
            </span>
          </div>
        )}

        {/* Payments breakdown */}
        {ticket.payments && ticket.payments.length > 0 && (
          <div className="p-3">
            <p className="text-sm text-muted-foreground mb-2">
              Modes de paiement
            </p>
            <div className="space-y-1">
              {ticket.payments.map((payment, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-muted-foreground">
                    {payment.mode}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(payment.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discount value (if > 0) */}
        {ticket.discountValue > 0 && (
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-muted-foreground">Remises</span>
            <span className="text-sm font-medium text-foreground">
              -{formatCurrency(ticket.discountValue)}
            </span>
          </div>
        )}

        {/* Cancel value (if > 0) */}
        {ticket.cancelValue > 0 && (
          <div className="flex justify-between items-center p-3">
            <span className="text-sm text-muted-foreground">
              Annulations ({ticket.cancelNumber})
            </span>
            <span className="text-sm font-medium text-foreground">
              -{formatCurrency(ticket.cancelValue)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export type { TicketFieldsProps };
