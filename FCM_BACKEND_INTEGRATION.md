# FCM Token Backend Integration

This document explains how to integrate the FCM token sending functionality with your backend.

## Frontend Implementation

The frontend is now configured to automatically send FCM tokens to your backend when:
1. A user grants notification permission
2. An FCM token is successfully generated

## Backend Requirements

Your backend needs to implement the following endpoints:

### 1. Store FCM Token
```
POST /api/fcm/token
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

## Environment Variables

Make sure to set up your environment variables in `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Firebase configuration (already set up)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
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
// Example backend implementation
app.post('/api/fcm/token', async (req, res) => {
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
```

## Testing

1. Start your backend server
2. Update `NEXT_PUBLIC_API_URL` in your `.env.local`
3. Open your app in the browser
4. Grant notification permission when prompted
5. Check your browser's developer console for success/error messages
6. Verify the token is saved in your backend

## Error Handling

The frontend includes comprehensive error handling:
- Network connectivity issues
- Backend server errors
- Invalid responses
- Detailed console logging for debugging

Check the browser console for detailed error messages if the token sending fails.
