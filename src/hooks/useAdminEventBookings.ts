import { useQuery } from '@tanstack/react-query';
import { adminApiClient } from '@/lib/adminApiClient';
import type { Booking } from '@/types/admin';

export function useAdminEventBookings(eventId: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin', 'events', eventId, 'bookings'] as const,
    queryFn: async (): Promise<Booking[]> => {
      const response = await adminApiClient.get(`/admin/events/${eventId}/bookings`);
      return response.data.data as Booking[];
    },
    enabled: Boolean(eventId),
  });

  return {
    bookings: data ?? [],
    isLoading,
    isError,
    error,
  };
}
