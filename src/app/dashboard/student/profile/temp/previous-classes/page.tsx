"use client";
import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Star, 
  User, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';

// Mock data for previous classes
const mockClasses = [
  {
    id: '1',
    tutorName: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    date: '2023-05-15',
    time: '14:00 - 16:00',
    duration: 2,
    status: 'completed',
    rating: 5,
    feedback: 'Excellent session! Sarah explained complex calculus concepts very clearly.',
    price: 60
  },
  {
    id: '2',
    tutorName: 'Prof. Michael Chen',
    subject: 'Physics',
    date: '2023-05-10',
    time: '10:00 - 12:00',
    duration: 2,
    status: 'completed',
    rating: 4,
    feedback: 'Good session, but could have spent more time on practical examples.',
    price: 70
  },
  {
    id: '3',
    tutorName: 'Dr. Emily Wilson',
    subject: 'Chemistry',
    date: '2023-05-05',
    time: '16:00 - 17:30',
    duration: 1.5,
    status: 'cancelled',
    rating: null,
    feedback: '',
    price: 45
  },
  {
    id: '4',
    tutorName: 'Dr. Robert Brown',
    subject: 'Computer Science',
    date: '2023-04-28',
    time: '18:00 - 20:00',
    duration: 2,
    status: 'completed',
    rating: 5,
    feedback: 'Robert is an amazing tutor! Helped me understand algorithms much better.',
    price: 80
  },
  {
    id: '5',
    tutorName: 'Dr. Lisa Anderson',
    subject: 'Mathematics',
    date: '2023-04-20',
    time: '09:00 - 11:00',
    duration: 2,
    status: 'completed',
    rating: 4,
    feedback: 'Very knowledgeable tutor, explained concepts well.',
    price: 60
  }
];

const PreviousClassesPage = () => {
  const { actualTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter classes based on search and filters
  const filteredClasses = mockClasses.filter(cls => {
    const matchesSearch = cls.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cls.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
    const matchesSubject = subjectFilter === 'all' || cls.subject === subjectFilter;
    return matchesSearch && matchesStatus && matchesSubject;
  });

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Pending</Badge>;
    }
  };

  const renderStars = (rating: number | null) => {
    if (rating === null) return 'Not rated yet';
    
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Previous Classes</h1>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Profile
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by tutor name or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes List */}
        <div className="space-y-4">
          {paginatedClasses.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No classes found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            paginatedClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            {cls.tutorName}
                          </h3>
                          {getStatusBadge(cls.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {cls.subject}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(cls.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cls.time} ({cls.duration} hours)
                          </span>
                          <span className="font-medium">${cls.price}</span>
                        </div>
                        {cls.rating !== null && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex">
                              {renderStars(cls.rating)}
                            </div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {cls.rating}/5
                            </span>
                          </div>
                        )}
                        {cls.feedback && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            "{cls.feedback}"
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {cls.status === 'completed' && cls.rating === null && (
                        <Button variant="outline" size="sm">
                          Rate Class
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousClassesPage;