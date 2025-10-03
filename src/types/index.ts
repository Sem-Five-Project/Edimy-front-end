export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  isVerified: boolean;
  createdAt: string;
  profileImage?: string | null; // Add this line
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  enabled?: boolean;
  educationLevel?: string | null;
  membership?: string | null;
  password?: string;
  updatedAt?: string;
  stream?: string | null;
}

export interface Subject {
  subjectId: number;
  subjectName: string;
  hourlyRate: number;
}

export type TutorSubject = {
    tutorSubjectId: number;
    subjectName: string;
    tutorId: number;
    subjectId: number;
    verification: "APPROVED" | "PENDING" | "REJECTED"; // adjust based on your allowed values
    verificationDocs: string | null;
    hourlyRate: number;
};


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
  subjects?: number[]; // now numeric subject IDs
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
  id: number;
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
    id: 1,
    name: 'Regular Class',
    description: 'Weekly classes with flexible scheduling',
    durationWeeks: 4,
    priceMultiplier: 0.95,
  },
  {
    id: 2,
    name: 'Monthly Class',
    description: 'Committed monthly package with best rates',
    durationWeeks: 12,
    priceMultiplier: 0.85,
  },
];


export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Conversion rate from LKR
}

export const CURRENCIES: Currency[] = [
  {
    code: 'LKR',
    symbol: 'Rs.',
    name: 'Sri Lankan Rupee',
    rate: 1.0,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    rate: 0.0031,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 0.0028,
  },
  {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    rate: 0.0024,
  },
  {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    rate: 0.26,
  },
  {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    rate: 0.0047,
  },
  {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    rate: 0.0042,
  },
  {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    rate: 0.46,
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    rate: 0.022,
  },
  {
    code: 'SGD',
    symbol: 'S$',
    name: 'Singapore Dollar',
    rate: 0.0041,
  },
  {
    code: 'MYR',
    symbol: 'RM',
    name: 'Malaysian Ringgit',
    rate: 0.014,
  },
  {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    rate: 0.11,
  },
  {
    code: 'PKR',
    symbol: '₨',
    name: 'Pakistani Rupee',
    rate: 0.88,
  },
  {
    code: 'BDT',
    symbol: '৳',
    name: 'Bangladeshi Taka',
    rate: 0.37,
  },
  {
    code: 'AED',
    symbol: 'د.إ',
    name: 'UAE Dirham',
    rate: 0.011,
  },
  {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    rate: 0.012,
  },
  {
    code: 'QAR',
    symbol: '﷼',
    name: 'Qatari Riyal',
    rate: 0.011,
  },
  {
    code: 'KWD',
    symbol: 'د.ك',
    name: 'Kuwaiti Dinar',
    rate: 0.00094,
  },
  {
    code: 'CHF',
    symbol: 'Fr.',
    name: 'Swiss Franc',
    rate: 0.0028,
  },
  {
    code: 'SEK',
    symbol: 'kr',
    name: 'Swedish Krona',
    rate: 0.033,
  },
  {
    code: 'NOK',
    symbol: 'kr',
    name: 'Norwegian Krone',
    rate: 0.034,
  },
  {
    code: 'DKK',
    symbol: 'kr',
    name: 'Danish Krone',
    rate: 0.021,
  },
  {
    code: 'NZD',
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    rate: 0.0051,
  },
  {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    rate: 0.056,
  },
];

export interface CurrencyContextType {
  selectedCurrency: Currency;
  setCurrency: (currency: Currency) => void;
  convertPrice: (lkrPrice: number) => number;
  formatPrice: (lkrPrice: number) => string;
}
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


// export interface Subject {
//   subjectId: number;
//   subjectName: string;
// }

export interface InitPayHerePendingReq  {
  orderId: string;
  studentId: number;
  amount: number | string;
  currency: string; // "LKR"
  gateway?: "PAYHERE";
};

export interface InitPayHerePendingRes  {
  orderId?: string;
  order_id?: string; // Backend snake_case format
  paymentId?: string;
  payment_id?: string; // Backend snake_case format
  expiresAt?: string; // ISO
  expires_at?: string; // Backend snake_case format
  status?: string;
};

export interface ValidatePayHereWindowRes  {
  valid: boolean;
  expired: boolean;
  expiresAt: string;
  remainingSeconds: number;
};

export interface SelectedSlotPattern {
  id: string; // Unique identifier for the pattern
  dayOfWeek: number; // 1-7 (Monday-Sunday)
  times: string[]; // Array of time strings e.g., ['08:00', '14:00']
  generatedSlots: RecurringSlot[];
}

export interface RecurringSlot {
  id: string; // Unique identifier combining pattern info
  dateTime: string; // Full ISO datetime
  dayOfWeek: number; // 1-7 (Monday-Sunday)  
  time: string; // e.g., '08:00'
  isAvailable: boolean;
  isLocked?: boolean;
  patternId: string; // Reference to parent pattern
}

export interface MonthlyClassBooking {
  id: string;
  tutorId: string;
  subjectId: string;
  languageId: string;
  patterns: SelectedSlotPattern[];
  weekBreakdown: WeekBreakdown[];
  totalSlots: number;
  totalCost: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface WeekBreakdown {
  weekStartDate: string;
  slots: RecurringSlot[];
  totalSlots: number;
}

export interface BookMonthlyClassReq {
  tutorId: string;
  subjectId: string;
  languageId: string;
  patterns: SelectedSlotPattern[];
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

export interface BookMonthlyClassRes {
  success: boolean;
  bookingId?: string;
  failedSlots?: {
    dayOfWeek: number;
    time: string;
    reason: string;
  }[];
}
export interface SubjectRequestBody {
  educationLevel: string;
  stream: string | null;
}

export interface SubjectDto {
  subjectId: number;
  subjectName: string;
}
export type ClassTypeForFiltering = 'ONE_TIME' | 'MONTHLY';

export interface TimeSlot {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface FindTutorFilters {
  educationLevel: string | null;
  stream: string | null;
  subjects: number[];            // numeric subjectIds
  classType: ClassTypeForFiltering;
  // For ONE_TIME
  oneTimeDate?: Date | null;
  timePeriods: Record<number, TimeSlot[] | TimeSlot>; // 0 for one-time OR weekday -> slots[]
  // For MONTHLY
  selectedWeekdays: number[]; // 0=Sunday .. 6=Saturday
  // Other filters
  rating?: number | null;
  experience?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  sortField?: 'PRICE' | 'RATING' | 'EXPERIENCE';
  sortDirection?: 'ASC' | 'DESC';
}

export interface TutorSearchPayload {
  educationLevel: string | null;
  stream: string | null;
  subjects: number[];           // subject IDs
  classType: ClassTypeForFiltering;
  rating: number | null;
  experience: number | null;
  price: { min: number | null; max: number | null };
  sort: { field: string; direction: 'ASC' | 'DESC' };
  session?: {
    date: string | null;        // YYYY-MM-DD
    startTime: string | null;   // HH:MM (24h)
    endTime: string | null;
  };
  recurring?: {
    days: {
      weekday: number;          // 0-6
      slots: { startTime: string; endTime: string }[];
    }[];
  };
}

// ...existing imports...
// Add / adjust below (avoid duplicate declarations)

export interface TimeSlot {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}



export interface ExtendedFilterOptionss extends DateTimeFilters {
  educationLevel: string | null;
  stream: string | null;
  subjects: number[];
  minRating: number;
  maxPrice: number;
  minExperience: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentMonth?: Date | null;
}

export interface TimeSlotEdit {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface DateTimeFilters {
  classType: 'one-time' | 'monthly-recurring' | null;
  selectedDate: Date | null;
  selectedWeekdays: number[];
  timePeriods: { [weekday: number]: { startTime: string; endTime: string } };
  tempTimeSelection?: { [weekday: number]: Partial<TimeSlotEdit> };
  addingNewSlot: boolean;
}

export interface DateTimeSelectorProps {
  filters: DateTimeFilters;
  onFilterChange: (key: string, value: any) => void;
}
export interface NormalizedTutor {
  id: number;
  name: string;
  bio: string;
  rating: number;
  experienceMonths: number;
  subjects: Array<{ name: string; hourlyRate: number }>;
  hourlyRate: number;
  languages: string[];
}





export interface SessionPayload {
  date: string | null;       // "YYYY-MM-DD"
  startTime: string | null;  // "HH:MM"
  endTime: string | null;    // "HH:MM"
}

export interface RecurringPayload {
  days: {
    weekday: number;
    dates: string[];
    slots: { startTime: string; endTime: string }[];
  }[];
}

export interface TutorCardProps {
  tutor: NormalizedTutor;
  onViewProfile: (tutor: NormalizedTutor) => void;
  onBookClass: (tutor: NormalizedTutor) => void;
}
export interface WeekdayTimeRange {
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}


export interface ExtendedFilterOptions {
  educationLevel: string | null;
  stream: string | null;
  subjects: number[];
  classType: 'one-time' | 'monthly-recurring' | null;
  selectedDate: Date | null;
  selectedWeekdays: number[];
  // One slot per weekday (strings already formatted)
  timePeriods: { [weekday: number]: WeekdayTimeRange };
  // Temp builder still keeps granular hour/min while editing
  tempTimeSelection?: { [weekday: number]: { startHour?: number; startMinute?: number; endHour?: number; endMinute?: number } };
  addingNewSlot: boolean;
  minRating: number;
  maxPrice: number;
  minExperience: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  currentMonth?: Date | null;
}


export const EDUCATION_LEVELS = [
  { value: "primary_grade_1_5", label: "Primary/Grade 1-5" },
  { value: "secondary_grade_6_11", label: "Secondary/Grade 6-11" },
  { value: "highschool_advanced_level", label: "Highschool/Advanced Level" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "doctorate", label: "Doctorate" },
]

export const STREAMS = [
  { value: "mathematics", label: "Mathematics Stream" },
  { value: "biology", label: "Biology Stream" },
  { value: "commerce", label: "Commerce Stream" },
  { value: "arts", label: "Arts Stream" },
  { value: "technology", label: "Technology Stream" },
]

export const CURRENCYDETAIL = [
  { value: "LKR", label: "LKR", symbol: "Rs." },
  { value: "INR", label: "INR", symbol: "₹" },
]

export type StudentProfile = {
  id: string
  firstName: string
  lastName: string
  username: string
  profilePicture: string
  educationLevel: string
  stream: string
  totalClassesAttended: number
  totalSessionsAttended: number
}

export type Payment = {
  id: string
  amount: number
  currency: string
  date: string
  time: string
  tutorName: string
  type: "booking" | "recurring"
  classTime?: string
  bookingTime?: string
}

export type RecordedVideo = {
  id: string
  title: string
  url: string
  date: string
  time: string
  comment?: string
  isAbsenceRecording: boolean
}

export type ClassMaterial = {
  id: string
  name: string
  type: "image" | "pdf" | "video"
  url: string
  uploadedAt: string
}

export type ClassDetails = {
  id: string
  tutorName: string
  tutorAvatar: string
  className: string
  classTime: string
  status: "ongoing" | "completed"
  rating?: number
  review?: string
  type: "recurring" | "one-time"
  nextPaymentDue?: string
  materials: ClassMaterial[]
  recordedVideos: RecordedVideo[]
}

export type BookingDetails = {
  id: string
  tutorName: string
  tutorAvatar: string
  className: string
  type: "one-time" | "monthly"
  scheduledDate: string
  classTime: string
  amount: number
  currency: string
  paymentStatus: "paid" | "pending"
  slots?: number
}
