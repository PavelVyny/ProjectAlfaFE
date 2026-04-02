export interface AdminUser {
  id: string;
  email: string;
  name: string;
}

export interface AdminAuthState {
  admin: AdminUser | null;
  adminToken: string | null;
  isAdminAuthenticated: boolean;
}

export interface AdminLoginDto {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  admin: AdminUser;
}
