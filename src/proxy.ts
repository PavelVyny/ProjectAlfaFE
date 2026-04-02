import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Admin route protection is handled client-side in AdminLayout (Plan 02).
// Next.js middleware runs on the Edge runtime and cannot access localStorage,
// so the admin_token check lives in the AdminLayout component instead.
export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
