"use client";

import React, { useEffect, useRef } from "react";

interface GoogleSignInButtonProps {
	onSuccess: (response: { credential: string }) => void;
	onError?: (error: Error | string) => void;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onSuccess, onError }) => {
	const buttonRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const initializeGoogle = () => {
			if (typeof window !== "undefined" && window.google?.accounts?.id && buttonRef.current) {
				try {
					// Clear any existing content
					buttonRef.current.innerHTML = "";

					// Initialize Google Sign-In
					window.google.accounts.id.initialize({
						client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
						callback: onSuccess,
					});

					// Render button
					window.google.accounts.id.renderButton(buttonRef.current, {
						theme: "outline",
						size: "large",
						width: 200,
						text: "signin_with",
						shape: "rectangular",
					});

					console.log("Google button rendered successfully");
				} catch (error) {
					console.error("Error initializing Google button:", error);
					onError?.(error instanceof Error ? error : String(error));
				}
			}
		};

		// Check if Google is already loaded
		if (typeof window !== "undefined" && window.google?.accounts?.id) {
			initializeGoogle();
		} else {
			// Wait for Google to load
			const checkGoogle = setInterval(() => {
				if (typeof window !== "undefined" && window.google?.accounts?.id) {
					clearInterval(checkGoogle);
					initializeGoogle();
				}
			}, 100);

			return () => clearInterval(checkGoogle);
		}
	}, [onSuccess, onError]);

	return <div ref={buttonRef} className="w-full h-12 flex justify-center items-center" />;
};
