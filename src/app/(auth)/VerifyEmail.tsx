import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  const pendingUser = JSON.parse(localStorage.getItem('pendingUser') || '{}');
  const email = pendingUser.email || '';

  useEffect(() => {
    if (!pendingUser.id) {
      navigate('/register');
      return;
    }

    // Auto-verification simulation (commented logic for actual implementation)
    // In production, this would be handled by email link clicks or verification codes
    const autoVerifyTimer = setTimeout(() => {
      handleAutoVerification();
    }, 5000);

    // Countdown timer
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(autoVerifyTimer);
      clearInterval(countdownTimer);
    };
  }, []);

  const handleAutoVerification = async () => {
    setIsVerifying(true);
    setError('');

    try {
      // Simulate verification process
      // In production: const response = await authAPI.verifyEmail(verificationToken);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsVerified(true);
      setIsVerifying(false);
      
      // Update user verification status
      const updatedUser = { ...pendingUser, isVerified: true };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.removeItem('pendingUser');
      
      // Auto redirect to dashboard after verification
      setTimeout(() => {
        const token = localStorage.getItem('authToken') || '';
        login(updatedUser, token);
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      setError('Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    setError('');

    try {
      const response = await authAPI.resendVerification(email);
      
      if (response.success) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setError('Failed to resend verification email. Please try again.');
      }
    } catch (error) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    if (!isVerified) {
      setError('Please verify your email before accessing the dashboard.');
      return;
    }
    
    const token = localStorage.getItem('authToken') || '';
    login(pendingUser, token);
    navigate('/dashboard');
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
              Email Verified!
            </CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleGoToDashboard} 
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            {isVerifying ? (
              <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {isVerifying ? 'Verifying...' : 'Verify Your Email'}
          </CardTitle>
          <CardDescription>
            {isVerifying 
              ? 'Please wait while we verify your email address.'
              : `We've sent a verification email to ${email}. Please check your inbox and verify your email address.`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {resendMessage && (
            <Alert>
              <AlertDescription className="text-green-600">{resendMessage}</AlertDescription>
            </Alert>
          )}

          {countdown > 0 && !isVerifying && (
            <Alert>
              <AlertDescription>
                Auto-verification will occur in {countdown} seconds (for demo purposes)
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleResendVerification}
              variant="outline"
              className="w-full"
              disabled={resendLoading || isVerifying}
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend Verification Email'
              )}
            </Button>

            <Button
              onClick={handleGoToDashboard}
              className="w-full"
              disabled={isVerifying}
            >
              Go to Dashboard
            </Button>

            <Button
              onClick={() => navigate('/login')}
              variant="ghost"
              className="w-full"
            >
              Back to Login
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Didn't receive the email? Check your spam folder or try resending.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};