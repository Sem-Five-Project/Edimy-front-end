'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { User } from '@/types';
import {
  refreshAccessToken,
  authAPI,
  setAuthToken,
  setTokenRefreshCallback,
  studentAPI,
    checkApiHealth
} from '@/lib/api';


interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** True if role === 'STUDENT' */
  isStudent: boolean;
  /** True if role === 'TUTOR' */
  isTutor: boolean;
  /** The role specific primary numeric id: studentId for STUDENT, tutorId for TUTOR (tutorId kept as any in User but surfaced numeric if convertible) */
  actorId: number | null;
  /** Student numeric id (only for students) */
  effectiveStudentId: number | null;
  login: (accessToken: string, user: User) => void;
  loginWithResponse: (response: { accessToken: string; tokenType: string; user: User }) => void;
  logout: () => void;
  updateUser: (userPartial: Partial<User>) => void;
  loadStudentAcademicInfo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [authCheckAttempted, setAuthCheckAttempted] = useState(false);

  const [academicLoading, setAcademicLoading] = useState(false);


  const updateTokenFromInterceptor = (newToken: string) => {
    setToken(newToken);
  };


  const setFallbackUser = () => {
    console.log('🔄 Setting fallback user for development');
    const fallbackUser: User = {
      id: 'fallback-user',
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      email: 'test@example.com',
      role: 'ADMIN', // Change this to test different roles
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    setUser(fallbackUser);
    // Don't set a real token for fallback
    setToken('fallback-token');
  };

  useEffect(() => {
    // Only run auth check once
    if (!authCheckAttempted) {
      setTokenRefreshCallback(updateTokenFromInterceptor);
      checkAuthStatus();
      setAuthCheckAttempted(true);
    }
  }, [authCheckAttempted]);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Starting authentication check...');
      
      // Skip health check for now and use fallback
      console.log('🔍 Skipping API health check for testing...');
      setFallbackUser();
      
    } catch (err) {
      console.error('❌ Auth check failed:', err);
      setFallbackUser();

//   useEffect(() => {
//     setTokenRefreshCallback(updateTokenFromInterceptor);
//     checkAuthStatus();
//   }, []);

//   const toNum = (v: any): number | null => {
//     if (v === null || v === undefined) return null;
//     if (typeof v === 'number' && !Number.isNaN(v)) return v;
//     const n = Number(v);
//     return Number.isNaN(n) ? null : n;
//   };

//   const normalizeUser = (raw: any): User => {
//     const normStudentId = raw.role === 'STUDENT' ? (toNum(raw.studentId) ?? toNum(raw.id)) : toNum(raw.studentId);
//     const normTutorId = raw.role === 'TUTOR' ? (toNum(raw.tutorId) ?? toNum(raw.id)) : toNum(raw.tutorId);
//     return { ...raw, studentId: normStudentId, tutorId: normTutorId };
//   };

//   const checkAuthStatus = async () => {
//     try {
//       const newToken = await refreshAccessToken();
//       setToken(newToken.accessToken);
//       setAuthToken(newToken.accessToken);
//       setAuthToken(newToken.accessToken); // attach to axios
//       //setUser(newUser);

//       // Test the token first

//       const response = await authAPI.getCurrentUser();
//       if (response?.data?.user) setUser(normalizeUser(response.data.user)); 
//     } catch {
//       setUser(null);
//       setToken(null);

    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(normalizeUser(newUser));
    setAuthToken(newToken);
  };


  const loginWithResponse = (response: { accessToken: string; tokenType: string; user: User }) => {
    setToken(response.accessToken);
    setUser(normalizeUser(response.user));
    setAuthToken(response.accessToken);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
       console.error('Logout API call failed:', error);

    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null);
    }
  };

  // Merge update (Partial)
  const updateUser = (userPartial: Partial<User>) => {
    setUser(prev => (prev ? { ...prev, ...userPartial } : prev));
  };

  // Unified academic info loader returning void (context expects Promise<void>)
  const loadStudentAcademicInfo = useCallback(async (): Promise<void> => {
    if (!user || user.role !== 'STUDENT') return;
    if (academicLoading) return; // avoid duplicate concurrent loads

    // If both fields already set (even null), skip
    if (user.educationLevel !== undefined && user.stream !== undefined) return;

    try {
      setAcademicLoading(true);
      if (user.studentId) {
        const res = await studentAPI.loadStudentAcademicInfo(user.studentId);
        if (res?.success && res.data) {
          const educationLevel = res.data.educationLevel;
          const stream = res.data.stream;
          updateUser({ educationLevel, stream });
          console.log('Loaded academic info:', res.data);
        } else {
          console.warn('Academic info fetch returned unexpected shape:', res);
        }
      } else {
        console.warn('Cannot load academic info: studentId is missing or not a string.', user.studentId);
      }
    } catch (e) {
      console.warn('Academic info load failed:', e);
    } finally {
      setAcademicLoading(false);
    }
  }, [user, academicLoading, updateUser]);
  const accessToken = token;
  const isStudent = user?.role === 'STUDENT';
  const isTutor = user?.role === 'TUTOR';
  const actorId: number | null = isStudent
    ? (user?.studentId ?? null)
    : isTutor
      ? (toNum(user?.tutorId) ?? null)
      : null;
  const effectiveStudentId: number | null = isStudent ? (user?.studentId ?? null) : null;

  const value: AuthContextType = {
    user,
    accessToken,

    isAuthenticated: !!user,

    isLoading,
    isStudent,
    isTutor,
    actorId,
    effectiveStudentId,
    login,
    loginWithResponse,
    logout,
    updateUser,
    loadStudentAcademicInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
