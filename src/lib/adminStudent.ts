import api from "./api";

export enum StudentProfileStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
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

const API_BASE_URL = "/students";

export async function getAllStudents(
  page = 0,
  size = 10,
): Promise<StudentsDto[]> {
  const response = await api.get<StudentsDto[]>(`${API_BASE_URL}`, {
    params: { page, size },
  });
  return response.data;
}

export async function getStudentByIdForAdmin(
  id: number,
): Promise<StudentDtoForAdmin> {
  const response = await api.get<StudentDtoForAdmin>(`/students/${id}/admin`);
  return response.data;
}

export async function updateStudentByIdForAdmin(
  id: number,
  data: Partial<StudentDtoForAdmin>,
): Promise<StudentDtoForAdmin> {
  console.log("🚀 updateStudentByIdForAdmin called with:");
  console.log("ID:", id);
  console.log("Data:", data);
  console.log("API endpoint:", `/students/${id}/admin`);

  try {
    const response = await api.put<StudentDtoForAdmin>(
      `/students/${id}/admin`,
      data,
    );
    console.log("✅ API PUT response:", response);
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ API PUT error:", error);
    console.error("Error response:", error?.response);
    console.error("Error status:", error?.response?.status);
    console.error("Error data:", error?.response?.data);
    throw error;
  }
}

export async function getStudentStats(): Promise<StudentStatsDto> {
  try {
    console.log("📊 Fetching student statistics...");
    const response = await api.get<StudentStatsDto>("/students/stats");
    console.log("✅ Student statistics fetched:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to fetch student statistics:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    
    // Return fallback statistics to prevent UI crash
    if (error?.response?.status === 500 || error?.response?.status === 404) {
      console.warn("Returning fallback statistics due to API error");
      return {
        totalStudents: 0,
        activeStudents: 0,
        suspendedStudents: 0,
        newStudentsThisMonth: 0,
      };
    }
    
    throw error;
  }
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

export async function searchStudentsByAdmin(
  params: SearchStudentsParams = {},
): Promise<StudentsDto[]> {
  try {
    console.log("🔍 Searching students with params:", params);
    
    // Use the correct endpoint: /students/admin/search
    const response = await api.get<StudentsDto[]>("/students/admin/search", {
      params,
    });
    
    console.log("✅ Students search successful:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Students search failed:", error);
    console.error("Error response:", error?.response?.data);
    console.error("Error status:", error?.response?.status);
    
    if (error?.response?.status === 500) {
      console.warn("Backend returned 500 error. This might be due to:");
      console.warn("1. Backend endpoint implementation issue");
      console.warn("2. Database query error");
      console.warn("3. Invalid search parameters");
      console.warn("\nBackend error message:", error?.response?.data?.message);
    }
    
    // Rethrow to let the component handle it
    throw error;
  }
}

export async function deleteStudent(id: number): Promise<void> {
  await api.delete(`/students/${id}`);
}
