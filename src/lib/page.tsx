"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/BookingContext";
import { getBookingCache } from "@/utils/bookingCache";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Shield,
  Lock,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Calendar,
  Clock,
  User,
  ExternalLink,
} from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { bookingAPI } from "@/lib/api";

// PayHere payment object interface is declared in `src/types/payhere.d.ts`

export default function PayHerePaymentPage({
  params,
}: {
  params: { tutorId: string };
}) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { tutor, selectedDate, bookingPreferences, resetBookingState } =
    useBooking();

  // BookingContext no longer stores a single selectedSlot snapshot; fall back to local cache
  const bookingCache = typeof window !== "undefined" ? getBookingCache() : null;
  const selectedSlot = bookingCache?.selectedSlot ?? null;

  // For now, let's mock a timer. In a real app, this would come from the reservation API call.
  const [reservationTimer, setReservationTimer] = useState(900); // 15 minutes
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setReservationTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Redirect if essential data is missing
  useEffect(() => {
    if (
      !tutor ||
      !selectedSlot ||
      !selectedDate ||
      !bookingPreferences.finalPrice
    ) {
      router.replace(`/book/select-slot/${params.tutorId}`);
    }
  }, [
    tutor,
    selectedSlot,
    selectedDate,
    bookingPreferences,
    router,
    params.tutorId,
  ]);

  const onBack = () => router.back();

  const onPaymentSuccess = () => {
    console.log("Payment Success! Redirecting to dashboard...");
    resetBookingState();
    // You can redirect to a dedicated success page or the dashboard
    router.push("/dashboard/student/my-bookings?status=success");
  };

  const [isProcessing, setIsProcessing] = useState(false);
  const [payHereReady, setPayHereReady] = useState(false);

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

  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const { duration, totalAmount } = useMemo(() => {
    if (!selectedSlot) return { duration: 0, totalAmount: 0 };
    const dur = calculateDuration(selectedSlot.startTime, selectedSlot.endTime);
    const amount = bookingPreferences.finalPrice || selectedSlot.price || 0;
    return { duration: dur, totalAmount: amount };
  }, [selectedSlot, bookingPreferences.finalPrice]);

  if (!tutor || !selectedSlot || !selectedDate) {
    // This will be handled by the useEffect redirect, but it's good practice for type safety
    return <div>Loading booking details...</div>;
  }

  const onPaymentError = (error: string) => setPaymentError(error);
  {
    /* <script type="text/javascript" src="https://sandbox.payhere.lk/lib/payhere.js"></script> */
  }

  // Load PayHere script (single loader with retry)
  useEffect(() => {
    const existing = document.getElementById(
      "payhere-script",
    ) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).payhere) setPayHereReady(true);
      return;
    }

    const loadScript = (src: string, onFail?: () => void) => {
      const s = document.createElement("script");
      s.id = "payhere-script";
      s.src = src;
      s.async = true;
      s.onload = () => {
        console.log("PayHere script loaded successfully");
        setPayHereReady(true);
      };
      s.onerror = () => {
        console.error("Failed to load PayHere script");
        if (onFail) onFail();
        else {
          setPayHereReady(false);
          onPaymentError("Failed to load PayHere library. Please try again.");
        }
      };
      document.body.appendChild(s);
      return s;
    };

    // Try sandbox first, then fall back to production CDN if needed
    let appended: HTMLScriptElement | null = null;
    appended = loadScript("https://sandbox.payhere.lk/lib/payhere.js", () => {
      // Retry with production URL
      appended && appended.remove();
      appended = loadScript("https://www.payhere.lk/lib/payhere.js");
    });

    return () => {
      if (appended) appended.remove();
    };
  }, [onPaymentError]);
  // Setup PayHere callbacks
  useEffect(() => {
    if (typeof window !== "undefined" && window.payhere) {
      window.payhere.onCompleted = function onCompleted(orderId: string) {
        console.log("Payment completed. OrderID:" + orderId);
        onPaymentSuccess();
      };

      window.payhere.onDismissed = function onDismissed() {
        console.log("Payment dismissed");
        setIsProcessing(false);
      };

      window.payhere.onError = function onError(error: string) {
        console.log("Error:" + error);
        onPaymentError("Payment failed: " + error);
        setIsProcessing(false);
      };
    }
  }, [payHereReady, onPaymentSuccess, onPaymentError]);
  const handlePayHerePayment = async () => {
    if (!payHereReady || !window.payhere) {
      onPaymentError(
        "PayHere is not ready or library not loaded. Please try again.",
      );
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      if (!selectedSlot) {
        throw new Error("No selected slot available for payment");
      }

      const orderId = `EDIMY_${Date.now()}_${selectedSlot.slotId}`;
      const hashResponse = await bookingAPI.generatePayHereHash(
        orderId,
        totalAmount,
        "LKR",
      );

      if (
        !hashResponse ||
        !hashResponse.success ||
        !hashResponse.data ||
        !hashResponse.data.hash
      ) {
        throw new Error(
          (hashResponse && (hashResponse as any).error) ||
            "Failed to generate payment hash",
        );
      }

      const merchantId = hashResponse.data.merchantId;
      if (!merchantId) {
        throw new Error("Missing merchantId from payment initialization");
      }

      const payment = {
        sandbox: true,
        merchant_id: merchantId,
        return_url: `${window.location.origin}/payment/return`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `${window.location.origin}/api/payment/notify`,
        order_id: orderId,
        items: `${bookingPreferences.selectedSubject?.subjectName || "Tutoring"} Session - ${duration}h`,
        amount: totalAmount.toFixed(2),
        currency: "LKR",
        hash: hashResponse.data.hash,
        first_name: "Student",
        last_name: "User",
        email: "student@example.com",
        phone: "+94701234567",
        address: "Colombo",
        city: "Colombo",
        country: "Sri Lanka",
        delivery_address: "Colombo",
        delivery_city: "Colombo",
        delivery_country: "Sri Lanka",
        custom_1: JSON.stringify({
          tutorId: tutor.tutorProfileId,
          slotId: selectedSlot.slotId,
          language: bookingPreferences.selectedLanguage?.languageName,
          subject: bookingPreferences.selectedSubject?.subjectName,
          classType: bookingPreferences.selectedClassType?.name,
        }),
        custom_2: selectedDate.toISOString(),
      };

      // Debugging: Log payment object to ensure correctness
      console.log("Payment object:", payment);

      // Start PayHere payment
      window.payhere.startPayment(payment);
    } catch (error) {
      console.error("PayHere payment initialization failed:", error);
      onPaymentError(
        `Payment initialization failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {paymentError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      {/* Timer Alert */}
      {reservationTimer > 0 && (
        <Alert
          className={`border-2 ${
            reservationTimer <= 60
              ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
              : "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20"
          }`}
        >
          <Clock
            className={`h-4 w-4 ${reservationTimer <= 60 ? "text-red-600" : "text-orange-600"}`}
          />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">
              Slot reserved for{" "}
              <span
                className={`font-bold ${reservationTimer <= 60 ? "text-red-600" : "text-orange-600"}`}
              >
                {formatTimer(reservationTimer)}
              </span>
              . Complete payment to confirm booking.
            </span>
            <Badge
              variant={reservationTimer <= 60 ? "destructive" : "secondary"}
              className="text-xs"
            >
              {reservationTimer <= 60 ? "Hurry!" : "Reserved"}
            </Badge>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Summary */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <DollarSign className="h-5 w-5" />
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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

              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Date
                  </span>
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

              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Time
                  </span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {`${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`}
                  <span className="text-xs text-gray-500 ml-1">
                    ({duration}h)
                  </span>
                </span>
              </div>

              {bookingPreferences.selectedLanguage && (
                <div className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Language
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {bookingPreferences.selectedLanguage.languageName}
                  </span>
                </div>
              )}

              {bookingPreferences.selectedSubject && (
                <div className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Subject
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {bookingPreferences.selectedSubject.subjectName}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {formatPrice(
                        bookingPreferences.selectedSubject.hourlyRate,
                      )}
                      /hr
                    </div>
                  </div>
                </div>
              )}

              {bookingPreferences.selectedClassType && (
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-700">
                  <span className="text-sm text-green-600 dark:text-green-400">
                    Class Type
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {bookingPreferences.selectedClassType.name}
                    </div>
                    {bookingPreferences.selectedClassType.priceMultiplier <
                      1.0 && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        {Math.round(
                          (1 -
                            bookingPreferences.selectedClassType
                              .priceMultiplier) *
                            100,
                        )}
                        % discount applied
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between py-4 px-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg border border-green-200 dark:border-green-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Amount
                </span>
                <span className="text-3xl font-bold text-green-600">
                  {formatPrice(totalAmount)}
                </span>
              </div>
              <div className="text-center mt-2">
                <span className="text-xs text-gray-500">
                  For {duration} hour{duration !== 1 ? "s" : ""} session
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PayHere Payment Gateway */}
        <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Shield className="h-5 w-5 text-green-600" />
              PayHere Secure Checkout
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* PayHere Official Branding */}
            <div className="text-center py-8 border border-gray-200 dark:border-gray-700 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <div className="space-y-4">
                {/* PayHere Logo Recreation */}
                <div className="text-center">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg shadow-lg">
                    <div className="text-2xl font-bold tracking-tight">
                      PayHere
                    </div>
                    <div className="text-xs opacity-90">
                      Sri Lanka's Payment Gateway
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    Secure Payment Gateway
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Pay securely with credit/debit cards, mobile wallets, or
                    internet banking
                  </div>
                </div>

                {/* Payment Amount Display */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    You will pay
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    Rs. {totalAmount.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    ({formatPrice(totalAmount)} in your selected currency)
                  </div>
                </div>

                {/* Security Features */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1 justify-center">
                    <Lock className="h-3 w-3 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      SSL Secured
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      PCI Compliant
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Instant Confirmation
                    </span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Fraud Protection
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-300">
                    Payment Process:
                  </p>
                  <ol className="list-decimal list-inside text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                    <li>
                      Click "Pay Now with PayHere" to open the secure payment
                      gateway
                    </li>
                    <li>
                      Choose your preferred payment method (Card/Mobile/Bank)
                    </li>
                    <li>Complete payment on PayHere's secure platform</li>
                    <li>You'll be redirected back with confirmation</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Supported Payment Methods */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-center">
                Supported Payment Methods
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium">Credit Cards</div>
                  <div className="text-gray-500">Visa, Master, Amex</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium">Mobile</div>
                  <div className="text-gray-500">Dialog, Mobitel, Hutch</div>
                </div>
                <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="font-medium">Banking</div>
                  <div className="text-gray-500">BOC, Peoples, Sampath</div>
                </div>
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
          disabled={isProcessing}
          className="flex items-center gap-2 sm:w-auto w-full border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Booking
        </Button>
        <Button
          className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg text-white"
          onClick={handlePayHerePayment}
          disabled={isProcessing || reservationTimer === 0 || !payHereReady}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Opening PayHere...
            </>
          ) : (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              <div className="flex flex-col">
                <span>Pay Now with PayHere</span>
                <span className="text-sm font-normal opacity-90">
                  Rs. {totalAmount.toFixed(2)} • Secure Gateway
                </span>
              </div>
            </div>
          )}
        </Button>
      </div>

      {/* Expired Alert */}
      {reservationTimer === 0 && (
        <Alert
          variant="destructive"
          className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            Your slot reservation has expired. Please go back and select a new
            slot.
          </AlertDescription>
        </Alert>
      )}

      {/* PayHere Loading State */}
      {!payHereReady && (
        <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Loading PayHere payment gateway...
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
