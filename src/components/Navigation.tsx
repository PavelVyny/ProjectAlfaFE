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
			<nav className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex-shrink-0">
							<h1 className="text-xl font-bold text-gray-900">ProjectAlfa</h1>
						</div>
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-3">
								<div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
								<div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
							</div>
						</div>
					</div>
				</div>
			</nav>
		);
	}

	return (
		<>
			<nav className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						{/* Logo/Title with optional hamburger on profile (mobile) */}
						<div className="flex-shrink-0 flex items-center">
							{pathname?.startsWith("/profile") && (
								<button
									onClick={() => {
										if (typeof window !== "undefined") {
											window.dispatchEvent(new CustomEvent("toggleProfileSidebar"));
										}
									}}
									className="md:hidden mr-3 bg-white p-2 rounded-md shadow-md border border-gray-200"
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
							<Link href="/" className="text-xl font-bold text-gray-900">
								ProjectAlfa
							</Link>
						</div>

						{/* Right side navigation */}
						<div className="flex items-center space-x-4">
							{isAuthenticated ? (
								<div className="flex items-center space-x-4">
									<span className="text-sm text-gray-700">
										Hello, {user?.nickname || user?.email}!
									</span>
									<Link
										href="/profile"
										className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white focus:outline-none transition-colors">
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
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
										Logout
									</button>
								</div>
							) : isLoading ? (
								<div className="flex items-center space-x-3">
									<div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
									<div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
								</div>
							) : (
								<div className="flex items-center space-x-3">
									<button
										onClick={() => setIsLoginModalOpen(true)}
										className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
										Login
									</button>
									<button
										onClick={() => setIsRegisterModalOpen(true)}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
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
