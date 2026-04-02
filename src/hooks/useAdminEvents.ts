import { queryOptions, useQuery } from '@tanstack/react-query';
import { adminApiClient } from '@/lib/adminApiClient';
import type { AdminEvent, AdminEventsMeta } from '@/types/admin';

interface AdminEventsResult {
  events: AdminEvent[];
  meta: AdminEventsMeta | undefined;
}

export const adminEventsQueryOptions = queryOptions({
  queryKey: ['admin', 'events'] as const,
  queryFn: async (): Promise<AdminEventsResult> => {
    const response = await adminApiClient.get('/admin/events');
    // axios: response.data = { success, data: { data: AdminEvent[], meta: {...} } }
    const payload = response.data.data;
    return {
      events: payload.data as AdminEvent[],
      meta: payload.meta as AdminEventsMeta,
    };
  },
  staleTime: 0,
});

export function useAdminEvents() {
  const { data, isLoading, isError, error } = useQuery(adminEventsQueryOptions);
  return {
    events: data?.events ?? [],
    meta: data?.meta,
    isLoading,
    isError,
    error,
  };
}
