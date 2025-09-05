'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getTransactions, 
  updateTransactionStatus,
  processRefund,
  exportTransactions,
  type TransactionData, 
  type TransactionFilters,
  type TransactionStatus,
  type TransactionType
} from '@/lib/paymentsData';
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
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [stats, setStats] = useState<any>(null);
  
  // Filters
  const [filters, setFilters] = useState<TransactionFilters>({
    studentName: '',
    tutorName: '',
    transactionId: '',
    status: undefined,
    type: undefined,
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: ITEMS_PER_PAGE
  });
  
  // Dialog states
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionData | null>(null);
  const [showTransactionDetail, setShowTransactionDetail] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Form states
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [newStatus, setNewStatus] = useState<TransactionStatus>('Paid');
  const [statusNotes, setStatusNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [filters.page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
      setCurrentPage(1);
      fetchTransactions();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    filters.studentName,
    filters.tutorName,
    filters.transactionId,
    filters.status,
    filters.type,
    filters.dateFrom,
    filters.dateTo
  ]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getTransactions({
        ...filters,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });
      setTransactions(response.transactions);
      setTotalTransactions(response.total);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedTransaction || !refundAmount || !refundReason) return;
    
    setIsActionLoading(true);
    try {
      await processRefund(selectedTransaction.id, refundAmount, refundReason);
      setShowRefundDialog(false);
      setRefundAmount(0);
      setRefundReason('');
      fetchTransactions();
    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedTransaction) return;
    
    setIsActionLoading(true);
    try {
      await updateTransactionStatus(selectedTransaction.id, newStatus, statusNotes);
      setShowStatusDialog(false);
      setStatusNotes('');
      fetchTransactions();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleExport = async () => {
    setIsActionLoading(true);
    try {
      const csvContent = await exportTransactions({
        studentName: filters.studentName || undefined,
        tutorName: filters.tutorName || undefined,
        status: filters.status,
        type: filters.type,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      setShowExportDialog(false);
    } catch (error) {
      console.error('Error exporting transactions:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: TransactionStatus) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeColor = (type: TransactionType) => {
    switch (type) {
      case 'session_payment': return 'bg-blue-100 text-blue-800';
      case 'refund': return 'bg-red-100 text-red-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      case 'commission': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalTransactions / ITEMS_PER_PAGE);

  if (loading && transactions.length === 0) {
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
          <h1 className="text-3xl font-bold">All Transactions</h1>
          <p className="text-muted-foreground">
            Monitor and manage all payment transactions on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTransactions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowExportDialog(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">${stats.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">${stats.paidAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">${stats.pendingAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingDown className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Refunded</p>
                  <p className="text-2xl font-bold">${stats.refundedAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <div>
              <Label>Transaction ID</Label>
              <Input
                placeholder="Search by ID..."
                value={filters.transactionId}
                onChange={(e) => setFilters(prev => ({ ...prev, transactionId: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Student Name</Label>
              <Input
                placeholder="Search student..."
                value={filters.studentName}
                onChange={(e) => setFilters(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Tutor Name</Label>
              <Input
                placeholder="Search tutor..."
                value={filters.tutorName}
                onChange={(e) => setFilters(prev => ({ ...prev, tutorName: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={filters.status || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as TransactionStatus || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Type</Label>
              <Select value={filters.type || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as TransactionType || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="session_payment">Session Payment</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({totalTransactions} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Transaction ID</th>
                  <th className="text-left p-4">Date & Time</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Tutor</th>
                  <th className="text-left p-4">Session ID</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Payment Method</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-mono text-sm">{transaction.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                        <div className="text-muted-foreground">
                          {new Date(transaction.transactionDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{transaction.student.name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.student.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{transaction.tutor.name}</div>
                        <div className="text-sm text-muted-foreground">{transaction.tutor.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {transaction.sessionId && (
                        <Link
                          href={`/dashboard/admin/sessions/${transaction.sessionId}`}
                          className="text-blue-600 hover:underline font-mono text-sm"
                        >
                          {transaction.sessionId}
                        </Link>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold">${transaction.amount}</div>
                      <div className="text-sm text-muted-foreground">
                        Fee: ${transaction.platformFee.toFixed(2)}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getTypeColor(transaction.type)}>
                        {transaction.type.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(transaction.status)}>
                        {transaction.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm capitalize">
                          {transaction.paymentMethod.replace('_', ' ')}
                        </span>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {transaction.status === 'Paid' && (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setRefundAmount(transaction.amount);
                                setShowRefundDialog(true);
                              }}
                            >
                              <TrendingDown className="w-4 h-4 mr-2" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setNewStatus(transaction.status);
                              setShowStatusDialog(true);
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Update Status
                          </DropdownMenuItem>
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
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalTransactions)} of {totalTransactions} transactions
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(currentPage - 1);
                    setFilters(prev => ({ ...prev, page: currentPage - 1 }));
                  }}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(currentPage + 1);
                    setFilters(prev => ({ ...prev, page: currentPage + 1 }));
                  }}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={showTransactionDetail} onOpenChange={setShowTransactionDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details - {selectedTransaction?.id}</DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student</Label>
                  <p className="font-medium">{selectedTransaction.student.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.student.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tutor</Label>
                  <p className="font-medium">{selectedTransaction.tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedTransaction.tutor.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="font-bold text-lg">${selectedTransaction.amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Commission</Label>
                  <p className="font-medium">${selectedTransaction.commission.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Net Amount</Label>
                  <p className="font-medium">${selectedTransaction.netAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedTransaction.status)}>
                    {selectedTransaction.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize">{selectedTransaction.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="font-medium">{selectedTransaction.description}</p>
              </div>

              {selectedTransaction.metadata && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Session Details</Label>
                  <div className="text-sm space-y-1">
                    {selectedTransaction.metadata.sessionTitle && (
                      <p>Title: {selectedTransaction.metadata.sessionTitle}</p>
                    )}
                    {selectedTransaction.metadata.subject && (
                      <p>Subject: {selectedTransaction.metadata.subject}</p>
                    )}
                    {selectedTransaction.metadata.duration && (
                      <p>Duration: {selectedTransaction.metadata.duration} minutes</p>
                    )}
                  </div>
                </div>
              )}

              {selectedTransaction.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Admin Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTransactionDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <AlertDialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Process a refund for transaction {selectedTransaction?.id}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Refund Amount</Label>
              <Input
                type="number"
                step="0.01"
                max={selectedTransaction?.amount}
                value={refundAmount}
                onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Maximum refund: ${selectedTransaction?.amount}
              </p>
            </div>
            <div>
              <Label>Reason</Label>
              <Textarea
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRefund}
              disabled={!refundAmount || !refundReason || isActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isActionLoading ? 'Processing...' : 'Process Refund'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription>
              Update the status for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as TransactionStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add notes about this status change..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={isActionLoading}>
              {isActionLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <DialogDescription>
              Export transaction data with current filters applied. The file will be downloaded as a CSV.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Export Summary</h4>
              <div className="text-sm space-y-1">
                <div>Total Transactions: {totalTransactions}</div>
                {filters.dateFrom && <div>From: {filters.dateFrom}</div>}
                {filters.dateTo && <div>To: {filters.dateTo}</div>}
                {filters.status && <div>Status: {filters.status}</div>}
                {filters.type && <div>Type: {filters.type}</div>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isActionLoading}>
              {isActionLoading ? 'Exporting...' : 'Export CSV'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
