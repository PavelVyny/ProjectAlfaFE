"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { RegisterModal } from "./RegisterModal";
import { LoginModal } from "./LoginModal";

export const Navigation: React.FC = () => {
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setIsClient(true);
	}, []);

	const handleLogout = () => {
		logout();
	};

	if (!isClient) {
		return (
			<nav className="bg-zinc-900">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<div className="flex justify-between items-center min-h-16 py-3 gap-3">
						<div className="min-w-0 flex flex-col gap-0.5 max-w-[55%] sm:max-w-none">
							<h1 className="text-lg font-bold text-orange-500 sm:text-2xl">ProjectAlfa</h1>
							<p className="text-xs text-zinc-400 sm:text-sm max-w-[16rem] sm:max-w-none">Find and book unforgettable experiences near you.</p>
						</div>
						<div className="flex items-center space-x-4 shrink-0">
							<div className="flex items-center space-x-3">
								<div className="animate-pulse bg-zinc-700 h-8 w-16 rounded"></div>
								<div className="animate-pulse bg-zinc-700 h-8 w-20 rounded"></div>
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	}

	return (
		<>
			<nav className="bg-zinc-900">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					<div className="flex justify-between items-center min-h-16 py-3 gap-3">
						{/* Logo/Title with optional hamburger on profile (mobile) */}
						<div className="min-w-0 flex items-center gap-3 max-w-[55%] sm:max-w-none">
							{pathname?.startsWith("/profile") && (
								<button
									onClick={() => {
										if (typeof window !== "undefined") {
											window.dispatchEvent(new CustomEvent("toggleProfileSidebar"));
										}
									}}
									className="md:hidden bg-zinc-800 p-2 rounded-md border border-zinc-600 text-white hover:bg-zinc-700 shrink-0"
									aria-label="Open menu">
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 6h16M4 12h16M4 18h16"
										/>
									</svg>
								</button>
							)}
							<div className="flex flex-col gap-0.5 min-w-0">
								<Link
									href="/"
									className="text-lg font-bold text-orange-500 w-fit hover:text-orange-400 sm:text-2xl">
									ProjectAlfa
								</Link>
								<p className="text-xs text-zinc-400 sm:text-sm max-w-[16rem] sm:max-w-none">Find and book unforgettable experiences near you.</p>
							</div>
						</div>

						{/* Right side navigation */}
						<div className="flex items-center shrink-0">
							{isAuthenticated ? (
								<div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
									<div className="flex items-center space-x-4 order-1 sm:order-2">
										<Link
											href="/profile"
											className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white focus:outline-none transition-colors">
											<svg
												className="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
												/>
											</svg>
											Profile
										</Link>
										<button
											onClick={handleLogout}
											className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-red-500">
											Logout
										</button>
									</div>
									<span className="text-sm text-zinc-300 order-2 sm:order-1">
										Hello, {user?.nickname || user?.email}!
									</span>
								</div>
							) : isLoading ? (
								<div className="flex items-center space-x-3">
									<div className="animate-pulse bg-zinc-700 h-8 w-16 rounded"></div>
									<div className="animate-pulse bg-zinc-700 h-8 w-20 rounded"></div>
								</div>
							) : (
								<div className="flex items-center space-x-3">
									<button
										onClick={() => setIsLoginModalOpen(true)}
										className="inline-flex items-center px-4 py-2 border border-zinc-600 text-sm font-medium rounded-md text-zinc-200 bg-transparent hover:bg-zinc-800 focus:outline-none">
										Login
									</button>
									<button
										onClick={() => setIsRegisterModalOpen(true)}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none">
										Register
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Modals */}
			<RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
			<LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
		</>
	);
};
