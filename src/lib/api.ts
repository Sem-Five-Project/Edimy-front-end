import axios from 'axios';
import { LoginCredentials, RegisterData, User, Tutor, TimeSlot, Booking, FilterOptions, ApiResponse, PageableResponse } from '@/types';

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
  baseURL: "http://localhost:8083/api", // same as your api baseURL
});
export const setAuthToken = (token: string | null) => {
  if (token) {
    console.log("token:", token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};
api.interceptors.request.use((config) => {
  console.log("Outgoing request headers:", config.headers);
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
    console.log('Refreshed access token11111:', response);
    return response.data;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
};



export const authAPI = {
  // Check username availability with debouncing
  checkUsernamee: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    console.log("Checking username availability for:", username);
    try {
      const response = await api.get(`/auth/check-username/${username}`);
      return response.data;
    } catch (error) {
      console.error('Username check failed:', error);
      // Mock response for frontend testing
      return {
        success: true,
        data: { available: Math.random() > 0.3 }, // 70% chance available
      };
    }
  },
 checkUsername: async (username: string): Promise<ApiResponse<{ available: boolean }>> => {
    console.log("Checking username availability for:", username);
    try {
      // Send username as a query param
      const response = await api.get(`/auth/check-username`, {
        params: { username }, // This will construct ?username=john123
      });
      console.log("response of cjeck user name :",response)
      return response.data;
    } catch (error) {
      console.error('Username check failed:', error);
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

  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.post('/auth/login', credentials);
            console.log("login response main :",response.data)

      return {
        success: true,
        data: response.data,
      };
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
  
  getCurrentUser: async (token?: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    // If a token is passed explicitly, use it for this request
    const response = await api.get('/auth/me', token ? {
      headers: { Authorization: `Bearer ${token}` }
    } : {});

      console.log("getCurrentUser response main :",response.data)
    return { success: true, data: { user: response.data.data.user } };
  } catch (error) {
    console.error('Get current user failed:', error);
    return { 
      success: false, 
      data: { user: {} as User },
      error: 'Not authenticated' 
    };
  }
},

// getCurrentUser1: async (): Promise<ApiResponse<{ user: User }>> => {
//   try {
//     // const response = await api.get('/auth/me'); // no headers override
//     const response = await api.get('/auth/me', {
//   headers: { Authorization: `Bearer ${newToken}` }
// });

//     console.log('Get current user response5555555555555555555555555555555555555555555555555555555555555555555555:', response);
//     return { success: true, data: { user: response.data } };
//   } catch (error) {
//     console.error('Get current user failed:', error);
//     return { 
//       success: false, 
//       data: { user: {} as User },
//       error: 'Not authenticated' 
//     };
//   }
// },

  getCurrentUserr: async (token: string): Promise<ApiResponse<{ user: User }>> => {
    try {
      const response = await api.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Get current user response:', response);
      return { success: true, data: response.data.data  };
    } catch (error) {
      console.error('Get current user failed:', error);
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
  searchTutors: async (
  filters: FilterOptions,
  page: number = 1,
  limit: number = 12
): Promise<ApiResponse<PageableResponse<Tutor>>> => {
  try {
    const params: any = { page, limit, ...filters };
    console.log("params of search tutors:", params);
    const response = await api.get('/tutors/search');
    console.log("response of search tutors:", response);
    return {
      success: true,
      data: response.data
    };
  } catch (error: any) {
    console.error('Error fetching tutors:', error);
    return {
      success: false,
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: limit,
        number: page,
        first: true,
        last: true,
        empty: true,
        numberOfElements: 0
      }
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

  getTutorSlots: async (tutorId: string, date?: string): Promise<ApiResponse<TimeSlot[]>> => {
    try {
      // Use the real backend endpoint
      const response = await api.get(`/student/bookings/slots`, {
        params: {
          tutorId: tutorId,
          date: date || new Date().toISOString().split('T')[0]
        }
      });
      console.log('Get tutor slots response:', response);
      
      // Transform the response to ensure compatibility
      const slots = response.data.map((slot: any) => ({
        ...slot,
        // Add compatibility fields for existing UI code
        id: slot.slotId.toString(),
        price: slot.hourlyRate || 50, // Fallback to 50 if no hourly rate
      }));
      
      return {
        success: true,
        data: slots,
      };
    } catch (error) {
      console.error('Get tutor slots failed:', error);
      // Mock slots data with new structure
      const mockSlots: TimeSlot[] = Array.from({ length: 4 }, (_, i) => ({
        slotId: i + 1,
        availabilityId: i + 1,
        tutorId: parseInt(tutorId),
        tutorName: 'Mock Tutor',
        slotDate: date || new Date().toISOString().split('T')[0],
        dayOfWeek: 'MONDAY',
        startTime: `${9 + i * 2}:00:00`,
        endTime: `${11 + i * 2}:00:00`,
        status: Math.random() > 0.7 ? 'BOOKED' : 'AVAILABLE',
        hourlyRate: 50 + Math.floor(Math.random() * 50),
        tutorBio: null,
        tutorExperience: 0,
        isRecurring: true,
        subjectName: null,
        rating: 0.0,
        // Compatibility fields
        id: `slot-${tutorId}-${i}`,
        price: 50 + Math.floor(Math.random() * 50),
      }));
      
      return {
        success: true,
        data: mockSlots,
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
            status: 'BOOKED',
            hourlyRate: 60,
            tutorBio: null,
            tutorExperience: 5,
            isRecurring: true,
            subjectName: 'Mathematics',
            rating: 4.8,
            // Compatibility fields
            id: 'slot-1',
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

export default api;
