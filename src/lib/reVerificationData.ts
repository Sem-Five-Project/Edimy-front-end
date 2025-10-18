// Re-verification requests data layer

export interface ReVerificationRequest {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  tutorProfilePicture?: string;
  tutorBio?: string;
  tutorRating: number;
  currentSubjects: TutorCurrentSubject[];
  newSubjectRequests: NewSubjectRequest[];
  submissionDate: string;
  status: "Pending" | "Reviewed" | "Approved" | "Rejected";
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  supportingDocuments: ReVerificationDocument[];
}

export interface TutorCurrentSubject {
  subject: string;
  currentRate: number;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsTeaching: number;
  totalSessions: number;
  rating: number;
}

export interface NewSubjectRequest {
  subject: string;
  proposedRate: number;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
  motivation: string;
  qualifications: string[];
}

export interface ReVerificationDocument {
  id: string;
  type:
    | "Certificate"
    | "Degree"
    | "Professional License"
    | "Experience Letter"
    | "Portfolio"
    | "Other";
  filename: string;
  uploadDate: string;
  fileSize: number;
  verified: boolean;
  downloadUrl: string;
  relatedSubject?: string;
}

export interface ReVerificationAuditLog {
  id: string;
  requestId: string;
  adminName: string;
  action: "Approved" | "Rejected" | "Reviewed" | "Requested Additional Info";
  date: string;
  notes?: string;
  rejectionReason?: string;
  affectedSubjects: string[];
}

export interface GetReVerificationRequestsParams {
  search?: string;
  subject?: string;
  status?: string;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  page?: number;
  limit?: number;
}

// Mock data for re-verification requests
const mockReVerificationRequests: ReVerificationRequest[] = [
  {
    id: "REVERIFY001",
    tutorId: "TUT001",
    tutorName: "Dr. Sarah Williams",
    tutorEmail: "sarah.williams@email.com",
    tutorProfilePicture: "/images/user/user-01.png",
    tutorBio: "Experienced educator with expertise in multiple subjects",
    tutorRating: 4.8,
    currentSubjects: [
      {
        subject: "Mathematics",
        currentRate: 45,
        experienceLevel: "Expert",
        yearsTeaching: 5,
        totalSessions: 234,
        rating: 4.9,
      },
      {
        subject: "Statistics",
        currentRate: 40,
        experienceLevel: "Advanced",
        yearsTeaching: 3,
        totalSessions: 156,
        rating: 4.7,
      },
    ],
    newSubjectRequests: [
      {
        subject: "Physics",
        proposedRate: 50,
        experienceLevel: "Advanced",
        yearsOfExperience: 4,
        motivation:
          "I have a strong background in physics and would like to expand my teaching portfolio to help more students.",
        qualifications: [
          "MSc in Physics",
          "4 years university teaching experience",
        ],
      },
    ],
    submissionDate: "2024-12-15T10:30:00.000Z",
    status: "Pending",
    supportingDocuments: [
      {
        id: "REDOC001",
        type: "Degree",
        filename: "physics_masters_degree.pdf",
        uploadDate: "2024-12-15T10:30:00.000Z",
        fileSize: 2048576,
        verified: true,
        downloadUrl: "/api/documents/physics_masters_degree.pdf",
        relatedSubject: "Physics",
      },
      {
        id: "REDOC002",
        type: "Experience Letter",
        filename: "university_teaching_letter.pdf",
        uploadDate: "2024-12-15T10:35:00.000Z",
        fileSize: 1572864,
        verified: true,
        downloadUrl: "/api/documents/university_teaching_letter.pdf",
        relatedSubject: "Physics",
      },
    ],
  },
  {
    id: "REVERIFY002",
    tutorId: "TUT002",
    tutorName: "Prof. Michael Chen",
    tutorEmail: "michael.chen@email.com",
    tutorProfilePicture: "/images/user/user-02.png",
    tutorBio: "Computer Science professor with industry experience",
    tutorRating: 4.9,
    currentSubjects: [
      {
        subject: "Computer Science",
        currentRate: 55,
        experienceLevel: "Expert",
        yearsTeaching: 8,
        totalSessions: 445,
        rating: 4.9,
      },
      {
        subject: "Python Programming",
        currentRate: 50,
        experienceLevel: "Expert",
        yearsTeaching: 6,
        totalSessions: 312,
        rating: 4.8,
      },
    ],
    newSubjectRequests: [
      {
        subject: "Machine Learning",
        proposedRate: 60,
        experienceLevel: "Expert",
        yearsOfExperience: 5,
        motivation:
          "With my PhD in AI and 5 years of ML research, I want to share cutting-edge knowledge with students.",
        qualifications: [
          "PhD in Artificial Intelligence",
          "Published ML research papers",
          "5 years industry ML experience",
        ],
      },
      {
        subject: "Data Science",
        proposedRate: 58,
        experienceLevel: "Advanced",
        yearsOfExperience: 4,
        motivation:
          "My experience in data analytics and research makes me qualified to teach comprehensive data science.",
        qualifications: [
          "Data Science certification",
          "4 years data analytics experience",
        ],
      },
    ],
    submissionDate: "2024-12-12T14:20:00.000Z",
    status: "Pending",
    supportingDocuments: [
      {
        id: "REDOC003",
        type: "Certificate",
        filename: "ml_certification.pdf",
        uploadDate: "2024-12-12T14:20:00.000Z",
        fileSize: 1048576,
        verified: true,
        downloadUrl: "/api/documents/ml_certification.pdf",
        relatedSubject: "Machine Learning",
      },
      {
        id: "REDOC004",
        type: "Portfolio",
        filename: "ml_projects_portfolio.pdf",
        uploadDate: "2024-12-12T14:25:00.000Z",
        fileSize: 5242880,
        verified: true,
        downloadUrl: "/api/documents/ml_projects_portfolio.pdf",
        relatedSubject: "Machine Learning",
      },
    ],
  },
  {
    id: "REVERIFY003",
    tutorId: "TUT003",
    tutorName: "Dr. Emily Rodriguez",
    tutorEmail: "emily.rodriguez@email.com",
    tutorProfilePicture: "/images/user/user-03.png",
    tutorBio: "Language specialist and cultural educator",
    tutorRating: 4.7,
    currentSubjects: [
      {
        subject: "Spanish",
        currentRate: 35,
        experienceLevel: "Expert",
        yearsTeaching: 6,
        totalSessions: 287,
        rating: 4.8,
      },
      {
        subject: "English Literature",
        currentRate: 38,
        experienceLevel: "Advanced",
        yearsTeaching: 4,
        totalSessions: 198,
        rating: 4.6,
      },
    ],
    newSubjectRequests: [
      {
        subject: "French",
        proposedRate: 36,
        experienceLevel: "Intermediate",
        yearsOfExperience: 3,
        motivation:
          "Having lived in France for 3 years and obtained C2 proficiency, I can effectively teach French to students.",
        qualifications: [
          "DELF C2 Certificate",
          "3 years living in France",
          "French literature studies",
        ],
      },
    ],
    submissionDate: "2024-12-10T16:45:00.000Z",
    status: "Reviewed",
    reviewedBy: "Admin John",
    reviewDate: "2024-12-14T09:30:00.000Z",
    reviewNotes: "Impressive qualifications, pending final approval",
    supportingDocuments: [
      {
        id: "REDOC005",
        type: "Certificate",
        filename: "delf_c2_certificate.pdf",
        uploadDate: "2024-12-10T16:45:00.000Z",
        fileSize: 1572864,
        verified: true,
        downloadUrl: "/api/documents/delf_c2_certificate.pdf",
        relatedSubject: "French",
      },
    ],
  },
  {
    id: "REVERIFY004",
    tutorId: "TUT004",
    tutorName: "Dr. James Thompson",
    tutorEmail: "james.thompson@email.com",
    tutorProfilePicture: "/images/user/user-04.png",
    tutorBio: "Chemistry researcher and educator",
    tutorRating: 4.6,
    currentSubjects: [
      {
        subject: "Chemistry",
        currentRate: 48,
        experienceLevel: "Expert",
        yearsTeaching: 7,
        totalSessions: 356,
        rating: 4.7,
      },
    ],
    newSubjectRequests: [
      {
        subject: "Biology",
        proposedRate: 45,
        experienceLevel: "Advanced",
        yearsOfExperience: 4,
        motivation:
          "My background in biochemistry and molecular biology research qualifies me to teach biology effectively.",
        qualifications: [
          "PhD in Biochemistry",
          "Published biology research",
          "4 years biology teaching",
        ],
      },
    ],
    submissionDate: "2024-12-08T11:15:00.000Z",
    status: "Rejected",
    reviewedBy: "Admin Sarah",
    reviewDate: "2024-12-13T15:20:00.000Z",
    rejectionReason: "Insufficient specialized biology teaching experience",
    reviewNotes:
      "While qualifications are good, we require more direct biology teaching experience",
    supportingDocuments: [
      {
        id: "REDOC006",
        type: "Degree",
        filename: "biochemistry_phd.pdf",
        uploadDate: "2024-12-08T11:15:00.000Z",
        fileSize: 3145728,
        verified: true,
        downloadUrl: "/api/documents/biochemistry_phd.pdf",
        relatedSubject: "Biology",
      },
    ],
  },
  {
    id: "REVERIFY005",
    tutorId: "TUT005",
    tutorName: "Ms. Lisa Park",
    tutorEmail: "lisa.park@email.com",
    tutorProfilePicture: "/images/user/user-05.png",
    tutorBio: "Business and economics specialist",
    tutorRating: 4.5,
    currentSubjects: [
      {
        subject: "Economics",
        currentRate: 42,
        experienceLevel: "Advanced",
        yearsTeaching: 4,
        totalSessions: 198,
        rating: 4.6,
      },
    ],
    newSubjectRequests: [
      {
        subject: "Business Studies",
        proposedRate: 44,
        experienceLevel: "Advanced",
        yearsOfExperience: 5,
        motivation:
          "My MBA and 5 years of business consulting experience provide practical insights for business education.",
        qualifications: [
          "MBA from top university",
          "5 years business consulting",
          "Business certification",
        ],
      },
      {
        subject: "Accounting",
        proposedRate: 40,
        experienceLevel: "Intermediate",
        yearsOfExperience: 3,
        motivation:
          "My CPA certification and accounting practice experience make me qualified to teach accounting principles.",
        qualifications: ["CPA certification", "3 years accounting practice"],
      },
    ],
    submissionDate: "2024-12-05T13:30:00.000Z",
    status: "Approved",
    reviewedBy: "Admin Mike",
    reviewDate: "2024-12-12T10:45:00.000Z",
    reviewNotes: "Excellent qualifications, approved for both subjects",
    supportingDocuments: [
      {
        id: "REDOC007",
        type: "Degree",
        filename: "mba_certificate.pdf",
        uploadDate: "2024-12-05T13:30:00.000Z",
        fileSize: 2097152,
        verified: true,
        downloadUrl: "/api/documents/mba_certificate.pdf",
        relatedSubject: "Business Studies",
      },
      {
        id: "REDOC008",
        type: "Professional License",
        filename: "cpa_license.pdf",
        uploadDate: "2024-12-05T13:35:00.000Z",
        fileSize: 1048576,
        verified: true,
        downloadUrl: "/api/documents/cpa_license.pdf",
        relatedSubject: "Accounting",
      },
    ],
  },
];

const mockAuditLogs: ReVerificationAuditLog[] = [
  {
    id: "AUDIT001",
    requestId: "REVERIFY005",
    adminName: "Admin Mike",
    action: "Approved",
    date: "2024-12-12T10:45:00.000Z",
    notes: "Excellent qualifications, approved for both subjects",
    affectedSubjects: ["Business Studies", "Accounting"],
  },
  {
    id: "AUDIT002",
    requestId: "REVERIFY004",
    adminName: "Admin Sarah",
    action: "Rejected",
    date: "2024-12-13T15:20:00.000Z",
    rejectionReason: "Insufficient specialized biology teaching experience",
    notes:
      "While qualifications are good, we require more direct biology teaching experience",
    affectedSubjects: ["Biology"],
  },
  {
    id: "AUDIT003",
    requestId: "REVERIFY003",
    adminName: "Admin John",
    action: "Reviewed",
    date: "2024-12-14T09:30:00.000Z",
    notes: "Impressive qualifications, pending final approval",
    affectedSubjects: ["French"],
  },
];

// API Functions
export async function getReVerificationRequests(
  params: GetReVerificationRequestsParams = {},
): Promise<{ requests: ReVerificationRequest[]; total: number }> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let filteredRequests = [...mockReVerificationRequests];

  // Apply filters
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredRequests = filteredRequests.filter(
      (request) =>
        request.tutorName.toLowerCase().includes(searchTerm) ||
        request.tutorEmail.toLowerCase().includes(searchTerm) ||
        request.newSubjectRequests.some((subject) =>
          subject.subject.toLowerCase().includes(searchTerm),
        ),
    );
  }

  if (params.subject) {
    filteredRequests = filteredRequests.filter((request) =>
      request.newSubjectRequests.some(
        (subject) => subject.subject === params.subject,
      ),
    );
  }

  if (params.status) {
    filteredRequests = filteredRequests.filter(
      (request) => request.status === params.status,
    );
  }

  if (params.submissionDateFrom) {
    filteredRequests = filteredRequests.filter(
      (request) =>
        new Date(request.submissionDate) >=
        new Date(params.submissionDateFrom!),
    );
  }

  if (params.submissionDateTo) {
    filteredRequests = filteredRequests.filter(
      (request) =>
        new Date(request.submissionDate) <= new Date(params.submissionDateTo!),
    );
  }

  // Apply pagination
  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  return {
    requests: paginatedRequests,
    total: filteredRequests.length,
  };
}

export async function getReVerificationRequestById(
  id: string,
): Promise<ReVerificationRequest | null> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const request = mockReVerificationRequests.find((r) => r.id === id);
  return request || null;
}

export async function approveReVerificationRequest(
  id: string,
  adminName: string,
  notes?: string,
): Promise<void> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const request = mockReVerificationRequests.find((r) => r.id === id);
  if (request) {
    request.status = "Approved";
    request.reviewedBy = adminName;
    request.reviewDate = new Date().toISOString();
    request.reviewNotes = notes;

    // Add audit log
    const auditLog: ReVerificationAuditLog = {
      id: `AUDIT${Date.now()}`,
      requestId: id,
      adminName,
      action: "Approved",
      date: new Date().toISOString(),
      notes,
      affectedSubjects: request.newSubjectRequests.map((s) => s.subject),
    };
    mockAuditLogs.push(auditLog);
  }

  console.log(`Re-verification request ${id} approved by ${adminName}`);
}

export async function rejectReVerificationRequest(
  id: string,
  adminName: string,
  reason: string,
  notes?: string,
): Promise<void> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const request = mockReVerificationRequests.find((r) => r.id === id);
  if (request) {
    request.status = "Rejected";
    request.reviewedBy = adminName;
    request.reviewDate = new Date().toISOString();
    request.rejectionReason = reason;
    request.reviewNotes = notes;

    // Add audit log
    const auditLog: ReVerificationAuditLog = {
      id: `AUDIT${Date.now()}`,
      requestId: id,
      adminName,
      action: "Rejected",
      date: new Date().toISOString(),
      rejectionReason: reason,
      notes,
      affectedSubjects: request.newSubjectRequests.map((s) => s.subject),
    };
    mockAuditLogs.push(auditLog);
  }

  console.log(
    `Re-verification request ${id} rejected by ${adminName}: ${reason}`,
  );
}

export async function bulkApproveReVerificationRequests(
  ids: string[],
  adminName: string,
): Promise<void> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  for (const id of ids) {
    await approveReVerificationRequest(id, adminName, "Bulk approved");
  }

  console.log(
    `Bulk approved ${ids.length} re-verification requests by ${adminName}`,
  );
}

export async function bulkRejectReVerificationRequests(
  ids: string[],
  adminName: string,
  reason: string,
): Promise<void> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  for (const id of ids) {
    await rejectReVerificationRequest(id, adminName, reason, "Bulk rejected");
  }

  console.log(
    `Bulk rejected ${ids.length} re-verification requests by ${adminName}: ${reason}`,
  );
}

export async function getSubjectsFromReVerificationRequests(): Promise<
  string[]
> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const subjects = new Set<string>();

  mockReVerificationRequests.forEach((request) => {
    request.newSubjectRequests.forEach((subjectRequest) => {
      subjects.add(subjectRequest.subject);
    });
  });

  return Array.from(subjects).sort();
}

export async function getReVerificationAuditLogs(
  requestId?: string,
): Promise<ReVerificationAuditLog[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (requestId) {
    return mockAuditLogs.filter((log) => log.requestId === requestId);
  }

  return mockAuditLogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function downloadReVerificationDocument(
  docId: string,
): Promise<string> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real app, this would return a signed URL or trigger a download
  return `/api/documents/download/${docId}`;
}
