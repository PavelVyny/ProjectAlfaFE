import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApiClient } from '@/lib/adminApiClient';
import { adminEventsQueryOptions } from '@/hooks/useAdminEvents';
import type {
  AdminEvent,
  AdminEventStatus,
  CreateAdminEventDto,
  UpdateAdminEventDto,
} from '@/types/admin';

export function useCreateAdminEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAdminEventDto): Promise<AdminEvent> => {
      const response = await adminApiClient.post('/admin/events', payload);
      return response.data.data as AdminEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

export function useUpdateAdminEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: { id: string } & UpdateAdminEventDto): Promise<AdminEvent> => {
      const response = await adminApiClient.put(`/admin/events/${id}`, payload);
      return response.data.data as AdminEvent;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'events', variables.id] });
    },
  });
}

export function useDeleteAdminEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: { id: string }): Promise<void> => {
      await adminApiClient.delete(`/admin/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}

export function useUpdateAdminEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: AdminEventStatus;
    }): Promise<AdminEvent> => {
      const response = await adminApiClient.patch(`/admin/events/${id}/status`, { status });
      return response.data.data as AdminEvent;
    },
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['admin', 'events'] });
      const previousEvents = queryClient.getQueryData(adminEventsQueryOptions.queryKey);
      queryClient.setQueryData(adminEventsQueryOptions.queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          events: old.events.map((e: AdminEvent) => (e.id === id ? { ...e, status } : e)),
        };
      });
      return { previousEvents };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEvents !== undefined) {
        queryClient.setQueryData(adminEventsQueryOptions.queryKey, context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] });
    },
  });
}
