"use client";

import React, { createContext, useContext, useLayoutEffect, useState } from "react";
import { AuthState } from "../types/auth";
import { authService } from "../services/authService";

interface AuthContextType extends AuthState {
	isLoading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		firstName?: string,
		lastName?: string,
	) => Promise<void>;
	loginWithGoogle: (idToken: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Инициализируем состояние синхронно при загрузке модуля
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

	// Синхронная инициализация при монтировании
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

	const register = async (
		email: string,
		password: string,
		firstName?: string,
		lastName?: string,
	) => {
		try {
			const response = await authService.register({ email, password, firstName, lastName });
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

	const value: AuthContextType = {
		...authState,
		isLoading,
		login,
		register,
		loginWithGoogle,
		logout,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
