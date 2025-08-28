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
import { refreshAccessToken, authAPI } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';

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

  useEffect(() => {
    checkAuthStatus();
  }, []);
    useEffect(() => {
console.log("userrrrrrrrrrrrrrr :",user)  }, [user]);

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
      console.log("Silent refresh token:", newToken.accessToken);
      setToken(newToken.accessToken);
      setAuthToken(newToken.accessToken); // attach to axios
      const response = await authAPI.getCurrentUser(newToken.accessToken);
      if (response?.data?.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.error("Silent refresh failed:", err);
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
    console.log('Auth state changed - user:', user, 'token:', token);
  }, [token]);

  const refreshToken = async () => {
    try {
      const newToken = await refreshAccessToken();
      setToken(newToken);
      setAuthToken(newToken);
      console.log('Token refreshed successfully:', newToken);
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout(); // Log out if refresh fails
    }
  };

  useEffect(() => {
    console.log("Setting up token refresh interval. Current token:", token);
    // Check if we have a token and refresh it periodically
    if (token) {
      const interval = setInterval(() => {
        refreshToken(); // Refresh token every 15 minutes
      }, 15 * 60 * 1000); // 15 minutes

      return () => clearInterval(interval);
    }
  }, [token]);

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      setUser(null);
      setToken(null);
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
