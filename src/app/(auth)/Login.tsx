import React, { useState } from 'react';
//import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types';

export const Login: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attemptCount, setAttemptCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!credentials.email.trim()) {
      setError('Please enter your email or username');
      return false;
    }

    if (!credentials.password.trim()) {
      setError('Please enter your password');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authAPI.login(credentials);
      
      if (response.success && response.data) {
        const { user } = response.data;
        
        // Check if user is verified
        if (!user.isVerified) {
          router.push('/verify-email');
          return;
        }

        login(user);
        
        // Reset attempt count on successful login
        setAttemptCount(0);
        
        // Navigate to dashboard after successful login
        router.push('/dashboard');
      } else {
        // Increment attempt count on failed login
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        
        // Generic error message to avoid revealing if email/username exists
        setError('Invalid credentials. Please check your email/username and password.');
      }
    } catch (error: unknown) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      
      setError(error instanceof Error ? error.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email or Username</Label>
              <Input
                id="email"
                name="email"
                type="text"
                value={credentials.email}
                onChange={handleInputChange}
                placeholder="Enter your email or username"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="link"
                className="p-0 text-sm"
                onClick={() => router.push('/forgot-password')}
              >
                Forgot password?
              </Button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 font-semibold"
                  onClick={() => router.push('/register')}
                >
                  Sign up
                </Button>
              </p>
            </div>

            {/* Demo credentials for testing */}
            <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Demo credentials: test@example.com / password
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
