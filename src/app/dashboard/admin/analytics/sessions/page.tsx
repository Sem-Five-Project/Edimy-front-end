'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Calendar,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  Star,
  Search,
} from 'lucide-react';

interface SessionData {
  id: string;
  date: string;
  tutorName: string;
  studentName: string;
  subject: string;
  duration: number;
  status: 'completed' | 'cancelled' | 'ongoing';
  rating?: number;
}

interface TrendData {
  date: string;
  sessions: number;
  completedSessions: number;
  cancelledSessions: number;
}

interface SubjectData {
  subject: string;
  sessions: number;
  hours: number;
  [key: string]: string | number; // Add index signature for Recharts compatibility
}

interface PeakHourData {
  hour: string;
  sessions: number;
  day: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const SUBJECTS = [
  'All Subjects',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Computer Science',
  'Economics',
];

export default function SessionTrendsPage() {
  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [subjectData, setSubjectData] = useState<SubjectData[]>([]);
  const [peakHourData, setPeakHourData] = useState<PeakHourData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedTutor, setSelectedTutor] = useState('All Tutors');
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSessionTrends();
  }, [selectedSubject, selectedTutor, dateRange]);

  const fetchSessionTrends = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock session data
      const mockSessionData: SessionData[] = Array.from({ length: 50 }, (_, i) => {
        const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
        const statuses: ('completed' | 'cancelled' | 'ongoing')[] = ['completed', 'cancelled', 'ongoing'];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        return {
          id: `session-${i + 1}`,
          date: date.toISOString().split('T')[0],
          tutorName: `Tutor ${i + 1}`,
          studentName: `Student ${i + 1}`,
          subject: subjects[Math.floor(Math.random() * subjects.length)],
          duration: Math.floor(Math.random() * 120) + 30, // 30-150 minutes
          status: statuses[Math.floor(Math.random() * statuses.length)],
          rating: Math.random() > 0.3 ? Math.floor(Math.random() * 2) + 4 : undefined, // 4-5 stars or no rating
        };
      });

      // Mock trend data
      const mockTrendData: TrendData[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const totalSessions = Math.floor(Math.random() * 50) + 20;
        const completedSessions = Math.floor(totalSessions * 0.8);
        const cancelledSessions = totalSessions - completedSessions;
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sessions: totalSessions,
          completedSessions,
          cancelledSessions,
        };
      });

      // Mock subject data
      const mockSubjectData: SubjectData[] = [
        { subject: 'Mathematics', sessions: 156, hours: 312 },
        { subject: 'Physics', sessions: 98, hours: 245 },
        { subject: 'Chemistry', sessions: 87, hours: 203 },
        { subject: 'Biology', sessions: 76, hours: 189 },
        { subject: 'English', sessions: 65, hours: 156 },
        { subject: 'Computer Science', sessions: 54, hours: 135 },
        { subject: 'Economics', sessions: 43, hours: 98 },
      ];

      // Mock peak hour data (heatmap)
      const mockPeakHourData: PeakHourData[] = [];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const hours = ['9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM', '6PM', '7PM', '8PM'];
      
      days.forEach(day => {
        hours.forEach(hour => {
          mockPeakHourData.push({
            day,
            hour,
            sessions: Math.floor(Math.random() * 20) + 1,
          });
        });
      });

      setSessionData(mockSessionData);
      setTrendData(mockTrendData);
      setSubjectData(mockSubjectData);
      setPeakHourData(mockPeakHourData);
    } catch (error) {
      console.error('Error fetching session trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessionData.filter(session => {
    const matchesSubject = selectedSubject === 'All Subjects' || session.subject === selectedSubject;
    const matchesSearch = searchTerm === '' || 
      session.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSubject && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800">Ongoing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const totalSessions = filteredSessions.length;
  const completedSessions = filteredSessions.filter(s => s.status === 'completed').length;
  const averageRating = filteredSessions
    .filter(s => s.rating)
    .reduce((acc, s) => acc + (s.rating || 0), 0) / filteredSessions.filter(s => s.rating).length || 0;

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
          <h1 className="text-3xl font-bold">Session Trends</h1>
          <p className="text-muted-foreground">
            Analyze tutoring activity and session patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSessionTrends} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tutor">Tutor</Label>
              <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Tutors">All Tutors</SelectItem>
                  <SelectItem value="John Doe">John Doe</SelectItem>
                  <SelectItem value="Jane Smith">Jane Smith</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{completedSessions}</p>
                <p className="text-sm text-green-600">
                  {totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0}% completion rate
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Hours</p>
                <p className="text-2xl font-bold">
                  {Math.round(filteredSessions.reduce((acc, s) => acc + s.duration, 0) / 60)}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Sessions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="sessions" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Total Sessions"
                />
                <Line 
                  type="monotone" 
                  dataKey="completedSessions" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Most Booked Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Most Booked Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sessions" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Distribution Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={subjectData.slice(0, 5)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="sessions"
              >
                {subjectData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Session Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Session Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.slice(0, 10).map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.date}</TableCell>
                  <TableCell className="font-medium">{session.tutorName}</TableCell>
                  <TableCell>{session.studentName}</TableCell>
                  <TableCell>{session.subject}</TableCell>
                  <TableCell>{session.duration} min</TableCell>
                  <TableCell>{getStatusBadge(session.status)}</TableCell>
                  <TableCell>
                    {session.rating ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {session.rating}
                      </div>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Mathematics is Leading</h4>
              <p className="text-sm text-blue-700">
                Mathematics sessions increased 15% this month with highest completion rate.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Peak Hours: 6-8 PM</h4>
              <p className="text-sm text-green-700">
                Evening sessions show highest engagement and completion rates.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900">Weekend Growth</h4>
              <p className="text-sm text-yellow-700">
                Weekend sessions grew 22%, indicating increased student availability.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
