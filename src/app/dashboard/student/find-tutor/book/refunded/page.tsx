"use client";
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingProgress } from "@/components/ui/booking-progress";
import { 
  RefreshCcw, 
  AlertCircle,
  Home,
  ExternalLink,
  Clock,
  Info
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useRouter } from "next/navigation";

export default function BookingRefundedPage() {
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
        {/* Refunded Header */}
        <div className="text-center animate-in zoom-in-50 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full mb-4 shadow-lg">
            <RefreshCcw className="h-10 w-10 text-white animate-in zoom-in-75 duration-500 delay-200" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Refunded
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your payment has been refunded
          </p>
        </div>

        {/* Refund Information Card */}
        <Card className="animate-in slide-in-from-top-4 duration-500 delay-100 border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-r from-orange-50 to-white dark:from-orange-950/20 dark:to-gray-900">
          <CardContent className="p-6">
            <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
              <Clock className="h-5 w-5 text-orange-600" />
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                <div className="space-y-2">
                  <p className="font-semibold">Payment Window Expired</p>
                  <p className="text-sm">
                    You didn't complete the payment within the allowed time (15 minutes), so the transaction was automatically refunded.
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
              <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Payment Window Timeout
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The payment window has a 15-minute time limit. If payment is not completed within this time, the transaction is automatically cancelled.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Automatic Refund Initiated
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Any amount that was captured will be automatically refunded to your original payment method within 2-10 business days.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Book Again
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You can book the same or a different slot again. Make sure to complete the payment within the time limit.
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
              Book Another Session
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

        {/* Important Notice */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-400 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Important Information
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Refunds typically take 2-10 business days to appear in your account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>The exact timing depends on your bank or payment provider</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>If you don't see the refund after 10 business days, please contact support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>The slot you tried to book may now be available for other students</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
