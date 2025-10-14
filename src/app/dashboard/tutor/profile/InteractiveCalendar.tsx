import React from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Trash2,
} from "lucide-react";
import { TutorAvailability } from "@/types";

interface InteractiveCalendarProps {
  currentWeek: Date;
  daysOfWeek: string[];
  availableTimeSlots: TutorAvailability[];
  selectedDay: string | null;
  setSelectedDay: (day: string | null) => void;
  getWeekDates: (date: Date) => Date[];
  formatDate: (date: Date) => string;
  navigateWeek: (direction: "prev" | "next") => void;
  openEditModal: (slot: TutorAvailability) => void;
  tutorAvailabilityAPI: any;
}

const InteractiveCalendar: React.FC<InteractiveCalendarProps> = ({
  currentWeek,
  daysOfWeek,
  availableTimeSlots,
  selectedDay,
  setSelectedDay,
  getWeekDates,
  formatDate,
  navigateWeek,
  openEditModal,
  tutorAvailabilityAPI,
}) => {
  const weekDates = getWeekDates(currentWeek);

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 flex items-center mb-2">
            <Calendar className="mr-3 text-blue-600" size={28} />
            Weekly Schedule
          </h3>
          <p className="text-gray-600">
            {weekDates[0].toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            -{" "}
            {weekDates[6].toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateWeek("prev")}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50"
          >
            <ChevronLeft className="text-blue-600" size={20} />
          </button>
          <button
            onClick={() => navigateWeek("next")}
            className="p-2 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50"
          >
            <ChevronRight className="text-blue-600" size={20} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-4">
        {weekDates.map((date, index) => {
          const dayName = daysOfWeek[index];
          const daySlots = availableTimeSlots.filter(
            (slot) => slot.dayOfWeek === dayName,
          );
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <div
              key={index}
              className={`min-h-48 rounded-xl border-2 transition-all duration-200 p-4 cursor-pointer hover:shadow-lg ${
                isToday
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : selectedDay === dayName
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 bg-white hover:border-blue-300"
              }`}
              onClick={() =>
                setSelectedDay(selectedDay === dayName ? null : dayName)
              }
            >
              <div className="text-center mb-4">
                <div
                  className={`font-bold text-lg ${isToday ? "text-blue-700" : "text-gray-700"}`}
                >
                  {dayName}
                </div>
                <div
                  className={`text-sm ${isToday ? "text-blue-600" : "text-gray-500"}`}
                >
                  {formatDate(date)}
                </div>
                {isToday && (
                  <div className="inline-block px-2 py-1 bg-blue-500 text-white text-xs rounded-full mt-1">
                    Today
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {daySlots.map((slot, slotIndex) => (
                  <div
                    key={slot.availabilityId || slotIndex}
                    className="group relative bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {slot.startTime} - {slot.endTime}
                        </div>
                        {slot.recurring && (
                          <div className="flex items-center mt-1 text-blue-100">
                            <Clock size={12} className="mr-1" />
                            <span className="text-xs">Weekly</span>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(slot);
                          }}
                          className="p-1 rounded hover:bg-blue-400 transition-colors"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            tutorAvailabilityAPI.deleteAvailability(
                              slot.availabilityId!,
                            );
                          }}
                          className="p-1 rounded hover:bg-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {daySlots.length === 0 && (
                  <div className="text-center text-gray-400 py-4">
                    <Clock size={24} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No availability</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InteractiveCalendar;
