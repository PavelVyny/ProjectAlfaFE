"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastProps } from "../components/Toast";

interface ToastContextType {
	showToast: (message: string, type: ToastProps["type"], duration?: number) => void;
	hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};

interface ToastState {
	message: string;
	type: ToastProps["type"];
	duration?: number;
	isVisible: boolean;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toast, setToast] = useState<ToastState | null>(null);

	const showToast = useCallback((message: string, type: ToastProps["type"], duration?: number) => {
		setToast({
			message,
			type,
			duration,
			isVisible: true,
		});
	}, []);

	const hideToast = useCallback(() => {
		setToast(null);
	}, []);

	const value: ToastContextType = {
		showToast,
		hideToast,
	};

	return (
		<ToastContext.Provider value={value}>
			{children}
			{toast && (
				<Toast
					message={toast.message}
					type={toast.type}
					duration={toast.duration}
					onClose={hideToast}
				/>
			)}
		</ToastContext.Provider>
	);
};
