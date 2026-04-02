'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminEvents } from '@/hooks/useAdminEvents';
import {
  useDeleteAdminEvent,
  useUpdateAdminEventStatus,
} from '@/hooks/useAdminEventMutations';
import { useToast } from '@/contexts/ToastContext';
import { CategoryBadge } from '@/components/common/CategoryBadge';
import type { AdminEvent, AdminEventStatus } from '@/types/admin';
import type { EventCategory } from '@/types/event';

// ---- Status badge ----
function StatusBadge({ status }: { status: AdminEventStatus }) {
  const styles: Record<AdminEventStatus, string> = {
    DRAFT: 'bg-zinc-700 text-zinc-300',
    PUBLISHED: 'bg-green-900/50 text-green-400 border border-green-800',
    CANCELLED: 'bg-red-900/50 text-red-400 border border-red-800',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

// ---- Loading skeleton ----
function LoadingSkeletonTable() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      <div className="h-10 bg-zinc-800 border-b border-zinc-700" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 border-b border-zinc-800 bg-zinc-900" />
      ))}
    </div>
  );
}

// ---- Error message ----
function ErrorMessage() {
  return (
    <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center">
      <p className="text-red-400 font-medium">Failed to load events.</p>
      <p className="text-red-500 text-sm mt-1">Check your connection or try refreshing.</p>
    </div>
  );
}

// ---- Main dashboard page ----
export default function AdminDashboardPage() {
  const { events, isLoading, isError } = useAdminEvents();
  const updateStatus = useUpdateAdminEventStatus();
  const deleteEvent = useDeleteAdminEvent();
  const { showToast } = useToast();

  const handleStatusChange = (id: string, status: AdminEventStatus) => {
    updateStatus.mutate(
      { id, status },
      {
        onSuccess: () => showToast('Status updated', 'success'),
        onError: () => showToast('Failed to update status', 'error'),
      },
    );
  };

  const handleDelete = (event: AdminEvent) => {
    if (!window.confirm(`Delete "${event.title}"? This action cannot be undone.`)) return;
    deleteEvent.mutate(
      { id: event.id },
      {
        onSuccess: () => showToast('Event deleted', 'success'),
        onError: () => showToast('Failed to delete event', 'error'),
      },
    );
  };

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-orange-500 hover:bg-orange-400 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Create Event
        </Link>
      </div>

      {/* States */}
      {isLoading && <LoadingSkeletonTable />}
      {isError && <ErrorMessage />}

      {/* Events table */}
      {!isLoading && !isError && (
        <>
          {events.length === 0 ? (
            <div className="text-center py-16 text-zinc-500">
              No events yet.{' '}
              <Link href="/admin/events/new" className="text-orange-400 hover:text-orange-300">
                Create one
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    {[
                      'Title',
                      'Category',
                      'Date',
                      'Start Time',
                      'Capacity',
                      'Status',
                      'Actions',
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                    >
                      {/* Title */}
                      <td className="px-4 py-3 text-sm text-zinc-300 font-medium max-w-[200px]">
                        <span className="truncate block" title={event.title}>
                          {event.title}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <CategoryBadge category={event.category as EventCategory} />
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                        {new Date(event.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Start time */}
                      <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                        {event.start_time}
                      </td>

                      {/* Capacity */}
                      <td className="px-4 py-3 text-sm text-zinc-300 whitespace-nowrap">
                        {event.remaining_capacity} / {event.capacity}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={event.status} />
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Status toggle buttons */}
                          {(event.status === 'DRAFT' || event.status === 'CANCELLED') && (
                            <button
                              onClick={() => handleStatusChange(event.id, 'PUBLISHED')}
                              className="text-xs text-green-400 hover:text-green-300 font-medium"
                            >
                              Publish
                            </button>
                          )}
                          {event.status === 'PUBLISHED' && (
                            <button
                              onClick={() => handleStatusChange(event.id, 'DRAFT')}
                              className="text-xs text-zinc-400 hover:text-zinc-300 font-medium"
                            >
                              Unpublish
                            </button>
                          )}
                          {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                            <button
                              onClick={() => handleStatusChange(event.id, 'CANCELLED')}
                              className="text-xs text-red-400 hover:text-red-300 font-medium"
                            >
                              Cancel
                            </button>
                          )}

                          {/* Edit link */}
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-xs text-orange-400 hover:text-orange-300 font-medium"
                          >
                            Edit
                          </Link>

                          {/* Bookings link */}
                          <Link
                            href={`/admin/events/${event.id}/bookings`}
                            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                          >
                            Bookings
                          </Link>

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(event)}
                            className="text-xs text-zinc-500 hover:text-red-400 font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
