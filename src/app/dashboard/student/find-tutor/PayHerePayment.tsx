"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Sparkles,
  Zap,
  Star,
  Crown,
} from "lucide-react";
import {
  Tutor,
  TimeSlot,
  BookingPreferences,
  InitPayHerePendingRes,
  ValidatePayHereWindowRes,
  MonthlyClassBooking,
} from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useBooking } from "@/contexts/BookingContext";
import { bookingAPI } from "@/lib/api";
import { saveBookingCache, clearBookingCache } from "@/utils/bookingCache";
import { useRouter } from "next/navigation";
// import { MonthlyBookingData } from "@/contexts/BookingContext";

interface PayHerePaymentProps {
  tutor: Tutor;
  selectedDate: Date;
  selectedSlot?: TimeSlot; // Optional for monthly bookings
  bookingPreferences: BookingPreferences;
  reservationTimer: number;
  monthlyBookingData?: MonthlyClassBooking; // Optional monthly booking data
  onBack: () => void;
  onPaymentSuccess: (bookingId?: number) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
  lockedSlotIds: number[]; // Array of locked slot IDs for this booking
  availabilitySlotsMap?: Record<string, number[]>; // availability_id -> [slotIds]
}
export const PayHerePayment: React.FC<PayHerePaymentProps> = ({
  tutor,
  selectedDate,
  lockedSlotIds,
  availabilitySlotsMap,
  selectedSlot,
  bookingPreferences,
  reservationTimer,
  monthlyBookingData,
  onBack,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const { user, effectiveStudentId } = useAuth();
  const { nextMonthSlots, selectedClassId, nextMonth: ctxNextMonth, nextYear: ctxNextYear } = useBooking();
  const [isProcessing, setIsProcessing] = useState(false);
  const [payHereReady, setPayHereReady] = useState(false);
  const [orderMeta, setOrderMeta] = useState<InitPayHerePendingRes | null>(
    null,
  );
  // Removed separate internal payment window timer; we now rely solely on parent reservationTimer
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [showFreshSessionMessage, setShowFreshSessionMessage] = useState(false);
  const paymentInitRef = useRef(false); // Additional ref-based tracking

  // Prefer explicit studentId from backend; fall back to legacy user.id if numeric
  const studentIdNum =
    effectiveStudentId !== null &&
    effectiveStudentId !== undefined &&
    !isNaN(Number(effectiveStudentId))
      ? Number(effectiveStudentId)
      : user && !isNaN(Number(user.id))
        ? Number(user.id)
        : undefined;
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

  // Determine if this is monthly booking
  const isMonthly = bookingPreferences.selectedClassType?.id === 2;

  // For single: calculate duration; for monthly: use slot count
  const duration =
    !isMonthly && selectedSlot
      ? calculateDuration(selectedSlot.startTime, selectedSlot.endTime)
      : 0;

  // Total amount: prefer monthly cost if available, else finalPrice, else slot price
  const totalAmount =
    isMonthly && monthlyBookingData
      ? monthlyBookingData.totalCost
      : bookingPreferences.finalPrice || selectedSlot?.price || 0;

  // Save booking data to cache on mount and reset payment state for fresh session
  useEffect(() => {
    // Only save cache for single bookings (monthly doesn't need slot cache)
    if (selectedSlot) {
      saveBookingCache(
        tutor.tutorProfileId || parseInt(String(tutor.id), 10),
        selectedDate,
        selectedSlot,
        bookingPreferences,
      );
    }
    
    // Log next month data from context if available (for monthly bookings)
    if (isMonthly && nextMonthSlots && nextMonthSlots.length > 0) {
      console.log("Next month slots loaded from context:", nextMonthSlots);
    }
    
    // Reset payment initiation state when coming to payment page
    // This ensures a fresh 15-minute timer every time
    console.log(
      "Payment page mounted - resetting payment state for fresh session",
    );
    setPaymentInitiated(false);
    paymentInitRef.current = false; // Reset ref flag
    setOrderMeta(null);
  }, [tutor, selectedDate, selectedSlot, bookingPreferences, isMonthly, nextMonthSlots]);

  // No separate internal timer effect anymore; parent component handles reservation countdown.
  // Initiate payment pending when PayHere loads - using useCallback to prevent recreation
  const initiatePaymentPendingFunction = useCallback(async () => {
    // Multiple layers of protection against duplicate calls

    // Only prevent if already completed successfully
    if (paymentInitiated && orderMeta) {
      console.log("Payment already initiated and active, skipping...");
      return;
    }

    if (!studentIdNum) {
      console.log("Missing student ID, cannot initiate payment");
      onPaymentError("Student ID not found. Please login again.");
      return;
    }

    // Check if we already have a recent payment session for this slot

    console.log("Initiating fresh payment session with 15-minute timer");
    paymentInitRef.current = true; // Set ref flag

    try {
      // const slotRef = isMonthly
      //   ? `MONTHLY-${monthlyBookingData?.id || Date.now()}`
      //   : selectedSlot?.slotId || Date.now();

      const actualPayload = {
        orderId: `EDIMY-${Date.now()}`, // Unique order ID with slot/monthly reference
        studentId: studentIdNum,
        amount: Number(totalAmount), // Ensure it's a number
        currency: "LKR",
        gateway: "PAYHERE" as const,
      };

      const response = await bookingAPI.initiatePaymentPending(actualPayload);
      if (response.success) {
        setPaymentInitiated(true);
        // Fix: Map backend snake_case to frontend camelCase
        const mappedData = {
          orderId: response.data.order_id || response.data.orderId,
          paymentId: response.data.payment_id || response.data.paymentId,
          expiresAt: response.data.expires_at || response.data.expiresAt, // Map snake_case to camelCase
          status: response.data.status,
        };

        setOrderMeta(mappedData);
        console.log(
          "Fresh payment session initiated successfully:",
          mappedData,
        );
        console.log(
          "Timer will expire at:",
          mappedData.expiresAt
            ? new Date(mappedData.expiresAt).toLocaleString()
            : "No expiry time",
        );

        // Show fresh session message
        setShowFreshSessionMessage(true);
        setTimeout(() => setShowFreshSessionMessage(false), 3000); // Hide after 3 seconds
      } else {
        setPaymentInitiated(false); // Reset on failure so it can be retried
        onPaymentError(response.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setPaymentInitiated(false); // Reset on error so it can be retried
      onPaymentError("Failed to initiate payment. Please try again.");
    }
  }, [
    studentIdNum,
    totalAmount,
    paymentInitiated,
    orderMeta,
    isMonthly,
    monthlyBookingData,
    selectedSlot,
    onPaymentError,
  ]);

  // Load PayHere script and initiate payment pending
  useEffect(() => {
    const existing = document.getElementById(
      "payhere-script",
    ) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).payhere) {
        console.log("PayHere script already exists and ready");
        setPayHereReady(true);
      }
      return;
    }

    console.log("Loading PayHere script for the first time");
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

    let appended: HTMLScriptElement | null = null;
    appended = loadScript("https://sandbox.payhere.lk/lib/payhere.js", () => {
      appended && appended.remove();
      appended = loadScript("https://www.payhere.lk/lib/payhere.js");
    });

    return () => {
      if (appended) appended.remove();
    };
  }, []); // Empty dependency array

  // Separate effect to handle payment initiation when PayHere is ready
  useEffect(() => {
    if (
      payHereReady &&
      !paymentInitiated &&
      !orderMeta &&
      !paymentInitRef.current
    ) {
      console.log(
        "PayHere ready and no active payment - initiating fresh session",
      );
      initiatePaymentPendingFunction();
    }
  }, [payHereReady, paymentInitiated, orderMeta]);

  // Setup PayHere callbacks
  useEffect(() => {
    if (typeof window !== "undefined" && window.payhere) {
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
  }, [payHereReady]); // Remove onPaymentError dependency

  const handlePayHerePayment = async () => {
    if (!payHereReady || !window.payhere) {
      onPaymentError(
        "PayHere is not ready or library not loaded. Please try again.",
      );
      setIsProcessing(false);
      return;
    }

    if (!orderMeta?.orderId) {
      onPaymentError("Payment not initialized. Please try again.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Validate payment window before proceeding (optional - fallback on error)
      console.log("Validating payment window for orderId:", orderMeta.orderId);
      console.log("PaymentId to validate:", orderMeta.paymentId);

      if (!orderMeta.paymentId) {
        console.warn("Payment ID not found - proceeding without validation");
      } else {
        try {
          const validationResponse = await bookingAPI.validatePaymentWindow(
            orderMeta.paymentId,
          );

          if (validationResponse.success) {
            if (
              !validationResponse.data.valid ||
              validationResponse.data.expired
            ) {
              throw new Error(
                "Payment window has expired. Please start a new payment.",
              );
            }
            console.log("Payment window validated successfully");
          } else {
            console.warn(
              "Payment validation failed, proceeding anyway:",
              validationResponse.error,
            );
          }
        } catch (validationError) {
          console.warn(
            "Payment validation error, proceeding anyway:",
            validationError,
          );
          // Continue with payment even if validation fails
        }
      }

      console.log("Payment window validation complete - proceeding to hash generation");
      console.log("nextMonthSlots1111 :",nextMonthSlots)
      // Step 2: Generate hash for PayHere
      const amountStr = totalAmount.toFixed(2);
      const hashResponse = await bookingAPI.generatePayHereHash(
        orderMeta.orderId,
        amountStr,
        "LKR",
      );

      if (!hashResponse?.success || !hashResponse.data?.hash) {
        throw new Error(
          hashResponse?.error || "Failed to generate payment hash",
        );
      }

      // Step 3: Prepare PayHere callbacks
      // window.payhere.onCompleted = async (completedOrderId: string) => {
      //   console.log("Payment completed. OrderID:" + completedOrderId);
      //   try {
      //     setIsProcessing(true);

      //     // Build simplified confirmation payload (only paymentId from initiation)
      //     const paymentId = orderMeta.paymentId|| orderMeta.order_id;
      //     if (!paymentId) {
      //       throw new Error("Payment ID not found");
      //     }

      //     // Ensure required booking preference fields exist
      //     if (!bookingPreferences.selectedSubject || !bookingPreferences.selectedLanguage || !bookingPreferences.selectedClassType) {
      //       console.error("Missing booking preference details:", bookingPreferences);
      //       onPaymentError("Missing booking preference details (subject/language/class type). Please re-select and try again.");
      //       setIsProcessing(false);
      //       return;
      //     }

      //     const confirmPayload = isMonthly
      //       ? {
      //           paymentId: paymentId,
      //           studentId: studentIdNum,
      //           tutorId: Number(tutor.tutorProfileId || parseInt(String(tutor.id), 10)),
      //           slotIds: lockedSlotIds,
      //           subjectId: bookingPreferences.selectedSubject.subjectId,
      //           languageId: bookingPreferences.selectedLanguage.languageId,
      //           classTypeId: bookingPreferences.selectedClassType.id,
      //           paymentTime: new Date(),
      //           month: new Date().getMonth() + 1 ,
      //           year:new Date().getFullYear()
      //         }
      //       : {
      //           paymentId: paymentId,
      //           studentId: studentIdNum,
      //           tutorId: Number(tutor.tutorProfileId || parseInt(String(tutor.id), 10)),
      //           slotIds: lockedSlotIds,
      //           subjectId: bookingPreferences.selectedSubject.subjectId,
      //           languageId: bookingPreferences.selectedLanguage.languageId,
      //           classTypeId: bookingPreferences.selectedClassType.id,
      //           paymentTime: new Date(),
      //           month:null,
      //           year:null
      //         };

      //     console.log("Confirming payment with paymentId:", confirmPayload);
      //     const confirmRes = await bookingAPI.confirmPayHerePayment(confirmPayload);
      //     console.log("Payment confirmation response:", confirmRes);

      //     if (confirmRes?.success) {
      //       const bookingId = (confirmRes as any)?.data?.bookingId as number | undefined;
      //       clearBookingCache();
      //       onPaymentSuccess(bookingId);
      //     } else {
      //       onPaymentError(confirmRes?.error || "Payment confirmation failed");
      //     }
      //   } catch (e: any) {
      //     console.error("Confirm PayHere payment error:", e);
      //     onPaymentError(e?.message || "Payment confirmation failed");
      //   } finally {
      //     setIsProcessing(false);
      //   }
      // };
      window.payhere.onCompleted = async (completedOrderId: string) => {
        console.log("Payment completed. OrderID:" + completedOrderId);
        setIsProcessing(true);

        try {
          const paymentId = orderMeta.paymentId || orderMeta.order_id;
          if (!paymentId) {
            throw new Error("Payment ID not found");
          }

          if (!bookingPreferences.selectedSubject || !bookingPreferences.selectedLanguage || !bookingPreferences.selectedClassType) {
            console.error("Missing booking preference details:", bookingPreferences);
            onPaymentError("Missing booking preference details (subject/language/class type). Please re-select and try again.");
            return;
          }

          const currentOrderId = orderMeta.orderId || orderMeta.order_id || completedOrderId;
          if (!currentOrderId) {
            throw new Error("Order ID not found");
          }

          console.log("Checking payment status for order:", completedOrderId);
          const statusResponse = await bookingAPI.getPaymentStatus(completedOrderId);
          console.log("Payment status response:", statusResponse);
          if (!statusResponse.success) {
            const message = statusResponse.error || "Unable to verify payment status. Please contact support.";
            console.error("Payment status check failed:", message, statusResponse);
           // onPaymentError(message, "UNKNOWN");
            return;
          }

          const normalizedStatus = (statusResponse.data.status || "").toUpperCase();
          console.log("Payment status received:", normalizedStatus, statusResponse.data)
          
          if (normalizedStatus === "SUCCESS" || normalizedStatus === "COMPLETED") {
            clearBookingCache();
            onPaymentSuccess(undefined); // Let the confirmation page handle it
            return;
          }

          if (normalizedStatus === "REFUNDED") {
            clearBookingCache();
            router.push('/dashboard/student/find-tutor/book/refunded');
            return;
          }

          if (normalizedStatus === "FAILED") {
            clearBookingCache();
            router.push('/dashboard/student/find-tutor/book/failed');
            return;
          }

          if (normalizedStatus === "CANCELLED" || normalizedStatus === "CANCELED") {
            clearBookingCache();
            router.push('/dashboard/student/find-tutor/book/cancelled');
            return;
          }

          if (normalizedStatus !== "SUCCESS" && normalizedStatus !== "COMPLETED") {
            onPaymentError(`Payment status is ${normalizedStatus || "unknown"}. Please reach out to support if this continues.`);
            return;
          }

          //const nowIso = new Date().toISOString();
          // const recurringBaseDate = monthlyBookingData?.startDate
          //   ? new Date(monthlyBookingData.startDate)
          //   : selectedDate;
          // const month = isMonthly ? recurringBaseDate.getMonth() + 1 : null;
          // const year = isMonthly ? recurringBaseDate.getFullYear() : null;

          // const slotsPayload: Record<string, number[]> =
          //   availabilitySlotsMap && Object.keys(availabilitySlotsMap).length > 0
          //     ? availabilitySlotsMap
          //     : { default: Array.isArray(lockedSlotIds) ? lockedSlotIds : [] };

          // const confirmPayload = {
          //   paymentId,
          //   slots: slotsPayload,
          //   tutorId: Number(tutor.tutorProfileId || parseInt(String(tutor.id), 10)),
          //   subjectId: bookingPreferences.selectedSubject.subjectId,
          //   languageId: bookingPreferences.selectedLanguage.languageId,
          //   classTypeId: bookingPreferences.selectedClassType.id,
          //   studentId: Number(studentIdNum),
          //   paymentTime: nowIso,
          //   amount: Number(totalAmount),
          //   month,
          //   year,
          //   isMonthly: !!isMonthly,
          // };

          ///console.log("Confirming payment with payload:", confirmPayload);
          //const confirmRes = await bookingAPI.confirmPayHerePayment(confirmPayload);
          //console.log("Payment confirmation response:", confirmRes);

          // if (confirmRes?.success) {
          //   const bookingId = (confirmRes.data as any)?.bookingId ?? (confirmRes as any)?.bookingId;
          //   clearBookingCache();
          //   onPaymentSuccess(bookingId);
          // } else {
          //   onPaymentError(confirmRes?.error || "Payment confirmation failed");
          // }
        } catch (e: any) {
          console.error("Confirm PayHere payment error:", e);
          onPaymentError(e?.message || "Payment confirmation failed");
        } finally {
          setIsProcessing(false);
        }
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
//////////////////////////////////////
      // Step 4: Start PayHere payment
      const paymentIdForMetadata = orderMeta.paymentId || orderMeta.order_id || null;
      const metadataBaseDate = monthlyBookingData?.startDate
        ? new Date(monthlyBookingData.startDate)
        : selectedDate;
  // Prefer context-provided nextMonth/nextYear for repay/next-month flows; fallback to current selection month
  const metadataMonth = (ctxNextMonth ?? (isMonthly ? metadataBaseDate.getMonth() + 1 : null)) as number | null;
  const metadataYear = (ctxNextYear ?? (isMonthly ? metadataBaseDate.getFullYear() : null)) as number | null;
      // Build slots payload: prefer availability map, then lockedSlotIds, then nextMonthSlots as a fallback (repay case)
      const metadataSlots: Record<string, number[]> = (() => {
        console.log("availabilitySlotsMap :",availabilitySlotsMap)
        if (availabilitySlotsMap && Object.keys(availabilitySlotsMap).length > 0) {
          return availabilitySlotsMap;
        }
        const locked = Array.isArray(lockedSlotIds) ? lockedSlotIds : [];
        if (locked.length > 0) {
          return { default: locked };
        }
        const nextMonth = Array.isArray(nextMonthSlots) ? nextMonthSlots : [];
        if (nextMonth.length > 0) {
          return { default: nextMonth };
        }
        return { default: [] };
      })();
      console.log("defaulrt slots for metadataMonth:", metadataMonth);

      const customPayload = {
        paymentId: paymentIdForMetadata,
        slots: metadataSlots,
        tutorId: Number(tutor.tutorProfileId || parseInt(String(tutor.id), 10)),
        subjectId: bookingPreferences.selectedSubject?.subjectId,
        languageId: bookingPreferences.selectedLanguage?.languageId,
        classTypeId: bookingPreferences.selectedClassType?.id,
        studentId: Number(studentIdNum),
        paymentTime: new Date().toISOString(),
        amount: Number(totalAmount),
        month: metadataMonth,
        year: metadataYear,
        isMonthly: !!isMonthly,
        nextMonthSlots: Array.isArray(nextMonthSlots) ? nextMonthSlots : []
      };
      // Repay-specific payload for existing class payments
      const isRepay = !!selectedClassId;
      const repayPayload = isRepay ? {
        type: 'repay',
        classId: selectedClassId,
        studentId: Number(studentIdNum),
        paymentTime: new Date().toISOString(),
        amount: Number(totalAmount),
        month: metadataMonth,
        year: metadataYear,
        paymentId: paymentIdForMetadata,
        // Ensure slots/default and nextMonthSlots are populated in repay mode
        slots: metadataSlots,
        nextMonthSlots: Array.isArray(nextMonthSlots) ? nextMonthSlots : []
      } : undefined;
      console.log("custom payload:", customPayload);
      

      const payment = {
        sandbox: true,
        merchant_id: hashResponse.data.merchantId || "1228143", // Fallback to sandbox merchant ID
        return_url: `${window.location.origin}/payment/return`,
        cancel_url: `${window.location.origin}/payment/cancel`,
        notify_url: `https://95b150d28080.ngrok-free.app/api/payment/payhere/notify`,
        order_id: orderMeta.orderId || orderMeta.order_id || `EDIMY-${Date.now()}`,
        items: isMonthly 
          ? `${bookingPreferences.selectedSubject?.subjectName || "Tutoring"} - Monthly (${monthlyBookingData?.totalSlots || 0} slots)`
          : `${bookingPreferences.selectedSubject?.subjectName || "Tutoring"} Session - ${duration}h`,
        amount: amountStr,
        currency: "LKR",
        hash: hashResponse.data.hash,
        first_name: user?.firstName || "Student",
        last_name: user?.lastName || "User",
        email: user?.email || "no-reply@example.com",
        // first_name: "Student",
        // last_name: "User",
        // email: "student@example.com",
        // phone: "+94701234567",
        phone: "0000000000",
        address: "N/A",
        city: "N/A",
        country: "Sri Lanka",
        //address: "Colombo",
        //city: "Colombo",
        //country: "Sri Lanka",
        // delivery_address: "Colombo",
        // delivery_city: "Colombo",
        // delivery_country: "Sri Lanka",
        // custom_1: JSON.stringify({
        // tutorId: tutor.tutorProfileId,
        //   ...(isMonthly
        //     ? { monthlyBookingId: monthlyBookingData?.id, totalSlots: monthlyBookingData?.totalSlots }
        //     : { slotId: selectedSlot?.slotId }
        //   ),
        //   language: bookingPreferences?.selectedLanguage?.languageName,
        //   subject: bookingPreferences?.selectedSubject?.subjectName,
        //   classType: bookingPreferences?.selectedClassType?.name,
        // }),
        // custom_2: selectedDate.toISOString(),
        // In repay mode, send only custom_2 and set custom_1 as null per requirement
        ...(isRepay
          ? { custom_1: null as any, custom_2: JSON.stringify(repayPayload) }
          : { custom_1: JSON.stringify(customPayload) }
        )
      };

      console.log("Payment object:", payment);
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
    <div className="flex flex-col min-h-[calc(100vh-400px)] justify-between">
      {/* PayHere Gateway Section - Professional Design */}
      <div className="space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-600/5 backdrop-blur-sm rounded-2xl"></div>
          <Card className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-xl rounded-2xl overflow-hidden">
            <CardContent className="p-4 space-y-6">
              {/* PayHere Branding - Professional and Trustworthy */}
              <div className="text-center relative">
                <div className="space-y-4">
                  {/* PayHere Logo - Clean and Simple */}

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Session Amount
                      </span>
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        Rs. {totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Inclusive of all taxes
                    </div>
                  </div>

                  {/* Security Features Grid - Professional Layout */}

                  {/* Supported Payment Methods - Clean Icons */}
                  <div className="mt-6">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Supported Methods
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">
                        Visa
                      </div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">
                        MasterCard
                      </div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">
                        Amex
                      </div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">
                        eZcash
                      </div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">
                        Genie
                      </div>
                      <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">
                        Sampath Vishwa
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Instructions - Clear and Concise */}
            </CardContent>
          </Card>
        </div>

        {/* Payment Button - Professional and Trustworthy */}
        <div className="sticky bottom-0 left-0 right-0 ">
          <div className="max-w-3xl mx-auto px-4 space-y-4">
            <div className="flex gap-4 w-full">
              {/* Cancel Button */}
              <Button
                onClick={onCancel}
                variant="destructive" // solid red button
                className="flex-1 h-16 text-lg font-semibold rounded-2xl bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col items-center">
                  <span className="text-base font-bold">Cancel</span>
                  <span className="text-sm text-red-100">
                    Return to booking
                  </span>
                </div>
              </Button>

              {/* Fresh session indicator */}

              {/* Proceed to Payment Button */}
              <Button
                onClick={handlePayHerePayment}
                disabled={
                  isProcessing ||
                  reservationTimer === 0 ||
                  !payHereReady ||
                  !orderMeta
                }
                className={`flex-1 group relative overflow-hidden h-16 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg ${
                  isProcessing ||
                  reservationTimer === 0 ||
                  !payHereReady ||
                  !orderMeta
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-blue-500/25 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-600"
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/10 group-hover:from-white/5 group-hover:to-white/20 transition-all duration-300"></div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <div className="flex flex-col items-center">
                        <span>Processing Payment</span>
                        <span className="text-sm opacity-80">
                          Securely via PayHere
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col items-center">
                        <span>Proceed to Payment</span>
                        <span className="text-sm opacity-80">
                          Rs. {totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </Button>
            </div>
            {/* Timer expired alert - rely on parent to redirect; keep fallback for safety */}
            {reservationTimer === 0 && orderMeta && (
              <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
                  Reservation time exceeded. Please go back and select slots
                  again.
                </AlertDescription>
              </Alert>
            )}

            {/* PayHere Loading State - Informative */}
            {!payHereReady && (
              <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50 rounded-xl">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium">
                  Initializing secure PayHere gateway. This ensures your payment
                  is protected.
                </AlertDescription>
              </Alert>
            )}

            {/* Static instruction (no dynamic countdown here) */}
            {orderMeta && reservationTimer > 0 && (
              <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800/50 rounded-xl">
                <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                  Please complete the payment within 10 minutes after initiating
                  the PayHere payment window.
                </AlertDescription>
              </Alert>
            )}
            {/* ...existing alerts... */}
          </div>
        </div>
      </div>
    </div>
  );
};
