/**
 * Tests for useToast hook - Story 3.9
 * Toast notification wrapper
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

import { toast } from 'sonner';

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns toast functions', () => {
    const { result } = renderHook(() => useToast());

    expect(typeof result.current.showToast).toBe('function');
    expect(typeof result.current.toastSuccess).toBe('function');
    expect(typeof result.current.toastError).toBe('function');
    expect(typeof result.current.toastWarning).toBe('function');
    expect(typeof result.current.toastInfo).toBe('function');
  });

  it('calls toast.success for toastSuccess', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toastSuccess('Success!', 'Operation completed');
    });

    expect(toast.success).toHaveBeenCalledWith('Success!', {
      description: 'Operation completed',
      duration: 4000,
      action: undefined,
    });
  });

  it('calls toast.error for toastError', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toastError('Error!', 'Something went wrong');
    });

    expect(toast.error).toHaveBeenCalledWith('Error!', {
      description: 'Something went wrong',
      duration: 4000,
      action: undefined,
    });
  });

  it('calls toast.warning for toastWarning', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toastWarning('Warning!', 'Please check');
    });

    expect(toast.warning).toHaveBeenCalledWith('Warning!', {
      description: 'Please check',
      duration: 4000,
      action: undefined,
    });
  });

  it('calls toast.info for toastInfo', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toastInfo('Info', 'Here is some information');
    });

    expect(toast.info).toHaveBeenCalledWith('Info', {
      description: 'Here is some information',
      duration: 4000,
      action: undefined,
    });
  });

  it('showToast supports custom duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.showToast({
        title: 'Custom',
        type: 'info',
        duration: 10000,
      });
    });

    expect(toast.info).toHaveBeenCalledWith('Custom', {
      description: undefined,
      duration: 10000,
      action: undefined,
    });
  });

  it('showToast supports action button', () => {
    const { result } = renderHook(() => useToast());
    const mockAction = vi.fn();

    act(() => {
      result.current.showToast({
        title: 'Action',
        type: 'warning',
        action: {
          label: 'Retry',
          onClick: mockAction,
        },
      });
    });

    expect(toast.warning).toHaveBeenCalledWith('Action', {
      description: undefined,
      duration: 4000,
      action: {
        label: 'Retry',
        onClick: mockAction,
      },
    });
  });
});
