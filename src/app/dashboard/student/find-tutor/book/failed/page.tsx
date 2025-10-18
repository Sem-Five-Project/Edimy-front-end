"use client";
import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BookingProgress } from "@/components/ui/booking-progress";
import { 
  AlertTriangle, 
  AlertCircle,
  Home,
  ExternalLink,
  Info,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useRouter } from "next/navigation";

export default function BookingFailedPage() {
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
        {/* Failed Header */}
        <div className="text-center animate-in zoom-in-50 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full mb-4 shadow-lg">
            <AlertTriangle className="h-10 w-10 text-white animate-in zoom-in-75 duration-500 delay-200" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            We couldn't process your payment
          </p>
        </div>

        {/* Failure Information Card */}
        <Card className="animate-in slide-in-from-top-4 duration-500 delay-100 border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-950/20 dark:to-gray-900">
          <CardContent className="p-6">
            <Alert className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                <div className="space-y-2">
                  <p className="font-semibold">Payment Processing Failed</p>
                  <p className="text-sm">
                    There was an issue processing your payment. This could be due to insufficient funds, incorrect card details, or a technical issue.
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
              <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Payment Failed
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    The payment gateway was unable to process your payment. This could be due to various reasons including insufficient funds, incorrect card details, or bank restrictions.
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
                    Since the payment failed, no charges were made to your account. You can safely try again with a different payment method.
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
                    You can try booking again. Make sure your payment details are correct and you have sufficient funds.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Card */}
        <Card className="animate-in slide-in-from-right-4 duration-500 delay-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-purple-600" />
              Troubleshooting Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Before trying again:</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Verify your card has sufficient funds</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Check that your card details are entered correctly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Ensure your card is enabled for online transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Contact your bank if the issue persists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">✓</span>
                    <span>Try using a different payment method or card</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-400">
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

        {/* Support Card */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-500 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Still Having Issues?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                If you continue to experience payment failures, our support team is here to help.
              </p>
              <Button variant="outline">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
