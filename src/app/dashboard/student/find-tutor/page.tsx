"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ExtendedFilterOptions,NormalizedTutor,SessionPayload,RecurringPayload, Subject, Language } from '@/types/index';

import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {filterAPI} from '@/lib/api';
import { ResponsiveTutorCard } from '@/components/ui/tutorcard'; // Adjust path as needed
import { useCurrency } from '@/contexts/CurrencyContext';
import { useBooking } from '@/contexts/BookingContext';
import { useAuth } from '@/contexts/AuthContext';

// Import your modular components
import BasicFiltersComponent from './BasicFiltersComponent';
import AdvancedFiltersComponent from './AdvancedFiltersComponent';
import tr from '@mobiscroll/react/dist/src/i18n/tr.js';



// Interfaces (moved outside mock API literal)



const TutorCardSkeleton = () => (
  <Card className="border-0 bg-white ring-1 ring-gray-200 animate-pulse">
    <CardContent className="p-0">
      <div className="flex">
        <div className="flex-shrink-0 p-6">
          <div className="flex flex-col items-center text-center">
            <Skeleton className="h-20 w-20 rounded-full mb-2" />
            <Skeleton className="h-4 w-20 mb-2" />
            <div className="flex space-x-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-3 rounded-sm" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              <Skeleton className="h-10 rounded-lg" />
              <Skeleton className="h-10 rounded-lg" />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 border-l border-gray-100">
          <div className="h-full flex flex-col">
            <div className="mb-3">
              <Skeleton className="h-3 w-16 mb-1" />
              <div className="flex space-x-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            
            <div className="flex-1 mb-3">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </div>
            
            <div className="flex space-x-2 mb-3">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Main Tutor Search Component
const MainTutorSearchComponent: React.FC = () => {
  const router = useRouter();
  const { setTutor } = useBooking();
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tutors, setTutors] = useState<NormalizedTutor[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 8;

  // Filter state
const [filters, setFilters] = useState<ExtendedFilterOptions>({
  educationLevel: null,
  stream: null,
  subjects: [],
  classType: null,
  selectedDate: null,
  selectedWeekdays: [],
  timePeriods: {},
  tempTimeSelection: {},   //new
  addingNewSlot: false,    //new
  minRating: 0,
  maxPrice: 2000,
  minExperience: 0,
  sortBy: 'rating',
  sortOrder: 'desc',
  currentMonth: new Date(),
});

  const [appliedFilters, setAppliedFilters] = useState<ExtendedFilterOptions>(filters);
  const [hasUserAppliedFilters, setHasUserAppliedFilters] = useState(false);

  // Filter change handler
  const handleFilterChange = useCallback((key: string, value: any) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // Handle dependent filter resets
      if (key === 'educationLevel') {
        newFilters.stream = null;
        newFilters.subjects = [];
      }
      if (key === 'stream') {
        newFilters.subjects = [];
      }
      if (key === 'classType') {
        newFilters.selectedDate = null;
        newFilters.selectedWeekdays = [];
        newFilters.timePeriods = {};
      }
      
      return newFilters;
    });
  }, []);
const DEFAULT_LIMIT = 10;
const { user, loadStudentAcademicInfo } = useAuth();

const buildEffectiveFilters = useCallback((): ExtendedFilterOptions => {
  if (user?.role === 'STUDENT' && user.educationLevel && user.stream) {
    const mappedEdu = mapEducationLevel(filters.educationLevel);
    const mappedStream = mapStream(filters.stream);
    return {
      ...filters,
      educationLevel: mappedEdu,
      stream: mappedStream
    };
  }
  return filters;
}, [filters, user?.role, user?.educationLevel, user?.stream]);
const searchTutors = useCallback(async (
  page: number = 1,
  activeFilters?: ExtendedFilterOptions,
  activeSearch?: string,
  limitOverride?: number
) => {
  console.log('Starting tutor search with original tutor function:', page);
  setIsLoading(true);
  try {
    const baseFilters = activeFilters ?? appliedFilters;
    const effectiveFilters =
      activeFilters
        ? activeFilters
        : buildEffectiveFilters(); // ensure academic mapping reflected

    const effectiveSearch = activeSearch ?? appliedSearchTerm;

    const convertedTimePeriods: { [weekday: number]: string[] } = {};
    if (effectiveFilters.timePeriods) {
      Object.entries(effectiveFilters.timePeriods).forEach(([weekday, periods]) => {
        if (Array.isArray(periods)) {
          convertedTimePeriods[+weekday] = periods.map(
            p =>
              `${p.startHour.toString().padStart(2,'0')}:${p.startMinute.toString().padStart(2,'0')}-` +
              `${p.endHour.toString().padStart(2,'0')}:${p.endMinute.toString().padStart(2,'0')}`
          );
        }
      });
    }
  const edu = mapEducationLevel(filters.educationLevel);
  const str = mapStream(filters.stream);

  // Update filters (without depending on filters in deps)
  setFilters(prev => ({ ...prev, educationLevel: edu, stream: str }));

  const payload = buildBackendPayload(
    { ...filters, educationLevel: edu, stream: str },
    searchTerm
  );
    const searchFilters = {
      ...effectiveFilters,
      search: effectiveSearch,
      selectedDate: effectiveFilters.selectedDate?.toISOString().split('T')[0],
      timePeriods: convertedTimePeriods
    };

    console.log('Search filters being sent payload:', payload);

    const response = await filterAPI.searchTutors(
      payload,
      page,
      limitOverride || itemsPerPage
    );

    console.log('Raw tutor search response:', response);

    if (response.success) {
      const rawList =
        response.data?.content ??
  // response.data?.tutors ?? (legacy shape)
        (Array.isArray(response.data) ? response.data : []);

      const normalized = rawList.map((t: any) => adaptTutor(t));
      setTutors(normalized);
      setTotalPages(response.data?.totalPages || 1);
      setTotalResults(
        response.data?.totalElements ??
        normalized.length
      );
    } else {
      setTutors([]);
      setTotalPages(1);
      setTotalResults(0);
    }
  } catch (e) {
    console.error('Search failed:', e);
    setTutors([]);
  } finally {
    setIsLoading(false);
  }
}, [
  appliedFilters,
  appliedSearchTerm,
  itemsPerPage,
  buildEffectiveFilters
]);

const mapEducationLevel = (val: string | null | undefined): string | null => {
  if (!val) return null;
  switch (val) {
    case 'grade-1-5': return 'PRIMARY/GRADE 1-5';
    case 'grade-6-11': return 'SECONDARY/GRADE 6-11';
    case 'ordinary-level': return 'HIGHSCHOOL/ADVANCED_LEVEL'; // adjust if different
    case 'advanced-level': return 'HIGHSCHOOL/ADVANCED_LEVEL';
    case 'undergraduate': return 'UNDERGRADUATE';
    case 'postgraduate': return 'POSTGRADUATE';
    case 'doctorate': return 'DOCTORATE';
    default: return val.toUpperCase();
  }
};

const mapStream = (val: string | null | undefined): string | null => {
  if (!val) return null;
  switch (val.toLowerCase()) {
    case 'mathematics': return 'MATHS';
    case 'biology': return 'BIO';
    case 'technology': return 'TECHNOLOGY';
    case 'commerce': return 'COMMERSE';
    case 'arts': return 'ARTS';
    case 'agri': return 'AGRI';
    case 'ict': return 'ICT';
    default: return val.toUpperCase();
  }
};
const getDatesForWeekdayInMonth = (monthDate: Date, weekday: number): string[] => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth(); // 0-based
  const lastDay = new Date(year, month + 1, 0).getDate();
  const out: string[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dt = new Date(year, month, d);
    if (dt.getDay() === weekday) {
      out.push(`${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`);
    }
  }
  return out;
};

const buildBackendPayload = useCallback(
  (f: ExtendedFilterOptions, searchValue: string) => {
    const classType =
      f.classType === 'one-time'
        ? 'ONE_TIME'
        : f.classType === 'monthly-recurring'
        ? 'MONTHLY'
        : null;

    let session: SessionPayload | null = null;
    let recurring: RecurringPayload | null = null;

    if (classType === 'ONE_TIME') {
      // One-time uses weekday index 0 (stored in timePeriods[0])
      const dayRange = f.timePeriods[0];
      session = {
        date: f.selectedDate ? f.selectedDate.toISOString().split('T')[0] : null,
        startTime: dayRange ? dayRange.startTime : null,
        endTime: dayRange ? dayRange.endTime : null
      };
    } else if (classType === 'MONTHLY') {
      const monthRef = f.currentMonth || new Date();
      const days = f.selectedWeekdays
        .map(weekday => {
          const range = f.timePeriods[weekday];
            if (!range) return null;
            if (!range.startTime || !range.endTime) return null;
            // Basic validation: start < end
            if (range.endTime <= range.startTime) return null;
            const dates = getDatesForWeekdayInMonth(monthRef, weekday);
            return {
              weekday,
              dates,
              slots: [{ startTime: range.startTime, endTime: range.endTime }]
            };
        })
        .filter(Boolean) as RecurringPayload['days'];

      recurring = { days };
    }

    const sortFieldMap: Record<string, string> = {
      rating: 'RATING',
      price: 'PRICE',
      experience: 'EXPERIENCE'
    };
    const sortField = sortFieldMap[f.sortBy] || 'PRICE';

    return {
      educationLevel: f.educationLevel ?? null,
      stream: f.stream ?? null,
      subjects: f.subjects ?? [],
      classType,
      maxPrice: typeof f.maxPrice === 'number' ? f.maxPrice : null,
      rating: f.minRating > 0 ? f.minRating : null,
      experience: f.minExperience > 0 ? f.minExperience : null,
      sort: {
        field: sortField,
        direction: (f.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
      },
      search: searchValue || null,
      session,
      recurring
    };
  },
  []
);
// Helper to format hours/minutes into HH:MM


// Simple stable hash for generating deterministic IDs from names (kept in 32-bit space)
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0; // unsigned 32-bit
  }
  return hash; // already a non-negative int
};

const adaptTutor = (t: any): NormalizedTutor => {
    const tutorId = t.tutorId ?? t.id ?? t.tutorProfileId ?? Math.floor(Math.random() * 1_000_000);
  const first = t.firstName ?? t.first_name ?? '';
  const last = t.lastName ?? t.last_name ?? '';
  const name = (first || last) ? [first, last].filter(Boolean).join(' ') : (t.name || `Tutor ${tutorId}`);

  // Subjects may arrive as:
  //  - string[]
  //  - [{ name/hourly_rate }, { subjectName, hourlyRate } ...]
  //  - mixed
  let subjects: Subject[] = [];
  if (Array.isArray(t.subjects)) {
    subjects = t.subjects.map((s: any, index: number) => {
      if (typeof s === 'string') {
        const subjName = s.trim();
        return {
          subjectId: hashString(subjName) || index, // fallback to index if hash 0
          subjectName: subjName,
          hourlyRate: t.hourlyRate ?? t.hourly_rate ?? 0
        } as Subject;
      }
      const subjName = s.name || s.subjectName || s.subject || 'Unknown';
      const subjId = s.subjectId ?? hashString(subjName);
      return {
        subjectId: subjId,
        subjectName: subjName,
        hourlyRate: s.hourly_rate ?? s.hourlyRate ?? t.hourlyRate ?? t.hourly_rate ?? 0
      } as Subject;
    });
  }

  // Languages may arrive as string[] or objects
  let languages: Language[] = [];
  if (Array.isArray(t.languages)) {
    languages = t.languages.map((l: any, index: number) => {
      if (typeof l === 'string') {
        const langName = l.trim();
        return {
          languageId: hashString(langName + ':' + index),
          languageName: langName
        } as Language;
      }
      const langName = l.name || l.languageName || 'Unknown';
      const langId = l.languageId ?? hashString(langName + ':' + index);
      return {
        languageId: langId,
        languageName: langName
      } as Language;
    });
  }

  // Choose representative hourly rate (first subject if available, else tutor-level)
  const primaryRate = subjects[0]?.hourlyRate ?? t.hourlyRate ?? t.hourly_rate ?? 0;

  return {
    id: tutorId,
    name,
    bio: t.bio ?? t.description ?? 'No bio provided.',
    rating: Number(t.rating ?? t.averageRating ?? 0),
    experienceMonths: Number(t.experienceMonths ?? t.experience_months ?? t.experience ?? 0),
    subjects,
    hourlyRate: primaryRate,
    languages,
    raw: t,
  } as any; // cast to NormalizedTutor (raw retained for debugging)
};

// User explicitly applies filters
const applyFiltersAndSearch = useCallback(async () => {
  setHasUserAppliedFilters(true);
  const effective = buildEffectiveFilters();
  setAppliedFilters(effective);
  setAppliedSearchTerm(searchTerm);
  setCurrentPage(1);
  await searchTutors(1, effective, searchTerm);
  setIsFilterOpen(false);
}, [buildEffectiveFilters, searchTerm]);
const initialAcademicSearchRef = useRef(false);
const [requirementsLoaded, setRequirementsLoaded] = useState(false);
const [educationLevel, setEducationLevel] = useState("");
const [stream, setStream] = useState("");
// useEffect(() => {
//   let cancelled = false;
//   (async () => {
//     try {
//           loadStudentAcademicInfo();

//       const res = await api.get('/educational-requirements');
//       if (cancelled) return;
//       setEducationLevel(res.data?.educationLevel ?? null);
//       setStream(res.data?.stream ?? null);
//     } catch (e) {
//       console.error('Failed to load requirements', e);
//     } finally {
//       if (!cancelled) setRequirementsLoaded(true);
//     }
//   })();
//   return () => { cancelled = true; };
// }, []);

// Run search after requirements loaded (even if both null)
useEffect(() => {
  if (!requirementsLoaded) return;
  searchTutors();
}, [requirementsLoaded, educationLevel, stream,user?.role]);


// useEffect(() => {
//     let cancelled = false;
//     console.log('Effect to load student academic info triggered');
//     console.log("user educationLevel:", user?.educationLevel, "user stream:", user?.stream,"user :",user);
// (async () => {
  
// try{
// if (!user || user.role !== 'STUDENT') return;
//   //if (initialAcademicSearchRef.current) return;

//   if (user?.educationLevel === undefined || user?.stream === undefined) {
//     // load then wait for next render
//     console.log("heree")
//     loadStudentAcademicInfo();
//     return;
//   }
//   //initialAcademicSearchRef.current = true;
//   setEducationLevel(user.educationLevel);
//   setStream(user.stream);
//   const edu = mapEducationLevel(user.educationLevel);
//   const str = mapStream(user.stream);

//   // Update filters (without depending on filters in deps)
//   setFilters(prev => ({ ...prev, educationLevel: edu, stream: str }));

//   const payload = buildBackendPayload(
//     { ...filters, educationLevel: edu, stream: str },
//     searchTerm
//   );
//   console.log('Running initial academic-based tutor search payload (one-shot):', payload);
//   setIsLoading(true);
//   filterAPI.searchTutors(payload, 1, 10)
//     .then(res => {
//       if (res.success) {
//         const raw = res.data.content || [];
//         const normalized = raw.map((t: any) => adaptTutor(t));
//         setTutors(normalized);
//         setTotalPages(res.data.totalPages || 1);
//         setTotalResults(res.data.totalElements || (res.data.content?.length || 0));
//       }
//     })
//     .finally(() => setIsLoading(false));
// }catch(e){
// console.error('Failed to load requirements', e);
// }finally{
// if(!cancelled)setRequirementsLoaded(true);
// }
// })
  
// }, []);

useEffect(() => {
  // Use a flag to prevent state updates after the component has unmounted.
  let isMounted = true;

  const fetchTutorsBasedOnAcademicInfo = async () => {
    // Guard clause: Don't run if there's no user, the user is not a student,
    // or if the necessary academic info isn't available yet.
    if (!user || user.role !== 'STUDENT' || user.educationLevel === undefined || user.stream === undefined) {
      // If the info is missing, it implies another effect or process is loading it.
      // We'll wait for the next render when `user` is updated.
      return;
    }

    try {
      console.log('Running initial academic-based tutor search...');
      if (isMounted) {
        setIsLoading(true);
      }
      
      // Map the user's academic info to the required format
      const edu = mapEducationLevel(user.educationLevel);
      const str = mapStream(user.stream);
      
      // Update local state and filters
      if (isMounted) {
        setEducationLevel(user.educationLevel);
        setStream(user.stream);
        setFilters(prev => ({ ...prev, educationLevel: edu, stream: str }));
      }

      // Build the payload with the fresh filter values
      const payload = buildBackendPayload(
        { ...filters, educationLevel: edu, stream: str },
        searchTerm
      );
      
      console.log('Payload for initial search:', payload);
      const res = await filterAPI.searchTutors(payload, 1, 10);

      if (isMounted && res.success) {
        const rawTutors = res.data.content || [];
        const normalizedTutors = rawTutors.map((t) => adaptTutor(t));
        
        setTutors(normalizedTutors);
        setTotalPages(res.data.totalPages || 1);
        setTotalResults(res.data.totalElements || 0);
      }
    } catch (e) {
      console.error('Failed to perform initial tutor search:', e);
      // Optionally set an error state here
    } finally {
      if (isMounted) {
        setIsLoading(false);
        setRequirementsLoaded(true);
      }
    }
  };
  
  // This separate check handles the case where the student's academic info
  // needs to be fetched first.
  if (user && user.role === 'STUDENT' && (user.educationLevel === undefined || user.stream === undefined)) {
    console.log("user :",user);
    console.log("User academic info is missing, triggering load.");
    loadStudentAcademicInfo();
  }

  fetchTutorsBasedOnAcademicInfo();

  // The cleanup function will run when the component unmounts
  // or when the effect re-runs (due to dependency changes).
  return () => {
    isMounted = false;
  };
  
// --- DEPENDENCY ARRAY ---
// This effect should re-run whenever the `user` object changes.
// `loadStudentAcademicInfo` should be included if it's not a stable function
// (i.e., not wrapped in `useCallback` in its parent component).
}, [user, loadStudentAcademicInfo]); // FIX: Added dependencies

  const clearFilters = () => {
    const resetFilters = {
      educationLevel: null,
      stream: null,
      subjects: [],
      classType: null,
      selectedDate: null,
      selectedWeekdays: [],
      timePeriods: {},
      minRating: 0,
      maxPrice: 2000,
      minExperience: 0,
      sortBy: 'rating',
      sortOrder: 'desc' as 'desc',
      currentMonth: new Date(),
      tempTimeSelection: {},
      addingNewSlot: false,
    };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearchTerm('');
    setAppliedSearchTerm('');
  };
const handleViewProfile = (tutor: NormalizedTutor) => {
  console.log('View profile clicked:', tutor);
  router.push(`/dashboard/student/tutors/${tutor.id}`);
};

const handleBookTutor = (tutor: NormalizedTutor) => {
  setTutor(tutor as any); // Set the full tutor object in the context
  router.push('/dashboard/student/find-tutor/book/slots');
};
  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchTutors(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className={i === currentPage ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };




  return (
    <div className="bg-gray-50">
      {/* Header with Search and Filters */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
 
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  z-50">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-4xl font-bold mb-4">Find Your Perfect Tutor</h1>
            <p className="text-xl text-blue-100">Connect with experienced educators tailored to your needs</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by tutor name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    applyFiltersAndSearch();
                  }
                }}
                className="pl-12 h-14 bg-white/95 backdrop-blur-sm text-gray-900 border-0 rounded-xl shadow-lg text-lg focus:ring-4 focus:ring-blue-300"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="h-14 px-4 sm:px-8 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm rounded-xl font-semibold transition-all"
              >
                <Filter className="h-5 w-5 mr-2" />
                {isFilterOpen ? 'Hide Filters' : 'Filters'}
              </Button>
            <Button 
                  onClick={() => {
                    applyFiltersAndSearch();
                  }}
                className="h-14 px-4 sm:px-8 bg-green-500 hover:bg-green-600 rounded-xl font-semibold shadow-lg transition-all"
              >
                Apply Search
              </Button>
            </div>
          </div>

          {/* Filter Panel - Integrated into the blue header */}
          <div className={`border-t border-white/20 transition-all duration-500 ease-in-out overflow-hidden ${
            isFilterOpen ? 'max-h-[3000px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'
          }`}>
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    Clear All
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsFilterOpen(false)}
                    className="hover:bg-white/10 text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                {/* Basic and Advanced Filters Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Filters */}
                  <div className="space-y-4">
                    <BasicFiltersComponent 
                      filters={filters} 
                      onFilterChange={handleFilterChange} 
                    />
                  </div>

                  {/* Advanced Filters */}
                  <div className="space-y-4">
                    <AdvancedFiltersComponent 
                      filters={filters} 
                      onFilterChange={handleFilterChange} 
                    />
                  </div>
                </div>

                {/* Date & Time Selector - Full width at the bottom */}

              </div>
            </div>
          </div>

          {/* Applied filters summary */}
          {(appliedFilters.educationLevel || appliedFilters.subjects.length > 0 || appliedFilters.classType) && (
            <div className="max-w-4xl mx-auto pb-6">
              <div className="flex flex-wrap gap-2">
                {appliedFilters.educationLevel && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {appliedFilters.educationLevel}
                  </Badge>
                )}
                {appliedFilters.classType && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    {appliedFilters.classType === 'one-time' ? 'One-time' : 'Monthly'}
                  </Badge>
                )}
                {appliedFilters.subjects.map(subject => (
                  <Badge key={subject} className="bg-white/20 text-white border-white/30">
                    {subject}
                  </Badge>
                ))}
                {appliedFilters.minRating > 0 && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    Rating: {appliedFilters.minRating}+
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
            
      {/* Main Content - Tutor Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isLoading ? 'Searching...' : `${totalResults} tutors found`}
            </h2>
            <p className="text-gray-600 mt-1">
              {!isLoading && totalPages > 1 && `Page ${currentPage} of ${totalPages}`}
            </p>
          </div>
          
         
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {Array.from({ length: itemsPerPage }).map((_, idx) => (
              <TutorCardSkeleton key={idx} />
            ))}
          </div>
        )}

        {/* Tutor Cards */}
        {!isLoading && (
          <div className="space-y-6">
            {tutors.map(tutor => (
              <ResponsiveTutorCard
                  key={String(tutor.id)}
                  tutor={tutor}
                  onViewProfile={handleViewProfile}
                  onBookClass={handleBookTutor}
                />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tutors.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">No tutors found</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              Try adjusting your search criteria or filters to find more tutors that match your needs.
            </p>
            <Button onClick={clearFilters} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && tutors.length > 0 && totalPages > 1 && renderPagination()}
      </div>
      
    </div>
  );
};

export default MainTutorSearchComponent;