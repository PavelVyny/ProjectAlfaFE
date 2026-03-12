import type { Event } from "@/types/event";
import Image from "next/image";
import { CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline";

interface EventCardProps {
  event: Event;
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}


const categoryColors: Record<string, string> = {
  Music: "bg-pink-500/90",
  Tech: "bg-blue-500/90",
  Art: "bg-amber-500/90",
  Food: "bg-orange-500/90",
  Wellness: "bg-emerald-500/90",
  Entertainment: "bg-red-500/90",
};

export function EventCard({ event }: EventCardProps) {
  const categoryBg = categoryColors[event.category] ?? "bg-gray-500/90";

  return (
    <article className="group rounded-xl overflow-hidden bg-zinc-800/80 shadow-xl flex flex-col h-full transition-transform duration-300 ease-out hover:scale-[1.03]">
      <div className="relative aspect-[6/4] bg-zinc-700 overflow-hidden">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <span
          className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-white text-sm font-medium ${categoryBg}`}
        >
          {event.category}
        </span>
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/70 text-white text-sm font-medium">
          ${event.price}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
          {event.title}
        </h3>
        <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-1">
          {event.description}
        </p>
        <div className="space-y-1.5 text-sm text-zinc-400">
          <p className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5 shrink-0 text-orange-500" aria-hidden />
            {formatDate(event.date)}
          </p>
          <p className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 shrink-0 text-orange-500" aria-hidden />
            <span className="line-clamp-1">{event.location}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
