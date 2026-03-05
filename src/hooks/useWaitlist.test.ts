import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useWaitlist } from './useWaitlist';

describe('useWaitlist', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  const mockFetchSuccess = (data: object) => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(data),
    } as Response);
  };

  const mockFetchError = () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'));
  };

  describe('initial state', () => {
    it('should have initial stats state', () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      expect(result.current.stats).toEqual({ total: 0, pending: 0, approved: 0 });
      expect(result.current.isLoadingStats).toBe(true);
    });

    it('should have initial form state', () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      expect(result.current.email).toBe('');
      expect(result.current.submitted).toBe(false);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitError).toBe(null);
      expect(result.current.submitMessage).toBe(null);
    });
  });

  describe('refreshStats', () => {
    it('should fetch and update stats on mount', async () => {
      mockFetchSuccess({ success: true, total: 150, pending: 100, approved: 50 });

      const { result } = renderHook(() => useWaitlist());

      // Wait for the async operation to complete
      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoadingStats).toBe(false);
      expect(result.current.stats).toEqual({
        total: 150,
        pending: 100,
        approved: 50,
      });
    });

    it('should handle API errors gracefully', async () => {
      mockFetchError();

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoadingStats).toBe(false);
      // Stats should remain at default values
      expect(result.current.stats).toEqual({ total: 0, pending: 0, approved: 0 });
    });

    it('should handle non-ok response', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Server error' }),
      } as Response);

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      expect(result.current.isLoadingStats).toBe(false);
      expect(result.current.stats).toEqual({ total: 0, pending: 0, approved: 0 });
    });
  });

  describe('setEmail', () => {
    it('should update email state', () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      act(() => {
        result.current.setEmail('test@example.com');
      });

      expect(result.current.email).toBe('test@example.com');
    });
  });

  describe('joinWaitlist', () => {
    it('should not submit if email is empty', async () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      let success: boolean;
      await act(async () => {
        success = await result.current.joinWaitlist();
      });

      expect(success!).toBe(false);
      expect(result.current.submitted).toBe(false);
    });

    it('should submit successfully with valid email', async () => {
      // Initial stats fetch
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      // Set email
      act(() => {
        result.current.setEmail('user@example.com');
      });

      // Mock join request
      mockFetchSuccess({ success: true, message: 'Welcome to the waitlist!' });
      // Mock stats refresh after join
      mockFetchSuccess({ success: true, total: 1, pending: 1, approved: 0 });

      let success: boolean;
      await act(async () => {
        success = await result.current.joinWaitlist('web');
        await vi.runAllTimersAsync();
      });

      expect(success!).toBe(true);
      expect(result.current.submitted).toBe(true);
      expect(result.current.submitMessage).toBe('Welcome to the waitlist!');
      expect(result.current.submitError).toBe(null);
    });

    it('should handle join error response', async () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.setEmail('existing@example.com');
      });

      mockFetchSuccess({ success: false, error: 'Email already registered' });

      let success: boolean;
      await act(async () => {
        success = await result.current.joinWaitlist();
      });

      expect(success!).toBe(false);
      expect(result.current.submitted).toBe(false);
      expect(result.current.submitError).toBe('Email already registered');
    });

    it('should handle network error during join', async () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.setEmail('user@example.com');
      });

      mockFetchError();

      let success: boolean;
      await act(async () => {
        success = await result.current.joinWaitlist();
      });

      expect(success!).toBe(false);
      expect(result.current.submitError).toBe('Network error. Please try again.');
    });

    it('should not allow resubmission after successful submit', async () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.setEmail('user@example.com');
      });

      mockFetchSuccess({ success: true, message: 'Joined!' });
      mockFetchSuccess({ success: true, total: 1, pending: 1, approved: 0 });

      await act(async () => {
        await result.current.joinWaitlist();
        await vi.runAllTimersAsync();
      });

      expect(result.current.submitted).toBe(true);

      // Try to submit again
      let secondSuccess: boolean;
      await act(async () => {
        secondSuccess = await result.current.joinWaitlist();
      });

      expect(secondSuccess!).toBe(false);
    });

    it('should send correct platform parameter', async () => {
      mockFetchSuccess({ success: true, total: 0, pending: 0, approved: 0 });

      const { result } = renderHook(() => useWaitlist());

      await act(async () => {
        await vi.runAllTimersAsync();
      });

      act(() => {
        result.current.setEmail('user@example.com');
      });

      mockFetchSuccess({ success: true, message: 'Joined!' });
      mockFetchSuccess({ success: true, total: 1, pending: 1, approved: 0 });

      await act(async () => {
        await result.current.joinWaitlist('mobile');
        await vi.runAllTimersAsync();
      });

      // Check that fetch was called with correct body
      const joinCall = vi.mocked(global.fetch).mock.calls[1];
      expect(joinCall[1]?.body).toBe(JSON.stringify({ email: 'user@example.com', platform: 'mobile' }));
    });
  });
});
