// Example of how to use the loginWithResponse function in your login component

import { useAuth } from '@/contexts/AuthContext'
import { authAPI } from '@/lib/api'

export function LoginExample() {
  const { loginWithResponse } = useAuth()
  
  const handleLogin = async (credentials: { usernameOrEmail: string; password: string }) => {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        // The response.data should contain: { accessToken, tokenType, user }
        // This matches the format you showed:
        // {
        //   "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
        //   "tokenType": "Bearer", 
        //   "user": {
        //     "id": 3,
        //     "username": "student49",
        //     "firstName": "Student49", 
        //     "lastName": "Example",
        //     "email": "student@example49.com",
        //     "role": "STUDENT",
        //     "profileImage": "https://www.freepik.com/free-photos-vectors/young-girl-student"
        //   }
        // }
        
        loginWithResponse(response.data)
        
        // Navigate to dashboard or profile
        // router.push('/dashboard/student/profile')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  // ... rest of your login component
}
