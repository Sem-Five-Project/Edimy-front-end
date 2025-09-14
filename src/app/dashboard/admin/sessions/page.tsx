'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getSessions, 
  bulkCancelSessions, 
  exportSessionsData,
  type SessionData, 
  type SessionFilters, 
  type SessionStats,
  type SessionStatus 
} from '@/lib/sessionsData';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Calendar,
  XCircle,
  Download,
  Users,
  Clock,
  CheckCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Activity
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function AllSessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  
  // Filters
  const [studentName, setStudentName] = useState('');
  const [tutorName, setTutorName] = useState('');
  const [subject, setSubject] = useState('');
  const [status, setStatus] = useState<SessionStatus | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Dialog states
  const [showBulkCancelDialog, setShowBulkCancelDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [bulkCancelReason, setBulkCancelReason] = useState('');
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const filters: SessionFilters = {
        studentName: studentName || undefined,
        tutorName: tutorName || undefined,
        subject: subject || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      };
      
      const response = await getSessions(filters);
      setSessions(response.sessions);
      setStats(response.stats);
      setTotalSessions(response.total);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentPage, studentName, tutorName, subject, status, dateFrom, dateTo]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSessions(sessions.map(s => s.id));
    } else {
      setSelectedSessions([]);
    }
  };

  const handleSelectSession = (sessionId: string, checked: boolean) => {
    if (checked) {
      setSelectedSessions([...selectedSessions, sessionId]);
    } else {
      setSelectedSessions(selectedSessions.filter(id => id !== sessionId));
    }
  };

  const handleBulkCancel = async () => {
    if (selectedSessions.length === 0) return;
    
    setIsBulkActionLoading(true);
    try {
      const result = await bulkCancelSessions(
        selectedSessions,
        bulkCancelReason,
        'admin-001' // In real app, get from auth context
      );
      
      console.log(`Cancelled ${result.success} sessions, ${result.failed} failed`);
      setSelectedSessions([]);
      setBulkCancelReason('');
      setShowBulkCancelDialog(false);
      fetchSessions();
    } catch (error) {
      console.error('Error cancelling sessions:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleExport = async () => {
    setIsBulkActionLoading(true);
    try {
      const csvContent = await exportSessionsData({
        studentName: studentName || undefined,
        tutorName: tutorName || undefined,
        subject: subject || undefined,
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sessions-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting sessions:', error);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: SessionStatus) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const totalPages = Math.ceil(totalSessions / ITEMS_PER_PAGE);

  if (loading && sessions.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all tutoring sessions on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowExportDialog(true)}
            disabled={loading}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
          {selectedSessions.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={() => setShowBulkCancelDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Cancel Selected ({selectedSessions.length})
            </Button>
          )}
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Live Monitoring</h3>
                <p className="text-sm text-muted-foreground">Monitor ongoing sessions in real-time</p>
              </div>
              <Button asChild size="sm">
                <Link href="/dashboard/admin/sessions/ongoing">
                  <Activity className="w-4 h-4 mr-2" />
                  View Live
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Session Analytics</h3>
                <p className="text-sm text-muted-foreground">View reports and performance data</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/admin/sessions/reports">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Reports
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Session Management</h3>
                <p className="text-sm text-muted-foreground">Manage all sessions below</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {stats ? `${stats.totalSessions} total` : 'Loading...'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <Label>Student Name</Label>
              <Input
                placeholder="Search student..."
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Tutor Name</Label>
              <Input
                placeholder="Search tutor..."
                value={tutorName}
                onChange={(e) => setTutorName(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Search subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={status || undefined} onValueChange={(value) => setStatus(value as SessionStatus | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sessions ({totalSessions} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">
                    <Checkbox
                      checked={selectedSessions.length === sessions.length && sessions.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left p-4">Session ID</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Tutor</th>
                  <th className="text-left p-4">Subject</th>
                  <th className="text-left p-4">Date & Time</th>
                  <th className="text-left p-4">Duration</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Payment</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <Checkbox
                        checked={selectedSessions.includes(session.id)}
                        onCheckedChange={(checked) => handleSelectSession(session.id, checked as boolean)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm">{session.id}</div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{session.student.name}</div>
                        <div className="text-sm text-muted-foreground">{session.student.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{session.tutor.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ⭐ {session.tutor.rating} ({session.tutor.totalSessions} sessions)
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{session.subject}</Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(session.scheduledDate).toLocaleDateString()}
                        <div className="text-muted-foreground">{session.scheduledTime}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">{session.duration} min</div>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(session.status)}>
                        {session.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <div>${session.payment.sessionFee}</div>
                        <Badge className={getPaymentStatusColor(session.payment.paymentStatus)}>
                          {session.payment.paymentStatus}
                        </Badge>
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
                            <Link href={`/dashboard/admin/sessions/${session.id}`}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {session.status === 'Upcoming' && (
                            <>
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Reschedule
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Session
                              </DropdownMenuItem>
                            </>
                          )}
                          {session.payment.paymentStatus === 'Paid' && (
                            <DropdownMenuItem>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalSessions)} of {totalSessions} sessions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Cancel Dialog */}
      <AlertDialog open={showBulkCancelDialog} onOpenChange={setShowBulkCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Selected Sessions</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to cancel {selectedSessions.length} sessions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="cancelReason">Cancellation Reason</Label>
            <Textarea
              id="cancelReason"
              placeholder="Enter reason for cancellation..."
              value={bulkCancelReason}
              onChange={(e) => setBulkCancelReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkCancel}
              disabled={!bulkCancelReason.trim() || isBulkActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkActionLoading ? 'Cancelling...' : 'Cancel Sessions'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Session Data</DialogTitle>
            <DialogDescription>
              Export session data with current filters applied. The file will be downloaded as a CSV.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isBulkActionLoading}>
              {isBulkActionLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
