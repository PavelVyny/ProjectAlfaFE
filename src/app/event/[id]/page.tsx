import { QueryClient, HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eventQueryOptions } from '@/hooks/useEvent';
import { EventDetail } from '@/components/EventDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const queryClient = new QueryClient();
  try {
    const event = await queryClient.fetchQuery(eventQueryOptions(id));
    return {
      title: `${event.title} | ProjectAlfa`,
      description: event.description,
    };
  } catch {
    return { title: "Event not found" };
  }
}

export default async function EventPage({ params }: Props) {
  const { id } = await params;
  const queryClient = new QueryClient();

  try {
    await queryClient.prefetchQuery(eventQueryOptions(id));
  } catch {
    notFound();
  }

  const dehydratedState = dehydrate(queryClient);

  return (
    <HydrationBoundary state={dehydratedState}>
      <EventDetail id={id} />
    </HydrationBoundary>
  );
}
