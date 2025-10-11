"use client";
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingProgress } from "@/components/ui/booking-progress";
import { 
  XCircle, 
  AlertCircle,
  Home,
  ExternalLink,
  Info,
  HelpCircle
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useRouter } from "next/navigation";

export default function BookingCancelledPage() {
  const router = useRouter();
  const {
    resetBookingState,
    currentStep
  } = useBooking();

  useEffect(() => {
    // Clear any cached booking data
    sessionStorage.removeItem('oneTimeSlotDetail');
  }, []);

  const handleNewBooking = () => {
    resetBookingState();
    router.push('/dashboard/student/find-tutor');
  };

  const handleGoToDashboard = () => {
    resetBookingState();
    router.push('/dashboard/student');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress Bar */}
      <BookingProgress currentStep="payment" />
      
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Cancelled Header */}
        <div className="text-center animate-in zoom-in-50 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-red-600 rounded-full mb-4 shadow-lg">
            <XCircle className="h-10 w-10 text-white animate-in zoom-in-75 duration-500 delay-200" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your payment was cancelled
          </p>
        </div>

        {/* Cancellation Information Card */}
        <Card className="animate-in slide-in-from-top-4 duration-500 delay-100 border-2 border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-white dark:from-red-950/20 dark:to-gray-900">
          <CardContent className="p-6">
            <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-300">
                <div className="space-y-2">
                  <p className="font-semibold">Payment Was Cancelled</p>
                  <p className="text-sm">
                    The payment process was cancelled. This could be because you closed the payment window or clicked the cancel button.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* What Happened Card */}
        <Card className="animate-in slide-in-from-left-4 duration-500 delay-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              What Happened?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Payment Cancelled
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The payment was cancelled before completion. This happens when you close the payment window or click cancel during the payment process.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    No Charges Applied
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Since the payment was cancelled, no charges were made to your account. You can safely try again.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Try Again
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can book the same slot again or choose a different time. The slot may still be available.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="animate-in slide-in-from-right-4 duration-500 delay-300">
          <CardContent className="p-6 space-y-3">
            <Button 
              onClick={handleNewBooking}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Try Booking Again
            </Button>

            <Button 
              variant="outline"
              onClick={handleGoToDashboard}
              className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>

        {/* Common Reasons Card */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-400 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Common Reasons for Cancellation
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You clicked the "Cancel" button in the payment window</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You closed the payment window before completing the transaction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You navigated away from the payment page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>You decided to choose a different slot or tutor</span>
                  </li>
                </ul>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>Tip:</strong> Make sure to complete the payment within 15 minutes of starting the process to avoid losing your slot reservation.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
