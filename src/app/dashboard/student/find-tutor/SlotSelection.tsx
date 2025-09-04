"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CalendarDays, 
  Clock, 
  Loader2, 
  Languages, 
  BookOpen, 
  GraduationCap,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Star
} from "lucide-react";
import { Tutor, TimeSlot, Language, Subject, ClassType, BookingPreferences, CLASS_TYPES } from "@/types";
import { TutorHeader } from "./TutorHeader";
import { useCurrency } from "@/contexts/CurrencyContext";
import { DateCalendar } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

interface SlotSelectionProps {
  tutor: Tutor;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  availableSlots: TimeSlot[];
  isLoadingSlots: boolean;
  onSelectSlot: (slot: TimeSlot, preferences: BookingPreferences) => void;
}

export const SlotSelection: React.FC<SlotSelectionProps> = ({
  tutor,
  selectedDate,
  setSelectedDate,
  availableSlots,
  isLoadingSlots,
  onSelectSlot,
}) => {
  const { formatPrice } = useCurrency();
  
  const [bookingPreferences, setBookingPreferences] = useState<BookingPreferences>({
    selectedLanguage: tutor.languages.length === 1 ? tutor.languages[0] : null,
    selectedSubject: tutor.subjects.length === 1 ? tutor.subjects[0] : null,
    selectedClassType: null,
    finalPrice: 0,
  });
  
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // Calculate duration between start and end time
  const calculateDuration = (startTime: string, endTime: string): number => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Convert to hours
  };

  // Calculate final price based on selections with duration
  const calculatePrice = (slot?: TimeSlot): number => {
    const subject = bookingPreferences.selectedSubject;
    const classType = bookingPreferences.selectedClassType;
    
    let basePrice = subject?.hourlyRate || tutor.hourlyRate || 0;
    let multiplier = classType?.priceMultiplier || 1.0;
    
    // Calculate duration in hours if slot is provided
    let duration = 1; // Default 1 hour
    if (slot) {
      duration = calculateDuration(slot.startTime, slot.endTime);
    } else if (selectedSlot) {
      duration = calculateDuration(selectedSlot.startTime, selectedSlot.endTime);
    }
    
    const finalPrice = basePrice * multiplier * duration;
    return Math.round(finalPrice * 100) / 100;
  };

  // Update final price when preferences or slot change
  useEffect(() => {
    const price = calculatePrice();
    setBookingPreferences(prev => ({ ...prev, finalPrice: price }));
  }, [bookingPreferences.selectedSubject, bookingPreferences.selectedClassType, selectedSlot, tutor.hourlyRate]);

  // Filter out past time slots for today
  const getFilteredSlots = () => {
    const today = new Date();
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (selectedDateOnly.getTime() !== todayOnly.getTime()) {
      return availableSlots;
    }
    
    const currentTime = today.getHours() * 60 + today.getMinutes();
    
    return availableSlots.filter(slot => {
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const slotTime = startHours * 60 + startMinutes;
      return slotTime > currentTime;
    });
  };

  // Validation
  const validateSelections = (): string[] => {
    const errors: string[] = [];
    
    if (tutor.languages.length > 1 && !bookingPreferences.selectedLanguage) {
      errors.push("Please select a preferred language");
    }
    
    if (tutor.subjects.length > 1 && !bookingPreferences.selectedSubject) {
      errors.push("Please select a subject");
    }
    
    if (!bookingPreferences.selectedClassType) {
      errors.push("Please select a class type");
    }
    
    if (!selectedSlot) {
      errors.push("Please select a time slot");
    }
    
    return errors;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setValidationErrors([]);
  };

  const handleProceedToPayment = () => {
    const errors = validateSelections();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    if (selectedSlot) {
      const finalPreferences = {
        ...bookingPreferences,
        finalPrice: calculatePrice(selectedSlot)
      };
      onSelectSlot(selectedSlot, finalPreferences);
    }
  };

  const filteredSlots = getFilteredSlots();
  const canProceed = validateSelections().length === 0;

  return (
    <div className="space-y-8">
      <TutorHeader tutor={tutor} bookingPreferences={bookingPreferences} />

      {/* Booking Preferences Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-blue-900 dark:text-blue-100">
            <GraduationCap className="h-6 w-6" />
            Customize Your Learning Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Language Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Languages className="h-4 w-4" />
              Preferred Language
              {tutor.languages.length > 1 && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={bookingPreferences.selectedLanguage?.languageId.toString() || ""}
              onValueChange={(value) => {
                const language = tutor.languages.find(l => l.languageId.toString() === value);
                setBookingPreferences(prev => ({ ...prev, selectedLanguage: language || null }));
              }}
              disabled={tutor.languages.length <= 1}
            >
              <SelectTrigger className="w-full">
                <SelectValue 
                  placeholder={
                    tutor.languages.length <= 1 
                      ? tutor.languages[0]?.languageName || "English" 
                      : "Select language..."
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {tutor.languages.map((language) => (
                  <SelectItem key={language.languageId} value={language.languageId.toString()}>
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4" />
                      {language.languageName}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tutor.languages.length <= 1 && (
              <p className="text-xs text-gray-500">Only one language available</p>
            )}
          </div>

          {/* Subject Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <BookOpen className="h-4 w-4" />
              Subject
              {tutor.subjects.length > 1 && <span className="text-red-500">*</span>}
            </label>
            <Select
              value={bookingPreferences.selectedSubject?.subjectId.toString() || ""}
              onValueChange={(value) => {
                const subject = tutor.subjects.find(s => s.subjectId.toString() === value);
                setBookingPreferences(prev => ({ ...prev, selectedSubject: subject || null }));
              }}
              disabled={tutor.subjects.length <= 1}
            >
              <SelectTrigger className="w-full">
                <SelectValue 
                  placeholder={
                    tutor.subjects.length <= 1 
                      ? `${tutor.subjects[0]?.subjectName || "Subject"} (${formatPrice(tutor.subjects[0]?.hourlyRate || tutor.hourlyRate)}/hr)`
                      : "Select subject..."
                  } 
                />
              </SelectTrigger>
              <SelectContent>
                {tutor.subjects.map((subject) => (
                  <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject.subjectName}
                      </div>
                      <span className="text-sm text-green-600 ml-2 font-semibold">{formatPrice(subject.hourlyRate)}/hr</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {tutor.subjects.length <= 1 && (
              <p className="text-xs text-gray-500">Only one subject available</p>
            )}
          </div>

          {/* Class Type Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <GraduationCap className="h-4 w-4" />
              Class Type
              <span className="text-red-500">*</span>
            </label>
            <Select
              value={bookingPreferences.selectedClassType?.id || ""}
              onValueChange={(value) => {
                const classType = CLASS_TYPES.find(ct => ct.id === value);
                setBookingPreferences(prev => ({ ...prev, selectedClassType: classType || null }));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select class type..." />
              </SelectTrigger>
              <SelectContent>
                {CLASS_TYPES.map((classType) => (
                  <SelectItem key={classType.id} value={classType.id}>
                    <div className="flex flex-col items-start gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{classType.name}</span>
                        {classType.priceMultiplier < 1.0 && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {Math.round((1 - classType.priceMultiplier) * 100)}% OFF
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-600">{classType.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>

        {/* Live Price Display */}
        {(bookingPreferences.selectedSubject || bookingPreferences.selectedClassType) && (
          <div className="px-6 pb-6">
            <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-green-200 dark:border-green-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">Current Hourly Rate:</span>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-600">
                    {formatPrice((bookingPreferences.selectedSubject?.hourlyRate || tutor.hourlyRate) * (bookingPreferences.selectedClassType?.priceMultiplier || 1.0))}
                  </div>
                  <div className="text-xs text-gray-500">per hour</div>
                  {bookingPreferences.selectedClassType?.priceMultiplier !== 1.0 && (
                    <div className="text-xs text-green-600 font-medium">
                      {bookingPreferences.selectedClassType?.priceMultiplier && bookingPreferences.selectedClassType.priceMultiplier < 1.0 ? (
                        `Save ${Math.round((1 - bookingPreferences.selectedClassType.priceMultiplier) * 100)}%`
                      ) : (
                        "Premium rate"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Please complete the following:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar and Time Slots Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="xl:col-span-1">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Select Date
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <DateCalendar
                    value={dayjs(selectedDate)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setSelectedDate(newValue.toDate());
                        setSelectedSlot(null); // Reset slot selection when date changes
                      }
                    }}
                    shouldDisableDate={(date) => {
                      const today = dayjs().startOf('day');
                      const maxDate = dayjs().add(30, 'day');
                      return date.isBefore(today) || date.isAfter(maxDate);
                    }}
                    showDaysOutsideCurrentMonth
                    fixedWeekNumber={6}
                    sx={{
                      width: '100%',
                      maxWidth: '400px',
                      fontFamily: 'inherit',
                      '& .MuiPickersLayout-root': { backgroundColor: 'transparent' },
                      '& .MuiPickersCalendarHeader-root': { paddingX: '12px', marginBottom: '12px', minHeight: '40px' },
                      '& .MuiPickersCalendarHeader-label': { fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' },
                      '& .MuiPickersArrowSwitcher-button': {
                        color: '#6b7280', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '6px',
                        width: '32px', height: '32px',
                        '&:hover': { backgroundColor: '#f3f4f6', borderColor: '#2563eb' }
                      },
                      '& .MuiDayCalendar-header': { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' },
                      '& .MuiDayCalendar-weekDayLabel': { color: '#6b7280', fontSize: '0.75rem', fontWeight: '500', textTransform: 'uppercase', textAlign: 'center' },
                      '& .MuiDayCalendar-weekContainer': { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', margin: '2px 0' },
                      '& .MuiPickersDay-root': {
                        fontSize: '0.875rem', color: '#374151', backgroundColor: 'white', border: '1px solid #e5e7eb',
                        borderRadius: '6px', width: '36px', height: '36px', margin: '0',
                        '&:hover': { backgroundColor: '#eff6ff', borderColor: '#2563eb' },
                        '&.Mui-selected': { backgroundColor: '#2563eb', color: 'white', fontWeight: '600', '&:hover': { backgroundColor: '#1d4ed8' } },
                        '&.MuiPickersDay-today': { backgroundColor: '#fef3c7', borderColor: '#f59e0b', fontWeight: '600', '&.Mui-selected': { backgroundColor: '#2563eb', borderColor: '#2563eb' } },
                        '&.Mui-disabled': { color: '#9ca3af', backgroundColor: '#f9fafb', opacity: 0.5 },
                        '&.MuiPickersDay-outsideCurrentMonth': { color: '#9ca3af', backgroundColor: 'transparent' }
                      }
                    }}
                  />
                </div>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </div>

        {/* Time Slots Section */}
        <div className="xl:col-span-2">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Available Time Slots
                </div>
                {selectedDate && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {isLoadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading available slots...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSlots.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                        {filteredSlots.map((slot) => {
                          const duration = calculateDuration(slot.startTime, slot.endTime);
                          const totalPrice = calculatePrice(slot);
                          
                          return (
                            <Button
                              key={slot.slotId}
                              variant={
                                selectedSlot?.slotId === slot.slotId
                                  ? "default"
                                  : slot.status === "AVAILABLE" 
                                  ? "outline" 
                                  : "secondary"
                              }
                              size="sm"
                              disabled={slot.status !== "AVAILABLE"}
                              onClick={() => handleSlotClick(slot)}
                              className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 relative ${
                                selectedSlot?.slotId === slot.slotId
                                  ? "bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105"
                                  : slot.status === "AVAILABLE"
                                  ? "hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm border-2"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              {selectedSlot?.slotId === slot.slotId && (
                                <CheckCircle className="absolute -top-2 -right-2 h-5 w-5 bg-green-500 text-white rounded-full" />
                              )}
                              <div className="text-center w-full">
                                <div className="font-semibold text-sm">
                                  {formatTime(slot.startTime)}
                                </div>
                                <div className="text-xs opacity-75">
                                  to {formatTime(slot.endTime)}
                                </div>
                                <div className="text-xs opacity-75 mt-1">
                                  {slot.dayOfWeek} • {duration}h session
                                </div>
                                
                                {slot.subjectName && (
                                  <Badge variant="secondary" className="text-xs mt-2">
                                    {slot.subjectName}
                                  </Badge>
                                )}
                                
                                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                                  {slot.isRecurring && (
                                    <Badge variant="outline" className="text-xs">
                                      Recurring
                                    </Badge>
                                  )}
                                  {slot.status === "BOOKED" && (
                                    <Badge variant="destructive" className="text-xs">
                                      Booked
                                    </Badge>
                                  )}
                                  {slot.status === "IN_PROGRESS" && (
                                    <Badge variant="secondary" className="text-xs">
                                      In Progress
                                    </Badge>
                                  )}
                                </div>
                                
                                {slot.status === "AVAILABLE" && (
                                  <div className="text-xs mt-2 space-y-1">
                                    <div className="flex items-center justify-center gap-1">
                                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                      <span>{slot.rating}/5</span>
                                      <span className="text-gray-500">·</span>
                                      <span>{slot.tutorExperience}+ yrs</span>
                                    </div>
                                    {/* Show total payable amount for this slot */}
                                    {bookingPreferences.selectedSubject && bookingPreferences.selectedClassType && (
                                      <div className="font-bold text-green-600 mt-2 p-1 bg-green-50 dark:bg-green-950/20 rounded">
                                        Total: {formatPrice(totalPrice)}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                      
                      {/* Proceed Button */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={handleProceedToPayment}
                          disabled={!canProceed}
                          className={`w-full h-14 text-lg font-semibold transition-all duration-300 ${
                            canProceed 
                              ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg" 
                              : "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {canProceed && selectedSlot ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-5 w-5" />
                              <div className="flex flex-col">
                                <span>Proceed to Payment</span>
                                <span className="text-sm font-normal opacity-90">
                                  Total: {formatPrice(calculatePrice(selectedSlot))} for {calculateDuration(selectedSlot.startTime, selectedSlot.endTime)}h session
                                </span>
                              </div>
                            </div>
                          ) : (
                            "Complete All Selections to Continue"
                          )}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 space-y-4">
                      <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                        <CalendarDays className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          {availableSlots.length === 0 ? "No slots available" : "No available slots remaining today"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {availableSlots.length === 0
                            ? "Try selecting a different date"
                            : "Try selecting a future date"
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
