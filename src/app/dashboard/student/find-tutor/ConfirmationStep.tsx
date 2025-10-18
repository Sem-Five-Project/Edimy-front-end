"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Mail,
  Bell,
  Sparkles,
} from "lucide-react";
import { Tutor, TimeSlot, BookingPreferences } from "@/types";

interface ConfirmationStepProps {
  tutor: Tutor;
  selectedDate: Date;
  selectedSlot: TimeSlot;
  bookingPreferences: BookingPreferences;
  onClose: () => void;
}

export const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  tutor,
  selectedDate,
  selectedSlot,
  bookingPreferences,
  onClose,
}) => {
  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="max-w-2xl mx-auto text-center space-y-6">
      {/* Success Animation - Simplified */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="bg-green-500 rounded-full p-6">
            <CheckCircle className="h-16 w-16 text-white" />
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="space-y-3">
        <h3 className="text-3xl font-bold text-green-600">
          Booking Confirmed!
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your class with{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            {tutor.firstName} {tutor.lastName}
          </span>{" "}
          has been successfully booked.
        </p>
        <Badge
          variant="secondary"
          className="text-sm px-3 py-1 bg-green-100 text-green-800"
        >
          Booking ID: #BK{Date.now().toString().slice(-6)}
        </Badge>
      </div>

      {/* Class Details Card */}
      <Card className="max-w-lg mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 justify-center text-gray-900 dark:text-white">
            <Calendar className="h-5 w-5 text-blue-600" />
            Class Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Tutor
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {tutor.firstName} {tutor.lastName}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Date
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Time
                </span>
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {`${formatTime(selectedSlot.startTime)} - ${formatTime(
                  selectedSlot.endTime,
                )}`}
              </span>
            </div>

            {selectedSlot.subjectName && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Subject
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {selectedSlot.subjectName}
                </span>
              </div>
            )}

            {selectedSlot.isRecurring && (
              <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Type
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Recurring Session
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="max-w-lg mx-auto bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
        <CardContent className="p-6 space-y-4">
          <h4 className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2 justify-center">
            <Bell className="h-4 w-4" />
            What's Next?
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Confirmation Email
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  You'll receive a detailed confirmation email shortly
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Bell className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Tutor Notification
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Your tutor has been notified about the booking
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">
                  Calendar Reminder
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Add this session to your calendar for reminders
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="pt-6">
        <Button
          onClick={onClose}
          className="w-full max-w-md mx-auto h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
        >
          Perfect! Take me back
        </Button>
      </div>
    </div>
  );
};
