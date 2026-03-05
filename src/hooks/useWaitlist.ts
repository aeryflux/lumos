import { useState, useEffect, useCallback } from 'react';

// Use production API URL when deployed, localhost for development
const isProduction = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
const API_BASE = import.meta.env.VITE_API_URL || (isProduction ? 'https://api.aeryflux.com' : 'http://localhost:3000');

export interface WaitlistStats {
  total: number;
  pending: number;
  approved: number;
}

export interface UseWaitlistReturn {
  // Stats
  stats: WaitlistStats;
  isLoadingStats: boolean;

  // Join form
  email: string;
  setEmail: (email: string) => void;
  submitted: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  submitMessage: string | null;

  // Actions
  joinWaitlist: (platform?: string) => Promise<boolean>;
  refreshStats: () => Promise<void>;
}

/**
 * Hook for waitlist functionality - joining and getting stats
 */
export function useWaitlist(): UseWaitlistReturn {
  // Stats state
  const [stats, setStats] = useState<WaitlistStats>({ total: 0, pending: 0, approved: 0 });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Form state
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  // Fetch waitlist count
  const refreshStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch(`${API_BASE}/api/auth/waitlist/count`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats({
            total: data.total || 0,
            pending: data.pending || 0,
            approved: data.approved || 0,
          });
        }
      }
    } catch (error) {
      console.error('[Waitlist] Failed to fetch stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Join waitlist
  const joinWaitlist = useCallback(async (platform = 'web'): Promise<boolean> => {
    if (!email || submitted) return false;

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/waitlist/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, platform }),
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setSubmitMessage(data.message || 'You have been added to the waitlist!');
        // Refresh stats after successful join
        refreshStats();
        return true;
      } else {
        setSubmitError(data.error || 'Failed to join waitlist');
        return false;
      }
    } catch (error) {
      console.error('[Waitlist] Join error:', error);
      setSubmitError('Network error. Please try again.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [email, submitted, refreshStats]);

  // Fetch stats on mount
  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    isLoadingStats,
    email,
    setEmail,
    submitted,
    isSubmitting,
    submitError,
    submitMessage,
    joinWaitlist,
    refreshStats,
  };
}

export default useWaitlist;
