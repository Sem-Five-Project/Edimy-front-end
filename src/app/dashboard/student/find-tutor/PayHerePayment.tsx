"use client";
import React, { useState, useEffect } from "react";
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
  Crown
} from "lucide-react";
import { Tutor, TimeSlot, BookingPreferences } from "@/types";
import { useCurrency } from "@/contexts/CurrencyContext";
import { bookingAPI } from "@/lib/api";

// PayHere payment object interface
declare global {
  interface Window {
    payhere: {
      startPayment: (payment: any) => void;
      onCompleted: (orderId: string) => void;
      onDismissed: () => void;
      onError: (error: string) => void;
    };
  }
}

interface PayHerePaymentProps {
  tutor: Tutor;
  selectedDate: Date;
  selectedSlot: TimeSlot;
  bookingPreferences: BookingPreferences;
  reservationTimer: number;
  onBack: () => void;
  onPaymentSuccess: () => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export const PayHerePayment: React.FC<PayHerePaymentProps> = ({
  tutor,
  selectedDate,
  selectedSlot,
  bookingPreferences,
  reservationTimer,
  onBack,
  onPaymentSuccess,
  onPaymentError,
  onCancel,
}) => {
  const { formatPrice } = useCurrency();
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

  const duration = calculateDuration(selectedSlot.startTime, selectedSlot.endTime);
  const totalAmount = bookingPreferences.finalPrice || selectedSlot.price || 0;

  // Load PayHere script
  useEffect(() => {
    const existing = document.getElementById('payhere-script') as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).payhere) setPayHereReady(true);
      return;
    }

    const loadScript = (src: string, onFail?: () => void) => {
      const s = document.createElement('script');
      s.id = 'payhere-script';
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
  }, [onPaymentError]);

  // Setup PayHere callbacks
  useEffect(() => {
    if (typeof window !== 'undefined' && window.payhere) {
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
      onPaymentError("PayHere is not ready or library not loaded. Please try again.");
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);

    try {
      const orderId = `EDIMY_${Date.now()}_${selectedSlot.slotId}`;
      const hashResponse = await bookingAPI.generatePayHereHash(orderId, totalAmount, "LKR");

      if (!hashResponse) {
        throw new Error(hashResponse.error || "Failed to generate payment hash");
      }

      const payment = {
        sandbox: true,
        merchant_id: hashResponse.data.merchantId,
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

      console.log("Payment object:", payment);
      window.payhere.startPayment(payment);
    } catch (error) {
      console.error("PayHere payment initialization failed:", error);
      onPaymentError(`Payment initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Amount</span>
                    <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Inclusive of all taxes</div>
                </div>

                {/* Security Features Grid - Professional Layout */}


                {/* Supported Payment Methods - Clean Icons */}
                <div className="mt-6">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Supported Methods</div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">Visa</div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">MasterCard</div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">Amex</div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">eZcash</div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">Genie</div>
                    <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-800 dark:text-gray-200">Sampath Vishwa</div>
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
    <span className="text-sm text-red-100">Return to booking</span>
  </div>
</Button>


      {/* Proceed to Payment Button */}
      <Button
        onClick={handlePayHerePayment}
        disabled={isProcessing || reservationTimer === 0 || !payHereReady}
        className={`flex-1 group relative overflow-hidden h-16 text-lg font-semibold rounded-xl transition-all duration-300 shadow-lg ${
          isProcessing || reservationTimer === 0 || !payHereReady
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
                <span className="text-sm opacity-80">Securely via PayHere</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <span>Proceed to Payment</span>
                <span className="text-sm opacity-80">Rs. {totalAmount.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </Button>
    </div>
      {/* Timer expired alert - Professional Warning */}
      {reservationTimer === 0 && (
        <Alert className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 rounded-xl">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200 font-medium">
            Your reservation has expired. Please select a new slot to continue.
          </AlertDescription>
        </Alert>
      )}

      {/* PayHere Loading State - Informative */}
      {!payHereReady && (
        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/50 rounded-xl">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200 font-medium">
            Initializing secure PayHere gateway. This ensures your payment is protected.
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