'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getDisputes, 
  resolveDispute,
  type PaymentDispute, 
  type DisputeFilters,
  type DisputeStatus
} from '@/lib/paymentsData';

type ResolutionAction = 'refund_approved' | 'refund_denied' | 'partial_refund' | 'escalated';
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
  Check,
  X,
  AlertTriangle,
  Clock,
  Shield,
  MessageSquare,
  DollarSign,
  FileText,
  RefreshCw,
  Flag,
  TrendingUp,
  Users
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

export default function PaymentDisputesPage() {
  const [disputes, setDisputes] = useState<PaymentDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDisputes, setTotalDisputes] = useState(0);
  const [stats, setStats] = useState<any>(null);
  
  // Filters
  const [filters, setFilters] = useState<DisputeFilters>({
    studentName: '',
    tutorName: '',
    disputeType: undefined,
    status: undefined,
    priority: undefined,
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: ITEMS_PER_PAGE
  });
  
  // Dialog states
  const [selectedDispute, setSelectedDispute] = useState<PaymentDispute | null>(null);
  const [showDisputeDetail, setShowDisputeDetail] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  
  // Resolution form states
  const [resolutionAction, setResolutionAction] = useState<ResolutionAction>('refund_approved');
  const [resolutionAmount, setResolutionAmount] = useState<number>(0);
  const [resolutionReasoning, setResolutionReasoning] = useState('');
  const [compensationOffered, setCompensationOffered] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [filters.page]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, page: 1 }));
      setCurrentPage(1);
      fetchDisputes();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [
    filters.studentName,
    filters.tutorName,
    filters.disputeType,
    filters.status,
    filters.priority,
    filters.dateFrom,
    filters.dateTo
  ]);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const response = await getDisputes({
        ...filters,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      });
      setDisputes(response.disputes);
      setTotalDisputes(response.total);
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    
    setIsActionLoading(true);
    try {
      const resolution: PaymentDispute['resolution'] = {
        action: resolutionAction,
        amount: resolutionAmount > 0 ? resolutionAmount : undefined,
        reasoning: resolutionReasoning,
        compensationOffered: compensationOffered || undefined
      };
      
      await resolveDispute(selectedDispute.id, resolution, 'admin-001');
      setShowResolveDialog(false);
      resetResolutionForm();
      fetchDisputes();
    } catch (error) {
      console.error('Error resolving dispute:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEscalateDispute = async () => {
    if (!selectedDispute || !escalationReason) return;
    
    setIsActionLoading(true);
    try {
      console.log(`Escalated dispute ${selectedDispute.id}: ${escalationReason}`);
      setShowEscalateDialog(false);
      setEscalationReason('');
      fetchDisputes();
    } catch (error) {
      console.error('Error escalating dispute:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const resetResolutionForm = () => {
    setResolutionAction('refund_approved');
    setResolutionAmount(0);
    setResolutionReasoning('');
    setCompensationOffered('');
  };

  const getStatusBadgeColor = (status: DisputeStatus) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'Resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Escalated': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getPriorityBadgeColor = (priority: PaymentDispute['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDisputeTypeColor = (type: PaymentDispute['disputeType']) => {
    switch (type) {
      case 'refund_request': return 'bg-blue-100 text-blue-800';
      case 'service_issue': return 'bg-red-100 text-red-800';
      case 'billing_error': return 'bg-yellow-100 text-yellow-800';
      case 'fraud_claim': return 'bg-purple-100 text-purple-800';
      case 'quality_issue': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPages = Math.ceil(totalDisputes / ITEMS_PER_PAGE);

  if (loading && disputes.length === 0) {
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
          <h1 className="text-3xl font-bold">Payment Disputes</h1>
          <p className="text-muted-foreground">
            Handle payment disputes and resolution processes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchDisputes} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Open Disputes</p>
                  <p className="text-2xl font-bold">{stats.openDisputes}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Check className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{stats.resolvedDisputes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Disputed Amount</p>
                  <p className="text-2xl font-bold">${stats.totalDisputedAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold">{stats.averageResolutionTime}d</p>
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
              <Label>Dispute Type</Label>
              <Select value={filters.disputeType || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, disputeType: value as PaymentDispute['disputeType'] || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund_request">Refund Request</SelectItem>
                  <SelectItem value="service_issue">Service Issue</SelectItem>
                  <SelectItem value="billing_error">Billing Error</SelectItem>
                  <SelectItem value="fraud_claim">Fraud Claim</SelectItem>
                  <SelectItem value="quality_issue">Quality Issue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={filters.status || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as DisputeStatus || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                  <SelectItem value="Escalated">Escalated</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select value={filters.priority || undefined} onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value as PaymentDispute['priority'] || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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

      {/* Disputes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disputes ({totalDisputes} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Dispute ID</th>
                  <th className="text-left p-4">Created Date</th>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Tutor</th>
                  <th className="text-left p-4">Session</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Priority</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {disputes.map((dispute) => (
                  <tr key={dispute.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <div className="font-mono text-sm">{dispute.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        {new Date(dispute.createdDate).toLocaleDateString()}
                        <div className="text-muted-foreground">
                          {new Date(dispute.createdDate).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{dispute.student.name}</div>
                        <div className="text-sm text-muted-foreground">{dispute.student.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{dispute.tutor.name}</div>
                        <div className="text-sm text-muted-foreground">{dispute.tutor.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      {dispute.sessionId && (
                        <Link
                          href={`/dashboard/admin/sessions/${dispute.sessionId}`}
                          className="text-blue-600 hover:underline font-mono text-sm"
                        >
                          {dispute.sessionId}
                        </Link>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="font-bold">${dispute.amount}</div>
                    </td>
                    <td className="p-4">
                      <Badge className={getDisputeTypeColor(dispute.disputeType)}>
                        {dispute.disputeType.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getPriorityBadgeColor(dispute.priority)}>
                        {dispute.priority}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <Badge className={getStatusBadgeColor(dispute.status)}>
                        {dispute.status}
                      </Badge>
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
                              setSelectedDispute(dispute);
                              setShowDisputeDetail(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {dispute.status === 'Open' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setResolutionAmount(dispute.amount);
                                  setShowResolveDialog(true);
                                }}
                                className="text-green-600"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Resolve Dispute
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedDispute(dispute);
                                  setShowEscalateDialog(true);
                                }}
                                className="text-yellow-600"
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Escalate
                              </DropdownMenuItem>
                            </>
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
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalDisputes)} of {totalDisputes} disputes
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

      {/* Dispute Detail Dialog */}
      <Dialog open={showDisputeDetail} onOpenChange={setShowDisputeDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details - {selectedDispute?.id}</DialogTitle>
          </DialogHeader>
          {selectedDispute && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Student</Label>
                  <p className="font-medium">{selectedDispute.student.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDispute.student.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Tutor</Label>
                  <p className="font-medium">{selectedDispute.tutor.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDispute.tutor.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                  <p className="font-bold text-lg">${selectedDispute.amount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                  <Badge className={getDisputeTypeColor(selectedDispute.disputeType)}>
                    {selectedDispute.disputeType.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                  <Badge className={getPriorityBadgeColor(selectedDispute.priority)}>
                    {selectedDispute.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                  <Badge className={getStatusBadgeColor(selectedDispute.status)}>
                    {selectedDispute.status}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <p className="bg-muted p-3 rounded mt-1">{selectedDispute.description}</p>
              </div>

              {/* Evidence */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Evidence & Documentation</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Student Evidence</h4>
                    <div className="space-y-1">
                      {selectedDispute.evidence.studentEvidence?.map((evidence, index) => (
                        <p key={index} className="text-sm bg-blue-50 p-2 rounded">{evidence}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Tutor Evidence</h4>
                    <div className="space-y-1">
                      {selectedDispute.evidence.tutorEvidence?.map((evidence, index) => (
                        <p key={index} className="text-sm bg-green-50 p-2 rounded">{evidence}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Admin Notes</h4>
                    <div className="space-y-1">
                      {selectedDispute.evidence.adminNotes?.map((note, index) => (
                        <p key={index} className="text-sm bg-gray-50 p-2 rounded">{note}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Timeline</Label>
                <div className="mt-2 space-y-3">
                  {selectedDispute.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3 p-3 bg-muted rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{event.action}</p>
                            <p className="text-sm text-muted-foreground">by {event.performedBy}</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className="text-sm mt-1">{event.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resolution (if resolved) */}
              {selectedDispute.resolution && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Resolution</Label>
                  <div className="bg-green-50 p-4 rounded mt-2">
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-sm font-medium">Action: {selectedDispute.resolution.action.replace('_', ' ')}</p>
                      </div>
                      {selectedDispute.resolution.amount && (
                        <div>
                          <p className="text-sm font-medium">Amount: ${selectedDispute.resolution.amount}</p>
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{selectedDispute.resolution.reasoning}</p>
                    {selectedDispute.resolution.compensationOffered && (
                      <p className="text-sm mt-2">
                        <strong>Compensation:</strong> {selectedDispute.resolution.compensationOffered}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisputeDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dispute Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide resolution for dispute {selectedDispute?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resolution Action</Label>
              <Select value={resolutionAction} onValueChange={(value) => setResolutionAction(value as ResolutionAction)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund_approved">Approve Full Refund</SelectItem>
                  <SelectItem value="partial_refund">Approve Partial Refund</SelectItem>
                  <SelectItem value="refund_denied">Deny Refund</SelectItem>
                  <SelectItem value="escalated">Escalate to Higher Authority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(resolutionAction === 'refund_approved' || resolutionAction === 'partial_refund') && (
              <div>
                <Label>Refund Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  max={selectedDispute?.amount}
                  value={resolutionAmount}
                  onChange={(e) => setResolutionAmount(parseFloat(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Maximum refund: ${selectedDispute?.amount}
                </p>
              </div>
            )}

            <div>
              <Label>Reasoning</Label>
              <Textarea
                placeholder="Explain the reasoning behind this resolution..."
                value={resolutionReasoning}
                onChange={(e) => setResolutionReasoning(e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label>Compensation Offered (Optional)</Label>
              <Input
                placeholder="e.g., Free makeup session, platform credit"
                value={compensationOffered}
                onChange={(e) => setCompensationOffered(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResolveDispute} 
              disabled={!resolutionReasoning || isActionLoading}
            >
              {isActionLoading ? 'Resolving...' : 'Resolve Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dispute Dialog */}
      <AlertDialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Escalate Dispute</AlertDialogTitle>
            <AlertDialogDescription>
              Escalate dispute {selectedDispute?.id} to higher authority
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label>Escalation Reason</Label>
            <Textarea
              placeholder="Explain why this dispute needs escalation..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEscalateDispute}
              disabled={!escalationReason.trim() || isActionLoading}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              {isActionLoading ? 'Escalating...' : 'Escalate Dispute'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
