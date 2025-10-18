import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Utility function for class name concatenation
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(" ");
};

export interface CalendarProps {
  mode?: "single" | "multiple" | "range";
  selected?: Date | Date[] | { from: Date; to?: Date };
  onSelect?: (
    date: Date | Date[] | { from: Date; to?: Date } | undefined,
  ) => void;
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
  mode = "single",
  selected,
  onSelect,
  disabled = (date) =>
    date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  className,
  classNames = {},
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add previous month empty cells
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(
        year,
        month,
        0 - (startingDayOfWeek - 1 - i),
      );
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: disabled(prevMonthDay),
      });
    }

    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      const isSelected =
        mode === "single" && selected instanceof Date
          ? date.toDateString() === selected.toDateString()
          : false;

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        isSelected,
        isDisabled: disabled(date),
      });
    }

    // Add next month days
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false,
        isDisabled: disabled(nextMonthDay),
      });
    }

    return days;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const handleDateClick = (date: Date, isDisabled: boolean) => {
    if (isDisabled) return;
    if (mode === "single" && onSelect) {
      onSelect(date);
    }
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={cn("p-3", className)}>
      <div className={cn("space-y-4", classNames.months)}>
        <div className={cn("space-y-4", classNames.month)}>
          {/* Caption */}
          <div
            className={cn(
              "relative w-full flex items-center justify-center px-2 py-1",
              classNames.caption,
            )}
          >
            {/* Left arrow */}
            <button
              onClick={() => navigateMonth(-1)}
              className={cn(
                "absolute left-0 h-8 w-8 flex items-center justify-center bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                classNames.nav_button,
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Month/Year label */}
            <div
              className={cn(
                "text-sm sm:text-base md:text-base font-medium text-center",
                classNames.caption_label,
              )}
            >
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => navigateMonth(1)}
              className={cn(
                "absolute right-0 h-8 w-8 flex items-center justify-center bg-transparent hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                classNames.nav_button,
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Table */}
          <table className={cn("w-full border-collapse", classNames.table)}>
            {/* Header */}
            <thead>
              <tr
                className={cn(
                  "flex justify-center w-full",
                  classNames.head_row,
                )}
              >
                {weekdays.map((day) => (
                  <th
                    key={day}
                    className={cn(
                      "text-muted-foreground rounded-md w-7 sm:w-8 md:w-9 font-normal text-[0.65rem] sm:text-[0.8rem] md:text-xs text-center py-1 sm:py-2",
                      classNames.head_cell,
                    )}
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {Array.from(
                { length: Math.ceil(days.length / 7) },
                (_, weekIndex) => (
                  <tr
                    key={weekIndex}
                    className={cn(
                      "flex justify-center w-full mt-1 sm:mt-2",
                      classNames.row,
                    )}
                  >
                    {days
                      .slice(weekIndex * 7, (weekIndex + 1) * 7)
                      .map((day, dayIndex) => (
                        <td
                          key={dayIndex}
                          className={cn(
                            "relative h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 p-0 text-center text-xs sm:text-sm md:text-base transition-all duration-200 hover:scale-105",
                            classNames.cell,
                            !day.isCurrentMonth && !showOutsideDays
                              ? classNames.day_hidden || "invisible"
                              : "",
                          )}
                        >
                          <button
                            onClick={() =>
                              handleDateClick(day.date, day.isDisabled)
                            }
                            disabled={day.isDisabled}
                            aria-selected={day.isSelected}
                            className={cn(
                              "h-7 sm:h-8 md:h-9 w-7 sm:w-8 md:w-9 p-0 font-normal rounded-md transition-all duration-200 hover:bg-blue-100 dark:hover:bg-blue-900/20 focus:bg-blue-100 dark:focus:bg-blue-900/20",
                              classNames.day,
                              day.isSelected &&
                                cn(
                                  "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 focus:text-white rounded-full font-medium ring-2 ring-blue-500 ring-offset-1 ring-offset-background shadow-md",
                                  classNames.day_selected,
                                ),
                              day.isToday &&
                                !day.isSelected &&
                                cn(
                                  "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300 font-semibold border-2 border-blue-500 rounded-full ring-1 ring-blue-500 ring-offset-1 ring-offset-background shadow-sm",
                                  classNames.day_today,
                                ),
                              !day.isCurrentMonth &&
                                cn(
                                  "text-muted-foreground opacity-50",
                                  classNames.day_outside,
                                ),
                              day.isDisabled &&
                                cn(
                                  "text-muted-foreground opacity-50",
                                  classNames.day_disabled,
                                ),
                            )}
                          >
                            {day.date.getDate()}
                          </button>
                        </td>
                      ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };

// Example usage
const CalendarExample = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => setSelectedDate(date as Date)}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneMonthFromToday = new Date(today);
            oneMonthFromToday.setMonth(today.getMonth() + 1);
            return date < today || date > oneMonthFromToday;
          }}
          className="w-full border-0"
        />

        {selectedDate && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Selected:{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarExample;
