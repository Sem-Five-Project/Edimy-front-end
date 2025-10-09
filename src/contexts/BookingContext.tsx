"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';
import { Tutor, TimeSlot, BookingPreferences, type MonthlyClassBooking as MonthlyBookingData } from '@/types';

// Type for monthly booking summary stored after reserving multiple slots
// export interface MonthlyBookingData {
//   id: string; // reservation id
//   tutorId: string;
//   subjectId: string;
//   languageId: string;
//   totalSlots: number;
//   totalCost: number;
//   status: string;
//   createdAt: string;
//   startDate: string; // first occurrence date YYYY-MM-DD
//   endDate: string;   // last occurrence date YYYY-MM-DD
// }
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
  // (single one-time slot details not stored here anymore)
  bookingPreferences: BookingPreferences;
  setBookingPreferences: (prefs: BookingPreferences) => void;
  
  // Reservation management
  reservationDetails: ReservationDetails | null;
  setReservationDetails: (details: ReservationDetails | null) => void;
  
  // Navigation helpers
  canProceedToStep: (step: BookingStep) => boolean;
  proceedToStep: (step: BookingStep) => void;
  goBack: () => Promise<void>;
  
  // State management
  resetBookingState: () => void;
  isBookingComplete: boolean;
  bookingId: string | null;
  setBookingId: (id: string | null) => void;
  // Monthly booking aggregate (recurring selection)
  monthlyBookingData: MonthlyBookingData | null;
  setMonthlyBookingData: (data: MonthlyBookingData | null) => void;

  // Locked slots (single for one-time, many for monthly) to release on back/cancel
  lockedSlotIds: number[];
  setLockedSlotIds: (slotIds: number[]) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const router = useRouter();
  
  // State
  const [currentStep, setCurrentStep] = useState<BookingStep>('tutor-selection');
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  // removed singleSlotSnapshot state
  const [bookingPreferences, setBookingPreferences] = useState<BookingPreferences>({
    selectedSubject: null,
    selectedLanguage: null,
    selectedClassType: null,
    finalPrice: 0,
  });
  const [reservationDetails, setReservationDetails] = useState<ReservationDetails | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [monthlyBookingData, setMonthlyBookingData] = useState<MonthlyBookingData | null>(null);
  const [lockedSlotIds, setLockedSlotIds] = useState<number[]>([]);

  // Timer effect for reservation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (reservationDetails && reservationDetails.timer > 0) {
      interval = setInterval(() => {
        setReservationDetails(prev => {
          if (!prev || prev.timer <= 1) {
            // Timer expired - reset slot selection
            // clear locks on expiry
            setLockedSlotIds([]);
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
      case 'payment': {
        if (!tutor || !selectedDate) return false;
        if (!bookingPreferences.selectedSubject || !bookingPreferences.selectedClassType) return false;
        if (tutor.languages.length > 1 && !bookingPreferences.selectedLanguage) return false;
        if (monthlyBookingData) return lockedSlotIds.length > 0; // monthly flow
        return lockedSlotIds.length === 1; // one-time flow
      }
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


const goBack = async (): Promise<void> => {
  switch (currentStep) {
    case 'slot-selection': {
      setCurrentStep('tutor-selection');
      router.push('/dashboard/student/find-tutor');
      break;
    }
    case 'payment': {
      // Always release whatever is in lockedSlotIds
      const toRelease = lockedSlotIds.length > 0 ? lockedSlotIds : [];
      if (toRelease.length > 0) {
        console.log("Releasing locked slots:", toRelease);
        await bookingAPI.releaseSlots(toRelease);
      }
      setLockedSlotIds([]);
      // Clear reservation so UI resets cleanly
      setReservationDetails(null);
      // Clear any persisted one-time slot data

      setCurrentStep('slot-selection');
      router.push('/dashboard/student/find-tutor/book/slots');
      break;
    }
    case 'confirmation': {
      setCurrentStep('payment');
      router.push('/dashboard/student/find-tutor/book/payment');
      break;
    }
  }
};

useEffect(()=>{
  console.log("Locked slot IDs changed:", lockedSlotIds);
}, [lockedSlotIds]);

  const resetBookingState = () => {
    setCurrentStep('tutor-selection');
    setTutor(null);
    setSelectedDate(new Date());
    setLockedSlotIds([]);
    setBookingPreferences({
      selectedSubject: null,
      selectedLanguage: null,
      selectedClassType: null,
      finalPrice: 0,
    });
    setReservationDetails(null);
    setBookingId(null);
    setMonthlyBookingData(null);
    setLockedSlotIds([]);

  };

  const isBookingComplete = currentStep === 'confirmation' && bookingId !== null;

  const value = useMemo(() => ({
    currentStep,
    setCurrentStep,
    tutor,
    setTutor,
    selectedDate,
    setSelectedDate,
  // no slot snapshot
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
    lockedSlotIds,
    setLockedSlotIds: (slotIds: number[]) => setLockedSlotIds(slotIds),
  }), [
    currentStep,
    tutor,
    selectedDate,
    //selectedSlot,
    lockedSlotIds,
    bookingPreferences,
    reservationDetails,
    bookingId,
    isBookingComplete,
    monthlyBookingData,
    lockedSlotIds,
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