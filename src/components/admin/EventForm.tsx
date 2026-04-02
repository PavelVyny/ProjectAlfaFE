'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import type { AdminEventStatus } from '@/types/admin';

export interface EventFormData {
  title: string;
  description: string;
  category: string;
  price: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  location: string;
  image_url: string;
  status: AdminEventStatus;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isSubmitting: boolean;
}

const inputClass =
  'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm';
const labelClass = 'block text-sm font-medium text-zinc-300 mb-1.5';
const errorClass = 'mt-1 text-xs text-red-400';

const EVENT_CATEGORIES = ['Music', 'Tech', 'Art', 'Food', 'Wellness', 'Entertainment'];
const EVENT_STATUSES: AdminEventStatus[] = ['DRAFT', 'PUBLISHED', 'CANCELLED'];

export function EventForm({ mode, defaultValues, onSubmit, isSubmitting }: EventFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: defaultValues ?? { status: 'DRAFT' },
  });

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            type="text"
            className={inputClass}
            placeholder="Event title"
            {...register('title', {
              required: 'Title is required',
              maxLength: { value: 200, message: 'Title must be 200 characters or less' },
            })}
          />
          {errors.title && <p className={errorClass}>{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            className={`${inputClass} resize-none`}
            placeholder="Event description"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            className={inputClass}
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select a category</option>
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className={errorClass}>{errors.category.message}</p>}
        </div>

        {/* Status — edit mode only */}
        {mode === 'edit' && (
          <div>
            <label htmlFor="status" className={labelClass}>
              Status
            </label>
            <select
              id="status"
              className={inputClass}
              {...register('status', { required: 'Status is required' })}
            >
              {EVENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.status && <p className={errorClass}>{errors.status.message}</p>}
          </div>
        )}

        {/* Price + Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className={labelClass}>
              Price (€)
            </label>
            <input
              id="price"
              type="number"
              min={0}
              step={0.01}
              className={inputClass}
              placeholder="0.00"
              {...register('price', {
                required: 'Price is required',
                min: { value: 0, message: 'Price must be 0 or more' },
                valueAsNumber: true,
              })}
            />
            {errors.price && <p className={errorClass}>{errors.price.message}</p>}
          </div>

          <div>
            <label htmlFor="capacity" className={labelClass}>
              Capacity
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              className={inputClass}
              placeholder="100"
              {...register('capacity', {
                required: 'Capacity is required',
                min: { value: 1, message: 'Capacity must be at least 1' },
                valueAsNumber: true,
              })}
            />
            {errors.capacity && <p className={errorClass}>{errors.capacity.message}</p>}
          </div>
        </div>

        {/* Date + Start Time + Duration */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className={labelClass}>
              Date
            </label>
            <input
              id="date"
              type="date"
              className={inputClass}
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && <p className={errorClass}>{errors.date.message}</p>}
          </div>

          <div>
            <label htmlFor="start_time" className={labelClass}>
              Start Time
            </label>
            <input
              id="start_time"
              type="time"
              className={inputClass}
              {...register('start_time', { required: 'Start time is required' })}
            />
            {errors.start_time && <p className={errorClass}>{errors.start_time.message}</p>}
          </div>

          <div>
            <label htmlFor="duration_minutes" className={labelClass}>
              Duration (min)
            </label>
            <input
              id="duration_minutes"
              type="number"
              min={1}
              className={inputClass}
              placeholder="60"
              {...register('duration_minutes', {
                required: 'Duration is required',
                min: { value: 1, message: 'Duration must be at least 1 minute' },
                valueAsNumber: true,
              })}
            />
            {errors.duration_minutes && (
              <p className={errorClass}>{errors.duration_minutes.message}</p>
            )}
          </div>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            type="text"
            className={inputClass}
            placeholder="Venue name or address"
            {...register('location', { required: 'Location is required' })}
          />
          {errors.location && <p className={errorClass}>{errors.location.message}</p>}
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="image_url" className={labelClass}>
            Image URL
          </label>
          <input
            id="image_url"
            type="text"
            className={inputClass}
            placeholder="https://images.unsplash.com/..."
            {...register('image_url', { required: 'Image URL is required' })}
          />
          {errors.image_url && <p className={errorClass}>{errors.image_url.message}</p>}
        </div>

        {/* Submit + Cancel */}
        <div className="flex items-center pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSubmitting
              ? mode === 'create'
                ? 'Creating...'
                : 'Saving...'
              : mode === 'create'
                ? 'Create Event'
                : 'Save Changes'}
          </button>
          <Link
            href="/admin/dashboard"
            className="text-sm text-zinc-400 hover:text-zinc-300 ml-4"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
