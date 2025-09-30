"use client";

import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { AuthState, ChangePasswordDto } from "../types/auth";
import { authService } from "../services/authService";

interface AuthContextType extends AuthState {
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, nickname?: string) => Promise<void>;
	loginWithGoogle: (idToken: string) => Promise<void>;
	logout: () => void;
	updateProfile: (partial: { email?: string; nickname?: string }) => Promise<void>;
	deleteAccount: () => Promise<void>;
	changePassword: (data: ChangePasswordDto) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

const getInitialAuthState = (): { authState: AuthState; isLoading: boolean } => {
	if (typeof window === "undefined") {
		// На сервере всегда показываем загрузку
		return {
			authState: { user: null, token: null, isAuthenticated: false },
			isLoading: true,
		};
	}

	try {
		const token = authService.getToken();
		const user = authService.getUser();

		if (token && user) {
			return {
				authState: { user, token, isAuthenticated: true },
				isLoading: false,
			};
		}
	} catch (error) {
		console.error("Error initializing auth:", error);
	}

	return {
		authState: { user: null, token: null, isAuthenticated: false },
		isLoading: false,
	};
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const initialState = getInitialAuthState();
	const [authState, setAuthState] = useState<AuthState>(initialState.authState);
	const [isLoading, setIsLoading] = useState(initialState.isLoading);

	useLayoutEffect(() => {
		if (typeof window !== "undefined") {
			const { authState: newAuthState, isLoading: newIsLoading } = getInitialAuthState();
			setAuthState(newAuthState);
			setIsLoading(newIsLoading);
		}
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const response = await authService.login({ email, password });
			authService.saveAuthData(response);

			setAuthState({
				user: response.user,
				token: response.access_token,
				isAuthenticated: true,
			});
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const register = async (email: string, password: string, nickname?: string) => {
		try {
			const response = await authService.register({ email, password, nickname });
			authService.saveAuthData(response);

			setAuthState({
				user: response.user,
				token: response.access_token,
				isAuthenticated: true,
			});
		} catch (error) {
			console.error("Register error:", error);
			throw error;
		}
	};

	const loginWithGoogle = async (idToken: string) => {
		try {
			const response = await authService.googleLogin(idToken);
			authService.saveAuthData(response);

			setAuthState({
				user: response.user,
				token: response.access_token,
				isAuthenticated: true,
			});
		} catch (error) {
			console.error("Google login error:", error);
			throw error;
		}
	};

	const logout = () => {
		authService.logout();
		setAuthState({
			user: null,
			token: null,
			isAuthenticated: false,
		});
	};

	const updateProfile = async (partial: { email?: string; nickname?: string }) => {
		try {
			// If backend has endpoint, call it here. For now, update local storage only.
			const updated = authService.updateLocalUser(partial);
			if (updated) {
				setAuthState(
					(prev) =>
						({
							...prev,
							user: { ...updated },
						} as AuthState),
				);
			}
		} catch (error) {
			console.error("Update profile error:", error);
			throw error;
		}
	};

	const deleteAccount = async () => {
		await authService.deleteAccount();
		setAuthState({ user: null, token: null, isAuthenticated: false });
	};

	const changePassword = async (data: ChangePasswordDto) => {
		try {
			await authService.changePassword(data);
		} catch (error) {
			console.error("Change password error:", error);
			throw error;
		}
	};

	const value: AuthContextType = {
		...authState,
		isLoading,
		login,
		register,
		loginWithGoogle,
		logout,
		updateProfile,
		deleteAccount,
		changePassword,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
