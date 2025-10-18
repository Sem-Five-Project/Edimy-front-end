export type SessionStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export interface StudentInfo {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  joinedAt: string;
}

export interface TutorInfo {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  rating: number;
  totalSessions: number;
}

export interface SessionHistory {
  action: string;
  timestamp: string;
  performedBy: string;
  details: string;
}

export interface PaymentInfo {
  sessionFee: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
}

export interface AttendanceInfo {
  studentJoined: boolean;
  tutorJoined: boolean;
  studentJoinTime?: string;
  tutorJoinTime?: string;
  sessionStartTime?: string;
  sessionEndTime?: string;
  actualDuration?: number; // in minutes
}

export interface SessionData {
  id: string;
  student: StudentInfo;
  tutor: TutorInfo;
  subject: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number; // in minutes
  status: SessionStatus;
  createdAt: string;
  updatedAt: string;
  description?: string;
  meetingLink?: string;
  payment: PaymentInfo;
  attendance: AttendanceInfo;
  history: SessionHistory[];
  notes?: string;
}

// Mock data generator
const generateMockSessions = (): SessionData[] => {
  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "History",
    "Economics",
  ];
  const statuses: SessionStatus[] = [
    "Upcoming",
    "Ongoing",
    "Completed",
    "Cancelled",
  ];
  const paymentStatuses: PaymentStatus[] = ["Paid", "Pending", "Refunded"];

  const students: StudentInfo[] = [
    {
      id: "std1",
      name: "Alice Johnson",
      email: "alice@example.com",
      joinedAt: "2024-01-15",
    },
    {
      id: "std2",
      name: "Bob Smith",
      email: "bob@example.com",
      joinedAt: "2024-02-20",
    },
    {
      id: "std3",
      name: "Carol Williams",
      email: "carol@example.com",
      joinedAt: "2024-03-10",
    },
    {
      id: "std4",
      name: "David Brown",
      email: "david@example.com",
      joinedAt: "2024-01-25",
    },
    {
      id: "std5",
      name: "Eva Davis",
      email: "eva@example.com",
      joinedAt: "2024-02-14",
    },
  ];

  const tutors: TutorInfo[] = [
    {
      id: "tut1",
      name: "Dr. Michael Chen",
      email: "michael.chen@example.com",
      rating: 4.9,
      totalSessions: 156,
    },
    {
      id: "tut2",
      name: "Prof. Sarah Wilson",
      email: "sarah.wilson@example.com",
      rating: 4.8,
      totalSessions: 203,
    },
    {
      id: "tut3",
      name: "Dr. James Rodriguez",
      email: "james.rodriguez@example.com",
      rating: 4.7,
      totalSessions: 98,
    },
    {
      id: "tut4",
      name: "Ms. Emily Taylor",
      email: "emily.taylor@example.com",
      rating: 4.9,
      totalSessions: 142,
    },
    {
      id: "tut5",
      name: "Dr. Robert Kim",
      email: "robert.kim@example.com",
      rating: 4.6,
      totalSessions: 87,
    },
  ];

  const sessions: SessionData[] = [];

  for (let i = 1; i <= 50; i++) {
    const student = students[Math.floor(Math.random() * students.length)];
    const tutor = tutors[Math.floor(Math.random() * tutors.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const paymentStatus =
      paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];

    // Generate dates (mix of past, present, and future)
    const baseDate = new Date();
    const dayOffset = Math.floor(Math.random() * 60) - 30; // -30 to +30 days
    const sessionDate = new Date(baseDate);
    sessionDate.setDate(baseDate.getDate() + dayOffset);

    const hour = Math.floor(Math.random() * 12) + 9; // 9 AM to 9 PM
    const minute = Math.random() > 0.5 ? 0 : 30;

    const duration = [30, 60, 90, 120][Math.floor(Math.random() * 4)];
    const sessionFee =
      duration === 30 ? 25 : duration === 60 ? 45 : duration === 90 ? 65 : 85;

    const history: SessionHistory[] = [
      {
        action: "Session Booked",
        timestamp: new Date(
          sessionDate.getTime() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        performedBy: student.name,
        details: `Session booked for ${subject} with ${tutor.name}`,
      },
    ];

    if (status === "Cancelled") {
      history.push({
        action: "Session Cancelled",
        timestamp: new Date(
          sessionDate.getTime() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        performedBy: Math.random() > 0.5 ? student.name : tutor.name,
        details: "Session cancelled due to scheduling conflict",
      });
    }

    const attendance: AttendanceInfo = {
      studentJoined: status === "Completed" || status === "Ongoing",
      tutorJoined: status === "Completed" || status === "Ongoing",
      studentJoinTime:
        status === "Completed" || status === "Ongoing"
          ? new Date(sessionDate.getTime() + 2 * 60 * 1000).toISOString()
          : undefined,
      tutorJoinTime:
        status === "Completed" || status === "Ongoing"
          ? sessionDate.toISOString()
          : undefined,
      actualDuration: status === "Completed" ? duration : undefined,
    };

    sessions.push({
      id: `sess_${i.toString().padStart(4, "0")}`,
      student,
      tutor,
      subject,
      scheduledDate: sessionDate.toISOString().split("T")[0],
      scheduledTime: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
      duration,
      status,
      createdAt: new Date(
        sessionDate.getTime() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      meetingLink: `https://meet.edimy.com/session/${i}`,
      payment: {
        sessionFee,
        currency: "USD",
        paymentStatus,
        paymentMethod: paymentStatus !== "Pending" ? "Credit Card" : undefined,
        transactionId:
          paymentStatus !== "Pending"
            ? `txn_${Math.random().toString(36).substr(2, 9)}`
            : undefined,
        paidAt:
          paymentStatus === "Paid"
            ? new Date(
                sessionDate.getTime() - 6 * 24 * 60 * 60 * 1000,
              ).toISOString()
            : undefined,
        refundedAt:
          paymentStatus === "Refunded" ? new Date().toISOString() : undefined,
        refundAmount: paymentStatus === "Refunded" ? sessionFee : undefined,
      },
      attendance,
      history,
      description: `${subject} tutoring session focusing on advanced concepts and problem-solving techniques.`,
    });
  }

  return sessions.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
};

let mockSessions = generateMockSessions();

export interface SessionFilters {
  studentName?: string;
  tutorName?: string;
  subject?: string;
  status?: SessionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface SessionStats {
  totalSessions: number;
  upcomingSessions: number;
  ongoingSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  totalRevenue: number;
  pendingPayments: number;
  averageSessionDuration: number;
  completionRate: number;
}

export const getSessions = async (
  filters: SessionFilters = {},
): Promise<{
  sessions: SessionData[];
  total: number;
  stats: SessionStats;
}> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filteredSessions = [...mockSessions];

  // Apply filters
  if (filters.studentName) {
    filteredSessions = filteredSessions.filter((session) =>
      session.student.name
        .toLowerCase()
        .includes(filters.studentName!.toLowerCase()),
    );
  }

  if (filters.tutorName) {
    filteredSessions = filteredSessions.filter((session) =>
      session.tutor.name
        .toLowerCase()
        .includes(filters.tutorName!.toLowerCase()),
    );
  }

  if (filters.subject) {
    filteredSessions = filteredSessions.filter((session) =>
      session.subject.toLowerCase().includes(filters.subject!.toLowerCase()),
    );
  }

  if (filters.status) {
    filteredSessions = filteredSessions.filter(
      (session) => session.status === filters.status,
    );
  }

  if (filters.dateFrom) {
    filteredSessions = filteredSessions.filter(
      (session) => session.scheduledDate >= filters.dateFrom!,
    );
  }

  if (filters.dateTo) {
    filteredSessions = filteredSessions.filter(
      (session) => session.scheduledDate <= filters.dateTo!,
    );
  }

  // Calculate stats
  const stats: SessionStats = {
    totalSessions: filteredSessions.length,
    upcomingSessions: filteredSessions.filter((s) => s.status === "Upcoming")
      .length,
    ongoingSessions: filteredSessions.filter((s) => s.status === "Ongoing")
      .length,
    completedSessions: filteredSessions.filter((s) => s.status === "Completed")
      .length,
    cancelledSessions: filteredSessions.filter((s) => s.status === "Cancelled")
      .length,
    totalRevenue: filteredSessions
      .filter((s) => s.payment.paymentStatus === "Paid")
      .reduce((sum, s) => sum + s.payment.sessionFee, 0),
    pendingPayments: filteredSessions
      .filter((s) => s.payment.paymentStatus === "Pending")
      .reduce((sum, s) => sum + s.payment.sessionFee, 0),
    averageSessionDuration:
      filteredSessions.length > 0
        ? filteredSessions.reduce((sum, s) => sum + s.duration, 0) /
          filteredSessions.length
        : 0,
    completionRate:
      filteredSessions.length > 0
        ? (filteredSessions.filter((s) => s.status === "Completed").length /
            filteredSessions.length) *
          100
        : 0,
  };

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginatedSessions = filteredSessions.slice(
    startIndex,
    startIndex + limit,
  );

  return {
    sessions: paginatedSessions,
    total: filteredSessions.length,
    stats,
  };
};

export const getSessionById = async (
  id: string,
): Promise<SessionData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return mockSessions.find((session) => session.id === id) || null;
};

export const cancelSession = async (
  id: string,
  reason: string,
  adminId: string,
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const sessionIndex = mockSessions.findIndex((session) => session.id === id);
  if (sessionIndex === -1) return false;

  const session = mockSessions[sessionIndex];
  session.status = "Cancelled";
  session.updatedAt = new Date().toISOString();
  session.history.push({
    action: "Session Cancelled by Admin",
    timestamp: new Date().toISOString(),
    performedBy: `Admin ${adminId}`,
    details: `Session cancelled. Reason: ${reason}`,
  });

  // Update payment status if needed
  if (session.payment.paymentStatus === "Paid") {
    session.payment.paymentStatus = "Refunded";
    session.payment.refundedAt = new Date().toISOString();
    session.payment.refundAmount = session.payment.sessionFee;
  }

  return true;
};

export const rescheduleSession = async (
  id: string,
  newDate: string,
  newTime: string,
  adminId: string,
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const sessionIndex = mockSessions.findIndex((session) => session.id === id);
  if (sessionIndex === -1) return false;

  const session = mockSessions[sessionIndex];
  const oldDate = session.scheduledDate;
  const oldTime = session.scheduledTime;

  session.scheduledDate = newDate;
  session.scheduledTime = newTime;
  session.updatedAt = new Date().toISOString();
  session.history.push({
    action: "Session Rescheduled by Admin",
    timestamp: new Date().toISOString(),
    performedBy: `Admin ${adminId}`,
    details: `Session rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}`,
  });

  return true;
};

export const refundSession = async (
  id: string,
  refundAmount: number,
  reason: string,
  adminId: string,
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const sessionIndex = mockSessions.findIndex((session) => session.id === id);
  if (sessionIndex === -1) return false;

  const session = mockSessions[sessionIndex];
  session.payment.paymentStatus = "Refunded";
  session.payment.refundedAt = new Date().toISOString();
  session.payment.refundAmount = refundAmount;
  session.updatedAt = new Date().toISOString();
  session.history.push({
    action: "Payment Refunded by Admin",
    timestamp: new Date().toISOString(),
    performedBy: `Admin ${adminId}`,
    details: `Refund of $${refundAmount} processed. Reason: ${reason}`,
  });

  return true;
};

export const bulkCancelSessions = async (
  sessionIds: string[],
  reason: string,
  adminId: string,
): Promise<{ success: number; failed: number }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  let success = 0;
  let failed = 0;

  for (const id of sessionIds) {
    const result = await cancelSession(id, reason, adminId);
    if (result) success++;
    else failed++;
  }

  return { success, failed };
};

export const exportSessionsData = async (
  filters: SessionFilters = {},
): Promise<string> => {
  const { sessions } = await getSessions({ ...filters, limit: 1000 });

  // Generate CSV content
  const headers = [
    "Session ID",
    "Student Name",
    "Student Email",
    "Tutor Name",
    "Tutor Email",
    "Subject",
    "Scheduled Date",
    "Scheduled Time",
    "Duration (min)",
    "Status",
    "Session Fee",
    "Payment Status",
    "Student Joined",
    "Tutor Joined",
    "Created At",
  ];

  const csvContent = [
    headers.join(","),
    ...sessions.map((session) =>
      [
        session.id,
        `"${session.student.name}"`,
        session.student.email,
        `"${session.tutor.name}"`,
        session.tutor.email,
        `"${session.subject}"`,
        session.scheduledDate,
        session.scheduledTime,
        session.duration,
        session.status,
        session.payment.sessionFee,
        session.payment.paymentStatus,
        session.attendance.studentJoined ? "Yes" : "No",
        session.attendance.tutorJoined ? "Yes" : "No",
        new Date(session.createdAt).toLocaleDateString(),
      ].join(","),
    ),
  ].join("\n");

  return csvContent;
};

export const getSessionAnalytics = async (): Promise<{
  subjectTrends: { subject: string; count: number }[];
  busyHours: { hour: number; count: number }[];
  cancellationTrends: {
    tutorCancellations: { tutor: string; count: number }[];
    studentCancellations: { student: string; count: number }[];
  };
  monthlyStats: {
    month: string;
    completed: number;
    cancelled: number;
    revenue: number;
  }[];
}> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Subject trends
  const subjectCounts = mockSessions.reduce(
    (acc, session) => {
      acc[session.subject] = (acc[session.subject] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const subjectTrends = Object.entries(subjectCounts)
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count);

  // Busy hours
  const hourCounts = mockSessions.reduce(
    (acc, session) => {
      const hour = parseInt(session.scheduledTime.split(":")[0]);
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    },
    {} as Record<number, number>,
  );

  const busyHours = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  // Cancellation trends (simplified)
  const tutorCancellations = [
    { tutor: "Dr. Michael Chen", count: 3 },
    { tutor: "Prof. Sarah Wilson", count: 1 },
    { tutor: "Dr. James Rodriguez", count: 2 },
  ];

  const studentCancellations = [
    { student: "Alice Johnson", count: 2 },
    { student: "Bob Smith", count: 4 },
    { student: "Carol Williams", count: 1 },
  ];

  // Monthly stats (last 6 months)
  const monthlyStats = [
    { month: "Mar 2025", completed: 45, cancelled: 8, revenue: 2250 },
    { month: "Apr 2025", completed: 52, cancelled: 6, revenue: 2600 },
    { month: "May 2025", completed: 48, cancelled: 9, revenue: 2400 },
    { month: "Jun 2025", completed: 55, cancelled: 7, revenue: 2750 },
    { month: "Jul 2025", completed: 60, cancelled: 5, revenue: 3000 },
    { month: "Aug 2025", completed: 58, cancelled: 8, revenue: 2900 },
  ];

  return {
    subjectTrends,
    busyHours,
    cancellationTrends: {
      tutorCancellations,
      studentCancellations,
    },
    monthlyStats,
  };
};
