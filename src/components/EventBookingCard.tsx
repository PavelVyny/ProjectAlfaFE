"use client";

import { useState } from "react";
import { BookingModal } from "@/components/BookingModal";

interface EventBookingCardProps {
  pricePerSeat: number;
  eventId: string;
  title: string;
  //qty: number;
  className?: string;
  compact?: boolean;
}

export function EventBookingCard({
  pricePerSeat,
  eventId,
  title,
  className = "",
  compact,
}: EventBookingCardProps) {
  const [qty, setQty] = useState(1);
  const [isOpen, setIsOpen] = useState(false);

  const total = qty * pricePerSeat;

  const shell = compact
    ? "rounded-xl border border-zinc-700/90 bg-zinc-900/70 p-4 shadow-lg ring-1 ring-white/5 backdrop-blur-sm sm:p-5"
    : "rounded-2xl border border-zinc-700/90 bg-zinc-900/70 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm sm:p-8";

  return (
    <>
      <div className={`mt-10 w-full ${shell} ${className}`.trim()}>
        <div
          className={
            compact
              ? "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
              : "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
          }
        >
          <div>
            <p className={`font-medium uppercase tracking-wide text-zinc-500 ${compact ? "text-[10px]" : "text-xs"}`}>
              Price per seat
            </p>
            <p
              className={`mt-0.5 font-bold tabular-nums text-white ${compact ? "text-2xl sm:text-3xl" : "text-4xl"}`}
            >
              ${pricePerSeat}
            </p>
          </div>

          <div className={`flex items-center self-end sm:self-auto ${compact ? "gap-3" : "gap-4"}`}>
            <span className={`text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>Qty</span>
            <div
              className={
                compact
                  ? "flex items-center gap-0.5 rounded-lg border border-zinc-600 bg-zinc-800/80 p-0.5"
                  : "flex items-center gap-1 rounded-xl border border-zinc-600 bg-zinc-800/80 p-1"
              }
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className={`flex items-center justify-center rounded-md font-medium text-white transition hover:bg-zinc-700 ${compact ? "h-8 w-8 text-base" : "h-10 w-10 rounded-lg text-lg"}`}
              >
                −
              </button>

              <span
                className={`min-w-[1.75rem] text-center font-semibold tabular-nums ${compact ? "text-sm" : "text-lg"}`}
              >
                {qty}
              </span>

              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className={`flex items-center justify-center rounded-md font-medium text-white transition hover:bg-zinc-700 ${compact ? "h-8 w-8 text-base" : "h-10 w-10 rounded-lg text-lg"}`}
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div
          className={`flex items-center justify-between border-t border-zinc-700 ${compact ? "mt-4 pt-4" : "mt-6 pt-6"}`}
        >
          <span className={`text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>
            Total ({qty} seat{qty !== 1 ? "s" : ""})
          </span>
          <span
            className={`font-bold tabular-nums text-orange-500 ${compact ? "text-xl" : "text-2xl"}`}
          >
            ${total}
          </span>
        </div>

        {/* КНОПКА */}
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99] ${compact ? "mt-4 py-2.5 text-sm sm:py-3 sm:text-base" : "mt-6 py-4 text-base"}`}
        >
          Book Now
        </button>
      </div>

      {/* MODAL */}
      <BookingModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        event={{
          id: eventId,
          title,
          price: total,
        }}
        qty={qty}
      />
    </>
  );
}

