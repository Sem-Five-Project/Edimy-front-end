'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { bookingAPI } from '@/lib/api';
import { 
  type WeekBreakdown, 
  type SelectedSlotPattern, 
  type OccurrenceSlot, 
  type MonthlyClassBooking, 
  type BookMonthlyClassReq 
} from '@/types/monthlyBooking';

interface MonthlyClassBookingProps {
  tutorId: string;
  subjectId: string;
  languageId: string;
  onBookingSuccess: (bookingData: MonthlyClassBooking) => void;
  onBookingError: (error: string) => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday', dayOfWeek: 1 },
  { value: 2, label: 'Tuesday', dayOfWeek: 2 },
  { value: 3, label: 'Wednesday', dayOfWeek: 3 },
  { value: 4, label: 'Thursday', dayOfWeek: 4 },
  { value: 5, label: 'Friday', dayOfWeek: 5 },
  { value: 6, label: 'Saturday', dayOfWeek: 6 },
  { value: 0, label: 'Sunday', dayOfWeek: 0 },
];

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

const SLOT_COST = 1500; // LKR per slot

export default function MonthlyClassBooking({
  tutorId,
  subjectId,
  languageId,
  onBookingSuccess,
  onBookingError
}: MonthlyClassBookingProps) {
  // State management
  const [selectedPatterns, setSelectedPatterns] = useState<SelectedSlotPattern[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<'select' | 'review' | 'confirm'>('select');
  // Pattern management (single definition)
  const addPattern = useCallback((dayOfWeek: number, times: string[]) => {
    if (selectedPatterns.length >= 4) {
      setError('Maximum 4 patterns allowed per week');
      return;
    }

    const [startTime, endTime] = times;
    const newPattern: SelectedSlotPattern = {
      id: `${dayOfWeek}_${Date.now()}`,
      dayOfWeek,
      times,
      startTime,
      endTime,
      generatedSlots: []
    };

    setSelectedPatterns(prev => [...prev, newPattern]);
    setError('');
  }, [selectedPatterns.length]);

  const removePattern = useCallback((patternId: string) => {
    setSelectedPatterns(prev => prev.filter(p => p.id !== patternId));
  }, []);

  // Generate dates from current date to end of month
  const generateMonthlySlots = useCallback((patterns: SelectedSlotPattern[]): OccurrenceSlot[] => {
    const slots: OccurrenceSlot[] = [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    patterns.forEach(pattern => {
      let date = new Date(now);
        
      // Find the next occurrence of this day of week
      while (date.getDay() !== pattern.dayOfWeek) {
        date.setDate(date.getDate() + 1);
      }

      // Generate all occurrences until end of month
      while (date.getMonth() === currentMonth) {
        const slot: OccurrenceSlot = {
          id: `${pattern.dayOfWeek}_${pattern.startTime}_${date.toISOString().split('T')[0]}`,
          dateTime: date.toISOString(),
          date: date.toISOString().split('T')[0],
          dayOfWeek: pattern.dayOfWeek,
          startTime: pattern.startTime,
          endTime: pattern.endTime,
          start: pattern.startTime,
          end: pattern.endTime,
          isAvailable: true,
          isLocked: false
        };

        slots.push(slot);

        // Move to next week
        date.setDate(date.getDate() + 7);
      }
    });

    return slots.sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
  }, []);

  // Generate slots and weekly breakdown whenever patterns change
  const { slots, weekBreakdown, totalSlots } = useMemo(() => {
    const slots = generateMonthlySlots(selectedPatterns);
    const weeks: Record<string, OccurrenceSlot[]> = {};

    // Group slots by week (Monday as start)
    slots.forEach(slot => {
      const date = new Date(slot.dateTime);
      const weekStart = new Date(date);
      const day = date.getDay();
      // Calculate Monday of current week: if Sunday (0) go back 6 days, else go to (1 - day)
      const diff = day === 0 ? -6 : 1 - day;
      weekStart.setDate(date.getDate() + diff);
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeks[weekKey]) weeks[weekKey] = [];
      weeks[weekKey].push(slot);
    });

    const breakdown = Object.entries(weeks).map(([weekStart, weekSlots]) => ({
      weekStartDate: weekStart,
      date: weekStart,
      slots: weekSlots,
      total: weekSlots.length,
      totalSlots: weekSlots.length
    }));

    return {
      slots,
      weekBreakdown: breakdown,
      totalSlots: slots.length
    };
  }, [selectedPatterns, generateMonthlySlots]);

  const totalCost = totalSlots * SLOT_COST;


  const handleBooking = useCallback(async () => {
    if (totalSlots === 0) {
      setError('Please select at least one slot pattern');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const bookingRequest: BookMonthlyClassReq = {
        tutorId,
        subjectId,
        languageId,
        patterns: selectedPatterns,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
      };

      const response = await bookingAPI.bookMonthlyClass(bookingRequest);

      if (response.success && response.data.success) {
        const bookingData: MonthlyClassBooking = {
          id: `monthly_${Date.now()}`,
          tutorId,
          subjectId,
          languageId,
          patterns: selectedPatterns,
          weekBreakdown,
          totalSlots,
          totalCost,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          startDate: bookingRequest.startDate,
          endDate: bookingRequest.endDate
        };
        onBookingSuccess(bookingData);
      } else {
        if (response.data.failedSlots && response.data.failedSlots.length > 0) {
          const failedTimes = response.data.failedSlots.map((slot: { dayOfWeek: number; time: string; reason: string }) => 
            `${DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label} ${slot.time}`
          ).join(', ');
          setError(`The following slots are no longer available: ${failedTimes}`);
        } else {
          setError(response.error || 'Failed to book monthly class');
        }
        onBookingError(response.error || 'Failed to book monthly class');
      }
    } catch (error) {
      const errorMessage = 'Failed to book monthly class. Please try again.';
      setError(errorMessage);
      onBookingError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tutorId, subjectId, languageId, selectedPatterns, totalSlots, totalCost, weekBreakdown, onBookingSuccess, onBookingError]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CalendarDays className="h-5 w-5" />
            Monthly Class Booking
          </CardTitle>
          <p className="text-sm text-blue-700">
            Select up to 4 weekly time patterns. Classes will automatically repeat every week until month end.
          </p>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step 1: Pattern Selection */}
      {currentStep === 'select' && (
        <div className="space-y-6">
          {/* Day Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Select Days & Times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                {DAYS_OF_WEEK.map(day => (
                  <DayTimeSelector
                    key={day.value}
                    day={day}
                    onPatternAdd={(times) => addPattern(day.value, times)}
                    disabled={selectedPatterns.length >= 4}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Patterns */}
          {selectedPatterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Selected Patterns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedPatterns.map(pattern => (
                    <div key={pattern.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-100">
                          {DAYS_OF_WEEK.find(d => d.value === pattern.dayOfWeek)?.label}
                        </Badge>
                        <div className="flex gap-1">
                          {pattern.times.map(time => (
                            <Badge key={time} variant="secondary" className="text-xs">
                              {time}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePattern(pattern.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Button */}
          {selectedPatterns.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={() => setCurrentStep('review')} className="bg-blue-600 hover:bg-blue-700">
                Review Schedule ({totalSlots} slots)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Review Schedule */}
      {currentStep === 'review' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Review Your Monthly Schedule</h3>
            <Button variant="outline" onClick={() => setCurrentStep('select')}>
              Back to Edit
            </Button>
          </div>

          {/* Cost Summary */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Classes This Month</p>
                  <p className="text-2xl font-bold text-green-600">{totalSlots} slots</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold text-blue-600">LKR {totalCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Breakdown */}
          <div className="space-y-4">
            <h4 className="font-medium">Weekly Schedule</h4>
            <div className="space-y-3">
              {weekBreakdown.map((week, index) => (
                <Card key={week.weekStartDate}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Week {index + 1} - {new Date(week.weekStartDate).toLocaleDateString()}
                      </CardTitle>
                      <Badge variant="outline">{week.totalSlots} slots</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {week.slots.map(slot => (
                        <div key={slot.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <Clock className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            {DAYS_OF_WEEK.find(d => d.value === slot.dayOfWeek)?.label} {slot.startTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleBooking}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 px-8"
            >
              {isLoading ? 'Booking...' : `Confirm Booking - LKR ${totalCost.toLocaleString()}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Day-Time Selector Component
interface DayTimeSelectorProps {
  day: { value: number; label: string };
  onPatternAdd: (times: string[]) => void;
  disabled: boolean;
}

function DayTimeSelector({ day, onPatternAdd, disabled }: DayTimeSelectorProps) {
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  const toggleTime = (time: string) => {
    setSelectedTimes(prev => 
      prev.includes(time) 
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  const addPattern = () => {
    if (selectedTimes.length > 0) {
      onPatternAdd(selectedTimes);
      setSelectedTimes([]);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{day.label}</h4>
        {selectedTimes.length > 0 && (
          <Button 
            size="sm" 
            onClick={addPattern}
            disabled={disabled}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Pattern ({selectedTimes.length} times)
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {TIME_SLOTS.map(time => (
          <Button
            key={time}
            variant={selectedTimes.includes(time) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleTime(time)}
            disabled={disabled}
            className={selectedTimes.includes(time) ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {time}
          </Button>
        ))}
      </div>
    </div>
  );
}
