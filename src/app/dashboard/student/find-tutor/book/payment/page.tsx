"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { BookingProgress } from "@/components/ui/booking-progress";
import { TutorInfoCard } from "@/components/ui/tutor-info-card";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { 
  ArrowLeft, 
  AlertCircle, 
  Timer,
  CheckCircle,
  Clock,
  Calendar,
  User,
  CreditCard,
  Shield,
  DollarSign,
  BookOpen,
  Users,
  Globe
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { PayHerePayment } from "../../PayHerePayment";
import { Slot } from "@radix-ui/react-slot";

export default function BookingPaymentPage() {
  const router = useRouter();
  const {
    tutor,
    selectedDate,
  // selectedSlot removed from context model
    bookingPreferences,
    reservationDetails,
    goBack,
    setCurrentStep,
    setBookingId,
    currentStep,
    monthlyBookingData,
    lockedSlotIds,
  } = useBooking();

  const { formatPrice, selectedCurrency } = useCurrency();
  const [error, setError] = useState("");
  const [realTimeTimer, setRealTimeTimer] = useState<number>(0);

  const isMonthly = bookingPreferences?.selectedClassType?.id === 2;
  const [oneTimeSlotDetail, setOneTimeSlotDetail] = useState<any | null>(null);

  // Load one-time slot detail from sessionStorage if not monthly
  useEffect(() => {
    if (!isMonthly) {
      try {
        const raw = sessionStorage.getItem('oneTimeSlotDetail');
        if (raw) setOneTimeSlotDetail(JSON.parse(raw));
      } catch {}
    }
  }, [isMonthly]);

  // Validation: redirect only if required data is missing for the active mode
  useEffect(() => {
    if (
      !tutor ||
      !bookingPreferences?.selectedSubject ||
      !bookingPreferences?.selectedClassType

    ) {
      console.log("Payment validation failed, redirecting to find-tutor");
      router.push("/dashboard/student/find-tutor");
      return;
    }
    setCurrentStep('payment');
  }, [tutor, oneTimeSlotDetail, bookingPreferences, isMonthly, router, setCurrentStep]);

  // Real-time timer effect based on reservationDetails.expiresAt
  useEffect(() => {
    if (!reservationDetails?.expiresAt) return;
    
    const updateTimer = () => {
      const secs = Math.max(
        0,
        Math.floor((new Date(reservationDetails.expiresAt).getTime() - Date.now()) / 1000)
      );
      setRealTimeTimer(secs);
    };

    // Update immediately
    updateTimer();
    
    // Then update every second
    const id = setInterval(updateTimer, 1000);
    
    return () => clearInterval(id);
  }, [reservationDetails?.expiresAt]);

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
 const handleBack = async () => {
   // We now rely on context's lockedSlotIds; Payment back should release ALL reserved slots (single or multiple).
   console.log('Going back from payment. Locked slots:', lockedSlotIds);
   await goBack(); // context will pick up lockedSlotIds and bulk release
 };
  const calculateSlotHours = () => {
    if (!oneTimeSlotDetail) return 0;
    const start = new Date(`2000-01-01T${oneTimeSlotDetail.startTime}`);
    const end = new Date(`2000-01-01T${oneTimeSlotDetail.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const handlePaymentSuccess = (bookingIdFromAPI?: number) => {
    const bookingId = bookingIdFromAPI ? String(bookingIdFromAPI) : `BK${Date.now()}`;
    setBookingId(bookingId);
    router.push('/dashboard/student/find-tutor/book/confirmation');
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleCancel = () => {
    router.push('/dashboard/student/find-tutor');
  };

  // Loading state - check for required data based on booking mode
  if (
  !tutor ||
  !bookingPreferences?.selectedSubject ||
  !bookingPreferences?.selectedClassType 
 
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 animate-pulse">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // If reservation has expired (only for single bookings), show expired state
  if (!isMonthly && reservationDetails && realTimeTimer === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <BookingProgress currentStep={currentStep} />
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Slot reservation has expired!</span>
              <span className="text-sm block mt-1">Please return to slot selection to book a new time.</span>
            </AlertDescription>
          </Alert>
          <div className="text-center">
            <Button onClick={() => router.push('/dashboard/student/find-tutor')} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Slot Selection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const slotHours = calculateSlotHours();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress Bar */}
      <BookingProgress currentStep={currentStep} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header with Back Button and Currency Selector */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Slot Selection
          </Button>
          <CurrencySelector />
        </div>

        {/* Tutor Info Card */}
        <div className="animate-in fade-in-50 duration-500">
          <TutorInfoCard tutor={tutor} />
        </div>

        {/* Timer Alert */}
        {reservationDetails && realTimeTimer > 0 && (
          <Alert className="animate-in slide-in-from-top-2 duration-300 border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
            <Timer className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-300 text-sm leading-relaxed">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-orange-700 dark:text-orange-300">Complete payment within 15 minutes</div>
                  <p className="text-xs sm:text-[13px]">
                    Your selected slot{lockedSlotIds.length > 1 ? 's are' : ' is'} reserved for <span className="font-bold">{formatTimer(realTimeTimer)}</span>. After the timer expires the reservation will be automatically released and the slot may taken by another student.
                  </p>
                  <p className="text-[11px] opacity-80">
                    If a payment attempt is made right at the end and the booking cannot be confirmed, any captured amount may refunded within 2–10 business days.
                  </p>
                </div>
                <Badge variant="secondary" className="whitespace-nowrap text-xs bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-200">
                  {formatTimer(realTimeTimer)} LEFT
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Timer Expired Alert */}
        {reservationDetails && realTimeTimer === 0 && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Slot reservation has expired!</span>
              <span className="text-sm block mt-1">Please select a new slot to continue booking.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Booking Summary */}
          <div className="space-y-4">
            <Card className="animate-in slide-in-from-left-4 duration-500 delay-100">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isMonthly ? (
                  /* Monthly Booking Summary */
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Range</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {monthlyBookingData!.startDate} → {monthlyBookingData!.endDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Total Slots</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {monthlyBookingData!.totalSlots}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single Booking Date & Time */
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Date</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {selectedDate?.toLocaleDateString("en-US", {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {oneTimeSlotDetail ? `${formatTime(oneTimeSlotDetail.startTime)} - ${formatTime(oneTimeSlotDetail.endTime)}` : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Booking Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Tutor</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {tutor.firstName} {tutor.lastName}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Subject</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bookingPreferences.selectedSubject?.subjectName}
                    </span>
                  </div>

                  {bookingPreferences.selectedLanguage && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Language</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bookingPreferences.selectedLanguage?.languageName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Class Type</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bookingPreferences.selectedClassType?.name}
                      </span>
                      {bookingPreferences.selectedClassType?.priceMultiplier && bookingPreferences.selectedClassType.priceMultiplier < 1.0 && (
                        <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {Math.round((1 - bookingPreferences.selectedClassType.priceMultiplier) * 100)}% OFF
                        </Badge>
                      )}
                    </div>
                  </div>

                  {!isMonthly && (
                    <div className="flex justify-between items-center py-2">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {slotHours} hour{slotHours !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                  {isMonthly ? (
                    /* Monthly pricing */
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Slots</span>
                        <span>{monthlyBookingData!.totalSlots}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                        <span>{formatPrice(bookingPreferences.selectedSubject?.hourlyRate || 0)}/hr</span>
                      </div>
                    </>
                  ) : (
                    /* Single pricing */
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                        <span>{formatPrice(bookingPreferences.selectedSubject?.hourlyRate || 0)}/hr</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Duration</span>
                        <span>{slotHours} hour{slotHours !== 1 ? 's' : ''}</span>
                      </div>
                      {bookingPreferences.selectedClassType?.priceMultiplier && bookingPreferences.selectedClassType.priceMultiplier !== 1.0 && (
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                          <span>Class Type Discount</span>
                          <span>-{Math.round((1 - bookingPreferences.selectedClassType.priceMultiplier) * 100)}%</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">
                          {formatPrice(isMonthly ? (monthlyBookingData?.totalCost || bookingPreferences.finalPrice) : bookingPreferences.finalPrice)}
                        </span>
                        {selectedCurrency.code !== 'LKR' && (
                          <div className="text-xs text-gray-500">
                            ≈ Rs. {(isMonthly ? (monthlyBookingData?.totalCost || bookingPreferences.finalPrice) : bookingPreferences.finalPrice).toFixed(2)} LKR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Section */}
          <Card className="animate-in slide-in-from-right-4 duration-500 delay-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-300">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Your payment is secured by PayHere. We don't store your card details.
                </p>
              </div>

              <PayHerePayment
                tutor={tutor}
                selectedDate={selectedDate!}
                lockedSlotIds={lockedSlotIds}
                selectedSlot={isMonthly ? undefined : oneTimeSlotDetail ? {
                  slotId: oneTimeSlotDetail.slotId,
                  startTime: oneTimeSlotDetail.startTime,
                  endTime: oneTimeSlotDetail.endTime,
                  price: oneTimeSlotDetail.price,
                  hourlyRate: oneTimeSlotDetail.price,
                } as any : undefined}
                bookingPreferences={bookingPreferences}
                reservationTimer={realTimeTimer}
                monthlyBookingData={isMonthly ? monthlyBookingData! : undefined}
                onBack={handleBack}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onCancel={handleCancel}
              />
            </CardContent>
          </Card>
        </div>

        {/* Bottom Action Bar */}

      </div>
    </div>
  );
}