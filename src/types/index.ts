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


export interface Subject {
  subjectId: number;
  subjectName: string;
}

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
