'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getPendingTutors, 
  bulkApproveTutors, 
  bulkRejectTutors,
  getSubjectsFromPendingApplications,
  type PendingTutor 
} from '@/lib/pendingTutorsData';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  UserPlus,
  FileText,
  Calendar,
  DollarSign
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function PendingApprovalsPage() {
  const [pendingTutors, setPendingTutors] = useState<PendingTutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTutors, setTotalTutors] = useState(0);
  const [selectedTutors, setSelectedTutors] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  useEffect(() => {
    fetchPendingTutors();
    fetchSubjects();
  }, [searchTerm, subjectFilter, currentPage]);

  const fetchPendingTutors = async () => {
    setLoading(true);
    try {
      const response = await getPendingTutors({
        search: searchTerm,
        status: 'Pending Review', // Only get pending review tutors
        subject: subjectFilter === 'All' ? undefined : subjectFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setPendingTutors(response.tutors);
      setTotalTutors(response.total);
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjectsList = await getSubjectsFromPendingApplications();
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
      selectedTutors.length === pendingTutors.length 
        ? [] 
        : pendingTutors.map(tutor => tutor.id)
    );
  };

  const handleBulkApprove = async () => {
    if (selectedTutors.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      await bulkApproveTutors(selectedTutors);
      setSelectedTutors([]);
      fetchPendingTutors();
    } catch (error) {
      console.error('Error approving tutors:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedTutors.length === 0 || !bulkRejectReason.trim()) return;
    
    setIsBulkActionLoading(true);
    try {
      await bulkRejectTutors(selectedTutors, bulkRejectReason);
      setSelectedTutors([]);
      setBulkRejectReason('');
      fetchPendingTutors();
    } catch (error) {
      console.error('Error rejecting tutors:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalTutors / ITEMS_PER_PAGE);

  // Since we only show pending review tutors, all stats are based on that
  const totalDocuments = pendingTutors.reduce((sum, t) => sum + t.documents.length, 0);
  const verifiedDocuments = pendingTutors.reduce((sum, t) => sum + t.documents.filter(d => d.verified).length, 0);
  const avgRateRange = pendingTutors.length > 0 
    ? Math.round(pendingTutors.reduce((sum, t) => sum + (t.hourlyRateRange.min + t.hourlyRateRange.max) / 2, 0) / pendingTutors.length)
    : 0;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Pending Tutor Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and approve tutor verification requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Applications
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTutors}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded for review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Documents</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Documents verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgRateRange}</div>
            <p className="text-xs text-muted-foreground">
              Per hour requested
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
                  placeholder="Search by name, email, or subject..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
                {selectedTutors.length} application(s) selected
              </span>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="text-green-600">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Bulk Approve
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve Applications</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve {selectedTutors.length} application(s)? 
                      Approved tutors will become active and visible in search.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkApprove}
                      disabled={isBulkActionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isBulkActionLoading ? 'Processing...' : 'Approve All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive">
                    <XCircle className="w-4 h-4 mr-1" />
                    Bulk Reject
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reject Applications</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject {selectedTutors.length} application(s)? 
                      This action will notify the applicants with the reason provided.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="bulk-reject-reason">Rejection Reason *</Label>
                    <Textarea
                      id="bulk-reject-reason"
                      value={bulkRejectReason}
                      onChange={(e) => setBulkRejectReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      className="mt-2"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleBulkReject}
                      disabled={isBulkActionLoading || !bulkRejectReason.trim()}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isBulkActionLoading ? 'Processing...' : 'Reject All'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Tutors Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading applications...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={selectedTutors.length === pendingTutors.length && pendingTutors.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left font-medium">Applicant</th>
                    <th className="p-4 text-left font-medium">Subjects & Rates</th>
                    <th className="p-4 text-left font-medium">Submission Date</th>
                    <th className="p-4 text-left font-medium">Documents</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingTutors.map((tutor) => (
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
                           
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {tutor.subjects.slice(0, 2).map((subject, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{subject.subject}</span>
                              <span className="text-muted-foreground"> - ${subject.proposedRate}/hr</span>
                              
                            </div>
                          ))}
                          {tutor.subjects.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{tutor.subjects.length - 2} more subjects
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(tutor.submissionDate).toLocaleDateString()}
                          <div className="text-muted-foreground">
                            {new Date(tutor.submissionDate).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            {tutor.documents.length} documents
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {tutor.documents.filter(d => d.verified).length} verified
                          </div>
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
                              <Link href={`/dashboard/admin/verification/pending/${tutor.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Review Application
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Quick Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="w-4 h-4 mr-2" />
                              Quick Reject
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
                {Math.min(currentPage * ITEMS_PER_PAGE, totalTutors)} of {totalTutors} applications
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
