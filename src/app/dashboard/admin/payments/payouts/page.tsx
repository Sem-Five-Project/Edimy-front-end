'use client';

import { useState, useEffect } from 'react';
import { 
  getPayouts, 
  approvePayout,
  type PayoutRequest, 
  type PayoutFilters,
  type PayoutStatus
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Check,
  X,
  Pause,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  CreditCard,
  Landmark,
  Download,
  TrendingUp
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function TutorPayoutsPage() {
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('requests');
  
  // Filters
  const [filters, setFilters] = useState<PayoutFilters>({
    tutorName: '',
    status: undefined,
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: ITEMS_PER_PAGE
  });
  
  // Dialog states
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [showPayoutDetail, setShowPayoutDetail] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  
  // Form states
  const [rejectReason, setRejectReason] = useState('');
  const [holdReason, setHoldReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchPayouts();
  }, [filters.page, activeTab]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
      setCurrentPage(1);
      fetchPayouts();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    filters.tutorName,
    filters.status,
    filters.dateFrom,
    filters.dateTo
  ]);

  const fetchPayouts = async () => {
    setLoading(true);
    try {
      const statusFilter = activeTab === 'requests' 
        ? 'Pending' as PayoutStatus 
        : activeTab === 'approved' 
        ? 'Approved' as PayoutStatus
        : activeTab === 'completed'
        ? 'Paid' as PayoutStatus
        : filters.status;

      const response = await getPayouts({
        ...filters,
        status: statusFilter,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });
      setPayouts(response.payouts);
      setTotalPayouts(response.total);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async () => {
    if (!selectedPayout) return;
    
    setIsActionLoading(true);
    try {
      await approvePayout(selectedPayout.id, 'admin-001'); // In real app, get from auth context
      setShowApproveDialog(false);
      fetchPayouts();
    } catch (error) {
      console.error('Error approving payout:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectPayout = async () => {
    if (!selectedPayout || !rejectReason) return;
    
    setIsActionLoading(true);
    try {
      // In real implementation, this would call a reject API
      console.log(`Rejected payout ${selectedPayout.id}: ${rejectReason}`);
      setShowRejectDialog(false);
      setRejectReason('');
      fetchPayouts();
    } catch (error) {
      console.error('Error rejecting payout:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleHoldPayout = async () => {
    if (!selectedPayout || !holdReason) return;
    
    setIsActionLoading(true);
    try {
      console.log(`Put payout ${selectedPayout.id} on hold: ${holdReason}`);
      setShowHoldDialog(false);
      setHoldReason('');
      fetchPayouts();
    } catch (error) {
      console.error('Error putting payout on hold:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: PayoutStatus) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'On Hold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Landmark className="w-4 h-4" />;
      case 'paypal': return <CreditCard className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const totalPages = Math.ceil(totalPayouts / ITEMS_PER_PAGE);

  if (loading && payouts.length === 0) {
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
          <h1 className="text-3xl font-bold">Tutor Payouts</h1>
          <p className="text-muted-foreground">
            Manage tutor payment requests and payout processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPayouts} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export History
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Requested</p>
                  <p className="text-2xl font-bold">${stats.totalRequested.toLocaleString()}</p>
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
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold">${stats.approvedAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Paid</p>
                  <p className="text-2xl font-bold">${stats.paidAmount.toLocaleString()}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <Select value={filters.status || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as PayoutStatus || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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

      {/* Payout Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'requests' ? 'Pending Payout Requests' :
                 activeTab === 'approved' ? 'Approved Payouts' :
                 activeTab === 'completed' ? 'Completed Payouts' :
                 'All Payouts'} 
                ({totalPayouts} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Payout ID</th>
                      <th className="text-left p-4">Tutor</th>
                      <th className="text-left p-4">Amount</th>
                      <th className="text-left p-4">Requested Date</th>
                      <th className="text-left p-4">Status</th>
                      <th className="text-left p-4">Payment Method</th>
                      <th className="text-left p-4">Processing Time</th>
                      <th className="text-left p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div className="font-mono text-sm">{payout.id}</div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{payout.tutor.name}</div>
                            <div className="text-sm text-muted-foreground">{payout.tutor.email}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-lg">${payout.amount.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {payout.transactionIds.length} transactions
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {new Date(payout.requestedDate).toLocaleDateString()}
                            <div className="text-muted-foreground">
                              {new Date(payout.requestedDate).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusBadgeColor(payout.status)}>
                            {payout.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(payout.paymentMethod)}
                            <span className="text-sm capitalize">
                              {payout.paymentMethod.replace('_', ' ')}
                            </span>
                          </div>
                          {payout.tutor.bankDetails && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {payout.tutor.bankDetails.bankName} ****{payout.tutor.bankDetails.accountNumber.slice(-4)}
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {payout.actualProcessingTime || payout.estimatedProcessingTime}
                          </div>
                          {payout.processedDate && (
                            <div className="text-xs text-muted-foreground">
                              Processed: {new Date(payout.processedDate).toLocaleDateString()}
                            </div>
                          )}
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
                                  setSelectedPayout(payout);
                                  setShowPayoutDetail(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {payout.status === 'Pending' && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      setShowApproveDialog(true);
                                    }}
                                    className="text-green-600"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve Payout
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      setShowHoldDialog(true);
                                    }}
                                    className="text-yellow-600"
                                  >
                                    <Pause className="w-4 h-4 mr-2" />
                                    Hold Payout
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      setShowRejectDialog(true);
                                    }}
                                    className="text-red-600"
                                  >
                                    <X className="w-4 h-4 mr-2" />
                                    Reject Payout
                                  </DropdownMenuItem>
                                </>
                              )}
                              {payout.status === 'Approved' && (
                                <DropdownMenuItem className="text-green-600">
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Mark as Paid
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
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalPayouts)} of {totalPayouts} payouts
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
        </TabsContent>
      </Tabs>

      {/* Payout Detail Dialog */}
      <Dialog open={showPayoutDetail} onOpenChange={setShowPayoutDetail}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Details - {selectedPayout?.id}</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tutor</Label>
                  <p className="font-medium">{selectedPayout.tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayout.tutor.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="font-bold text-2xl">${selectedPayout.amount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedPayout.status)}>
                    {selectedPayout.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                  <p className="font-medium capitalize">{selectedPayout.paymentMethod.replace('_', ' ')}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Bank Details</Label>
                {selectedPayout.tutor.bankDetails ? (
                  <div className="text-sm space-y-1 bg-muted p-3 rounded">
                    <p>Bank: {selectedPayout.tutor.bankDetails.bankName}</p>
                    <p>Account: ****{selectedPayout.tutor.bankDetails.accountNumber.slice(-4)}</p>
                    <p>Routing: {selectedPayout.tutor.bankDetails.routingNumber}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No bank details available</p>
                )}
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Associated Transactions</Label>
                <div className="text-sm space-y-1">
                  {selectedPayout.transactionIds.map((txId, index) => (
                    <p key={index} className="font-mono">{txId}</p>
                  ))}
                </div>
              </div>

              {selectedPayout.notes && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                  <p className="text-sm bg-muted p-3 rounded">{selectedPayout.notes}</p>
                </div>
              )}

              {selectedPayout.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rejection Reason</Label>
                  <p className="text-sm bg-red-50 p-3 rounded border border-red-200">{selectedPayout.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPayoutDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Payout Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Payout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this payout of ${selectedPayout?.amount.toLocaleString()} 
              to {selectedPayout?.tutor.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApprovePayout}
              disabled={isActionLoading}
              className="bg-green-600 text-white hover:bg-green-700"
            >
              {isActionLoading ? 'Approving...' : 'Approve Payout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Payout Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payout</AlertDialogTitle>
            <AlertDialogDescription>
              Reject payout request for {selectedPayout?.tutor.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label>Rejection Reason</Label>
            <Textarea
              placeholder="Enter reason for rejection..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectPayout}
              disabled={!rejectReason.trim() || isActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isActionLoading ? 'Rejecting...' : 'Reject Payout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hold Payout Dialog */}
      <Dialog open={showHoldDialog} onOpenChange={setShowHoldDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hold Payout</DialogTitle>
            <DialogDescription>
              Put payout request on hold for {selectedPayout?.tutor.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Reason for Hold</Label>
              <Textarea
                placeholder="Enter reason for putting payout on hold..."
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHoldDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleHoldPayout} 
              disabled={!holdReason.trim() || isActionLoading}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isActionLoading ? 'Processing...' : 'Hold Payout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
