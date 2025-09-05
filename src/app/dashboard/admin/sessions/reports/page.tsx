'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getSessions, 
  getSessionAnalytics,
  exportSessionsData,
  type SessionData, 
  type SessionFilters,
  type SessionStatus 
} from '@/lib/sessionsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  FileText,
  Mail,
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Activity,
  Star,
  AlertTriangle,
  RefreshCw,
  Eye
} from 'lucide-react';

interface ReportFilters {
  dateRange: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateFrom?: string;
  dateTo?: string;
  subject?: string;
  tutor?: string;
  student?: string;
  status?: SessionStatus | '';
  searchTerm?: string;
}

interface OverviewStats {
  totalSessions: number;
  completedSessions: number;
  cancelledSessions: number;
  noShowSessions: number;
  activeTutors: number;
  activeStudents: number;
  averageDuration: number;
  totalRevenue: number;
  cancellationRate: number;
}

interface TutorPerformance {
  id: string;
  name: string;
  sessionsCount: number;
  averageRating: number;
  cancellationRate: number;
  noShowRate: number;
  totalRevenue: number;
  completionRate: number;
}

interface StudentActivity {
  id: string;
  name: string;
  sessionsBooked: number;
  favoriteSubject: string;
  cancellationRate: number;
  noShowRate: number;
  totalSpent: number;
  averageRating: number;
}

interface FinancialSummary {
  totalPayments: number;
  totalRefunds: number;
  pendingPayouts: number;
  platformRevenue: number;
  averageSessionFee: number;
}

export default function SessionReportsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'monthly',
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    subject: '',
    tutor: '',
    student: '',
    status: '',
    searchTerm: ''
  });

  // Data states
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [tutorPerformance, setTutorPerformance] = useState<TutorPerformance[]>([]);
  const [studentActivity, setStudentActivity] = useState<StudentActivity[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  // Dialog states
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [filters]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      // Fetch sessions with filters
      const sessionFilters: SessionFilters = {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        subject: filters.subject || undefined,
        tutorName: filters.tutor || undefined,
        studentName: filters.student || undefined,
        status: filters.status || undefined,
        limit: 1000 // Get all sessions for reporting
      };

      const response = await getSessions(sessionFilters);
      let allSessions = response.sessions;

      // Apply search term filter
      if (filters.searchTerm) {
        allSessions = allSessions.filter(session =>
          session.id.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          session.student.name.toLowerCase().includes(filters.searchTerm!.toLowerCase()) ||
          session.tutor.name.toLowerCase().includes(filters.searchTerm!.toLowerCase())
        );
      }

      setSessions(allSessions);
      setFilteredSessions(allSessions);
      
      // Calculate overview stats
      calculateOverviewStats(allSessions);
      calculateTutorPerformance(allSessions);
      calculateStudentActivity(allSessions);
      calculateFinancialSummary(allSessions);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverviewStats = (sessions: SessionData[]) => {
    const completed = sessions.filter(s => s.status === 'Completed').length;
    const cancelled = sessions.filter(s => s.status === 'Cancelled').length;
    const noShows = sessions.filter(s => 
      s.status === 'Completed' && (!s.attendance.studentJoined || !s.attendance.tutorJoined)
    ).length;

    const uniqueTutors = new Set(sessions.map(s => s.tutor.id)).size;
    const uniqueStudents = new Set(sessions.map(s => s.student.id)).size;
    
    const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
    const avgDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;
    
    const revenue = sessions
      .filter(s => s.payment.paymentStatus === 'Paid')
      .reduce((sum, s) => sum + s.payment.sessionFee, 0);
    
    const cancellationRate = sessions.length > 0 ? (cancelled / sessions.length) * 100 : 0;

    setOverviewStats({
      totalSessions: sessions.length,
      completedSessions: completed,
      cancelledSessions: cancelled,
      noShowSessions: noShows,
      activeTutors: uniqueTutors,
      activeStudents: uniqueStudents,
      averageDuration: avgDuration,
      totalRevenue: revenue,
      cancellationRate
    });
  };

  const calculateTutorPerformance = (sessions: SessionData[]) => {
    const tutorMap = new Map<string, TutorPerformance>();

    sessions.forEach(session => {
      const tutorId = session.tutor.id;
      if (!tutorMap.has(tutorId)) {
        tutorMap.set(tutorId, {
          id: tutorId,
          name: session.tutor.name,
          sessionsCount: 0,
          averageRating: session.tutor.rating,
          cancellationRate: 0,
          noShowRate: 0,
          totalRevenue: 0,
          completionRate: 0
        });
      }

      const tutor = tutorMap.get(tutorId)!;
      tutor.sessionsCount++;
      
      if (session.payment.paymentStatus === 'Paid') {
        tutor.totalRevenue += session.payment.sessionFee;
      }
    });

    // Calculate rates for each tutor
    tutorMap.forEach(tutor => {
      const tutorSessions = sessions.filter(s => s.tutor.id === tutor.id);
      const cancelled = tutorSessions.filter(s => s.status === 'Cancelled').length;
      const completed = tutorSessions.filter(s => s.status === 'Completed').length;
      const noShows = tutorSessions.filter(s => 
        s.status === 'Completed' && !s.attendance.tutorJoined
      ).length;

      tutor.cancellationRate = (cancelled / tutorSessions.length) * 100;
      tutor.noShowRate = (noShows / tutorSessions.length) * 100;
      tutor.completionRate = (completed / tutorSessions.length) * 100;
    });

    setTutorPerformance(Array.from(tutorMap.values()).sort((a, b) => b.sessionsCount - a.sessionsCount));
  };

  const calculateStudentActivity = (sessions: SessionData[]) => {
    const studentMap = new Map<string, StudentActivity>();

    sessions.forEach(session => {
      const studentId = session.student.id;
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name: session.student.name,
          sessionsBooked: 0,
          favoriteSubject: '',
          cancellationRate: 0,
          noShowRate: 0,
          totalSpent: 0,
          averageRating: 0
        });
      }

      const student = studentMap.get(studentId)!;
      student.sessionsBooked++;
      
      if (session.payment.paymentStatus === 'Paid') {
        student.totalSpent += session.payment.sessionFee;
      }
    });

    // Calculate favorite subjects and rates
    studentMap.forEach(student => {
      const studentSessions = sessions.filter(s => s.student.id === student.id);
      const subjectCounts = studentSessions.reduce((acc, s) => {
        acc[s.subject] = (acc[s.subject] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      student.favoriteSubject = Object.entries(subjectCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

      const cancelled = studentSessions.filter(s => s.status === 'Cancelled').length;
      const noShows = studentSessions.filter(s => 
        s.status === 'Completed' && !s.attendance.studentJoined
      ).length;

      student.cancellationRate = (cancelled / studentSessions.length) * 100;
      student.noShowRate = (noShows / studentSessions.length) * 100;
      
      const ratings = studentSessions.map(s => s.tutor.rating);
      student.averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
    });

    setStudentActivity(Array.from(studentMap.values()).sort((a, b) => b.sessionsBooked - a.sessionsBooked));
  };

  const calculateFinancialSummary = (sessions: SessionData[]) => {
    const payments = sessions.filter(s => s.payment.paymentStatus === 'Paid');
    const refunds = sessions.filter(s => s.payment.paymentStatus === 'Refunded');
    
    const totalPayments = payments.reduce((sum, s) => sum + s.payment.sessionFee, 0);
    const totalRefunds = refunds.reduce((sum, s) => sum + (s.payment.refundAmount || 0), 0);
    const pendingPayouts = sessions
      .filter(s => s.payment.paymentStatus === 'Pending')
      .reduce((sum, s) => sum + s.payment.sessionFee, 0);

    const platformRevenue = totalPayments - totalRefunds;
    const avgSessionFee = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.payment.sessionFee, 0) / sessions.length 
      : 0;

    setFinancialSummary({
      totalPayments,
      totalRefunds,
      pendingPayouts,
      platformRevenue,
      averageSessionFee: avgSessionFee
    });
  };

  const handleDateRangeChange = (range: ReportFilters['dateRange']) => {
    const now = new Date();
    let dateFrom: string;
    let dateTo = now.toISOString().split('T')[0];

    switch (range) {
      case 'daily':
        dateFrom = now.toISOString().split('T')[0];
        break;
      case 'weekly':
        dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'monthly':
        dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      default:
        return; // Custom range, don't auto-set dates
    }

    setFilters(prev => ({ ...prev, dateRange: range, dateFrom, dateTo }));
  };

  const handleExport = async (format: 'csv' | 'pdf') => {
    setIsExporting(true);
    try {
      if (format === 'csv') {
        const csvContent = await exportSessionsData({
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
          subject: filters.subject || undefined,
          tutorName: filters.tutor || undefined,
          studentName: filters.student || undefined,
          status: filters.status || undefined
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-report-${filters.dateFrom}-to-${filters.dateTo}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // For PDF, create a comprehensive report
        const reportData = {
          generatedAt: new Date().toISOString(),
          dateRange: `${filters.dateFrom} to ${filters.dateTo}`,
          filters,
          overviewStats,
          tutorPerformance: tutorPerformance.slice(0, 10),
          studentActivity: studentActivity.slice(0, 10),
          financialSummary,
          sessions: filteredSessions.slice(0, 100) // Limit for PDF
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `session-report-${filters.dateFrom}-to-${filters.dateTo}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
      
      // Log export action
      console.log(`Admin exported ${format.toUpperCase()} report for ${filters.dateFrom} to ${filters.dateTo}`);
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold">Session Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Historical data analysis and performance insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchReportData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Data
          </Button>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/sessions">
              <Eye className="w-4 h-4 mr-2" />
              Manage Sessions
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <Label>Date Range</Label>
              <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">Last 7 Days</SelectItem>
                  <SelectItem value="monthly">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.dateRange === 'custom' && (
              <>
                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
              </>
            )}

            <div>
              <Label>Status</Label>
              <Select value={filters.status || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as SessionStatus | '' }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Upcoming">Upcoming</SelectItem>
                  <SelectItem value="Ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Search</Label>
              <Input
                placeholder="Session ID, student, or tutor..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Filter by subject..."
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label>Tutor</Label>
              <Input
                placeholder="Filter by tutor..."
                value={filters.tutor}
                onChange={(e) => setFilters(prev => ({ ...prev, tutor: e.target.value }))}
              />
            </div>
            <div>
              <Label>Student</Label>
              <Input
                placeholder="Filter by student..."
                value={filters.student}
                onChange={(e) => setFilters(prev => ({ ...prev, student: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tutors">Tutor Performance</TabsTrigger>
          <TabsTrigger value="students">Student Activity</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {overviewStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Activity className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                        <p className="text-2xl font-bold">{overviewStats.totalSessions}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Users className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{overviewStats.activeTutors + overviewStats.activeStudents}</p>
                        <p className="text-xs text-muted-foreground">{overviewStats.activeTutors} tutors, {overviewStats.activeStudents} students</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Avg. Duration</p>
                        <p className="text-2xl font-bold">{Math.round(overviewStats.averageDuration)}m</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold">${overviewStats.totalRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingDown className="w-8 h-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Cancellation Rate</p>
                        <p className="text-2xl font-bold">{overviewStats.cancellationRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Completed
                        </span>
                        <span className="font-bold">{overviewStats.completedSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Cancelled
                        </span>
                        <span className="font-bold">{overviewStats.cancelledSessions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          No-shows
                        </span>
                        <span className="font-bold">{overviewStats.noShowSessions}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {filteredSessions.slice(0, 5).map((session) => (
                        <div key={session.id} className="flex justify-between items-center p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{session.student.name}</p>
                            <p className="text-sm text-muted-foreground">{session.subject}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={
                              session.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              session.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {session.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(session.scheduledDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Tutor Performance Tab */}
        <TabsContent value="tutors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tutor Performance Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Rank</th>
                      <th className="text-left p-4">Tutor Name</th>
                      <th className="text-left p-4">Sessions</th>
                      <th className="text-left p-4">Avg. Rating</th>
                      <th className="text-left p-4">Completion Rate</th>
                      <th className="text-left p-4">Cancellation Rate</th>
                      <th className="text-left p-4">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorPerformance.slice(0, 10).map((tutor, index) => (
                      <tr key={tutor.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {index < 3 && (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-400 text-gray-900' :
                                'bg-amber-600 text-amber-100'
                              }`}>
                                {index + 1}
                              </div>
                            )}
                            {index >= 3 && <span className="text-muted-foreground">{index + 1}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{tutor.name}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold">{tutor.sessionsCount}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{tutor.averageRating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={tutor.completionRate >= 90 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {tutor.completionRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={tutor.cancellationRate <= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {tutor.cancellationRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">${tutor.totalRevenue.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Student Activity Tab */}
        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Activity Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Student Name</th>
                      <th className="text-left p-4">Sessions Booked</th>
                      <th className="text-left p-4">Favorite Subject</th>
                      <th className="text-left p-4">Total Spent</th>
                      <th className="text-left p-4">Cancellation Rate</th>
                      <th className="text-left p-4">Avg. Tutor Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentActivity.slice(0, 15).map((student) => (
                      <tr key={student.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-medium">{student.name}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold">{student.sessionsBooked}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{student.favoriteSubject}</Badge>
                        </td>
                        <td className="p-4">
                          <span className="font-medium">${student.totalSpent.toLocaleString()}</span>
                        </td>
                        <td className="p-4">
                          <Badge className={student.cancellationRate <= 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {student.cancellationRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>{student.averageRating.toFixed(1)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financial Tab */}
        <TabsContent value="financial" className="space-y-6">
          {financialSummary && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <DollarSign className="w-8 h-8 text-green-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Payments</p>
                        <p className="text-2xl font-bold">${financialSummary.totalPayments.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingDown className="w-8 h-8 text-red-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Total Refunds</p>
                        <p className="text-2xl font-bold">${financialSummary.totalRefunds.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                        <p className="text-2xl font-bold">${financialSummary.pendingPayouts.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <TrendingUp className="w-8 h-8 text-blue-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                        <p className="text-2xl font-bold">${financialSummary.platformRevenue.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <BarChart3 className="w-8 h-8 text-purple-600" />
                      <div className="ml-4">
                        <p className="text-sm font-medium text-muted-foreground">Avg. Session Fee</p>
                        <p className="text-2xl font-bold">${financialSummary.averageSessionFee.toFixed(0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Financial Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Revenue Streams</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Completed Sessions</span>
                          <span className="font-medium">${financialSummary.totalPayments.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-red-600">
                          <span>Refunds Issued</span>
                          <span className="font-medium">-${financialSummary.totalRefunds.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Net Revenue</span>
                          <span>${financialSummary.platformRevenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold">Payment Status</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Pending Payments</span>
                          <span className="font-medium">${financialSummary.pendingPayouts.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fees</span>
                          <span className="font-medium">${(financialSummary.totalPayments * 0.03).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Report</DialogTitle>
            <DialogDescription>
              Choose the format to export your session report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Report Summary</h4>
              <div className="text-sm space-y-1">
                <div>Date Range: {filters.dateFrom} to {filters.dateTo}</div>
                <div>Total Sessions: {filteredSessions.length}</div>
                <div>Active Tab: {activeTab}</div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleExport('csv')} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button onClick={() => handleExport('pdf')} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export JSON'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
