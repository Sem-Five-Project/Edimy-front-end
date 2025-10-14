import React from "react";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, X, Clock } from "lucide-react";

interface ScheduleItem {
  id: string;
  date: string;
  time: string;
  duration: string;
}

interface MonthlyScheduleCardsProps {
  schedules: ScheduleItem[];
  onRemove: (id: string) => void;
}

const ScheduleCard = ({
  schedule,
  onRemove,
}: {
  schedule: ScheduleItem;
  onRemove: (id: string) => void;
}) => (
  <div className="flex-shrink-0 w-48 group">
    {" "}
    {/* smaller width */}
    <div className="relative bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-blue-950/20 rounded-lg border border-gray-200/60 dark:border-gray-700/60 shadow-sm">
      <button
        onClick={() => onRemove(schedule.id)}
        className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10 border border-white dark:border-gray-800"
      >
        <X className="h-3 w-3 stroke-2" />
      </button>

      <div className="p-3 space-y-2">
        {" "}
        {/* smaller padding */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold text-gray-900 dark:text-white">
            {schedule.date}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
          <Clock className="h-3 w-3 text-blue-500" />
          <span className="font-medium">{schedule.time}</span>
        </div>
        <Badge variant="secondary">{schedule.duration}</Badge>
      </div>
    </div>
  </div>
);

export const MonthlyScheduleCards = ({
  schedules,
  onRemove,
}: MonthlyScheduleCardsProps) => {
  return (
    <div className="w-full">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-3 px-1">
        {schedules.map((schedule) => (
          <ScheduleCard
            key={schedule.id}
            schedule={schedule}
            onRemove={onRemove}
          />
        ))}
      </div>

      {schedules.length === 0 && (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center">
            <CalendarDays className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No schedules added yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add your preferred time slots to get started
          </p>
        </div>
      )}
    </div>
  );
};
