import axios from 'axios';
import {InitPayHerePendingReq, InitPayHerePendingRes, ValidatePayHereWindowRes, BookMonthlyClassReq, BookMonthlyClassRes } from '@/types';
interface BookingUpdateData {
  orderId: string;
  tutorId: string;
  studentId: string;
  slotId: string;
  subjectId: string;
  languageId: string;
  classType: 'INDIVIDUAL' | 'MONTHLY' | 'LESSON';
  amount: number;
  startTime: string;
  endTime: string;
  date: Date;
  duration: number;
  paymentDetails: {
    paymentId: string;
    method: string;
    currency: string;
    status: 'SUCCESS' | 'FAILED'|'ROLLBACKED_PENDING_ADMIN'|'PENDING';
  };
}
// Removed explicit .ts extension (not needed / causes TS error without allowImportingTsExtensions)
// import { SubjectRequestBody, TutorSearchPayload } from '@/types';
import { LoginCredentials, RegisterData, User, Tutor, TimeSlot, Booking, FilterOptions, ApiResponse,Class,ClassDoc,TutorAvailability,PageableResponse, Subject, TutorSubject } from '@/types';
import { Timestamp } from 'next/dist/server/lib/cache-handlers/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookie-based authentication
});
const plainAxios = axios.create({
  baseURL: API_BASE_URL, // Use the same base URL as main api
  withCredentials: true, // Enable cookie-based authentication
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
api.interceptors.request.use((config) => {
  return config;
});
// Global variable to track if we're currently refreshing token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

// Callback to update AuthContext when token is refreshed
let onTokenRefreshCallback: ((token: string) => void) | null = null;

export const setTokenRefreshCallback = (callback: (token: string) => void) => {
  onTokenRefreshCallback = callback;
};

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Enhanced response interceptor with token refresh
  // api.interceptors.response.use(
  //   (response) => response,
  //   async (error) => {
  //     const originalRequest = error.config;
      
  //     // Check if it's a 401 error with TOKEN_EXPIRED
  //     if (error.response?.status === 401) {
  //       const errorData = error.response.data;
        
  //       // Check if it's specifically TOKEN_EXPIRED
  //       if (errorData?.error === 'TOKEN_EXPIRED' || errorData?.message?.includes('expired')) {
  //         console.log('Token expired, attempting to refresh...');
          
  //         // Prevent infinite loops
  //         if (originalRequest._retry) {
  //           console.log('Token refresh already attempted, logging out...');
  //           window.location.href = '/login';
  //           return Promise.reject(error);
  //         }
          
  //         if (isRefreshing) {
  //           // If we're already refreshing, queue this request
  //           console.log('Token refresh in progress, queuing request...');
  //           return new Promise((resolve, reject) => {
  //             failedQueue.push({ resolve, reject });
  //           }).then(token => {
  //             originalRequest.headers['Authorization'] = 'Bearer ' + token;
  //             return api(originalRequest);
  //           }).catch(err => {
  //             return Promise.reject(err);
  //           });
  //         }

  //         originalRequest._retry = true;
  //         isRefreshing = true;

  //         try {
  //           console.log('Attempting token refresh...');
  //           const refreshResponse = await refreshAccessToken();
  //           const newAccessToken = refreshResponse.accessToken;
            
  //           console.log('Token refreshed successfully:', newAccessToken);
            
  //           // Update the global auth token for future requests
  //           setAuthToken(newAccessToken);
            
  //           // Update AuthContext state through callback
  //           if (onTokenRefreshCallback) {
  //             onTokenRefreshCallback(newAccessToken);
  //           }
            
  //           // Process the failed queue
  //           processQueue(null, newAccessToken);
            
  //           // Retry the original request with new token
  //           originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            
  //           return api(originalRequest);
  //         } catch (refreshError) {
  //           console.error('Token refresh failed:', refreshError);
            
  //           // Process queue with error
  //           processQueue(refreshError, null);
            
  //           // Clear auth state and redirect to login
  //           setAuthToken(null);
  //           window.location.href = '/login';
            
  //           return Promise.reject(refreshError);
  //         } finally {
  //           isRefreshing = false;
  //         }
  //       } else {
  //         // For other 401 errors (invalid credentials, etc.), redirect to login
  //         console.log('Non-token related 401 error, redirecting to login...');
  //         window.location.href = '/login';
  //       }
  //     }
      
  //     return Promise.reject(error);
  //   }
  // );
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // Check if it's a 401 error with TOKEN_EXPIRED
      if (error.response?.status === 401) {
        const errorData = error.response.data;
        
        // Check if it's specifically TOKEN_EXPIRED
        if (errorData?.error === 'TOKEN_EXPIRED' || errorData?.message?.includes('expired')) {
          console.log('Token expired, attempting to refresh...');
          
          // Prevent infinite loops
          if (originalRequest._retry) {
            console.log('Token refresh already attempted, logging out...');
            window.location.href = '/login';
            return Promise.reject(error);
          }
          
          if (isRefreshing) {
            // If we're already refreshing, queue this request
            console.log('Token refresh in progress, queuing request...');
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            console.log('Attempting token refresh...');
            const refreshResponse = await refreshAccessToken();
            const newAccessToken = refreshResponse.accessToken;
            
            console.log('Token refreshed successfully:', newAccessToken);
            
            // Update the global auth token for future requests
            setAuthToken(newAccessToken);
            
            // Update AuthContext state through callback
            if (onTokenRefreshCallback) {
              onTokenRefreshCallback(newAccessToken);
            }
            
            // Process the failed queue
            processQueue(null, newAccessToken);
            
            // Retry the original request with new token
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            
            return api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            
            // Process queue with error
            processQueue(refreshError, null);
            
            // Clear auth state and redirect to login
            setAuthToken(null);
            window.location.href = '/login';
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        } else {
          // For other 401 errors (invalid credentials, etc.), redirect to login
          console.log('Non-token related 401 error, redirecting to login...');
          window.location.href = '/login';
        }
      }
      
      return Promise.reject(error);
    }
  );
  export const refreshAccessToken = async () => {
    try {
      const response = await plainAxios.post('/auth/refresh'); 
      console.log('Refreshed access token111111111', response.data.accessToken);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



export const authAPI = {
  // Check username availability with debouncing
  checkUsernamee: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    try {
      const response = await api.get(`/auth/check-username/${username}`);
      return response.data;
    } catch (error) {
      // Mock response for frontend testing
      return {
        success: true,
        data: { available: Math.random() > 0.3 }, // 70% chance available
      };
    }
  },
 checkUsername: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    try {
      // Send username as a query param
      const response = await api.get(`/auth/check-username`, {
        params: { username }, // This will construct ?username=john123
      });
      return response.data;
    } catch (error) {
      // Mock response for frontend testing
      return {
        success: true,
        data: { available: Math.random() > 0.3 }, // 70% chance available
      };
    }
  },
  register: async (data: RegisterData): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      // Mock response for frontend testing
      return {
        success: true,
        data: {
          user: {
            id: 'mock-user-id',
            firstName: data.fullName.split(' ')[0],
            lastName: data.fullName.split(' ').slice(1).join(' ') || '',
            username: data.username,
            email: data.email,
            role: data.userType,
            isVerified: false,
            createdAt: new Date().toISOString(),
          },
        },
      };
    }
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<{
    [x: string]: any; user: User 
}>> => {
    try {
      console.log("login credentials main :",credentials)
      const response = await api.post('/auth/login', credentials);
        console.log("login response main :",response.data)
      // Normalize user shape to ensure studentId/tutorId present when role-specific id provided separately
      const raw = response.data?.user || response.data?.data?.user || response.data.user; // flexible shapes
      if (raw) {
        const normalizedUser: User = {
          ...raw,
          studentId: raw.studentId ?? (raw.role === 'STUDENT' ? raw.studentId ?? raw.id ?? null : raw.studentId ?? null),
          tutorId: raw.tutorId ?? (raw.role === 'TUTOR' ? raw.tutorId ?? raw.id ?? null : raw.tutorId ?? null),
        };
        // Rebuild response keeping any tokens
        const rebuilt = { ...response.data, user: normalizedUser };
        return { success: true, data: rebuilt };
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Login failed:', error);
      // Mock response for frontend testing
      if (credentials.usernameOrEmail === 'test@example.com' && credentials.password === 'password') {
        return {
          success: true,
          data: {
            user: {
              id: 'mock-user-id',
              firstName: 'Test',
              lastName: 'User',
              username: 'testuser',
              email: 'test@example.com',
              role: 'STUDENT',
              isVerified: true,
              createdAt: new Date().toISOString(),
            },
          },
        };
      }
      return {
        success: false,
        data: {} as { user: User },
        error: 'Invalid credentials',
      };
    }
  },

  verifyEmail: async (token: string): Promise<ApiResponse<{ verified: boolean }>> => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      console.error('Email verification failed:', error);
      // Mock auto-verification after 5 seconds
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            data: { verified: true },
          });
        }, 5000);
      });
    }
  },

  resendVerification: async (email: string): Promise<ApiResponse<{ sent: boolean }>> => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return response.data;
    } catch (error) {
      console.error('Resend verification failed:', error);
      return {
        success: true,
        data: { sent: true },
      };
    }
  },
  
getCurrentUser: async (): Promise<ApiResponse<{ user: User }>> => {
 try {
    const response = await api.get('/auth/me');
    return { success: true, data: { user: response.data.data.user } };
  } catch (error) {
    return { 
      success: false, 
      data: { user: {} as User },
      error: 'Not authenticated' 
    };
  }
},




  logout: async (): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      console.error('Logout failed:', error);
      return {
        success: true,
        data: { success: true },
      };
    }
  },
  
  // Upload tutor resume
  uploadTutorResume: async (formData: FormData): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post('/tutors/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Resume upload failed:', error);
      return {
        success: false,
        data: { message: 'Failed to upload resume' },
        error: 'Upload failed',
      };
    }
  },
};

export const filterAPI = {
  getAllSubjects: async (
    body: { educationLevel?: string | null; stream?: string | null },
    signal?: AbortSignal
  ): Promise<ApiResponse<Subject[]>> => {
    try {
      console.log('getAllSubjects body in api:', body);

      // Axios POST request
      const response = await api.post('/filters/subjects', body, {
        signal, // Axios supports AbortSignal in recent versions
      });
      console.log('getAllSubjects response in api:', response);

      // Check HTTP status
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Failed to fetch subjects (${response.status})`);
      }

      // Extract data from Axios response
      const data = response.data; // response.data is the full Axios response, data.data is actual array
      console.log('subjects data in api:', data);
      //if (!Array.isArray(data)) return { success: true, data: [] } as ApiResponse<Subject[]>;

      // const subjects: Subject[] = data
      //   .filter(
      //     (s: any) => s && typeof s.subjectId === 'number' && typeof s.subjectName === 'string'
      //   )
      //   .map((s: any) => ({
      //     subjectId: s.subjectId,
      //     subjectName: s.subjectName,
      //     //hourlyRate: typeof s.hourlyRate === 'number' ? s.hourlyRate : 0,
      //   }));

      console.log('subjects in api:', data);

      return { success: true, data: data } as ApiResponse<Subject[]>;
    } catch (error: any) {
      return { success: false, data: [], error: error.message || 'Unknown error' } as ApiResponse<Subject[]>;
    }
  },

 searchTutors: async (
  // Accept a loose shape so caller can send already-built backend payload
  filters: any,
  page: number = 1,
  limit: number = 12
): Promise<ApiResponse<PageableResponse<Tutor>>> => {
  try {
    console.log("call search tutors api")
    // If caller passed a minimal FilterOptions-style object, transform it to backend shape
    // Detect backend shape by presence of 'session' or 'recurring' or 'classType'
    let body: any;
    const looksLikeBackendShape =
      typeof filters === 'object' && (filters?.session !== undefined || filters?.recurring !== undefined || ['ONE_TIME','MONTHLY'].includes(filters?.classType));

    if (looksLikeBackendShape) {
      body = { ...filters };
    } else {
      // Legacy/minimal filters -> adapt
      const {
        search,
        subjects,
        minRating,
        maxPrice,
        experience,
        sortBy,
        sortOrder,
        educationLevel,
        stream,
        classType,
        timePeriods,
        selectedDate,
        selectedWeekdays,
      } = filters || {};

      // Convert plain timePeriods (map weekday -> ["HH:MM-HH:MM"]) into recurring/session shapes if possible
      let session: any = undefined;
      let recurring: any = undefined;
      const normClassType = classType === 'one-time' ? 'ONE_TIME' : (classType === 'monthly-recurring' ? 'MONTHLY' : null);

      if (normClassType === 'ONE_TIME' && selectedDate && timePeriods && timePeriods[0] && Array.isArray(timePeriods[0]) && timePeriods[0][0]) {
        const first = timePeriods[0][0]; // expects "HH:MM-HH:MM"
        if (typeof first === 'string' && first.includes('-')) {
          const [startTime, endTime] = first.split('-');
          session = { date: selectedDate, startTime, endTime };
        }
      } else if (normClassType === 'MONTHLY' && selectedWeekdays && Array.isArray(selectedWeekdays)) {
        // Can't reconstruct dates without month ref here; leave recurring undefined to avoid incorrect data
      }

      const sortFieldMap: Record<string,string> = { rating: 'RATING', price: 'PRICE', experience: 'EXPERIENCE', completion_rate: 'COMPLETION_RATE' };
      const sortField = sortFieldMap[sortBy] || 'PRICE';

      body = {
        educationLevel: educationLevel ?? null,
        stream: stream ?? null,
        subjects: Array.isArray(subjects) ? subjects.map((s: any) => typeof s === 'string' ? parseInt(s,10) || s : s) : [],
        classType: normClassType,
        rating: typeof minRating === 'number' && minRating > 0 ? minRating : null,
        experience: typeof experience === 'number' && experience > 0 ? experience : null,
        maxPrice: typeof maxPrice === 'number' ? maxPrice : null,
        sort: { field: sortField, direction: (sortOrder || 'DESC').toString().toUpperCase() === 'ASC' ? 'ASC' : 'DESC' },
        search: search || null,
        session,
        recurring
      };
    }

    // Always attach pagination in body (backend expects POST not query params)
    body = { ...body, page, limit };

    //console.log('Tutor search POST body:', body);
    const response = await api.post('/tutors/filter', body);
    console.log('Tutor search raw response:', response);

    const data = response.data;
    // If backend already wraps as ApiResponse<PageableResponse<Tutor>> just return it
    if (data && data.success !== undefined && data.data && typeof data.data === 'object' && data.data) {
      return data;
    }

    // Otherwise noralize assuming Spring pageable object in root
    const pageable: PageableResponse<Tutor> = {
      content: data || [],
      totalElements: data?.totalElements ?? 0,
      totalPages: data?.totalPages ?? 0,
      size: data?.size ?? limit,
      number: data?.number ?? (page - 1),
      first: data?.first ?? (page === 1),
      last: data?.last ?? true,
      empty: data?.empty ?? (data?.content?.length ? false : true),
      numberOfElements: data?.numberOfElements ?? (data?.content?.length || 0)
    };

    return { success: true, data: pageable };
  } catch (error: any) {
    console.error('Error fetching tutors (POST /tutors/filter):', error?.response?.data || error?.message || error);
    return {
      success: false,
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: limit,
        number: page - 1,
        first: page === 1,
        last: true,
        empty: true,
        numberOfElements: 0
      }
    };
  }
},

};

export const tutorAPI = {
  // searchTutors: async (filters: FilterOptions, page: number = 1, limit: number = 12): Promise<ApiResponse<{ tutors: Tutor[]; total: number; totalPages: number }>> => {
  //   try {
  //     const paramsObj: Record<string, string> = {
  //       page: page.toString(),
  //       limit: limit.toString(),
  //     };
  //     Object.entries(filters).forEach(([key, value]) => {
  //       if (Array.isArray(value)) {
  //         paramsObj[key] = value.join(',');
  //       } else if (value !== undefined) {
  //         paramsObj[key] = value.toString();
  //       }
  //     });
  //     const params = new URLSearchParams(paramsObj);
  //     const response = await api.get(`/tutors/search?${params}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Search tutors failed:', error);
  //     // Mock data for frontend testing
  //     const mockTutors: Tutor[] = Array.from({ length: limit }, (_, i) => ({
  //       id: `tutor-${page}-${i}`,
  //       firstName: `Tutor`,
  //       lastName: `${page}-${i + 1}`,
  //       username: `tutor${page}${i}`,
  //       email: `tutor${page}${i}@example.com`,
  //       role: 'TUTOR',
  //       isVerified: true,
  //       createdAt: new Date().toISOString(),
  //       subjects: ['Mathematics', 'Physics', 'Chemistry'].slice(0, Math.floor(Math.random() * 3) + 1),
  //       experience: Math.floor(Math.random() * 10) + 1,
  //       rating: 4 + Math.random(),
  //       classCompletionRate: 85 + Math.random() * 15,
  //       bio: 'Experienced tutor with excellent teaching skills.',
  //       hourlyRate: 25 + Math.floor(Math.random() * 75),
  //       totalClasses: Math.floor(Math.random() * 1000) + 100,
  //       completedClasses: Math.floor(Math.random() * 800) + 80,
  //     }));
      
  //     return {
  //       success: true,
  //       data: {
  //         tutors: mockTutors,
  //         total: 150,
  //         totalPages: Math.ceil(150 / limit),
  //       },
  //     };
  //   }
  // },
// searchTutors: async (
//   filters: FilterOptions,
//   page: number = 1,
//   limit: number = 12
// ): Promise<ApiResponse<{ tutors: Tutor[]; total: number; totalPages: number }>> => {

//   // Always generate mock tutors
//   const mockTutors: Tutor[] = Array.from({ length: limit }, (_, i) => ({
//     id: `tutor-${page}-${i}`,
//     firstName: `Tutor`,
//     lastName: `${page}-${i + 1}`,
//     username: `tutor${page}${i}`,
//     email: `tutor${page}${i}@example.com`,
//     role: 'TUTOR',
//     isVerified: true,
//     createdAt: new Date().toISOString(),
//     subjects: ['Mathematics', 'Physics', 'Chemistry'].slice(0, Math.floor(Math.random() * 3) + 1),
//     experience: Math.floor(Math.random() * 10) + 1,
//     rating: 4 + Math.random(),
//     classCompletionRate: 85 + Math.random() * 15,
//     bio: 'Experienced tutor with excellent teaching skills.',
//     hourlyRate: 25 + Math.floor(Math.random() * 75),
//     totalClasses: Math.floor(Math.random() * 1000) + 100,
//     completedClasses: Math.floor(Math.random() * 800) + 80,
//   }));

//   return {
//     success: true,
//     data: {
//       tutors: mockTutors,
//       total: 150,
//       totalPages: Math.ceil(150 / limit),
//     },
//   };
// },
getNextMonthSlots: async (
  availabilityIds: number[],
  month: number,
  year: number
): Promise<ApiResponse<any>> => {
  try {
    if (!Array.isArray(availabilityIds) || availabilityIds.length === 0) {
      return { success: false, error: 'No availability ids supplied', data: [] };
    }

    // Deduplicate & build comma list
    const idsParam = Array.from(new Set(availabilityIds)).join(',');
    const params = { availabilityIds: idsParam, year, month };

    const endpoint = '/student/bookings/slots/next-month';
    console.log('Fetching next month slots (GET):', endpoint, 'params:', params);

    const response = await api.get(endpoint, { params });
    console.log("Next month slots api response:", response);

    // Backend sample shape:
    // [
    //   { "get_next_month_slots": [ { week_day,start_time,end_time,availability_id,available_dates:[] }, ... ] }
    // ]
    const raw = response.data;
    return {
      success: true,
      data: raw
    };
  } catch (error: any) {
    console.error('getNextMonthSlots (GET) error:', error);
    return {
      success: false,
      error: error?.response?.data?.message || error.message || 'Failed to fetch next month slots',
      data: []
    };
  }
},
  searchTutorss : async (
    filters: FilterOptions,
    page: number = 1,
    limit: number = 12
  ): Promise<ApiResponse<{ tutors: Tutor[]; total: number; totalPages: number }>> => {
    try {
      const params: any = { page, limit, ...filters }; // spread filters into query params
      //const response = await api.post('/auth/refresh'); 

      const response = await axios.get(`tutors/search`,params);
      console.log("response of search tutors :",response)
      return response.data; // should match ApiResponse<{ tutors: Tutor[]; ... }>
    } catch (error: any) {
      console.error('Error fetching tutors:', error);
      return { success: false, data: { tutors: [], total: 0, totalPages: 0 } };
    }
  },

  getTutorById: async (id: string): Promise<ApiResponse<Tutor>> => {
    try {
      const response = await api.get(`/tutors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get tutor failed:', error);
      return {
        success: false,
        data: {} as Tutor,
        error: 'Tutor not found',
      };
    }
  },
  // getTutorSlots: async (tutorId: string, date?: string, recurring?: boolean | null): Promise<ApiResponse<TimeSlot[]>> => {
  //   console.log('getTutorSlots called with:', { tutorId, date, recurring });
  //   try {
  //     // Use the real backend endpoint
  //     console.log('Fetching slots for tutorId:', tutorId, 'date:', date, 'recurring:', recurring);

  //     // Build params depending on mode
  //     const now = new Date();
  //     const refDate = date ? new Date(date) : now;
  //     const weekdayLong = refDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  //     const monthNum = refDate.getMonth() + 1; // 1-12
  //     const yearNum = refDate.getFullYear();

  //     const params: Record<string, any> = { tutorId };
  //     if (recurring) {
  //       // Monthly search: send recurring, weekday, month, year; do NOT send date
  //       params.recurring = true;
  //       params.weekday = weekdayLong; // e.g., 'MONDAY'
  //       params.month = monthNum; // 1-12
  //       params.year = yearNum; // full year, e.g., 2025
  //     } else {
  //       // Regular search: send date only (plus tutorId)
  //       params.date = date || now.toISOString().split('T')[0];
  //     }
  //     console.log('Get tutor slots params:', params);

  //     const response = await api.get(`/student/bookings/slots`, { params });
  //     console.log('Get tutor slots response:', response);
      
  //     // Transform the response to ensure compatibility
  //     const slots = response.data.map((slot: any) => ({
  //       ...slot,
  //       // Add compatibility fields for existing UI code
  //       id: slot.slotId.toString(),
  //       price: slot.hourlyRate || 50, // Fallback to 50 if no hourly rate
  //     }));
      
  //     return {
  //       success: true,
  //       data: slots,
  //     };
  //   } catch (error) {
  //     console.error('Get tutor slots failed:', error);
  //     // Mock slots data with new structure
  //     const mockSlots: TimeSlot[] = Array.from({ length: 4 }, (_, i) => ({
  //       slotId: i + 1,
  //       availabilityId: i + 1,
  //       tutorId: parseInt(tutorId),
  //       tutorName: 'Mock Tutor',
  //       slotDate: date || new Date().toISOString().split('T')[0],
  //       dayOfWeek: 'MONDAY',
  //       startTime: `${9 + i * 2}:00:00`,
  //       endTime: `${11 + i * 2}:00:00`,
  //       status: Math.random() > 0.7 ? 'BOOKED' : 'AVAILABLE',
  //       hourlyRate: 50 + Math.floor(Math.random() * 50),
  //       tutorBio: null,
  //       tutorExperience: 0,
  //       isRecurring: true,
  //       subjectName: null,
  //       rating: 0.0,
  //       // Compatibility fields
  //       id: `slot-${tutorId}-${i}`,
  //       startHour: 9 + i * 2,
  //       startMinute: 0,
  //       endHour: 11 + i * 2,
  //       endMinute: 0,
  //       price: 50 + Math.floor(Math.random() * 50),
  //     }));
      
  //     return {
  //       success: true,
  //       data: mockSlots,
  //     };
  //   }
  // },
  getTutorSlots: async (
  tutorId: string,
  date?: string,
  recurring?: boolean | null
): Promise<ApiResponse<TimeSlot[]>> => {
  console.log("getTutorSlots called with:", { tutorId, date, recurring });
  try {
    const now = new Date();
    const refDate = date ? new Date(date) : now;

    const weekdayLong = refDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    const monthNum = refDate.getMonth() + 1;
    const yearNum = refDate.getFullYear();

    // Choose endpoint
    const endpoint = recurring
      ? "/student/bookings/slots/recurring"
      : "/student/bookings/slots";

    // Build params
    const params: Record<string, any> = { tutorId };
    if (recurring) {
      params.weekday = weekdayLong;
      params.month = monthNum;
      params.year = yearNum;
    } else {
      params.date = date || now.toISOString().split("T")[0];
    }

    console.log("Fetching slots from:", endpoint, "with params:", params);
    const response = await api.get(endpoint, { params });


console.log("Get tutor slots response:", response.data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Get tutor slots failed:", error);

    // Mock slots fallback
    const mockSlots: TimeSlot[] = Array.from({ length: 4 }, (_, i) => ({
      slotId: i + 1,
      availabilityId: i + 1,
      tutorId: parseInt(tutorId),
      tutorName: "Mock Tutor",
      slotDate: date || new Date().toISOString().split("T")[0],
      dayOfWeek: "MONDAY",
      startTime: `${9 + i * 2}:00:00`,
      endTime: `${11 + i * 2}:00:00`,
      status: Math.random() > 0.7 ? "BOOKED" : "AVAILABLE",
      hourlyRate: 50 + Math.floor(Math.random() * 50),
      tutorBio: null,
      tutorExperience: 0,
      isRecurring: recurring ?? false,
      subjectName: null,
      rating: 0.0,
      id: `slot-${tutorId}-${i}`,
      startHour: 9 + i * 2,
      startMinute: 0,
      endHour: 11 + i * 2,
      endMinute: 0,
      price: 50 + Math.floor(Math.random() * 50),
    }));

    return {
      success: true,
      data: mockSlots,
    };
  }
},

};
export const studentAPI = {
  loadStudentAcademicInfo: async (
    studentId: number
  ): Promise<ApiResponse<{ educationLevel: string | null; stream: string | null }>> => {
    try {
      console.log("studentId in loadStudentAcademicInfo :",studentId)
      const response = await api.get(
        `/student/profile/${studentId}/academic-info`
      );
      console.log("response of loadStudentAcademicInfo :", response);

      return {
        success: true,
        data: response.data, // backend should return { educationLevel, stream }
      };
    } catch (error) {
      console.error("Load student academic info failed:", error);
      // Mock data for frontend testing
      return {
        success: true,
        data: {
          educationLevel: "undergraduate",
          stream: "arts",
        },
      };
    }
  },
    loadStudentProfileInfo: async (
    studentId: number
  ): Promise<ApiResponse<{ educationLevel: string | null; stream: string | null;classCount:number|0 ;sessionCount :number|0 }>> => {
    try {
      
      const response = await api.get(
        `/student/profile/${studentId}/profile-info`
      );
      console.log("response of loadStudentProfileInfo :", response);

      return {
        success: true,
        data: response.data, 
      };
    } catch (error) {
      console.error("Load student profile info failed:", error);
      // Mock data for frontend testing
      return {
        success: true,
        data: {
          educationLevel: null,
          stream: null,
          classCount:0,
          sessionCount:0
        },
      };
    }
  },
   loadStudentProfilePayment: async (
studentId: string, timeFilter: string  ): Promise<ApiResponse<{ amount: number | 0; tutorName: string | null; subject: string | null; status: string | null; paymentTime: Timestamp | null;}>> => {
    try {
     const response = await api.get(
        `/student/profile/${studentId}/profile-payment`
      );
      console.log("response of loadStudentProfilePayment :", response);

      return {
        success: true,
        data: response.data, 
      };
    } catch (error) {
      console.error("Load student profile info failed:", error);
      // Mock data for frontend testing
      return {
        success: true,
        data: {
          amount: 0,
          tutorName: null,
          subject:null,
          status:null,
          paymentTime:null
        },
      };
    }
  },
};


export const bookingAPI = {
  
  createBooking: async (slotId: string): Promise<ApiResponse<{ booking: Booking; paymentUrl: string }>> => {
    try {
      const response = await api.post('/bookings', { slotId });
      return response.data;
    } catch (error) {
      console.error('Create booking failed:', error);
      return {
        success: false,
        data: { booking: {} as Booking, paymentUrl: '' },
        error: 'Failed to create booking',
      };
    }
  },

  // Check if a class with same tutor/language/subject/classType already exists for the student
  checkClassExist: async (params: {
    tutorId: number | string;
    languageId: number | string;
    subjectId: number | string;
    studentId: number | string;
    classType: 'RECURRING' | 'ONE_TIME';
  }): Promise<ApiResponse<{ exists: boolean; class_id?: number; slots?: { weekday: string; start_time: string; end_time: string }[] }>> => {
    try {
      const query = {
        tutorId: params.tutorId,
        languageId: params.languageId,
        subjectId: params.subjectId,
        studentId: params.studentId,
        classType: params.classType,
      };
      console.log('Checking existing class with params:', query);
      const res = await api.get('/student/bookings/check-class-exist', { params: query });
      const data = res?.data || {};
      // Expect response like { exists: true/false, class_id?, slots? }
      if (typeof data.exists === 'boolean') {
        return { success: true, data };
      }
      return { success: true, data: { exists: false } };
    } catch (e: any) {
      console.error('checkClassExist error:', e?.response?.data || e.message);
      return {
        success: false,
        data: { exists: false },
        error: e?.response?.data?.message || e.message || 'Failed to check class existence',
      };
    }
  },

  // Generate PayHere hash for payment
  generatePayHereHash: async (orderId: string, amount: number | string, currency: string = "LKR"): Promise<ApiResponse<{ hash: string; merchantId?: string }>> => {
    try {
      const response = await api.post('/payment/hash', {
        orderId,
        amount,
        currency
      });
      console.log('Generate PayHere hash response:', response);
      
      // Normalize and validate expected payload
      const payload = response?.data?.data ?? response?.data;
      if (payload?.hash) {
        return {
          success: true,
          data: {
            hash: payload.hash,
            merchantId: payload.merchantId,
          },
        };
      }
      return {
        success: false,
        data: { hash: '', merchantId: undefined },
        error: 'Backend did not return a valid hash',
      } as unknown as ApiResponse<{ hash: string; merchantId?: string }>;
    } catch (error) {
      console.error('Generate PayHere hash failed:', error);
      return {
        success: false,
        data: { hash: '', merchantId: undefined },
        error: 'Failed to generate payment hash',
      } as unknown as ApiResponse<{ hash: string; merchantId?: string }>;
    }
  },
    initiatePaymentPending: async (
    payload: InitPayHerePendingReq
  ): Promise<ApiResponse<InitPayHerePendingRes>> => {
    try {
      console.log("API: Sending initiate payment request with payload:", payload);
      const { data } = await api.post("/payment/initiate", payload);
      console.log("API: Initiate payment response:", data);
      return { success: true, data };
    } catch (e: any) {
      console.error("API: Initiate payment failed:", e);
      console.error("API: Error response:", e?.response?.data);
      console.error("API: Error status:", e?.response?.status);
      return {
        success: false,
        data: {} as InitPayHerePendingRes,
        error: e?.response?.data?.message || e?.response?.data?.error || "Failed to initiate payment",
      };
    }
  },
  validatePaymentWindow: async (
    paymentId: string
  ): Promise<ApiResponse<ValidatePayHereWindowRes>> => {
    try {
      console.log("API: Validating payment window for paymentId:", paymentId);
      
      // Try both possible endpoints
      let response;
      try {
        console.log("API: Trying endpoint: `/payments/validate?paymentId=${paymentId}`");
        response = await api.get(`/payments/validate?paymentId=${paymentId}`);
      } catch (firstError: any) {
        if (firstError?.response?.status === 404) {
          console.log("API: First endpoint not found, trying: `/payment/validate?paymentId=${paymentId}`");
          response = await api.get(`/payment/validate?paymentId=${paymentId}`);
        } else {
          throw firstError;
        }
      }
      
      console.log("API: Payment validation response:", response.data);
      return { success: true, data: response.data };
    } catch (e: any) {
      console.error("API: Payment validation error:", e?.response?.data || e.message);
      console.error("API: Full error object:", e);
      
      // If validation fails, let's continue with a warning rather than blocking payment
      if (e?.response?.status === 500) {
        console.warn("API: Server error during validation - allowing payment to proceed with warning");
        return {
          success: true,
          data: {
            valid: true, // Assume valid if server error
            expired: false,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes from now
            remainingSeconds: 15 * 60 // 15 minutes in seconds
          }
        };
      }
      
      return {
        success: false,
        data: {} as ValidatePayHereWindowRes,
        error: e?.response?.data?.message || e?.response?.data?.error || "Failed to validate payment window",
      };
    }
  },

updateBookingDetails: async (data: BookingUpdateData): Promise<{ success: boolean; bookingId: string }> => {
  try {
    // Using axios; body is passed as data, not nested with JSON.stringify
    const response = await api.post('/bookings/confirm', data);
    if (response?.data) {
      return response.data;
    }
    throw new Error('Failed to update booking details');
  } catch (error) {
    console.error('Error updating booking details:', error);
    throw error;
  }
},
validateSlotAvailability: async (slotId: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/slots/${slotId}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to validate slot availability');
    }

    const { isAvailable } = await response.json();
    return isAvailable;
  } catch (error) {
    console.error('Error validating slot:', error);
    throw error;
  }
},
// releaseSlot : async (slotId: string): Promise<void> => {
//   try {
//     const response = await fetch(`/api/slots/${slotId}/release`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       }
//     });

//     if (!response.ok) {
//       throw new Error('Failed to release slot');
//     }
//   } catch (error) {
//     console.error('Error releasing slot:', error);
//     throw error;
//   }
// },
  // Reserve a slot for up to 15 minutes to avoid double booking
  // reserveSlot: async (slotId: number): Promise<ApiResponse<{ reservationId: string; expiresAt: string }>> => {
  //   try {
  //     const response = await api.post('/bookings/reserve', { slotId });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Reserve slot failed:', error);
  //     return {
  //       success: false,
  //       data: { reservationId: '', expiresAt: '' },
  //       error: 'Failed to reserve slot',
  //     } as unknown as ApiResponse<{ reservationId: string; expiresAt: string }>;
  //   }
  // },
// ...existing code...
  reserveSlot: async (
    slotId: number,
    options?: { recurring?: boolean | null; weekday?: number | null }
  ): Promise<ApiResponse<{ reservationId: string; expiresAt: string }>> => {
    try {
      // Backend expects only a list of slot IDs
      const body = { slotIds: [slotId] };
      const response = await api.post('/bookings/reserve', body);
      console.log('Reserve slot response:', response);

      // Normalize to ApiResponse shape
      const payload = response?.data ?? response;
      if (payload && typeof payload === 'object' && 'reservationId' in payload) {
        return {
          success: true,
          data: payload as { reservationId: string; expiresAt: string },
        };
      }
      if (payload && typeof payload === 'object' && 'success' in payload) {
        return payload as ApiResponse<{ reservationId: string; expiresAt: string }>;
      }
      return {
        success: false,
        data: { reservationId: '', expiresAt: '' },
        error: 'Unexpected reserve response format',
      } as ApiResponse<{ reservationId: string; expiresAt: string }>;
    } catch (error) {
      console.error('Reserve slot failed:', error);
      return {
        success: false,
        data: { reservationId: '', expiresAt: '' },
        error: 'Failed to reserve slot',
      } as ApiResponse<{ reservationId: string; expiresAt: string }>;
    }
  },
// ...existing code...
  reserveSlots: async (
    slotIds: number[],
    options?: { recurring?: boolean | null; weekday?: number | null }
  ): Promise<ApiResponse<{ reservationId: string; expiresAt: string; reserved: number[]; failed?: number[] }>> => {
    try {
      // Backend expects only a list of slot IDs
      console.log('Reserving slots with slotIds:', slotIds);
      const body = { slotIds };
      console.log('Reserving slots with body:', body);
      const response = await api.post('/bookings/slots/reserve', body);
      console.log('Reserve slots response:', response);
      return response.data;
    } catch (error) {
      console.error('Reserve slots failed:', error);
      return {
        success: false,
        data: { reservationId: '', expiresAt: '', reserved: [], failed: [] },
        error: 'Failed to reserve slots',
      } as ApiResponse<{ reservationId: string; expiresAt: string; reserved: number[]; failed?: number[] }>;
    }
  },
// ...existing code...
  reserveSlot1: async (
    slotId: number,
    options?: { recurring?: boolean | null; weekday?: number | null }
  ): Promise<ApiResponse<{ reservationId: string; expiresAt: string }>> => {
    try {
      // explicitly send JSON body { "slotId": <value> }
      const body: Record<string, any> = { slotId };
      if (options) {
        if (options.recurring !== undefined && options.recurring !== null) body.recurring = options.recurring;
        if (options.weekday !== undefined && options.weekday !== null) body.weekday = options.weekday;
      }

      const response = await api.post('/bookings/reserve', body);
      console.log('Reserve slot response:', response);
      const payload = response?.data ?? response;
      // Normalize to ApiResponse shape
      if (payload && typeof payload === 'object' && 'reservationId' in payload) {
        return {
          success: true,
          data: payload as { reservationId: string; expiresAt: string },
        };
      }
      // If backend already returns ApiResponse
      if (payload && typeof payload === 'object' && 'success' in payload) {
        return payload as ApiResponse<{ reservationId: string; expiresAt: string }>;
      }
      // Fallback
      return {
        success: false,
        data: { reservationId: '', expiresAt: '' },
        error: 'Unexpected reserve response format',
      } as ApiResponse<{ reservationId: string; expiresAt: string }>;
    } catch (error) {
      console.error('Reserve slot failed:', error);
      return {
        success: false,
        data: { reservationId: '', expiresAt: '' },
        error: 'Failed to reserve slot',
      } as ApiResponse<{ reservationId: string; expiresAt: string }>;
    }
  },

  // Bulk reserve slots to lock multiple selections
  reserveSlots1: async (
    slotIds: number[],
    options?: { recurring?: boolean | null; weekday?: number | null }
  ): Promise<ApiResponse<{ reservationId: string; expiresAt: string; reserved: number[]; failed?: number[] }>> => {
    try {
      
      const body: Record<string, any> = { slotIds };
      console.log('Reserving bulk slots with slotIds:', slotIds, 'and options:', options);
      if (options) {
        if (options.recurring !== undefined && options.recurring !== null) body.recurring = options.recurring;
        if (options.weekday !== undefined && options.weekday !== null) body.weekday = options.weekday;
      }
      console.log('Reserving bulk slots with body:', body);
      const response = await api.post('/bookings/reserve-bulk', body);
      console.log('Reserve bulk slots response:', response);
      return response.data;
    } catch (error) {
      console.error('Reserve bulk slots failed:', error);
      return {
        success: false,
        data: { reservationId: '', expiresAt: '', reserved: [], failed: [] },
        error: 'Failed to reserve slots',
      } as ApiResponse<{ reservationId: string; expiresAt: string; reserved: number[]; failed?: number[] }>;
    }
  },
bookSlot: async (
  slotId: number
): Promise<ApiResponse<{ bookingId: number; status: string }>> => {
  try {
    const response = await api.post('/bookings/book-slot', { slotId });
    const raw = response.data;

    // Normalize possible backend shapes
    // Shape A (wrapped): { success:true, data:{ bookingId, status } }
    if (raw && typeof raw === 'object' && 'success' in raw && raw.data) {
      return raw;
    }

    // Shape B (flat): { bookingId, status, success? }
    if (raw && typeof raw === 'object' && ('bookingId' in raw || 'status' in raw)) {
      return {
        success: raw.success !== false,
        data: {
          bookingId: raw.bookingId ?? 0,
          status: raw.status ?? raw.bookingStatus ?? 'UNKNOWN',
        },
      };
    }

    // Fallback unexpected
    return {
      success: false,
      data: { bookingId: 0, status: 'FAILED' },
      error: 'Unexpected booking response format',
    };
  } catch (error) {
    console.error('Book slot failed:', error);
    return {
      success: false,
      data: { bookingId: 0, status: 'FAILED' },
      error: 'Failed to book slot',
    };
  }
},
  // bookSlot: async (
  //   slotId: number
  // ): Promise<ApiResponse<{ bookingId: number; status: string }>> => {
  //   try {
  //     // explicitly send JSON body { "slotId": <value> }
  //     const response = await api.post('/bookings/book-slot', {
  //       slotId: slotId,
  //     });
  //     console.log('Book slot response:', response);
  //     return response.data;
  //   } catch (error) {
  //     console.error('Book slot failed:', error);
  //     return {
  //       success: false,
  //       data: { bookingId: 0, status: 'FAILED' },
  //       error: 'Failed to book slot',
  //     } as ApiResponse<{ bookingId: number; status: string }>;
  //   }
  // },

  bookMonthlyClass: async (
    payload: BookMonthlyClassReq
  ): Promise<ApiResponse<BookMonthlyClassRes>> => {
    try {
      console.log('Booking monthly class with payload:', payload);
      const response = await api.post('/bookings/book-monthly-class', payload);
      console.log('Book monthly class response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Book monthly class failed:', error);
      
      // Handle specific slot locking errors
      if (error?.response?.data?.failedSlots) {
        return {
          success: false,
          data: {
            success: false,
            failedSlots: error.response.data.failedSlots
          },
          error: 'Some slots are currently unavailable',
        };
      }
      
      return {
        success: false,
        data: { success: false },
        error: error?.response?.data?.message || 'Failed to book monthly class',
      } as ApiResponse<BookMonthlyClassRes>;
    }
  },

  releaseSlot: async (
  slotId: number
): Promise<ApiResponse<{ slotId: number; status: string }>> => {
  try {
    // explicitly send JSON body { "slotId": <value> }
    const response = await api.post('/bookings/release', {
      slotId: slotId,
    });
    console.log('Release slot response:', response);
    return response.data;
  } catch (error) {
    console.error('Release slot failed:', error);
    return {
      success: false,
      data: { slotId: slotId, status: 'FAILED' },
      error: 'Failed to release slot',
    } as ApiResponse<{ slotId: number; status: string }>;
  }
},

  // Release a previously reserved slot (on cancellation, timeout, or failure)
  releaseReservation: async (reservationId: string): Promise<ApiResponse<{ released: boolean }>> => {
    try {
      const response = await api.post('/bookings/release', { reservationId });
      return response.data;
    } catch (error) {
      console.error('Release reservation failed:', error);
      return {
        success: false,
        data: { released: false },
        error: 'Failed to release reservation',
      };
    }
  },

  // Bulk release locked slots
  releaseSlots: async (
    slotIds: number[]
  ): Promise<ApiResponse<{ released: number[]; failed?: number[] }>> => {
    try {
      const response = await api.post('/bookings/release-bulk', { slotIds });
      console.log('Release bulk slots response:', response);
      return response.data;
    } catch (error) {
      console.error('Release bulk slots failed:', error);
      return {
        success: false,
        data: { released: [], failed: slotIds },
        error: 'Failed to release slots',
      } as ApiResponse<{ released: number[]; failed?: number[] }>;
    }
  },

  // Confirm PayHere payment and finalize booking, updating all related tables
confirmPayHerePayment: async (payload: {
  paymentId: string;
  slotId?: number;
  tutorId: number;
  subjectId: number;
  languageId: number;
  classTypeId: number;
}): Promise<ApiResponse<{ success: boolean; paymentId?: number; bookingId?: number }>> => {
  try {
    console.log('Confirming PayHere payment with payload:', payload);
    const response = await api.post('/payment/bookings/confirm', payload);
    const paymentRaw = response.data;
    console.log('Confirm PayHere payment response (raw):', paymentRaw);

    const paymentSuccess =
      paymentRaw?.success === true ||
      response.status === 200;

    if (!paymentSuccess) {
      return {
        success: false,
        data: { success: false },
        error: paymentRaw?.error || 'Payment confirmation failed',
      };
    }

    // If there is no slot to book (edge case)
    if (!payload.slotId) {
      return {
        success: true,
        data: {
          success: true,
          paymentId: paymentRaw.paymentId ?? paymentRaw.data?.paymentId,
        },
      };
    }

    // Proceed to book slot
    console.log('Attempting to book slot after payment:', payload.slotId);
    const bookingResponse = await bookingAPI.bookSlot(payload.slotId);
    console.log('Slot booking response (normalized):', bookingResponse);

    const bookingId =
      bookingResponse?.data?.bookingId ??
      (bookingResponse as any)?.bookingId ??
      0;

    const bookingOk = bookingResponse.success === true && bookingResponse.data?.status === 'BOOKED';

    if (bookingOk) {
      return {
        success: true,
        data: {
          success: true,
          paymentId: paymentRaw.paymentId ?? paymentRaw.data?.paymentId,
          bookingId,
        },
      };
    }

    return {
      success: false,
      data: { success: false },
      error:
        bookingResponse.error ||
        'Payment confirmed but slot booking failed',
    };
  } catch (error) {
    console.error('Confirm PayHere payment failed (exception):', error);
    return {
      success: false,
      data: { success: false },
      error: 'Failed to confirm payment',
    };
  }
},

  // confirmPayHerePayment: async (payload: {
  //   paymentId: string; // Only paymentId received from initiatePaymentPending
  //   slotId?: number; // Optional slotId for booking confirmation
  //   tutorId: number; // Tutor associated with the slot
  //   subjectId: number; // Subject associated with the booking
  //   languageId: number; // Language associated with the booking
  //   classTypeId: number; // Class type (e.g., online, in-person)

  // }): Promise<ApiResponse<{ success: boolean; paymentId?: number; bookingId?: number }>> => {
  //   try {
  //     console.log('Confirming PayHere payment with payload:', payload);
  //     const response = await api.post('/payment/bookings/confirm', payload);
  //     console.log('Confirm PayHere payment response:', response);

  //     // If payment confirmation is successful and slotId is provided, book the slot
  //     if (response.status ==200 && payload.slotId) {
  //       console.log('Payment confirmed successfully, proceeding to book slot:', payload.slotId);
        
  //       try {
  //         const bookingResponse = await bookingAPI.bookSlot(payload.slotId);
  //         console.log('Book slot after payment response:', bookingResponse);
          
  //         if (bookingResponse.success) {
  //           console.log('Slot booked successfully finished!!');
  //           // Return combined response with booking information
  //           return {
  //             success: true,
  //             data: {
  //               success: true,
  //               paymentId: response.data.paymentId,
  //               bookingId: bookingResponse.data.bookingId
  //             }
  //           };
  //         } else {
  //           console.error('Failed to book slot after payment confirmation:', bookingResponse.error);
  //           // Payment confirmed but booking failed - this should be handled carefully
  //           return {
  //             success: false,
  //             data: { success: false },
  //             error: `Payment confirmed but booking failed: ${bookingResponse.error}`,
  //           } as unknown as ApiResponse<{ success: boolean }>;
  //         }
  //       } catch (bookingError) {
  //         console.error('Error booking slot after payment:', bookingError);
  //         return {
  //           success: false,
  //           data: { success: false },
  //           error: 'Payment confirmed but slot booking failed',
  //         } as unknown as ApiResponse<{ success: boolean }>;
  //       }
  //     }

  //     return response.data;
  //   } catch (error) {
  //     console.error('Confirm PayHere payment failed:', error);
  //     return {
  //       success: false,
  //       data: { success: false },
  //       error: 'Failed to confirm payment',
  //     } as unknown as ApiResponse<{ success: boolean }>;
  //   }
  // },
  // Initialize PayHere payment. Backend must generate hash and return full payment payload
  initPayHere: async (payload: {
    bookingId: string;
    returnUrl: string;
    cancelUrl: string;
    // notifyUrl should be configured on backend; can be overridden for testing
    notifyUrl?: string;
  }): Promise<ApiResponse<{ payment: Record<string, unknown> }>> => {
    try {
      const response = await api.post('/payments/payhere/init', payload);
      return response.data;
    } catch (error) {
      console.error('Init PayHere failed:', error);
      return {
        success: false,
        data: { payment: {} },
        error: 'Failed to initialize PayHere',
      } as unknown as ApiResponse<{ payment: Record<string, unknown> }>;
    }
  },

  getUserBookings: async (): Promise<ApiResponse<Booking[]>> => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      console.error('Get user bookings failed:', error);
      // Mock bookings data
      const mockBookings: Booking[] = [
        {
          id: 'booking-1',
          studentId: 'student-1',
          tutorId: 'tutor-1',
          slotId: 'slot-1',
          status: 'confirmed',
          paymentStatus: 'completed',
          createdAt: new Date().toISOString(),
          tutor: {
            id: 'tutor-1',
            firstName: 'Dr. Sarah',
            lastName: 'Johnson',
            username: 'sarahj',
            email: 'sarah@example.com',
            role: 'TUTOR',
            isVerified: true,
            createdAt: new Date().toISOString(),
            subjects: [{ subjectId: 1, subjectName: 'Mathematics', hourlyRate: 60 }],
            languages: [{ languageId: 1, languageName: 'English' }],
            experience: 5,
            rating: 4.8,
            classCompletionRate: 95,
            bio: 'Mathematics expert',
            hourlyRate: 60,
            totalClasses: 500,
            completedClasses: 475,
            tutorProfileId: 1,
          },
          slot: {
            slotId: 1,
            availabilityId: 1,
            tutorId: 1,
            tutorName: 'Dr. Sarah Johnson',
            slotDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            dayOfWeek: 'MONDAY',
            startTime: '14:00:00',
            endTime: '16:00:00',
            // startHour: 14,
            // startMinute: 0,
            // endHour: 16,
            // endMinute: 0,
            status: 'BOOKED',
            hourlyRate: 60,
            tutorBio: null,
            tutorExperience: 5,
            isRecurring: true,
            subjectName: 'Mathematics',
            rating: 4.8,
            // Compatibility fields
            id: 'slot-1',
            startHour: 14,
            startMinute: 0,
            endHour: 16,
            endMinute: 0,
            price: 60,
          },
        },
      ];
      
      return {
        success: true,
        data: mockBookings,
      };
    }
  },

  processPayment: async (bookingId: string, paymentData: Record<string, unknown>): Promise<ApiResponse<{ success: boolean }>> => {
    try {
      const response = await api.post(`/bookings/${bookingId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Process payment failed:', error);
      // Mock payment processing
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: Math.random() > 0.1, // 90% success rate
            data: { success: true },
          });
        }, 2000);
      });
    }
  },
};

export const classAPI = {
  //create a class
  createClass: async (classData: Class): Promise<ApiResponse<Class>> => {
    try {
      const response = await api.post('/classes/create', classData);
      return response.data;
    } catch (error) {
      console.error('Create class failed:', error);
      return {
        success: false,
        data: {} as Class,
        error: 'Failed to create class',
      };
    }
  },
  //get a class by classId
  getClassById: async (classId: number): Promise<ApiResponse<Class>> => {
    try {
      const response = await api.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Get class by ID failed:', error);
      return {
        success: false,
        data: {} as Class,
        error: 'Failed to get class by ID',
      };
    }
  },
  //get class a of a tutor when tutorId is given
  getClassesByTutorId: async (tutorId: number): Promise<Class[]> => {
    try {
      const response = await api.get(`/classes/tutor/${tutorId}`);
      return response.data;
    } catch (error) {
      console.error('Get classes by tutor ID failed:', error);
      return [];
    }
  },
  //delete a class by classId and tutorId
  deleteClass: async (classId: number | undefined, tutorId: number): Promise<any> => {
    try {
      const response = await api.delete(`/classes/delete?classId=${classId}&tutorId=${tutorId}`);
      return response.data;
    } catch (error) {
      console.error('Delete class failed:', error);
      return {
        success: false,
        data: {},
        error: 'Failed to delete class',
      };
    }
  },
};

export const classDocAPI ={
  //add a doc
  addClassDoc: async (classDocData: ClassDoc): Promise<any> => {
    console.log('Adding class doc with data:*************', classDocData);
    try {
      const response = await api.post(`/class-docs/add`, classDocData);
      return response.data;
    } catch (error) {
      console.error('Add class doc failed:', error);
      return {
        success: false,
        data: {},
        error: 'Failed to add class doc',
      };
    }
  },
  //get docs by classId
  getClassDocsByClassId: async (classId: number): Promise<ClassDoc[]> => {
    try {
      const response = await api.get(`/class-docs/class/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Get class docs by class ID failed:', error);
      return [];
    }
  },
  //delete a doc by docId
  deleteClassDoc: async (docId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/class-docs/delete/${docId}`);
      return response.data;
    } catch (error) {
      console.error('Delete class doc failed:', error);
      return {
        success: false,
        data: {},
        error: 'Failed to delete class doc',
      };
    }
  },
}

export const tutorAvailabilityAPI = {
  //create availability
  createAvailability: async (availabilityData: TutorAvailability): Promise<ApiResponse<TutorAvailability>> => {
    try {
      const newSlot = {
      startTime: availabilityData.startTime,
      endTime: availabilityData.endTime,
      dayOfWeek: availabilityData.dayOfWeek,
      recurring: availabilityData.recurring,
      tutorProfile: {
        tutorId: availabilityData.tutorId
      }
    };
      const response = await api.post('/tutor-availability', newSlot);
      return response.data;
    } catch (error) {
      console.error('Create availability failed:', error);
      return {
        success: false,
        data: {} as TutorAvailability,
        error: 'Failed to create availability',
      };
    }
  },
  //delete availability by availabilityId
  deleteAvailability: async (availabilityId: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.delete(`/tutor-availability/delete/${availabilityId}`);
      return response.data;
    } catch (error) {
      console.error('Delete availability failed:', error);
      return {
        success: false,
        data: {},
        error: 'Failed to delete availability',
      };
    }
  },

  //update availability by the id
  updateAvailability: async (availabilityData: TutorAvailability): Promise<ApiResponse<TutorAvailability>> => {
    try {
      const response = await api.put(`/tutor-availability/update/${availabilityData.availabilityId}`, availabilityData);
      return response.data;
    } catch (error) {
      console.error('Update availability failed:', error);
      return {
        success: false,
        data: {} as TutorAvailability,
        error: 'Failed to update availability',
      };
    }
  },
  //get availability of a tutor by tutor id
  getAvailabilityByTutorId: async (tutorId: number): Promise<TutorAvailability[]> => {

    try {
      const response = await api.get(`/tutor-availability/tutor/${tutorId}`);
      return response.data;
    } catch (error) {
      console.error('Get availability by tutor ID failed:', error);
      return [];
    }
  },
}

export const subjectAPI = {
  //get the subjects of a tutor when the tutorid is given
  getSubjectsByTutorId: async (tutorId: number): Promise<TutorSubject[]> => {
    try {
      const response = await api.get(`/tutors/${tutorId}/subjects`);
      return response.data;
    } catch (error) {
      console.error('Get subjects by tutor ID failed:', error);
      return [];
    }
  },

  //add a subject to a tutor
  addSubjectToTutor: async (tutorId: number, subjectId: number, hourlyRate: number): Promise<ApiResponse<any>> => {
    try {
      const response = await api.post(`/tutors/add`, { tutorId,subjectId, hourlyRate });  
      return response.data;
    } catch (error) {
      console.error('Add subject to tutor failed:', error);
      return {
        success: false,
        data: {},
        error: 'Failed to add subject to tutor',
      };
    }
  },
}
export default api;

// FCM Token API functions
export const fcmAPI = {
  // Send FCM token to backend
  sendToken: async (tokenData: {
    token: string;
    userId?: string;
    deviceType: string;
    timestamp?: string;
  }): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.post('/auth/fcmtoken', tokenData.token, {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
      
      // Handle different response structures
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          data: { message: 'FCM token sent successfully' },
        };
      } else {
        return {
          success: false,
          data: { message: 'Failed to send FCM token' },
          error: `HTTP ${response.status}`,
        };
      }
    } catch (error) {
      console.error('FCM token send failed:', error);
      return {
        success: false,
        data: { message: 'Failed to send FCM token' },
        error: 'Network error',
      };
    }
  },

  // Remove FCM token from backend
  removeToken: async (token: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.delete('auth/fcmtoken', {
        data: { token },
      });
      return response.data;
    } catch (error) {
      console.error('FCM token removal failed:', error);
      return {
        success: false,
        data: { message: 'Failed to remove FCM token' },
        error: 'Network error',
      };
    }
  },

  // Update FCM token
  updateToken: async (oldToken: string, newToken: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await api.put('auth/fcmtoken/update', {
        oldToken,
        newToken,
        timestamp: new Date().toISOString(),
      });
      return response.data;
    } catch (error) {
      console.error('FCM token update failed:', error);
      return {
        success: false,
        data: { message: 'Failed to update FCM token' },
        error: 'Network error',
      };
    }
  },
};

// Helper function for backward compatibility
export const sendFCMTokenToBackend = fcmAPI.sendToken;

export const sendFCMTokenAfterLogin = async (userId: string): Promise<void> => {
  console.log("🔥 sendFCMTokenAfterLogin called for user:", userId);
  
  try {
    // Dynamic import to avoid SSR issues
    const { messaging, getToken } = await import('./firebaseMessaging');
    console.log("🔥 Firebase messaging imported, messaging available:", !!messaging);
    
    if (!messaging) {
      console.log("❌ Firebase messaging not available");
      return;
    }

    // Check if permission is granted
    console.log("🔥 Checking notification permission:", Notification.permission);
    if (Notification.permission !== 'granted') {
      console.log("❌ Notification permission not granted, current permission:", Notification.permission);
      return;
    }

    const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "";
    console.log("🔥 Getting FCM token with VAPID key:", VAPID_KEY ? "Available" : "Missing");
    
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log("🔥 FCM token received:", currentToken ? "Available" : "None");
    
    if (currentToken) {
      console.log("🔥 Sending FCM token after login:", currentToken);
      
      const result = await fcmAPI.sendToken({
        token: currentToken,
        userId: userId,
        deviceType: 'web',
      });
      
      console.log("🔥 FCM token send result:", result);
      
      if (result.success) {
        console.log("✅ FCM token successfully sent after login");
      } else {
        console.error("❌ Failed to send FCM token after login. Error:", result.error || 'Unknown error');
        console.error("❌ Response data:", result.data);
      }
    } else {
      console.log("❌ No FCM token available to send");
    }
  } catch (error) {
    console.error("💥 Error sending FCM token after login:", error);
  }
};