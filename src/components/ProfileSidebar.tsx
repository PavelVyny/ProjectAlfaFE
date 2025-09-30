"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ProfileSidebarProps {
	className?: string;
	isOpen: boolean;
	onClose: () => void;
}

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
	className = "",
	isOpen,
	onClose,
}) => {
	const pathname = usePathname();

	const menuItems = [
		{
			label: "Profile",
			href: "/profile",
			icon: (
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
					/>
				</svg>
			),
		},
	];

	const isActive = (href: string) => {
		if (href === "/profile") {
			return pathname === "/profile";
		}
		return pathname.startsWith(href);
	};

	return (
		<>
			{/* Sidebar */}
			<div
				className={`
					absolute md:sticky top-0 left-0 z-[999] w-full md:w-64 h-full bg-blue-200 shadow-lg overflow-hidden transform transition-transform duration-300 ease-in-out md:transform-none flex-none
		    	${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
					${className}
				`}>
				<div className="flex flex-col h-full">
					{/* Navigation */}
					<nav className="px-4 py-2 space-y-2">
						{menuItems.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								onClick={onClose}
								className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200
                    ${
											isActive(item.href)
												? "bg-blue-50 text-blue-700"
												: "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
										}
                  `}>
								<span className="mr-3">{item.icon}</span>
								{item.label}
							</Link>
						))}
						<div className="absolute bottom-0 left-0 right-0 px-4 pb-6">
							<Link
								href="/"
								className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white focus:outline-none transition-colors">
								Close profile settings
							</Link>
						</div>
					</nav>
				</div>
			</div>
		</>
	);
};
