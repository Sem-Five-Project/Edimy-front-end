import api from './api';

export interface RegisterAdminRequest {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
}

export interface AuthResponse {
    accessToken: string;
    tokenType: string; // "Bearer"
    user: {
        id: string;
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
    
}

export interface AdminUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    profileImage?: string;
    createdAt: string;
    updatedAt: string;
    enabled: boolean;
    accountNonExpired: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    firebaseToken?: string;
    lastLogin?: string;
}

export interface GetCurrentUserResponse {
    success: boolean;
    data?: {
        user: AdminUser;
    };
    error?: string;
}

export async function registerAdmin(data: RegisterAdminRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
}

export async function getCurrentAdmin(): Promise<AdminUser> {
    const response = await api.get<GetCurrentUserResponse>('/auth/me');
    
    if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to get current user');
    }
    
    return response.data.data.user;
}

