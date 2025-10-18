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
  const cookieHeader = cookieStore.getAll()
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ');

  // Create axios instance with cookies
  const serverApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader && { 'Cookie': cookieHeader }),
    },
    withCredentials: true,
  });

  // Try to refresh token if needed
  try {
    const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
      },
      withCredentials: true,
    });

    if (refreshResponse.status === 200 && refreshResponse.data?.accessToken) {
      // Add the refreshed access token to subsequent requests
      serverApi.defaults.headers.common['Authorization'] = 
        `Bearer ${refreshResponse.data.accessToken}`;
    }
  } catch (error) {
    // Refresh failed - continue without token
    console.log('Token refresh not available on server');
  }

  // Simple error logging interceptor (no window access)
  serverApi.interceptors.response.use(
    (response) => response,
    (error) => {
      console.error("Server API error:", error.message);
      return Promise.reject(error);
    }
  );

  return serverApi;
};

export default createServerApi;
