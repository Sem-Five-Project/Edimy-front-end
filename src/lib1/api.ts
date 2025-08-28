// API utilities for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'; // Update with your backend URL

interface FCMTokenData {
  token: string;
  userId?: string; // Optional user ID if you have user authentication
  deviceType?: 'web' | 'mobile';
  timestamp?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Send FCM token to backend for storage
 */
export async function sendFCMTokenToBackend(tokenData: FCMTokenData): Promise<boolean> {
  try {
    console.log('Sending FCM token to backend...', { 
      url: `${API_BASE_URL}/api/fcm/token`,
      tokenLength: tokenData.token.length 
    });

    const response = await fetch(`${API_BASE_URL}/api/fcm/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization headers if needed
        // 'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        ...tokenData,
        deviceType: tokenData.deviceType || 'web',
        timestamp: tokenData.timestamp || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use default error message
      }
      throw new Error(`Failed to send FCM token: ${errorMessage}`);
    }

    const result: ApiResponse = await response.json();
    console.log('FCM token sent successfully:', result);
    return true;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - is your backend running?', error);
    } else {
      console.error('Error sending FCM token to backend:', error);
    }
    return false;
  }
}

/**
 * Remove FCM token from backend (useful for logout or token refresh)
 */
export async function removeFCMTokenFromBackend(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fcm/token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization headers if needed
        // 'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error(`Failed to remove FCM token: ${response.statusText}`);
    }

    console.log('FCM token removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing FCM token from backend:', error);
    return false;
  }
}

/**
 * Update FCM token in backend (useful when token is refreshed)
 */
export async function updateFCMTokenInBackend(oldToken: string, newToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/fcm/token/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        oldToken, 
        newToken,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update FCM token: ${response.statusText}`);
    }

    console.log('FCM token updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating FCM token in backend:', error);
    return false;
  }
}
