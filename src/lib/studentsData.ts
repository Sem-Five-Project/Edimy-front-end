// Student management data fetching functions

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  studentId: string;
  registrationDate: string;
  lastLogin: string | null;
  status: "Active" | "Suspended" | "Deleted";
  profilePicture?: string;
  registeredSubjects: string[];
  totalSessions: number;
  upcomingSessions: number;
  totalPayments: number;
  outstandingBalance: number;
  notes?: string;
  flags?: string[];
}

export interface SessionHistory {
  id: string;
  tutorName: string;
  subject: string;
  date: string;
  duration: number;
  status: "Completed" | "Cancelled" | "Upcoming";
  rating?: number;
}

export interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  type: "Session Payment" | "Refund" | "Credit";
  status: "Completed" | "Pending" | "Failed";
  sessionId?: string;
}

export async function getStudents(filters?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ students: Student[]; total: number }> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const allStudents: Student[] = [
    {
      id: "STU001",
      name: "John Doe",
      email: "john.doe@email.com",
      phone: "+1234567890",
      studentId: "ST2024001",
      registrationDate: "2024-01-15T10:30:00.000Z",
      lastLogin: "2024-12-01T14:22:00.000Z",
      status: "Active",
      profilePicture: "/images/user/user-01.png",
      registeredSubjects: ["Mathematics", "Physics"],
      totalSessions: 15,
      upcomingSessions: 2,
      totalPayments: 450.0,
      outstandingBalance: 0,
      notes: "Excellent student, very punctual",
    },
    {
      id: "STU002",
      name: "Jane Smith",
      email: "jane.smith@email.com",
      phone: "+1234567891",
      studentId: "ST2024002",
      registrationDate: "2024-01-20T09:15:00.000Z",
      lastLogin: "2024-11-28T16:45:00.000Z",
      status: "Active",
      registeredSubjects: ["Chemistry", "Biology"],
      totalSessions: 8,
      upcomingSessions: 1,
      totalPayments: 240.0,
      outstandingBalance: 30.0,
    },
    {
      id: "STU003",
      name: "Mike Johnson",
      email: "mike.johnson@email.com",
      studentId: "ST2024003",
      registrationDate: "2024-02-01T11:20:00.000Z",
      lastLogin: null,
      status: "Suspended",
      registeredSubjects: ["English Literature"],
      totalSessions: 3,
      upcomingSessions: 0,
      totalPayments: 90.0,
      outstandingBalance: 60.0,
      notes: "Payment issues - suspended until balance cleared",
      flags: ["Payment Issue", "Contact Attempted"],
    },
    {
      id: "STU004",
      name: "Sarah Wilson",
      email: "sarah.wilson@email.com",
      phone: "+1234567893",
      studentId: "ST2024004",
      registrationDate: "2024-02-10T14:00:00.000Z",
      lastLogin: "2024-12-02T10:15:00.000Z",
      status: "Active",
      registeredSubjects: ["Computer Science", "Mathematics"],
      totalSessions: 22,
      upcomingSessions: 3,
      totalPayments: 660.0,
      outstandingBalance: 0,
    },
    {
      id: "STU005",
      name: "David Brown",
      email: "david.brown@email.com",
      studentId: "ST2024005",
      registrationDate: "2024-03-01T16:30:00.000Z",
      lastLogin: "2024-11-15T12:00:00.000Z",
      status: "Deleted",
      registeredSubjects: ["History"],
      totalSessions: 1,
      upcomingSessions: 0,
      totalPayments: 30.0,
      outstandingBalance: 0,
      notes: "Account deleted at user request",
    },
    {
      id: "STU006",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1234567895",
      studentId: "ST2024006",
      registrationDate: "2024-11-25T09:00:00.000Z",
      lastLogin: "2024-12-02T20:30:00.000Z",
      status: "Active",
      registeredSubjects: ["Art", "Design"],
      totalSessions: 2,
      upcomingSessions: 1,
      totalPayments: 60.0,
      outstandingBalance: 0,
      notes: "Recently registered",
      flags: ["New Student"],
    },
  ];

  // Apply filters
  let filteredStudents = allStudents;

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredStudents = filteredStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.studentId.toLowerCase().includes(searchLower),
    );
  }

  if (filters?.status && filters.status !== "All") {
    filteredStudents = filteredStudents.filter(
      (student) => student.status === filters.status,
    );
  }

  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  return {
    students: filteredStudents.slice(startIndex, endIndex),
    total: filteredStudents.length,
  };
}

export async function getStudentById(id: string): Promise<Student | null> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const { students } = await getStudents();
  return students.find((student) => student.id === id) || null;
}

export async function getStudentSessions(
  studentId: string,
): Promise<SessionHistory[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const sessions: SessionHistory[] = [
    {
      id: "SES001",
      tutorName: "Dr. Smith",
      subject: "Mathematics",
      date: "2024-11-20T10:00:00.000Z",
      duration: 60,
      status: "Completed",
      rating: 5,
    },
    {
      id: "SES002",
      tutorName: "Prof. Johnson",
      subject: "Physics",
      date: "2024-11-25T14:00:00.000Z",
      duration: 90,
      status: "Completed",
      rating: 4,
    },
    {
      id: "SES003",
      tutorName: "Dr. Wilson",
      subject: "Chemistry",
      date: "2024-12-05T16:00:00.000Z",
      duration: 60,
      status: "Upcoming",
    },
    {
      id: "SES004",
      tutorName: "Ms. Brown",
      subject: "Biology",
      date: "2024-12-10T11:00:00.000Z",
      duration: 75,
      status: "Upcoming",
    },
  ];

  return sessions;
}

export async function getStudentPayments(
  studentId: string,
): Promise<PaymentHistory[]> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  const payments: PaymentHistory[] = [
    {
      id: "PAY001",
      date: "2024-11-20T10:00:00.000Z",
      amount: 30.0,
      type: "Session Payment",
      status: "Completed",
      sessionId: "SES001",
    },
    {
      id: "PAY002",
      date: "2024-11-25T14:00:00.000Z",
      amount: 45.0,
      type: "Session Payment",
      status: "Completed",
      sessionId: "SES002",
    },
    {
      id: "PAY003",
      date: "2024-11-30T09:00:00.000Z",
      amount: -15.0,
      type: "Refund",
      status: "Completed",
    },
    {
      id: "PAY004",
      date: "2024-12-01T12:00:00.000Z",
      amount: 30.0,
      type: "Session Payment",
      status: "Pending",
      sessionId: "SES003",
    },
  ];

  return payments;
}

export async function updateStudentStatus(
  studentId: string,
  status: Student["status"],
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate API call
  console.log(`Updated student ${studentId} status to ${status}`);
  return true;
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Simulate API call
  console.log(`Deleted student ${studentId}`);
  return true;
}

export async function bulkUpdateStudents(
  studentIds: string[],
  action: "suspend" | "activate" | "delete",
): Promise<boolean> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simulate API call
  console.log(`Bulk ${action} for students:`, studentIds);
  return true;
}

export async function exportStudents(filters?: any): Promise<string> {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate file generation
  return "students_export_2024.csv";
}
