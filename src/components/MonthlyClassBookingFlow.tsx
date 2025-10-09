'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, CreditCard, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MonthlyClassBooking from './MonthlyClassBooking';
import { MonthlyClassBooking as MonthlyBookingType } from '@/types';

interface MonthlyClassBookingFlowProps {
  tutorId: string;
  subjectId: string;
  languageId: string;
  studentId: string;
  tutorName?: string;
  subjectName?: string;
  onComplete?: () => void;
}

type FlowStep = 'booking' | 'payment' | 'success';

export default function MonthlyClassBookingFlow({
  tutorId,
  subjectId,
  languageId,
  studentId,
  tutorName,
  subjectName,
  onComplete
}: MonthlyClassBookingFlowProps) {
  const [currentStep, setCurrentStep] = useState<FlowStep>('booking');
  const [bookingData, setBookingData] = useState<MonthlyBookingType | null>(null);
  const [error, setError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleBookingSuccess = (booking: MonthlyBookingType) => {
    console.log('Monthly booking created:', booking);
    setBookingData(booking);
    setCurrentStep('payment');
    setError('');
  };

  const handleBookingError = (errorMessage: string) => {
    console.error('Monthly booking error:', errorMessage);
    setError(errorMessage);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    console.log('Monthly class payment successful:', paymentData);
    setPaymentSuccess(true);
    setCurrentStep('success');
    setError('');
    
    // You might want to call an API here to confirm the entire monthly booking
    // apiService.confirmMonthlyBooking(bookingData.id, paymentData);
  };

  const handlePaymentError = (errorMessage: string) => {
    console.error('Monthly payment error:', errorMessage);
    setError(errorMessage);
  };

  const resetFlow = () => {
    setCurrentStep('booking');
    setBookingData(null);
    setError('');
    setPaymentSuccess(false);
  };

  const handleComplete = () => {
    onComplete?.();
    resetFlow();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Steps */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-8">
            {/* Step 1: Booking */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'booking' 
                  ? 'bg-blue-600 text-white' 
                  : bookingData 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {bookingData && currentStep !== 'booking' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  '1'
                )}
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 'booking' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Select Schedule
              </span>
            </div>

            <div className="h-px bg-gray-300 w-16"></div>

            {/* Step 2: Payment */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'payment' 
                  ? 'bg-blue-600 text-white' 
                  : paymentSuccess 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {paymentSuccess ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  '2'
                )}
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 'payment' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Payment
              </span>
            </div>

            <div className="h-px bg-gray-300 w-16"></div>

            {/* Step 3: Success */}
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === 'success' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {currentStep === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  '3'
                )}
              </div>
              <span className={`text-sm font-medium ${
                currentStep === 'success' ? 'text-green-600' : 'text-gray-600'
              }`}>
                Complete
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Context Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="h-5 w-5" />
            Monthly Class Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tutorName && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Tutor:</span>
              <Badge variant="outline">{tutorName}</Badge>
            </div>
          )}
          {subjectName && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Subject:</span>
              <Badge variant="outline">{subjectName}</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === 'booking' && (
        <MonthlyClassBooking
          tutorId={tutorId}
          subjectId={subjectId}
          languageId={languageId}
          onBookingSuccess={handleBookingSuccess}
          onBookingError={handleBookingError}
        />
      )}

      {currentStep === 'payment' && bookingData && (
        <div className="space-y-6">
          {/* Booking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Booking Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{bookingData.totalSlots}</div>
                  <div className="text-sm text-gray-600">Total Classes</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{bookingData.patterns.length}</div>
                  <div className="text-sm text-gray-600">Weekly Patterns</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">LKR {bookingData.totalCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-3">Weekly Schedule:</h4>
                <div className="space-y-2">
                  {bookingData.patterns.map((pattern, index) => (
                    <div key={pattern.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <Badge variant="outline">
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][pattern.dayOfWeek - 1]}
                      </Badge>
                      <div className="flex gap-1">
                        {pattern.times.map((time: string, timeIndex: number) => (
                          <Badge key={timeIndex} variant="secondary" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Component */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Complete Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-8 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  LKR {bookingData.totalCost.toLocaleString()}
                </div>
                <p className="text-gray-600 mb-4">
                  Payment for {bookingData.totalSlots} monthly classes
                </p>
                <Button 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  onClick={handlePaymentSuccess}
                >
                  Proceed to PayHere
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Secure payment powered by PayHere
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-start">
            <Button variant="outline" onClick={() => setCurrentStep('booking')}>
              ← Back to Schedule Selection
            </Button>
          </div>
        </div>
      )}

      {currentStep === 'success' && bookingData && (
        <div className="text-center space-y-6">
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-12 pb-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-green-600">Monthly Booking Confirmed!</h2>
                <p className="text-gray-600 max-w-md">
                  Your monthly class schedule has been successfully booked and paid for. 
                  You'll receive {bookingData.totalSlots} classes this month.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <Button 
              onClick={handleComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              Done
            </Button>
            <Button 
              variant="outline"
              onClick={resetFlow}
            >
              Book Another Month
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
