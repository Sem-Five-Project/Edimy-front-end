import axios from 'axios';
import { LoginCredentials, RegisterData, User, Tutor, TimeSlot, Booking, FilterOptions, ApiResponse,Class,ClassDoc,TutorAvailability,PageableResponse, Subject, TutorSubject } from '@/types';

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

  // Generate PayHere hash for payment
  generatePayHereHash: async (orderId: string, amount: number, currency: string = "LKR"): Promise<ApiResponse<{ hash: string; merchantId?: string }>> => {
    try {
      const response = await api.post('/payment/hash', {
        orderId,
        amount,
        currency
      });
      console.log('Generate PayHere hash response:', response);
      
      // The response.data might already be the expected format or need transformation
      if (response.data && response.data.data) {
        // If backend returns { success: true, data: { hash: "..." } }
        return {
          success: true,
          data: response.data.data
        };
      } else if (response.data && response.data.hash) {
        // If backend returns { hash: "..." } directly
        return {
          success: true,
          data: response.data
        };
      } else {
        // Fallback - create mock response for testing
        return {
          success: true,
          data: {
            hash: `mock_hash_${Date.now()}`,
            merchantId: "1228616"
          }
        };
      }
    } catch (error) {
      console.error('Generate PayHere hash failed:', error);
      // For testing purposes, return a mock hash when API fails
      return {
        success: true,
        data: {
          hash: `mock_hash_${Date.now()}`,
          merchantId: "1228616"
        }
      };
    }
  },

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
  reserveSlot: async (
    slotId: number
  ): Promise<ApiResponse<{ reservationId: string; expiresAt: string }>> => {
    try {
      // explicitly send JSON body { "slotId": <value> }
      const response = await api.post('/bookings/reserve', {
        slotId: slotId,
      });
  console.log('Reserve slot response:', response);
      return response.data;
    } catch (error) {
      console.error('Reserve slot failed:', error);
      return {
        success: false,
        data: { reservationId: '', expiresAt: '' },
        error: 'Failed to reserve slot',
      } as ApiResponse<{ reservationId: string; expiresAt: string }>;
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

  // Confirm PayHere payment and finalize booking, updating all related tables
  confirmPayHerePayment: async (payload: {
    orderId: string;
    slotId: number;
    tutorId: number;
    amount: number;
    currency: string;
    paymentStatus: 'COMPLETED' | 'FAILED' | 'CANCELLED';
    paymentMethod: 'PAYHERE';
    paymentTime: string; // ISO string
    reservationId?: string;
    studentId?: number;
    classId?: number;
  }): Promise<ApiResponse<{ success: boolean; paymentId?: number; bookingId?: number }>> => {
    try {
      const response = await api.post('/payments/payhere/confirm', payload);
      return response.data;
    } catch (error) {
      console.error('Confirm PayHere payment failed:', error);
      return {
        success: false,
        data: { success: false },
        error: 'Failed to confirm payment',
      } as unknown as ApiResponse<{ success: boolean }>;
    }
  },
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