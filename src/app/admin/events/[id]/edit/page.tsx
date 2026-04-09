'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { EventForm, EventFormData } from '@/components/admin/EventForm';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import { useUpdateAdminEvent } from '@/hooks/useAdminEventMutations';
import { useToast } from '@/contexts/ToastContext';
import type { AdminEventStatus } from '@/types/admin';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { events, isLoading } = useAdminEvents();
  const updateEvent = useUpdateAdminEvent();

  const event = events.find((e) => e.id === id);

  const handleSubmit = async (data: EventFormData) => {
    try {
      await updateEvent.mutateAsync({
        id,
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
      showToast('Event updated successfully', 'success');
      router.push('/admin/dashboard');
    } catch {
      showToast('Failed to update event', 'error');
      throw new Error('Update failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-zinc-400 text-center py-16">
        Event not found.
      </div>
    );
  }

  const defaultValues: Partial<EventFormData> = {
    title: event.title,
    description: event.description,
    category: event.category,
    price: event.price,
    date: event.date?.split('T')[0] ?? event.date,
    start_time: event.start_time,
    duration_minutes: event.duration_minutes,
    capacity: event.capacity,
    location: event.location,
    image_url: event.image_url,
    status: event.status as AdminEventStatus,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Edit Event</h1>
      <EventForm
        mode="edit"
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        isSubmitting={updateEvent.isPending}
      />
    </div>
  );
}
