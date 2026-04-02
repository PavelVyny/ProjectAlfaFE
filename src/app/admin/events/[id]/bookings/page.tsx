'use client';

import { use } from 'react';
import Link from 'next/link';
import { useAdminEventBookings } from '@/hooks/useAdminEventBookings';
import { useAdminEvents } from '@/hooks/useAdminEvents';

export default function EventBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { bookings, isLoading, isError } = useAdminEventBookings(id);
  const { events } = useAdminEvents();
  const event = events.find((e) => e.id === id);

  return (
    <div>
      {/* Back link + title */}
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="text-sm text-zinc-400 hover:text-zinc-300 mb-2 inline-flex items-center gap-1"
        >
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-white">
          Bookings{event ? `: ${event.title}` : ''}
        </h1>
        {bookings.length > 0 && (
          <p className="text-sm text-zinc-400 mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          Failed to load bookings.
        </div>
      )}

      {/* Bookings table */}
      {!isLoading && !isError && (
        <>
          {bookings.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-16 text-center text-zinc-500">
              No bookings yet for this event.
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Booked At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {bookings.map((booking, index) => (
                    <tr key={booking.id} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-zinc-500">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-zinc-300 font-medium">
                        {booking.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-300">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 font-semibold text-xs">
                          {booking.participant_count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {new Date(booking.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Summary footer */}
              <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50">
                <p className="text-sm text-zinc-400">
                  Total participants:{' '}
                  <span className="text-white font-semibold">
                    {bookings.reduce((sum, b) => sum + b.participant_count, 0)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
