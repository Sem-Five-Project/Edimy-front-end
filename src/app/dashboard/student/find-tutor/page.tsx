"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { tutorAPI } from '@/lib/api';
import { Tutor, FilterOptions, Subject, Language } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { useBooking } from '@/contexts/BookingContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { CurrencySelector } from '@/components/ui/currency-selector';

// Import the responsive TutorCard components
import { ResponsiveTutorCard } from '@/components/ui/tutorcard'; // Adjust path as needed

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Psychology',
];

const SORT_OPTIONS = [
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price', label: 'Price: Low to High' },
  { value: 'experience', label: 'Most Experienced' },
  { value: 'completion_rate', label: 'Best Completion Rate' },
];

// ==================== HORIZONTAL LOADING SKELETON ====================
const TutorCardSkeleton = () => {
  return (
    <>
      {/* Desktop/Tablet Horizontal Skeleton */}
      <div className="hidden sm:block">
        <Card className="border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 animate-pulse">
          <CardContent className="p-0">
            <div className="flex">
              {/* Left section - Profile */}
              <div className="flex-shrink-0 p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Skeleton className="h-16 w-16 lg:h-20 lg:w-20 rounded-full" />
                    <Skeleton className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <div className="flex space-x-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-3 w-3 rounded-sm" />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <Skeleton className="h-12 rounded-lg" />
                    <Skeleton className="h-12 rounded-lg" />
                  </div>
                </div>
              </div>

              {/* Right section - Details */}
              <div className="flex-1 p-4 border-l border-slate-100 dark:border-slate-700/50">
                <div className="h-full flex flex-col">
                  <div className="mb-3">
                    <Skeleton className="h-3 w-16 mb-1" />
                    <div className="flex space-x-1">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                  
                  <div className="flex-1 mb-3">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <div className="space-y-2">
                      <Skeleton className="h-8 rounded-lg" />
                      <Skeleton className="h-8 rounded-lg" />
                    </div>
                  </div>
                  
                  <div className="mb-3 flex-1">
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Skeleton className="flex-1 h-9 rounded-md" />
                    <Skeleton className="flex-1 h-9 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Vertical Skeleton */}
      <div className="block sm:hidden">
        <Card className="border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700 animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 mb-3">
              <div className="relative">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <div className="flex space-x-1 mb-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-3 w-3 rounded-sm" />
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            
            <div className="flex space-x-2">
              <Skeleton className="flex-1 h-8 rounded-md" />
              <Skeleton className="flex-1 h-8 rounded-md" />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export const TutorSearch: React.FC = () => {
  const { formatPrice, convertPrice, selectedCurrency } = useCurrency();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 8; // Reduced for better layout with horizontal cards

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    subjects: [],
    minRating: 0,
    maxPrice: 200,
    experience: 0,
    sortBy: 'rating',
    sortOrder: 'desc',
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const debouncedFilters = useDebounce(filters, 500);

  const FiltersContent: React.FC = () => (
    <Card className="border-0 shadow-sm bg-white dark:bg-slate-800">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        {/* Subjects */}
        <div>
          <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">Subjects</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {SUBJECTS.map((subject) => (
              <div key={subject} className="flex items-center space-x-2">
                <Checkbox
                  id={subject}
                  checked={filters.subjects?.includes(subject)}
                  onCheckedChange={(checked) =>
                    handleSubjectChange(subject, checked as boolean)
                  }
                />
                <label
                  htmlFor={subject}
                  className="text-sm cursor-pointer flex-1 text-slate-700 dark:text-slate-300"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
            Max Price: {formatPrice(filters.maxPrice || 200)}/hour
          </h4>
          <Slider
            value={[filters.maxPrice || 200]}
            onValueChange={([value]) =>
              setFilters(prev => ({ ...prev, maxPrice: value }))
            }
            max={200}
            min={10}
            step={10}
            className="w-full"
          />
        </div>

        {/* Minimum Rating */}
        <div>
          <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
            Minimum Rating: {filters.minRating || 0}+
          </h4>
          <Slider
            value={[filters.minRating || 0]}
            onValueChange={([value]) =>
              setFilters(prev => ({ ...prev, minRating: value }))
            }
            max={5}
            min={0}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Experience */}
        <div>
          <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">
            Minimum Experience: {filters.experience || 0}+ years
          </h4>
          <Slider
            value={[filters.experience || 0]}
            onValueChange={([value]) =>
              setFilters(prev => ({ ...prev, experience: value }))
            }
            max={20}
            min={0}
            step={1}
            className="w-full"
          />
        </div>

        {/* Sort By */}
        <div>
          <h4 className="font-medium mb-3 text-slate-900 dark:text-slate-100">Sort By</h4>
          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters(prev => ({ ...prev, sortBy: value as FilterOptions['sortBy'] }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );

  const searchTutors = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const searchFilters = {
        ...debouncedFilters,
        search: debouncedSearchTerm,
      };

      const response = await tutorAPI.searchTutors(searchFilters, page, itemsPerPage);
      console.log("response of search tutors in component:", response);
      
      if (response.success) {
        // Use the correct property names from API response
        setTutors(response.data.content || []);
        // Pagination
        setTotalPages(response.data.totalPages || 1);
        setTotalResults(response.data.totalElements || 0);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, debouncedFilters, itemsPerPage]);

  useEffect(() => {
    searchTutors(1);
    setCurrentPage(1);
  }, [searchTutors]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    searchTutors(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubjectChange = (subject: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      subjects: checked 
        ? [...(prev.subjects || []), subject]
        : (prev.subjects || []).filter(s => s !== subject),
    }));
  };

  const { setTutor, setCurrentStep, proceedToStep } = useBooking();

  const handleBookTutor = (tutor: Tutor) => {
    setTutor(tutor);
    proceedToStep('slot-selection');
  };

  const handleViewProfile = (tutor: Tutor) => {
    console.log('View profile:', tutor.id);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      subjects: [],
      minRating: 0,
      maxPrice: 200,
      experience: 0,
      sortBy: 'rating',
      sortOrder: 'desc',
    });
    setSearchTerm('');
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Find Your Perfect Tutor</h1>
              <p className="text-blue-100 mt-2">Connect with experienced educators</p>
            </div>
            <CurrencySelector compact className="bg-white/10 backdrop-blur-sm rounded-lg" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by tutor name, subject, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-white text-black border-0 rounded-lg shadow-sm text-base lg:text-lg"
              />
            </div>
            
            {/* Desktop Filters */}
            <div className="hidden sm:block">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 bg-white/10 hover:bg-white/20 border-white/20"
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </div>

            {/* Mobile Filters */}
            <div className="sm:hidden">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="lg" className="w-full h-12">
                    <Filter className="h-5 w-5 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex gap-6 lg:gap-8">
          {/* Filters Sidebar - Desktop */}
          {showFilters && (
            <div className="hidden sm:block w-72 lg:w-80 shrink-0">
              <div className="sticky top-8">
                <FiltersContent />
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <p className="text-slate-600 dark:text-slate-400 text-sm lg:text-base">
                {isLoading ? 'Searching...' : `${totalResults} tutors found`}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {!isLoading && `Page ${currentPage} of ${totalPages}`}
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-4 sm:space-y-6">
                {Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <TutorCardSkeleton key={idx} />
                ))}
              </div>
            )}

            {/* Tutor Cards - Changed from grid to vertical stack */}
            {!isLoading && (
              <div className="space-y-4 sm:space-y-6">
                {tutors.map((tutor) => (
                  <ResponsiveTutorCard
                    key={String(tutor.id)}
                    tutor={tutor}
                    onViewProfile={handleViewProfile}
                    onBookClass={handleBookTutor}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && tutors.length === 0 && (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-6" />
                <h3 className="text-xl font-medium text-slate-900 dark:text-slate-100 mb-2">No tutors found</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
                  Try adjusting your search criteria or filters to find more tutors
                </p>
                <Button onClick={clearFilters} className="bg-blue-600 hover:bg-blue-700">
                  Clear Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {!isLoading && tutors.length > 0 && totalPages > 1 && renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorSearch;