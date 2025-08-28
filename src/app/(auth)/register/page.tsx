"use client"; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Check, X, Loader2, User, Mail, Lock, UserCheck } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

interface RegisterData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'STUDENT' | 'TUTOR';
}

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export default function Register() {
  
  const router = useRouter();
  
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({ score: 0, feedback: [] });

  const debouncedUsername = useDebounce(formData.username, 500);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      checkUsernameAvailability(debouncedUsername);
    } else {
      setUsernameStatus('idle');
    }
  }, [debouncedUsername]);

  useEffect(() => {
    if (formData.password) {
      calculatePasswordStrength(formData.password);
    } else {
      setPasswordStrength({ score: 0, feedback: [] });
    }
  }, [formData.password]);

  const checkUsernameAvailability = async (username: string) => {
    setUsernameStatus('checking');
    try {
      const response = await authAPI.checkUsername(username);
      if (response.available !== undefined) {
        setUsernameStatus(response.available ? 'available' : 'taken');
      } else {
        setUsernameStatus('idle');
      }
    } catch (error) {
      setUsernameStatus('idle');
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    setPasswordStrength({ score, feedback });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');

    if (name === 'username') {
      setUsernameStatus('idle');
    }
  };

  const handleUserTypeToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      role: checked ? 'TUTOR' : 'STUDENT',
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }

    if (usernameStatus === 'taken') {
      setError('Username is already taken');
      return false;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (passwordStrength.score < 3) {
      setError('Password is too weak');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
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
      const response = await authAPI.register(formData);
      console.log('Registration response:', response);
      if (response.user) {
        // Don't store any token, just redirect to email verification
        localStorage.setItem('pendingEmail', formData.email);
        
        if (formData.role === 'TUTOR') {
          router.push('/tutorregister');
        } else {
          router.push('/verifyemail');
        }
      } else {
        setError(response.message || 'Registration failed');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'available':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'taken':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Weak';
    if (passwordStrength.score <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 p-4">
      <div className="flex items-center justify-center min-h-screen py-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                Create Account
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">
                Join our platform to connect with tutors or start teaching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="animate-in slide-in-from-top-2">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-gray-500" />
                    Username
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Choose a unique username"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors pr-12"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getUsernameIcon()}
                    </div>
                  </div>
                  {usernameStatus === 'checking' && (
                    <p className="text-sm text-blue-600 animate-pulse">Checking availability...</p>
                  )}
                  {usernameStatus === 'taken' && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Username is already taken
                    </p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Username is available
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="h-11 border-2 focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>

                {/* User Type Toggle */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 border-dashed border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full transition-colors ${formData.role === 'TUTOR' ? 'bg-indigo-100 text-indigo-600' : 'bg-blue-100 text-blue-600'}`}>
                        {formData.role === 'TUTOR' ? <UserCheck className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      </div>
                      <div>
                        <Label htmlFor="userType" className="cursor-pointer font-medium text-lg">
                          I want to be a {formData.role === 'TUTOR' ? 'Tutor' : 'Student'}
                        </Label>
                        <p className="text-sm text-gray-500">
                          {formData.role === 'TUTOR' 
                            ? 'Share your knowledge and teach others' 
                            : 'Find tutors and learn new skills'
                          }
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="userType"
                      checked={formData.role === 'TUTOR'}
                      onCheckedChange={handleUserTypeToggle}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  </div>
                </div>

                {formData.role === 'TUTOR' && (
                  <Alert className="border-indigo-200 bg-indigo-50 text-indigo-700 animate-in slide-in-from-top-2">
                    <UserCheck className="h-4 w-4" />
                    <AlertDescription>
                      As a tutor, you'll need to complete additional verification steps after registration to start teaching.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  
                  {formData.password && (
                    <div className="space-y-3 animate-in slide-in-from-top-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-16">{getPasswordStrengthText()}</span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-800 mb-2">Password requirements:</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            {passwordStrength.feedback.map((item, index) => (
                              <li key={index} className="flex items-center space-x-2">
                                <X className="h-3 w-3 text-red-500 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-11 border-2 focus:border-indigo-500 transition-colors pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-500" /> : <Eye className="h-4 w-4 text-gray-500" />}
                    </Button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1 animate-in slide-in-from-top-1">
                      <X className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                  disabled={isLoading || usernameStatus === 'checking'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {formData.role === 'TUTOR' ? 'Continue to Tutor Setup' : 'Create Account'}
                      <UserCheck className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-semibold text-indigo-600 hover:text-indigo-700"
                      onClick={() => router.push('/login')}
                    >
                      Sign in instead
                    </Button>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
