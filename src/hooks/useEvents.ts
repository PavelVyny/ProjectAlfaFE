import { queryOptions, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { Event } from '@/types/event';

interface EventsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EventsResult {
  events: Event[];
  meta: EventsMeta | undefined;
}

export const eventsQueryOptions = queryOptions({
  queryKey: ['events'],
  queryFn: async (): Promise<EventsResult> => {
    const response = await apiClient.get('/events');
    // axios: response.data = { success, data: { data: Event[], meta: {...} } }
    const payload = response.data.data;
    return {
      events: payload.data as Event[],
      meta: payload.meta as EventsMeta,
    };
  },
  staleTime: 60 * 1000,
});

export function useEvents() {
  const { data, isLoading, isError, error } = useQuery(eventsQueryOptions);
  return {
    events: data?.events ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
  };
}
