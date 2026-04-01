import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Event } from '@/types/event';

export const eventQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ['events', id],
    queryFn: async (): Promise<Event> => {
      const response = await apiClient.get(`/events/${id}`);
      // axios: response.data = { success, data: Event }
      return response.data.data as Event;
    },
    staleTime: 60 * 1000,
  });

export function useEvent(id: string) {
  return useQuery(eventQueryOptions(id));
}
