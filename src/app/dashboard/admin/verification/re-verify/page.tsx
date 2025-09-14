'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getReVerificationRequests, 
  bulkApproveReVerificationRequests, 
  bulkRejectReVerificationRequests,
  getSubjectsFromReVerificationRequests,
  type ReVerificationRequest 
} from '@/lib/reVerificationData';
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
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  BookOpen,
  FileText,
  Calendar,
  Star,
  RefreshCw,
  Plus
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ReVerificationPage() {
  const [requests, setRequests] = useState<ReVerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  useEffect(() => {
    fetchReVerificationRequests();
    fetchSubjects();
  }, [searchTerm, subjectFilter, currentPage]);

  const fetchReVerificationRequests = async () => {
    setLoading(true);
    try {
      const response = await getReVerificationRequests({
        search: searchTerm,
        status: 'Pending', // Only get pending requests
        subject: subjectFilter === 'All' ? undefined : subjectFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      });
      setRequests(response.requests);
      setTotalRequests(response.total);
    } catch (error) {
      console.error('Error fetching re-verification requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const subjectsList = await getSubjectsFromReVerificationRequests();
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    setSelectedRequests([]);
  };

  const handleSubjectFilter = (value: string) => {
    setSubjectFilter(value);
    setCurrentPage(1);
    setSelectedRequests([]);
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleSelectAll = () => {
    setSelectedRequests(
      selectedRequests.length === requests.length 
        ? [] 
        : requests.map(request => request.id)
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      await bulkApproveReVerificationRequests(selectedRequests, 'Admin User');
      setSelectedRequests([]);
      fetchReVerificationRequests();
    } catch (error) {
      console.error('Error approving requests:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0 || !bulkRejectReason.trim()) return;
    
    setIsBulkActionLoading(true);
    try {
      await bulkRejectReVerificationRequests(selectedRequests, 'Admin User', bulkRejectReason);
      setSelectedRequests([]);
      setBulkRejectReason('');
      fetchReVerificationRequests();
    } catch (error) {
      console.error('Error rejecting requests:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRequests / ITEMS_PER_PAGE);

  // Since we only show pending requests, calculate relevant stats
  const totalNewSubjects = requests.reduce((sum, r) => sum + r.newSubjectRequests.length, 0);
  const totalDocuments = requests.reduce((sum, r) => sum + r.supportingDocuments.length, 0);
  const avgTutorRating = requests.length > 0 
    ? (requests.reduce((sum, r) => sum + r.tutorRating, 0) / requests.length).toFixed(1)
    : '0.0';

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tutor Re-verification</h1>
          <p className="text-muted-foreground mt-1">Review and approve tutor subject addition requests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Requests
          </Button>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Subjects</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNewSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Subjects requested
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Supporting documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Tutor Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgTutorRating}</div>
            <p className="text-xs text-muted-foreground">
              Overall rating
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
                  placeholder="Search by tutor name, email, or subject..."
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
          {selectedRequests.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
              <span className="text-sm font-medium">
                {selectedRequests.length} request(s) selected
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
                    <AlertDialogTitle>Approve Requests</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve {selectedRequests.length} re-verification request(s)? 
                      The new subjects will be added to the tutors' profiles.
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
                    <AlertDialogTitle>Reject Requests</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reject {selectedRequests.length} re-verification request(s)? 
                      The tutors will be notified with the reason provided.
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

      {/* Re-verification Requests Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading re-verification requests...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={selectedRequests.length === requests.length && requests.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="p-4 text-left font-medium">Tutor</th>
                    <th className="p-4 text-left font-medium">Current Subjects</th>
                    <th className="p-4 text-left font-medium">New Subject(s) Requested</th>
                    <th className="p-4 text-left font-medium">Submission Date</th>
                    <th className="p-4 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedRequests.includes(request.id)}
                          onCheckedChange={() => handleSelectRequest(request.id)}
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.tutorProfilePicture} />
                            <AvatarFallback>
                              {request.tutorName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{request.tutorName}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.tutorEmail}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              {request.tutorRating}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {request.currentSubjects.slice(0, 2).map((subject, index) => (
                            <div key={index} className="text-sm">
                              <span className="font-medium">{subject.subject}</span>
                              <span className="text-muted-foreground"> - ${subject.currentRate}/hr</span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                                {subject.rating} • {subject.totalSessions} sessions
                              </div>
                            </div>
                          ))}
                          {request.currentSubjects.length > 2 && (
                            <div className="text-sm text-muted-foreground">
                              +{request.currentSubjects.length - 2} more subjects
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {request.newSubjectRequests.map((newSubject, index) => (
                            <div key={index} className="text-sm">
                              <div className="flex items-center gap-2">
                                <Plus className="w-3 h-3 text-green-600" />
                                <span className="font-medium text-green-700">{newSubject.subject}</span>
                              </div>
                              <div className="ml-5 text-muted-foreground">
                                ${newSubject.proposedRate}/hr • {newSubject.experienceLevel}
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(request.submissionDate).toLocaleDateString()}
                          <div className="text-muted-foreground">
                            {new Date(request.submissionDate).toLocaleTimeString()}
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
                              <Link href={`/dashboard/admin/verification/re-verify/${request.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                Review Request
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
                {Math.min(currentPage * ITEMS_PER_PAGE, totalRequests)} of {totalRequests} requests
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
