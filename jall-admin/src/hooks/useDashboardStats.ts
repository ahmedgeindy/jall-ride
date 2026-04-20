import { useState, useEffect } from 'react';
import api from '@/api/client';
import type { DashboardStats } from '@/types';

export function useDashboardStats() {
  const [stats,   setStats  ] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState<string | null>(null);

  useEffect(() => {
    api.get<DashboardStats>('/dashboard/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(
        (err.response?.data as { error?: string })?.error ?? 'Failed to load stats'
      ))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
