import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CalendarDays, 
  Clock, 
  Star, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Timer
} from 'lucide-react';
import { tutorAPI, bookingAPI } from '@/lib/api';
import { Tutor, TimeSlot } from '@/types';

interface TutorBookingModalProps {
  tutor: Tutor;
  onClose: () => void;
}

export const TutorBookingModal: React.FC<TutorBookingModalProps> = ({
  tutor,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<'slots' | 'payment' | 'confirmation'>('slots');
  const [error, setError] = useState('');
  const [reservationTimer, setReservationTimer] = useState(0);

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, tutor.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (reservationTimer > 0) {
      interval = setInterval(() => {
        setReservationTimer(prev => {
          if (prev <= 1) {
            handleSlotTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [reservationTimer]);

  const loadAvailableSlots = async (date: Date) => {
    setIsLoadingSlots(true);
    setError('');
    
    try {
      const dateString = date.toISOString().split('T')[0];
      const response = await tutorAPI.getTutorSlots(tutor.id, dateString);
      
      if (response.success) {
        setAvailableSlots(response.data);
      } else {
        setError('Failed to load available slots');
      }
    } catch (error) {
      setError('Failed to load available slots');
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSlotSelection = async (slot: TimeSlot) => {
    if (slot.status !== 'available') return;

    setSelectedSlot(slot);
    setBookingStep('payment');
    setReservationTimer(300); // 5 minutes
  };

  const handleSlotTimeout = () => {
    setSelectedSlot(null);
    setBookingStep('slots');
    setError('Slot reservation expired. Please select a new slot.');
  };

  const handlePayment = async () => {
    if (!selectedSlot) return;

    setIsBooking(true);
    setError('');

    try {
      const response = await bookingAPI.processPayment('mock-booking-id', {
        slotId: selectedSlot.id,
        amount: selectedSlot.price,
      });

      if (response.success) {
        setBookingStep('confirmation');
        setReservationTimer(0);
      } else {
        setError('Payment failed. Please try again.');
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderSlotSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Avatar className="h-20 w-20 mx-auto mb-4">
          <AvatarImage src={tutor.profileImage} />
          <AvatarFallback>
            {tutor.fullName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold">{tutor.fullName}</h3>
        <div className="flex items-center justify-center space-x-1 mt-2">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(tutor.rating) 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-2">
            ({tutor.rating.toFixed(1)})
          </span>
        </div>
        <p className="text-2xl font-bold text-primary mt-2">
          ${tutor.hourlyRate}/hour
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium mb-3">Select Date</h4>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            className="rounded-md border"
          />
        </div>

        <div>
          <h4 className="font-medium mb-3">Available Times</h4>
          {isLoadingSlots ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={slot.status === 'available' ? 'outline' : 'secondary'}
                  size="sm"
                  disabled={slot.status !== 'available'}
                  onClick={() => handleSlotSelection(slot)}
                  className={`text-xs p-2 h-auto ${
                    slot.status === 'booked' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    <div>{formatTime(slot.startTime)}</div>
                    <div>{formatTime(slot.endTime)}</div>
                    {slot.status === 'booked' && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Booked
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
          
          {!isLoadingSlots && availableSlots.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="h-8 w-8 mx-auto mb-2" />
              <p>No slots available for this date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      {reservationTimer > 0 && (
        <Alert>
          <Timer className="h-4 w-4" />
          <AlertDescription>
            Slot reserved for {formatTimer(reservationTimer)}. Complete payment to confirm booking.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Tutor:</span>
              <span className="font-medium">{tutor.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">
                {selectedSlot && `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">2 hours</span>
            </div>
            <hr />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${selectedSlot?.price}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setBookingStep('slots')}
          disabled={isBooking}
        >
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handlePayment}
          disabled={isBooking || reservationTimer === 0}
        >
          {isBooking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${selectedSlot?.price}
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-green-600 mb-2">Booking Confirmed!</h3>
        <p className="text-muted-foreground">
          Your class with {tutor.fullName} has been successfully booked.
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Class Details</h4>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span>Tutor:</span>
              <span className="font-medium">{tutor.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-medium">
                {selectedDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span className="font-medium">
                {selectedSlot && `${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You will receive a confirmation email shortly. The tutor has been notified about your booking.
        </p>
        <Button onClick={onClose} className="w-full">
          Done
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {bookingStep === 'slots' && 'Select Time Slot'}
            {bookingStep === 'payment' && 'Payment'}
            {bookingStep === 'confirmation' && 'Booking Confirmed'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {bookingStep === 'slots' && renderSlotSelection()}
        {bookingStep === 'payment' && renderPayment()}
        {bookingStep === 'confirmation' && renderConfirmation()}
      </DialogContent>
    </Dialog>
  );
};