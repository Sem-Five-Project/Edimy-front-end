import { FindTutorFilters, TutorSearchPayload, TimeSlot } from "@/types";

const toTime = (h: number, m: number) =>
  `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

export function buildTutorSearchPayload(
  filters: FindTutorFilters,
): TutorSearchPayload {
  const base: TutorSearchPayload = {
    educationLevel: filters.educationLevel ?? null,
    stream: filters.stream ?? null,
    subjects: filters.subjects ?? [],
    classType: filters.classType,
    rating: filters.rating ?? null,
    experience: filters.experience ?? null,
    price: {
      min: filters.minPrice ?? null,
      max: filters.maxPrice ?? null,
    },
    sort: {
      field: filters.sortField ?? "PRICE",
      direction: filters.sortDirection ?? "ASC",
    },
  };

  if (filters.classType === "ONE_TIME") {
    const slot = (filters.timePeriods[0] as TimeSlot) || null;
    base.session = {
      date: filters.oneTimeDate
        ? filters.oneTimeDate.toISOString().split("T")[0]
        : null,
      startTime: slot ? toTime(slot.startHour, slot.startMinute) : null,
      endTime: slot ? toTime(slot.endHour, slot.endMinute) : null,
    };
  } else {
    const days = filters.selectedWeekdays
      .map((weekday) => {
        const slots =
          (filters.timePeriods[weekday] as TimeSlot[] | undefined) || [];
        const cleaned = slots
          .filter(
            (s) =>
              s.endHour > s.startHour ||
              (s.endHour === s.startHour && s.endMinute > s.startMinute),
          )
          .map((s) => ({
            startTime: toTime(s.startHour, s.startMinute),
            endTime: toTime(s.endHour, s.endMinute),
          }));
        if (!cleaned.length) return null;
        return { weekday, slots: cleaned };
      })
      .filter(Boolean) as {
      weekday: number;
      slots: { startTime: string; endTime: string }[];
    }[];

    base.recurring = { days };
  }

  return base;
}
