"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { Navigation } from "../../components/Navigation";
import { LoginModal } from "../../components/LoginModal";
import { RegisterModal } from "../../components/RegisterModal";
import { ProfileSidebar } from "../../components/ProfileSidebar";
import { ProfileContent } from "../../components/ProfileContent";

export default function ProfilePage() {
	const { isAuthenticated, isLoading, user, logout } = useAuth();
	const router = useRouter();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		if (!isLoading && !isAuthenticated) {
			router.push("/");
		}
	}, [isAuthenticated, isLoading, router]);

	if (!isClient) {
		return null;
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return (
		<div className="fixed inset-0 bg-gray-50 flex flex-col">
			<nav className="bg-white shadow-sm border-b border-gray-200 md:hidden">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center">
							<button
								onClick={() => setIsSidebarOpen(true)}
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
							<Link href="/" className="text-xl font-bold text-gray-900">
								ProjectAlfa
							</Link>
						</div>
						<div className="flex items-center space-x-3">
							{isAuthenticated ? (
								<>
									<span className="text-sm text-gray-700">
										Hello, {user?.nickname || user?.email}
									</span>
									<button
										onClick={() => logout()}
										className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
										Logout
									</button>
								</>
							) : (
								<>
									<button
										onClick={() => setIsLoginModalOpen(true)}
										className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
										Login
									</button>
									<button
										onClick={() => setIsRegisterModalOpen(true)}
										className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
										Register
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			</nav>

			{/* Desktop header */}
			<div className="hidden md:block">
				<Navigation />
			</div>

			{/* Body */}
			<div className="flex flex-1 overflow-hidden relative">
				<ProfileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
				<ProfileContent className={"min-w-0"} />
			</div>

			{/* Modals for mobile header */}
			<RegisterModal isOpen={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} />
			<LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
		</div>
	);
}
