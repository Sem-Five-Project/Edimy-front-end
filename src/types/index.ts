export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  profileImage?: string;
  // Add other properties from the backend response
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  enabled?: boolean;
  educationLevel?: string | null;
  membership?: string | null;
  password?: string;
  updatedAt?: string;
}

export interface Subject {
  subjectId: number;
  subjectName: string;
  hourlyRate: number;
}

export interface Language {
  languageId: number;
  languageName: string;
}

export interface Tutor extends User {
  tutorProfileId: number;
  subjects: Subject[];
  languages: Language[];
  experience: number;
  rating: number;
  classCompletionRate: number;
  bio: string | null;
  hourlyRate: number; // base rate, subjects have their own rates
  totalClasses?: number;
  completedClasses?: number;
}

export interface TimeSlot {
  slotId: number;
  availabilityId: number;
  tutorId: number;
  tutorName: string;
  slotDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'IN_PROGRESS';
  hourlyRate: number | null;
  tutorBio: string | null;
  tutorExperience: number;
  isRecurring: boolean;
  subjectName: string | null;
  rating: number;
  lockExpiry?: string;
  // For compatibility with existing code
  id?: string;
  price?: number;
}

export interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  slotId: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  createdAt: string;
  tutor: Tutor;
  slot: TimeSlot;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  accessToken?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterData {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

export interface FilterOptions {
  search?: string;
  subjects?: string[];
  minRating?: number;
  maxPrice?: number;
  experience?: number;
  sortBy?: 'rating' | 'price' | 'experience' | 'completion_rate';
  sortOrder?: 'asc' | 'desc';
}

// Spring Boot pagination response structure
export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

export interface ClassType {
  id: string;
  name: string;
  description: string;
  durationWeeks?: number;
  priceMultiplier: number;
}

export interface BookingPreferences {
  selectedLanguage: Language | null;
  selectedSubject: Subject | null;
  selectedClassType: ClassType | null;
  finalPrice: number;
}

export const CLASS_TYPES: ClassType[] = [
  {
    id: 'lesson',
    name: 'Single Lesson',
    description: 'One-time tutoring session',
    priceMultiplier: 1.0,
  },
  {
    id: 'normal',
    name: 'Regular Classes',
    description: 'Weekly classes with flexible scheduling',
    durationWeeks: 4,
    priceMultiplier: 0.95,
  },
  {
    id: 'monthly',
    name: 'Monthly Recurring',
    description: 'Committed monthly package with best rates',
    durationWeeks: 12,
    priceMultiplier: 0.85,
  },
];

export interface Class{
  classId?: number;      
  className: string;
  tutorId: number;
  subjectId: number;
  classTypeId: number;
  comment?: string;      
  startTime: string;    
  endTime: string;       
  date: string;         

}
export interface ClassDoc {
  docId?: number;       // optional, assigned by the backend
  classId?: number;     // optional, may be null if not linked yet
  docType: string;      // e.g., "pdf", "video"
  link: string | any;         // URL or path to the document
}

export interface TutorAvailability {
  availabilityId?: number;   // assigned by backend
  tutorId: number;
  dayOfWeek?: string;        // e.g. "Mon", "Tue"
  startTime: string;         // "HH:mm:ss"
  endTime: string;           // "HH:mm:ss"
  date?: string;             // "YYYY-MM-DD" if you want specific date
  recurring: boolean;
}


export interface Subject {
  subjectId: number;
  subjectName: string;
}
