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
  Star,
  Sparkles,
  Zap,
  Crown,
  Gem,
  ArrowRight
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
    <div className="space-y-10">
      <TutorHeader tutor={tutor} bookingPreferences={bookingPreferences} />

      {/* Booking Preferences Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl"></div>
        <Card className="relative bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <CardHeader className="pb-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl">
            <CardTitle className="flex items-center gap-3 text-2xl text-white">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Customize Your Experience
                </span>
                <div className="text-sm text-purple-200 font-normal mt-1">Tailor your perfect learning session</div>
              </div>
              <div className="ml-auto">
                <Sparkles className="h-6 w-6 text-purple-300 animate-pulse" />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Language Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-medium">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Languages className="h-4 w-4 text-white" />
                  </div>
                  <span>Language Preference</span>
                  {tutor.languages.length > 1 && <Crown className="h-4 w-4 text-yellow-400" />}
                </label>
                <div className="relative">
                  <Select
                    value={bookingPreferences.selectedLanguage?.languageId.toString() || ""}
                    onValueChange={(value) => {
                      const language = tutor.languages.find(l => l.languageId.toString() === value);
                      setBookingPreferences(prev => ({ ...prev, selectedLanguage: language || null }));
                    }}
                    disabled={tutor.languages.length <= 1}
                  >
                    <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white h-12 rounded-xl hover:bg-white/20 transition-all duration-300">
                      <SelectValue 
                        placeholder={
                          tutor.languages.length <= 1 
                            ? tutor.languages[0]?.languageName || "English" 
                            : "Choose your preferred language..."
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {tutor.languages.map((language) => (
                        <SelectItem key={language.languageId} value={language.languageId.toString()} className="hover:bg-slate-800">
                          <div className="flex items-center gap-3">
                            <Languages className="h-4 w-4 text-blue-400" />
                            {language.languageName}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {tutor.languages.length <= 1 && (
                  <p className="text-xs text-purple-300 flex items-center gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Auto-selected (only option)
                  </p>
                )}
              </div>

              {/* Subject Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-medium">
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <span>Subject Focus</span>
                  {tutor.subjects.length > 1 && <Gem className="h-4 w-4 text-emerald-400" />}
                </label>
                <div className="relative">
                  <Select
                    value={bookingPreferences.selectedSubject?.subjectId.toString() || ""}
                    onValueChange={(value) => {
                      const subject = tutor.subjects.find(s => s.subjectId.toString() === value);
                      setBookingPreferences(prev => ({ ...prev, selectedSubject: subject || null }));
                    }}
                    disabled={tutor.subjects.length <= 1}
                  >
                    <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white h-12 rounded-xl hover:bg-white/20 transition-all duration-300">
                      <SelectValue 
                        placeholder={
                          tutor.subjects.length <= 1 
                            ? `${tutor.subjects[0]?.subjectName || "Subject"} (${formatPrice(tutor.subjects[0]?.hourlyRate || tutor.hourlyRate)}/hr)`
                            : "Select your subject..."
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {tutor.subjects.map((subject) => (
                        <SelectItem key={subject.subjectId} value={subject.subjectId.toString()} className="hover:bg-slate-800">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-3">
                              <BookOpen className="h-4 w-4 text-emerald-400" />
                              {subject.subjectName}
                            </div>
                            <span className="text-emerald-400 font-bold ml-4">{formatPrice(subject.hourlyRate)}/hr</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Class Type Selection */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 text-white font-medium">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <span>Session Type</span>
                  <Zap className="h-4 w-4 text-orange-400" />
                </label>
                <div className="relative">
                  <Select
                    value={bookingPreferences.selectedClassType?.id || ""}
                    onValueChange={(value) => {
                      const classType = CLASS_TYPES.find(ct => ct.id === value);
                      setBookingPreferences(prev => ({ ...prev, selectedClassType: classType || null }));
                    }}
                  >
                    <SelectTrigger className="bg-white/10 backdrop-blur-md border-white/20 text-white h-12 rounded-xl hover:bg-white/20 transition-all duration-300">
                      <SelectValue placeholder="Choose session type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700 text-white">
                      {CLASS_TYPES.map((classType) => (
                        <SelectItem key={classType.id} value={classType.id} className="hover:bg-slate-800 py-3">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">{classType.name}</span>
                              {classType.priceMultiplier < 1.0 && (
                                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1">
                                  {Math.round((1 - classType.priceMultiplier) * 100)}% OFF
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-400">{classType.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Live Price Display */}
            {(bookingPreferences.selectedSubject || bookingPreferences.selectedClassType) && (
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-xl rounded-2xl"></div>
                  <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl border border-green-400/30 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                          <DollarSign className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <span className="text-white font-semibold text-lg">Current Rate</span>
                          <div className="text-green-300 text-sm">per hour session</div>
                        </div>
                      </div>
                      <div className="text-center sm:text-right">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          {formatPrice((bookingPreferences.selectedSubject?.hourlyRate || tutor.hourlyRate) * (bookingPreferences.selectedClassType?.priceMultiplier || 1.0))}
                        </div>
                        {bookingPreferences.selectedClassType?.priceMultiplier !== 1.0 && (
                          <div className="text-sm text-green-300 font-medium mt-1">
                            {bookingPreferences.selectedClassType?.priceMultiplier && bookingPreferences.selectedClassType.priceMultiplier < 1.0 ? (
                              <div className="flex items-center gap-1 justify-center sm:justify-end">
                                <Sparkles className="h-3 w-3" />
                                Save {Math.round((1 - bookingPreferences.selectedClassType.priceMultiplier) * 100)}%
                              </div>
                            ) : (
                              "Premium session"
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert className="bg-red-500/10 backdrop-blur-xl border-red-500/30 text-red-100">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-semibold">Complete these steps to continue:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-red-200">{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Calendar and Time Slots Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Calendar Section */}
        <div className="xl:col-span-1">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-3xl rounded-3xl"></div>
            <Card className="relative bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
                <CardTitle className="flex items-center gap-3 text-xl text-white">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                    <CalendarDays className="h-5 w-5 text-white" />
                  </div>
                  Select Perfect Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                    <DateCalendar
                      value={dayjs(selectedDate)}
                      onChange={(newValue) => {
                        if (newValue) {
                          setSelectedDate(newValue.toDate());
                          setSelectedSlot(null);
                        }
                      }}
                      shouldDisableDate={(date) => {
                        const today = dayjs().startOf('day');
                        const maxDate = dayjs().add(30, 'day');
                        return date.isBefore(today) || date.isAfter(maxDate);
                      }}
                      sx={{
                        width: '100%',
                        fontFamily: 'inherit',
                        '& .MuiPickersLayout-root': { backgroundColor: 'transparent' },
                        '& .MuiPickersCalendarHeader-root': { paddingX: '12px', marginBottom: '16px', minHeight: '40px' },
                        '& .MuiPickersCalendarHeader-label': { 
                          fontSize: '1.2rem', 
                          fontWeight: '700', 
                          color: 'white',
                          textShadow: '0 0 20px rgba(255,255,255,0.5)'
                        },
                        '& .MuiPickersArrowSwitcher-button': {
                          color: 'white', 
                          backgroundColor: 'rgba(255,255,255,0.1)', 
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255,255,255,0.2)', 
                          borderRadius: '12px',
                          width: '36px', 
                          height: '36px',
                          '&:hover': { 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            transform: 'scale(1.05)',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)'
                          }
                        },
                        '& .MuiDayCalendar-weekDayLabel': { 
                          color: 'rgba(255,255,255,0.7)', 
                          fontSize: '0.8rem', 
                          fontWeight: '600', 
                          textTransform: 'uppercase'
                        },
                        '& .MuiPickersDay-root': {
                          fontSize: '0.9rem', 
                          color: 'white', 
                          backgroundColor: 'rgba(255,255,255,0.05)', 
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '12px', 
                          width: '40px', 
                          height: '40px', 
                          margin: '2px',
                          transition: 'all 0.3s ease',
                          '&:hover': { 
                            backgroundColor: 'rgba(59, 130, 246, 0.3)', 
                            borderColor: 'rgba(59, 130, 246, 0.5)',
                            transform: 'scale(1.1)',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)'
                          },
                          '&.Mui-selected': { 
                            backgroundColor: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
                            color: 'white', 
                            fontWeight: '700',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.6)',
                            '&:hover': { 
                              backgroundColor: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                              transform: 'scale(1.1)'
                            } 
                          },
                          '&.MuiPickersDay-today': { 
                            backgroundColor: 'rgba(251, 191, 36, 0.2)', 
                            borderColor: 'rgba(251, 191, 36, 0.5)', 
                            fontWeight: '700',
                            '&.Mui-selected': { 
                              backgroundColor: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                              borderColor: 'rgba(59, 130, 246, 0.8)'
                            } 
                          },
                          '&.Mui-disabled': { 
                            color: 'rgba(255,255,255,0.3)', 
                            backgroundColor: 'rgba(255,255,255,0.02)', 
                            opacity: 0.4 
                          }
                        }
                      }}
                    />
                  </div>
                </LocalizationProvider>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Time Slots Section */}
        <div className="xl:col-span-2">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-3xl rounded-3xl"></div>
            <Card className="relative bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
              <CardHeader className="pb-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20">
                <CardTitle className="flex items-center justify-between text-xl text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span>Available Sessions</span>
                      <div className="text-sm text-purple-200 font-normal">Choose your perfect time</div>
                    </div>
                  </div>
                  {selectedDate && (
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2">
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingSlots ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-400 mx-auto" />
                        <div className="absolute inset-0 h-12 w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-25 animate-ping mx-auto"></div>
                      </div>
                      <p className="text-lg text-purple-200 font-medium">Finding perfect slots...</p>
                      <p className="text-sm text-purple-300">This will only take a moment</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredSlots.length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                          {filteredSlots.map((slot) => {
                            const duration = calculateDuration(slot.startTime, slot.endTime);
                            const totalPrice = calculatePrice(slot);
                            const isSelected = selectedSlot?.slotId === slot.slotId;
                            
                            return (
                              <Button
                                key={slot.slotId}
                                variant="outline"
                                size="sm"
                                disabled={slot.status !== "AVAILABLE"}
                                onClick={() => handleSlotClick(slot)}
                                className={`relative h-auto p-4 rounded-2xl transition-all duration-300 overflow-hidden group ${
                                  isSelected
                                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-2xl scale-105 transform"
                                    : slot.status === "AVAILABLE"
                                    ? "bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:border-purple-400/50 hover:scale-105 hover:shadow-xl"
                                    : "bg-white/5 backdrop-blur-md border-white/10 text-white/50 opacity-50 cursor-not-allowed"
                                }`}
                              >
                                {isSelected && (
                                  <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-90"></div>
                                    <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-white z-10" />
                                  </>
                                )}
                                
                                <div className="relative z-10 text-center w-full space-y-2">
                                  <div className="font-bold text-lg">
                                    {formatTime(slot.startTime)}
                                  </div>
                                  <div className="text-sm opacity-90">
                                    to {formatTime(slot.endTime)}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {duration}h • {slot.dayOfWeek}
                                  </div>
                                  
                                  {slot.status === "AVAILABLE" && (
                                    <div className="pt-2 space-y-1">
                                      <div className="flex items-center justify-center gap-1 text-xs">
                                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                        <span>{slot.rating}/5</span>
                                      </div>
                                      {bookingPreferences.selectedSubject && bookingPreferences.selectedClassType && (
                                        <div className="font-bold text-sm bg-white/20 backdrop-blur-md rounded-lg px-2 py-1">
                                          {formatPrice(totalPrice)}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {slot.status === "BOOKED" && (
                                    <Badge variant="destructive" className="text-xs">
                                      Booked
                                    </Badge>
                                  )}
                                </div>
                                
                                {!isSelected && slot.status === "AVAILABLE" && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                        
                        {/* Proceed Button */}
                        <div className="pt-6 border-t border-white/20">
                          <Button
                            onClick={handleProceedToPayment}
                            disabled={!canProceed}
                            className={`w-full h-16 text-xl font-bold rounded-2xl transition-all duration-500 relative overflow-hidden group ${
                              canProceed 
                                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-2xl hover:scale-105 hover:shadow-green-500/25" 
                                : "bg-white/10 backdrop-blur-md text-white/50 cursor-not-allowed border border-white/20"
                            }`}
                          >
                            {canProceed && (
                              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 group-hover:from-green-400/30 group-hover:to-emerald-400/30 transition-all duration-300"></div>
                            )}
                            
                            <div className="relative z-10 flex items-center justify-center gap-3">
                              {canProceed && selectedSlot ? (
                                <>
                                  <Sparkles className="h-6 w-6 animate-pulse" />
                                  <div className="flex flex-col">
                                    <span>Continue to Payment</span>
                                    <span className="text-sm font-normal opacity-90">
                                      {formatPrice(calculatePrice(selectedSlot))} • {calculateDuration(selectedSlot.startTime, selectedSlot.endTime)}h session
                                    </span>
                                  </div>
                                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-6 w-6" />
                                  <span>Complete All Selections</span>
                                </>
                              )}
                            </div>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-20 space-y-6">
                        <div className="relative mx-auto w-20 h-20">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-pulse"></div>
                          <div className="relative bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center w-20 h-20">
                            <CalendarDays className="h-10 w-10 text-purple-300" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <p className="text-xl font-semibold text-white">
                            {availableSlots.length === 0 ? "No sessions available" : "All sessions booked today"}
                          </p>
                          <p className="text-purple-200">
                            {availableSlots.length === 0
                              ? "Try selecting a different date to see available sessions"
                              : "Choose another date to find available time slots"
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

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7c3aed, #db2777);
        }
      `}</style>
    </div>
  );
};
