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
} from '@/lib/api';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [academicLoading, setAcademicLoading] = useState(false);

  const updateTokenFromInterceptor = (newToken: string) => {
    setToken(newToken);
  };

  useEffect(() => {
    setTokenRefreshCallback(updateTokenFromInterceptor);
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const newToken = await refreshAccessToken();
      setToken(newToken.accessToken);
      setAuthToken(newToken.accessToken);
      setAuthToken(newToken.accessToken); // attach to axios
      //setUser(newUser);

      // Test the token first

      const response = await authAPI.getCurrentUser();
      if (response?.data?.user) {
        setUser(response.data.user);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken);
  };

  const loginWithResponse = (response: { accessToken: string; tokenType: string; user: User }) => {
    setToken(response.accessToken);
    setUser(response.user);
    setAuthToken(response.accessToken);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore
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
      const res = await studentAPI.loadStudentAcademicInfo(user.id);
      if (res?.success && res.data) {
        const educationLevel = res.data.educationLevel ?? null;
        const stream = res.data.stream ?? null;
        updateUser({ educationLevel, stream });
      } else {
        console.warn('Academic info fetch returned unexpected shape:', res);
      }
    } catch (e) {
      console.warn('Academic info load failed:', e);
    } finally {
      setAcademicLoading(false);
    }
  }, [user, academicLoading, updateUser]);
  const accessToken = token;
  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!token,
    isLoading,
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
