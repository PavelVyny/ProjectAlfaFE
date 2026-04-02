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

export type AdminEventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  remaining_capacity: number;
  status: AdminEventStatus;
  location: string;
  image_url: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminEventsMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminEventDto {
  title: string;
  description: string;
  category: string;
  price: number;
  date: string;
  start_time: string;
  duration_minutes: number;
  capacity: number;
  location: string;
  image_url: string;
  status?: AdminEventStatus;
}

export type UpdateAdminEventDto = Partial<CreateAdminEventDto>;

export interface Booking {
  id: string;
  email: string;
  participant_count: number;
  createdAt: string;
}
