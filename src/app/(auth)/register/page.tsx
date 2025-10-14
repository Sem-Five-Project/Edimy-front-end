"use client"; 

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Eye, EyeOff, Check, X, Loader2, User, Mail, Lock, UserCheck, Shield, ArrowRight, Users, BookOpen, Trophy } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useDebounce } from '@/hooks/useDebounce';

// Local form state (distinct from backend RegisterData in types)
interface RegisterFormData {
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
  
  const [formData, setFormData] = useState<RegisterFormData>({
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
      if (response.data && response.data.available !== undefined) {
        setUsernameStatus(response.data.available ? 'available' : 'taken');
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
      // Map local form to backend RegisterData shape
      const apiPayload = {
        fullName: `${formData.firstName} ${formData.lastName}`.trim(),
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        userType: formData.role,
      } as const;

      const response = await authAPI.register(apiPayload);
      console.log('Registration response:', response);
      if (response.data && response.data.user) {
        localStorage.setItem('pendingEmail', formData.email);
        
        if (formData.role === 'TUTOR') {
          router.push('/tutorregister');
        } else {
          router.push('/verifyemail');
        }
      } else {
        setError(response.message || response.error || 'Registration failed');
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
        return <Loader2 className="h-4 w-4 animate-spin text-slate-500" />;
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
  <div className="h-screen bg-white text-slate-900 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-start min-h-screen lg:min-h-0 py-8 lg:py-0">
        
        {/* Left Side - Platform Benefits */}
  <div className="hidden lg:flex lg:items-center">
          <div className="space-y-8 w-full">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                Join Our Learning Community
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                Connect with thousands of learners and educators in a secure, professional environment designed for academic success.
              </p>
            </div>
            
            {/* Professional Image */}
            <div className="relative rounded-xl overflow-hidden shadow-lg max-w-lg">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Students collaborating and learning together"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Platform Benefits */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-slate-900">Why Choose Our Platform?</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Expert Tutors</h4>
                    <p className="text-sm text-slate-600">Learn from verified professionals and subject matter experts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Personalized Learning</h4>
                    <p className="text-sm text-slate-600">Tailored courses and one-on-one sessions for your goals</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">Proven Results</h4>
                    <p className="text-sm text-slate-600">Join thousands who've achieved their learning objectives</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-lg mx-auto lg:mx-0 lg:max-w-none">
          {/* Logo/Brand for mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">EduPlatform</h2>
          </div>

          <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl shadow-slate-200/50">
            <CardHeader className="text-center pb-6 pt-8">
              <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent mb-2">
                Create Account
              </CardTitle>
              <CardDescription className="text-slate-600 text-base">
                Join our platform to connect with tutors or start teaching
              </CardDescription>
            </CardHeader>
            
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50/80 backdrop-blur-sm">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="h-12 text-base border-2 border-slate-200 bg-slate-50/70 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="h-12 text-base border-2 border-slate-200 bg-slate-50/70 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-3">
                  <Label htmlFor="username" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
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
                      className="h-12 text-base pr-12 border-2 border-slate-200 bg-slate-50/70 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getUsernameIcon()}
                    </div>
                  </div>
                  {usernameStatus === 'checking' && (
                    <p className="text-sm text-slate-600 animate-pulse">Checking availability...</p>
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
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="h-12 text-base border-2 border-slate-200 bg-slate-50/70 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all duration-200 backdrop-blur-sm"
                    required
                  />
                </div>

                {/* User Type Toggle */}
                <div className="bg-slate-50/70 rounded-xl p-6 border border-slate-200 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl transition-colors ${formData.role === 'TUTOR' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {formData.role === 'TUTOR' ? <UserCheck className="h-6 w-6" /> : <User className="h-6 w-6" />}
                      </div>
                      <div>
                        <Label htmlFor="userType" className="cursor-pointer font-semibold text-lg text-slate-900">
                          I want to be a {formData.role === 'TUTOR' ? 'Tutor' : 'Student'}
                        </Label>
                        <p className="text-sm text-slate-600 mt-1">
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
                      className="data-[state=checked]:bg-slate-900"
                    />
                  </div>
                </div>

                {formData.role === 'TUTOR' && (
                  <Alert className="border-blue-200 bg-blue-50/80 backdrop-blur-sm">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      As a tutor, you'll complete additional verification steps after registration to start teaching.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Password */}
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
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
                      className="h-12 text-base pr-12 border-2 border-slate-200 bg-slate-50/70 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-8 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {formData.password && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-16 text-slate-700">{getPasswordStrengthText()}</span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="bg-red-50/80 border border-red-200 rounded-lg p-3 backdrop-blur-sm">
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
                <div className="space-y-3">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
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
                      className="h-12 text-base pr-12 border-2 border-slate-200 bg-slate-50/70 rounded-xl focus:border-slate-400 focus:ring-4 focus:ring-slate-200/50 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 h-8 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
                  disabled={isLoading || usernameStatus === 'checking'}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {formData.role === 'TUTOR' ? 'Continue to Tutor Setup' : 'Create Account'}
                      <ArrowRight className="ml-3 h-5 w-5" />
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </>
                  )}
                </Button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-sm text-slate-500 bg-white/80 backdrop-blur-sm">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 text-base font-medium border-2 border-slate-200 hover:border-slate-300 rounded-xl bg-white/60 hover:bg-slate-50 backdrop-blur-sm transition-all duration-200"
                  onClick={() => router.push('/login')}
                >
                  Sign in to existing account
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};