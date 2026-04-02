'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { HomeIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', Icon: HomeIcon },
  { href: '/admin/events/new', label: 'Create Event', Icon: PlusCircleIcon },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const adminAuth = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const { isAdminAuthenticated, isLoading, admin } = adminAuth;
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading && !isAdminAuthenticated) {
      router.replace('/admin/login');
    }
  }, [isLoading, isAdminAuthenticated, router, isLoginPage]);

  // On the login page, render children directly (no sidebar)
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Show spinner while loading or while redirecting unauthenticated users
  if (isLoading || !isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const handleLogout = async () => {
    await adminAuth.logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed inset-y-0 left-0">
        {/* Logo area */}
        <div className="px-6 py-5 border-b border-zinc-800">
          <span className="text-xl font-bold text-white">ProjectAlfa</span>
          <span className="ml-2 text-xs text-orange-500 font-medium uppercase tracking-wider">
            Admin
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navLinks.map(({ href, label, Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className={
                  isActive
                    ? 'flex items-center gap-3 px-4 py-2.5 rounded-lg bg-zinc-800 text-white font-medium text-sm'
                    : 'flex items-center gap-3 px-4 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors text-sm'
                }
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Admin info at bottom */}
        <div className="px-4 py-4 border-t border-zinc-800">
          <p className="text-sm text-zinc-400 truncate">{admin?.email}</p>
          <p className="text-xs text-zinc-500 truncate">{admin?.name}</p>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div />
          <button
            onClick={handleLogout}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
