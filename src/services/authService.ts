import axios from "axios";
import {
	RegisterDto,
	LoginDto,
	AuthResponseDto,
	ChangePasswordDto,
	ChangePasswordResponseDto,
	SendPasswordResetDto,
	SendPasswordResetResponseDto,
} from "../types/auth";

// Create axios instance with base URL - direct to backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const authApi = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

authApi.interceptors.request.use((config) => {
	const token = localStorage.getItem("auth_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const authService = {
	async register(data: RegisterDto): Promise<AuthResponseDto> {
		const response = await authApi.post("/auth/register", data);
		return response.data;
	},

	async login(data: LoginDto): Promise<AuthResponseDto> {
		const response = await authApi.post("/auth/login", data);
		return response.data;
	},

	// Google login
	async googleLogin(idToken: string): Promise<AuthResponseDto> {
		const response = await authApi.post("/auth/google", { credential: idToken });
		return response.data;
	},

	// Change password
	async changePassword(data: ChangePasswordDto): Promise<ChangePasswordResponseDto> {
		const response = await authApi.post("/auth/change-password", data);
		return response.data;
	},

	// Send password reset email
	async sendPasswordReset(data: SendPasswordResetDto): Promise<SendPasswordResetResponseDto> {
		const response = await authApi.post("/auth/send-password-reset", data);
		return response.data;
	},

	logout(): void {
		localStorage.removeItem("auth_token");
		localStorage.removeItem("user_data");
	},

	saveAuthData(data: AuthResponseDto): void {
		localStorage.setItem("auth_token", data.access_token);
		localStorage.setItem("user_data", JSON.stringify(data.user));
	},

	getToken(): string | null {
		return localStorage.getItem("auth_token");
	},

	// Get user data
	getUser(): {
		id: string;
		email: string;
		nickname?: string;
		firebaseUid?: string;
	} | null {
		const userData = localStorage.getItem("user_data");
		return userData ? JSON.parse(userData) : null;
	},

	// Update locally stored user (client-side only helper)
	updateLocalUser(
		partial: Partial<{ id: string; email: string; nickname?: string; firebaseUid?: string }>,
	): {
		id: string;
		email: string;
		nickname?: string;
		firebaseUid?: string;
	} | null {
		const current = this.getUser();
		if (!current) return null;
		const updated = { ...current, ...partial } as {
			id: string;
			email: string;
			nickname?: string;
			firebaseUid?: string;
		};
		localStorage.setItem("user_data", JSON.stringify(updated));
		return updated;
	},

	isAuthenticated(): boolean {
		return !!this.getToken();
	},

	// Delete account (placeholder: clear auth and simulate success)
	async deleteAccount(): Promise<void> {
		// Replace with real API call if backend supports account deletion
		this.logout();
	},
};
