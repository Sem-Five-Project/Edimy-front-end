import api from './api';  

export interface TutorsDto {
    tutorId: number;
    hourlyRate: number;
    verified: boolean;
    status: 'ACTIVE' | 'SUSPENDED';
    firstName: string;
    lastName: string;
}

export interface TutorSubject {
    subjectId: number;
    name: string;
}

export interface TutorLanguage {
    languageId: number;
    name: string;
    proficiency: string;
}

export interface TutorDto {
    tutorId: number;
    userId: string;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    profilePictureUrl: string;
    bio: string;
    hourlyRate: number;
    verified: boolean;
    status: 'ACTIVE' | 'SUSPENDED';
    accountLocked: boolean | null;
    adminNotes: string;
    rating: number;
    experienceInMonths: number;
    classCompletionRate: number;
    createdAt: string; // ISO date string
    lastLogin: string; // ISO date string
    updatedAt: string; // ISO date string
    subjects: TutorSubject[];
    statuses: TutorLanguage[];
}

const API_BASE_URL = '/tutors'; // no need full URL since baseURL is already set

// Fetch all tutors (admin only) with pagination and filtering
export async function getAllTutors(
    page: number = 0, 
    size: number = 10,
    filters?: {
        name?: string;
        username?: string;
        tutorId?: string;
        email?: string;
        status?: 'ACTIVE' | 'SUSPENDED' | 'ALL';
        verified?: boolean | 'ALL';
    }
): Promise<TutorsDto[]> {
    const params: any = { page, size };
    
    if (filters) {
        if (filters.name) params.name = filters.name;
        if (filters.username) params.username = filters.username;
        if (filters.tutorId) params.tutorId = filters.tutorId;
        if (filters.email) params.email = filters.email;
        if (filters.status && filters.status !== 'ALL') params.status = filters.status;
        if (filters.verified !== undefined && filters.verified !== 'ALL') params.verified = filters.verified;
    }

    const response = await api.get<TutorsDto[]>(API_BASE_URL, { params });
    return response.data;
}

// Update a tutor profile
export async function updateTutor(id: string, tutorDto: Partial<TutorDto>): Promise<TutorDto> {
    const response = await api.put<TutorDto>(`${API_BASE_URL}/${id}`, tutorDto);
    return response.data;
}

// Update tutor admin-specific fields
export async function updateTutorAdminFields(id: string, adminData: {
    adminNotes?: string;
    verified?: boolean;
    rating?: number;
    status?: 'ACTIVE' | 'SUSPENDED';
}): Promise<TutorDto> {
    const response = await api.put<TutorDto>(`${API_BASE_URL}/${id}/admin`, adminData);
    return response.data;
}

// Fetch a tutor by ID (admin or student)
export async function getTutorById(id: string): Promise<TutorDto> {
    const response = await api.get<TutorDto>(`${API_BASE_URL}/${id}`);
    return response.data;
}

// Delete a tutor (admin only)
export async function deleteTutor(id: string): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`);
}

// Search tutors by admin (with filters and pagination)
export async function searchTutorsByAdmin(
    params: {
        name?: string;
        username?: string;
        email?: string;
        tutorId?: number;
        status?: 'ACTIVE' | 'SUSPENDED' | null;
        verified?: boolean | null;
        page?: number;
        size?: number;
    } = {}
): Promise<TutorsDto[]> {
    const response = await api.get<TutorsDto[]>(`${API_BASE_URL}/searchByAdmin`, {
        params: {
            ...params,
            page: params.page ?? 0,
            size: params.size ?? 10,
        },
    });
    return response.data;
}

// Get tutor statistics (new tutors this month, average rating, etc.)
export async function getTutorStatistics(): Promise<{
    totalTutors: number;
    activeTutors: number;
    verifiedTutors: number;
    averageRating: number;
    newTutorsThisMonth: number;
}> {
    const response = await api.get<{
        totalTutors: number;
        activeTutors: number;
        verifiedTutors: number;
        averageRating: number;
        newTutorsThisMonth: number;
    }>(`${API_BASE_URL}/statistics`);
    return response.data;
}