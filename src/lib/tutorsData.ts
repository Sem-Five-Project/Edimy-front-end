// Tutor management data fetching functions

export interface Tutor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tutorId: string;
  registrationDate: string;
  lastLogin: string | null;
  status: "Active" | "Suspended" | "Deleted";
  profilePicture?: string;
  bio?: string;
  subjects: TutorSubject[];
  availability: AvailabilitySlot[];
  totalSessions: number;
  upcomingSessions: number;
  totalEarnings: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
  verificationDate?: string;
  notes?: string;
  flags?: string[];
}

export interface TutorSubject {
  subject: string;
  hourlyRate: number;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
}

export interface AvailabilitySlot {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface TutorSession {
  id: string;
  studentName: string;
  subject: string;
  date: string;
  duration: number;
  status: "Completed" | "Cancelled" | "Upcoming";
  earnings: number;
  rating?: number;
  studentReview?: string;
}

export interface TutorEarning {
  id: string;
  date: string;
  amount: number;
  type: "Session Payment" | "Bonus" | "Refund";
  status: "Completed" | "Pending" | "Processing";
  sessionId?: string;
}

export interface TutorReview {
  id: string;
  studentName: string;
  subject: string;
  rating: number;
  review: string;
  date: string;
  sessionId: string;
}

export interface AdminAction {
  id: string;
  adminName: string;
  action: string;
  tutorId: string;
  tutorName: string;
  date: string;
  details?: string;
}

export async function getTutors(filters?: {
  search?: string;
  status?: string;
  subject?: string;
  page?: number;
  limit?: number;
}): Promise<{ tutors: Tutor[]; total: number }> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const allTutors: Tutor[] = [
    {
      id: "TUT001",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1234567890",
      tutorId: "TU2024001",
      registrationDate: "2024-01-10T08:30:00.000Z",
      lastLogin: "2024-12-02T15:22:00.000Z",
      status: "Active",
      profilePicture: "/images/user/user-02.png",
      bio: "PhD in Mathematics with 10+ years of teaching experience. Specializes in calculus and advanced mathematics.",
      subjects: [
        { subject: "Mathematics", hourlyRate: 45, experienceLevel: "Expert" },
        { subject: "Calculus", hourlyRate: 50, experienceLevel: "Expert" },
        { subject: "Statistics", hourlyRate: 40, experienceLevel: "Advanced" },
      ],
      availability: [
        {
          day: "Monday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
        {
          day: "Tuesday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
        {
          day: "Wednesday",
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ],
      totalSessions: 145,
      upcomingSessions: 8,
      totalEarnings: 6520.0,
      averageRating: 4.9,
      totalReviews: 123,
      isVerified: true,
      verificationDate: "2024-01-15T10:00:00.000Z",
      notes: "Excellent tutor, very popular among students",
    },
    {
      id: "TUT002",
      name: "Prof. Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1234567891",
      tutorId: "TU2024002",
      registrationDate: "2024-01-15T14:20:00.000Z",
      lastLogin: "2024-12-01T11:45:00.000Z",
      status: "Active",
      bio: "Computer Science professor with expertise in programming and software development.",
      subjects: [
        {
          subject: "Computer Science",
          hourlyRate: 55,
          experienceLevel: "Expert",
        },
        {
          subject: "Python Programming",
          hourlyRate: 50,
          experienceLevel: "Expert",
        },
        {
          subject: "Data Structures",
          hourlyRate: 52,
          experienceLevel: "Expert",
        },
      ],
      availability: [
        {
          day: "Monday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
        {
          day: "Thursday",
          startTime: "10:00",
          endTime: "16:00",
          isAvailable: true,
        },
      ],
      totalSessions: 98,
      upcomingSessions: 5,
      totalEarnings: 5390.0,
      averageRating: 4.8,
      totalReviews: 85,
      isVerified: true,
      verificationDate: "2024-01-20T12:00:00.000Z",
    },
    {
      id: "TUT003",
      name: "Ms. Emily Rodriguez",
      email: "emily.rodriguez@email.com",
      tutorId: "TU2024003",
      registrationDate: "2024-02-01T09:15:00.000Z",
      lastLogin: "2024-11-28T16:30:00.000Z",
      status: "Suspended",
      subjects: [
        { subject: "Spanish", hourlyRate: 35, experienceLevel: "Advanced" },
        {
          subject: "English Literature",
          hourlyRate: 38,
          experienceLevel: "Advanced",
        },
      ],
      availability: [],
      totalSessions: 32,
      upcomingSessions: 0,
      totalEarnings: 1140.0,
      averageRating: 4.2,
      totalReviews: 28,
      isVerified: false,
      notes: "Suspended due to multiple cancellations",
      flags: ["Multiple Cancellations", "Under Review"],
    },
    {
      id: "TUT004",
      name: "Dr. James Wilson",
      email: "james.wilson@email.com",
      phone: "+1234567893",
      tutorId: "TU2024004",
      registrationDate: "2024-02-15T11:30:00.000Z",
      lastLogin: "2024-12-02T09:15:00.000Z",
      status: "Active",
      bio: "Chemistry PhD with research background in organic chemistry and biochemistry.",
      subjects: [
        { subject: "Chemistry", hourlyRate: 48, experienceLevel: "Expert" },
        {
          subject: "Organic Chemistry",
          hourlyRate: 52,
          experienceLevel: "Expert",
        },
        { subject: "Biochemistry", hourlyRate: 55, experienceLevel: "Expert" },
      ],
      availability: [
        {
          day: "Tuesday",
          startTime: "08:00",
          endTime: "16:00",
          isAvailable: true,
        },
        {
          day: "Friday",
          startTime: "08:00",
          endTime: "16:00",
          isAvailable: true,
        },
      ],
      totalSessions: 76,
      upcomingSessions: 6,
      totalEarnings: 3800.0,
      averageRating: 4.7,
      totalReviews: 64,
      isVerified: true,
      verificationDate: "2024-02-20T14:00:00.000Z",
    },
    {
      id: "TUT005",
      name: "Ms. Lisa Thompson",
      email: "lisa.thompson@email.com",
      tutorId: "TU2024005",
      registrationDate: "2024-11-20T10:00:00.000Z",
      lastLogin: "2024-12-02T18:20:00.000Z",
      status: "Active",
      bio: "Art teacher with focus on digital design and traditional drawing techniques.",
      subjects: [
        { subject: "Art", hourlyRate: 30, experienceLevel: "Intermediate" },
        {
          subject: "Digital Design",
          hourlyRate: 42,
          experienceLevel: "Advanced",
        },
      ],
      availability: [
        {
          day: "Saturday",
          startTime: "10:00",
          endTime: "18:00",
          isAvailable: true,
        },
        {
          day: "Sunday",
          startTime: "12:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ],
      totalSessions: 8,
      upcomingSessions: 3,
      totalEarnings: 280.0,
      averageRating: 4.6,
      totalReviews: 6,
      isVerified: false,
      notes: "New tutor, showing great potential",
      flags: ["New Tutor"],
    },
    {
      id: "TUT006",
      name: "Dr. Robert Kumar",
      email: "robert.kumar@email.com",
      phone: "+1234567895",
      tutorId: "TU2024006",
      registrationDate: "2024-03-01T13:45:00.000Z",
      lastLogin: null,
      status: "Deleted",
      subjects: [
        { subject: "Physics", hourlyRate: 46, experienceLevel: "Expert" },
      ],
      availability: [],
      totalSessions: 15,
      upcomingSessions: 0,
      totalEarnings: 690.0,
      averageRating: 3.8,
      totalReviews: 12,
      isVerified: true,
      notes: "Account deleted at user request",
    },
  ];

  // Apply filters
  let filteredTutors = allTutors;

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredTutors = filteredTutors.filter(
      (tutor) =>
        tutor.name.toLowerCase().includes(searchLower) ||
        tutor.email.toLowerCase().includes(searchLower) ||
        tutor.tutorId.toLowerCase().includes(searchLower) ||
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

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    tutors: filteredTutors.slice(startIndex, endIndex),
    total: filteredTutors.length,
  };
}

export async function getTutorById(id: string): Promise<Tutor | null> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { tutors } = await getTutors();
  return tutors.find((tutor) => tutor.id === id) || null;
}

export async function getTutorSessions(
  tutorId: string,
): Promise<TutorSession[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const sessions: TutorSession[] = [
    {
      id: "SES001",
      studentName: "John Doe",
      subject: "Mathematics",
      date: "2024-11-25T10:00:00.000Z",
      duration: 60,
      status: "Completed",
      earnings: 45.0,
      rating: 5,
      studentReview: "Excellent explanation of complex concepts!",
    },
    {
      id: "SES002",
      studentName: "Jane Smith",
      subject: "Calculus",
      date: "2024-11-28T14:00:00.000Z",
      duration: 90,
      status: "Completed",
      earnings: 75.0,
      rating: 4,
      studentReview: "Very helpful and patient teacher.",
    },
    {
      id: "SES003",
      studentName: "Mike Johnson",
      subject: "Statistics",
      date: "2024-12-05T16:00:00.000Z",
      duration: 60,
      status: "Upcoming",
      earnings: 40.0,
    },
    {
      id: "SES004",
      studentName: "Sarah Wilson",
      subject: "Mathematics",
      date: "2024-12-08T11:00:00.000Z",
      duration: 75,
      status: "Upcoming",
      earnings: 56.25,
    },
  ];

  return sessions;
}

export async function getTutorEarnings(
  tutorId: string,
): Promise<TutorEarning[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const earnings: TutorEarning[] = [
    {
      id: "PAY001",
      date: "2024-11-25T10:00:00.000Z",
      amount: 45.0,
      type: "Session Payment",
      status: "Completed",
      sessionId: "SES001",
    },
    {
      id: "PAY002",
      date: "2024-11-28T14:00:00.000Z",
      amount: 75.0,
      type: "Session Payment",
      status: "Completed",
      sessionId: "SES002",
    },
    {
      id: "PAY003",
      date: "2024-12-01T09:00:00.000Z",
      amount: 100.0,
      type: "Bonus",
      status: "Completed",
    },
    {
      id: "PAY004",
      date: "2024-12-02T12:00:00.000Z",
      amount: 40.0,
      type: "Session Payment",
      status: "Pending",
      sessionId: "SES003",
    },
  ];

  return earnings;
}

export async function getTutorReviews(tutorId: string): Promise<TutorReview[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 700));

  const reviews: TutorReview[] = [
    {
      id: "REV001",
      studentName: "John Doe",
      subject: "Mathematics",
      rating: 5,
      review:
        "Dr. Johnson is an amazing tutor! She explains complex mathematical concepts in a way that's easy to understand.",
      date: "2024-11-25T11:30:00.000Z",
      sessionId: "SES001",
    },
    {
      id: "REV002",
      studentName: "Jane Smith",
      subject: "Calculus",
      rating: 4,
      review:
        "Very knowledgeable and patient. Helped me improve my calculus grades significantly.",
      date: "2024-11-28T15:30:00.000Z",
      sessionId: "SES002",
    },
    {
      id: "REV003",
      studentName: "Emily Davis",
      subject: "Statistics",
      rating: 5,
      review:
        "Outstanding tutor with excellent teaching methods. Highly recommend!",
      date: "2024-11-20T16:00:00.000Z",
      sessionId: "SES010",
    },
  ];

  return reviews;
}

export async function updateTutorStatus(
  tutorId: string,
  status: Tutor["status"],
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate API call
  console.log(`Updated tutor ${tutorId} status to ${status}`);
  return true;
}

export async function deleteTutor(tutorId: string): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate API call
  console.log(`Deleted tutor ${tutorId}`);
  return true;
}

export async function bulkUpdateTutors(
  tutorIds: string[],
  action: "suspend" | "activate" | "delete",
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate API call
  console.log(`Bulk ${action} for tutors:`, tutorIds);
  return true;
}

export async function exportTutors(filters?: any): Promise<string> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate file generation
  return "tutors_export_2024.csv";
}

export async function getAdminActions(
  tutorId?: string,
): Promise<AdminAction[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const actions: AdminAction[] = [
    {
      id: "ACT001",
      adminName: "Admin John",
      action: "Suspended tutor account",
      tutorId: "TUT003",
      tutorName: "Ms. Emily Rodriguez",
      date: "2024-11-30T14:30:00.000Z",
      details: "Multiple session cancellations reported by students",
    },
    {
      id: "ACT002",
      adminName: "Admin Sarah",
      action: "Updated tutor profile",
      tutorId: "TUT001",
      tutorName: "Dr. Sarah Johnson",
      date: "2024-11-28T10:15:00.000Z",
      details: "Updated hourly rates for Mathematics subject",
    },
    {
      id: "ACT003",
      adminName: "Admin Mike",
      action: "Verified tutor account",
      tutorId: "TUT004",
      tutorName: "Dr. James Wilson",
      date: "2024-02-20T14:00:00.000Z",
      details: "Completed document verification process",
    },
  ];

  if (tutorId) {
    return actions.filter((action) => action.tutorId === tutorId);
  }

  return actions;
}

export async function getSubjectsList(): Promise<string[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English Literature",
    "Spanish",
    "French",
    "History",
    "Art",
    "Music",
    "Economics",
    "Business Studies",
    "Psychology",
    "Philosophy",
  ];
}
