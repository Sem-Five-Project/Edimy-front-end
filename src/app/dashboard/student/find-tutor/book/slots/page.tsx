"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { BookingProgress } from "@/components/ui/booking-progress";
import { TutorInfoCard } from "@/components/ui/tutor-info-card";
import { StyledSelect } from "@/components/ui/styled-select";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  CalendarDays,
  Clock,
  Loader2,
  BookOpen,
  Globe,
  Users,
  DollarSign,
  Timer
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { tutorAPI } from "@/lib/api";
import { TimeSlot, CLASS_TYPES, BookingPreferences } from "@/types";

export default function BookingSlotsPage() {
  const router = useRouter();
  const {
    tutor,
    selectedDate,
    setSelectedDate,
    proceedToStep,
    setCurrentStep,
    setReservationDetails,
    setSelectedSlot,
    setBookingPreferences,
    currentStep
  } = useBooking();

  const { formatPrice, selectedCurrency } = useCurrency();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlotLocal, setSelectedSlotLocal] = useState<TimeSlot | null>(null);
  const [preferences, setPreferences] = useState<BookingPreferences>({
    selectedLanguage: tutor?.languages && tutor.languages.length === 1 ? tutor.languages[0] : null,
    selectedSubject: tutor?.subjects && tutor.subjects.length === 1 ? tutor.subjects[0] : null,
    selectedClassType: null,
    finalPrice: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tutor) {
      router.push("/dashboard/student/find-tutor");
      return;
    }
    setCurrentStep('slot-selection');
    if (selectedDate) loadSlots(selectedDate);
  }, [tutor, selectedDate, router, setCurrentStep]);

  const loadSlots = async (date: Date) => {
    if (!tutor) return;
    setIsLoading(true);
    try {
      const dateString = date.toISOString().split("T")[0];
      const response = await tutorAPI.getTutorSlots(tutor.tutorProfileId.toString(), dateString);
      if (response.success) setAvailableSlots(response.data);
      else setError("Failed to load slots");
    } catch {
      setError("Failed to load slots");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSlotHours = (slot: TimeSlot | null) => {
    if (!slot) return 0;
    const start = new Date(`2000-01-01T${slot.startTime}`);
    const end = new Date(`2000-01-01T${slot.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const calculatePrice = () => {
    if (!tutor || !selectedSlotLocal) return 0;
    const basePrice = preferences.selectedSubject?.hourlyRate || tutor.hourlyRate || 0;
    const multiplier = preferences.selectedClassType?.priceMultiplier || 1.0;
    const hours = calculateSlotHours(selectedSlotLocal);
    return basePrice * multiplier * hours;
  };

  const isValid = () => {
    if (!tutor) return false;
    return selectedSlotLocal && 
           preferences.selectedSubject && 
           preferences.selectedClassType &&
           (tutor.languages.length <= 1 || preferences.selectedLanguage);
  };

  const handleContinue = () => {
    if (!selectedSlotLocal || !isValid()) return;
    
    const finalPreferences = {
      ...preferences,
      finalPrice: calculatePrice()
    };
    
    setSelectedSlot(selectedSlotLocal);
    setBookingPreferences(finalPreferences);
    
    setReservationDetails({
      reservationId: `temp-${Date.now()}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
      timer: 300
    });
    
    proceedToStep('payment');
  };

  if (!tutor) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  // Prepare options for dropdowns
  const subjectOptions = tutor.subjects?.map(subject => ({
    value: subject.subjectId.toString(),
    label: subject.subjectName,
    sublabel: `${formatPrice(subject.hourlyRate)}/hr`,
  })) || [];

  const languageOptions = tutor.languages?.map(language => ({
    value: language.languageId.toString(),
    label: language.languageName
  })) || [];

  const classTypeOptions = CLASS_TYPES.map(type => ({
    value: type.id,
    label: type.name,
    //badge: type.priceMultiplier < 1.0 ? `${Math.round((1 - type.priceMultiplier) * 100)}% OFF` : undefined
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress Bar */}
      <BookingProgress currentStep={currentStep} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header with Back Button and Currency Selector */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/student/find-tutor")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutors
          </Button>
          <CurrencySelector />
        </div>

        {/* Tutor Info Card */}
        <div className="animate-in fade-in-50 duration-500">
          <TutorInfoCard tutor={tutor} />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Preferences Section */}
        <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-100 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Booking Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Subject Selection */}
              {tutor.subjects && tutor.subjects.length > 1 && (
                <StyledSelect
                  value={preferences.selectedSubject?.subjectId.toString() || ""}
                  onValueChange={(value) => {
                    const subject = tutor.subjects.find(s => s.subjectId.toString() === value);
                    setPreferences({ ...preferences, selectedSubject: subject || null });
                  }}
                  placeholder="Choose subject"
                  options={subjectOptions}
                  label="Subject"
                  icon={<BookOpen className="w-4 h-4" />}
                />
              )}

              {/* Language Selection */}
              {tutor.languages && tutor.languages.length > 1 && (
                <StyledSelect
                  value={preferences.selectedLanguage?.languageId.toString() || ""}
                  onValueChange={(value) => {
                    const language = tutor.languages.find(l => l.languageId.toString() === value);
                    setPreferences({ ...preferences, selectedLanguage: language || null });
                  }}
                  placeholder="Choose language"
                  options={languageOptions}
                  label="Language"
                  icon={<Globe className="w-4 h-4" />}
                />
              )}

              {/* Class Type Selection */}
              <StyledSelect
                value={preferences.selectedClassType?.id || ""}
                onValueChange={(value) => {
                  const classType = CLASS_TYPES.find(ct => ct.id === value);
                  setPreferences({ ...preferences, selectedClassType: classType || null });
                }}
                placeholder="Choose class type"
                options={classTypeOptions}
                label="Class Type"
                icon={<Users className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>


        {/* Calendar and Slots Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="animate-in slide-in-from-left-4 duration-500 delay-200 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent>
             <Calendar
               mode="single"
               selected={selectedDate || undefined}
               onSelect={(date) => {
                 if (date && !Array.isArray(date) && typeof date === 'object' && 'getTime' in date) {
                   setSelectedDate(date);
                 }
               }}
               disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                className="w-full border-0"
                classNames={{
                  months: "space-y-2 sm:space-y-4",
                  month: "space-y-2 sm:space-y-4",
                  caption: "flex justify-center pt-1 sm:pt-2 md:pt-3 relative items-center px-1 sm:px-2 md:px-4",
                  caption_label: "text-xs sm:text-sm md:text-base font-medium",
                  nav: "space-x-1 sm:space-x-2 flex items-center",
                  nav_button: "h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 bg-transparent p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all duration-200 rounded-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                  table: "w-full border-collapse space-y-1 sm:space-y-2",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-7 sm:w-8 md:w-9 font-normal text-[0.65rem] sm:text-[0.8rem] md:text-xs text-center py-1 sm:py-2",
                  row: /*  */"flex w-full mt-1 sm:mt-2",
                  cell: "relative h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 p-0 text-center text-xs sm:text-sm md:text-base focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent transition-all duration-200 hover:scale-105 hover:z-10",
                  day: "h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 p-0 font-normal rounded-md transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 focus:bg-blue-100 dark:focus:bg-blue-900/20",
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:text-white rounded-full font-medium ring-2 ring-blue-500 ring-offset-1 ring-offset-background shadow-md",
                  day_today: "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 font-semibold border-2 border-blue-500 rounded-full ring-1 ring-blue-500 ring-offset-1 ring-offset-background shadow-sm",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible"
                }}
              />
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="animate-in slide-in-from-right-4 duration-500 delay-300 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Available Times
                {selectedDate && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {availableSlots.map((slot, index) => (
                    <Button
                      key={slot.slotId}
                      variant={selectedSlotLocal?.slotId === slot.slotId ? "default" : "outline"}
                      className={`
                        w-full justify-between h-auto p-4 transition-all duration-300 transform hover:scale-105
                        ${slot.status !== "AVAILABLE" ? "opacity-50 cursor-not-allowed" : ""}
                        ${selectedSlotLocal?.slotId === slot.slotId 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105" 
                          : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600"
                        }
                      `}
                      disabled={slot.status !== "AVAILABLE"}
                      onClick={() => setSelectedSlotLocal(slot)}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col items-start">
                        <div className="font-semibold text-base">
                          {new Date(`2000-01-01T${slot.startTime}`).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                          {" - "}
                          {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </div>
                        <div className="text-sm opacity-80 flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {calculateSlotHours(slot)} hour{calculateSlotHours(slot) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {selectedSlotLocal?.slotId === slot.slotId && (
                        <CheckCircle className="h-5 w-5 text-white animate-in zoom-in-50 duration-200" />
                      )}
                    </Button>
                  ))}
                  {availableSlots.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 py-12 animate-in fade-in-50 duration-500">
                      <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No slots available</p>
                      <p className="text-sm">Try selecting a different date</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Price Summary & Continue Button */}
        {(preferences.selectedSubject && preferences.selectedClassType && selectedSlotLocal) && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-400 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">Booking Summary</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>Duration: {calculateSlotHours(selectedSlotLocal)} hour{calculateSlotHours(selectedSlotLocal) !== 1 ? 's' : ''}</div>
                    <div>Rate: {formatPrice(preferences.selectedSubject?.hourlyRate || 0)}/hr</div>
                    {preferences.selectedClassType?.priceMultiplier !== 1.0 && (
                      <div className="text-green-600 dark:text-green-400">
                        Discount: {Math.round((1 - preferences.selectedClassType.priceMultiplier) * 100)}% off
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {formatPrice(calculatePrice())}
                  </div>
                  {selectedCurrency.code !== 'LKR' && (
                    <div className="text-xs text-gray-400 mb-2">
                      ≈ Rs. {calculatePrice().toFixed(2)} LKR
                    </div>
                  )}
                  <Button 
                    onClick={handleContinue}
                    disabled={!isValid()}
                    size="lg"
                    className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {isValid() ? (
                      <>
                        Continue to Payment
                        <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                      </>
                    ) : (
                      "Complete all selections to continue"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}