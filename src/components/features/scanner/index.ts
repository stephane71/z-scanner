/**
 * Scanner components for camera capture and OCR
 * Story 3.2: Camera Capture UI
 * Story 3.3: OCR Processing (Claude Haiku 4.5 API)
 *
 * Re-exports all scanner-related components.
 */

// Camera components (Story 3.2)
export { CameraView, type CameraViewProps } from './CameraView';
export { CaptureButton, type CaptureButtonProps } from './CaptureButton';
export { CameraPermissionError, type CameraPermissionErrorProps } from './CameraPermissionError';
export { FlashOverlay, type FlashOverlayProps } from './FlashOverlay';

// OCR components (Story 3.3)
export { OcrLoading } from './OcrLoading';
export { OcrResult } from './OcrResult';
export { OcrError } from './OcrError';

// Verification components (Story 3.4)
export { VerificationHeader, type VerificationHeaderProps } from './VerificationHeader';
export { PhotoThumbnail, type PhotoThumbnailProps } from './PhotoThumbnail';
export { TotalHero, type TotalHeroProps } from './TotalHero';
export {
  ConfidenceIndicator,
  getConfidenceBorderClass,
  type ConfidenceIndicatorProps,
  type ConfidenceLevel,
} from './ConfidenceIndicator';
export { ValidateButton, type ValidateButtonProps } from './ValidateButton';
export { PaymentEditor, type PaymentEditorProps } from './PaymentEditor';
export { VerificationForm, type VerificationFormProps } from './VerificationForm';

// Manual entry components (Story 3.5)
export { ManualEntryHeader, type ManualEntryHeaderProps } from './ManualEntryHeader';
export { ManualEntryForm, type ManualEntryFormProps } from './ManualEntryForm';

// Validation success component (Story 3.6)
export {
  ValidationSuccess,
  VALIDATION_SUCCESS_DELAY,
  type ValidationSuccessProps,
} from './ValidationSuccess';
