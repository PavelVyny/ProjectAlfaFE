"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RegisterModal } from "./RegisterModal";
import { LoginModal } from "./LoginModal";

export const Navigation: React.FC = () => {
	const { user, isAuthenticated, isLoading, logout } = useAuth();
	const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	const handleLogout = () => {
		logout();
	};

	// Не рендерим динамический контент пока не загружен клиент
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
						{/* Logo/Title */}
						<div className="flex-shrink-0">
							<h1 className="text-xl font-bold text-gray-900">ProjectAlfa</h1>
						</div>

						{/* Right side navigation */}
						<div className="flex items-center space-x-4">
							{isAuthenticated ? (
								<div className="flex items-center space-x-4">
									<span className="text-sm text-gray-700">
										Hello, {user?.firstName || user?.email}!
									</span>
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
										className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
										Login
									</button>
									<button
										onClick={() => setIsRegisterModalOpen(true)}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
