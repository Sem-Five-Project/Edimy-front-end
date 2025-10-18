import axios from "axios";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api";

/**
 * Server-side API client for Next.js Server Components
 * Handles authentication using cookies instead of localStorage
 */
export const createServerApi = async () => {
  const cookieStore = await cookies();
  
  // Get all cookies and format them for the request
  const allCookies = cookieStore.getAll();
  const cookieHeader = allCookies
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  console.log('Server API - Cookies available:', allCookies.map(c => c.name).join(', '));

  // Create axios instance with cookies
  const serverApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { 'Cookie': cookieHeader }),
    },
  });

  // Try to refresh token if we have cookies
  if (cookieHeader) {
    try {
      console.log('Server API - Attempting token refresh...');
      const refreshResponse = await axios.post(
        `${API_BASE_URL}/auth/refresh`, 
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Cookie': cookieHeader,
          },
          timeout: 10000,
        }
      );

      if (refreshResponse.status === 200 && refreshResponse.data?.accessToken) {
        console.log('Server API - Token refresh successful');
        // Add the refreshed access token to subsequent requests
        serverApi.defaults.headers.common['Authorization'] = 
          `Bearer ${refreshResponse.data.accessToken}`;
      }
    } catch (error: any) {
      console.warn('Server API - Token refresh failed:', error?.response?.status, error?.message);
      // Continue without token - will use cookies only
    }
  } else {
    console.warn('Server API - No cookies available for authentication');
  }

  // Simple error logging interceptor (no window access)
  serverApi.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("Server API error:", {
        url: error?.config?.url,
        status: error?.response?.status,
        message: error.message,
        data: error?.response?.data,
      });
      return Promise.reject(error);
    }
  );

  return serverApi;
};

export default createServerApi;
