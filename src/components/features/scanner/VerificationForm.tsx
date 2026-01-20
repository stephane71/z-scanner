"use client";

/**
 * VerificationForm - Editable form for Z-ticket verification
 * Story 3.4: Verification Screen
 *
 * Displays all Z-ticket fields in editable inputs.
 * Uses React Hook Form Controller for all fields (controlled inputs).
 * Highlights low-confidence fields (yellow border for < 0.8).
 */

import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  ConfidenceIndicator,
  getConfidenceBorderClass,
} from "./ConfidenceIndicator";
import { PaymentEditor } from "./PaymentEditor";
import { TotalHero } from "./TotalHero";
import {
  FIELD_LABELS,
  type TicketVerificationForm,
} from "@/lib/validation/ticket";
import type { OcrConfidence } from "@/types";

interface VerificationFormProps {
  /** React Hook Form instance */
  form: UseFormReturn<TicketVerificationForm>;
  /** OCR confidence scores for field highlighting */
  confidence: OcrConfidence | null;
  /** Optional className for styling */
  className?: string;
}

/**
 * Get border class based on confidence
 */
function getFieldBorderClass(confidence: number | undefined): string {
  if (confidence === undefined || confidence >= 0.8) {
    return "border-gray-300";
  }
  return getConfidenceBorderClass(confidence);
}

export function VerificationForm({
  form,
  confidence,
  className = "",
}: VerificationFormProps) {
  const {
    control,
    formState: { errors },
    watch,
  } = form;

  // Watch total for hero display
  const total = watch("total");
  const totalConfidence = confidence?.total;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Total Hero Display */}
      <TotalHero total={total} confidence={totalConfidence} />

      {/* Form Fields */}
      <div className="space-y-4 px-4">
        {/* Impression Date */}
        <Controller
          name="impressionDate"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="impressionDate"
                  className="text-sm font-medium text-gray-900"
                >
                  {FIELD_LABELS.impressionDate}
                </Label>
                {confidence?.impressionDate !== undefined &&
                  confidence.impressionDate < 0.8 && (
                    <ConfidenceIndicator
                      confidence={confidence.impressionDate}
                    />
                  )}
              </div>
              <Input
                id="impressionDate"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={`h-12 ${getFieldBorderClass(confidence?.impressionDate)}`}
                aria-invalid={!!errors.impressionDate}
              />
              {errors.impressionDate && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.impressionDate.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Last Reset Date */}
        <Controller
          name="lastResetDate"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="lastResetDate"
                  className="text-sm font-medium text-gray-900"
                >
                  {FIELD_LABELS.lastResetDate}
                </Label>
                {confidence?.lastResetDate !== undefined &&
                  confidence.lastResetDate < 0.8 && (
                    <ConfidenceIndicator
                      confidence={confidence.lastResetDate}
                    />
                  )}
              </div>
              <Input
                id="lastResetDate"
                type="date"
                value={field.value || ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                className={`h-12 ${getFieldBorderClass(confidence?.lastResetDate)}`}
                aria-invalid={!!errors.lastResetDate}
              />
              {errors.lastResetDate && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.lastResetDate.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Ticket Number and Reset Number (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Ticket Number */}
          <Controller
            name="ticketNumber"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="ticketNumber"
                    className="text-sm font-medium text-gray-900"
                  >
                    {FIELD_LABELS.ticketNumber}
                  </Label>
                  {confidence?.ticketNumber !== undefined &&
                    confidence.ticketNumber < 0.8 && (
                      <ConfidenceIndicator
                        confidence={confidence.ticketNumber}
                      />
                    )}
                </div>
                <Input
                  id="ticketNumber"
                  type="number"
                  min="1"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value, 10) : 0,
                    )
                  }
                  onBlur={field.onBlur}
                  className={`h-12 ${getFieldBorderClass(confidence?.ticketNumber)}`}
                  aria-invalid={!!errors.ticketNumber}
                />
                {errors.ticketNumber && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.ticketNumber.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Reset Number */}
          <Controller
            name="resetNumber"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="resetNumber"
                    className="text-sm font-medium text-gray-900"
                  >
                    {FIELD_LABELS.resetNumber}
                  </Label>
                  {confidence?.resetNumber !== undefined &&
                    confidence.resetNumber < 0.8 && (
                      <ConfidenceIndicator
                        confidence={confidence.resetNumber}
                      />
                    )}
                </div>
                <Input
                  id="resetNumber"
                  type="number"
                  min="0"
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value, 10) : 0,
                    )
                  }
                  onBlur={field.onBlur}
                  className={`h-12 ${getFieldBorderClass(confidence?.resetNumber)}`}
                  aria-invalid={!!errors.resetNumber}
                />
                {errors.resetNumber && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.resetNumber.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Payments Editor */}
        <Controller
          name="payments"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <PaymentEditor
                payments={field.value}
                onChange={field.onChange}
                error={errors.payments?.message}
              />
              {confidence?.payments !== undefined &&
                confidence.payments < 0.8 && (
                  <div className="flex items-center gap-2 mt-1">
                    <ConfidenceIndicator
                      confidence={confidence.payments}
                      showLabel
                      size="md"
                    />
                  </div>
                )}
            </div>
          )}
        />

        {/* Total (Currency Input) */}
        <Controller
          name="total"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="total"
                  className="text-sm font-medium text-gray-900"
                >
                  {FIELD_LABELS.total}
                </Label>
                {confidence?.total !== undefined && confidence.total < 0.8 && (
                  <ConfidenceIndicator confidence={confidence.total} />
                )}
              </div>
              <CurrencyInput
                value={field.value}
                onChange={field.onChange}
                className={getFieldBorderClass(confidence?.total)}
                aria-label="Total TTC"
                aria-invalid={!!errors.total}
              />
              {errors.total && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.total.message}
                </p>
              )}
            </div>
          )}
        />

        {/* Discount and Cancel Values (side by side) */}
        <div className="grid grid-cols-2 gap-4">
          {/* Discount Value */}
          <Controller
            name="discountValue"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor="discountValue"
                  className="text-sm font-medium text-gray-900"
                >
                  {FIELD_LABELS.discountValue}
                </Label>
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  aria-label="Remises"
                  aria-invalid={!!errors.discountValue}
                />
                {errors.discountValue && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Cancel Value */}
          <Controller
            name="cancelValue"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label
                  htmlFor="cancelValue"
                  className="text-sm font-medium text-gray-900"
                >
                  {FIELD_LABELS.cancelValue}
                </Label>
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  aria-label="Annulations"
                  aria-invalid={!!errors.cancelValue}
                />
                {errors.cancelValue && (
                  <p className="text-sm text-red-600" role="alert">
                    {errors.cancelValue.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Cancel Number */}
        <Controller
          name="cancelNumber"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label
                htmlFor="cancelNumber"
                className="text-sm font-medium text-gray-900"
              >
                {FIELD_LABELS.cancelNumber}
              </Label>
              <Input
                id="cancelNumber"
                type="number"
                min="0"
                value={field.value ?? ""}
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? parseInt(e.target.value, 10) : 0,
                  )
                }
                onBlur={field.onBlur}
                className="h-12"
                aria-invalid={!!errors.cancelNumber}
              />
              {errors.cancelNumber && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.cancelNumber.message}
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  );
}

export type { VerificationFormProps };
