// 'use client';
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import { User } from '@/types';
// import { authAPI } from '@/lib/api';

// interface AuthContextType {
//   user: User | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (user: User) => void;
//   logout: () => void;
//   updateUser: (user: User) => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// interface AuthProviderProps {
//   children: ReactNode;
// }

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // useEffect(() => {
//   //   checkAuthStatus();
//   // }, []);

//   const checkAuthStatus = async () => {
//     try {
//       const response = await authAPI.getCurrentUser();
//       if (response.success && response.data) {
//         setUser(response.data.user);
//       } else {
//         setUser(null);
//       }
//     } catch (error) {
//       console.error('Auth check failed:', error);
//       setUser(null);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const login = (user: User) => {
//     // TESTING: Skip actual login validation - use mock user for direct dashboard access
//     const mockUser: User = {
//       id: 'test-user-123',
//       fullName: 'Test User',
//       username: 'testuser',
//       email: 'test@example.com',
//       userType: 'student',
//       isVerified: true,
//       createdAt: new Date().toISOString(),
//       profileImage: undefined
//     };
//     setUser(mockUser);
    
//     /* ORIGINAL CODE - commented for testing
//     setUser(user);
//     */
//   };

//   const logout = async () => {
//     try {
//       await authAPI.logout();
//     } catch (error) {
//       console.error('Logout API call failed:', error);
//     } finally {
//       setUser(null);
//     }
//   };

//   const updateUser = (updatedUser: User) => {
//     setUser(updatedUser);
//   };

//   const value: AuthContextType = {
//     user,
//     isAuthenticated: !!user,
//     isLoading,
//     login,
//     logout,
//     updateUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };



'use client';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@/types';
import { refreshAccessToken, authAPI, setAuthToken, setTokenRefreshCallback, checkApiHealth } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  accessToken : string | null; // in-memory token
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
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

  // Function to update token from API interceptor
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
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken); // attach to axios globally
  };

  const logout = async () => {
    try {
      // Only try to call logout API if we have a real token
      if (token && token !== 'fallback-token') {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setToken(null);
      setAuthToken(null); // Clear authorization header
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const accessToken = token;
  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
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
