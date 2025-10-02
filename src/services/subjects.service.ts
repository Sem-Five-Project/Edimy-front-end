export interface SubjectRequestBody {
  educationLevel: string;
  stream: string | null;
}

export interface SubjectDto {
  subjectId: number;
  subjectName: string;
}

// Adjust base URL if needed; prefer NEXT_PUBLIC_API_URL if provided
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function getAllSubjects(body: SubjectRequestBody, signal?: AbortSignal): Promise<SubjectDto[]> {
  const res = await fetch(`${API_BASE}/subjects/getAll`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch subjects (${res.status})`);
  }
  const data = await res.json();

  // Expecting array of { subjectId, subjectName }
  if (!Array.isArray(data)) return [];
  return data.filter(s => s && typeof s.subjectId === 'number' && typeof s.subjectName === 'string');
}
