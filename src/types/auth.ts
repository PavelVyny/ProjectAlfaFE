export interface RegisterDto {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
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
		firstName?: string;
		lastName?: string;
		firebaseUid?: string;
		avatar?: string;
	};
}

export interface AuthState {
	user: AuthResponseDto["user"] | null;
	token: string | null;
	isAuthenticated: boolean;
}
