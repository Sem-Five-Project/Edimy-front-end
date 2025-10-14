// "use client";
// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Calendar } from "@/components/ui/calendar";
// import { Card, CardContent } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   CalendarDays,
//   Clock,
//   Star,
//   CreditCard,
//   Loader2,
//   AlertCircle,
//   CheckCircle,
//   Timer,
// } from "lucide-react";
// import { tutorAPI, bookingAPI } from "@/lib/api";
// import { Tutor, TimeSlot } from "@/types";

// interface TutorBookingModalProps {
//   tutor: Tutor;
//   onClose: () => void;
// }

// /** 🔹 Reusable Tutor Header */
// const TutorHeader: React.FC<{ tutor: Tutor }> = ({ tutor }) => (
//   <div className="text-center">
//     <Avatar className="h-20 w-20 mx-auto mb-4">
//       <AvatarImage src={tutor.profileImage} />
//       <AvatarFallback>
//         {tutor.firstName[0]}
//         {tutor.lastName[0]}
//       </AvatarFallback>
//     </Avatar>
//     <h3 className="text-xl font-semibold">
//       {tutor.firstName} {tutor.lastName}
//     </h3>
//     <div className="flex items-center justify-center space-x-1 mt-2">
//       {Array.from({ length: 5 }, (_, i) => (
//         <Star
//           key={i}
//           className={`h-4 w-4 ${
//             i < Math.floor(tutor.rating)
//               ? "fill-yellow-400 text-yellow-400"
//               : "text-gray-300"
//           }`}
//         />
//       ))}
//       <span className="text-sm text-muted-foreground ml-2">
//         ({tutor.rating.toFixed(1)})
//       </span>
//     </div>
//     <p className="text-2xl font-bold text-primary mt-2">
//       ${tutor.hourlyRate}/hour
//     </p>
//   </div>
// );

// /** 🔹 Slot Selection Step */
// const SlotSelection: React.FC<{
//   tutor: Tutor;
//   selectedDate: Date;
//   setSelectedDate: (d: Date) => void;
//   availableSlots: TimeSlot[];
//   isLoadingSlots: boolean;
//   onSelectSlot: (slot: TimeSlot) => void;
// }> = ({
//   tutor,
//   selectedDate,
//   setSelectedDate,
//   availableSlots,
//   isLoadingSlots,
//   onSelectSlot,
// }) => {
//   const formatTime = (time: string) =>
//     new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });

//   return (
//     <div className="space-y-6">
//       <TutorHeader tutor={tutor} />

//       <div className="grid md:grid-cols-2 gap-6">
//         <div>
//           <h4 className="font-medium mb-3">Select Date</h4>
//           <Calendar
//             mode="single"
//             selected={selectedDate}
//             onSelect={(date) => date && setSelectedDate(date)}
//             disabled={(date) =>
//               date < new Date() ||
//               date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
//             }
//             className="rounded-md border"
//           />
//         </div>

//         <div>
//           <h4 className="font-medium mb-3">Available Times</h4>
//           {isLoadingSlots ? (
//             <div className="flex items-center justify-center py-8">
//               <Loader2 className="h-6 w-6 animate-spin" />
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
//               {availableSlots.map((slot) => (
//                 <Button
//                   key={slot.id}
//                   variant={slot.status === "available" ? "outline" : "secondary"}
//                   size="sm"
//                   disabled={slot.status !== "available"}
//                   onClick={() => onSelectSlot(slot)}
//                   className={`text-xs p-2 h-auto ${
//                     slot.status === "booked"
//                       ? "opacity-50 cursor-not-allowed"
//                       : ""
//                   }`}
//                 >
//                   <div className="text-center">
//                     <div>{formatTime(slot.startTime)}</div>
//                     <div>{formatTime(slot.endTime)}</div>
//                     {slot.status === "booked" && (
//                       <Badge variant="destructive" className="text-xs mt-1">
//                         Booked
//                       </Badge>
//                     )}
//                   </div>
//                 </Button>
//               ))}
//             </div>
//           )}

//           {!isLoadingSlots && availableSlots.length === 0 && (
//             <div className="text-center py-8 text-muted-foreground">
//               <CalendarDays className="h-8 w-8 mx-auto mb-2" />
//               <p>No slots available for this date</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /** 🔹 Payment Step */
// const PaymentStep: React.FC<{
//   tutor: Tutor;
//   selectedDate: Date;
//   selectedSlot: TimeSlot;
//   reservationTimer: number;
//   isBooking: boolean;
//   onBack: () => void;
//   onPay: () => void;
// }> = ({
//   tutor,
//   selectedDate,
//   selectedSlot,
//   reservationTimer,
//   isBooking,
//   onBack,
//   onPay,
// }) => {
//   const formatTime = (time: string) =>
//     new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });
//   const formatTimer = (s: number) =>
//     `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

//   return (
//     <div className="space-y-6">
//       {reservationTimer > 0 && (
//         <Alert>
//           <Timer className="h-4 w-4" />
//           <AlertDescription>
//             Slot reserved for {formatTimer(reservationTimer)}. Complete payment
//             to confirm booking.
//           </AlertDescription>
//         </Alert>
//       )}

//       <Card>
//         <CardContent className="p-6">
//           <h3 className="font-semibold mb-4">Booking Summary</h3>
//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span>Tutor:</span>
//               <span className="font-medium">
//                 {tutor.firstName} {tutor.lastName}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Date:</span>
//               <span className="font-medium">
//                 {selectedDate.toLocaleDateString("en-US", {
//                   weekday: "long",
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Time:</span>
//               <span className="font-medium">
//                 {`${formatTime(selectedSlot.startTime)} - ${formatTime(
//                   selectedSlot.endTime
//                 )}`}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Duration:</span>
//               <span className="font-medium">2 hours</span>
//             </div>
//             <hr />
//             <div className="flex justify-between text-lg font-semibold">
//               <span>Total:</span>
//               <span>${selectedSlot.price}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="flex space-x-4">
//         <Button variant="outline" onClick={onBack} disabled={isBooking}>
//           Back
//         </Button>
//         <Button
//           className="flex-1"
//           onClick={onPay}
//           disabled={isBooking || reservationTimer === 0}
//         >
//           {isBooking ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               Processing Payment...
//             </>
//           ) : (
//             <>
//               <CreditCard className="mr-2 h-4 w-4" />
//               Pay ${selectedSlot.price}
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   );
// };

// /** 🔹 Confirmation Step */
// const ConfirmationStep: React.FC<{
//   tutor: Tutor;
//   selectedDate: Date;
//   selectedSlot: TimeSlot;
//   onClose: () => void;
// }> = ({ tutor, selectedDate, selectedSlot, onClose }) => {
//   const formatTime = (time: string) =>
//     new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//       hour12: true,
//     });

//   return (
//     <div className="text-center space-y-6">
//       <div className="flex justify-center">
//         <CheckCircle className="h-16 w-16 text-green-500" />
//       </div>
//       <div>
//         <h3 className="text-2xl font-semibold text-green-600 mb-2">
//           Booking Confirmed!
//         </h3>
//         <p className="text-muted-foreground">
//           Your class with {tutor.firstName} {tutor.lastName} has been
//           successfully booked.
//         </p>
//       </div>

//       <Card>
//         <CardContent className="p-6">
//           <h4 className="font-semibold mb-4">Class Details</h4>
//           <div className="space-y-2 text-left">
//             <div className="flex justify-between">
//               <span>Tutor:</span>
//               <span className="font-medium">
//                 {tutor.firstName} {tutor.lastName}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Date:</span>
//               <span className="font-medium">
//                 {selectedDate.toLocaleDateString("en-US", {
//                   weekday: "long",
//                   month: "long",
//                   day: "numeric",
//                 })}
//               </span>
//             </div>
//             <div className="flex justify-between">
//               <span>Time:</span>
//               <span className="font-medium">
//                 {`${formatTime(selectedSlot.startTime)} - ${formatTime(
//                   selectedSlot.endTime
//                 )}`}
//               </span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <div className="space-y-3">
//         <p className="text-sm text-muted-foreground">
//           You will receive a confirmation email shortly. The tutor has been
//           notified about your booking.
//         </p>
//         <Button onClick={onClose} className="w-full">
//           Done
//         </Button>
//       </div>
//     </div>
//   );
// };

// /** 🔹 Main Booking Modal */
// export const TutorBookingModal: React.FC<TutorBookingModalProps> = ({
//   tutor,
//   onClose,
// }) => {
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date());
//   const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
//   const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
//   const [isLoadingSlots, setIsLoadingSlots] = useState(false);
//   const [isBooking, setIsBooking] = useState(false);
//   const [bookingStep, setBookingStep] = useState<
//     "slots" | "payment" | "confirmation"
//   >("slots");
//   const [error, setError] = useState("");
//   const [reservationTimer, setReservationTimer] = useState(0);

//   useEffect(() => {
//     if (selectedDate) loadAvailableSlots(selectedDate);
//   }, [selectedDate, tutor.id]);

//   useEffect(() => {
//     let interval: NodeJS.Timeout;
//     if (reservationTimer > 0) {
//       interval = setInterval(() => {
//         setReservationTimer((prev) => {
//           if (prev <= 1) {
//             handleSlotTimeout();
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(interval);
//   }, [reservationTimer]);

//   const loadAvailableSlots = async (date: Date) => {
//     setIsLoadingSlots(true);
//     setError("");
//     try {
//       const dateString = date.toISOString().split("T")[0];
//       const response = await tutorAPI.getTutorSlots(tutor.id, dateString);
//       if (response.success) setAvailableSlots(response.data);
//       else setError("Failed to load available slots");
//     } catch {
//       setError("Failed to load available slots");
//     } finally {
//       setIsLoadingSlots(false);
//     }
//   };

//   const handleSlotSelection = (slot: TimeSlot) => {
//     if (slot.status !== "available") return;
//     setSelectedSlot(slot);
//     setBookingStep("payment");
//     setReservationTimer(300);
//   };

//   const handleSlotTimeout = () => {
//     setSelectedSlot(null);
//     setBookingStep("slots");
//     setError("Slot reservation expired. Please select a new slot.");
//   };

//   const handlePayment = async () => {
//     if (!selectedSlot) return;
//     setIsBooking(true);
//     setError("");
//     try {
//       const response = await bookingAPI.processPayment("mock-booking-id", {
//         slotId: selectedSlot.id,
//         amount: selectedSlot.price,
//       });
//       if (response.success) {
//         setBookingStep("confirmation");
//         setReservationTimer(0);
//       } else setError("Payment failed. Please try again.");
//     } catch (e: unknown) {
//       setError(
//         e instanceof Error ? e.message : "Booking failed. Please try again."
//       );
//     } finally {
//       setIsBooking(false);
//     }
//   };

//   return (
//     <Dialog open onOpenChange={onClose}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {bookingStep === "slots" && "Select Time Slot"}
//             {bookingStep === "payment" && "Payment"}
//             {bookingStep === "confirmation" && "Booking Confirmed"}
//           </DialogTitle>
//         </DialogHeader>

//         {error && (
//           <Alert variant="destructive">
//             <AlertCircle className="h-4 w-4" />
//             <AlertDescription>{error}</AlertDescription>
//           </Alert>
//         )}

//         {bookingStep === "slots" && (
//           <SlotSelection
//             tutor={tutor}
//             selectedDate={selectedDate}
//             setSelectedDate={setSelectedDate}
//             availableSlots={availableSlots}
//             isLoadingSlots={isLoadingSlots}
//             onSelectSlot={handleSlotSelection}
//           />
//         )}
//         {bookingStep === "payment" &&
//           selectedSlot && (
//             <PaymentStep
//               tutor={tutor}
//               selectedDate={selectedDate}
//               selectedSlot={selectedSlot}
//               reservationTimer={reservationTimer}
//               isBooking={isBooking}
//               onBack={() => setBookingStep("slots")}
//               onPay={handlePayment}
//             />
//           )}
//         {bookingStep === "confirmation" &&
//           selectedSlot && (
//             <ConfirmationStep
//               tutor={tutor}
//               selectedDate={selectedDate}
//               selectedSlot={selectedSlot}
//               onClose={onClose}
//             />
//           )}
//       </DialogContent>
//     </Dialog>
//   );
// };"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { tutorAPI, bookingAPI } from "@/lib/api";
import { Tutor, TimeSlot, BookingPreferences } from "@/types";
import { SlotSelection } from "./SlotSelection";
import { PayHerePayment } from "./PayHerePayment";
import { ConfirmationStep } from "./ConfirmationStep";

interface TutorBookingModalProps {
  tutor: Tutor;
  onClose: () => void;
}

type BookingStep = "slots" | "payment" | "confirmation";

export const TutorBookingModal: React.FC<TutorBookingModalProps> = ({
  tutor,
  onClose,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStep, setBookingStep] = useState<BookingStep>("slots");
  const [error, setError] = useState("");
  const [reservationTimer, setReservationTimer] = useState(0);
  const [bookingPreferences, setBookingPreferences] =
    useState<BookingPreferences | null>(null);

  // Load available slots when date or tutor changes
  useEffect(() => {
    console.log("here 1", selectedDate);
    if (selectedDate) {
      console.log("here 2", selectedDate);
      loadAvailableSlots(selectedDate);
    }
  }, [selectedDate, tutor.id]);

  // Handle reservation timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (reservationTimer > 0) {
      interval = setInterval(() => {
        setReservationTimer((prev) => {
          if (prev <= 1) {
            handleSlotTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [reservationTimer]);

  const loadAvailableSlots = async (date: Date) => {
    console.log("Loading slots for date:", date);
    setIsLoadingSlots(true);
    setError("");
    try {
      const dateString = date.toISOString().split("T")[0];
      console.log("Loading slots for tutor:", tutor);
      const response = await tutorAPI.getTutorSlots(
        tutor.id.toString(),
        dateString,
      );
      console.log("Response from API:", response);
      if (response.success) {
        console.log("Available slots:", response.data);
        setAvailableSlots(response.data);
      } else {
        setError("Failed to load available slots. Please try again.");
      }
    } catch (err) {
      console.error("Error loading slots:", err);
      setError("Failed to load available slots. Please try again.");
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSlotSelection = (
    slot: TimeSlot,
    preferences: BookingPreferences,
  ) => {
    if (slot.status !== "AVAILABLE") return;

    // Map slotId to id for compatibility with existing components
    const mappedSlot: TimeSlot = {
      ...slot,
      id: slot.slotId?.toString() || slot.id,
      price: preferences.finalPrice || slot.hourlyRate || slot.price || 0,
    };

    setSelectedSlot(mappedSlot);
    setBookingPreferences(preferences);
    setBookingStep("payment");
    setReservationTimer(300); // 5 minutes reservation
    setError("");
  };

  const handleSlotTimeout = () => {
    setSelectedSlot(null);
    setBookingStep("slots");
    setError("Slot reservation expired. Please select a new slot.");
  };

  const handlePaymentSuccess = () => {
    setBookingStep("confirmation");
    setReservationTimer(0);
    setError("");
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleBackToSlots = () => {
    setBookingStep("slots");
    setSelectedSlot(null);
    setReservationTimer(0);
    setError("");
  };

  const handleCancel = () => {
    setBookingStep("slots");
    setSelectedSlot(null);
    setReservationTimer(0);
    setError("");
  };

  const getDialogTitle = () => {
    switch (bookingStep) {
      case "slots":
        return "Select Time Slot";
      case "payment":
        return "Complete Payment";
      case "confirmation":
        return "Booking Confirmed";
      default:
        return "Book a Session";
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {getDialogTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {bookingStep === "slots" && (
            <SlotSelection
              tutor={tutor}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              availableSlots={availableSlots}
              isLoadingSlots={isLoadingSlots}
              onSelectSlot={handleSlotSelection}
            />
          )}
          {bookingStep === "payment" && selectedSlot && bookingPreferences && (
            <PayHerePayment
              tutor={tutor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              bookingPreferences={bookingPreferences}
              reservationTimer={reservationTimer}
              onBack={handleBackToSlots}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
              lockedSlotIds={[selectedSlot.slotId]} // Add the current slot ID to lockedSlotIds
            />
          )}
          {/* 
          {bookingStep === "payment" && selectedSlot && bookingPreferences && (
            <PaymentStep
              tutor={tutor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              bookingPreferences={bookingPreferences}
              reservationTimer={reservationTimer}
              isBooking={isBooking}
              onBack={handleBackToSlots}
              onPay={handlePayment}
            />
          )} */}

          {bookingStep === "confirmation" &&
            selectedSlot &&
            bookingPreferences && (
              <ConfirmationStep
                tutor={tutor}
                selectedDate={selectedDate}
                selectedSlot={selectedSlot}
                onClose={onClose}
                bookingPreferences={bookingPreferences}
              />
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
