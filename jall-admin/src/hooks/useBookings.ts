import { useState, useEffect, useCallback } from 'react';
import api from '@/api/client';
import type { Booking, BookingStatus } from '@/types';

interface Options {
  status?: BookingStatus | '';
  search?: string;
}

export function useBookings({ status = '', search = '' }: Options = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (search) params.set('search', search);
      const res = await api.get<Booking[]>(`/bookings?${params.toString()}`);
      setBookings(res.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        ?? 'Failed to load bookings';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, setBookings, loading, error, refetch: fetchBookings };
}
