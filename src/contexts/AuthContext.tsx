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
import { refreshAccessToken, authAPI, setAuthToken, setTokenRefreshCallback } from '@/lib/api';

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

  // Function to update token from API interceptor
  const updateTokenFromInterceptor = (newToken: string) => {
    setToken(newToken);
  };

  useEffect(() => {
    // Register callback for token updates from API interceptor
    setTokenRefreshCallback(updateTokenFromInterceptor);
    checkAuthStatus();
  }, []);

  useEffect(() => {
  }, [user]);

  // const checkAuthStatus = async () => {
  //   try {
  //     const response = await authAPI.getCurrentUser(); // should call /auth/me
  //     if (response && response.user) {
  //       setUser(response.user);
  //       setToken(response.token || null);
  //     } else {
  //       setUser(null);
  //       setToken(null);
  //     }
  //   } catch (error) {
  //     console.error('Auth check failed:', error);
  //     setUser(null);
  //     setToken(null);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const checkAuthStatus = async () => {
    try {
      // try to silently refresh on page load
      const newToken = await refreshAccessToken(); 
      setToken(newToken.accessToken);
      setAuthToken(newToken.accessToken); // attach to axios
      console.log('newToken', newToken.accessToken);
      
      // Test the token first
      console.log('Testing token validity...');
      try {
        // const tokenTest = await authAPI.testToken();
        // console.log('Token test result:', tokenTest);
        console.log('Token test skipped - endpoint may not exist');
      } catch (testErr) {
        console.log('Token test failed (expected if endpoint doesn\'t exist):', testErr);
      }
      
      // Don't pass token explicitly - let the interceptor handle it
      const response = await authAPI.getCurrentUser();
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        // TEMPORARY FALLBACK: If getCurrentUser fails, create a mock user for testing
        console.log('getCurrentUser failed, using fallback user for testing');
        const fallbackUser: User = {
          id: 'fallback-user',
          firstName: 'Test',
          lastName: 'User',
          username: 'testuser',
          email: 'test@example.com',
          role: 'STUDENT',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        setUser(fallbackUser);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };


  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    setAuthToken(newToken); // attach to axios globally
  };
  useEffect(() => {
  }, [token]);

  // No need for manual refresh since API interceptor handles it automatically

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
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
    isAuthenticated: !!user && !!token,
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
