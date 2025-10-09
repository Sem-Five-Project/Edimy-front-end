import { Check, Calendar, ArrowRight } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { formatDate, formatTime } from '@/lib/utils';

interface PaymentSuccessProps {
  bookingDetails: {
    tutorName: string;
    subject: string;
    date: Date;
    startTime: string;
    endTime: string;
    amount: number;
    orderId: string;
  };
  onViewBookings: () => void;
  onClose: () => void;
}

export function PaymentSuccess({ bookingDetails, onViewBookings, onClose }: PaymentSuccessProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full bg-white dark:bg-gray-900 shadow-xl">
        <CardContent className="p-6">
          {/* Success Icon */}
          <div className="mb-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Payment Successful!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Your class has been successfully booked
            </p>
          </div>

          {/* Booking Details */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                <span className="font-medium">{bookingDetails.orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Tutor:</span>
                <span className="font-medium">{bookingDetails.tutorName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                <span className="font-medium">{bookingDetails.subject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Date:</span>
                <span className="font-medium">{formatDate(bookingDetails.date)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Time:</span>
                <span className="font-medium">
                  {formatTime(bookingDetails.startTime)} - {formatTime(bookingDetails.endTime)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Amount Paid:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${bookingDetails.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Next Steps</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <li className="flex items-start gap-2">
                <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Check your email for booking confirmation and class details</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Review your upcoming classes in the dashboard</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={onViewBookings}
            >
              View My Bookings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}