import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "p-4 sm:p-6 bg-background rounded-xl border shadow-sm",
        className
      )}
      classNames={{
        months: "grid grid-cols-1 sm:grid-cols-2 gap-6",
        month: "space-y-4",
        caption: "flex justify-between items-center px-2 sm:px-4",
        caption_label: "text-sm sm:text-base font-semibold",
        nav: "flex items-center space-x-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-transparent p-0 transition hover:bg-accent focus:ring-2 focus:ring-primary"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-muted-foreground w-10 sm:w-12 text-xs sm:text-sm font-medium text-center",
        row: "flex w-full mt-1 sm:mt-2",
        cell: cn(
          "relative h-10 w-10 sm:h-12 sm:w-12 text-center text-sm sm:text-base p-0",
          "focus-within:relative focus-within:z-20"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 sm:h-12 sm:w-12 p-0 font-normal rounded-full",
          "hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-primary",
          "transition ease-in-out"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary focus:ring-2 focus:ring-primary rounded-full font-medium",
        day_today:
          "bg-accent text-accent-foreground font-bold border border-primary rounded-full",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled:
          "text-muted-foreground opacity-50 cursor-not-allowed line-through",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-5 w-5" />,
        IconRight: () => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
