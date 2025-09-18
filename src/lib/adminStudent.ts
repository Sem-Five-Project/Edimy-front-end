import api from './api';  

export enum StudentProfileStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export interface StudentDtoForAdmin {
    studentId: number;
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    profilePictureUrl: string;
    status: StudentProfileStatus;
    accountLocked: boolean;
    adminNotes: string;
    createdAt: string; // ISO date string
    lastLogin: string; // ISO date string
    updatedAt: string; // ISO date string
    educationLevel: string;
}

export interface StudentsDto {
    studentId: number;
    firstName: string;
    lastName: string;
    status: StudentProfileStatus;
    username: string;
}

export interface StudentStatsDto {
    totalStudents: number;
    activeStudents: number;
    suspendedStudents: number;
    newStudentsThisMonth: number;
}

const API_BASE_URL = '/students';

export async function getAllStudents(page = 0, size = 10): Promise<StudentsDto[]> {
    const response = await api.get<StudentsDto[]>(`${API_BASE_URL}`, {
        params: { page, size }
    });
    return response.data;
}

export async function getStudentByIdForAdmin(id: number): Promise<StudentDtoForAdmin> {
    const response = await api.get<StudentDtoForAdmin>(`/students/${id}/admin`);
    return response.data;
}

export async function updateStudentByIdForAdmin(id: number, data: Partial<StudentDtoForAdmin>): Promise<StudentDtoForAdmin> {
    console.log('🚀 updateStudentByIdForAdmin called with:');
    console.log('ID:', id);
    console.log('Data:', data);
    console.log('API endpoint:', `/students/${id}/admin`);
    
    try {
        const response = await api.put<StudentDtoForAdmin>(`/students/${id}/admin`, data);
        console.log('✅ API PUT response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ API PUT error:', error);
        console.error('Error response:', error?.response);
        console.error('Error status:', error?.response?.status);
        console.error('Error data:', error?.response?.data);
        throw error;
    }
}

export async function getStudentStats(): Promise<StudentStatsDto> {
    const response = await api.get<StudentStatsDto>('/students/stats');
    return response.data;
}

export interface SearchStudentsParams {
    name?: string;
    username?: string;
    email?: string;
    studentId?: number;
    status?: StudentProfileStatus;
    page?: number;
    size?: number;
}

export async function searchStudentsByAdmin(params: SearchStudentsParams = {}): Promise<StudentsDto[]> {
    const response = await api.get<StudentsDto[]>('/students/searchByAdmin', {
        params
    });
    return response.data;
}

export async function deleteStudent(id: number): Promise<void> {
    await api.delete(`/students/${id}`);
}