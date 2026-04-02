'use client';

import { useRouter } from 'next/navigation';
import { EventForm, EventFormData } from '@/components/admin/EventForm';
import { useCreateAdminEvent } from '@/hooks/useAdminEventMutations';
import { useToast } from '@/contexts/ToastContext';

export default function NewEventPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const createEvent = useCreateAdminEvent();

  const handleSubmit = async (data: EventFormData) => {
    try {
      await createEvent.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        date: data.date,
        start_time: data.start_time,
        duration_minutes: data.duration_minutes,
        capacity: data.capacity,
        location: data.location,
        image_url: data.image_url,
        status: data.status,
      });
      showToast('Event created successfully', 'success');
      router.push('/admin/dashboard');
    } catch {
      showToast('Failed to create event', 'error');
      throw new Error('Create failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Create Event</h1>
      <EventForm
        mode="create"
        onSubmit={handleSubmit}
        isSubmitting={createEvent.isPending}
      />
    </div>
  );
}
