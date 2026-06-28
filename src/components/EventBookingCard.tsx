"use client";

import { useState } from "react";
import { useBookEvent } from "@/hooks/useBookEvent";
import { useToast } from "@/contexts/ToastContext";

interface EventBookingCardProps {
  eventId: string;
  pricePerSeat: number;
  className?: string;
  compact?: boolean;
}

export function EventBookingCard({ 
  eventId, // добавил согласно заданию! 
  pricePerSeat, 
  className = "", 
  compact 
}: EventBookingCardProps) {
  const [qty, setQty] = useState(1);
  const [email, setEmail] = useState(""); // добавил согласно заданию! 
  const { showToast } = useToast(); // добавил согласно заданию! 
  const bookEvent = useBookEvent(); // добавил согласно заданию! 
  const total = qty * pricePerSeat;

  const handleBook = () => { // добавил согласно заданию!  
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    bookEvent.mutate(
      {
        eventId,
        email,
        participant_count: qty,
      },
      {
        onSuccess: () => {
          showToast("Booking successful!", "success");
          setEmail("");
          setQty(1);
        },
        onError: (error: any) => {
          const message = error.response?.data?.message || "Failed to book event";
          showToast(message, "error");
        },
      }
    );
  };

  const shell = compact
    ? "rounded-xl border border-zinc-700/90 bg-zinc-900/70 p-3.5 shadow-lg ring-1 ring-white/5 backdrop-blur-sm sm:p-4"
    : "rounded-2xl border border-zinc-700/90 bg-zinc-900/70 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm sm:p-8";

  return (
    <div className={`${compact ? "mt-6" : "mt-8"} w-full ${shell} ${className}`.trim()}>
      <div
        className={compact ? "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between" : "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"}
      >
        <div>
          <p className={`font-medium uppercase tracking-wide text-zinc-500 ${compact ? "text-[10px]" : "text-xs"}`}>
            Price per seat
          </p>
          <p
            className={`mt-0.5 font-bold tabular-nums text-white ${compact ? "text-xl sm:text-2xl" : "text-4xl"}`}
          >
            ${pricePerSeat}
          </p>
        </div>

        <div className={`flex items-center self-end sm:self-auto ${compact ? "gap-2" : "gap-4"}`}>
          <span className={`text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>Qty</span>
          <div
            className={
              compact
                ? "flex items-center gap-0.5 rounded-lg border border-zinc-600 bg-zinc-800/80 p-0.5"
                : "flex items-center gap-1 rounded-xl border border-zinc-600 bg-zinc-800/80 p-1"
            }
          >
            <button  // изменил согласно заданию! 
              type="button"
              disabled={bookEvent.isPending}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className={`flex items-center justify-center rounded-md font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 ${compact ? "h-7 w-7 text-sm" : "h-10 w-10 rounded-lg text-lg"}`}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span
              className={`min-w-[1.5rem] text-center font-semibold tabular-nums ${compact ? "text-xs" : "text-lg"}`}
            >
              {qty}
            </span>
            <button  // изменил согласно заданию! 
              type="button"
              disabled={bookEvent.isPending}
              onClick={() => setQty((q) => q + 1)}
              className={`flex items-center justify-center rounded-md font-medium text-white transition hover:bg-zinc-700 disabled:opacity-50 ${compact ? "h-7 w-7 text-sm" : "h-10 w-10 rounded-lg text-lg"}`}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className={compact ? "mt-3" : "mt-6"}> {/* здесь были трудности. сам не смог. пришлось гпт просить */}
        <label htmlFor="email" className={`block font-medium text-zinc-400 mb-1 ${compact ? "text-[10px]" : "text-xs"}`}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={bookEvent.isPending}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:opacity-50 sm:text-sm"
        />
      </div>

      <div
        className={`flex items-center justify-between border-t border-zinc-700 ${compact ? "mt-3 pt-3" : "mt-6 pt-6"}`}
      >
        <span className={`text-zinc-400 ${compact ? "text-xs" : "text-sm"}`}>
          Total ({qty} seat{qty !== 1 ? "s" : ""})
        </span>
        <span className={`font-bold tabular-nums text-orange-500 ${compact ? "text-lg" : "text-2xl"}`}>${total}</span>
      </div>

      <button
        type="button"
        onClick={handleBook}
        disabled={bookEvent.isPending}
        className={`w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-300 font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-105 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400 disabled:opacity-50 disabled:cursor-not-allowed ${compact ? "mt-3 py-2 text-sm sm:py-2.5" : "mt-6 py-4 text-base"}`}
      >
        {bookEvent.isPending ? "Booking..." : "Book Now"}
      </button>
    </div>
  );
}
