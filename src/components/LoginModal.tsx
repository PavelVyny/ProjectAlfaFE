"use client";

import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { GoogleSignInButton } from "./GoogleSignInButton";

interface LoginModalProps {
	isOpen: boolean;
	onClose: () => void;
}

interface LoginFormData {
	email: string;
	password: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
	const { login, loginWithGoogle } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<LoginFormData>();

	const handleGoogleSignIn = async (response: { credential: string }) => {
		setIsLoading(true);
		setError(null);

		try {
			await loginWithGoogle(response.credential);
			onClose();
		} catch {
			setError("Google sign-in failed");
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			await login(data.email, data.password);
			reset();
			onClose();
		} catch (error) {
			const errorMessage =
				error && typeof error === "object" && "response" in error
					? (error.response as { data?: { message?: string } })?.data?.message
					: "Login error";
			setError(errorMessage || "Login error");
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		reset();
		setError(null);
		onClose();
	};

	return (
		<Dialog open={isOpen} onClose={handleClose} className="relative z-50">
			<div className="fixed inset-0 bg-black/30" aria-hidden="true" />

			<div className="fixed inset-0 flex items-center justify-center p-4">
				<Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-8 shadow-xl">
					<div className="flex items-center justify-between mb-6">
						<Dialog.Title className="text-lg font-semibold text-gray-900">Login</Dialog.Title>
						<button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
							<XMarkIcon className="h-6 w-6" />
						</button>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
								Email
							</label>
							<input
								{...register("email", {
									required: "Email is required",
									pattern: {
										value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
										message: "Invalid email",
									},
								})}
								type="email"
								id="email"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
								placeholder="Enter email"
							/>
							{errors.email && <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>}
						</div>

						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
								Password
							</label>
							<input
								{...register("password", { required: "Password is required" })}
								type="password"
								id="password"
								className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-3"
								placeholder="Enter password"
							/>
							{errors.password && (
								<p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
							)}
						</div>

						{error && (
							<div className="rounded-md bg-red-50 p-4">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-md bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50">
							{isLoading ? "Logging in..." : "Login"}
						</button>

						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">Or continue with</span>
							</div>
						</div>

						<div className="h-12 flex items-center justify-center">
							<GoogleSignInButton
								onSuccess={handleGoogleSignIn}
								onError={(error) => {
									console.error("Google Sign-In error:", error);
									setError("Google sign-in failed");
								}}
							/>
						</div>
					</form>
				</Dialog.Panel>
			</div>
		</Dialog>
	);
};
