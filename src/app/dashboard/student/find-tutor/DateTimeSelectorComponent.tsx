import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from "@/components/ui/calendar";
import { Calendar as WeekCalendar } from "@/components/ui/weekcalendar";
import { DateTimeSelectorProps} from '@/types';
import { Datepicker, setOptions } from '@mobiscroll/react';
import { TimePicker } from "antd";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat'
import type { Dayjs } from 'dayjs';

const { RangePicker } = TimePicker;

dayjs.extend(customParseFormat)
import { 
  Calendar as CalendarIcon, 
  Clock, 
  X, 
  Plus,
  Trash2
} from 'lucide-react';


const rangeDisabledTime = (
  now: Dayjs,
  type: "start" | "end"
) => {
  if (type === "start") {
    return {
      disabledHours: () => [], // disable 0–5 hours for start
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  }
  return {
    disabledHours: () => [], // disable 23 hour for end
    disabledMinutes: () => [],
    disabledSeconds: () => [],
  };
};
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
setOptions({
  theme: 'ios',
  themeVariant: 'light'
});


const DateTimeSelectorComponent: React.FC<DateTimeSelectorProps> = ({ filters, onFilterChange }) => {
  const [highlightWeekday, setHighlightWeekday] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [calendarSelection, setCalendarSelection] = useState<Date[]>([]);
  const weekdayRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const toHHMM = (h: number, m: number) => `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;

  // Reset everything when month changes
  useEffect(() => {
    if (filters.classType === 'monthly-recurring') {
      onFilterChange('selectedWeekdays', []);
      onFilterChange('timePeriods', {});
      onFilterChange('tempTimeSelection', {});
      onFilterChange('addingNewSlot', false);
      setCalendarSelection([]);
    }else{
            onFilterChange('timePeriods', {});

    }
  }, [currentMonth, filters.classType]);

  // Handle date selection in calendar - extract weekday pattern
  const handleDateSelection = (dates: Date[]) => {
    setCalendarSelection(dates);
    
    if (dates.length > 0) {
      // Get the weekday from the selected date
      const selectedWeekday = dates[0].getDay();
      
      // If we're adding a new slot and this weekday is not already selected
      if (filters.addingNewSlot && !filters.selectedWeekdays.includes(selectedWeekday)) {
        if (filters.selectedWeekdays.length < 4) {
          // Add the new weekday to selection
          const newWeekdays = [...filters.selectedWeekdays, selectedWeekday];
          onFilterChange('selectedWeekdays', newWeekdays);
          onFilterChange('addingNewSlot', false);
          // Scroll to the new weekday section
          setTimeout(() => {
            const el = weekdayRefs.current[selectedWeekday];
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            setHighlightWeekday(selectedWeekday);
            setTimeout(() => setHighlightWeekday(null), 1200);
          }, 100);
        }
      }
    }
  };

  // Handle month change in calendar
  const handleMonthChange = (month: Date) => {
    setCurrentMonth(month);
  };

  // Start adding a new slot
  const startAddingNewSlot = () => {
    if (filters.selectedWeekdays.length < 4) {
      onFilterChange('addingNewSlot', true);
      setCalendarSelection([]);
    }
  };

  // Cancel adding new slot
  const cancelAddingNewSlot = () => {
    onFilterChange('addingNewSlot', false);
    setCalendarSelection([]);
  };


  const formatTimeRange = (startTime: string, endTime: string) => {
  const parse = (t: string) => {
    const [h,m] = t.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hh}:${m.toString().padStart(2,'0')} ${period}`;
  };
  return `${parse(startTime)} - ${parse(endTime)}`;
};
  // Add time slot for specific weekday
  const addTimeSlot = (weekday: number) => {
    const temp = filters.tempTimeSelection?.[weekday];
    if (temp &&
    temp.startHour !== undefined &&
    temp.startMinute !== undefined &&
    temp.endHour !== undefined &&
    temp.endMinute !== undefined) {

  const startTime = toHHMM(temp.startHour, temp.startMinute);
  const endTime   = toHHMM(temp.endHour, temp.endMinute);
  if (endTime <= startTime) return; // basic guard

  onFilterChange('timePeriods', {
    ...filters.timePeriods,
    [weekday]: { startTime, endTime }
  });

  onFilterChange('tempTimeSelection', {
    ...filters.tempTimeSelection,
    [weekday]: {}
  });
}
  };

  // Remove weekday and its time slot
  const removeWeekday = (weekday: number) => {
    const newWeekdays = filters.selectedWeekdays.filter(w => w !== weekday);
    onFilterChange('selectedWeekdays', newWeekdays);
    
    const newTimeSlots = { ...filters.timePeriods };
    delete newTimeSlots[weekday];
    onFilterChange('timePeriods', newTimeSlots);
    
    const newTempSelection = { ...filters.tempTimeSelection };
    delete newTempSelection[weekday];
    onFilterChange('tempTimeSelection', newTempSelection);
  };


  if (!filters.classType) return null;

  return (
    <Card className="border-2 border-indigo-100 shadow-lg">
      <CardContent className="p-4 sm:p-6">
        {filters.classType === 'one-time' ? (
          <div className="space-y-4">
            <div className="grid lg:grid-cols-1 xl:grid-raw-2 gap-4 sm:gap-6">
              <div className="space-y-3">
                <div className="border-2 border-gray-200 rounded-xl p-3 sm:p-4 bg-blue-500">
                  <Calendar
                    mode="single"
                    selected={filters.selectedDate || undefined}
                    onSelect={(date) => onFilterChange('selectedDate', date)}
                    disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
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
                </div>
              </div>
              <Card className="w-full shadow-md rounded-2xl p-4 sm:p-6">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                  Select your available class time
                </h1>
                <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
                  Choose a <span className="font-medium">start</span> and{" "}
                  <span className="font-medium">end</span> time you can attend class.
                </p>

                <RangePicker
                  format="HH:mm"
                  defaultValue={[dayjs("13:30", "HH:mm"), dayjs("15:30", "HH:mm")]}
                  disabledTime={rangeDisabledTime}
                  minuteStep={10}
                  className="w-full"
                  onChange={(values) => {
                    if (values && values[0] && values[1]) {
                      const start = values[0];
                      const end = values[1];

                    onFilterChange("timePeriods", {
                      0: {
                        startTime: toHHMM(start.hour(), start.minute()),
                        endTime: toHHMM(end.hour(), end.minute())
                      }
                    });
                    }
                  }}
                />

              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Month Indicator */}
            <div className="text-center">
              <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                Select weekdays to set recurring time slots for all {currentMonth.toLocaleString('default', { month: 'long' })} 
              </p>
            </div>

            {/* Calendar Section */}
            <div className="space-y-4 bg-blue-500 p-3 sm:p-4 rounded-xl border-2 border-blue-100">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {filters.addingNewSlot ? 'Select a day to add time slot' : 'Weekly Pattern Selection'}
                </h4>
                <span className="text-xs sm:text-sm font-normal text-gray-600">
                  {filters.selectedWeekdays.length}/4 days
                </span>
              </div>
              
              {filters.addingNewSlot && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-800">
                      💡 Click on any day to select that weekday pattern
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelAddingNewSlot}
                      className="text-xs h-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <WeekCalendar
                selected={calendarSelection}
                onSelect={handleDateSelection}
                onMonthChange={handleMonthChange}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  return date < today;
                }}
                className="w-full border-0"
                classNames={{
                  months: "space-y-2 sm:space-y-3",
                  month: "space-y-2 sm:space-y-3",
                  caption: "flex justify-center pt-1 sm:pt-2 relative items-center px-1 sm:px-2",
                  caption_label: "text-xs sm:text-sm font-medium",
                  nav: "space-x-1 sm:space-x-2 flex items-center",
                  nav_button: "h-5 sm:h-6 md:h-7 w-5 sm:w-6 md:w-7 bg-transparent p-0 hover:bg-blue-100 transition-all duration-200 rounded-full",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-muted-foreground rounded-md w-6 sm:w-7 md:w-8 font-normal text-[0.6rem] sm:text-[0.7rem] text-center py-1",
                  row: "flex w-full mt-1",
                  cell: "relative h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0 text-center text-xs focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent transition-all duration-200",
                  day: "h-6 sm:h-7 md:h-8 w-6 sm:w-7 md:w-8 p-0 font-normal rounded-md transition-all duration-200 hover:bg-blue-100 focus:bg-blue-100 text-xs sm:text-sm",
                  day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 rounded-full font-medium",
                  day_today: "bg-blue-100 text-blue-900 font-semibold border border-blue-500 rounded-full",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_hidden: "invisible"
                }}
              />
            </div>

            {/* Time Slot Configuration for Each Selected Weekday */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                  Time Slots
                </h4>
                
                {!filters.addingNewSlot && filters.selectedWeekdays.length < 4 && (
                  <Button
                    onClick={startAddingNewSlot}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                    size="sm"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Another Slot
                  </Button>
                )}
              </div>
              
              {filters.selectedWeekdays.length > 0 ? (
                filters.selectedWeekdays.map(weekday => {
                  const hasTimeSlot = !!filters.timePeriods[weekday];
                  
                  return (
                    <div
                      key={weekday}
                      ref={(el) => { weekdayRefs.current[weekday] = el; }}
                      className={`border-2 rounded-xl p-3 sm:p-4 transition-all duration-300 ${
                        highlightWeekday === weekday 
                          ? 'border-indigo-400 shadow-lg bg-indigo-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-base sm:text-lg font-medium text-gray-800 flex items-center gap-2 flex-wrap">
                          Every {WEEKDAYS[weekday]}
                          {hasTimeSlot && (
                            <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Time set for all {WEEKDAYS[weekday]}s
                            </span>
                          )}
                        </h5>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWeekday(weekday)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Existing time slot */}
                      {hasTimeSlot && (
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div>
                              <span className="font-medium text-green-800 text-sm sm:text-base">
                                {/* {formatTimeRange(filters.timePeriods[weekday])} */}
                                {formatTimeRange(filters.timePeriods[weekday].startTime, filters.timePeriods[weekday].endTime)}

                              </span>
                              <p className="text-xs text-green-600 mt-1">
                                Applies to all {WEEKDAYS[weekday]}s in {currentMonth.toLocaleString('default', { month: 'long' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Time slot configuration */}
                        {!hasTimeSlot && (
                          <div className="rounded-xl border border-gray-200 bg-gray-50/60 dark:bg-gray-800/40 p-4 space-y-4 shadow-sm">
                            {/* Header */}
                            <div className="text-center text-sm font-medium text-gray-600 dark:text-gray-300">
                              Set time period for all <span className="font-semibold text-indigo-600">{WEEKDAYS[weekday]}</span>
                            </div>

                            {/* Time Picker */}
                            <div className="flex justify-center">
                              <RangePicker
                                format="HH:mm"
                                defaultValue={[dayjs("13:30", "HH:mm"), dayjs("15:30", "HH:mm")]}
                                disabledTime={rangeDisabledTime}
                                minuteStep={10}
                                className="w-full max-w-sm rounded-lg border border-gray-300 hover:border-indigo-400 transition focus:ring-2 focus:ring-indigo-500"
                                onChange={(values) => {
                                  if (values && values[0] && values[1]) {
                                    const start = values[0];
                                    const end = values[1];
                                    onFilterChange("tempTimeSelection", {
                                      ...filters.tempTimeSelection,
                                      [weekday]: {
                                        startHour: start.hour(),
                                        startMinute: start.minute(),
                                        endHour: end.hour(),
                                        endMinute: end.minute()
                                      }
                                    });
                                  } else {
                                    // clear if user removes selection
                                    onFilterChange("tempTimeSelection", { [weekday]: null });
                                  }
                                }}
                              />

                            </div>

                            {/* Action Button */}
                            <div className="flex justify-center">
                              <Button
                                onClick={() => addTimeSlot(weekday)}
                                
                                disabled={
                                  !filters.tempTimeSelection?.[weekday]?.startHour ||
                                  !filters.tempTimeSelection?.[weekday]?.endHour
                                }
                                className="px-5 py-2 h-auto text-sm font-medium rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Set Time for All {WEEKDAYS[weekday]}s
                              </Button>

                            </div>
                          </div>
                        )}

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-xl">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="mb-4">No weekdays selected yet</p>
                  <Button
                    onClick={startAddingNewSlot}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Your First Time Slot
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DateTimeSelectorComponent;