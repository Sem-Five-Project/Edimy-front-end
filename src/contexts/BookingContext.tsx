"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Tutor, TimeSlot, BookingPreferences } from '@/types';

// Type for monthly booking summary stored after reserving multiple slots
export interface MonthlyBookingData {
  id: string; // reservation id
  tutorId: string;
  subjectId: string;
  languageId: string;
  totalSlots: number;
  totalCost: number;
  status: string;
  createdAt: string;
  startDate: string; // first occurrence date YYYY-MM-DD
  endDate: string;   // last occurrence date YYYY-MM-DD
}
import { useRouter } from 'next/navigation';
import { bookingAPI } from '@/lib/api';

interface ReservationDetails {
  reservationSlotId: string;
  expiresAt: string;
  timer: number;
}

export type BookingStep = 'tutor-selection' | 'slot-selection' | 'payment' | 'confirmation';

interface BookingContextType {
  // Current step
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;
  
  // Booking data
  tutor: Tutor | null;
  setTutor: (tutor: Tutor | null) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedSlot: TimeSlot | null;
  setSelectedSlot: (slot: TimeSlot | null) => void;
  bookingPreferences: BookingPreferences;
  setBookingPreferences: (prefs: BookingPreferences) => void;
  
  // Reservation management
  reservationDetails: ReservationDetails | null;
  setReservationDetails: (details: ReservationDetails | null) => void;
  
  // Navigation helpers
  canProceedToStep: (step: BookingStep) => boolean;
  proceedToStep: (step: BookingStep) => void;
  goBack: (slotId?: number) => Promise<void>;
  
  // State management
  resetBookingState: () => void;
  isBookingComplete: boolean;
  bookingId: string | null;
  setBookingId: (id: string | null) => void;
  // Monthly booking aggregate (recurring selection)
  monthlyBookingData: MonthlyBookingData | null;
  setMonthlyBookingData: (data: MonthlyBookingData | null) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState<BookingStep>('tutor-selection');
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingPreferences, setBookingPreferences] = useState<BookingPreferences>({
    selectedSubject: null,
    selectedLanguage: null,
    selectedClassType: null,
    finalPrice: 0,
  });
  const [reservationDetails, setReservationDetails] = useState<ReservationDetails | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [monthlyBookingData, setMonthlyBookingData] = useState<MonthlyBookingData | null>(null);

  // Timer effect for reservation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (reservationDetails && reservationDetails.timer > 0) {
      interval = setInterval(() => {
        setReservationDetails(prev => {
          if (!prev || prev.timer <= 1) {
            // Timer expired - reset slot selection
            setSelectedSlot(null);
            setCurrentStep('slot-selection');
            return null;
          }
          return { ...prev, timer: prev.timer - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reservationDetails?.timer]);

  // Validation functions
  const canProceedToStep = (step: BookingStep): boolean => {
    switch (step) {
      case 'slot-selection':
        return tutor !== null;
      case 'payment':
        return (
          tutor !== null &&
          selectedDate !== null &&
          selectedSlot !== null &&
          bookingPreferences.selectedSubject !== null &&
          bookingPreferences.selectedClassType !== null &&
          (tutor.languages.length <= 1 || bookingPreferences.selectedLanguage !== null)
        );
      case 'confirmation':
        return bookingId !== null;
      default:
        return true;
    }
  };

  // Navigation functions
  const proceedToStep = (step: BookingStep) => {
    if (canProceedToStep(step)) {
      setCurrentStep(step);
      
      // Navigate to appropriate route
      switch (step) {
        case 'tutor-selection':
          router.push('/dashboard/student/find-tutor');
          break;
        case 'slot-selection':
          router.push('/dashboard/student/find-tutor/book/slots');
          break;
        case 'payment':
          router.push('/dashboard/student/find-tutor/book/payment');
          break;
        case 'confirmation':
          router.push('/dashboard/student/find-tutor/book/confirmation');
          break;
      }
    }
  };


const goBack = async (slotId?: number): Promise<void> => {
  switch (currentStep) {
    case 'slot-selection':
      setCurrentStep('tutor-selection');
      router.push('/dashboard/student/find-tutor');
      break;

    case 'payment':
      if (slotId) {
        await bookingAPI.releaseSlot(slotId);
      }
      setCurrentStep('slot-selection');
      router.push('/dashboard/student/find-tutor/book/slots');
      break;

    case 'confirmation':
      setCurrentStep('payment');
      router.push('/dashboard/student/find-tutor/book/payment');
      break;
  }
};



  const resetBookingState = () => {
    setCurrentStep('tutor-selection');
    setTutor(null);
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setBookingPreferences({
      selectedSubject: null,
      selectedLanguage: null,
      selectedClassType: null,
      finalPrice: 0,
    });
    setReservationDetails(null);
    setBookingId(null);
    setMonthlyBookingData(null);
  };

  const isBookingComplete = currentStep === 'confirmation' && bookingId !== null;

  const value = useMemo(() => ({
    currentStep,
    setCurrentStep,
    tutor,
    setTutor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    bookingPreferences,
    setBookingPreferences,
    reservationDetails,
    setReservationDetails,
    canProceedToStep,
    proceedToStep,
    goBack,
    resetBookingState,
    isBookingComplete,
    bookingId,
    setBookingId,
    monthlyBookingData,
    setMonthlyBookingData,
  }), [
    currentStep,
    tutor,
    selectedDate,
    selectedSlot,
    bookingPreferences,
    reservationDetails,
    bookingId,
    isBookingComplete,
    monthlyBookingData,
  ]);

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};