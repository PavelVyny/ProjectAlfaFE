"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";

// 📱 телефон (простая, но строгая проверка) 
const phoneRegex = /^\+?\d{10,15}$/; 
// 📸 Instagram username
 const instagramUsernameRegex = /^@?[a-zA-Z0-9._]{3,30}$/; 
// 📸 Instagram URL
 const instagramUrlRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]{3,30}\/?$/;

 

export const schema = z.object({ fullName: z .string() .min(3, "Name must be at least 3 characters")
   .regex(/^[a-zA-Zа-яА-ЯёЁ\s]+$/, "Only letters allowed"), 
   contact: z .string() .min(5, "Enter correct phone or Instagram") 
   .refine((value) => { const v = value.trim(); 
    return ( phoneRegex.test(v) || instagramUsernameRegex.test(v) || instagramUrlRegex.test(v) ); }, "Enter valid phone number or Instagram"), 
    paymentMethod: z.enum(["stripe", "venue"]), });

type FormData = z.infer<typeof schema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    price: number;
  };
  qty: number;
}

export function BookingModal({ isOpen, onClose, event, qty }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      paymentMethod: "stripe",
    },
  });

  const paymentMethod = watch("paymentMethod");

  const onSubmit = async (data: FormData) => {
  if (data.paymentMethod === "venue") {
    alert("Booking confirmed. Pay at venue.");
    onClose();
    return;
  }

  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      eventId: event.id,
      title: event.title,
      price: event.price,
      qty,
    }),
  });

  const { url } = await res.json();

  window.location.href = url;
};

useEffect(() => {
  if (!isOpen) {
    reset();
  }
}, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-zinc-900 rounded-2xl p-6 border border-zinc-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Complete Booking</h2>
            <p className="text-sm text-zinc-400">
              {qty} seat{qty !== 1 ? "s" : ""} · ${event.price} total
            </p>
          </div>

          <button onClick={onClose}>
            <XMarkIcon className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          {/* Inputs */}
          <div className="space-y-3">
            <input
              {...register("fullName")}
              placeholder="Full Name"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl"
            />
            {errors.fullName && (
              <p className="text-red-400 text-sm">{errors.fullName.message}</p>
            )}

            <input
              {...register("contact")}
              placeholder="Phone or Instagram (@username)"
              className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl"
            />
            {errors.contact && (
              <p className="text-red-400 text-sm">{errors.contact.message}</p>
            )}
          </div>

          {/* Payment method */}
          <div>
            <p className="text-xs text-zinc-400 mb-2">PAYMENT METHOD</p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setValue("paymentMethod", "stripe")}
                className={`flex-1 p-3 rounded-xl border ${
                  paymentMethod === "stripe"
                    ? "border-orange-500 text-orange-400"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                Online (Stripe)
              </button>

              <button
                type="button"
                onClick={() => setValue("paymentMethod", "venue")}
                className={`flex-1 p-3 rounded-xl border ${
                  paymentMethod === "venue"
                    ? "border-orange-500 text-orange-400"
                    : "border-zinc-700 text-zinc-400"
                }`}
              >
                Pay at Venue
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-yellow-500 text-white"
          >
            Confirm Booking · ${event.price}
          </button>
        </form>
      </div>
    </div>
  );
}

