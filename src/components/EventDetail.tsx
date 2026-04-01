"use client";

import { useEvent } from '@/hooks/useEvent';
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { EventBookingCard } from "@/components/EventBookingCard";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

interface Props {
  id: string;
}

function formatDateShort(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EventDetail({ id }: Props) {
  const { data: event, isLoading, isError } = useEvent(id);

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-zinc-900 text-zinc-400">
        <p className="text-sm">Loading...</p>
      </div>
    );
  }

  if (isError || !event) {
    notFound();
  }

  return (
    <div className="flex h-[100dvh] max-h-[100dvh] flex-col overflow-hidden overflow-x-hidden overscroll-none bg-zinc-900 text-white">
      <div className="relative w-full shrink-0">
        <div className="relative h-[min(56vh,430px)] w-full overflow-hidden bg-zinc-900 sm:h-[min(62vh,560px)] md:h-[min(66vh,640px)] lg:h-[min(86vh,980px)]">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent to-[30%]" />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(86%,720px)] bg-[linear-gradient(to_top,rgb(24_24_27)_0%,rgb(24_24_27/0.97)_12%,rgb(24_24_27/0.86)_26%,rgb(24_24_27/0.62)_42%,rgb(24_24_27/0.34)_58%,rgb(24_24_27/0.14)_74%,transparent_90%)]"
            aria-hidden
          />
          <div className="absolute left-0 top-0 z-10 p-4 sm:p-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur-md transition hover:bg-black/55"
            >
              <ArrowLeftIcon className="h-4 w-4 shrink-0" aria-hidden />
              Back
            </Link>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-20 mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col bg-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:-mt-28 sm:px-6 md:-mt-32 lg:-mt-48">
        <div className="min-h-0 flex-1 overflow-hidden lg:overflow-y-auto lg:overscroll-y-contain lg:[-webkit-overflow-scrolling:touch]">
          <div className="flex min-h-full w-full flex-col justify-end">
            <div className="flex w-full flex-col items-start text-left">
              <div className="mb-3 sm:mb-4">
                <CategoryBadge
                  category={event.category}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide shadow-[0_2px_12px_rgba(0,0,0,0.45)] sm:px-3.5 sm:py-1.5 sm:text-xs"
                />
              </div>

              <h1 className="line-clamp-2 text-balance text-xl font-bold leading-snug tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] sm:text-3xl sm:leading-tight md:text-[1.75rem] md:leading-tight">
                {event.title}
              </h1>

              <div className="mt-4 flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 text-xs leading-snug text-zinc-400 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)] sm:mt-7 sm:gap-x-4 sm:gap-y-2 sm:text-sm sm:leading-normal">
                <span className="inline-flex shrink-0 items-center gap-1 sm:gap-1.5">
                  <CalendarDaysIcon className="h-3.5 w-3.5 shrink-0 text-orange-500 sm:h-4 sm:w-4" aria-hidden />
                  {formatDateShort(event.date)}
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 sm:gap-1.5">
                  <ClockIcon className="h-3.5 w-3.5 shrink-0 text-orange-500 sm:h-4 sm:w-4" aria-hidden />
                  {event.start_time}
                </span>
                <span className="inline-flex min-w-0 max-w-full items-start gap-1 sm:gap-1.5">
                  <MapPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500 sm:h-4 sm:w-4" aria-hidden />
                  <span className="break-words">{event.location}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 sm:gap-1.5">
                  <UsersIcon className="h-3.5 w-3.5 shrink-0 text-orange-500 sm:h-4 sm:w-4" aria-hidden />
                  <span>{event.remaining_capacity} seats left</span>
                </span>
              </div>

              <p className="mt-5 line-clamp-3 w-full text-pretty text-xs leading-relaxed text-zinc-400 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] sm:mt-7 sm:line-clamp-4 sm:text-sm sm:leading-relaxed lg:mt-9 lg:line-clamp-none">
                {event.description}
              </p>
            </div>

            <div className="mt-5 w-full sm:mt-9">
              <EventBookingCard pricePerSeat={event.price} compact className="!mt-0" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
