"use client";

import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import type { ApiErr } from "../types/api";

interface ProfileContentProps {
	className?: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ className = "" }) => {
	const { user, updateProfile, deleteAccount, sendPasswordReset } = useAuth();
	const { showToast } = useToast();
	const [editNickname, setEditNickname] = useState<string>(user?.nickname || "");
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	return (
		<div className={`flex-1 lg:ml-0 overflow-auto ${className}`}>
			<div className="px-4 py-6 lg:px-8 lg:py-8 min-h-full">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900">Profile settings</h1>
					<p className="mt-2 text-gray-600">Manage your account info and security settings.</p>
				</div>

				{/* Profile Information Card */}
				<div className="bg-white shadow-sm rounded-lg border border-gray-200 mb-6">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">Personal information</h2>
					</div>
					<div className="px-6 py-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">Nickname</label>
								{isEditing ? (
									<input
										type="text"
										value={editNickname}
										onChange={(e) => setEditNickname(e.target.value)}
										className="w-full text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								) : (
									<div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
										{user?.nickname || "Not specified"}
									</div>
								)}
							</div>
							<div></div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
								<div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
									{user?.email || "Not specified"}
								</div>
							</div>
						</div>
						{error && (
							<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
								<p className="text-sm text-red-600">{error}</p>
							</div>
						)}

						<div className="mt-6 flex items-center gap-3">
							{!isEditing ? (
								<button
									onClick={() => {
										setIsEditing(true);
										setError(null);
									}}
									className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
									<svg
										className="w-4 h-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
										/>
									</svg>
									Edit profile
								</button>
							) : (
								<>
									<button
										onClick={async () => {
											setError(null);
											setIsSaving(true);
											try {
												await updateProfile({ nickname: editNickname });
												setIsEditing(false);
												showToast("Profile updated successfully", "success");
											} catch (err: unknown) {
												console.error("Update profile error:", err);
												const apiError = err as ApiErr;
												const errorMessage =
													apiError.response?.data?.details ??
													apiError.response?.data?.error?.details ??
													apiError.response?.data?.message ??
													"Failed to update profile";
												setError(errorMessage);
											} finally {
												setIsSaving(false);
											}
										}}
										disabled={isSaving}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
										{isSaving ? "Saving..." : "Save changes"}
									</button>
									<button
										onClick={() => {
											setEditNickname(user?.nickname || "");
											setIsEditing(false);
											setError(null);
										}}
										disabled={isSaving}
										className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed">
										Cancel
									</button>
								</>
							)}
						</div>
					</div>
				</div>

				{/* Security Card */}
				<div className="bg-white shadow-sm rounded-lg border border-gray-200">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-900">Security</h2>
					</div>
					<div className="px-6 py-6">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-medium text-gray-900">Change password</h3>
									{user?.googleId ? (
										<p className="text-sm text-blue-500">
											You signed in with Google. To change your password, use your Google account
											settings.
										</p>
									) : (
										<p className="text-sm text-gray-500">
											We&apos;ll send you an email with instructions to reset your password.
										</p>
									)}
								</div>
								<button
									onClick={async () => {
										if (!user?.email) {
											showToast("Email not found", "error");
											return;
										}

										// Check if user is a Google user
										if (user?.googleId) {
											showToast(
												"Google users cannot reset their password. Please use Google to sign in.",
												"info",
											);
											return;
										}

										try {
											const message = await sendPasswordReset({ email: user.email });
											showToast(message, "success");
										} catch (error) {
											console.error("Password reset error:", error);
											showToast("Failed to send password reset email", "error");
										}
									}}
									className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md focus:outline-none ${
										user?.googleId
											? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
											: "border-gray-300 text-white bg-blue-600 hover:bg-blue-700"
									}`}>
									{user?.googleId ? (
										<>
											<svg
												className="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
												/>
											</svg>
											Info
										</>
									) : (
										<>
											<svg
												className="w-4 h-4 mr-2"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24">
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
											Send reset email
										</>
									)}
								</button>
							</div>

							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-medium text-red-700">Delete account</h3>
									<p className="text-sm text-red-500">
										This action is irreversible. All data will be deleted.
									</p>
								</div>
								<button
									onClick={async () => {
										if (
											confirm(
												"Are you sure you want to delete the account? This action is irreversible.",
											)
										) {
											await deleteAccount();
										}
									}}
									className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none">
									Delete account
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
