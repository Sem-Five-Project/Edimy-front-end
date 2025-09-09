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