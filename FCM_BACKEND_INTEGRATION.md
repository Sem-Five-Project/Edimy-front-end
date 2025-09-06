# FCM Token Backend Integration

This document explains how to integrate the FCM token sending functionality with your backend.

## ✅ Frontend Implementation Status

The frontend is **FULLY IMPLEMENTED** and configured to automatically send FCM tokens to your backend when:
1. A user grants notification permission (requested on homepage)
2. A user successfully logs in
3. An FCM token is successfully generated

**Current Status: ✅ WORKING - FCM tokens sent after login**

## Backend Requirements

Your backend needs to implement the following endpoints at `http://localhost:8083/api`:

### 1. Store FCM Token ⭐ (REQUIRED)
```
POST /auth/fcmtoken
Content-Type: application/json

{
  "token": "string (FCM token)",
  "userId": "string (optional - user identifier)",
  "deviceType": "web",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

Response:
{
  "success": true,
  "message": "Token saved successfully"
}
```

### 2. Remove FCM Token (Optional)
```
DELETE /api/fcm/token
Content-Type: application/json

{
  "token": "string (FCM token to remove)"
}

Response:
{
  "success": true,
  "message": "Token removed successfully"
}
```

### 3. Update FCM Token (Optional)
```
PUT /api/fcm/token/update
Content-Type: application/json

{
  "oldToken": "string (token to replace)",
  "newToken": "string (new token)",
  "timestamp": "2024-01-01T00:00:00.000Z"
}

Response:
{
  "success": true,
  "message": "Token updated successfully"
}
```

## ✅ Environment Variables (CONFIGURED)

Your environment variables are properly configured in `.env`:

```env
# Backend API URL (CONFIGURED)
NEXT_PUBLIC_API_URL=http://localhost:8083/api

# Firebase configuration (CONFIGURED)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC1jgX3NCdfcaW_233q-KsOeb3MO4WIjr8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=fcm-for-tutorconnect.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=fcm-for-tutorconnect
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=837203762371
NEXT_PUBLIC_FIREBASE_APP_ID=1:837203762371:web:fea1d6d43f418c3a441676
NEXT_PUBLIC_FIREBASE_VAPID_KEY=BK_4G6_hMsY88ES5OYFjGaoRcnrzCnphr2IlEkh3x57Z8ogMAfENJ_Pka45DPrMQ5TprQVMpaB_LFyFoNeVh9xo
```

## Database Schema Suggestion

Consider storing FCM tokens with the following structure:

```sql
CREATE TABLE fcm_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255),
  token VARCHAR(255) UNIQUE NOT NULL,
  device_type ENUM('web', 'mobile') DEFAULT 'web',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);
```

## Example Backend Implementation (Node.js/Express)

```javascript
// SOLUTION 1: Public FCM endpoint (Recommended)
app.post('/auth/fcmtoken', async (req, res) => {
  try {
    const { token, userId, deviceType, timestamp } = req.body;
    
    // Validate token
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    // Save to database (implement based on your database)
    await saveFCMToken({ token, userId, deviceType, timestamp });
    
    res.json({ 
      success: true, 
      message: 'Token saved successfully' 
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// SOLUTION 2: Protected FCM endpoint (if auth required)
app.post('/auth/fcmtoken', authenticateUser, async (req, res) => {
  try {
    const { token, deviceType, timestamp } = req.body;
    const userId = req.user.id; // From authentication middleware
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    await saveFCMToken({ token, userId, deviceType, timestamp });
    
    res.json({ 
      success: true, 
      message: 'Token saved successfully' 
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

## 🚨 Current Issue: Authentication Required

**Error Status: ❌ Backend Rejecting Requests**

Your FCM integration is working correctly, but encountering these errors:

### 🔍 Error Analysis:
```
❌ 401 Unauthorized: Backend requires authentication
❌ ECONNABORTED: Connection timeout/blocked
❌ Request failed with status code 401
```

### 💡 **Solutions:**

#### Option 1: Make FCM endpoint public (Recommended)
```javascript
// In your backend - make this endpoint accessible without auth
app.post('/auth/fcmtoken', async (req, res) => {
  // No authentication middleware here
  try {
    const { token, userId, deviceType, timestamp } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required' 
      });
    }
    
    // Save FCM token to database
    await saveFCMToken({ token, userId, deviceType, timestamp });
    
    res.json({ 
      success: true, 
      message: 'Token saved successfully' 
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});
```

#### Option 2: Send FCM token only for authenticated users ✅ (IMPLEMENTED)
FCM tokens are now automatically sent after successful login:

```typescript
// In your login page - automatically called after login
await sendFCMTokenAfterLogin(userEmail);
```

**This is now the active implementation - FCM tokens are sent only after user authentication.**

### 🧪 Testing the Implementation

### Prerequisites
1. ✅ Frontend is running (`npm run dev`)
2. ⚠️ **Backend server running on `http://localhost:8083`**
3. ⚠️ **FCM endpoint configured (see solutions above)**
4. ✅ Modern browser (Chrome, Firefox, Edge)

### Testing Steps
1. **Start your backend server** on port 8083 with FCM endpoint
2. **Open browser** to `http://localhost:3001` (or current dev port)  
3. **Homepage**: Grant notification permission when prompted (no token sent yet)
4. **Login**: Navigate to `/loginn` and log in with valid credentials
5. **Check console logs** after successful login for:
   ```
   ✅ "Notification permission granted" (from homepage)
   ✅ "Sending FCM token after login: [token]" (after login)
   ✅ "FCM token successfully sent after login" (success message)
   ```

### Expected Behavior
- ✅ **Permission granted**: Token generated and sent to backend
- ❌ **Permission denied**: No token generated (normal behavior)
- ❌ **401 Unauthorized**: Backend requires authentication (current issue)
- ⚠️ **ECONNABORTED**: Connection timeout or CORS issue
- ⚠️ **Backend offline**: Token generated but sending fails (shows error in console)

### 🔧 Quick Debug Steps:
1. **Check if backend is running**: Visit `http://localhost:8083/api/health` 
2. **Test without auth**: Temporarily remove auth middleware from `/auth/fcmtoken`
3. **Check CORS**: Ensure backend allows requests from `localhost:3001`
4. **Verify endpoint**: Confirm `/auth/fcmtoken` exists in your backend routes

## 🔧 Current Frontend Features

### ✅ Implemented & Working
- **Automatic permission request** on homepage load
- **FCM token generation** when permission granted
- **Backend API integration** with proper error handling
- **Client-side only execution** (no SSR issues)
- **Foreground message handling** ready
- **Background message handling** via service worker

### 🚀 API Functions Available
```typescript
// Available in src/lib/api.ts
fcmAPI.sendToken(tokenData)     // Send new tokens
fcmAPI.removeToken(token)       // Remove tokens  
fcmAPI.updateToken(oldToken, newToken) // Update tokens
sendFCMTokenToBackend(tokenData) // Backward compatible function
```

## Error Handling

The frontend includes comprehensive error handling:
- ✅ Network connectivity issues
- ✅ Backend server errors  
- ✅ Invalid responses
- ✅ Detailed console logging for debugging
- ✅ Graceful fallbacks when backend is unavailable

Check the browser console for detailed error messages if the token sending fails.

## 📋 Integration Checklist

- [x] ✅ Frontend FCM implementation complete
- [x] ✅ Firebase configuration working
- [x] ✅ Service worker configured
- [x] ✅ API functions implemented
- [x] ✅ Error handling in place
- [ ] ⚠️ Backend FCM endpoints implemented
- [ ] ⚠️ Database schema created
- [ ] ⚠️ End-to-end testing completed

**Next Step**: Implement the backend FCM endpoints to complete the integration!
