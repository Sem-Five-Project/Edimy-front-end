import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Utility function for class name concatenation
const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(' ');

export interface CalendarProps {
  mode?: 'single' | 'multiple' | 'range' | 'weekday';
  selected?: Date | Date[] | { from: Date; to?: Date } | number;
  onSelect?: (dates: Date[]) => void;
  onClickDate?: (date: Date) => void;
  onMonthChange?: (month: Date) => void;
  disabled?: (date: Date) => boolean;
  className?: string;
  classNames?: {
    months?: string;
    month?: string;
    caption?: string;
    caption_label?: string;
    nav?: string;
    nav_button?: string;
    table?: string;
    head_row?: string;
    head_cell?: string;
    row?: string;
    cell?: string;
    day?: string;
    day_selected?: string;
    day_today?: string;
    day_outside?: string;
    day_disabled?: string;
    day_range_middle?: string;
    day_hidden?: string;
  };
  showOutsideDays?: boolean;
}

function Calendar({
  mode = 'weekday',
  selected,
  onSelect,
  onClickDate,
  onMonthChange,
  disabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today; // Only disable past dates; allow future months
  },
  className,
  classNames = {},
  showOutsideDays = false,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays: string[] = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Function to get all future dates of the same weekday within the SELECTED DATE'S MONTH

    const getMonthWeekdayDates = (selectedDate: Date): Date[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const targetWeekday = selectedDate.getDay();
    const dates: Date[] = [];

    const year = selectedDate.getFullYear();
    const monthIndex = selectedDate.getMonth();

    // Find first occurrence of targetWeekday in that month
    const firstOfMonth = new Date(year, monthIndex, 1);
    const firstWeekday = firstOfMonth.getDay();
    const diff = (targetWeekday - firstWeekday + 7) % 7;
    const firstOccurrence = new Date(year, monthIndex, 1 + diff);

    // Collect all occurrences in the month, but exclude past dates and custom disabled
    let d = new Date(firstOccurrence);
    while (d.getMonth() === monthIndex && d.getFullYear() === year) {
      if (!disabled(d) && d >= today) {
        dates.push(new Date(d));
      }
      d.setDate(d.getDate() + 7);
    }
    return dates;
  };

  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(selectedDate => 
      date.toDateString() === selectedDate.toDateString()
    );
  };

  // Check if date has same weekday as any selected date (for highlighting)
  const isSameWeekdayAsSelected = (date: Date): boolean => {
    if (selectedDates.length === 0) return false;
    const dayOfWeek = date.getDay();
    return selectedDates.some(selectedDate => selectedDate.getDay() === dayOfWeek);
  };

  interface DayCell {
    date: Date | null;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isDisabled: boolean;
    isEmpty: boolean;
    isSameWeekday: boolean;
  }

   const getDaysInMonth = (date: Date): DayCell[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: DayCell[] = [];

    // If showing outside days, fill leading days from previous month as clickable
    if (showOutsideDays && startingDayOfWeek > 0) {
      const prevMonthLastDate = new Date(year, month, 0).getDate();
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        const dayNum = prevMonthLastDate - i;
        const d = new Date(year, month - 1, dayNum);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        days.push({
          date: d,
          isCurrentMonth: false,
          isToday,
          isSelected: isDateSelected(d),
          isDisabled: disabled(d),
          isEmpty: false,
          isSameWeekday: isSameWeekdayAsSelected(d)
        });
      }
    } else {
      // Add empty cells for previous month (not clickable)
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push({
          date: null,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isDisabled: true,
          isEmpty: true,
          isSameWeekday: false
        });
      }
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const today = new Date();
      const isToday = d.toDateString() === today.toDateString();

      days.push({
        date: d,
        isCurrentMonth: true,
        isToday,
        isSelected: isDateSelected(d),
        isDisabled: disabled(d),
        isEmpty: false,
        isSameWeekday: isSameWeekdayAsSelected(d)
      });
    }

    // Trailing cells to complete 6 rows (42 cells)
    const totalCells = 42;
    if (showOutsideDays) {
      const remaining = totalCells - days.length;
      for (let i = 1; i <= remaining; i++) {
        const d = new Date(year, month + 1, i);
        const today = new Date();
        const isToday = d.toDateString() === today.toDateString();
        days.push({
          date: d,
          isCurrentMonth: false,
          isToday,
          isSelected: isDateSelected(d),
          isDisabled: disabled(d),
          isEmpty: false,
          isSameWeekday: isSameWeekdayAsSelected(d)
        });
      }
    } else {
      const remainingCells = totalCells - days.length;
      for (let i = 0; i < remainingCells; i++) {
        days.push({
          date: null,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false,
          isDisabled: true,
          isEmpty: true,
          isSameWeekday: false
        });
      }
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
    // Clear selections when changing months
    setSelectedDates([]);
  // Notify parent about month change
  if (onMonthChange) onMonthChange(newMonth);
  };

 
    const handleDateClick = (date: Date, isDisabled: boolean) => {
    if (isDisabled || !date) return;

    // Select ALL weekday occurrences within that month, excluding past dates
    const weekdayDates = getMonthWeekdayDates(date);
    setSelectedDates(weekdayDates);
    
    if (onSelect) {
      onSelect(weekdayDates);
    }
    if (onClickDate) {
      onClickDate(date);
    }
  };

  const days = getDaysInMonth(currentMonth);
  return (
    <div className={cn("p-3", className)}>
      <div className={cn("space-y-4", classNames.months)}>
        <div className={cn("space-y-4", classNames.month)}>
          {/* Caption */}
          <div className={cn("relative w-full flex items-center justify-center px-2 py-1", classNames.caption)}>
            <button
              onClick={() => navigateMonth(-1)}
              className={cn(
                "absolute left-0 h-8 w-8 flex items-center justify-center bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                classNames.nav_button
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <div className={cn("text-sm sm:text-base md:text-base font-medium text-center", classNames.caption_label)}>
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            
            <button
              onClick={() => navigateMonth(1)}
              className={cn(
                "absolute right-0 h-8 w-8 flex items-center justify-center bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                classNames.nav_button
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Table */}
          <table className={cn("w-full border-collapse", classNames.table)}>
            {/* Header */}
            <thead>
              <tr className={cn("flex justify-center w-full", classNames.head_row)}>
                {weekdays.map((day) => (
                  <th
                    key={day}
                    className={cn(
                      "text-muted-foreground rounded-md w-7 sm:w-8 md:w-9 font-normal text-[0.65rem] sm:text-[0.8rem] md:text-xs text-center py-1 sm:py-2",
                      classNames.head_cell
                    )}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
                <tr key={weekIndex} className={cn("flex justify-center w-full mt-1 sm:mt-2", classNames.row)}>
                  {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                    <td
                      key={dayIndex}
                      className={cn(
                        "relative h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 p-0 text-center text-xs sm:text-sm md:text-base transition-all duration-200",
                        classNames.cell,
                        day.isEmpty ? "invisible" : "hover:scale-105"
                      )}
                    >
                      {!day.isEmpty && day.date && (
                        <button
                          onClick={() => day.date && handleDateClick(day.date, day.isDisabled)}
                          disabled={day.isDisabled}
                          aria-selected={day.isSelected}
                          className={cn(
                            "h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 p-0 font-normal rounded-md transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 focus:bg-blue-100 dark:focus:bg-blue-900/20",
                            classNames.day,
                            !day.isCurrentMonth && cn(
                              "opacity-80", // style for outside days
                              classNames.day_outside
                            ),
                            day.isSelected && cn(
                              "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:text-white rounded-full font-medium ring-2 ring-blue-500 ring-offset-1 ring-offset-background shadow-md",
                              classNames.day_selected
                            ),
                            day.isSameWeekday && !day.isSelected && !day.isDisabled && cn(
                              "bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700/50 font-medium",
                              "hover:bg-blue-200 dark:hover:bg-blue-900/50"
                            ),
                            day.isToday && !day.isSelected && cn(
                              "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 font-semibold border-2 border-blue-500 rounded-full ring-1 ring-blue-500 ring-offset-1 ring-offset-background shadow-sm",
                              classNames.day_today
                            ),
                            day.isDisabled && cn(
                              "text-muted-foreground opacity-50 cursor-not-allowed",
                              classNames.day_disabled
                            )
                          )}
                        >
                          {day.date.getDate()}
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected dates summary */}
      {selectedDates.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
          <div className="flex flex-wrap gap-2">
            {selectedDates.map((date, index) => (
              <span
                key={index}
                className="px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full shadow-sm"
              >
                {date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                })}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

}

Calendar.displayName = "Calendar";

export { Calendar };