"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Loader2,
  Timer,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  DollarSign,
} from "lucide-react";
import { Tutor, TimeSlot } from "@/types";

interface PaymentStepProps {
  tutor: Tutor;
  selectedDate: Date;
  selectedSlot: TimeSlot;
  reservationTimer: number;
  isBooking: boolean;
  onBack: () => void;
  onPay: () => void;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({
  tutor,
  selectedDate,
  selectedSlot,
  reservationTimer,
  isBooking,
  onBack,
  onPay,
}) => {
  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getTimerColor = () => {
    if (reservationTimer > 180) return "text-green-600";
    if (reservationTimer > 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer Alert */}
      {reservationTimer > 0 && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
          <Timer className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              Slot reserved for{" "}
              <span className={`font-semibold ${getTimerColor()}`}>
                {formatTimer(reservationTimer)}
              </span>
              . Complete payment to confirm booking.
            </span>
            <Badge variant={reservationTimer <= 60 ? "destructive" : "secondary"} className="text-xs">
              {reservationTimer <= 60 ? "Hurry!" : "Reserved"}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Summary */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tutor</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {tutor.firstName} {tutor.lastName}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Time</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {`${formatTime(selectedSlot.startTime)} - ${formatTime(
                    selectedSlot.endTime
                  )}`}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Duration</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">2 hours</span>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between py-4 px-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-bold text-blue-600">
                  ${selectedSlot.price}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Secure payment processing
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Your payment information is encrypted and secure
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>SSL encrypted payment</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Instant booking confirmation</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>24/7 customer support</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isBooking}
          className="flex items-center gap-2 sm:w-auto w-full border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Slots
        </Button>
        <Button
          className="flex-1 h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          onClick={onPay}
          disabled={isBooking || reservationTimer === 0}
        >
          {isBooking ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay ${selectedSlot.price}
            </>
          )}
        </Button>
      </div>

      {reservationTimer === 0 && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            Your slot reservation has expired. Please go back and select a new slot.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};