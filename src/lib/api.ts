import axios from 'axios';
import { LoginCredentials, RegisterData, User, Tutor, TimeSlot, Booking, FilterOptions, ApiResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookie-based authentication
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
// Handle response errors - updated for cookie auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401 - server will clear invalid cookies
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
export const refreshAccessToken = async () => {
  try {
    const response = await api.post('/auth/refresh'); 
    console.log('Refreshed access token:', response);
    return response.data;
  } catch (error) {
    console.error('Failed to refresh access token:', error);
    throw error;
  }
};

export const refreshAccessTokenn = async () => {
  try {
      const response = await axios.post('http://localhost:8083/api/auth/refresh');
      // Include any necessary data for refreshing the token
    
        console.log('Refreshed access token:', response);

    return response.data; // Assuming the response contains the new token
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
searchTutors: async (
  filters: FilterOptions,
  page: number = 1,
  limit: number = 12
): Promise<ApiResponse<{ tutors: Tutor[]; total: number; totalPages: number }>> => {

  // Always generate mock tutors
  const mockTutors: Tutor[] = Array.from({ length: limit }, (_, i) => ({
    id: `tutor-${page}-${i}`,
    firstName: `Tutor`,
    lastName: `${page}-${i + 1}`,
    username: `tutor${page}${i}`,
    email: `tutor${page}${i}@example.com`,
    role: 'TUTOR',
    isVerified: true,
    createdAt: new Date().toISOString(),
    subjects: ['Mathematics', 'Physics', 'Chemistry'].slice(0, Math.floor(Math.random() * 3) + 1),
    experience: Math.floor(Math.random() * 10) + 1,
    rating: 4 + Math.random(),
    classCompletionRate: 85 + Math.random() * 15,
    bio: 'Experienced tutor with excellent teaching skills.',
    hourlyRate: 25 + Math.floor(Math.random() * 75),
    totalClasses: Math.floor(Math.random() * 1000) + 100,
    completedClasses: Math.floor(Math.random() * 800) + 80,
  }));

  return {
    success: true,
    data: {
      tutors: mockTutors,
      total: 150,
      totalPages: Math.ceil(150 / limit),
    },
  };
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
      const params = date ? `?date=${date}` : '';
      const response = await api.get(`/tutors/${tutorId}/slots${params}`);
      return response.data;
    } catch (error) {
      console.error('Get tutor slots failed:', error);
      // Mock slots data
      const mockSlots: TimeSlot[] = Array.from({ length: 8 }, (_, i) => ({
        id: `slot-${tutorId}-${i}`,
        tutorId,
        date: new Date().toISOString().split('T')[0],
        startTime: `${9 + i * 2}:00`,
        endTime: `${11 + i * 2}:00`,
        status: Math.random() > 0.7 ? 'booked' : 'available',
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
            subjects: ['Mathematics'],
            experience: 5,
            rating: 4.8,
            classCompletionRate: 95,
            bio: 'Mathematics expert',
            hourlyRate: 60,
            totalClasses: 500,
            completedClasses: 475,
          },
          slot: {
            id: 'slot-1',
            tutorId: 'tutor-1',
            date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            startTime: '14:00',
            endTime: '16:00',
            status: 'booked',
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
