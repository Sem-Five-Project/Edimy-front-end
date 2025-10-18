"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
  Eye,
  EyeOff,
  Check,
  X,
  Loader2,
  User,
  Mail,
  Lock,
  UserCheck,
  ArrowRight,
  Users,
  BookOpen,
  Trophy,
} from "lucide-react";
import { authAPI } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import logo from '../../../../public/Edimy.png';

// Local form state (distinct from backend RegisterData in types)
interface RegisterFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "STUDENT" | "TUTOR";
}

interface PasswordStrength {
  score: number;
  feedback: string[];
}

export default function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "STUDENT",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
  });

  const debouncedUsername = useDebounce(formData.username, 500);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      checkUsernameAvailability(debouncedUsername);
    } else {
      setUsernameStatus("idle");
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
    setUsernameStatus("checking");
    try {
      const response = await authAPI.checkUsername(username);
      if (response.data && response.data.available !== undefined) {
        setUsernameStatus(response.data.available ? "available" : "taken");
      } else {
        setUsernameStatus("idle");
      }
    } catch (error) {
      setUsernameStatus("idle");
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("At least 8 characters");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("One number");
    }

    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      score += 1;
    } else {
      feedback.push("One special character");
    }

    setPasswordStrength({ score, feedback });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");

    if (name === "username") {
      setUsernameStatus("idle");
    }
  };

  const handleUserTypeToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      role: checked ? "TUTOR" : "STUDENT",
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!formData.username.trim() || formData.username.length < 3) {
      setError("Username must be at least 3 characters");
      return false;
    }

    if (usernameStatus === "taken") {
      setError("Username is already taken");
      return false;
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (passwordStrength.score < 3) {
      setError("Password is too weak");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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
    setError("");

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
      console.log("Registration response:", response);
      if (response.data && response.data.user) {
        localStorage.setItem("pendingEmail", formData.email);

        if (formData.role === "TUTOR") {
          router.push("/tutorregister");
        } else {
          router.push("/verifyemail");
        }
      } else {
        setError(response.message || response.error || "Registration failed");
      }
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case "available":
        return <Check className="h-4 w-4 text-green-500" />;
      case "taken":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return "bg-red-500";
    if (passwordStrength.score <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return "Weak";
    if (passwordStrength.score <= 3) return "Medium";
    return "Strong";
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Platform Benefits */}
        <div className="hidden lg:block">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg">
                <img src={logo.src} alt="Edimy Logo" className="w-20 h-20" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Join Our Learning Community
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Connect with thousands of learners and educators in a secure,
                professional environment designed for academic success.
              </p>
            </div>

            {/* Professional Image */}
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                alt="Students collaborating and learning together"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>

            {/* Platform Benefits */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Why Choose Our Platform?
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Expert Tutors
                    </h4>
                    <p className="text-sm text-gray-600">
                      Learn from verified professionals and subject matter experts
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Personalized Learning
                    </h4>
                    <p className="text-sm text-gray-600">
                      Tailored courses and one-on-one sessions for your goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Proven Results
                    </h4>
                    <p className="text-sm text-gray-600">
                      Join thousands who've achieved their learning objectives
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo/Brand for mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl mb-4">
              <img src={logo.src} alt="Edimy Logo" className="w-20 h-20" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">EduPlatform</h2>
          </div>

          <Card className="shadow-xl border border-gray-200 bg-white">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                Create Account
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Join our platform to connect with tutors or start teaching
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700"
                    >
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                      className="h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700"
                    >
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                      className="h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-gray-700"
                  >
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
                      className="h-11 pr-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getUsernameIcon()}
                    </div>
                  </div>
                  {usernameStatus === "checking" && (
                    <p className="text-sm text-gray-600 animate-pulse">
                      Checking availability...
                    </p>
                  )}
                  {usernameStatus === "taken" && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Username is already taken
                    </p>
                  )}
                  {usernameStatus === "available" && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Username is available
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    className="h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                    required
                  />
                </div>

                {/* User Type Toggle */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg transition-colors ${
                          formData.role === "TUTOR" 
                            ? "bg-blue-600 text-white" 
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {formData.role === "TUTOR" ? (
                          <UserCheck className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="userType"
                          className="cursor-pointer font-medium text-gray-900"
                        >
                          I want to be a{" "}
                          {formData.role === "TUTOR" ? "Tutor" : "Student"}
                        </Label>
                        <p className="text-sm text-gray-600">
                          {formData.role === "TUTOR"
                            ? "Share your knowledge and teach others"
                            : "Find tutors and learn new skills"}
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="userType"
                      checked={formData.role === "TUTOR"}
                      onCheckedChange={handleUserTypeToggle}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>

                {formData.role === "TUTOR" && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      As a tutor, you'll complete additional verification steps
                      after registration to start teaching.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Password */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a strong password"
                      className="h-11 pr-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{
                              width: `${(passwordStrength.score / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium min-w-16 text-gray-700">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      {passwordStrength.feedback.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-red-800 mb-2">
                            Password requirements:
                          </p>
                          <ul className="text-sm text-red-700 space-y-1">
                            {passwordStrength.feedback.map((item, index) => (
                              <li
                                key={index}
                                className="flex items-center space-x-2"
                              >
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
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="h-11 pr-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 px-3 text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <X className="h-3 w-3" />
                        Passwords do not match
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  disabled={isLoading || usernameStatus === "checking"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      {formData.role === "TUTOR"
                        ? "Continue to Tutor Setup"
                        : "Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => router.push("/login")}
                    >
                      Sign in
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
}
