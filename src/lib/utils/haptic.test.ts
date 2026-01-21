/**
 * Unit tests for haptic feedback utility
 * Story 3.6: Ticket Validation with NF525 Compliance
 *
 * Tests for:
 * - Vibration API is called with correct patterns
 * - Fallback when Vibration API not supported
 * - Different haptic patterns (success, warning, error)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerHaptic, HAPTIC_PATTERNS } from './haptic';

describe('triggerHaptic', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    // Reset navigator mock before each test
    vi.resetAllMocks();
  });

  afterEach(() => {
    // Restore original navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should call navigator.vibrate with success pattern by default', () => {
    const vibrateMock = vi.fn(() => true);
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      writable: true,
    });

    triggerHaptic();

    expect(vibrateMock).toHaveBeenCalledWith(HAPTIC_PATTERNS.success);
  });

  it('should call navigator.vibrate with success pattern', () => {
    const vibrateMock = vi.fn(() => true);
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      writable: true,
    });

    triggerHaptic('success');

    expect(vibrateMock).toHaveBeenCalledWith([100]);
  });

  it('should call navigator.vibrate with warning pattern', () => {
    const vibrateMock = vi.fn(() => true);
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      writable: true,
    });

    triggerHaptic('warning');

    expect(vibrateMock).toHaveBeenCalledWith([50, 50, 50]);
  });

  it('should call navigator.vibrate with error pattern', () => {
    const vibrateMock = vi.fn(() => true);
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      writable: true,
    });

    triggerHaptic('error');

    expect(vibrateMock).toHaveBeenCalledWith([200, 100, 200]);
  });

  it('should not throw when Vibration API is not supported', () => {
    // Navigator without vibrate function
    Object.defineProperty(global, 'navigator', {
      value: {},
      writable: true,
    });

    // Should not throw
    expect(() => triggerHaptic()).not.toThrow();
  });

  it('should not throw when navigator is undefined', () => {
    // In some environments navigator might not exist
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
    });

    // Should not throw
    expect(() => triggerHaptic()).not.toThrow();
  });

  it('should handle vibrate returning false gracefully', () => {
    const vibrateMock = vi.fn(() => false);
    Object.defineProperty(global, 'navigator', {
      value: { vibrate: vibrateMock },
      writable: true,
    });

    // Should not throw even if vibrate returns false
    expect(() => triggerHaptic()).not.toThrow();
    expect(vibrateMock).toHaveBeenCalled();
  });
});

describe('HAPTIC_PATTERNS', () => {
  it('should have success pattern as single short vibration', () => {
    expect(HAPTIC_PATTERNS.success).toEqual([100]);
  });

  it('should have warning pattern as two short pulses', () => {
    expect(HAPTIC_PATTERNS.warning).toEqual([50, 50, 50]);
  });

  it('should have error pattern as long-short-long', () => {
    expect(HAPTIC_PATTERNS.error).toEqual([200, 100, 200]);
  });
});
