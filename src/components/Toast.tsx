"use client";

import React, { useEffect, useState } from "react";

export interface ToastProps {
	message: string;
	type: "success" | "error" | "info";
	onClose: () => void;
	duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 5000 }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Start animation by showing the toast
		const showTimer = setTimeout(() => {
			setIsVisible(true);
		}, 10); // Small delay to ensure smooth animation

		// Hide the toast after duration
		const hideTimer = setTimeout(() => {
			setIsVisible(false);
			setTimeout(onClose, 300); // Wait for fade out animation
		}, duration);

		return () => {
			clearTimeout(showTimer);
			clearTimeout(hideTimer);
		};
	}, [duration, onClose]);

	const getToastStyles = () => {
		const baseStyles =
			"fixed top-4 right-4 z-50 max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out";

		if (!isVisible) {
			return `${baseStyles} translate-x-full opacity-0`;
		}

		switch (type) {
			case "success":
				return `${baseStyles} border-l-4 border-green-400`;
			case "error":
				return `${baseStyles} border-l-4 border-red-400`;
			case "info":
				return `${baseStyles} border-l-4 border-blue-400`;
			default:
				return baseStyles;
		}
	};

	const getIconStyles = () => {
		switch (type) {
			case "success":
				return "text-green-400";
			case "error":
				return "text-red-400";
			case "info":
				return "text-blue-400";
			default:
				return "text-gray-400";
		}
	};

	const getIcon = () => {
		switch (type) {
			case "success":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				);
			case "error":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				);
			case "info":
				return (
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<div className={getToastStyles()}>
			<div className="p-4">
				<div className="flex items-start">
					<div className={`flex-shrink-0 ${getIconStyles()}`}>{getIcon()}</div>
					<div className="ml-3 w-0 flex-1 pt-0.5">
						<p className="text-sm font-medium text-gray-900">{message}</p>
					</div>
					<div className="ml-4 flex-shrink-0 flex">
						<button
							className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
							onClick={() => {
								setIsVisible(false);
								setTimeout(onClose, 300);
							}}>
							<span className="sr-only">Close</span>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};
