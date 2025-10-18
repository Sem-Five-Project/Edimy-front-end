export interface WeekBreakdown {
  weekStartDate: string;
  date: string;
  slots: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  total: number;
  totalSlots: number;
}

export interface MonthlyClassBooking {
  id: string;
  tutorId: string;
  subjectId: string;
  languageId: string;
  patterns: SelectedSlotPattern[];
  weekBreakdown: WeekBreakdown[];
  totalSlots: number;
  totalCost: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface BookMonthlyClassReq {
  tutorId: string;
  subjectId: string;
  languageId: string;
  patterns: SelectedSlotPattern[];
  startDate: string;
  endDate: string;
}

export interface SelectedSlotPattern {
  id: string;
  dayOfWeek: number;
  times: string[];
  startTime: string;
  endTime: string;
  generatedSlots: OccurrenceSlot[];
}

export interface OccurrenceSlot {
  id: string;
  dateTime: string;
  date: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  start: string;
  end: string;
  timeDisplay?: string;
  isAvailable: boolean;
  isLocked: boolean;
}
