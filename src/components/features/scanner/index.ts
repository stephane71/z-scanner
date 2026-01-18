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
