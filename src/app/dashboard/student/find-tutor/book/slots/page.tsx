"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar as MonthCalendar } from "@/components/ui/calendar";
import { Calendar as WeekCalendar } from "@/components/ui/weekcalendar";
import { BookingProgress } from "@/components/ui/booking-progress";
import { TutorInfoCard } from "@/components/ui/tutor-info-card";
import { StyledSelect } from "@/components/ui/styled-select";
import { CurrencySelector } from "@/components/ui/currency-selector";
// Monthly booking UI is integrated inline on this page; removing old demo imports
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
  Timer,
  X
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter } from "next/navigation";
import { bookingAPI, tutorAPI } from "@/lib/api";
import { TimeSlot, CLASS_TYPES, BookingPreferences, type MonthlyClassBooking as MonthlyBookingType, type SelectedSlotPattern, type RecurringSlot, type WeekBreakdown, type BookMonthlyClassReq } from "@/types";

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
  const [monthlyBookingData, setMonthlyBookingData] = useState<MonthlyBookingType | null>(null);

  // Monthly selection state
  const [selectedPatterns, setSelectedPatterns] = useState<SelectedSlotPattern[]>([]);
  const [generatedSlots, setGeneratedSlots] = useState<RecurringSlot[]>([]);
  const [weekBreakdown, setWeekBreakdown] = useState<WeekBreakdown[]>([]);
  const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  // Exclusions: user-removed occurrences by id
  const [excludedOccurrenceIds, setExcludedOccurrenceIds] = useState<string[]>([]);
  // Pre-payment option to also book next month with the same recurring times
  const [alsoBookNextMonth, setAlsoBookNextMonth] = useState<boolean>(false);

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
      const dateString = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const response = await tutorAPI.getTutorSlots(
        tutor.tutorProfileId.toString(),
        dateString,
        isMonthlyClassType ? true : null
      );
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

  // Helpers for monthly flow
  const getDayOfWeek1to7 = (date: Date) => {
    const jsDay = date.getDay(); // 0-6 Sun-Sat
    return jsDay === 0 ? 7 : jsDay; // 1-7 Mon-Sun
  };

  const formatTimeRangeLabel = (range: string) => {
    // range: "HH:mm-HH:mm"
    const [s, e] = range.split("-");
    const sDate = new Date(`2000-01-01T${s}:00`);
    const eDate = new Date(`2000-01-01T${e}:00`);
    const f = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${f(sDate)} - ${f(eDate)}`;
  };

  const hoursFromRange = (range: string) => {
    const [s, e] = range.split("-");
    const sDate = new Date(`2000-01-01T${s}:00`);
    const eDate = new Date(`2000-01-01T${e}:00`);
    return (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60);
  };

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]; const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getMonthDateRange = () => {
    const now = new Date();
    const start = new Date(Math.max(now.setHours(0,0,0,0), (selectedDate ? new Date(selectedDate) : new Date()).setHours(0,0,0,0)));
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // last day of current month from start
    end.setHours(23,59,59,999);
    return { start, end };
  };

  const generateOccurrences = async (patterns: SelectedSlotPattern[]) => {
    if (!tutor) return { all: [] as RecurringSlot[], weeks: [] as WeekBreakdown[] };
    const { start, end } = getMonthDateRange();

    // Collect all dates we need to check
    const datesToCheck: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      // If any pattern matches this weekday, we need to check this date
      if (patterns.some(p => p.dayOfWeek === getDayOfWeek1to7(cursor))) {
        datesToCheck.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    // Fetch slots for each date in parallel
    const results = await Promise.all(
      datesToCheck.map(async (d) => {
        const dateString = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        try {
          const res = await tutorAPI.getTutorSlots(
            tutor.tutorProfileId.toString(),
            dateString,
            true
          );
          return { date: d, slots: res.success ? res.data : [] as TimeSlot[] };
        } catch {
          return { date: d, slots: [] as TimeSlot[] };
        }
      })
    );

    // Build recurring slots
    const occurrences: RecurringSlot[] = [];
    for (const p of patterns) {
      for (const range of p.times) {
        const [s, e] = range.split("-");
        for (const r of results) {
          if (getDayOfWeek1to7(r.date) !== p.dayOfWeek) continue;
          // Check availability by matching start/end
          const found = r.slots.find(sl => sl.startTime.startsWith(s) && sl.endTime.startsWith(e));
          const dateStr = `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}-${String(r.date.getDate()).padStart(2,'0')}`;
          const iso = `${dateStr}T${s}:00`;
          occurrences.push({
            id: `${p.id}:${dateStr}:${range}`,
            dateTime: iso,
            dayOfWeek: p.dayOfWeek,
            time: range,
            isAvailable: !!found && found.status === 'AVAILABLE',
            patternId: p.id,
          });
        }
      }
    }

    // Group by week start (Monday)
    const groupByWeek = new Map<string, RecurringSlot[]>();
    occurrences.forEach(o => {
      const d = new Date(o.dateTime);
      const day = d.getDay(); // 0-6 Sun-Sat
      const diffToMonday = (day === 0 ? -6 : 1 - day); // move back to Monday
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      monday.setHours(0,0,0,0);
      const key = monday.toISOString().slice(0,10);
      const arr = groupByWeek.get(key) || [];
      arr.push(o);
      groupByWeek.set(key, arr);
    });

    const weeks: WeekBreakdown[] = Array.from(groupByWeek.entries())
      .sort((a,b) => a[0] < b[0] ? -1 : 1)
      .map(([weekStartDate, slots]) => ({
        weekStartDate,
        slots: slots.sort((a,b) => a.dateTime.localeCompare(b.dateTime)),
        totalSlots: slots.length,
      }));

    return { all: occurrences.sort((a,b) => a.dateTime.localeCompare(b.dateTime)), weeks };
  };

  const recomputeMonthlyTotals = (occurrences: RecurringSlot[]) => {
    if (!tutor) return 0;
    const base = preferences.selectedSubject?.hourlyRate || tutor.hourlyRate || 0;
    // No monthly discount: remove multiplier
    const totalHours = occurrences.reduce((sum, o) => sum + hoursFromRange(o.time), 0);
    return totalHours * base;
  };

  // Derived lists for monthly
  const visibleOccurrences = generatedSlots.filter(o => !excludedOccurrenceIds.includes(o.id));
  const visibleAvailableOccurrences = visibleOccurrences.filter(o => o.isAvailable);
  const hasBlockedRemaining = visibleOccurrences.some(o => !o.isAvailable);

  const isValid = () => {
    if (!tutor) return false;
    
    // For monthly classes, check if monthly booking data exists
    if (preferences.selectedClassType?.id === 2) {
      return selectedPatterns.length > 0 && 
             preferences.selectedSubject && 
             (tutor.languages.length <= 1 || preferences.selectedLanguage) &&
             !hasBlockedRemaining &&
             visibleAvailableOccurrences.length > 0;
    }
    
    // For other class types, check slot selection
    return selectedSlotLocal && 
           preferences.selectedSubject && 
           preferences.selectedClassType &&
           (tutor.languages.length <= 1 || preferences.selectedLanguage);
  };

  const isMonthlyClassType = preferences.selectedClassType?.id === 2;

  // When patterns change, regenerate occurrences and totals
  useEffect(() => {
    (async () => {
  if (isMonthlyClassType && selectedPatterns.length > 0) {
    const { all, weeks } = await generateOccurrences(selectedPatterns);
    setGeneratedSlots(all);
    setWeekBreakdown(weeks);
    // Reset exclusions if patterns changed fundamentally (optional: keep if same ids)
    // setExcludedOccurrenceIds([]);
    const filtered = all.filter(o => !excludedOccurrenceIds.includes(o.id) && o.isAvailable);
    setMonthlyTotal(recomputeMonthlyTotals(filtered));
      } else {
        setGeneratedSlots([]);
        setWeekBreakdown([]);
        setMonthlyTotal(0);
    setExcludedOccurrenceIds([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedPatterns), preferences.selectedSubject, preferences.selectedClassType, tutor, JSON.stringify(excludedOccurrenceIds)]);


  const handleContinue = async () => {
  if (!isValid()) {
    setError("Please complete all selections to continue");
    return;
  }

  try {
    setIsLoading(true);
    setError('');

    // Handle monthly class bookings differently
    if (preferences.selectedClassType?.id === 2) {
      // Build API payload
      const { start, end } = getMonthDateRange();
      const payload: BookMonthlyClassReq = {
        tutorId: String(tutor!.tutorProfileId),
        subjectId: String(preferences.selectedSubject!.subjectId),
        languageId: String((preferences.selectedLanguage || tutor!.languages[0]).languageId),
        patterns: selectedPatterns,
        startDate: `${start.getFullYear()}-${String(start.getMonth()+1).padStart(2,'0')}-${String(start.getDate()).padStart(2,'0')}`,
        endDate: `${end.getFullYear()}-${String(end.getMonth()+1).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`,
      };

      const resp = await bookingAPI.bookMonthlyClass(payload);
      if (!resp.success) {
        // Show which patterns likely have conflicts
        if (resp.data?.failedSlots && resp.data.failedSlots.length > 0) {
          const msgs = resp.data.failedSlots.map(f => `Day ${f.dayOfWeek} at ${f.time} — ${f.reason}`).join("; ");
          setError(`Some recurring times are unavailable: ${msgs}. Remove blocked times to proceed.`);
        } else {
          setError(resp.error || 'Failed to create monthly booking');
        }
        setIsLoading(false);
        return;
      }

      // Compose local monthly booking data for payment step
      const booking: MonthlyBookingType = {
        id: resp.data?.bookingId || `monthly-${Date.now()}`,
        tutorId: String(tutor!.tutorProfileId),
        subjectId: String(preferences.selectedSubject!.subjectId),
        languageId: String((preferences.selectedLanguage || tutor!.languages[0]).languageId),
        patterns: selectedPatterns,
        weekBreakdown,
        totalSlots: generatedSlots.filter(s => s.isAvailable).length,
        totalCost: monthlyTotal,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        startDate: payload.startDate,
        endDate: payload.endDate,
      };

      setMonthlyBookingData(booking);
  const finalPreferences = { ...preferences, finalPrice: monthlyTotal };
      setBookingPreferences(finalPreferences);

      // setReservationDetails({
      //   reservationId: booking.id,
      //   expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      //   timer: 900,
      // });

      await new Promise(resolve => setTimeout(resolve, 100));
      proceedToStep('payment');
      router.push('/dashboard/student/find-tutor/book/payment');
      return;
    }

    // Handle regular slot bookings
    if (!selectedSlotLocal) {
      setError("Please select a valid slot");
      return;
    }
    console.log("Selected slot for booking:", selectedSlotLocal);

    // Try to reserve the slot first
    const response = await bookingAPI.reserveSlot(selectedSlotLocal.slotId);
    console.log('Reserve slot response:', response);

    if (!response.success) {
      console.log('Slot reservation failed:', response);
      setError(response.message || "This slot is currently unavailable");
      return;
    }

    console.log('Slot reserved successfully:');
    
    // Only proceed if slot reservation was successful
    const finalPreferences = {
      ...preferences,
      finalPrice: calculatePrice()
    };
    
    // Set all required data in context before navigation
    setSelectedSlot(selectedSlotLocal);
    setBookingPreferences(finalPreferences);
    
      // Set reservation details
      setReservationDetails({
        reservationSlotId: response.slotId || `temp-${Date.now()}`,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        timer: 900
      });    // Add a small delay to ensure context is updated
    await new Promise(resolve => setTimeout(resolve, 100));

    // Navigate to payment page
    proceedToStep('payment');
    console.log('Navigating to payment page');
    router.push('/dashboard/student/find-tutor/book/payment');

  } catch (error) {
    console.error("Booking error:", error);
    setError("Failed to process booking. Please try again.");
  } finally {
    setIsLoading(false);
  }
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
    value: type.id.toString(),
    label: type.name,
    //badge: type.priceMultiplier < 1.0 ? `${Math.round((1 - type.priceMultiplier) * 100)}% OFF` : undefined
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress Bar */}
      <BookingProgress currentStep={currentStep} />
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
          {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
                value={preferences.selectedClassType?.id?.toString() || ""}
                onValueChange={(value) => {
                  const classType = CLASS_TYPES.find(ct => ct.id === Number(value));
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


        {/* Monthly selection bar and summary */
        // Controls included: per-locked occurrence removal and continue-from-week
        }
        {isMonthlyClassType && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-200 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Monthly Class Schedule
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select up to 4 weekly recurring time patterns. Click times on the right to add.
              </p>
            </CardHeader>
            <CardContent>
              {/* Selected patterns horizontal bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {selectedPatterns.length === 0 && (
                  <div className="text-sm text-gray-500">No patterns yet. Pick times from the list →</div>
                )}
                {selectedPatterns.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-600 text-white shadow">
                    <span className="font-medium">
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][p.dayOfWeek-1]} • {formatTimeRangeLabel(p.times[0])}
                    </span>
                    <button
                      aria-label="Remove pattern"
                      className="p-1 rounded-full hover:bg-white/20"
                      onClick={() => {
                        setSelectedPatterns(prev => prev.filter(x => x.id !== p.id));
                        // Also exclude any occurrences belonging to this pattern from exclusions list
                        setExcludedOccurrenceIds(prev => prev.filter(id => !id.startsWith(`${p.id}:`)));
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Weekly breakdown */}
              {weekBreakdown.length > 0 && (
                <div className="mt-4 space-y-3">
                  {weekBreakdown.map((week, idx) => {
                    const weekVisible = week.slots.filter(s => !excludedOccurrenceIds.includes(s.id));
                    const weekHasBlocked = weekVisible.some(s => !s.isAvailable);
                    const allBlocked = weekVisible.length > 0 && weekVisible.every(s => !s.isAvailable);
                    return (
                      <div key={week.weekStartDate} className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-white/60 dark:bg-blue-950/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold flex items-center gap-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">{idx+1}</span>
                            <span>{ordinal(idx+1)} Week</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              {(() => { const start = new Date(week.weekStartDate); const end = new Date(start); end.setDate(start.getDate()+6); return `${start.toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${end.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`; })()}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {idx > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Continue from this week: remove all earlier weeks
                                  const earlierWeeks = weekBreakdown
                                    .filter(w => w.weekStartDate < week.weekStartDate)
                                    .flatMap(w => w.slots.map(s => s.id));
                                  setExcludedOccurrenceIds(prev => Array.from(new Set([...prev, ...earlierWeeks])));
                                }}
                              >
                                Continue from this week
                              </Button>
                            )}
                            {allBlocked && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  const ids = weekVisible.map(s => s.id);
                                  setExcludedOccurrenceIds(prev => Array.from(new Set([...prev, ...ids])));
                                }}
                              >
                                Remove this week
                              </Button>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                         {weekVisible.map((s) => {
  const d = new Date(s.dateTime);
  const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  const isAvailable = s.isAvailable;

  return (
    <span
      key={s.id}
      className={`inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border shadow-sm transition-all duration-200 ${
        isAvailable
          ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800 dark:from-green-900/40 dark:to-green-800/20 dark:text-green-300 dark:border-green-700 hover:shadow-md'
          : 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800 dark:from-red-900/40 dark:to-red-800/20 dark:text-red-300 dark:border-red-700 hover:shadow-md'
      }`}
    >
      <span className="font-medium">
        {day} {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
      </span>
              <span className="text-gray-500 dark:text-gray-400">
                • {formatTimeRangeLabel(s.time)}
              </span>

              {!isAvailable && (
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                    (locked)
                  </span>
                  <button
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    onClick={() =>
                      setExcludedOccurrenceIds((prev) =>
                        Array.from(new Set([...prev, s.id]))
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </span>
          );
        })}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="animate-in slide-in-from-left-4 duration-500 delay-200 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                {isMonthlyClassType ? 'Select a weekday (recurring)' : 'Select Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
             {isMonthlyClassType ? (
               <WeekCalendar
                 onSelect={(dates) => {
                   if (Array.isArray(dates) && dates.length > 0) {
                     setSelectedDate(dates[0]);
                   }
                 }}
                 onMonthChange={(month) => {
                   // Reset monthly selections when switching the displayed month
                   setSelectedPatterns([]);
                   setGeneratedSlots([]);
                   setWeekBreakdown([]);
                   setExcludedOccurrenceIds([]);
                   setMonthlyTotal(0);
                   // Move selectedDate to the first day of the new month (optional)
                   const d = new Date(month);
                   d.setDate(1);
                   setSelectedDate(d);
                 }}
                 disabled={(date) => {
                   const today = new Date();
                   today.setHours(0,0,0,0);
                   return date < today; // allow future months
                 }}
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
                   row: "flex w-full mt-1 sm:mt-2",
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
             ) : (
               <MonthCalendar
                 mode="single"
                 selected={selectedDate || undefined}
                 onSelect={(date) => {
                   if (date && !Array.isArray(date) && typeof date === 'object' && 'getTime' in date) {
                     setSelectedDate(date);
                     console.log("Selected date11:", date);
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
                   row: "flex w-full mt-1 sm:mt-2",
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
             )}
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
                      variant={isMonthlyClassType
                        ? (selectedPatterns.some(p => p.times[0].startsWith(slot.startTime.slice(0,5)) && p.dayOfWeek === getDayOfWeek1to7(selectedDate || new Date())) ? 'default' : 'outline')
                        : (selectedSlotLocal?.slotId === slot.slotId ? 'default' : 'outline')}
                      className={`
                        w-full justify-between h-auto p-4 transition-all duration-300 transform hover:scale-105
                        ${slot.status !== "AVAILABLE" ? "opacity-50 cursor-not-allowed" : ""}
                        ${isMonthlyClassType
                          ? (selectedPatterns.some(p => p.times[0].startsWith(slot.startTime.slice(0,5)) && p.dayOfWeek === getDayOfWeek1to7(selectedDate || new Date()))
                              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105"
                              : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600")
                          : (selectedSlotLocal?.slotId === slot.slotId 
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg scale-105" 
                          : "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600")
                        }
                      `}
                      disabled={slot.status !== "AVAILABLE"}
                      onClick={async () => {
                        if (isMonthlyClassType) {
                          if (!selectedDate) {
                            setError('Pick a date first');
                            return;
                          }
                          const dayOfWeek = getDayOfWeek1to7(selectedDate);
                          const range = `${slot.startTime.slice(0,5)}-${slot.endTime.slice(0,5)}`;
                          const exists = selectedPatterns.some(p => p.dayOfWeek === dayOfWeek && p.times[0] === range);
                          if (exists) {
                            // remove
                            setSelectedPatterns(prev => prev.filter(p => !(p.dayOfWeek === dayOfWeek && p.times[0] === range)));
                            return;
                          }
                          if (selectedPatterns.length >= 4) {
                            setError('You can select up to 4 weekly patterns');
                            return;
                          }
                          const newPattern: SelectedSlotPattern = {
                            id: `${dayOfWeek}-${range}`,
                            dayOfWeek,
                            times: [range],
                            generatedSlots: [],
                          };
                          setSelectedPatterns(prev => [...prev, newPattern]);
                          setError('');
                        } else {
                          setSelectedSlotLocal(slot);
                        }
                      }}
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
                      {!isMonthlyClassType && selectedSlotLocal?.slotId === slot.slotId && (
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
        {(preferences.selectedSubject && preferences.selectedClassType && (selectedSlotLocal || (isMonthlyClassType && selectedPatterns.length > 0))) && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-400 border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950/20 dark:to-gray-900">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">Booking Summary</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    {isMonthlyClassType ? (
                      <>
                        <div>Total Classes: {visibleAvailableOccurrences.length} slots</div>
                        <div>Weekly Patterns: {selectedPatterns.length}</div>
                        <div>Rate: {formatPrice(preferences.selectedSubject?.hourlyRate || 0)}/hr</div>
                        {hasBlockedRemaining && (
                          <div className="text-red-600 dark:text-red-400">Remove blocked times to proceed</div>
                        )}
                        {/* Also book next month option */}
                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={alsoBookNextMonth}
                              onChange={(e) => setAlsoBookNextMonth(e.target.checked)}
                              className="mt-1 h-4 w-4"
                            />
                            <span>
                              Also book next month with the same recurring times
                              <span className="block text-xs text-gray-500 dark:text-gray-400">We will apply the same weekday and time pattern for the next month window.</span>
                            </span>
                          </label>
                        </div>
                        {/* Payment timing notice */}
                        <div className="mt-3 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                          Please make the payment at least 30 minutes before the first class; otherwise all reserved slots will be automatically unbooked and you will need to book again.
                        </div>
                      </>
                    ) : selectedSlotLocal ? (
                      <>
                        <div>Duration: {calculateSlotHours(selectedSlotLocal)} hour{calculateSlotHours(selectedSlotLocal) !== 1 ? 's' : ''}</div>
                        <div>Rate: {formatPrice(preferences.selectedSubject?.hourlyRate || 0)}/hr</div>
                        {preferences.selectedClassType?.priceMultiplier !== 1.0 && (
                          <div className="text-green-600 dark:text-green-400">
                            Discount: {Math.round((1 - preferences.selectedClassType.priceMultiplier) * 100)}% off
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
                <div className="text-center sm:text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Amount</div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {isMonthlyClassType 
                      ? formatPrice(monthlyTotal)
                      : formatPrice(calculatePrice())
                    }
                  </div>
                  {selectedCurrency.code !== 'LKR' && (
                    <div className="text-xs text-gray-400 mb-2">
                      ≈ Rs. {isMonthlyClassType 
                        ? monthlyTotal.toFixed(2)
                        : calculatePrice().toFixed(2)
                      } LKR
                    </div>
                  )}
                  <Button 
                    onClick={handleContinue}
                    disabled={!isValid() || isLoading}
                    size="lg"
                    className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isValid() ? (
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