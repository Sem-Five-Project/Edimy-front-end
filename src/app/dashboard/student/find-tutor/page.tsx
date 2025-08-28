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
  Award
} from 'lucide-react';
import { tutorAPI } from '@/lib/api';
import { Tutor, FilterOptions } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
import { TutorBookingModal } from './TutorBookingModal';

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

  const searchTutors = useCallback(async (page: number = 1) => {
    setIsLoading(true);
    try {
      const searchFilters = {
        ...debouncedFilters,
        search: debouncedSearchTerm,
      };

      const response = await tutorAPI.searchTutors(searchFilters, page, itemsPerPage);
      console.log("searchTutors response:", response);
      if (response.success) {
        setTutors(response.data.tutors);
        setTotalPages(response.data.totalPages);
        setTotalResults(response.data.total);
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
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        {showFilters && (
          <div className="w-80 space-y-6">
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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          {/* Tutor Cards Grid */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutors.map((tutor) => (
                <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={tutor.profileImage} />
                        <AvatarFallback>
                          {`${tutor.firstName} ${tutor.lastName}`.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{tutor.firstName} {tutor.lastName}</h3>
                        <div className="flex items-center space-x-1 mb-2">
                          {renderStars(tutor.rating)}
                          <span className="text-sm text-muted-foreground ml-2">
                            ({tutor.rating.toFixed(1)})
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {tutor.experience} years experience
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Subjects:</p>
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{tutor.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <Award className="h-4 w-4 mr-1" />
                          {tutor.classCompletionRate.toFixed(0)}% completion
                        </div>
                        <div className="font-semibold text-lg">
                          ${tutor.hourlyRate}/hr
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {tutor.bio}
                      </p>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewProfile(tutor)}
                        >
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleBookTutor(tutor)}
                        >
                          Book Class
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
