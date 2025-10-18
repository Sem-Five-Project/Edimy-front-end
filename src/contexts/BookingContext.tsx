"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import {
  Tutor,
  TimeSlot,
  BookingPreferences,
  type MonthlyClassBooking as MonthlyBookingData,
} from "@/types";

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
import { useRouter } from "next/navigation";
import { bookingAPI } from "@/lib/api";

interface ReservationDetails {
  reservationSlotId: string;
  expiresAt: string;
  timer: number;
}
interface RepayTimer {
  expiresAt: string;
  timer: number;
}

export type BookingStep =
  | "tutor-selection"
  | "slot-selection"
  | "payment"
  | "confirmation";

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
  
  repayTimer : RepayTimer |null;
  setRepayTimer :(details : RepayTimer | null) => void;
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

  // Mapping for backend confirmation: availability_id -> [slot_ids]
  availabilitySlotsMap: Record<string, number[]>;
  setAvailabilitySlotsMap: (map: Record<string, number[]>) => void;

  // Next month recurring slots for monthly bookings (just slot IDs)
  nextMonthSlots: number[] | null;
  setNextMonthSlots: (slotIds: number[] | null) => void;

  // Next month/year context (for repay and previews)
  nextMonth: number | null;
  setNextMonth: (m: number | null) => void;
  nextYear: number | null;
  setNextYear: (y: number | null) => void;

  // Selected class (for pay-for-next-month flow)
  selectedClassId: number | null;
  setSelectedClassId: (id: number | null) => void;

  // Flag for pay-for-next-month flow
  payForNextMonthFlow: boolean;
  setPayForNextMonthFlow: (isNextMonth: boolean) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] =
    useState<BookingStep>("tutor-selection");
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
  const [repayTimer, setRepayTimer] = useState<RepayTimer | null>(null);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const [monthlyBookingData, setMonthlyBookingData] =
    useState<MonthlyBookingData | null>(null);
  const [lockedSlotIds, setLockedSlotIds] = useState<number[]>([]);
  const [availabilitySlotsMap, setAvailabilitySlotsMap] = useState<Record<string, number[]>>({});
  const [nextMonthSlots, setNextMonthSlots] = useState<number[] | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [nextMonth, setNextMonth] = useState<number | null>(null);
  const [nextYear, setNextYear] = useState<number | null>(null);
  const [payForNextMonthFlow, setPayForNextMonthFlow] = useState<boolean>(false);

  // Timer effect for reservation
  // useEffect(() => {
  //   let interval: NodeJS.Timeout;
  //   if (reservationDetails && reservationDetails.timer > 0) {
  //     interval = setInterval(() => {
  //       setReservationDetails(prev => {
  //         if (!prev || prev.timer <= 1) {
  //           // Timer expired - reset slot selection
  //           // clear locks on expiry
  //           setLockedSlotIds([]);
  //           setCurrentStep('slot-selection');
  //           return null;
  //         }
  //         return { ...prev, timer: prev.timer - 1 };
  //       });
  //     }, 1000);
  //       setRepayTimer(prev => {
  //         if (!prev || prev.timer <= 1) {
  //           // Timer expired - reset slot selection
  //           // clear locks on expiry
  //           setLockedSlotIds([]);
  //           setCurrentStep('slot-selection');
  //           return null;
  //         }
  //         return { ...prev, timer: prev.timer - 1 };
  //       });
  //     }, 1000);
  //   }
  //   return () => {
  //     if (interval) clearInterval(interval);
  //   };
  // }, [reservationDetails?.timer]);
  useEffect(() => {
  let interval: NodeJS.Timeout | undefined; // Use optional type for clarity

  if (reservationDetails && reservationDetails.timer > 0) {
    // 1. Assign the interval ID to the 'interval' variable
    interval = setInterval(() => {
      // 2. Combine the state updates into a single interval tick

      // Update the main reservation timer
      setReservationDetails(prev => {
        if (!prev || prev.timer <= 1) {
          // Timer expired - perform all necessary reset actions
          setLockedSlotIds([]);
          setCurrentStep('slot-selection');
          return null; // Set reservationDetails to null
        }
        return { ...prev, timer: prev.timer - 1 };
      });
      
      // Update the separate repay timer (if it's meant to track the same countdown)
      setRepayTimer(prev => {
        // You only need to check the main timer (reservationDetails) for expiration
        // or ensure setRepayTimer's state is consistent with setReservationDetails
        // For simplicity, we'll assume it tracks the same count and only needs decrementing here.
        if (!prev || prev.timer <= 1) {
            // Note: The expiry logic will already have run in the setReservationDetails update.
            // Returning null/the reset state here would be redundant but harmless, 
            // *unless* setRepayTimer has its own unique expiration side effects.*
            // If the full expiry logic is *only* supposed to run once, 
            // you might remove the inner setLockedSlotIds/setCurrentStep calls from here.
            
            // Assuming repay timer just decrements until expiry
            return null; 
        }
        return { ...prev, timer: prev.timer - 1 };
      });

    }, 1000); // The single interval runs every 1000ms
  }

  // Cleanup function - clears the single interval
  return () => {
    if (interval) clearInterval(interval);
  };
}, [reservationDetails, setReservationDetails, setRepayTimer, setLockedSlotIds, setCurrentStep]); // 3. Updated dependencies

  // Validation functions
  const canProceedToStep = (step: BookingStep): boolean => {
    switch (step) {
      case "slot-selection":
        return tutor !== null;
      case "payment": {
        if (!tutor || !selectedDate) return false;
        if (
          !bookingPreferences.selectedSubject ||
          !bookingPreferences.selectedClassType
        )
          return false;
        if (tutor.languages.length > 1 && !bookingPreferences.selectedLanguage)
          return false;
        if (monthlyBookingData) return lockedSlotIds.length > 0; // monthly flow
        return lockedSlotIds.length === 1; // one-time flow
      }
      case "confirmation":
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
        case "tutor-selection":
          router.push("/dashboard/student/find-tutor");
          break;
        case "slot-selection":
          router.push("/dashboard/student/find-tutor/book/slots");
          break;
        case "payment":
          router.push("/dashboard/student/find-tutor/book/payment");
          break;
        case "confirmation":
          router.push("/dashboard/student/find-tutor/book/confirmation");
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
      console.log("Going back from payment, releasing slots if any.");
      console.log("Currently locked slots:", lockedSlotIds);
      const toRelease = lockedSlotIds.length > 0 ? lockedSlotIds : [];
      if (toRelease.length > 0) {
        console.log("Releasing locked slots:", toRelease);
        await bookingAPI.releaseSlots(toRelease);
      }
      setLockedSlotIds([]);
      // Clear reservation so UI resets cleanly
      setReservationDetails(null);
      setRepayTimer(null);
      // Clear any persisted one-time slot data

      setCurrentStep('slot-selection');
      if(payForNextMonthFlow){
        console.log("dashboard/student/pay-for-next-month")
        router.push('/dashboard/student/pay-for-next-month');
      }else{
                console.log("dashboard/student/find-tutor/book/slots")

        router.push('/dashboard/student/find-tutor/book/slots');
      }
      break;
    }
    case 'confirmation': {
      setCurrentStep('payment');
      router.push('/dashboard/student/find-tutor/book/payment');
      break;
    }
  };
}
  useEffect(() => {
    console.log("Locked slot IDs changed:", lockedSlotIds);
  }, [lockedSlotIds]);

  const resetBookingState = () => {
    setCurrentStep("tutor-selection");
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
    setRepayTimer(null);
    setBookingId(null);
    setMonthlyBookingData(null);
    setLockedSlotIds([]);
    setAvailabilitySlotsMap({});
    setNextMonthSlots(null);
    setSelectedClassId(null);
    setPayForNextMonthFlow(false);
  };

  const isBookingComplete =
    currentStep === "confirmation" && bookingId !== null;

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
    repayTimer,
    setRepayTimer,
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
    availabilitySlotsMap,
    setAvailabilitySlotsMap,
    nextMonthSlots,
    setNextMonthSlots,
    nextMonth,
    setNextMonth,
    nextYear,
    setNextYear,
    selectedClassId,
    setSelectedClassId,
    payForNextMonthFlow,
    setPayForNextMonthFlow,
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
    availabilitySlotsMap,
    nextMonthSlots,
    nextMonth,
    nextYear,
    selectedClassId,
  ]);


  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
