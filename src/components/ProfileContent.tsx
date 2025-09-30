"use client";

import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";

interface ProfileContentProps {
	className?: string;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ className = "" }) => {
	const { user, updateProfile, deleteAccount, changePassword } = useAuth();
	const [editEmail, setEditEmail] = useState<string>(user?.email || "");
	const [editNickname, setEditNickname] = useState<string>(user?.nickname || "");
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
	const [currentPassword, setCurrentPassword] = useState<string>("");
	const [newPassword, setNewPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [pwdMessage, setPwdMessage] = useState<string>("");
	const [pwdError, setPwdError] = useState<string>("");

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
								{isEditing ? (
									<input
										type="email"
										value={editEmail}
										onChange={(e) => setEditEmail(e.target.value)}
										className="w-full text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								) : (
									<div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
										{user?.email || "Not specified"}
									</div>
								)}
							</div>
						</div>
						<div className="mt-6 flex items-center gap-3">
							{!isEditing ? (
								<button
									onClick={() => setIsEditing(true)}
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
											await updateProfile({ email: editEmail, nickname: editNickname });
											setIsEditing(false);
										}}
										className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none">
										Save changes
									</button>
									<button
										onClick={() => {
											setEditEmail(user?.email || "");
											setEditNickname(user?.nickname || "");
											setIsEditing(false);
										}}
										className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
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
									<p className="text-sm text-gray-500">Update your password to improve security.</p>
								</div>
								{!isChangingPassword ? (
									<button
										onClick={() => {
											setIsChangingPassword(true);
											setPwdMessage("");
											setPwdError("");
											setCurrentPassword("");
											setNewPassword("");
											setConfirmPassword("");
										}}
										className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
										Change
									</button>
								) : (
									<button
										onClick={() => {
											setIsChangingPassword(false);
											setPwdMessage("");
											setPwdError("");
										}}
										className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
										Cancel
									</button>
								)}
							</div>

							{isChangingPassword && (
								<form
									className="space-y-4"
									onSubmit={async (e) => {
										e.preventDefault();
										setPwdMessage("");
										setPwdError("");
										if (newPassword.length < 8) {
											setPwdError("Password must be at least 8 characters.");
											return;
										}
										if (newPassword !== confirmPassword) {
											setPwdError("Passwords do not match.");
											return;
										}
										try {
											await changePassword({ currentPassword, newPassword });
											setPwdMessage("Password updated successfully.");
											setCurrentPassword("");
											setNewPassword("");
											setConfirmPassword("");
											setIsChangingPassword(false);
										} catch (err) {
											if (axios.isAxiosError(err)) {
												const data = err.response?.data as { message?: string } | undefined;
												setPwdError(data?.message ?? "Failed to change password.");
											} else {
												setPwdError("Failed to change password.");
											}
										}
									}}>
									{pwdError && <div className="text-sm text-red-600">{pwdError}</div>}
									{pwdMessage && <div className="text-sm text-green-600">{pwdMessage}</div>}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Current password
										</label>
										<input
											type="password"
											value={currentPassword}
											onChange={(e) => setCurrentPassword(e.target.value)}
											className="w-full text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
											required
										/>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												New password
											</label>
											<input
												type="password"
												value={newPassword}
												onChange={(e) => setNewPassword(e.target.value)}
												className="w-full text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Confirm password
											</label>
											<input
												type="password"
												value={confirmPassword}
												onChange={(e) => setConfirmPassword(e.target.value)}
												className="w-full text-sm text-gray-900 bg-white px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
												required
											/>
										</div>
									</div>
									<div className="mt-4">
										<button
											type="submit"
											className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
											Save password
										</button>
									</div>
								</form>
							)}
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
