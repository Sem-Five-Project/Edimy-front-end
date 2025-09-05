"use client";
import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/contexts/ThemeContext';

// Mock data for payment history
const mockPayments = [
  {
    id: '1',
    tutorName: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    date: '2023-05-15',
    amount: 60.00,
    status: 'completed',
    paymentMethod: 'Credit Card',
    transactionId: 'txn_1234567890'
  },
  {
    id: '2',
    tutorName: 'Prof. Michael Chen',
    subject: 'Physics',
    date: '2023-05-10',
    amount: 70.00,
    status: 'completed',
    paymentMethod: 'PayPal',
    transactionId: 'txn_0987654321'
  },
  {
    id: '3',
    tutorName: 'Dr. Emily Wilson',
    subject: 'Chemistry',
    date: '2023-05-05',
    amount: 45.00,
    status: 'refunded',
    paymentMethod: 'Credit Card',
    transactionId: 'txn_1122334455'
  },
  {
    id: '4',
    tutorName: 'Dr. Robert Brown',
    subject: 'Computer Science',
    date: '2023-04-28',
    amount: 80.00,
    status: 'completed',
    paymentMethod: 'Credit Card',
    transactionId: 'txn_5566778899'
  },
  {
    id: '5',
    tutorName: 'Dr. Lisa Anderson',
    subject: 'Mathematics',
    date: '2023-04-20',
    amount: 60.00,
    status: 'completed',
    paymentMethod: 'PayPal',
    transactionId: 'txn_9988776655'
  },
  {
    id: '6',
    tutorName: 'Dr. James Miller',
    subject: 'Physics',
    date: '2023-04-15',
    amount: 75.00,
    status: 'failed',
    paymentMethod: 'Credit Card',
    transactionId: 'txn_4433221100'
  }
];

const PaymentHistoryPage = () => {
  const { actualTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter payments based on search and filters
  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          payment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'refunded':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Refunded</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Pending</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const exportToCSV = () => {
    // Simple CSV export functionality
    const headers = ['Date', 'Tutor', 'Subject', 'Amount', 'Status', 'Payment Method', 'Transaction ID'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        payment.date,
        payment.tutorName,
        payment.subject,
        formatCurrency(payment.amount).replace('$', ''),
        payment.status,
        payment.paymentMethod,
        payment.transactionId
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'payment_history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen ${actualTheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Payment History</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Profile
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(mockPayments
                      .filter(p => p.status === 'completed')
                      .reduce((sum, payment) => sum + payment.amount, 0)
                    )}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed Payments</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {mockPayments.filter(p => p.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Refunded</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-white">
                    {formatCurrency(mockPayments
                      .filter(p => p.status === 'refunded')
                      .reduce((sum, payment) => sum + payment.amount, 0)
                    )}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by tutor name, subject, or transaction ID..."
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
                    <SelectItem value="refunded">Refunded</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="30">Last 30 Days</SelectItem>
                    <SelectItem value="90">Last 90 Days</SelectItem>
                    <SelectItem value="365">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <div className="space-y-4">
          {paginatedPayments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">No payments found</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                        <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Tutor & Subject</th>
                        <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Amount</th>
                        <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                        <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Payment Method</th>
                        <th className="text-left p-4 font-medium text-gray-600 dark:text-gray-400">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedPayments.map((payment) => (
                        <tr 
                          key={payment.id} 
                          className={`border-b ${actualTheme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}
                        >
                          <td className="p-4 text-gray-800 dark:text-white">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              {new Date(payment.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-gray-800 dark:text-white">{payment.tutorName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{payment.subject}</div>
                          </td>
                          <td className="p-4 font-medium text-gray-800 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="p-4">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">
                            {payment.paymentMethod}
                          </td>
                          <td className="p-4 text-gray-600 dark:text-gray-400">
                            {payment.transactionId}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
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

export default PaymentHistoryPage;