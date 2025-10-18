import api from "./api";

export interface SessionDto {
  sessionId: number;
  title: string;
  tutorId: number;
  subjectId: number;
  studentIds: number[];
  createdAt: string; // LocalDateTime
  startTime: string; // LocalDateTime
  endTime: string; // LocalDateTime
  classId: number;
  status: string;
  moderatorLink: string;
  participantLink: string;
  notificationSent: boolean;
}

export interface SessionsDto {
  sessionId: number;
  title: string;
  tutorId: number;
  classId: number;
  startTime: string; // LocalDateTime
  duration: string; // ISO time string (e.g., "01:30:00")
  status: string;
}

export interface SessionStatsDto {
  totalSessions: number;
  upcomingSessions: number;
  cancelledSessions: number;
  completedSessions: number;
}
const API_BASE = "/sessions";

export async function searchSessions(params: {
  studentId?: number;
  tutorId?: number;
  subjectId?: number;
  status?: string;
  fromTime?: string; // ISO date string
  toTime?: string; // ISO date string
  page?: number;
  size?: number;
}): Promise<{
  content: SessionsDto[];
  totalElements: number;
  totalPages: number;
}> {
  const response = await api.get(`${API_BASE}`, { params });
  return response.data;
}

export async function getOngoingSessions(
  page = 0,
  size = 10,
): Promise<{
  content: SessionsDto[];
  totalElements: number;
  totalPages: number;
}> {
  const response = await api.get(`${API_BASE}/ongoing`, {
    params: { page, size },
  });
  return response.data;
}

export async function getSessionById(id: number): Promise<SessionDto> {
  const response = await api.get(`${API_BASE}/${id}`);
  return response.data;
}

export async function getSessionStats(): Promise<SessionStatsDto> {
  const response = await api.get(`${API_BASE}/stats`);
  return response.data;
}

export async function updateSession(
  id: number,
  sessionDto: SessionDto,
): Promise<SessionDto> {
  const response = await api.put(`${API_BASE}/${id}`, sessionDto);
  return response.data;
}
