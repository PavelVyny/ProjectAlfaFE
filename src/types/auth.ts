export interface RegisterDto {
	email: string;
	password: string;
	nickname?: string;
}

export interface LoginDto {
	email: string;
	password: string;
}

export interface AuthResponseDto {
	access_token: string;
	user: {
		id: string;
		email: string;
		nickname?: string;
		firebaseUid?: string;
		avatar?: string;
		googleId?: string;
	};
}

export interface AuthState {
	user: AuthResponseDto["user"] | null;
	token: string | null;
	isAuthenticated: boolean;
}

export interface ChangePasswordDto {
	currentPassword: string;
	newPassword: string;
}

export interface ChangePasswordResponseDto {
	message: string;
}

export interface SendPasswordResetDto {
	email: string;
}

export interface SendPasswordResetResponseDto {
	message: string;
}
