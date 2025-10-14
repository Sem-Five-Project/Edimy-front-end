// Pending tutor verification data fetching functions

export interface PendingTutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  bio?: string;
  submissionDate: string;
  status: "Pending Review" | "Under Review" | "Additional Info Required";
  subjects: PendingTutorSubject[];
  documents: TutorDocument[];
  motivation?: string;
  additionalNotes?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
  hourlyRateRange: {
    min: number;
    max: number;
  };
  experience: string;
  education: string;
  certifications: string[];
  languages: string[];
  availability: string;
}

export interface PendingTutorSubject {
  subject: string;
  proposedRate: number;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
}

export interface TutorDocument {
  id: string;
  type:
    | "ID Proof"
    | "Educational Certificate"
    | "Professional Certificate"
    | "Resume/CV"
    | "Other";
  filename: string;
  uploadDate: string;
  fileSize: number;
  verified: boolean;
  downloadUrl: string;
}

export interface ReviewAction {
  id: string;
  tutorId: string;
  adminName: string;
  action:
    | "Approved"
    | "Rejected"
    | "Requested Additional Info"
    | "Under Review";
  date: string;
  notes?: string;
  rejectionReason?: string;
}

export async function getPendingTutors(filters?: {
  search?: string;
  subject?: string;
  status?: string;
  submissionDateFrom?: string;
  submissionDateTo?: string;
  page?: number;
  limit?: number;
}): Promise<{ tutors: PendingTutor[]; total: number }> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const allPendingTutors: PendingTutor[] = [
    {
      id: "PEND001",
      name: "Dr. Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      phone: "+1234567890",
      profilePicture: "/images/user/user-03.png",
      bio: "PhD in Physics with 8 years of research experience. Passionate about teaching advanced physics concepts to students.",
      submissionDate: "2024-12-01T09:30:00.000Z",
      status: "Pending Review",
      subjects: [
        {
          subject: "Physics",
          proposedRate: 50,
          experienceLevel: "Expert",
          yearsOfExperience: 8,
        },
        {
          subject: "Mathematics",
          proposedRate: 45,
          experienceLevel: "Advanced",
          yearsOfExperience: 5,
        },
      ],
      documents: [
        {
          id: "DOC001",
          type: "ID Proof",
          filename: "drivers_license.pdf",
          uploadDate: "2024-12-01T09:30:00.000Z",
          fileSize: 2048576,
          verified: true,
          downloadUrl: "/api/documents/drivers_license.pdf",
        },
        {
          id: "DOC002",
          type: "Educational Certificate",
          filename: "phd_certificate.pdf",
          uploadDate: "2024-12-01T09:35:00.000Z",
          fileSize: 3145728,
          verified: true,
          downloadUrl: "/api/documents/phd_certificate.pdf",
        },
        {
          id: "DOC003",
          type: "Resume/CV",
          filename: "alex_rodriguez_cv.pdf",
          uploadDate: "2024-12-01T09:40:00.000Z",
          fileSize: 1572864,
          verified: true,
          downloadUrl: "/api/documents/alex_rodriguez_cv.pdf",
        },
      ],
      motivation:
        "I am passionate about making complex physics concepts accessible to students. My research background in quantum mechanics and my teaching experience at the university level have prepared me to help students excel in their physics studies.",
      hourlyRateRange: { min: 40, max: 55 },
      experience: "8 years of university teaching and research",
      education: "PhD in Physics from MIT, MS in Applied Physics from Stanford",
      certifications: [
        "Certified Physics Teacher",
        "Research Publication in Nature Physics",
      ],
      languages: ["English", "Spanish"],
      availability: "Weekdays 2PM-8PM, Weekends 10AM-6PM",
    },
    {
      id: "PEND002",
      name: "Ms. Rachel Chen",
      email: "rachel.chen@email.com",
      phone: "+1234567891",
      submissionDate: "2024-11-30T14:20:00.000Z",
      status: "Under Review",
      bio: "Experienced software engineer with a passion for teaching programming and computer science concepts.",
      subjects: [
        {
          subject: "Computer Science",
          proposedRate: 55,
          experienceLevel: "Expert",
          yearsOfExperience: 6,
        },
        {
          subject: "Python Programming",
          proposedRate: 50,
          experienceLevel: "Expert",
          yearsOfExperience: 6,
        },
        {
          subject: "Web Development",
          proposedRate: 48,
          experienceLevel: "Advanced",
          yearsOfExperience: 4,
        },
      ],
      documents: [
        {
          id: "DOC004",
          type: "ID Proof",
          filename: "passport.pdf",
          uploadDate: "2024-11-30T14:20:00.000Z",
          fileSize: 1048576,
          verified: true,
          downloadUrl: "/api/documents/passport.pdf",
        },
        {
          id: "DOC005",
          type: "Educational Certificate",
          filename: "computer_science_degree.pdf",
          uploadDate: "2024-11-30T14:25:00.000Z",
          fileSize: 2097152,
          verified: true,
          downloadUrl: "/api/documents/computer_science_degree.pdf",
        },
        {
          id: "DOC006",
          type: "Professional Certificate",
          filename: "aws_certification.pdf",
          uploadDate: "2024-11-30T14:30:00.000Z",
          fileSize: 1572864,
          verified: true,
          downloadUrl: "/api/documents/aws_certification.pdf",
        },
      ],
      motivation:
        "After working in the tech industry for 6 years, I want to give back by helping students learn programming and computer science. I believe in hands-on learning and practical applications.",
      reviewNotes:
        "Strong technical background, documents look good. Need to verify AWS certification.",
      reviewedBy: "Admin Sarah",
      reviewDate: "2024-12-02T10:15:00.000Z",
      hourlyRateRange: { min: 45, max: 60 },
      experience: "6 years as Software Engineer at major tech companies",
      education: "BS in Computer Science from UC Berkeley",
      certifications: ["AWS Solutions Architect", "Google Cloud Professional"],
      languages: ["English", "Mandarin"],
      availability: "Evenings and weekends",
    },
    {
      id: "PEND003",
      name: "Prof. Maria Gonzalez",
      email: "maria.gonzalez@email.com",
      submissionDate: "2024-11-29T11:45:00.000Z",
      status: "Additional Info Required",
      bio: "Spanish language professor with extensive experience in language education and cultural studies.",
      subjects: [
        {
          subject: "Spanish",
          proposedRate: 35,
          experienceLevel: "Expert",
          yearsOfExperience: 12,
        },
        {
          subject: "English Literature",
          proposedRate: 40,
          experienceLevel: "Advanced",
          yearsOfExperience: 8,
        },
      ],
      documents: [
        {
          id: "DOC007",
          type: "Educational Certificate",
          filename: "spanish_literature_degree.pdf",
          uploadDate: "2024-11-29T11:45:00.000Z",
          fileSize: 2621440,
          verified: true,
          downloadUrl: "/api/documents/spanish_literature_degree.pdf",
        },
        {
          id: "DOC008",
          type: "Professional Certificate",
          filename: "teaching_certification.pdf",
          uploadDate: "2024-11-29T11:50:00.000Z",
          fileSize: 1835008,
          verified: true,
          downloadUrl: "/api/documents/teaching_certification.pdf",
        },
      ],
      motivation:
        "I have been teaching Spanish and literature for over 12 years. My goal is to help students not just learn the language, but also appreciate the rich culture behind it.",
      reviewNotes: "Missing ID proof document. Need to request upload.",
      reviewedBy: "Admin Mike",
      reviewDate: "2024-12-01T16:30:00.000Z",
      rejectionReason: "Missing required ID verification document",
      hourlyRateRange: { min: 30, max: 45 },
      experience: "12 years teaching at high school and college level",
      education: "MA in Spanish Literature, BA in Education",
      certifications: ["State Teaching License", "DELE Examiner Certification"],
      languages: ["Spanish", "English", "Portuguese"],
      availability: "Flexible schedule, including weekends",
    },
    {
      id: "PEND004",
      name: "Dr. James Wilson",
      email: "james.wilson.chem@email.com",
      phone: "+1234567893",
      profilePicture: "/images/user/user-05.png",
      submissionDate: "2024-11-28T16:15:00.000Z",
      status: "Pending Review",
      bio: "Chemistry professor with research background in organic synthesis and pharmaceutical development.",
      subjects: [
        {
          subject: "Chemistry",
          proposedRate: 52,
          experienceLevel: "Expert",
          yearsOfExperience: 10,
        },
        {
          subject: "Organic Chemistry",
          proposedRate: 58,
          experienceLevel: "Expert",
          yearsOfExperience: 10,
        },
        {
          subject: "Biochemistry",
          proposedRate: 55,
          experienceLevel: "Advanced",
          yearsOfExperience: 7,
        },
      ],
      documents: [
        {
          id: "DOC009",
          type: "ID Proof",
          filename: "state_id.pdf",
          uploadDate: "2024-11-28T16:15:00.000Z",
          fileSize: 1728000,
          verified: true,
          downloadUrl: "/api/documents/state_id.pdf",
        },
        {
          id: "DOC010",
          type: "Educational Certificate",
          filename: "phd_chemistry.pdf",
          uploadDate: "2024-11-28T16:20:00.000Z",
          fileSize: 3407872,
          verified: true,
          downloadUrl: "/api/documents/phd_chemistry.pdf",
        },
        {
          id: "DOC011",
          type: "Resume/CV",
          filename: "james_wilson_cv.pdf",
          uploadDate: "2024-11-28T16:25:00.000Z",
          fileSize: 2097152,
          verified: true,
          downloadUrl: "/api/documents/james_wilson_cv.pdf",
        },
        {
          id: "DOC012",
          type: "Professional Certificate",
          filename: "research_publications.pdf",
          uploadDate: "2024-11-28T16:30:00.000Z",
          fileSize: 5242880,
          verified: true,
          downloadUrl: "/api/documents/research_publications.pdf",
        },
      ],
      motivation:
        "With over 10 years in academic research and teaching, I want to help students develop a strong foundation in chemistry and inspire them to pursue scientific careers.",
      hourlyRateRange: { min: 45, max: 65 },
      experience: "10 years university teaching, 15+ published research papers",
      education:
        "PhD in Organic Chemistry from Harvard, MS in Chemistry from Caltech",
      certifications: [
        "American Chemical Society Member",
        "Peer Reviewer for Chemistry Journals",
      ],
      languages: ["English"],
      availability: "Weekday evenings, weekend mornings",
    },
    {
      id: "PEND005",
      name: "Ms. Sofia Petrov",
      email: "sofia.petrov@email.com",
      submissionDate: "2024-11-27T13:00:00.000Z",
      status: "Pending Review",
      bio: "Professional artist and art educator with expertise in both traditional and digital art techniques.",
      subjects: [
        {
          subject: "Art",
          proposedRate: 32,
          experienceLevel: "Advanced",
          yearsOfExperience: 5,
        },
        {
          subject: "Digital Design",
          proposedRate: 45,
          experienceLevel: "Expert",
          yearsOfExperience: 7,
        },
      ],
      documents: [
        {
          id: "DOC013",
          type: "ID Proof",
          filename: "drivers_license.pdf",
          uploadDate: "2024-11-27T13:00:00.000Z",
          fileSize: 2359296,
          verified: true,
          downloadUrl: "/api/documents/drivers_license_sofia.pdf",
        },
        {
          id: "DOC014",
          type: "Educational Certificate",
          filename: "fine_arts_degree.pdf",
          uploadDate: "2024-11-27T13:05:00.000Z",
          fileSize: 2883584,
          verified: true,
          downloadUrl: "/api/documents/fine_arts_degree.pdf",
        },
        {
          id: "DOC015",
          type: "Other",
          filename: "portfolio_samples.pdf",
          uploadDate: "2024-11-27T13:10:00.000Z",
          fileSize: 15728640,
          verified: true,
          downloadUrl: "/api/documents/portfolio_samples.pdf",
        },
      ],
      motivation:
        "Art has always been my passion, and I love sharing creative techniques with students. I specialize in helping students find their unique artistic voice while mastering fundamental skills.",
      hourlyRateRange: { min: 28, max: 50 },
      experience: "5 years freelance artist, 3 years art studio instructor",
      education: "BFA in Fine Arts from RISD, Digital Design Certificate",
      certifications: [
        "Adobe Certified Expert",
        "Youth Art Education Certificate",
      ],
      languages: ["English", "Russian"],
      availability: "Afternoons and weekends",
    },
  ];

  // Apply filters
  let filteredTutors = allPendingTutors;

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTutors = filteredTutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(searchLower) ||
        tutor.email.toLowerCase().includes(searchLower) ||
        tutor.subjects.some((s) =>
          s.subject.toLowerCase().includes(searchLower),
        ),
    );
  }

  if (filters?.status && filters.status !== "All") {
    filteredTutors = filteredTutors.filter(
      (tutor) => tutor.status === filters.status,
    );
  }

  if (filters?.subject && filters.subject !== "All") {
    filteredTutors = filteredTutors.filter((tutor) =>
      tutor.subjects.some((s) => s.subject === filters.subject),
    );
  }

  if (filters?.submissionDateFrom) {
    const fromDate = new Date(filters.submissionDateFrom);
    filteredTutors = filteredTutors.filter(
      (tutor) => new Date(tutor.submissionDate) >= fromDate,
    );
  }

  if (filters?.submissionDateTo) {
    const toDate = new Date(filters.submissionDateTo);
    filteredTutors = filteredTutors.filter(
      (tutor) => new Date(tutor.submissionDate) <= toDate,
    );
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    tutors: filteredTutors.slice(startIndex, endIndex),
    total: filteredTutors.length,
  };
}

export async function getPendingTutorById(
  id: string,
): Promise<PendingTutor | null> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { tutors } = await getPendingTutors();
  return tutors.find((tutor) => tutor.id === id) || null;
}

export async function approveTutor(
  tutorId: string,
  notes?: string,
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate API call
  console.log(`Approved tutor ${tutorId}`, { notes });
  return true;
}

export async function rejectTutor(
  tutorId: string,
  reason: string,
  notes?: string,
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate API call
  console.log(`Rejected tutor ${tutorId}`, { reason, notes });
  return true;
}

export async function requestAdditionalInfo(
  tutorId: string,
  requirements: string[],
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Simulate API call
  console.log(`Requested additional info for tutor ${tutorId}`, requirements);
  return true;
}

export async function bulkApproveTutors(tutorIds: string[]): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate API call
  console.log(`Bulk approved tutors:`, tutorIds);
  return true;
}

export async function bulkRejectTutors(
  tutorIds: string[],
  reason: string,
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate API call
  console.log(`Bulk rejected tutors:`, tutorIds, { reason });
  return true;
}

export async function getReviewHistory(
  tutorId: string,
): Promise<ReviewAction[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const actions: ReviewAction[] = [
    {
      id: "REV001",
      tutorId: tutorId,
      adminName: "Admin Sarah",
      action: "Under Review",
      date: "2024-12-02T10:15:00.000Z",
      notes: "Started review process. Documents look promising.",
    },
    {
      id: "REV002",
      tutorId: tutorId,
      adminName: "Admin Mike",
      action: "Requested Additional Info",
      date: "2024-12-01T16:30:00.000Z",
      notes: "Need to verify one of the certificates.",
    },
  ];

  return actions.filter((action) => action.tutorId === tutorId);
}

export async function downloadDocument(documentId: string): Promise<string> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate file download
  return `/downloads/document_${documentId}.pdf`;
}

export async function verifyDocument(documentId: string): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Simulate document verification
  console.log(`Verified document ${documentId}`);
  return true;
}

export async function getSubjectsFromPendingApplications(): Promise<string[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    "Physics",
    "Mathematics",
    "Chemistry",
    "Computer Science",
    "Python Programming",
    "Web Development",
    "Spanish",
    "English Literature",
    "Organic Chemistry",
    "Biochemistry",
    "Art",
    "Digital Design",
  ];
}
