// "use client";

// import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
// import { Tutor, TimeSlot, BookingPreferences } from '@/types';

// interface ReservationDetails {
//   reservationId: string;
//   expiresAt: string;
// }

// interface BookingContextType {
//   tutor: Tutor | null;
//   setTutor: (tutor: Tutor | null) => void;
//   selectedDate: Date | null;
//   setSelectedDate: (date: Date | null) => void;
//   selectedSlot: TimeSlot | null;
//   setSelectedSlot: (slot: TimeSlot | null) => void;
//   bookingPreferences: BookingPreferences;
//   setBookingPreferences: (prefs: BookingPreferences) => void;
//   reservationDetails: ReservationDetails | null;
//   setReservationDetails: (details: ReservationDetails | null) => void;
//   resetBookingState: () => void;
// }

// const BookingContext = createContext<BookingContextType | undefined>(undefined);

// export const BookingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [tutor, setTutor] = useState<Tutor | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
//   const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
//   const [bookingPreferences, setBookingPreferences] = useState<BookingPreferences>({
//     selectedSubject: null,
//     selectedLanguage: null,
//     selectedClassType: null,
//     finalPrice: 0,
//   });
//   const [reservationDetails, setReservationDetails] = useState<ReservationDetails | null>(null);

//   const resetBookingState = () => {
//     setTutor(null);
//     setSelectedDate(new Date());
//     setSelectedSlot(null);
//     setBookingPreferences({
//       selectedSubject: null,
//       selectedLanguage: null,
//       selectedClassType: null,
//       finalPrice: 0,
//     });
//     setReservationDetails(null);
//   };

//   const value = useMemo(() => ({
//     tutor,
//     setTutor,
//     selectedDate,
//     setSelectedDate,
//     selectedSlot,
//     setSelectedSlot,
//     bookingPreferences,
//     setBookingPreferences,
//     reservationDetails,
//     setReservationDetails,
//     resetBookingState,
//   }), [tutor, selectedDate, selectedSlot, bookingPreferences, reservationDetails]);

//   return (
//     <BookingContext.Provider value={value}>
//       {children}
//     </BookingContext.Provider>
//   );
// };

// export const useBooking = (): BookingContextType => {
//   const context = useContext(BookingContext);
//   if (context === undefined) {
//     throw new Error('useBooking must be used within a BookingProvider');
//   }
//   return context;
// };