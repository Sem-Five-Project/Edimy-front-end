'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  searchSessions,
  getSessionStats,
  type SessionsDto,
  type SessionStatsDto
} from '@/lib/adminSession';
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
  const [sessions, setSessions] = useState<SessionsDto[]>([]);
  const [stats, setStats] = useState<SessionStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSessions, setTotalSessions] = useState(0);
  // Filters
  // Only status, dateFrom, dateTo are supported by API
  const [status, setStatus] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [studentId, setStudentId] = useState('');
  const [tutorId, setTutorId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  // Dialog states (export removed)
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const formatDateToLocalDateTime = (date: string, endOfDay = false) => {
    if (!date) return undefined;
    const d = new Date(date);
    if (endOfDay) {
      d.setHours(23, 59, 59, 999);
    } else {
      d.setHours(0, 0, 0, 0);
    }
    return d.toISOString().slice(0, 19);
  };

  const fetchSessions = async (pageOverride?: number) => {
    setLoading(true);
    try {
      let statusParam = status !== 'all' ? status : undefined;
      // Map UI status to API status if needed
      if (statusParam === 'Rescheduled') statusParam = 'RESCHEDULED';
      if (statusParam === 'Scheduled') statusParam = 'SCHEDULED';
      if (statusParam === 'Completed') statusParam = 'COMPLETED';
      if (statusParam === 'Cancelled') statusParam = 'CANCELLED';
      // ...add more mappings if your API expects different values...
      const filters = {
        studentId: studentId ? parseInt(studentId) : undefined,
        tutorId: tutorId ? parseInt(tutorId) : undefined,
        subjectId: subjectId ? parseInt(subjectId) : undefined,
        status: statusParam,
        fromTime: formatDateToLocalDateTime(dateFrom),
        toTime: formatDateToLocalDateTime(dateTo, true),
        page: (pageOverride ?? currentPage) - 1, // API is 0-indexed
        size: ITEMS_PER_PAGE
      };
      const response = await searchSessions(filters);
      setSessions(response.content);
      setTotalSessions(response.totalElements);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await getSessionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchStats();
  }, [currentPage]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSessions(1);
    fetchStats();
  };

  const handleClearSearch = () => {
    setStudentId('');
    setTutorId('');
    setSubjectId('');
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    fetchSessions(1);
    fetchStats();
  };

  // Status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Rescheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Scheduled': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalSessions : 0}</div>
            <p className="text-xs text-muted-foreground">All sessions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.upcomingSessions ?? 0 : 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled to start soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.cancelledSessions ?? 0 : 0}</div>
            <p className="text-xs text-muted-foreground">Cancelled by tutor/student</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.completedSessions ?? 0 : 0}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Student ID</Label>
              <Input
                placeholder="Student ID..."
                value={studentId}
                onChange={(e) => setStudentId(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <Label>Tutor ID</Label>
              <Input
                placeholder="Tutor ID..."
                value={tutorId}
                onChange={(e) => setTutorId(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <Label>Subject ID</Label>
              <Input
                placeholder="Subject ID..."
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value.replace(/\D/g, ''))}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700 focus:ring-slate-600">
                  <SelectValue placeholder="All statuses" className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white hover:bg-slate-700 focus:bg-slate-700">All</SelectItem>
                  <SelectItem value="Rescheduled" className="text-blue-300 hover:bg-slate-700 focus:bg-slate-700">Rescheduled</SelectItem>
                  <SelectItem value="Scheduled" className="text-green-300 hover:bg-slate-700 focus:bg-slate-700">Scheduled</SelectItem>
                  <SelectItem value="Completed" className="text-gray-300 hover:bg-slate-700 focus:bg-slate-700">Completed</SelectItem>
                  <SelectItem value="Cancelled" className="text-red-300 hover:bg-slate-700 focus:bg-slate-700">Cancelled</SelectItem>
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
          <div className="flex gap-4 justify-center pt-2 border-t">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
              <Search className="w-4 h-4 mr-2" />
              Search Sessions
            </Button>
            <Button variant="outline" onClick={handleClearSearch} className="px-8">
              Clear Filters
            </Button>
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
                  <th className="text-center p-4">Session ID</th>
                  <th className="text-center p-4">Title</th>
                  <th className="text-center p-4">Tutor ID</th>
                  <th className="text-center p-4">Class ID</th>
                  <th className="text-center p-4">Start Time</th>
                  <th className="text-center p-4">Duration</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">View Session</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.sessionId} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-center">
                      <div className="font-mono text-sm">{session.sessionId}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm">{session.title}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-mono text-sm">{session.tutorId}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="font-mono text-sm">{session.classId}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm">{new Date(session.startTime).toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm">{session.duration}</div>
                    </td>
                    <td className="p-4 text-center">
                      <Badge className={getStatusBadgeColor(session.status)}>
                        {session.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/admin/sessions/${session.sessionId}`}>
                          View Session
                        </Link>
                      </Button>
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
    </div>
  );
}
