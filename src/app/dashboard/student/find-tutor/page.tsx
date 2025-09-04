"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Search,
  Filter,
  Star,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Award,
  Globe,
  DollarSign
} from 'lucide-react';
import { tutorAPI } from '@/lib/api';
import { Tutor, FilterOptions, Subject, Language } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { TutorBookingModal } from './TutorBookingModal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

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

export const TutorSearch: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const itemsPerPage = 12;

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
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        {/* Subjects */}
        <div>
          <h4 className="font-medium mb-3">Subjects</h4>
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
                  className="text-sm cursor-pointer flex-1"
                >
                  {subject}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">
            Max Price: ${filters.maxPrice}/hour
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
          <h4 className="font-medium mb-3">
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
          <h4 className="font-medium mb-3">
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
          <h4 className="font-medium mb-3">Sort By</h4>
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
      console.log("response offfff:", response.data.content);

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

  const handleBookTutor = (tutor: Tutor) => {
    setSelectedTutor(tutor);
    setShowBookingModal(true);
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
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
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-6">
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
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Find Your Perfect Tutor</h1>
        
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by tutor name, subject, or expertise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white text-black border-0"
            />
          </div>
          {/* Desktop: toggle sidebar filters | Mobile: open sheet */}
          <div className="shrink-0">
            <div className="hidden sm:block">
              <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
            <div className="sm:hidden">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="hidden sm:block w-80 space-y-6">
            <FiltersContent />
          </div>
        )}

        {/* Results */}
        <div className="flex-1 space-y-6">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {totalResults} tutors found
            </p>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-3 sm:p-4 md:p-6 space-y-4">
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tutor Cards Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {tutors.map((tutor) => (
                <Card key={String(tutor.id)} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-3 sm:p-4 md:p-6">
                    <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                      <Avatar className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 flex-shrink-0">
                        <AvatarImage src={tutor.profileImage} />
                        <AvatarFallback className="text-xs sm:text-sm">
                          {`${tutor.firstName} ${tutor.lastName}`.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base md:text-lg truncate">
                          {tutor.firstName} {tutor.lastName}
                        </h3>
                        <div className="flex items-center space-x-1 mb-1 sm:mb-2">
                          <div className="flex">
                            {renderStars(tutor.rating)}
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-2">
                            ({tutor.rating.toFixed(1)})
                          </span>
                        </div>
                        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="truncate">{tutor.experience} years experience</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      {/* Languages */}
                      {tutor.languages && tutor.languages.length > 0 && (
                        <div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Languages:</p>
                          <div className="flex flex-wrap gap-1">
                            {tutor.languages.slice(0, 2).map((language, index) => (
                              <Badge key={`${tutor.id}-lang-${index}`} variant="outline" className="text-xs">
                                <Globe className="h-3 w-3 mr-1" />
                                <span className="truncate max-w-[80px] sm:max-w-none">
                                  {language.languageName}
                                </span>
                              </Badge>
                            ))}
                            {tutor.languages.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{tutor.languages.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Subjects with individual rates */}
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">Subjects & Rates:</p>
                        <div className="space-y-1">
                          {tutor.subjects.slice(0, 2).map((subject, index) => (
                            <div key={`${tutor.id}-subject-${index}`} className="flex items-center justify-between text-xs gap-2">
                              <Badge variant="secondary" className="text-xs truncate flex-shrink max-w-[120px] sm:max-w-[150px]">
                                {subject.subjectName}
                              </Badge>
                              <span className="text-green-600 font-medium flex items-center flex-shrink-0 text-xs sm:text-sm">
                                <DollarSign className="h-3 w-3" />
                                {subject.hourlyRate}/hr
                              </span>
                            </div>
                          ))}
                          {tutor.subjects.length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{tutor.subjects.length - 2} more subjects...
                            </div>
                          )}
                        </div>
                      </div>

                      {tutor.bio && (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2 sm:mb-3">
                          {tutor.bio}
                        </p>
                      )}

                      <div className="flex items-center justify-center text-xs sm:text-sm border-t pt-2">
                        <div className="flex items-center text-muted-foreground">
                          <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="truncate">{tutor.classCompletionRate.toFixed(0)}% completion</span>
                        </div>
                      </div>

                      <div className="flex space-x-1 sm:space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                          onClick={() => handleViewProfile(tutor)}
                        >
                          <span className="hidden sm:inline">View Profile</span>
                          <span className="sm:hidden">Profile</span>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                          onClick={() => handleBookTutor(tutor)}
                        >
                          <span className="hidden sm:inline">Book Class</span>
                          <span className="sm:hidden">Book</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && tutors.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No tutors found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && tutors.length > 0 && totalPages > 1 && renderPagination()}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTutor && (
        <TutorBookingModal
          tutor={selectedTutor}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedTutor(null);
          }}
        />
      )}
    </div>
  );
};
export default TutorSearch;
