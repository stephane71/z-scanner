"use client";

/**
 * DateRangeFilter - Date range picker for filtering tickets
 * Story 4.3: Filter by Date
 *
 * Provides a bottom sheet with quick presets and custom date range selection.
 * Uses native date inputs for mobile-friendly experience.
 */

import { useState } from "react";
import { Calendar, X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  /** Called when a date range is applied */
  onApply: (startDate: string, endDate: string) => void;
  /** Called when the filter is cleared */
  onClear: () => void;
  /** Current start date filter (ISO string) or null */
  currentStart: string | null;
  /** Current end date filter (ISO string) or null */
  currentEnd: string | null;
}

/**
 * Get the Monday and Sunday of the current week
 */
function getThisWeek(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const monday = new Date(now);
  // Calculate days since Monday (if Sunday, dayOfWeek is 0, so we need -6)
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(now.getDate() - daysSinceMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().slice(0, 10),
    end: sunday.toISOString().slice(0, 10),
  };
}

/**
 * Get the first and last day of the current month
 */
function getThisMonth(): { start: string; end: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // First day of month
  const startDay = 1;
  // Last day of month (day 0 of next month = last day of current month)
  const lastDay = new Date(year, month + 1, 0).getDate();

  // Format as YYYY-MM-DD using padded values
  const monthStr = String(month + 1).padStart(2, "0");

  return {
    start: `${year}-${monthStr}-01`,
    end: `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`,
  };
}

/**
 * Get the first and last day of the current quarter
 */
function getThisQuarter(): { start: string; end: string } {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), quarter * 3, 1);
  const end = new Date(now.getFullYear(), (quarter + 1) * 3, 0);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function DateRangeFilter({
  onApply,
  onClear,
  currentStart,
  currentEnd,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [customStart, setCustomStart] = useState(
    currentStart?.slice(0, 10) || "",
  );
  const [customEnd, setCustomEnd] = useState(currentEnd?.slice(0, 10) || "");

  const isActive = currentStart !== null || currentEnd !== null;

  function handlePreset(preset: { start: string; end: string }) {
    onApply(preset.start, preset.end);
    setOpen(false);
  }

  function handleCustomApply() {
    if (customStart && customEnd && customStart <= customEnd) {
      onApply(customStart, customEnd);
      setOpen(false);
    }
  }

  const isCustomRangeValid = customStart && customEnd && customStart <= customEnd;

  function handleClear() {
    setCustomStart("");
    setCustomEnd("");
    onClear();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          data-testid="date-filter-button"
          data-active={isActive}
          aria-label="Filtrer par date"
          className={cn(
            "flex items-center justify-center w-12 h-12 rounded-lg",
            "border border-border bg-background",
            "transition-colors",
            isActive ? "bg-primary/10 border-primary" : "hover:bg-muted",
          )}
        >
          <Calendar
            className={cn(
              "w-5 h-5",
              isActive ? "text-primary" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[80vh] rounded-t-2xl px-4 [&>button:last-child]:hidden">
        {/* Custom header with title and close button on same row */}
        <div className="flex items-center justify-between py-4">
          <SheetTitle>Filtrer par date</SheetTitle>
          <SheetClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-5 w-5" />
            <span className="sr-only">Fermer</span>
          </SheetClose>
        </div>

        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">
              Périodes rapides
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(getThisWeek())}
                className="w-full"
              >
                Cette semaine
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(getThisMonth())}
                className="w-full"
              >
                Ce mois
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreset(getThisQuarter())}
                className="w-full"
              >
                Ce trimestre
              </Button>
            </div>
          </div>

          {/* Custom Date Range */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              Période personnalisée
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="start-date"
                  className="block text-xs text-muted-foreground mb-1"
                >
                  Date de début
                </label>
                <input
                  id="start-date"
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-md",
                    "border border-border bg-background",
                    "text-sm focus:outline-none focus:ring-2 focus:ring-primary",
                  )}
                />
              </div>
              <div>
                <label
                  htmlFor="end-date"
                  className="block text-xs text-muted-foreground mb-1"
                >
                  Date de fin
                </label>
                <input
                  id="end-date"
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 rounded-md",
                    "border border-border bg-background",
                    "text-sm focus:outline-none focus:ring-2 focus:ring-primary",
                  )}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 pb-4">
            {isActive && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="flex-1"
              >
                Effacer le filtre
              </Button>
            )}
            <Button
              onClick={handleCustomApply}
              disabled={!isCustomRangeValid}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Appliquer
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
