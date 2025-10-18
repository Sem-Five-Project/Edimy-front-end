"use client";
import React, { useState } from "react";
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
import { Eye, EyeOff, Loader2, Shield, ArrowRight } from "lucide-react";
import { authAPI } from "@/lib/api";
import { sendFCMTokenAfterLogin } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { LoginCredentials } from "@/types";
import logo from '../../../../public/Edimy.png';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    usernameOrEmail: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attemptCount, setAttemptCount] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = (): boolean => {
    if (!credentials.usernameOrEmail.trim()) {
      setError("Please enter your email or username");
      return false;
    }

    if (!credentials.password.trim()) {
      setError("Please enter your password");
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
      const response = await authAPI.login(credentials);
      console.log("Login response:", response);

      if (response.success) {
        const user = response.data.user;
        const token = response.data.accessToken;
        console.log("Login response token:", token);

        // Login user
        login(token, user);

        // Reset attempt count on successful login
        setAttemptCount(0);

        // Send FCM token after successful login
        console.log(
          "🔥 About to send FCM token for user:",
          user.email || user.username,
        );
        try {
          await sendFCMTokenAfterLogin(user.email || user.username);
          console.log("🔥 FCM token sending completed");
        } catch (fcmError) {
          console.error("🔥 FCM token sending failed:", fcmError);
          // Don't block login flow for FCM errors
        }

        // Navigate to dashboard based on user role
        const userRole = user.role;
        if (userRole === "TUTOR") {
          router.push("/dashboard/tutor/profile");
        } else if (userRole === "STUDENT") {
          router.push("/dashboard/student");
        } else if (userRole === "ADMIN") {
          router.push("/dashboard/admin");
        } else {
          router.push("/not-found");
        }
      } else {
        const newAttemptCount = attemptCount + 1;
        setAttemptCount(newAttemptCount);
        setError(
          "Invalid credentials. Please check your email/username and password.",
        );
      }
    } catch (error: unknown) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);
      setError(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Light-only theme version (dark: classes removed)
    <div className="h-screen bg-white text-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Image and Content */}
        <div className="hidden lg:block">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20  rounded-lg">
                <img src={logo.src} alt="Edimy Logo" className="w-20 h-20" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                Secure Learning Platform
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Access your educational resources with enterprise-grade security
                and seamless user experience.
              </p>
            </div>

            {/* Professional Image */}
            <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
                alt="Professional team collaboration"
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Book your classes anytime, anywhere
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Find tutors who truly understand your learning needs
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-700">
                  Your learning journey made simple and flexible
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo/Brand for mobile */}
          <div className="text-center mb-8 lg:hidden">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-xl mb-4">
              <img src={logo.src} alt="Edimy Logo" className="w-20 h-20" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">EduPlatform</h2>
          </div>

          <Card className="shadow-xl border border-gray-200 bg-white">
            <CardHeader className="space-y-2 pb-6">
              <CardTitle className="text-2xl font-semibold text-center text-gray-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your credentials to access your account
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="usernameOrEmail"
                      className="text-sm font-medium text-gray-700"
                    >
                      Email or Username
                    </Label>
                    <Input
                      id="usernameOrEmail"
                      name="usernameOrEmail"
                      type="text"
                      value={credentials.usernameOrEmail}
                      onChange={handleInputChange}
                      placeholder="Enter your email or username"
                      className="h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                      required
                    />
                  </div>

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
                        value={credentials.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
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
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2">
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => router.push("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
                      onClick={() => router.push("/register")}
                    >
                      Create account
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
