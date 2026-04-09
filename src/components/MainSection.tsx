"use client";

import { useMemo, useState } from "react";
import { EventCard } from "./EventCard";
import { CATEGORIES, type EventCategory } from "@/types/event";
import { SearchInput } from "./common/SearchInput";
import { useEvents } from "@/hooks/useEvents";

export function MainSection() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<EventCategory | "All">("All");

  const { events = [], isLoading, isError } = useEvents();

  const filtered = useMemo(() => {
    let list = events;
    if (category !== "All") {
      list = list.filter((e) => e.category.toUpperCase() === category.toUpperCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [events, category, search]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <p className="text-zinc-400 text-sm">Loading events...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Failed to load events. Please refresh.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search by title */}
        <div className="mb-6">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search events..."
          />
        </div>

        {/* Filter by event type */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-orange-500 text-white"
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Event cards grid */}
        <section aria-label="Event list">
          {filtered.length > 0 ? (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 list-none p-0 m-0">
              {filtered.map((event) => (
                <li key={event.id}>
                  <EventCard event={event} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500 text-center py-12">
              No events match your search. Try another category or search term.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
