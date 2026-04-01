import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface BookEventPayload {
  eventId: string;
  email: string;
  participant_count: number;
}

export function useBookEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, email, participant_count }: BookEventPayload) => {
      const response = await apiClient.post(`/events/${eventId}/book`, {
        email,
        participant_count,
      });
      return response.data.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate the specific event so remaining_capacity refreshes
      queryClient.invalidateQueries({ queryKey: ['events', variables.eventId] });
      // Also invalidate the events list
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
