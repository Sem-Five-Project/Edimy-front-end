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
  AreaChart,
  Area,
} from 'recharts';
import {
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle,
  Search,
  Calendar,
} from 'lucide-react';

interface PaymentTransaction {
  id: string;
  date: string;
  tutorName: string;
  studentName: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded' | 'failed';
  paymentMethod: string;
  subject: string;
  sessionId: string;
}

interface RevenueData {
  date: string;
  revenue: number;
  payouts: number;
  netRevenue: number;
  transactionCount: number;
}

interface TutorEarnings {
  tutorName: string;
  totalEarnings: number;
  sessionCount: number;
  averageRating: number;
  subject: string;
}

interface PaymentMethodData {
  method: string;
  count: number;
  amount: number;
  percentage: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

const PAYMENT_STATUSES = ['All Status', 'Paid', 'Pending', 'Refunded', 'Failed'];
const SUBJECTS = ['All Subjects', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

export default function PaymentTrendsPage() {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [tutorEarnings, setTutorEarnings] = useState<TutorEarnings[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPaymentTrends();
  }, [selectedStatus, selectedSubject, dateRange]);

  const fetchPaymentTrends = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction data
      const mockTransactions: PaymentTransaction[] = Array.from({ length: 100 }, (_, i) => {
        const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
        const statuses: ('paid' | 'pending' | 'refunded' | 'failed')[] = ['paid', 'pending', 'refunded', 'failed'];
        const paymentMethods = ['Credit Card', 'PayPal', 'Stripe', 'Bank Transfer'];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        
        return {
          id: `txn-${i + 1}`,
          date: date.toISOString().split('T')[0],
          tutorName: `Tutor ${Math.floor(Math.random() * 20) + 1}`,
          studentName: `Student ${Math.floor(Math.random() * 50) + 1}`,
          amount: Math.floor(Math.random() * 100) + 25, // $25-$125
          status: statuses[Math.floor(Math.random() * statuses.length)],
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
          subject: subjects[Math.floor(Math.random() * subjects.length)],
          sessionId: `session-${i + 1}`,
        };
      });

      // Mock revenue data
      const mockRevenueData: RevenueData[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const revenue = Math.floor(Math.random() * 5000) + 2000;
        const payouts = Math.floor(revenue * 0.7); // 70% goes to tutors
        
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue,
          payouts,
          netRevenue: revenue - payouts,
          transactionCount: Math.floor(Math.random() * 50) + 20,
        };
      });

      // Mock tutor earnings data
      const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];
      const mockTutorEarnings: TutorEarnings[] = Array.from({ length: 15 }, (_, i) => ({
        tutorName: `Tutor ${i + 1}`,
        totalEarnings: Math.floor(Math.random() * 5000) + 1000,
        sessionCount: Math.floor(Math.random() * 50) + 10,
        averageRating: Math.round((Math.random() * 1 + 4) * 10) / 10, // 4.0-5.0
        subject: subjects[Math.floor(Math.random() * subjects.length)],
      })).sort((a, b) => b.totalEarnings - a.totalEarnings);

      // Mock payment method data
      const methods = ['Credit Card', 'PayPal', 'Stripe', 'Bank Transfer', 'Apple Pay', 'Google Pay'];
      const mockPaymentMethods: PaymentMethodData[] = methods.map(method => {
        const count = Math.floor(Math.random() * 100) + 20;
        const amount = count * (Math.floor(Math.random() * 50) + 30);
        return {
          method,
          count,
          amount,
          percentage: 0, // Will calculate below
        };
      });

      // Calculate percentages
      const totalAmount = mockPaymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
      mockPaymentMethods.forEach(pm => {
        pm.percentage = Math.round((pm.amount / totalAmount) * 100);
      });

      setTransactions(mockTransactions);
      setRevenueData(mockRevenueData);
      setTutorEarnings(mockTutorEarnings);
      setPaymentMethods(mockPaymentMethods);
    } catch (error) {
      console.error('Error fetching payment trends:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesStatus = selectedStatus === 'All Status' || 
      transaction.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSubject = selectedSubject === 'All Subjects' || 
      transaction.subject === selectedSubject;
    const matchesSearch = searchTerm === '' || 
      transaction.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSubject && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800">Refunded</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'refunded':
        return <TrendingDown className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  // Calculate summary statistics
  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalPayouts = Math.floor(totalRevenue * 0.7);
  const pendingAmount = filteredTransactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);
  const refundAmount = filteredTransactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + t.amount, 0);

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
          <h1 className="text-3xl font-bold">Payment Trends</h1>
          <p className="text-muted-foreground">
            Monitor revenue, payouts, and financial performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPaymentTrends} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
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
              <Label htmlFor="status">Payment Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  placeholder="Search transactions..."
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm ml-1 text-green-600">+18.7%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Payouts</p>
                <p className="text-2xl font-bold">{formatCurrency(totalPayouts)}</p>
                <p className="text-sm text-muted-foreground">70% of revenue</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                <p className="text-2xl font-bold">{formatCurrency(pendingAmount)}</p>
                <p className="text-sm text-yellow-600">Requires processing</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refund Amount</p>
                <p className="text-2xl font-bold">{formatCurrency(refundAmount)}</p>
                <p className="text-sm text-muted-foreground">
                  {totalRevenue > 0 ? ((refundAmount / totalRevenue) * 100).toFixed(1) : 0}% of revenue
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Payouts Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                  name="Revenue"
                />
                <Area 
                  type="monotone" 
                  dataKey="payouts" 
                  stackId="2"
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                  name="Payouts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Earning Tutors */}
        <Card>
          <CardHeader>
            <CardTitle>Top Earning Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tutorEarnings.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tutorName" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Earnings']} />
                <Bar dataKey="totalEarnings" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethods}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method} ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {paymentMethods.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              {paymentMethods.map((method, index) => (
                <div key={method.method} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{method.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(method.amount)}</p>
                    <p className="text-sm text-muted-foreground">{method.count} transactions</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.slice(0, 15).map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell>{transaction.date}</TableCell>
                  <TableCell className="font-medium">{transaction.tutorName}</TableCell>
                  <TableCell>{transaction.studentName}</TableCell>
                  <TableCell>{transaction.subject}</TableCell>
                  <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                  <TableCell>{transaction.paymentMethod}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transaction.status)}
                      {getStatusBadge(transaction.status)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">Revenue Growth</h4>
              <p className="text-sm text-green-700">
                Monthly revenue increased 18.7% with Mathematics sessions leading the growth.
              </p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">Payment Reliability</h4>
              <p className="text-sm text-blue-700">
                98.5% payment success rate with Credit Card being the most reliable method.
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900">Tutor Performance</h4>
              <p className="text-sm text-yellow-700">
                Top 10 tutors generate 60% of platform revenue with average 4.8★ rating.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
