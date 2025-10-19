
"use client";
import { useAuth } from '@/contexts/AuthContext';
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Calendar as MonthCalendar } from "@/components/ui/calendar";
import { Calendar as WeekCalendar } from "@/components/ui/weekcalendar";
import { BookingProgress } from "@/components/ui/booking-progress";
import { TutorInfoCard } from "@/components/ui/tutor-info-card";
import { StyledSelect } from "@/components/ui/styled-select";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { FaCheckCircle } from "react-icons/fa";

// Monthly booking UI is integrated inline on this page; removing old demo imports
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle,
  CalendarDays,
  Clock,
  Loader2,
  BookOpen,
  Globe,
  Users,
  DollarSign,
  Timer,
  X
} from "lucide-react";
import { useBooking } from "@/contexts/BookingContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter } from "next/navigation";
//import { bookingAPI, tutorAPI } from "@/lib/api";
import { bookingAPI, tutorAPI } from "@/lib/api"; // This should be the correct path
import { TimeSlot, CLASS_TYPES, BookingPreferences, MonthlyClassBooking, type SelectedSlotPattern, type RecurringSlot, type WeekBreakdown, type BookMonthlyClassReq } from "@/types";
import next from 'next';

export default function BookingSlotsPage() {
  const router = useRouter();
  // const {
  //   tutor,
  //   selectedDate,
  //   setSelectedDate,
  //   proceedToStep,
  //   setCurrentStep,
  //   setReservationDetails,
  //   setLockedSlotIds,
  //   setBookingPreferences,
  //   bookingPreferences,
  //   currentStep,
  //   setMonthlyBookingData,
  //   setAvailabilitySlotsMap,
  //   setNextMonthSlots,
  // } = useBooking();
  const {
    setNextMonthSlots,
    // context state/setters we must populate so payment page doesn't redirect
    setTutor: setTutorCtx,
    setBookingPreferences: setBookingPreferencesCtx,
    bookingPreferences: bookingPreferencesCtx,
    setReservationDetails: setReservationDetailsCtx,
    setRepayTimer:setRepayTimerCtx,
    setLockedSlotIds: setLockedSlotIdsCtx,
    setMonthlyBookingData: setMonthlyBookingDataCtx,
    setAvailabilitySlotsMap: setAvailabilitySlotsMapCtx,
    proceedToStep: proceedToStepCtx,
    setCurrentStep: setCurrentStepCtx,
    nextMonth: ctxNextMonth,
    setNextMonth: setCtxNextMonth,
    nextYear: ctxNextYear,
    setNextYear: setCtxNextYear,
    setPayForNextMonthFlow,

  } = useBooking();
  
  // Optional class meta passed from Classes page for immediate UI hydration
  type PayNextClassMeta = {
    classId: number | string
    linkForMeeting?: string | null
    tutorName?: string | null
    subjectName?: string | null
    languageName?: string | null
    classType?: string | null
    tutorId?: number
    subjectId?: number
    date?: string | null
    startTime?: string | null
    endTime?: string | null
    hourlyRate?: number | 0
    languageId?: number | null
  };
  const [classMeta, setClassMeta] = useState<PayNextClassMeta | null>(null);
   // --- Dummy Data for Development ---
  const [dummyBookingPrefs, setDummyBookingPrefs] = useState<BookingPreferences>({
    selectedSubject: null,
    selectedLanguage: null,
    selectedClassType: { id: 2, name: 'Monthly', priceMultiplier: 1.0, description: 'Pay for next month.' },
    finalPrice: 0,
  });
  // Removed dummy availability list; we'll derive from reserved class info

  // Tutor state (was a constant before). Using state allows API to update it via setTutor.
  const [tutor, setTutor] = useState<any>(null);
  const [classType, setClassType] = useState<string>("");
  // Hydrate from sessionStorage meta early so we can render immediately
  useEffect(() => {
    // Hydrate from sessionStorage meta
    try {
      if (typeof window !== 'undefined') {
        const raw = window.sessionStorage.getItem('payNextClassMeta');
        if (raw) {
          const meta: PayNextClassMeta = JSON.parse(raw);
          setClassMeta(meta);
          // Initialize tutor stub and booking prefs for immediate UI
          const tutorStub = {
            id: meta.tutorId || undefined,
            tutorProfileId: meta.tutorId || undefined,
            firstName: meta.tutorName || 'Tutor',
            lastName: '',
            languages: meta.languageName ? [{ languageId: undefined, languageName: meta.languageName }] : [],
            subjects: meta.subjectId || meta.subjectName ? [{ subjectId: meta.subjectId || 0, subjectName: meta.subjectName || '', hourlyRate: 0 }] : [],
            hourlyRate: 0,
          } as any;
          setTutor(tutorStub);
          console.log("meta :::",meta)
          setDummyBookingPrefs(prev => ({
            ...prev,
            selectedSubject: meta.subjectName ? { subjectId: meta.subjectId || 0, subjectName: meta.subjectName, hourlyRate: meta?.hourlyRate || 0} : prev.selectedSubject,
            selectedLanguage: meta.languageName ? { languageId: 0, languageName: meta.languageName } : prev.selectedLanguage,
            selectedClassType: { id: 1, name: meta.classType || 'Monthly', priceMultiplier: 1.0, description: 'Pay for next month.' },
          }));
          setClassType(meta.classType || "ONE_TIME");
          // Populate context to prevent payment page redirect later
          setTutorCtx(tutorStub);
          console.log("Tutor context set:", tutorStub);
          console.log("meetaaaa :",meta);
          // setBookingPreferencesCtx({
          //   selectedSubject: meta.subjectName ? { subjectId: meta.subjectId || 0, subjectName: meta.subjectName, hourlyRate: meta?.hourlyRate || 0 } : null,
          //   selectedLanguage: meta.languageName ? { languageId: meta.languageId || 0, languageName: meta.languageName } : null,
          //   selectedClassType: { id: 2, name: 'Monthly', priceMultiplier: 1.0, description: 'Pay for next month.' },
          //   finalPrice: 0,
          // });
        }
      }
    } catch {}
  }, []);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const proceedToStep = (step: any) => console.log('Proceeding to step:', step);
  const setCurrentStep = (step: any) => console.log('Setting current step:', step);
  const setReservationDetails = (details: any) => console.log('Setting reservation details:', details);
  const setLockedSlotIds = (ids: any) => console.log('Setting locked slot IDs:', ids);
  const setBookingPreferences = setDummyBookingPrefs;
  const bookingPreferences = dummyBookingPrefs;
  const currentStep = 'payment';
  const setMonthlyBookingData = (data: any) => console.log('Setting monthly booking data:', data);
  const setAvailabilitySlotsMap = (map: any) => console.log('Setting availability map:', map);
  //const setNextMonthSlots = (slots: any) => console.log('Setting next month slots:', slots);
  // --- End of Dummy Data
  //const tutor = 

  const { formatPrice, selectedCurrency } = useCurrency();
  const [availableSlots, setAvailableSlots] = useState<any[]>([]); // grouped: [{start_time,end_time,slots:[{slot_id,date,status}]}]
  const [selectedSlotLocal, setSelectedSlotLocal] = useState<TimeSlot | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string | null>(null);
  const [selectedOccurrenceIds, setSelectedOccurrenceIds] = useState<number[]>([]);
  const [rangeSelectAll, setRangeSelectAll] = useState<Record<string, boolean>>({});
  // const [preferencess, setPreferencess] = useState<BookingPreferences>({
  //   selectedLanguage: tutor?.languages && tutor.languages.length === 1 ? tutor.languages[0] : null,
  //   selectedSubject: tutor?.subjects && tutor.subjects.length === 1 ? tutor.subjects[0] : null,
  //   selectedClassType: null,
  //   finalPrice: 0,
  // });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Monthly selection state
  const [selectedPatterns, setSelectedPatterns] = useState<SelectedSlotPattern[]>([]);
  const [generatedSlots, setGeneratedSlots] = useState<RecurringSlot[]>([]);
  const [weekBreakdown, setWeekBreakdown] = useState<WeekBreakdown[]>([]);
  //const [monthlyTotal, setMonthlyTotal] = useState<number>(0);
  // Exclusions: user-removed occurrences by id
  const [excludedOccurrenceIds, setExcludedOccurrenceIds] = useState<string[]>([]);
  // Pre-payment option to also book next month with the same recurring times
  const [alsoBookNextMonth, setAlsoBookNextMonth] = useState<boolean>(false);
  // Use bookingPreferences from context directly so selections persist across steps
  const preferences = bookingPreferences;
  // Auto-preselect single subject/language if only one and none selected yet


  
 const [selectedWeekDays,setSelectedWeekDays] = useState<string[]>([]);

  // Prefer class id from BookingContext, but allow deep-linking via query when needed
  const { selectedClassId } = useBooking();
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const classIdFromQuery = searchParams.get('classId');
  const classId = (selectedClassId != null) ? String(selectedClassId) : classIdFromQuery;
  const [reservedSlotsLoading,setReservedSlotsLoading]=useState(false);
  const [reservedClassInfo,setReservedClassInfo]=useState<any>();
  type ReservedSlotDisplay = { day: string; time: string; dates: string[]; availabilityId?: number };
  const [reservedSlots,setReservedSlots]=useState<ReservedSlotDisplay[]>([]);
  const [totalReservedPrice,setTotalReservedPrice]=useState(0);
  const { actorId, isStudent,effectiveStudentId } = useAuth();
  // Payment status check state
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [alreadyPaid, setAlreadyPaid] = useState(false);
  const [paymentStatusError, setPaymentStatusError] = useState<string>('');

  //const [reservedSlots,setReservedSlots] =useState([]);
  const parseHourDiff = (start: string, end: string) => {
  // start/end: "HH:MM:SS" or "HH:MM"
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh + em/60) - (sh + sm/60);
};
// Outside useEffect (top-level inside component)
// Use context month/year so payment and repay payloads can access them
const nextMonth = ctxNextMonth;
const nextYear = ctxNextYear;
//setTutorCtx(defaultTutor);
useEffect(() => {
  const fetchReservedSlots = async () => {
    console.log("Fetching reserved slots...");
    if (!classId || !effectiveStudentId) return;

    setReservedSlotsLoading(true);
    setError('');

    try {
      const response = await bookingAPI.getReservedSlotsForClass(
        Number(effectiveStudentId),
        Number(classId)
      );

      if (response.success && response.data) {
        console.log("Reserved slots fetched successfully:", response.data);

        let lockedSlotsMap = {};
        const allSlotIds = response.data.all_slot_ids;
         if (allSlotIds && Array.isArray(allSlotIds) && response.data.availability_details.length > 0) {
              // Get the single availability ID from the first item in the details array
              const availabilityId = response.data.availability_details[0].availability_id;
              
              // Create the required map: {"availability_id": [slot_ids]}
              if (availabilityId) {
                  lockedSlotsMap = { [availabilityId]: allSlotIds };
              }
          }
          console.log("lockedSlotsMap :",lockedSlotsMap)

    // Set the context with the newly created object map
      setAvailabilitySlotsMapCtx(lockedSlotsMap); 
    // --- END OF FIX ---
    

  setReservedClassInfo(response.data);
        //setLockedSlotIdsCtx(response.data.locked_slot_ids || []);
        

        const slotsForDisplay: any[] = [];
        let totalDuration = 0;
        const allDates: string[] = [];

        response.data.availability_details.forEach((detail: any) => {
          const slotDuration = parseHourDiff(detail.start_time, detail.end_time);
          totalDuration += slotDuration * detail.available_dates.length;

          // collect all available dates
          if (Array.isArray(detail.available_dates)) {
            allDates.push(...detail.available_dates);
          }

          slotsForDisplay.push({
            day: detail.week_day,
            time: `${new Date(`1970-01-01T${detail.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${detail.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            dates: Array.isArray(detail.available_dates) ? detail.available_dates : [],
            availabilityId: Number(detail.availability_id ?? detail.availabilityId ?? 0),
          });
        });

        // 🧠 Determine next month & next year from latest available date
        if (allDates.length > 0) {
          const latestDate = new Date(
            Math.max(...allDates.map((d) => new Date(d).getTime()))
          );
          const month = latestDate.getMonth() + 1; // 1-based
          const year = latestDate.getFullYear();

          if (month === 12) {
            setCtxNextMonth(1);
            setCtxNextYear(year + 1);
          } else {
            setCtxNextMonth(month + 1);
            setCtxNextYear(year);
          
          }
        }

        const totalPrice = totalDuration * response.data.hourly_rate;

        // Set tutor and prefs from reserved data if available
        if (response.data?.tutor_details) {
          setTutor(response.data.tutor_details);
          setTutorCtx(response.data.tutor_details);
        }
        setDummyBookingPrefs(prev => ({
          ...prev,
          selectedSubject: response.data?.subject_details || prev.selectedSubject,
          selectedLanguage: response.data?.language_details || prev.selectedLanguage,
          selectedClassType: CLASS_TYPES.find(ct => ct.id === 2) ?? prev.selectedClassType,
          finalPrice: totalPrice,
        }));
        // setDummyBookingPrefs({
        //   ...(bookingPreferencesCtx ?? {}),
        //   finalPrice: totalPrice,
        // });


        // setBookingPreferencesCtx({
        //   ...(bookingPreferencesCtx ?? {}),
        //   finalPrice: totalPrice,
        // });

        // show calendar with slight delay
        setTimeout(() => {
          setReservedSlots(slotsForDisplay);
          setTotalReservedPrice(totalPrice);
        }, 500);

      } else {
        setError(response.error || "Could not fetch reserved class details.");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred while fetching class details.");
    } finally {
      setReservedSlotsLoading(false);
    }
  };

  fetchReservedSlots();
}, [classId, effectiveStudentId]);

// Check payment status when entering repay flow
// Compute next month and year based on current date
const now = new Date();
let computedNextMonth = now.getMonth() + 2; // JS months are 0-indexed
let computedNextYear = now.getFullYear();
if (computedNextMonth > 12) {
  computedNextMonth = 1;
  computedNextYear += 1;
}

useEffect(()=>{
  console.log("00000000000000000000 :",reservedClassInfo)
},[reservedClassInfo])
// Then in your effect:
useEffect(() => {
  console.log(
    "Checking payment status for classId:", 
    classId, 
    "month:", 12, 
    "year:", computedNextYear, 
    "effectiveStudentId:", effectiveStudentId
  );

  const checkPaymentStatus = async () => {
    if (!classId || !effectiveStudentId) return;

    setPaymentStatusLoading(true);
    setPaymentStatusError('');

    try {
      const response = await bookingAPI.checkPaymentStatus({
        studentId: Number(effectiveStudentId),
        classId: Number(classId),
        month: computedNextMonth,
        year: computedNextYear,
      });
      console.log("para :",classId,effectiveStudentId,computedNextMonth,computedNextYear)
      console.log("Payment status response:", response);

      if (response.success) {
        setAlreadyPaid(response.data.isPaid);
        if (response.data.isPaid) {
          console.log('Payment already made for this class/month/year');
        }
      } else {
        setPaymentStatusError(response.error || 'Failed to check payment status');
      }
    } catch (e: any) {
      setPaymentStatusError(e.message || 'Error checking payment status');
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  if (classId) {
    checkPaymentStatus();
  }
}, [classId, effectiveStudentId]); // dependencies


  // useEffect(() => {
  //   const fetchReservedSlots = async () => {
  //     console.log("Fetching reserved slots...");
  //     if (!classId || !effectiveStudentId) return;

  //     setReservedSlotsLoading(true);
  //     setError('');
  //     try {
  //       const response = await bookingAPI.getReservedSlotsForClass(Number(effectiveStudentId), Number(classId));
  //       if (response.success && response.data) {          
  //         setReservedClassInfo(response.data);

  //         const slotsForDisplay: any[] = [];
  //         let totalDuration = 0;

  //         response.data.availability_details.forEach((detail: any) => {
  //           const slotDuration = parseHourDiff(detail.start_time,detail.end_time);
  //           totalDuration += slotDuration * detail.available_dates.length;

  //           slotsForDisplay.push({
  //             day: detail.week_day,
  //             time: `${new Date(`1970-01-01T${detail.start_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(`1970-01-01T${detail.end_time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
  //             dates: Array.isArray(detail.available_dates) ? detail.available_dates : [],
  //             availabilityId: Number(detail.availability_id ?? detail.availabilityId ?? 0),
  //           });
  //         });

  //         // Introduce a small splash to show calendar ~0.5s before reserved data renders
  //         const totalPrice = totalDuration * response.data.hourly_rate;
  //         setTimeout(() => {
  //           setReservedSlots(slotsForDisplay);
  //           setTotalReservedPrice(totalPrice);
  //         }, 500);

  //         // Set context for payment
  //         // setTutor(response.data.tutor_details);
  //         // setBookingPreferences({
  //         //   ...bookingPreferences,
  //         //   selectedSubject: response.data.subject_details,
  //         //   selectedLanguage: response.data.language_details,
  //         //   selectedClassType: CLASS_TYPES.find(ct => ct.id === 2) ?? null, // Assuming monthly
  //         //   finalPrice: totalPrice,
  //         // });

  //       } else {
  //         setError(response.error || "Could not fetch reserved class details.");
  //       }
  //     } catch (e: any) {
  //       setError(e.message || "An error occurred while fetching class details.");
  //     } finally {
  //       setReservedSlotsLoading(false);
  //     }
  //   };

  //   fetchReservedSlots();
  // }, [classId, effectiveStudentId]);

  // ADD this new state to mirror selected slot IDs for monthly
  const [monthlySelectedSlotIds, setMonthlySelectedSlotIds] = useState<number[]>([]);
  const timesListRef = useRef<HTMLDivElement>(null);
  const [selectedMonthlyById, setSelectedMonthlyById] = useState<Record<number, {
    slotId: number;
    date: string;
    start: string;
    end: string;
    status: string;
    weekKey: string;
    availabilityId: number;
  }>>({});
  // Next month lock feature
  const [lockNextMonth, setLockNextMonth] = useState<boolean>(false);
  const [nextMonthPatternsLoading, setNextMonthPatternsLoading] = useState<boolean>(false);
const [nextMonthPreview, setNextMonthPreview] = useState<Array<{
  weekday: number;      // 0-6
  dayName: string;      // "Mon"
  start: string;        // "08:00:00"
  end: string;          // "11:00:00"
  totalDates: number;
  availableDates: number;
  dateList: string[];   // raw YYYY-MM-DD list
}>>([]);
  const [nextMonthError, setNextMonthError] = useState<string>('');
  const [reservedSlotIds, setReservedSlotIds] = useState<number[]>([]);
const dateToYMD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  // Load slots from API
  const loadSlots = async () => {
    if (!tutor) {
      setAvailableSlots([]);
      return;
    }
    setIsLoading(true);
    setError("");
    const prevScrollTop = timesListRef.current?.scrollTop || 0;
    try {
      //console.log('Loading slots for tutor:', tutorIdStr, 'on date:', dateParam);
      const tutorIdStr = tutor.id.toString();
      const dateParam = selectedDate
        ? (selectedDate instanceof Date
            ? dateToYMD(selectedDate)          // was selectedDate.toISOString().slice(0,10)
            : selectedDate)
        : undefined;
        console.log("dateParam:", dateParam)
      const response: any = await tutorAPI.getTutorSlots(
        tutorIdStr,
        dateParam,
        isMonthlyClassType ? true :null
      );
      const now = new Date();
      const refDate = dateParam ? new Date(dateParam) : now;

      const weekdayLong = refDate
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
      setSelectedWeekDays([
        ...selectedWeekDays,
        weekdayLong,
      ])
      const data = response?.data || [];
      console.log("Loaded slots data:", data);
  if (Array.isArray(data) && data.length > 0 && Object.prototype.hasOwnProperty.call(data[0], 'slots')) {
        // Grouped (monthly style) structure
        const groupedRaw = data.map((g: any) => ({
            start_time: g.start_time || g.startTime,
            end_time: g.end_time || g.endTime,
            availability_id : g.availability_id,
            slots: (g.slots || []).map((s: any) => ({
              slot_id: s.slot_id || s.slotId,
              date: s.date || s.slotDate,
              status: s.status || 'AVAILABLE'
            }))
        }));
        // Filter to the selected weekday so users see only that day's occurrences
        const targetWeekday = refDate.getDay(); // 0-6 (Sun-Sat)
        const grouped = groupedRaw
          .map((g: any) => ({
            ...g,
            slots: (g.slots || []).filter((s: any) => {
              const d = new Date((s.date || '') + 'T00:00:00');
              return !isNaN(d.getTime()) && d.getDay() === targetWeekday;
            })
          }))
          .filter((g: any) => (g.slots || []).length > 0);
        setAvailableSlots(grouped);
      } else {
        setAvailableSlots(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Load slots error:', e);
      setError('Failed to load slots');
      setAvailableSlots([]);
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (timesListRef.current) {
          // restore scroll
          timesListRef.current.scrollTop = prevScrollTop;
        }
      }, 0);
    }
  };

  // Existing class detection state
  const [existingClassLoading, setExistingClassLoading] = useState(false);
  const [existingClassData, setExistingClassData] = useState<null | { exists: boolean; class_id?: number; slots?: { weekday: string; start_time: string; end_time: string }[] }>(null);
  const [existingClassError, setExistingClassError] = useState<string>('');
  const [overrideExistingClass, setOverrideExistingClass] = useState(false); // user chooses to create a new class anyway

  const classTypeToBackend = (ctId?: number | null): 'RECURRING' | 'ONE_TIME' | null => {
    if (!ctId) return null;
    return ctId === 2 ? 'RECURRING' : 'ONE_TIME';
  };

 const handleRescheduleToggle = () => {
    setOverrideExistingClass(!overrideExistingClass);
  };

  // //   if (!tutor || !isStudent || !actorId || !langId || !subjId || !ctBackend) {
  // //     // Reset when incomplete or not student
  // //     setExistingClassData(null);
  // //     setExistingClassError('');
  // //     setOverrideExistingClass(false);
  // //     return;
  // //   }
  //   if (!tutor || !isStudent || !actorId || !langId || !subjId || !ctBackend) {
  //     // Reset when incomplete or not student
  //     setExistingClassData(null);
  //     setExistingClassError('');
  //     setOverrideExistingClass(false);
  //     return;
  //   }
  const isRescheduling = overrideExistingClass;

  // //   let cancelled = false;
  // //   (async () => {
  // //     try {
  // //       setExistingClassLoading(true);
  // //       setExistingClassError('');
  // //       setOverrideExistingClass(false);
  // //       const res = await bookingAPI.checkClassExist({
  // //         tutorId: tutor.id,
  // //         languageId: langId,
  // //         subjectId: subjId,
  // //         studentId: actorId,
  // //         classType: ctBackend,
  // //       });
  // //       console.log("Existing class check result:", res);
  // //       if (cancelled) return;
  // //       if (res.success) {
  // //         setExistingClassData(res.data);
  // //       } else {
  // //         setExistingClassData(null);
  // //         setExistingClassError(res.error || 'Failed to check class');
  // //       }
  // //     } catch (e: any) {
  // //       if (!cancelled) {
  // //         setExistingClassData(null);
  // //         setExistingClassError(e?.message || 'Failed to check class');
  // //       }
  // //     } finally {
  // //       if (!cancelled) setExistingClassLoading(false);
  // //     }
  // //   })();
  //   let cancelled = false;
  //   (async () => {
  //     try {
  //       // setExistingClassLoading(true);
  //       // setExistingClassError('');
  //       // setOverrideExistingClass(false);
  //       // const res = await bookingAPI.checkClassExist({
  //       //   tutorId: tutor.id,
  //       //   languageId: langId,
  //       //   subjectId: subjId,
  //       //   studentId: actorId,
  //       //   classType: ctBackend,
  //       // });
  //       // console.log("Existing class check result:", res);
  //       // if (cancelled) return;
  //       // if (res.success) {
  //       //   setExistingClassData(res.data);
  //       // } else {
  //       //   setExistingClassData(null);
  //       //   setExistingClassError(res.error || 'Failed to check class');
  //       // }
  //     } catch (e: any) {
  //       if (!cancelled) {
  //         setExistingClassData(null);
  //         setExistingClassError(e?.message || 'Failed to check class');
  //       }
  //     } finally {
  //       if (!cancelled) setExistingClassLoading(false);
  //     }
  //   })();

  // //   return () => { cancelled = true; };
  // // }, [tutor, isStudent, actorId, preferences.selectedLanguage?.languageId, preferences.selectedSubject?.subjectId, preferences.selectedClassType?.id]);
  //   return () => { cancelled = true; };
  // }, [tutor, isStudent, actorId, preferences.selectedLanguage?.languageId, preferences.selectedSubject?.subjectId, preferences.selectedClassType?.id]);

  // Helper to format weekday/time summary
  const formatExistingSlotsSummary = (slots?: { weekday: string; start_time: string; end_time: string }[]) => {
    if (!slots || slots.length === 0) return '';
    // Group by weekday preserving order
    const map: Record<string, string[]> = {};
    slots.forEach(s => {
      const key = s.weekday;
      const range = `${s.start_time.slice(0,5)}-${s.end_time.slice(0,5)}`;
      if (!map[key]) map[key] = [];
      map[key].push(range);
    });
    return Object.entries(map)
      .map(([day, ranges]) => `${day.slice(0,3)}: ${ranges.join(', ')}`)
      .join(' | ');
  };

  // Trigger load when tutor/date/class type changes
  useEffect(() => {
    loadSlots();
    console.log("availabilitu slots :",availableSlots)
    console.log("availability slots :",availableSlots)
  }, [tutor?.tutorProfileId, selectedDate, preferences.selectedClassType?.id]);

  const calculateSlotHours = (slot: TimeSlot | null) => {
    if (!slot) return 0;
    const start = new Date(`2000-01-01T${slot.startTime}`);
    const end = new Date(`2000-01-01T${slot.endTime}`);
    return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  };

  const calculatePrice = () => {
    if (!tutor || !selectedSlotLocal) return 0;
    const basePrice = preferences.selectedSubject?.hourlyRate || tutor.hourlyRate || 0;
    const multiplier = preferences.selectedClassType?.priceMultiplier || 1.0;
    const hours = calculateSlotHours(selectedSlotLocal);
    return basePrice * multiplier * hours;
  };

  // Helpers for monthly flow
  const getDayOfWeek1to7 = (date: Date) => {
    const jsDay = date.getDay(); // 0-6 Sun-Sat
    return jsDay === 0 ? 7 : jsDay; // 1-7 Mon-Sun
  };

  const formatTimeRangeLabel = (range: string) => {
    // range: "HH:mm-HH:mm"
    const [s, e] = range.split("-");
    const sDate = new Date(`2000-01-01T${s}:00`);
    const eDate = new Date(`2000-01-01T${e}:00`);
    const f = (d: Date) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    return `${f(sDate)} - ${f(eDate)}`;
  };

  const hoursFromRange = (range: string) => {
    const [s, e] = range.split("-");
    const sDate = new Date(`2000-01-01T${s}:00`);
    const eDate = new Date(`2000-01-01T${e}:00`);
    return (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60);
  };

  const ordinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"]; const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getMonthDateRange = () => {
    const now = new Date();
    const start = new Date(Math.max(now.setHours(0,0,0,0), (selectedDate ? new Date(selectedDate) : new Date()).setHours(0,0,0,0)));
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // last day of current month from start
    end.setHours(23,59,59,999);
    return { start, end };
  };

  const generateOccurrences = async (patterns: SelectedSlotPattern[]) => {
    if (!tutor) return { all: [] as RecurringSlot[], weeks: [] as WeekBreakdown[] };
    const { start, end } = getMonthDateRange();

    // Collect all dates we need to check
    const datesToCheck: Date[] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      if (patterns.some(p => p.dayOfWeek === getDayOfWeek1to7(cursor))) {
        datesToCheck.push(new Date(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    // if (!tutor) return { all: [] as RecurringSlot[], weeks: [] as WeekBreakdown[] };
    // const { start, end } = getMonthDateRange();

    // // Collect all dates we need to check
    // const datesToCheck: Date[] = [];
    // const cursor = new Date(start);
    // while (cursor <= end) {
    //   // If any pattern matches this weekday, we need to check this date
    //   if (patterns.some(p => p.dayOfWeek === getDayOfWeek1to7(cursor))) {
    //     datesToCheck.push(new Date(cursor));
    //   }
    //   cursor.setDate(cursor.getDate() + 1);
    // }
const results = await Promise.all(
      datesToCheck.map(async (d) => {
        const dateString = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        try {
          const res = await tutorAPI.getTutorSlots(
            tutor.tutorProfileId.toString(),
            dateString,
            true
          );
          return { date: d, slots: res.success ? res.data : [] as TimeSlot[] };
        } catch {
          return { date: d, slots: [] as TimeSlot[] };
        }
      })
    );
    // Fetch slots for each date in parallel
    // const results = await Promise.all(
    //   datesToCheck.map(async (d) => {
    //     const dateString = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    //     try {
    //       const res = await tutorAPI.getTutorSlots(
    //         tutor.tutorProfileId.toString(),
    //         dateString,
    //         true
    //       );
    //       return { date: d, slots: res.success ? res.data : [] as TimeSlot[] };
    //     } catch {
    //       return { date: d, slots: [] as TimeSlot[] };
    //     }
    //   })
    // );

    // Build recurring slots
    const occurrences: RecurringSlot[] = [];
     for (const p of patterns) {
      for (const range of p.times) {
        const [s, e] = range.split("-");
        for (const r of results) {
          if (getDayOfWeek1to7(r.date) !== p.dayOfWeek) continue;
          // Check availability by matching start/end
          const found = r.slots.find(sl => sl.startTime.startsWith(s) && sl.endTime.startsWith(e));
          const dateStr = `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}-${String(r.date.getDate()).padStart(2,'0')}`;
          const iso = `${dateStr}T${s}:00`;
          occurrences.push({
            id: `${p.id}:${dateStr}:${range}`,
            dateTime: iso,
            dayOfWeek: p.dayOfWeek,
            time: range,
            isAvailable: !!found && found.status === 'AVAILABLE',
            patternId: p.id,
            slotId: (found as any)?.slotId,
          } as any);
        }
      }
    }
    // for (const p of patterns) {
    //   for (const range of p.times) {
    //     const [s, e] = range.split("-");
    //     for (const r of results) {
    //       if (getDayOfWeek1to7(r.date) !== p.dayOfWeek) continue;
    //       // Check availability by matching start/end
    //       const found = r.slots.find(sl => sl.startTime.startsWith(s) && sl.endTime.startsWith(e));
    //       const dateStr = `${r.date.getFullYear()}-${String(r.date.getMonth()+1).padStart(2,'0')}-${String(r.date.getDate()).padStart(2,'0')}`;
    //       const iso = `${dateStr}T${s}:00`;
    //       occurrences.push({
    //         id: `${p.id}:${dateStr}:${range}`,
    //         dateTime: iso,
    //         dayOfWeek: p.dayOfWeek,
    //         time: range,
    //         isAvailable: !!found && found.status === 'AVAILABLE',
    //         patternId: p.id,
    //       });
    //     }
    //   }
    // }

    // Group by week start (Monday)
    const groupByWeek = new Map<string, RecurringSlot[]>();
    occurrences.forEach(o => {
      const d = new Date(o.dateTime);
      const day = d.getDay(); // 0-6 Sun-Sat
      const diffToMonday = (day === 0 ? -6 : 1 - day); // move back to Monday
      const monday = new Date(d);
      monday.setDate(d.getDate() + diffToMonday);
      monday.setHours(0,0,0,0);
      const key = monday.toISOString().slice(0,10);
      const arr = groupByWeek.get(key) || [];
      arr.push(o);
      groupByWeek.set(key, arr);
    });

    const weeks: WeekBreakdown[] = Array.from(groupByWeek.entries())
      .sort((a,b) => a[0] < b[0] ? -1 : 1)
      .map(([weekStartDate, slots]) => ({
        weekStartDate,
        slots: slots.sort((a,b) => a.dateTime.localeCompare(b.dateTime)),
        totalSlots: slots.length,
      }));

    return { all: occurrences.sort((a,b) => a.dateTime.localeCompare(b.dateTime)), weeks };
  };
  console.log("dummyBookingPrefs.selectedClassType?.name :",dummyBookingPrefs.selectedClassType?.name)
const isMonthlyClassType = classType !== "ONE_TIME";

// Line 391: Update payload for monthly booking data
  const recomputeMonthlyTotals = (occurrences: RecurringSlot[]) => {
    if (!tutor) return 0;
    const base = preferences.selectedSubject?.hourlyRate || tutor.hourlyRate || 0;
    // No monthly discount: remove multiplier
    const totalHours = occurrences.reduce((sum, o) => sum + hoursFromRange(o.time), 0);
    return totalHours * base;
  };

  // Derived lists for monthly
  const visibleOccurrences = generatedSlots.filter(o => !excludedOccurrenceIds.includes(o.id));
  const visibleAvailableOccurrences = visibleOccurrences.filter(o => o.isAvailable);
  const hasBlockedRemaining = visibleOccurrences.some(o => !o.isAvailable);

  // ADD: Sync selected IDs when monthly mode


  // ADD: Derive ONLY user-selected occurrences from persistent map
  const selectedMonthlyOccurrences = React.useMemo(() => {
    if (!isMonthlyClassType) return [];
    return Object.values(selectedMonthlyById)
      .filter(o => o.status === 'AVAILABLE')
      .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
  }, [selectedMonthlyById, isMonthlyClassType]);

  // ADD: Helper for calculating hours from start/end time
  const hoursFromStartEnd = (start: string, end: string) => {
    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);
    return (e.getTime() - s.getTime()) / 3_600_000;
  };
  // Generic helper to decide if a slot (same-day) should be hidden because we are within threshold hours
  const shouldHideSlot = (slotDate: string, startHHmm: string, thresholdHours: number) => {
    const now = new Date();
    const slotStart = new Date(`${slotDate}T${startHHmm}:00`);
    const thresholdMoment = new Date(slotStart.getTime() - thresholdHours * 3600 * 1000);
    return now >= thresholdMoment;
  };
// const parseHourDiff = (start: string, end: string) => {
//   // start/end: "HH:MM:SS" or "HH:MM"
//   const [sh, sm] = start.split(':').map(Number);
//   const [eh, em] = end.split(':').map(Number);
//   return (eh + em/60) - (sh + sm/60);
// };

// --- 4. ADD derived memo values (after selectedMonthlyOccurrences memo)
const monthlyHours = React.useMemo(() => {
  if (!isMonthlyClassType) return 0;
  return selectedMonthlyOccurrences.reduce((sum, o) => {
    return sum + parseHourDiff(o.start, o.end);
  }, 0);
}, [isMonthlyClassType, selectedMonthlyOccurrences]);

const hourlyRate = React.useMemo(() => {
  if (preferences.selectedSubject?.hourlyRate != null)
    return preferences.selectedSubject.hourlyRate;
  if (tutor?.hourlyRate != null)
    return tutor.hourlyRate;
  return 0;
}, [preferences.selectedSubject, tutor]);

const monthlyTotal = React.useMemo(() => {
  if (!isMonthlyClassType) return 0;
  return monthlyHours * hourlyRate;
}, [isMonthlyClassType, monthlyHours, hourlyRate]);

  // UPDATE: Monthly total calculation based on selected occurrences
  // useEffect(() => {
  //   if (!isMonthlyClassType) {
  //     setMonthlyTotal(0);
  //     return;
  //   }
  //   const base = (preferences.selectedSubject?.hourlyRate || tutor?.hourlyRate || 0);
  //   const totalHours = selectedMonthlyOccurrences
  //     .reduce((sum, o) => sum + hoursFromStartEnd(o.start, o.end), 0);
  //     console.log("final price :",totalHours*base)
  //   setMonthlyTotal(totalHours * base);
  // }, [isMonthlyClassType, selectedMonthlyOccurrences, preferences.selectedSubject, tutor]);

  // Derive unique patterns (weekday + time range) from selected occurrences (for next-month lock)
  const currentPatterns = React.useMemo(() => {
    if (!isMonthlyClassType) return [] as Array<{ weekday: number; start: string; end: string }>;
    const map = new Map<string, { weekday: number; start: string; end: string }>();
    selectedMonthlyOccurrences.forEach(o => {
      const d = new Date(o.date);
      const weekday = d.getDay(); // 0-6
      const key = `${weekday}-${o.start}-${o.end}`;
      if (!map.has(key)) map.set(key, { weekday, start: o.start, end: o.end });
    });
    return Array.from(map.values());
  }, [selectedMonthlyOccurrences, isMonthlyClassType]);

  const getNextMonthRange = () => {
    // Base on first selected slot date OR today
    const baseDateStr = selectedMonthlyOccurrences[0]?.date || new Date().toISOString().slice(0,10);
    const base = new Date(baseDateStr);
    base.setDate(1);
    base.setMonth(base.getMonth() + 1); // first day next month
    const start = new Date(base);
    const end = new Date(base);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0); // last day of next month
    end.setHours(23,59,59,999);
    return { start, end };
  };


  const weekDayNameToIndex = (w: string) => {
  const map: Record<string, number> = {
    SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6
  };
  return map[w.toUpperCase()] ?? 0;
};
const dayShort = (idx: number) => ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][idx];
const formatTimeCompact = (t: string) => {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${parseInt(h,10)}.${m}`;
};
const formatMonthDay = (d: string) => {
  // d = YYYY-MM-DD -> M-D (no leading zeros)
  const [Y,M,D] = d.split('-');
  return `${parseInt(M,10)}-${parseInt(D,10)}`;
};
const fetchNextMonthPreview = async () => {
  console.log("heeeee");
  if (!tutor) return;
  console.log("heeeee2");
  setNextMonthError("");
  setNextMonthPatternsLoading(true);

  // Build availabilityId list primarily from reserved class info (repay flow)
  let availabilityIdList: number[] = [];
  if (reservedClassInfo?.availability_details && Array.isArray(reservedClassInfo.availability_details)) {
    availabilityIdList = Array.from(new Set(
      reservedClassInfo.availability_details
        .map((d: any) => Number(d.availability_id ?? d.availabilityId))
        .filter((n: number) => !isNaN(n) && n > 0)
    ));
  }
  // Fallback: collect from user's monthly selections
  if (availabilityIdList.length === 0) {
    for (const occ of selectedMonthlyOccurrences) {
      if (occ.availabilityId && !availabilityIdList.includes(occ.availabilityId)) {
        availabilityIdList.push(occ.availabilityId);
      }
    }
  }

  try {
    console.log("availability list :",availabilityIdList)
    // Ensure unique
    availabilityIdList = Array.from(new Set(availabilityIdList));

    if (availabilityIdList.length === 0) {
      setNextMonthPatternsLoading(false);
      return;
    }

    // Get next month/year
    console.log("selectedMonthlyOccurrences :",selectedMonthlyOccurrences)
    const baseDateStr = selectedMonthlyOccurrences[0]?.date || dateToYMD(new Date());
    const base = new Date(baseDateStr + "T00:00:00");
    console.log("base :",base,"basedateStr :",baseDateStr)
    
   
  console.log("Fetching next month slots for availability IDs:", availabilityIdList, "for", nextYear, nextMonth);
  const resp = await tutorAPI.getNextMonthSlots(availabilityIdList, computedNextMonth, computedNextYear);
    console.log("Next month slots response:", resp);

    if (!resp.success) {
      throw new Error(resp.error || "Failed fetching next month slots");
    }

  const data = resp.data;
    console.log("Raw next-month API data:", data[0].all_slot_ids);
  // Save flat list of next-month slot IDs to context (used in payment payload)
  setNextMonthSlots( data[0].all_slot_ids || []);
    // 🧠 Adjusted normalization logic for new structure
    let slotRecords: any[] = [];

    if (Array.isArray(data)) {
      // Separate objects that have slot info vs all_slot_ids
      const availabilityItems = data.filter(
        (d) => d.availability_id && d.week_day
      );
      if (availabilityItems.length > 0) {
        slotRecords = availabilityItems;
      } else if (data.length > 0 && Array.isArray(data[0].get_next_month_slots)) {
        slotRecords = data[0].get_next_month_slots;
      }
    }

    console.log("Normalized slotRecords:", slotRecords);

    const preview = slotRecords
      .map((r: any) => {
        const weekDayRaw = r.week_day || r.weekDay;
        const startRaw = r.start_time || r.startTime;
        const endRaw = r.end_time || r.endTime;
        const availId = r.availability_id || r.availabilityId;

        if (!weekDayRaw || !startRaw || !endRaw) {
          console.warn("Skipping malformed record:", r);
          return null;
        }

        const weekdayIdx = weekDayNameToIndex(String(weekDayRaw));
        const dates: string[] = Array.isArray(r.available_dates)
          ? r.available_dates
          : Array.isArray(r.availableDates)
          ? r.availableDates
          : [];

        return {
          weekday: weekdayIdx,
          dayName: dayShort(weekdayIdx),
          start: startRaw,
          end: endRaw,
          totalDates: dates.length,
          availableDates: dates.length,
          dateList: dates
        };
      })
      .filter(Boolean);

    console.log("Next month preview parsed:", preview);

    if (preview[0]?.dateList.length === 0) {
      setNextMonthError("No next month availability returned for selected patterns.");
    }

    setNextMonthPreview(preview.filter(Boolean) as Array<{
      weekday: number;
      dayName: string;
      start: string;
      end: string;
      totalDates: number;
      availableDates: number;
      dateList: string[];
    }>);
  } catch (e: any) {
    console.error("Error fetching next month preview:", e);
    setNextMonthError(e?.message || "Failed to prepare next month preview");
    setNextMonthPreview([]);
  } finally {
    setNextMonthPatternsLoading(false);
  }
};

//   const fetchNextMonthPreview = async () => {
//     console.log("heeeee")
//   if (!defaultTutor) return;
//   setNextMonthError('');
//   setNextMonthPatternsLoading(true);

//   let availabilityIdList: number[] = [];
//     if(!overrideExistingClass){
//     availabilityIdList = dummyAvailabilityIdList;
//   }
//   try {
//     // Collect unique availability ids from selected occurrences
//     for (const occ of selectedMonthlyOccurrences) {
//       if (occ.availabilityId && !availabilityIdList.includes(occ.availabilityId)) {
//         availabilityIdList.push(occ.availabilityId);
//       }
//     }
//     if (availabilityIdList.length === 0) {
//       setNextMonthPatternsLoading(false);
//       return;
//     }

//     // Determine next month/year based on first selected slot date or today
//     const baseDateStr = selectedMonthlyOccurrences[0]?.date || dateToYMD(new Date());
//     const base = new Date(baseDateStr + 'T00:00:00');
//     let nextMonth = base.getMonth() + 2; // JS month + 1 then next month => +2
//     let nextYear = base.getFullYear();
//     if (nextMonth === 13) { nextMonth = 1; nextYear += 1; }

//     // Call new API
//     console.log("Fetching next month slots for availability IDs:", availabilityIdList, "for", nextYear, nextMonth);
//     const resp = await tutorAPI.getNextMonthSlots(availabilityIdList, nextMonth, nextYear);
//     console.log("Next month slots response:", resp);
//     if (!resp.success) {
//       throw new Error(resp.error || 'Failed fetching next month slots');
//     }

//     // Response shape example:
//     // [{ get_next_month_slots: [ { end_time,start_time,week_day,availability_id,available_dates:[...] }, ... ] }]
//     const data = resp.data;
//     console.log("Raw next-month API data:", data);

//     let slotRecords: any[] = [];

//     if (Array.isArray(data)) {
//       // Case A: [{ get_next_month_slots: [...] }]
//       if (data[0]?.get_next_month_slots && Array.isArray(data[0].get_next_month_slots)) {
//         slotRecords = data[0].get_next_month_slots;
//       }
//       // Case B: direct array of slot objects
//       else if (data.length && (data[0].week_day || data[0].weekDay)) {
//         slotRecords = data;
//       }
//       // Case C: wrapper objects inside array
//       else {
//         const found = data.find(
//           (o: any) => o && Array.isArray(o.get_next_month_slots)
//         );
//         if (found) slotRecords = found.get_next_month_slots;
//       }
//     } else if (data && typeof data === "object") {
//       // Case D: { get_next_month_slots: [...] }
//       if (Array.isArray((data as any).get_next_month_slots)) {
//         slotRecords = (data as any).get_next_month_slots;
//       }
//       // Case E: { data: { get_next_month_slots: [...] } }
//       else if (Array.isArray((data as any).data?.get_next_month_slots)) {
//         slotRecords = (data as any).data.get_next_month_slots;
//       }
//     }

//     if (!Array.isArray(slotRecords)) slotRecords = [];

//     console.log("Normalized next-month slot records:", slotRecords);

//     const preview: typeof nextMonthPreview = slotRecords
//       .map((r: any) => {
//         const weekDayRaw = r.week_day || r.weekDay;
//         const startRaw = r.start_time || r.startTime;
//         const endRaw = r.end_time || r.endTime;
//         const availId = r.availability_id || r.availabilityId;

//         if (!weekDayRaw || !startRaw || !endRaw) {
//           console.warn("Skipping malformed record:", r);
//           return null;
//         }

//         const weekdayIdx = weekDayNameToIndex(String(weekDayRaw));
//         const dates: string[] = Array.isArray(r.available_dates)
//           ? r.available_dates
//           : Array.isArray(r.availableDates)
//           ? r.availableDates
//           : [];

//         return {
//           weekday: weekdayIdx,
//           dayName: dayShort(weekdayIdx),
//             start: startRaw,
//           end: endRaw,
//           totalDates: dates.length,
//           availableDates: dates.length,
//           dateList: dates
//         };
//       })
//       .filter(Boolean) as any[];

//     console.log("Next month preview parsed:", preview);

//     if (preview.length === 0) {
//       setNextMonthError("No next month availability returned for selected patterns.");
//     }

//     setNextMonthPreview(preview);
//     //setNextMonthPreview(preview);
//   } catch (e: any) {
//     setNextMonthError(e?.message || 'Failed to prepare next month preview');
//     setNextMonthPreview([]);
//   } finally {
//     setNextMonthPatternsLoading(false);
//   }
// };


  // Trigger fetch when user toggles lock next month ON
  useEffect(() => {
    // Auto-fetch next month preview for repay flow when reserved class info is present
    const shouldFetchForRepay = !!reservedClassInfo && Array.isArray(reservedClassInfo.availability_details) && reservedClassInfo.availability_details.length > 0;
    if ((lockNextMonth && isMonthlyClassType && selectedMonthlyOccurrences.length > 0) || shouldFetchForRepay) {
      fetchNextMonthPreview();
    } else {
      setNextMonthPreview([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockNextMonth, JSON.stringify(currentPatterns), isMonthlyClassType, selectedMonthlyOccurrences.length, JSON.stringify(reservedClassInfo?.availability_details || [])]);

  // UPDATE: Validation for monthly
  const isValid = () => {
  if (!tutor) return false;
    // Monthly route: show proceed when at least one occurrence is selected
    if (isMonthlyClassType) {
      return selectedMonthlyOccurrences.length > 0;
    }
    // One-time (kept for completeness if used elsewhere)
    return !!selectedSlotLocal;
  };


  const toggleRangeSelectAll = (rangeKey: string, group: any, checked: boolean) => {
    const shortRange = `${group.start_time.slice(0,5)}-${group.end_time.slice(0,5)}`;
    const computeWeekKey = (dateStr: string) => {
      const d = new Date(dateStr);
      const day = d.getDay();
      const diffToMon = (day === 0 ? -6 : 1 - day);
      const mon = new Date(d);
      mon.setDate(d.getDate() + diffToMon);
      mon.setHours(0,0,0,0);
      return mon.toISOString().slice(0,10);
    };

    if (checked) {
      const avail = (group.slots || []).filter((o: any) => (o.status || 'AVAILABLE') === 'AVAILABLE');
      let tempMap = { ...selectedMonthlyById } as typeof selectedMonthlyById;
      let blocked = false;
      // Track distinct weekdays per week for enforcement (max 4 days/week)
      const weekDaySets: Record<string, Set<number>> = {};
      Object.values(tempMap).forEach(o => {
        const wk = o.weekKey;
        const d = new Date(o.date).getDay();
        if (!weekDaySets[wk]) weekDaySets[wk] = new Set<number>();
        weekDaySets[wk].add(d);
      });

      for (const occ of avail) {
        if (tempMap[occ.slot_id]) continue;
        const weekKey = computeWeekKey(occ.date);
        const dayIdx = new Date(occ.date).getDay();
        const set = weekDaySets[weekKey] || new Set<number>();
        const hasDay = set.has(dayIdx);
        if (!hasDay && set.size >= 4) {
          blocked = true;
          continue;
        }
        tempMap[occ.slot_id] = {
          slotId: occ.slot_id,
          date: occ.date,
          start: group.start_time,
          end: group.end_time,
          status: occ.status || 'AVAILABLE',
          weekKey,
          availabilityId: group.availability_id
        };
        if (!hasDay) {
          set.add(dayIdx);
          weekDaySets[weekKey] = set;
        }
      }

      if (blocked) {
        setError('You can select up to 4 days per week.');
      } else {
        setError('');
      }

      setSelectedMonthlyById(tempMap);
      const ids = Object.keys(tempMap).map(Number);
      setSelectedOccurrenceIds(ids);
      setRangeSelectAll(prev => ({ ...prev, [rangeKey]: avail.every((o: any) => !!tempMap[o.slot_id]) }));

      if (isMonthlyClassType && selectedDate) {
        const dayOfWeek = getDayOfWeek1to7(selectedDate);
        const patternId = `${dayOfWeek}-${shortRange}`;
        setSelectedPatterns(prev => {
          if (prev.some(p => p.id === patternId)) return prev;
          return [...prev, {
            id: patternId,
            dayOfWeek,
            times: [shortRange],
            generatedSlots: []
          }];
        });
      }
    } else {
      const allIds = (group.slots || []).map((o: any) => o.slot_id);
      const newMap = { ...selectedMonthlyById } as typeof selectedMonthlyById;
      allIds.forEach((id: number) => { delete newMap[id]; });
      setSelectedMonthlyById(newMap);
      setSelectedOccurrenceIds(Object.keys(newMap).map(Number));
      setRangeSelectAll(prev => ({ ...prev, [rangeKey]: false }));

      if (isMonthlyClassType && selectedDate) {
        const dayOfWeek = getDayOfWeek1to7(selectedDate);
        setSelectedPatterns(prev =>
          prev.filter(p => !(p.dayOfWeek === dayOfWeek && p.times[0] === shortRange))
        );
      }
      setError('');
    }
  };
  // useEffect(() => {
  //   if (isMonthlyClassType) {
  //     setMonthlySelectedSlotIds(selectedOccurrenceIds);
  //   }
  // }, [isMonthlyClassType, selectedOccurrenceIds]);
  // // When patterns change, regenerate occurrences and totals
  // useEffect(() => {
  //   (async () => {
  // if (isMonthlyClassType && selectedPatterns.length > 0) {
  //   const { all, weeks } = await generateOccurrences(selectedPatterns);
  //   setGeneratedSlots(all);
  //   setWeekBreakdown(weeks);
  //   // Reset exclusions if patterns changed fundamentally (optional: keep if same ids)
  //   // setExcludedOccurrenceIds([]);
  //   const filtered = all.filter(o => !excludedOccurrenceIds.includes(o.id) && o.isAvailable);
  //   //setMonthlyTotal(recomputeMonthlyTotals(filtered));
  //     } else {
  //       setGeneratedSlots([]);
  //       setWeekBreakdown([]);
  //       //setMonthlyTotal(0);
  //   setExcludedOccurrenceIds([]);
  //     }
  //   })();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [JSON.stringify(selectedPatterns), preferences.selectedSubject, preferences.selectedClassType, tutor, JSON.stringify(excludedOccurrenceIds)]);
  useEffect(() => {
    if (isMonthlyClassType) {
      setMonthlySelectedSlotIds(selectedOccurrenceIds);
    }
  }, [isMonthlyClassType, selectedOccurrenceIds]);
  // When patterns change, regenerate occurrences and totals
  useEffect(() => {
    (async () => {
  if (isMonthlyClassType && selectedPatterns.length > 0) {
    const { all, weeks } = await generateOccurrences(selectedPatterns);
    setGeneratedSlots(all);
    setWeekBreakdown(weeks);
    // Reset exclusions if patterns changed fundamentally (optional: keep if same ids)
    // setExcludedOccurrenceIds([]);
    const filtered = all.filter(o => !excludedOccurrenceIds.includes(o.id) && o.isAvailable);
    //setMonthlyTotal(recomputeMonthlyTotals(filtered));
      } else {
        setGeneratedSlots([]);
        setWeekBreakdown([]);
        //setMonthlyTotal(0);
    setExcludedOccurrenceIds([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selectedPatterns), preferences.selectedSubject, preferences.selectedClassType, tutor, JSON.stringify(excludedOccurrenceIds)]);




const handleContinue = async () => {
  if (!isValid()) {
    setError("Please complete all selections to continue");
    return;
  }
  if (isLoading) return;

  setError("");
  setIsLoading(true);

  try {
    // Repay flow: if classId is present, proceed without requiring manual monthly selection
    if (classId) {
      // Ensure nextMonthSlots are prepared
      if (!nextMonthPreview.length) {
        try { await fetchNextMonthPreview(); } catch {}
      }
      // Populate context for payment page
      if (reservedClassInfo?.tutor_details) {
        setTutorCtx(reservedClassInfo.tutor_details);
      } else if (tutor) {
        setTutorCtx(tutor);
      }
      setBookingPreferencesCtx({
        selectedSubject: reservedClassInfo?.subject_details || preferences.selectedSubject || null,
        selectedLanguage: reservedClassInfo?.language_details || preferences.selectedLanguage || null,
        selectedClassType: CLASS_TYPES.find(ct => ct.id === 2) ?? null,
        finalPrice: isMonthlyClassType
                ? monthlyTotal
                : calculatePrice(),
      });
      // Not locking current slots; payment will carry nextMonthSlots via context
      const now = new Date();
      const validOccurrences = selectedMonthlyOccurrences.filter(o => {
        const slotStart = new Date(`${o.date}T${o.start}`);
        const threshold = new Date(slotStart.getTime() - 2 * 3600 * 1000);
        return !(now.toDateString() === slotStart.toDateString() && now >= threshold);
      });

      if (validOccurrences.length !== selectedMonthlyOccurrences.length) {
        // prune removed
        setSelectedMonthlyById(prev => {
          const updated = { ...prev };
          Object.values(prev).forEach(v => {
            const slotStart = new Date(`${v.date}T${v.start}`);
            const threshold = new Date(slotStart.getTime() - 2 * 3600 * 1000);
            if (now.toDateString() === slotStart.toDateString() && now >= threshold) {
              delete (updated as any)[v.slotId];
            }
          });
          return updated;
        });
        setSelectedOccurrenceIds(validOccurrences.map(v => v.slotId));
        setError("Some slots were inside 2h start window and were removed. Review then retry.");
        setIsLoading(false);
        return;
      }
useEffect(()=>{
  console.log("next month  :",ctxNextMonth);
},[ctxNextMonth])
      const slotIds = validOccurrences
        .filter(o => o.status === "AVAILABLE")
        .map(o => o.slotId);

      if (slotIds.length === 0) {
        setError("Select at least one available slot.");
        setIsLoading(false);
        return;
      }
      console.log("slot ids :",slotIds)
      setLockedSlotIdsCtx(slotIds);
      const response = await bookingAPI.reserveSlots(slotIds);
      console.log("response :",response)
      if (!response.success) {
        setError(response.error || "Failed to reserve selected slots.");
        setIsLoading(false);
        return;
      }

      // setDummyBookingPrefs(prev => ({
      //   ...prev,
      //   finalPrice:bookingPreferences.finalPrice || 100,
      // }));
      //setAvailabilitySlotsMapCtx(undefined as any);
      const groupedAvail: Record<string, number[]> = {};
      validOccurrences.forEach(v => {
        const rec = (selectedMonthlyById as any)[v.slotId];
        const key = rec?.availabilityId != null ? String(rec.availabilityId) : 'default';
        if (!groupedAvail[key]) groupedAvail[key] = [];
        groupedAvail[key].push(v.slotId);
      });
      console.log("groupedAvail :",groupedAvail)
       setAvailabilitySlotsMapCtx(groupedAvail);
      const expireAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      setRepayTimerCtx({ expiresAt: expireAt, timer: 900 });
      proceedToStepCtx("payment");
      setCurrentStepCtx('payment');
      router.push("/dashboard/student/pay-for-next-month/payment");
      setIsLoading(false);
      return;
    }
    // ======================= MONTHLY FLOW =======================
    if (isMonthlyClassType) {
      if (selectedMonthlyOccurrences.length === 0) {
        setError("Select at least one slot.");
        setIsLoading(false);
        return;
      }

      // Re-validate 2h threshold
      const now = new Date();
      const validOccurrences = selectedMonthlyOccurrences.filter(o => {
        const slotStart = new Date(`${o.date}T${o.start}`);
        const threshold = new Date(slotStart.getTime() - 2 * 3600 * 1000);
        return !(now.toDateString() === slotStart.toDateString() && now >= threshold);
      });

      if (validOccurrences.length !== selectedMonthlyOccurrences.length) {
        // prune removed
        setSelectedMonthlyById(prev => {
          const updated = { ...prev };
          Object.values(prev).forEach(v => {
            const slotStart = new Date(`${v.date}T${v.start}`);
            const threshold = new Date(slotStart.getTime() - 2 * 3600 * 1000);
            if (now.toDateString() === slotStart.toDateString() && now >= threshold) {
              delete (updated as any)[v.slotId];
            }
          });
          return updated;
        });
        setSelectedOccurrenceIds(validOccurrences.map(v => v.slotId));
        setError("Some slots were inside 2h start window and were removed. Review then retry.");
        setIsLoading(false);
        return;
      }

      const slotIds = validOccurrences
        .filter(o => o.status === "AVAILABLE")
        .map(o => o.slotId);

      if (slotIds.length === 0) {
        setError("Select at least one available slot.");
        setIsLoading(false);
        return;
      }
      console.log("slot ids :",slotIds)
      const response = await bookingAPI.reserveSlots(slotIds);
      console.log("response :",response)
      if (!response.success) {
        setError(response.error || "Failed to reserve selected slots.");
        setIsLoading(false);
        return;
      }

      // Build availability_id -> [slotIds] map for backend confirmation (no sessionStorage)
      const groupedAvail: Record<string, number[]> = {};
      validOccurrences.forEach(v => {
        const rec = (selectedMonthlyById as any)[v.slotId];
        const key = rec?.availabilityId != null ? String(rec.availabilityId) : 'default';
        if (!groupedAvail[key]) groupedAvail[key] = [];
        groupedAvail[key].push(v.slotId);
      });
  setAvailabilitySlotsMapCtx(groupedAvail);


      const firstDate = validOccurrences[0].date;
      const lastDate = validOccurrences[validOccurrences.length - 1].date;
console.log("h1")
      const booking: MonthlyClassBooking = {
        //id: response.data?.reservationId || `monthly-${Date.now()}`,
        //tutorId: String(tutor!.id),
        //subjectId: String(preferences.selectedSubject!.subjectId),
        // languageId: String(
        //   (preferences.selectedLanguage || tutor!.languages[0]).languageId
        // ),
        //patterns: [],
        //weekBreakdown: [],
        totalSlots: slotIds.length,
        totalCost: monthlyTotal,
        //status: "PENDING",
        //createdAt: new Date().toISOString(),
        startDate: firstDate,
        endDate: lastDate
      };
console.log("h2")
      
          setMonthlyBookingDataCtx(booking);
          console.log("monthly booking data set :",booking)
          const finalPreferences = {
            ...preferences,
            finalPrice: monthlyTotal
          };
console.log("h3")

  setBookingPreferencesCtx(finalPreferences);
console.log("h4")
      setLockedSlotIdsCtx(slotIds)
    setReservationDetailsCtx({
        reservationSlotId: response.data?.reservationId || `temp-${Date.now()}`,
        expiresAt:
          response.data?.expiresAt ||
          new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        timer: 900
      });
console.log("h5")

  proceedToStepCtx("payment");
    console.log("h6")
    setCurrentStepCtx('payment');
    router.push("/dashboard/student/pay-for-next-month/payment");
      console.log("h7")

      return; // CRITICAL: stop here so single flow never runs
    }

    // ======================= ONE-TIME FLOW =======================
    if (!selectedSlotLocal) {
      setError("Please select a valid slot");
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const slotDate =
      (selectedSlotLocal as any).slotDate ||
      (selectedDate instanceof Date ? dateToYMD(selectedDate) : selectedDate);
    const singleStart = new Date(`${slotDate}T${selectedSlotLocal.startTime}`);
    const threshold3h = new Date(singleStart.getTime() - 3 * 3600 * 1000);

    if (now.toDateString() === singleStart.toDateString() && now >= threshold3h) {
      setError("This slot is within 3 hours of start and cannot be booked.");
      setIsLoading(false);
      return;
    }

  const singleResp = await bookingAPI.reserveSlots([selectedSlotLocal.slotId]);
    if (!singleResp.success) {
      setError(singleResp.error || "This slot is currently unavailable");
      setIsLoading(false);
      return;
    }

    try {

      sessionStorage.setItem("bookingMode", "single");
      // Set availability -> [slotIds] mapping in context (no sessionStorage)
      const availId = (selectedSlotLocal as any).availabilityId;
      if (availId != null) {
  setAvailabilitySlotsMapCtx({ [String(availId)]: [selectedSlotLocal.slotId] });
      } else {
  setAvailabilitySlotsMapCtx({ default: [selectedSlotLocal.slotId] });
      }
    } catch {}

    const finalPreferences = {
      ...preferences,
      finalPrice: calculatePrice()
    };

    //setSelectedSlot(selectedSlotLocal);
  setLockedSlotIdsCtx([selectedSlotLocal.slotId]);
  setBookingPreferencesCtx(finalPreferences);
  setReservationDetailsCtx({
      reservationSlotId: singleResp.data?.reservationId || `temp-${Date.now()}`,
      expiresAt:
        singleResp.data?.expiresAt ||
        new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      timer: 900
    });

  proceedToStepCtx("payment");
    setCurrentStepCtx('payment');
    router.push("/dashboard/student/pay-for-next-month/payment");
  } catch (err: any) {
    console.error("Booking error:", err);
    setError(err?.message || "Failed to process booking. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
  // const handleContinue = async () => {
  //   if (!isValid()) {
  //     setError("Please complete all selections to continue");
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     setError('');

  //     if (isMonthlyClassType) {
  //       const now = new Date();

  //       const validOccurrences = selectedMonthlyOccurrences.filter(o => {
  //         const slotStart = new Date(`${o.date}T${o.start}`);
  //         const threshold = new Date(slotStart.getTime() - 2 * 3600 * 1000);
  //         return !(now.toDateString() === slotStart.toDateString() && now >= threshold);
  //       });
  //       console.log("validOccurrences :", validOccurrences);
  //       if (validOccurrences.length !== selectedMonthlyOccurrences.length) {
  //         // prune removed
  //         setSelectedMonthlyById(prev => {
  //           const updated = { ...prev } as typeof prev;
  //           Object.values(prev).forEach(v => {
  //             const slotStart = new Date(`${v.date}T${v.start}`);
  //             const threshold = new Date(slotStart.getTime() - 2 * 3600 * 1000);
  //             if (now.toDateString() === slotStart.toDateString() && now >= threshold) {
  //               delete (updated as any)[v.slotId];
  //             }
  //           });
  //           return updated;
  //         });
  //         setSelectedOccurrenceIds(validOccurrences.map(v => v.slotId));
  //         setError('Some slots were too close to start time (inside 2h) and were removed. Please review before continuing.');
  //         setIsLoading(false);
  //         return;
  //       }
  //       const slotIdsToReserve = validOccurrences.filter(o => o.status === 'AVAILABLE').map(o => o.slotId);
  //       if (slotIdsToReserve.length === 0) {
  //         setError('Select at least one available slot.');
  //         setIsLoading(false);
  //         return;
  //       }
  //       const response = await bookingAPI.reserveSlots(slotIdsToReserve);
  //       if (!response.success) {
  //         setError(response.error || 'Failed to reserve selected slots');
  //         setIsLoading(false);
  //         return;
  //       }
  //       try { sessionStorage.setItem('reservedSlots', JSON.stringify(slotIdsToReserve)); } catch {}

  //       const firstDate = validOccurrences[0].date;
  //       const lastDate = validOccurrences[validOccurrences.length - 1].date;
        
  //       const booking: MonthlyBookingType = {
  //         id: response.data?.reservationId || `monthly-${Date.now()}`,
  //         tutorId: String(tutor!.id),
  //         subjectId: String(preferences.selectedSubject!.subjectId),
  //         languageId: String((preferences.selectedLanguage || tutor!.languages[0]).languageId),
  //         patterns: [],
  //         weekBreakdown: [],
  //         totalSlots: slotIdsToReserve.length,
  //         totalCost: monthlyTotal,
  //         status: 'PENDING',
  //         createdAt: new Date().toISOString(),
  //         startDate: firstDate,
  //         endDate: lastDate,
  //       };

  //       setMonthlyBookingData(booking);
  //       const finalPreferences = { ...preferences, finalPrice: monthlyTotal };
  //       setBookingPreferences(finalPreferences);

  //       setReservationDetails({
  //         reservationSlotId: response.data?.reservationId || `temp-${Date.now()}`,
  //         expiresAt: response.data?.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  //         timer: 900,
  //       });

  //       await new Promise(r => setTimeout(r, 100));
  //       proceedToStep('payment');
  //       router.push('/dashboard/student/find-tutor/book/payment');
  //       return;
  //     }

  //     // Regular flow: reserve selected slot (sent as a list)
  //     if (!selectedSlotLocal) {
  //       setError("Please select a valid slot");
  //       setIsLoading(false);
  //       return;
  //     }
  //     console.log("here we are again");
  //     const now = new Date();
  //     const slotDate = (selectedSlotLocal as any).slotDate ||
  //       (selectedDate instanceof Date ? dateToYMD(selectedDate) : selectedDate);      const singleStart = new Date(`${slotDate}T${selectedSlotLocal.startTime}`);
  //     const threshold3h = new Date(singleStart.getTime() - 3 * 3600 * 1000);
  //     if (now.toDateString() === singleStart.toDateString() && now >= threshold3h) {
  //       setError('This slot is now within 3 hours of start time and cannot be booked.');
  //       setIsLoading(false);
  //       return;
  //     }
  //     const response = await bookingAPI.reserveSlots([selectedSlotLocal.slotId]);
  //     if (!response.success) {
  //       setError(response.error || "This slot is currently unavailable");
  //       setIsLoading(false);
  //       return;
  //     }
  //     try { sessionStorage.setItem('reservedSlots', JSON.stringify([selectedSlotLocal.slotId])); } catch {}

  //     const finalPreferences = {
  //       ...preferences,
  //       finalPrice: calculatePrice()
  //     };

  //     setSelectedSlot(selectedSlotLocal);
  //     setBookingPreferences(finalPreferences);

  //     setReservationDetails({
  //       reservationSlotId: response.data?.reservationId || `temp-${Date.now()}`,
  //       expiresAt: response.data?.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  //       timer: 900,
  //     });

  //     await new Promise(resolve => setTimeout(resolve, 100));
  //     proceedToStep('payment');
  //     router.push('/dashboard/student/find-tutor/book/payment');
  //   } catch (error) {
  //     console.error("Booking error:", error);
  //     setError("Failed to process booking. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  // Prepare options for dropdowns
  const subjectOptions = (tutor?.subjects || []).map((subject: any) => ({
    value: 1,
    label: subject.subjectName || 'Unnamed Subject',
    sublabel: `${formatPrice(subject.hourlyRate)}/hr`,
  })) || [];

const languageOptions = (tutor?.languages || []).map((language: any, index: number) => ({
  value: 1,
  label: language.languageName || `Language ${language.languageId}`,
})) || [];

  const classTypeOptions = CLASS_TYPES.map(type => ({
    value: type.id.toString(),
    label: type.name,
    //badge: type.priceMultiplier < 1.0 ? `${Math.round((1 - type.priceMultiplier) * 100)}% OFF` : undefined
  }));

  // If already paid, render only the focused message and nothing else
  if (alreadyPaid) {
    const displayMonth = nextMonth ?? computedNextMonth;
    const displayYear = nextYear ?? computedNextYear;
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Already Paid</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">
              You have already paid for {displayMonth}/{displayYear}. No additional payment is needed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Progress Bar */}
      
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Back to Classes */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/student/profile/classes")}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Classes
          </Button>
        </div>
          {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      
      {/* --- Reserved Class Details Section --- */}
      <Card className="animate-in slide-in-from-top-2 duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Existing Class Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border items-center">
            <div><p className="text-sm text-slate-500">Tutor</p><p className="font-semibold">{classMeta?.tutorName || `${tutor?.firstName ?? ''} ${tutor?.lastName ?? ''}`}</p></div>
            <div><p className="text-sm text-slate-500">Subject</p><p className="font-semibold">{bookingPreferences.selectedSubject?.subjectName || classMeta?.subjectName}</p></div>
            <div><p className="text-sm text-slate-500">Language</p><p className="font-semibold">{bookingPreferences.selectedLanguage?.languageName || classMeta?.languageName}</p></div>
            <div><p className="text-sm text-slate-500">Total Price</p><p className="font-bold text-lg text-blue-600">{formatPrice(totalReservedPrice)}</p></div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Reserved Time Slots:</h4>
            {reservedSlots.length > 0 ? (
              <div className="space-y-2">
                {reservedSlots.map((slot, index) => (
                  <div key={index} className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-sm">{slot.day}</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{slot.time}</span>
                      {slot.availabilityId ? (
                        <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
                          ID #{slot.availabilityId}
                        </span>
                      ) : null}
                    </div>
                    {slot.dates && slot.dates.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {slot.dates.map((d) => (
                          <span key={d} className="text-[10px] px-2 py-0.5 rounded bg-white/70 dark:bg-black/20 border border-blue-200/60 dark:border-blue-800/40 text-slate-700 dark:text-slate-300">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              reservedSlotsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) :
              <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No reserved slots found. You need to book a new class.
                </AlertDescription>
              </Alert>
            )}
          </div>
          {isMonthlyClassType && reservedSlotsLoading && (
                        <div className="pt-4 border-t border-gray-200/80 dark:border-gray-700/80">
              <label className="flex items-start gap-3 text-sm cursor-pointer select-none group p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={lockNextMonth}
                    disabled={nextMonthPatternsLoading}
                    onChange={(e) => setLockNextMonth(e.target.checked)}
                  />
                  <div className="w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-disabled:opacity-50 transition-all duration-200 peer-checked:shadow-lg shadow-blue-200 dark:shadow-blue-800"></div>
                  <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Reserve Next Month's Schedule
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    reserve <strong className="text-blue-600 dark:text-blue-400">same weekday & time patterns</strong> for next month. If you do not pay for next month at least <strong>48 hours</strong> before its first class, those future locks are automatically canceled.                  </div>
                </div>
              </label>

              {lockNextMonth && (
                <div className="mt-4 rounded-xl border-2 border-blue-200/60 dark:border-blue-700/60 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm p-4 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      📅 Next Month Preview
                    </span>
                    {nextMonthPatternsLoading && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-200 animate-pulse">
                        Loading...
                      </span>
                    )}
                  </div>
                  
                  {nextMonthError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      {nextMonthError}
                    </div>
                  )}
                  
                  {!nextMonthPatternsLoading && nextMonthPreview.length === 0 && !nextMonthError && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No patterns available for next month
                    </div>
                  )}

                  {nextMonthPreview.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {nextMonthPreview.map(p => {
                        const timeRange = `${formatTimeCompact(p.start)}-${formatTimeCompact(p.end)}`;
                        const datesJoined = p.dateList.map(formatMonthDay).join(', ');
                        return (
                          <div
                            key={`${p.weekday}-${p.start}-${p.end}`}
                            className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-blue-100/50 dark:border-blue-800/30"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                                {p.dayName} {timeRange}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {datesJoined}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          

          {reservedSlots.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Button onClick={handleRescheduleToggle} variant="outline" className="flex-1">
                {isRescheduling ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Use Booked Reserved Slots
                  </>
                ) : (
                  <>
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Reschedule for Next Month
                  </>
                )}
              </Button>
              {!isRescheduling && (
                <Button 
                  onClick={() => {
                    setCtxNextMonth(computedNextMonth);
                    setCtxNextYear(computedNextYear);
                    setTutorCtx(tutor);
                    setPayForNextMonthFlow(true);
                    setBookingPreferencesCtx(dummyBookingPrefs)
                    setRepayTimerCtx({
                      expiresAt:new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                      timer: 900
                    });
                    router.push('/dashboard/student/pay-for-next-month/payment');
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay for Reserved Slots
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      {/* --- End of Reserved Class Details Section --- */}

      {/* --- Conditionally Rendered Booking UI --- */}
      {(isRescheduling || reservedSlots.length === 0) && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {isRescheduling && (
            <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are in rescheduling mode. Select new time slots for the next month. Your previous selections will be overridden upon payment.
              </AlertDescription>
            </Alert>
          )}

        {/* Header with Back Button and Currency Selector */}
        <div className="flex items-center justify-end">

          <CurrencySelector />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-in slide-in-from-top-2 duration-300">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}


        {/* Monthly selection bar and summary */
        // Controls included: per-locked occurrence removal and continue-from-week
        }
        {isMonthlyClassType && (
          <Card className="animate-in slide-in-from-bottom-4 duration-500 delay-200 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Next Month Class Schedule
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your selected time slots for this month. Remove any slot by clicking the X button.
              </p>
            </CardHeader>
            <CardContent>
              {selectedMonthlyOccurrences.length === 0 ? (
                <div className="text-sm text-gray-500 py-8 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No slots selected yet. Pick time blocks from the right panel.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(() => {
                    const groups = selectedMonthlyOccurrences.reduce((m, o) => {
                      (m[o.weekKey] = m[o.weekKey] || []).push(o);
                      return m;
                    }, {} as Record<string, typeof selectedMonthlyOccurrences>);
                    
                    const ordered = Object.entries(groups)
                      .sort((a, b) => a[0].localeCompare(b[0]));
                    
                    return ordered.map(([weekKey, slots], idx) => {
                      const start = new Date(weekKey);
                      const end = new Date(start);
                      end.setDate(start.getDate() + 6);
                      const label = `${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
                      
                      return (
                        <div 
                          key={weekKey} 
                          className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-white/60 dark:bg-blue-950/10"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold shadow-md">
                                {idx + 1}
                              </span>
                              <span className="text-gray-800 dark:text-gray-100">Week {idx + 1}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {label}
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedMonthlyById(prev => {
                                  const newMap = { ...prev } as typeof prev;
                                  slots.forEach(s => { delete newMap[s.slotId]; });
                                  return newMap;
                                });
                                setSelectedOccurrenceIds(prev =>
                                  prev.filter(id => !slots.some(s => s.slotId === id))
                                );
                              }}
                              className="text-xs h-7"
                            >
                              Remove Week
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {slots
                              .sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
                              .map(s => {
                                const d = new Date(s.date);
                                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                                const timeLabel = `${new Date(`2000-01-01T${s.start}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} - ${new Date(`2000-01-01T${s.end}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
                                
                                return (
                                  <div
                                    key={s.slotId}
                                    className="group relative inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700/40 text-green-800 dark:text-green-300 hover:shadow-md transition-all"
                                  >
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="font-medium">
                                      {dayName} {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    <span className="text-gray-500 dark:text-gray-400">
                                      • {timeLabel}
                                    </span>
                                    <button
                                      className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-sm transition"
                                      onClick={() => {
                                        setSelectedMonthlyById(prev => {
                                          const newMap = { ...prev } as typeof prev;
                                          delete newMap[s.slotId];
                                          return newMap;
                                        });
                                        setSelectedOccurrenceIds(prev => prev.filter(id => id !== s.slotId));
                                      }}
                                      aria-label="Remove slot"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="animate-in slide-in-from-left-4 duration-500 delay-200 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                {isMonthlyClassType ? 'Select a weekday (recurring)' : 'Select Date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
             {isMonthlyClassType ? (
               <WeekCalendar
                 onSelect={(dates) => {
                   if (Array.isArray(dates) && dates.length > 0) {
                     setSelectedDate(dates[0]);
                   }
                 }}
                 onMonthChange={(month) => {
                   // Reset monthly selections when switching the displayed month
                   setSelectedPatterns([]);
                   setGeneratedSlots([]);
                   setWeekBreakdown([]);
                   setExcludedOccurrenceIds([]);
                   //setMonthlyTotal(0);
                   setSelectedMonthlyById({});
                   setSelectedOccurrenceIds([]);
                   setRangeSelectAll({});
                   // Move selectedDate to the first day of the new month (optional)
                   const d = new Date(month);
                   d.setDate(1);
                   setSelectedDate(d);
                 }}
                 disabled={(date) => {
                   const today = new Date();
                   today.setHours(0,0,0,0);
                   return date < today; // allow future months
                 }}
                 className="w-full border-0"
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
             ) : (
               <MonthCalendar
                 mode="single"
                 selected={selectedDate || undefined}
                 onSelect={(date) => {
                    if (date && !Array.isArray(date) && typeof date === "object" && "getTime" in date) {
                      const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // local midnight
                      setSelectedDate(normalized);
                    }
                  }}
                 disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                 className="w-full border-0"
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
             )}
            </CardContent>
          </Card>

          {/* Time Slots */}
          <Card className="animate-in slide-in-from-right-4 duration-500 delay-300 border-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Available Times
                {selectedDate && !isMonthlyClassType && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' })}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <div ref={timesListRef} className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {Array.isArray(availableSlots) && availableSlots.length > 0 ? (
                    // Check if this is monthly (grouped) or one-time (flat array)
                    isMonthlyClassType && availableSlots[0]?.slots ? (
                      // Monthly: Grouped format rendering
                      availableSlots.map((group: any) => {
                      const rangeKey = `${group.start_time}-${group.end_time}`;
                      const isSelectedRange = selectedTimeRange === rangeKey;
                      const groupChecked = !!rangeSelectAll[rangeKey];

                      const formatTime = (t: string) =>
                        new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true
                        });

                      const statusClasses = (status: string) => {
                        if (status === "AVAILABLE") {
                          return "bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300";
                        }
                        if (status === "BOOKED") {
                          return "bg-red-50 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300";
                        }
                        if (status === "LOCKED") {
                          return "bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300";
                        }
                        return "bg-gray-50 border-gray-300 text-gray-600 dark:bg-gray-800/40 dark:border-gray-600 dark:text-gray-300";
                      };

                      const availableOccurrences = (group.slots || []).filter((o: any) => o.status === "AVAILABLE");
                      const headerDisabled = availableOccurrences.length === 0;

                      return (
                        <div
                          key={rangeKey}
                          className={`rounded-xl border relative overflow-hidden transition-shadow duration-300 ${
                            isSelectedRange
                              ? "border-blue-500 ring-2 ring-blue-300/40 shadow-lg"
                              : "border-blue-200/60 hover:shadow-md"
                          } bg-white/70 dark:bg-gray-900/40 backdrop-blur-sm`}
                        >
                          <div
                            className={`flex items-center justify-between px-4 py-3 transition-colors`}
                          >
                            <div
                              className={`flex items-center gap-3 ${
                                headerDisabled ? "pointer-events-none" : "cursor-pointer"
                              }`}
                              onClick={() => {
                                if (headerDisabled) return;
                                setSelectedTimeRange(rangeKey);
                                if (!isMonthlyClassType) {
                                  if (availableOccurrences.length > 0) {
                                    const first = availableOccurrences[0];
                                    setSelectedSlotLocal({
                                      slotId: first.slot_id,
                                      startTime: group.start_time,
                                      endTime: group.end_time,
                                      status: "AVAILABLE"
                                    } as any);
                                    setSelectedOccurrenceIds([first.slot_id]);
                                  }
                                }
                              }}
                            >
                              <div className="text-sm font-semibold">
                                {formatTime(group.start_time)} – {formatTime(group.end_time)}
                              </div>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/30 dark:bg-black/30">
                                {(group.slots || []).length} dates
                              </span>
                              {availableOccurrences.length === 0 && (
                                <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                  None available
                                </span>
                              )}
                            </div>

                            {isMonthlyClassType && (
                              <div className="flex items-center gap-2">
                                <label
                                  className="flex items-center gap-2 text-xs cursor-pointer select-none"
                                  onClick={() => toggleRangeSelectAll(rangeKey, group, !groupChecked)}
                                >
                                  <div
                                    className={`h-5 w-5 flex items-center justify-center rounded border transition-colors duration-200 ${
                                      groupChecked
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "border-blue-400 bg-white"
                                    }`}
                                  >
                                    {groupChecked && (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3.5 w-3.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-7.778 7.778a1 1 0 01-1.414 0L3.293 10.95a1 1 0 111.414-1.414l3.536 3.535 7.071-7.071a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <span>Select all slots</span>
                                </label>
                              </div>
                            )}

                            {isSelectedRange && !isMonthlyClassType && (
                              <span className="text-xs font-medium">
                                {selectedSlotLocal?.slotId &&
                                selectedTimeRange === rangeKey
                                  ? "Selected"
                                  : ""}
                              </span>
                            )}
                           
                          </div>

                          <div className="p-3 flex flex-wrap gap-2">
                            {(() => {
                              const now = new Date();
                              return (group.slots || []).map((occ: any) => {
                                const status = occ.status || "AVAILABLE";
                                const chosen = selectedOccurrenceIds.includes(occ.slot_id);

                                // hide if same-day and within 2h window
                                const dateOnly = occ.date;
                                const cleanedStart = group.start_time.slice(0, 5);
                                // Monthly: hide if within 2 hours before start
                                if (shouldHideSlot(dateOnly, cleanedStart, 2)) {
                                  return null;
                                }

                                const d = new Date(occ.date);
                                const dayShort = d.toLocaleDateString(undefined, {
                                  month: "short",
                                  day: "numeric"
                                });

                                return (
                                  <div
                                    key={occ.slot_id}
                                    className={`relative flex flex-col items-center justify-center rounded-lg border px-2 py-2 min-w-[74px] text-[11px] font-medium select-none transition-all duration-200
                                      ${statusClasses(status)}
                                      ${
                                        status === "AVAILABLE" && !groupChecked
                                          ? "cursor-pointer hover:shadow-md"
                                          : status === "AVAILABLE" && groupChecked
                                          ? "cursor-not-allowed opacity-80"
                                          : "cursor-not-allowed"
                                      }
                                      ${chosen && status === "AVAILABLE" ? "border-green-500 ring-1 ring-green-400" : ""}
                                    `}
                                    onClick={() => {
                                      if (groupChecked) return;
                                      if (status !== "AVAILABLE") return;
                                      if (isMonthlyClassType) {
                                        if (selectedTimeRange !== rangeKey) setSelectedTimeRange(rangeKey);

                                        const computeWeekKey = (dateStr: string) => {
                                          const d = new Date(dateStr);
                                          const day = d.getDay();
                                          const diffToMon = (day === 0 ? -6 : 1 - day);
                                          const mon = new Date(d);
                                          mon.setDate(d.getDate() + diffToMon);
                                          mon.setHours(0,0,0,0);
                                          return mon.toISOString().slice(0,10);
                                        };

                                        const weekKey = computeWeekKey(occ.date);
                                        const exists = !!selectedMonthlyById[occ.slot_id];
                                        const tempMap = { ...selectedMonthlyById } as typeof selectedMonthlyById;

                                        if (exists) {
                                          delete tempMap[occ.slot_id];
                                        } else {
                                          // Weekly total slots limit (max 4 per calendar week)
                                          const weekSlots = Object.values(tempMap).filter(o => o.weekKey === weekKey).length;
                                          if (weekSlots >= 4) {
                                            setError('Week limit reached: maximum 4 slots in the same week.');
                                            return;
                                          }
                                          tempMap[occ.slot_id] = {
                                            slotId: occ.slot_id,
                                            date: occ.date,
                                            start: group.start_time,
                                            end: group.end_time,
                                            status: status,
                                            weekKey,
                                            availabilityId: group.availability_id
                                          };
                                        }

                                        setError('');
                                        setSelectedMonthlyById(tempMap);
                                        setSelectedOccurrenceIds(Object.keys(tempMap).map(Number));
                                      } else {
                                        setSelectedTimeRange(rangeKey);
                                        setSelectedOccurrenceIds([occ.slot_id]);
                                        setSelectedSlotLocal({
                                          slotId: occ.slot_id,
                                          startTime: group.start_time,
                                          endTime: group.end_time,
                                          status: "AVAILABLE"
                                        } as any);
                                      }
                                    }}
                                  >
                                    {chosen && status === "AVAILABLE" && (
                                      <span className="absolute top-0 left-0 right-0 h-1 bg-green-500 rounded-t-md" />
                                    )}
                                    <span>{dayShort}</span>
                                    <span
                                      className={`mt-1 text-[10px] uppercase tracking-wide ${
                                        status === "AVAILABLE"
                                          ? "text-green-600 dark:text-green-300"
                                          : status === "BOOKED"
                                          ? "text-red-600 dark:text-red-300"
                                          : status === "LOCKED"
                                          ? "text-yellow-600 dark:text-yellow-300"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {status === "AVAILABLE"
                                        ? "Available"
                                        : status === "BOOKED"
                                        ? "Booked"
                                        : status === "LOCKED"
                                        ? "Locked"
                                        : status}
                                    </span>
                                    {chosen && status === "AVAILABLE" && (
                                      <FaCheckCircle className="absolute -top-2 -right-2 h-4 w-4 text-green-600 drop-shadow" />
                                    )}
                                  </div>
                                );
                              });
                            })()}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // One-time: Flat array format rendering with improved UI
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {availableSlots.map((slot: any) => {
                        const isSelected = selectedSlotLocal?.slotId === slot.slotId;
                        const status = slot.status || "AVAILABLE";
                        
                        // One-time: hide if within 3 hours before start
                        if(isMonthlyClassType){
                          return null;
                        }
                        // if (shouldHideSlot(slot.slotDate, slot.startTime.slice(0,5), 3)) {
                        //   return null;
                        // }

                        const formatTime = (t: string) =>
                          new Date(`2000-01-01T${t}`).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                          });

                        const calculateDuration = () => {
                          const start = new Date(`2000-01-01T${slot.startTime}`);
                          const end = new Date(`2000-01-01T${slot.endTime}`);
                          return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
                        };

                        return (
                          <button
                            key={slot.slotId}
                            disabled={status !== "AVAILABLE"}
                            onClick={() => {
                              if (status === "AVAILABLE") {
                                setSelectedSlotLocal(slot);
                                setSelectedOccurrenceIds([slot.slotId]);
                              }
                            }}
                            className={`relative overflow-hidden rounded-lg border transition-all duration-200 text-left ${
                              status !== "AVAILABLE"
                                ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700"
                                : isSelected
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md ring-2 ring-blue-400/30"
                                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 hover:border-blue-300 hover:shadow-sm"
                            }`}
                          >
                            {/* Selection indicator bar */}
                            {isSelected && status === "AVAILABLE" && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
                            )}

                            <div className="p-4">
                              {/* Selection indicator */}
                              {isSelected && status === "AVAILABLE" && (
                                <div className="flex items-center justify-end mb-3">
                                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs font-medium">Selected</span>
                                  </div>
                                </div>
                              )}

                              {/* Time display */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                    </div>
                                  </div>
                                </div>

                                {/* Duration */}
                                <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                                  <Timer className="w-4 h-4" />
                                  <span>{calculateDuration()} hours</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No slots available</p>
                    <p className="text-sm">Try selecting a different date</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          </Card>
          </div>
        

        {/* Price Summary & Continue Button */}
  {/* {(isMonthlyClassType && selectedMonthlyOccurrences.length > 0) && ( */}
<Card className="animate-in slide-in-from-bottom-4 duration-500 delay-400 border-2 border-blue-200/80 dark:border-blue-800/80 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-950/30 dark:via-gray-900 dark:to-blue-950/20 shadow-lg hover:shadow-xl transition-all duration-300">
  <CardContent className="p-6">
    {error && (
      <div className="mb-4">
        <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 p-3 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
          <svg className="w-4 h-4 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <div className="text-sm">{error}</div>
        </div>
      </div>
    )}
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
      <span className="font-bold text-lg text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
        Booking Summary
      </span>
    </div>

    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Content */}
      <div className="flex-1 space-y-4">
        {isMonthlyClassType ? (
          <>
            {/* Monthly Booking Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {selectedMonthlyOccurrences.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Slots</div>
              </div>
              <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  {selectedMonthlyOccurrences.reduce((sum, o) => sum + hoursFromStartEnd(o.start, o.end), 0).toFixed(1)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Hours</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl p-4 border border-blue-200 dark:border-blue-700 text-center">
                <div className="text-lg font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {formatPrice(preferences.selectedSubject?.hourlyRate || 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Per Hour</div>
              </div>
            </div>

            {/* Payment Notice - More Visual */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">
                    Secure Your Slots
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-300">
                    Complete payment to confirm your monthly schedule
                  </div>
                </div>
              </div>
            </div>

            {/* Next Month Lock Option */}
            <div className="pt-4 border-t border-gray-200/80 dark:border-gray-700/80">
              <label className="flex items-start gap-3 text-sm cursor-pointer select-none group p-3 rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={lockNextMonth}
                    disabled={nextMonthPatternsLoading || selectedMonthlyOccurrences.length === 0}
                    onChange={(e) => setLockNextMonth(e.target.checked)}
                  />
                  <div className="w-5 h-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-md peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-disabled:opacity-50 transition-all duration-200 peer-checked:shadow-lg shadow-blue-200 dark:shadow-blue-800"></div>
                  <svg className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    Reserve Next Month's Schedule
                  </span>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    reserve <strong className="text-blue-600 dark:text-blue-400">same weekday & time patterns</strong> for next month. If you do not pay for next month at least <strong>48 hours</strong> before its first class, those future locks are automatically canceled.                  </div>
                </div>
              </label>

              {lockNextMonth && (
                <div className="mt-4 rounded-xl border-2 border-blue-200/60 dark:border-blue-700/60 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm p-4 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      📅 Next Month Preview
                    </span>
                    {nextMonthPatternsLoading && (
                      <span className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-200 animate-pulse">
                        Loading...
                      </span>
                    )}
                  </div>
                  
                  {nextMonthError && (
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                      {nextMonthError}
                    </div>
                  )}
                  
                  {!nextMonthPatternsLoading && nextMonthPreview.length === 0 && !nextMonthError && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                      No patterns available for next month
                    </div>
                  )}

                  {nextMonthPreview.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {nextMonthPreview.map(p => {
                        const timeRange = `${formatTimeCompact(p.start)}-${formatTimeCompact(p.end)}`;
                        const datesJoined = p.dateList.map(formatMonthDay).join(', ');
                        return (
                          <div
                            key={`${p.weekday}-${p.start}-${p.end}`}
                            className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/30 rounded-lg border border-blue-100/50 dark:border-blue-800/30"
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                              <span className="font-medium text-gray-800 dark:text-gray-200 text-xs">
                                {p.dayName} {timeRange}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {datesJoined}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : selectedSlotLocal ? (
          <>
            {/* Single Session Details */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {calculateSlotHours(selectedSlotLocal)}h
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Duration</div>
              </div>
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-xl p-4 border border-blue-200 dark:border-blue-700 text-center">
                <div className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {formatPrice(preferences.selectedSubject?.hourlyRate || 0)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Hourly Rate</div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Right Side - Total Amount & CTA */}
      <div className="lg:w-80 flex-shrink-0">
        {/* Already Paid Alert */}
        {alreadyPaid && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="font-semibold text-green-800 dark:text-green-200">Already Paid</div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  You have already paid for {(nextMonth ?? computedNextMonth)}/{(nextYear ?? computedNextYear)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Status Loading */}
        {paymentStatusLoading && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-600 dark:text-blue-400">Checking payment status...</span>
            </div>
          </div>
        )}

        {/* Payment Status Error */}
        {paymentStatusError && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <div className="font-semibold text-red-800 dark:text-red-200">Payment Check Failed</div>
                <div className="text-sm text-red-600 dark:text-red-400">{paymentStatusError}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/5 dark:via-purple-500/5 dark:to-pink-500/5 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50 h-full">
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">Total Amount</div>
            <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {isMonthlyClassType 
                ? formatPrice(monthlyTotal)
                : formatPrice(calculatePrice())
              }
            </div>
            
            {selectedCurrency.code !== 'LKR' && (
              <div className="text-xs text-gray-400 dark:text-gray-500 mb-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full inline-block">
                ≈ Rs. {isMonthlyClassType 
                  ? monthlyTotal.toFixed(2)
                  : calculatePrice().toFixed(2)
                } LKR
              </div>
            )}
            
            <Button 
              onClick={async () => {
                setPayForNextMonthFlow(true);
                await handleContinue();
                if (isMonthlyClassType) {
                  // Set next month slot IDs in context if lockNextMonth is enabled
                  // Note: The backend should provide slot IDs in the next month API response
                  // For now, we'll store null and the backend will handle next month booking
                  // based on the availability patterns
                  if (lockNextMonth && nextMonthPreview.length > 0) {
                    // TODO: Extract slot IDs from API response when available
                    // The API should return slot IDs for next month slots
                    console.log("Next month lock enabled with preview data:", nextMonthPreview);
                    // Backend does not yet provide next-month slot IDs; keep null for now (type number[])
                    //setNextMonthSlots(null);
                  } else {
                    //setNextMonthSlots(null);
                  }
                }
              }}
              disabled={!isValid() || isLoading || nextMonthPatternsLoading || alreadyPaid}
              size="lg"
              className={`w-full h-12 ${
                alreadyPaid 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 hover:from-blue-700 hover:via-blue-800 hover:to-purple-700'
              } text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-bold rounded-xl border-0 relative overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {isLoading || nextMonthPatternsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : alreadyPaid ? (
                "Payment Already Made"
              ) : isValid() ? (
                <>
                  Continue to Payment
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </>
              ) : (
                "Complete Selection"
              )}
            </Button>
            
            {isMonthlyClassType && (
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                {selectedMonthlyOccurrences.length} slots • {selectedMonthlyOccurrences.reduce((sum, o) => sum + hoursFromStartEnd(o.start, o.end), 0).toFixed(1)} hours
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </CardContent>
</Card>
       {/*  )} */}
      </div>
      )}
    </div>
    </div>
  );
}
// Sticky bottom bar is appended by the component's return block above; no export changes
