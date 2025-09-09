'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  GraduationCap,
  Calendar,
  DollarSign,
  Star,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Download,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';

interface KPIData {
  totalStudents: number;
  totalTutors: number;
  totalSessions: number;
  totalRevenue: number;
  averageRating: number;
  pendingTasks: number;
  trends: {
    studentsChange: number;
    tutorsChange: number;
    sessionsChange: number;
    revenueChange: number;
    ratingChange: number;
  };
}

interface TrendData {
  date: string;
  sessions: number;
  revenue: number;
  newUsers: number;
}

export default function KPIDashboardPage() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchKPIData();
  }, [timePeriod]);

  const fetchKPIData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock KPI data
      const mockKPIData: KPIData = {
        totalStudents: 1247,
        totalTutors: 156,
        totalSessions: 3456,
        totalRevenue: 124750,
        averageRating: 4.7,
        pendingTasks: 23,
        trends: {
          studentsChange: 12.5,
          tutorsChange: 8.3,
          sessionsChange: 15.2,
          revenueChange: 18.7,
          ratingChange: 0.2,
        }
      };

      // Mock trend data for the last 30 days
      const mockTrendData: TrendData[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sessions: Math.floor(Math.random() * 150) + 80,
          revenue: Math.floor(Math.random() * 5000) + 3000,
          newUsers: Math.floor(Math.random() * 20) + 5,
        };
      });

      setKpiData(mockKPIData);
      setTrendData(mockTrendData);
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
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
          <h1 className="text-3xl font-bold">KPI Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor key performance indicators and platform metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timePeriod} onValueChange={(value: '7d' | '30d' | '90d') => setTimePeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchKPIData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {kpiData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Total Students */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold">{kpiData.totalStudents.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(kpiData.trends.studentsChange)}
                    <span className={`text-sm ml-1 ${getTrendColor(kpiData.trends.studentsChange)}`}>
                      {Math.abs(kpiData.trends.studentsChange)}%
                    </span>
                  </div>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Tutors */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tutors</p>
                  <p className="text-2xl font-bold">{kpiData.totalTutors.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(kpiData.trends.tutorsChange)}
                    <span className={`text-sm ml-1 ${getTrendColor(kpiData.trends.tutorsChange)}`}>
                      {Math.abs(kpiData.trends.tutorsChange)}%
                    </span>
                  </div>
                </div>
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Sessions */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                  <p className="text-2xl font-bold">{kpiData.totalSessions.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(kpiData.trends.sessionsChange)}
                    <span className={`text-sm ml-1 ${getTrendColor(kpiData.trends.sessionsChange)}`}>
                      {Math.abs(kpiData.trends.sessionsChange)}%
                    </span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(kpiData.totalRevenue)}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(kpiData.trends.revenueChange)}
                    <span className={`text-sm ml-1 ${getTrendColor(kpiData.trends.revenueChange)}`}>
                      {Math.abs(kpiData.trends.revenueChange)}%
                    </span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Rating</p>
                  <p className="text-2xl font-bold">{kpiData.averageRating}</p>
                  <div className="flex items-center mt-1">
                    {getTrendIcon(kpiData.trends.ratingChange)}
                    <span className={`text-sm ml-1 ${getTrendColor(kpiData.trends.ratingChange)}`}>
                      {Math.abs(kpiData.trends.ratingChange)}
                    </span>
                  </div>
                </div>
                <Star className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                  <p className="text-2xl font-bold">{kpiData.pendingTasks}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-4 h-4 text-red-600" />
                    <span className="text-sm ml-1 text-red-600">Needs attention</span>
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Sessions Trend
            </CardTitle>
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
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Users className="w-6 h-6" />
                <span>Manage Users</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <CheckCircle className="w-6 h-6" />
                <span>Approve Tutors</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <AlertTriangle className="w-6 h-6" />
                <span>Handle Disputes</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Eye className="w-6 h-6" />
                <span>View Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Payment System</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Session Management</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Operational
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Notification Service</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Degraded
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>User Authentication</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Operational
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Users Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            New User Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="newUsers" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
