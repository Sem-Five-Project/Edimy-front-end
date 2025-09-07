'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getTutors, 
  bulkUpdateTutors, 
  exportTutors, 
  getSubjectsList,
  type Tutor 
} from '@/lib/tutorsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  UserX, 
  UserCheck, 
  Trash2,
  Users,
  UserPlus,
  DollarSign,
  Star,
  AlertTriangle
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  useEffect(() => {
    fetchTutors();
    fetchSubjects();
  }, [searchTerm, statusFilter, subjectFilter, currentPage]);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const response = await getTutors({
        search: searchTerm,
        status: statusFilter === 'All' ? undefined : statusFilter,
        subject: subjectFilter === 'All' ? undefined : subjectFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setTutors(response.tutors);
      setTotalTutors(response.total);
    } catch (error) {
      console.error('Error fetching tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjectsList = await getSubjectsList();
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedTutors([]);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setSelectedTutors([]);
  };

  const handleSubjectFilter = (value: string) => {
    setSubjectFilter(value);
    setCurrentPage(1);
    setSelectedTutors([]);
  };

  const handleSelectTutor = (tutorId: string) => {
    setSelectedTutors(prev => 
      prev.includes(tutorId) 
        ? prev.filter(id => id !== tutorId)
        : [...prev, tutorId]
    );
  };

  const handleSelectAll = () => {
    setSelectedTutors(
      selectedTutors.length === tutors.length 
        ? [] 
        : tutors.map(tutor => tutor.id)
    );
  };

  const handleBulkAction = async (action: 'suspend' | 'activate' | 'delete') => {
    if (selectedTutors.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      await bulkUpdateTutors(selectedTutors, action);
      setSelectedTutors([]);
      fetchTutors();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const filename = await exportTutors({
        search: searchTerm,
        status: statusFilter === 'All' ? undefined : statusFilter,
        subject: subjectFilter === 'All' ? undefined : subjectFilter,
      });
      console.log('Export completed:', filename);
    } catch (error) {
      console.error('Error exporting tutors:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalPages = Math.ceil(totalTutors / ITEMS_PER_PAGE);

  const activeTutorsCount = tutors.filter(t => t.status === 'Active').length;
  const suspendedTutorsCount = tutors.filter(t => t.status === 'Suspended').length;
  const newTutorsCount = tutors.filter(t => {
    const registrationDate = new Date(t.registrationDate);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return registrationDate > thirtyDaysAgo;
  }).length;
  const avgRating = tutors.length > 0 
    ? (tutors.reduce((sum, t) => sum + t.averageRating, 0) / tutors.length).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tutors Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Tutor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTutors}</div>
            <p className="text-xs text-muted-foreground">
              {activeTutorsCount} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newTutorsCount}</div>
            <p className="text-xs text-muted-foreground">
              Recently registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suspendedTutorsCount}</div>
            <p className="text-xs text-muted-foreground">
              Suspended accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, tutor ID, or subject..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={handleSubjectFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedTutors.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
              <span className="text-sm font-medium">
                {selectedTutors.length} tutor(s) selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserX className="w-4 h-4 mr-1" />
                    Suspend
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Suspend Tutors</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to suspend {selectedTutors.length} tutor(s)?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleBulkAction('suspend')}
                      disabled={isBulkActionLoading}
                    >
                      {isBulkActionLoading ? 'Processing...' : 'Suspend'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <UserCheck className="w-4 h-4 mr-1" />
                    Activate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Activate Tutors</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to activate {selectedTutors.length} tutor(s)?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleBulkAction('activate')}
                      disabled={isBulkActionLoading}
                    >
                      {isBulkActionLoading ? 'Processing...' : 'Activate'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Tutors</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {selectedTutors.length} tutor(s)? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleBulkAction('delete')}
                      disabled={isBulkActionLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isBulkActionLoading ? 'Processing...' : 'Delete'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutors Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading tutors...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={selectedTutors.length === tutors.length && tutors.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left font-medium">Tutor</th>
                    <th className="p-4 text-left font-medium">Subjects & Rates</th>
                    <th className="p-4 text-left font-medium">Performance</th>
                    <th className="p-4 text-left font-medium">Status</th>
                    <th className="p-4 text-left font-medium">Last Login</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((tutor) => (
                    <tr key={tutor.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedTutors.includes(tutor.id)}
                          onCheckedChange={() => handleSelectTutor(tutor.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={tutor.profilePicture} />
                            <AvatarFallback>
                              {tutor.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{tutor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {tutor.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {tutor.tutorId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {tutor.subjects.slice(0, 2).map((subject, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{subject.subject}</span>
                              <span className="text-muted-foreground"> - ${subject.hourlyRate}/hr</span>
                            </div>
                          ))}
                          {tutor.subjects.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{tutor.subjects.length - 2} more
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{tutor.averageRating.toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({tutor.totalReviews})</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tutor.totalSessions} sessions
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${tutor.totalEarnings.toFixed(2)} earned
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-2">
                          <Badge 
                            className={getStatusBadgeColor(tutor.status)}
                          >
                            {tutor.status}
                          </Badge>
                
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {tutor.lastLogin ? (
                            <>
                              {new Date(tutor.lastLogin).toLocaleDateString()}
                              <div className="text-muted-foreground">
                                {new Date(tutor.lastLogin).toLocaleTimeString()}
                              </div>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border border-border shadow-md">
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/users/tutors/${tutor.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/admin/users/tutors/${tutor.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            {tutor.status === 'Active' ? (
                              <DropdownMenuItem className="text-red-600">
                                <UserX className="w-4 h-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : tutor.status === 'Suspended' ? (
                              <DropdownMenuItem className="text-green-600">
                                <UserCheck className="w-4 h-4 mr-2" />
                                Reactivate
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, totalTutors)} of {totalTutors} tutors
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
