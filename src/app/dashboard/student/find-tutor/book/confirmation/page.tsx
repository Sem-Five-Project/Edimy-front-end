  "use client";
  import React, { useEffect, useState } from "react";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";
  import { BookingProgress } from "@/components/ui/booking-progress";
  import { TutorInfoCard } from "@/components/ui/tutor-info-card";
  import { CurrencySelector } from "@/components/ui/currency-selector";
  import { 
    CheckCircle, 
    Calendar,
    Clock,
    User,
    BookOpen,
    Globe,
    Users,
    Timer,
    Home,
    MessageSquare,
    Copy,
    ExternalLink,
    Sparkles,
    Star
  } from "lucide-react";
  import { useBooking } from "@/contexts/BookingContext";
  import { useCurrency } from "@/contexts/CurrencyContext";
  import { useRouter } from "next/navigation";

  export default function BookingConfirmationPage() {
    const router = useRouter();
    const {
      tutor,
      selectedDate,
    // selectedSlot removed from context
      bookingPreferences,
      bookingId,
      setCurrentStep,
      resetBookingState,
      currentStep
    } = useBooking();

    const { formatPrice, selectedCurrency } = useCurrency();

    const [oneTimeSlotDetail, setOneTimeSlotDetail] = useState<any | null>(null);
    useEffect(() => {
      try {
        const raw = sessionStorage.getItem('oneTimeSlotDetail');
        if (raw) setOneTimeSlotDetail(JSON.parse(raw));
      } catch {}
    }, []);

    useEffect(() => {
      if (!tutor || !bookingId) {
        router.push("/dashboard/student/find-tutor");
        return;
      }
      setCurrentStep('confirmation');
    }, [tutor, bookingId, router, setCurrentStep]);

    const formatTime = (time: string) =>
      new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

    const calculateSlotHours = () => {
      if (!oneTimeSlotDetail) return 0;
      const start = new Date(`2000-01-01T${oneTimeSlotDetail.startTime}`);
      const end = new Date(`2000-01-01T${oneTimeSlotDetail.endTime}`);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    };

    const copyBookingId = () => {
      if (bookingId) {
        navigator.clipboard.writeText(bookingId);
        // You could add a toast notification here
      }
    };

    const handleNewBooking = () => {
      resetBookingState();
      router.push('/dashboard/student/find-tutor');
    };

    const handleGoToDashboard = () => {
      resetBookingState();
      router.push('/dashboard/student');
    };

    if (!tutor || !bookingId) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    const slotHours = calculateSlotHours();

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Progress Bar */}
        <BookingProgress currentStep={currentStep} />
        
        <div className="max-w-6xl mx-auto p-4 space-y-6">
          {/* Success Header */}
          <div className="text-center animate-in zoom-in-50 duration-700">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-4 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white animate-in zoom-in-75 duration-500 delay-200" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Booking Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Your session with {tutor.firstName} has been successfully booked
            </p>
          </div>

          {/* Currency Selector */}
          <div className="flex justify-end">
            <CurrencySelector />
          </div>

          {/* Booking ID Card */}
          <Card className="animate-in slide-in-from-top-4 duration-500 delay-100 border-2 border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-white dark:from-green-950/20 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Booking Reference</div>
                    <div className="text-xl font-bold text-green-600">{bookingId}</div>
                  </div>
                </div>
                
              </div>
            </CardContent>
          </Card>

          {/* Tutor Info Card */}
          <div className="animate-in fade-in-50 duration-500 delay-200">
            <TutorInfoCard tutor={tutor} />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Session Details */}
            <Card className="animate-in slide-in-from-left-4 duration-500 delay-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Session Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date & Time */}
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
                            year: "numeric",
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

                {/* Session Info */}
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
                      {bookingPreferences?.selectedSubject?.subjectName}
                    </span>
                  </div>

                  {bookingPreferences?.selectedLanguage && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600 dark:text-gray-400">Language</span>
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {bookingPreferences.selectedLanguage.languageName}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Class Type</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {bookingPreferences?.selectedClassType?.name}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-2">
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">Duration</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {slotHours} hour{slotHours !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Paid</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">
                        {formatPrice(bookingPreferences?.finalPrice || 0)}
                      </span>
                      {selectedCurrency.code !== 'LKR' && (
                        <div className="text-xs text-gray-500">
                          ≈ Rs. {bookingPreferences?.finalPrice?.toFixed(2)} LKR
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="animate-in slide-in-from-right-4 duration-500 delay-400">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Check Your Email
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        A confirmation email with session details has been sent to your email address.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Join the Session
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Join your session 5 minutes early using the meeting link in your email.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                        Contact Your Tutor
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        You can message your tutor directly through our platform for any questions.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <Button 
                    onClick={handleGoToDashboard}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go to Dashboard
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={handleNewBooking}
                    className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Book Another Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Card */}
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-500 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Need Help?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Our support team is here to help with any questions about your booking.
                </p>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }