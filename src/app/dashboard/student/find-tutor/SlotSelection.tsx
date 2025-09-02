"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import { Tutor, TimeSlot } from "@/types";
import { TutorHeader } from "./TutorHeader";
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
  onSelectSlot: (slot: TimeSlot) => void;
}

export const SlotSelection: React.FC<SlotSelectionProps> = ({
  tutor,
  selectedDate,
  setSelectedDate,
  availableSlots,
  isLoadingSlots,
  onSelectSlot,
}) => {
  const formatTime = (time: string) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // Filter out past time slots for today
  const getFilteredSlots = () => {
    const today = new Date();
    const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // If selected date is not today, return all slots
    if (selectedDateOnly.getTime() !== todayOnly.getTime()) {
      return availableSlots;
    }
    
    // If selected date is today, filter out past time slots
    const currentTime = today.getHours() * 60 + today.getMinutes(); // Current time in minutes
    
    return availableSlots.filter(slot => {
      const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
      const slotTime = startHours * 60 + startMinutes; // Slot time in minutes
      return slotTime > currentTime; // Only show future slots
    });
  };

  const filteredSlots = getFilteredSlots();

  return (
    <div className="space-y-6">
      <TutorHeader tutor={tutor} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Calendar Section - Fixed width on large screens */}
        <div className="lg:max-w-lg">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
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
                      
                      '& .MuiPickersLayout-root': {
                        backgroundColor: 'transparent',
                      },
                      
                      '& .MuiPickersCalendarHeader-root': {
                        paddingX: '12px',
                        marginBottom: '12px',
                        minHeight: '40px',
                      },
                      
                      '& .MuiPickersCalendarHeader-label': {
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1f2937',
                      },
                      
                      '& .MuiPickersArrowSwitcher-button': {
                        color: '#6b7280',
                        backgroundColor: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        width: '32px',
                        height: '32px',
                        '&:hover': {
                          backgroundColor: '#f3f4f6',
                          borderColor: '#2563eb',
                        },
                      },
                      
                      '& .MuiDayCalendar-header': {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        marginBottom: '8px',
                      },
                      
                      '& .MuiDayCalendar-weekDayLabel': {
                        color: '#6b7280',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        textAlign: 'center',
                      },
                      
                      '& .MuiDayCalendar-weekContainer': {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '4px',
                        margin: '2px 0',
                      },
                      
                      '& .MuiPickersDay-root': {
                        fontSize: '0.875rem',
                        color: '#374151',
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        width: '36px',
                        height: '36px',
                        margin: '0',
                        
                        '&:hover': {
                          backgroundColor: '#eff6ff',
                          borderColor: '#2563eb',
                        },
                        
                        '&.Mui-selected': {
                          backgroundColor: '#2563eb',
                          color: 'white',
                          fontWeight: '600',
                          '&:hover': {
                            backgroundColor: '#1d4ed8',
                          },
                        },
                        
                        '&.MuiPickersDay-today': {
                          backgroundColor: '#fef3c7',
                          borderColor: '#f59e0b',
                          fontWeight: '600',
                          '&.Mui-selected': {
                            backgroundColor: '#2563eb',
                            borderColor: '#2563eb',
                          },
                        },
                        
                        '&.Mui-disabled': {
                          color: '#9ca3af',
                          backgroundColor: '#f9fafb',
                          opacity: 0.5,
                        },
                        
                        '&.MuiPickersDay-outsideCurrentMonth': {
                          color: '#9ca3af',
                          backgroundColor: 'transparent',
                        },
                      },
                    }}
                  />
                </div>
              </LocalizationProvider>
            </CardContent>
          </Card>
        </div>

        {/* Time Slots Section */}
        <div className="flex-1">
          <Card className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between text-lg text-gray-900 dark:text-white">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  Available Times
                </div>
                {selectedDate && (
                  <Badge variant="secondary" className="text-xs">
                    {selectedDate.toLocaleDateString("en-US", {
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
                <div className="space-y-3">
                  {filteredSlots.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                      {filteredSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant={slot.status === "AVAILABLE" ? "outline" : "secondary"}
                          size="sm"
                          disabled={slot.status !== "AVAILABLE"}
                          onClick={() => onSelectSlot(slot)}
                          className={`h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-200 ${
                            slot.status === "AVAILABLE"
                              ? "hover:bg-blue-50 hover:border-blue-300 hover:shadow-sm border-2"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                        >
                          <div className="text-center w-full">
                            <div className="font-semibold text-sm">
                              {formatTime(slot.startTime)}
                            </div>
                            <div className="text-xs text-gray-600">
                              to {formatTime(slot.endTime)}
                            </div>
                            {slot.status === "BOOKED" && (
                              <Badge variant="destructive" className="text-xs mt-2">
                                Booked
                              </Badge>
                            )}
                            {slot.status === "AVAILABLE" && (
                              <div className="text-xs mt-1 font-medium text-blue-600">
                                ${slot.price || slot.hourlyRate || 0}
                              </div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
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