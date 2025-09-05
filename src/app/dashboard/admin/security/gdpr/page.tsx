"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Search, MoreHorizontal, Eye, Shield, Download, Check, X, FileText, Hash, Calendar, User, Clock } from "lucide-react";

interface GDPRRequest {
  id: string;
  requestId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'Student' | 'Tutor';
  };
  requestType: 'Data Deletion' | 'Data Export' | 'Account Deactivation' | 'Data Access' | 'Data Rectification';
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
  submittedDate: string;
  completedDate?: string;
  adminNotes?: string;
  rejectionReason?: string;
  exportFile?: string;
  priority: 'Low' | 'Medium' | 'High';
}

const mockGDPRRequests: GDPRRequest[] = [
  {
    id: '1',
    requestId: 'GDPR-2024-001',
    user: {
      id: 'user-001',
      name: 'Alex Chen',
      email: 'alex.chen@email.com',
      role: 'Student'
    },
    requestType: 'Data Export',
    description: 'I would like to receive a copy of all my personal data stored in your system.',
    status: 'Completed',
    submittedDate: '2024-03-10',
    completedDate: '2024-03-12',
    adminNotes: 'Data export completed successfully. User data package generated and sent via secure email.',
    exportFile: 'alex_chen_data_export_20240312.zip',
    priority: 'Medium'
  },
  {
    id: '2',
    requestId: 'GDPR-2024-002',
    user: {
      id: 'user-002',
      name: 'Emma Wilson',
      email: 'emma.wilson@email.com',
      role: 'Student'
    },
    requestType: 'Data Deletion',
    description: 'I want to delete my account and all associated personal data permanently.',
    status: 'In Progress',
    submittedDate: '2024-03-14',
    adminNotes: 'Account deletion process initiated. Waiting for final session completion before proceeding.',
    priority: 'High'
  },
  {
    id: '3',
    requestId: 'GDPR-2024-003',
    user: {
      id: 'tutor-001',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'Tutor'
    },
    requestType: 'Account Deactivation',
    description: 'I need to temporarily deactivate my tutor account due to personal reasons.',
    status: 'Pending',
    submittedDate: '2024-03-15',
    priority: 'Medium'
  },
  {
    id: '4',
    requestId: 'GDPR-2024-004',
    user: {
      id: 'user-003',
      name: 'James Smith',
      email: 'james.smith@email.com',
      role: 'Student'
    },
    requestType: 'Data Rectification',
    description: 'There are errors in my profile information that need to be corrected.',
    status: 'Rejected',
    submittedDate: '2024-03-13',
    completedDate: '2024-03-14',
    rejectionReason: 'User can update profile information directly through account settings.',
    adminNotes: 'Guided user to self-service profile update options.',
    priority: 'Low'
  },
  {
    id: '5',
    requestId: 'GDPR-2024-005',
    user: {
      id: 'user-004',
      name: 'Sophie Davis',
      email: 'sophie.davis@email.com',
      role: 'Student'
    },
    requestType: 'Data Access',
    description: 'I want to know what personal data you have about me and how it is being used.',
    status: 'Pending',
    submittedDate: '2024-03-16',
    priority: 'Medium'
  }
];

export default function GDPRCompliancePage() {
  const [requests, setRequests] = useState<GDPRRequest[]>(mockGDPRRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<GDPRRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | 'complete'>('approve');

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(filteredRequests.map(request => request.id));
    } else {
      setSelectedRequests([]);
    }
  };

  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests([...selectedRequests, requestId]);
    } else {
      setSelectedRequests(selectedRequests.filter(id => id !== requestId));
    }
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: 'Pending' | 'In Progress' | 'Completed' | 'Rejected', notes?: string, rejectionReason?: string) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: newStatus,
            ...(notes && { adminNotes: notes }),
            ...(rejectionReason && { rejectionReason }),
            ...(newStatus === 'Completed' || newStatus === 'Rejected' ? { completedDate: new Date().toISOString().split('T')[0] } : {})
          }
        : request
    ));
  };

  const openViewDialog = (request: GDPRRequest) => {
    setCurrentRequest(request);
    setIsViewDialogOpen(true);
  };

  const openProcessDialog = (request: GDPRRequest, action: 'approve' | 'reject' | 'complete') => {
    setCurrentRequest(request);
    setProcessingAction(action);
    setAdminNotes(request.adminNotes || '');
    setRejectionReason(request.rejectionReason || '');
    setIsProcessDialogOpen(true);
  };

  const handleProcessRequest = () => {
    if (!currentRequest) return;

    let newStatus: 'Pending' | 'In Progress' | 'Completed' | 'Rejected';
    switch (processingAction) {
      case 'approve':
        newStatus = 'In Progress';
        break;
      case 'complete':
        newStatus = 'Completed';
        break;
      case 'reject':
        newStatus = 'Rejected';
        break;
      default:
        newStatus = 'Pending';
    }

    handleUpdateRequestStatus(
      currentRequest.id, 
      newStatus, 
      adminNotes, 
      processingAction === 'reject' ? rejectionReason : undefined
    );

    setIsProcessDialogOpen(false);
    setCurrentRequest(null);
    setAdminNotes('');
    setRejectionReason('');
  };

  const handleExportData = (userId: string) => {
    // In a real application, this would trigger data export
    console.log(`Exporting data for user ${userId}`);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'In Progress':
        return 'default';
      case 'Completed':
        return 'default';
      case 'Rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'destructive';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Mock statistics
  const complianceStats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter(r => r.status === 'Pending').length,
    completedRequests: requests.filter(r => r.status === 'Completed').length,
    avgProcessingTime: '2.3 days'
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">GDPR Compliance</h2>
      </div>

      {/* Compliance Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats.totalRequests}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{complianceStats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStats.completedRequests}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{complianceStats.avgProcessingTime}</div>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>GDPR Requests</CardTitle>
          <CardDescription>
            Manage privacy and data protection requests under GDPR and similar regulations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests or users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Data Deletion">Data Deletion</SelectItem>
                <SelectItem value="Data Export">Data Export</SelectItem>
                <SelectItem value="Account Deactivation">Account Deactivation</SelectItem>
                <SelectItem value="Data Access">Data Access</SelectItem>
                <SelectItem value="Data Rectification">Data Rectification</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedRequests.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedRequests.length} request(s) selected
              </span>
              <Button size="sm" variant="outline">
                Mark In Progress
              </Button>
              <Button size="sm" variant="outline">
                <Download className="mr-1 h-3 w-3" />
                Export Selected
              </Button>
            </div>
          )}

          {/* GDPR Requests Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Request ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Request Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onCheckedChange={(checked) => handleSelectRequest(request.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{request.requestId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{request.user.name}</div>
                          <div className="text-xs text-muted-foreground">{request.user.email}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {request.user.role}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.requestType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(request.priority)}>
                        {request.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {request.submittedDate}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(request)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {request.status === 'Pending' && (
                            <>
                              <DropdownMenuItem onClick={() => openProcessDialog(request, 'approve')}>
                                <Check className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openProcessDialog(request, 'reject')}>
                                <X className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status === 'In Progress' && (
                            <DropdownMenuItem onClick={() => openProcessDialog(request, 'complete')}>
                              <Check className="mr-2 h-4 w-4" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          {request.requestType === 'Data Export' && (
                            <DropdownMenuItem onClick={() => handleExportData(request.user.id)}>
                              <Download className="mr-2 h-4 w-4" />
                              Export Data
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            View User Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No GDPR requests found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Request Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>GDPR Request Details</DialogTitle>
          </DialogHeader>
          {currentRequest && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Request ID</Label>
                  <p className="text-sm">{currentRequest.requestId}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge variant={getStatusBadgeVariant(currentRequest.status)} className="w-fit mt-1">
                    {currentRequest.status}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="font-semibold">User Information</Label>
                <div className="mt-1 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{currentRequest.user.name}</p>
                      <p className="text-sm text-muted-foreground">{currentRequest.user.email}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {currentRequest.user.role}
                      </Badge>
                    </div>
                    <Button variant="link" size="sm">View Profile</Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Request Type</Label>
                  <Badge variant="outline" className="w-fit mt-1">
                    {currentRequest.requestType}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Priority</Label>
                  <Badge variant={getPriorityBadgeVariant(currentRequest.priority)} className="w-fit mt-1">
                    {currentRequest.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Request Description</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{currentRequest.description}</p>
                </div>
              </div>

              {currentRequest.adminNotes && (
                <div>
                  <Label className="font-semibold">Admin Notes</Label>
                  <div className="mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm">{currentRequest.adminNotes}</p>
                  </div>
                </div>
              )}

              {currentRequest.rejectionReason && (
                <div>
                  <Label className="font-semibold">Rejection Reason</Label>
                  <div className="mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-sm">{currentRequest.rejectionReason}</p>
                  </div>
                </div>
              )}

              {currentRequest.exportFile && (
                <div>
                  <Label className="font-semibold">Export File</Label>
                  <div className="mt-1 flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{currentRequest.exportFile}</span>
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Submitted Date</Label>
                  <p className="text-sm">{currentRequest.submittedDate}</p>
                </div>
                {currentRequest.completedDate && (
                  <div>
                    <Label className="font-semibold">Completed Date</Label>
                    <p className="text-sm">{currentRequest.completedDate}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Request Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {processingAction === 'approve' && 'Approve Request'}
              {processingAction === 'reject' && 'Reject Request'}
              {processingAction === 'complete' && 'Complete Request'}
            </DialogTitle>
            <DialogDescription>
              {processingAction === 'approve' && 'Mark this request as approved and in progress.'}
              {processingAction === 'reject' && 'Reject this request with a reason.'}
              {processingAction === 'complete' && 'Mark this request as completed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter administrative notes..."
                rows={3}
              />
            </div>
            {processingAction === 'reject' && (
              <div className="grid gap-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleProcessRequest}>
              {processingAction === 'approve' && 'Approve'}
              {processingAction === 'reject' && 'Reject'}
              {processingAction === 'complete' && 'Complete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
