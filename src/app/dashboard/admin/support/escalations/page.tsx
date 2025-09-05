'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Search,
  Filter,
  User,
  UserCheck,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  MessageSquare,
  Calendar,
  Users,
} from 'lucide-react';

interface EscalatedTicket {
  id: string;
  ticketNumber: string;
  originalTicketId: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'tutor';
  };
  originalAgent: {
    id: string;
    name: string;
    email: string;
  };
  issueSummary: string;
  category: string;
  priority: 'high' | 'urgent' | 'critical';
  status: 'pending' | 'assigned' | 'in_review' | 'resolved' | 'closed';
  escalatedAt: string;
  escalatedBy: string;
  escalationReason: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  adminNotes: EscalationNote[];
  resolutionSummary?: string;
  lastUpdated: string;
}

interface EscalationNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  timestamp: string;
  action?: 'assigned' | 'escalated' | 'resolved' | 'note';
}

const PRIORITIES = [
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: 'critical', label: 'Critical', color: 'bg-red-600 text-white' },
];

const STATUSES = [
  { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'assigned', label: 'Assigned', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_review', label: 'In Review', color: 'bg-purple-100 text-purple-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

const ESCALATION_REASONS = [
  'Customer complaint',
  'Technical complexity',
  'Policy violation',
  'Urgent priority',
  'Agent unavailable',
  'Requires management approval',
  'Legal concern',
  'Other'
];

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<EscalatedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showEscalationDetail, setShowEscalationDetail] = useState(false);
  const [selectedEscalation, setSelectedEscalation] = useState<EscalatedTicket | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');

  useEffect(() => {
    fetchEscalations();
  }, []);

  const fetchEscalations = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock escalated tickets data
      const mockEscalations: EscalatedTicket[] = Array.from({ length: 15 }, (_, i) => {
        const priorities: EscalatedTicket['priority'][] = ['high', 'urgent', 'critical'];
        const statuses: EscalatedTicket['status'][] = ['pending', 'assigned', 'in_review', 'resolved', 'closed'];
        const userTypes: ('student' | 'tutor')[] = ['student', 'tutor'];
        
        const escalatedDate = new Date();
        escalatedDate.setDate(escalatedDate.getDate() - Math.floor(Math.random() * 14));
        
        const lastUpdated = new Date(escalatedDate);
        lastUpdated.setHours(lastUpdated.getHours() + Math.floor(Math.random() * 24));

        const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        return {
          id: `escalation-${i + 1}`,
          ticketNumber: `ESC-${String(i + 1).padStart(4, '0')}`,
          originalTicketId: `TKT-${String(i + 100).padStart(4, '0')}`,
          submittedBy: {
            id: `user-${i + 1}`,
            name: userType === 'student' ? `Student ${i + 1}` : `Tutor ${i + 1}`,
            email: `${userType}${i + 1}@example.com`,
            type: userType,
          },
          originalAgent: {
            id: `agent-${i + 1}`,
            name: `Agent ${i + 1}`,
            email: `agent${i + 1}@company.com`,
          },
          issueSummary: [
            'Payment dispute requiring immediate attention',
            'Technical issue affecting multiple users',
            'Account security breach concern',
            'Service quality complaint with refund request',
            'Policy violation investigation needed',
            'System outage impact on sessions',
            'Data privacy compliance issue',
            'Urgent accessibility support needed'
          ][Math.floor(Math.random() * 8)],
          category: ['payment', 'technical', 'security', 'quality', 'policy', 'system', 'privacy', 'accessibility'][Math.floor(Math.random() * 8)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status,
          escalatedAt: escalatedDate.toISOString(),
          escalatedBy: 'Support Manager',
          escalationReason: ESCALATION_REASONS[Math.floor(Math.random() * ESCALATION_REASONS.length)],
          assignedTo: status !== 'pending' ? {
            id: `senior-${i + 1}`,
            name: `Senior Agent ${i + 1}`,
            email: `senior${i + 1}@company.com`,
          } : undefined,
          adminNotes: [
            {
              id: 'note-1',
              adminId: 'admin-1',
              adminName: 'Support Manager',
              note: 'Escalated due to complexity and customer urgency.',
              timestamp: escalatedDate.toISOString(),
              action: 'escalated',
            }
          ],
          resolutionSummary: status === 'resolved' || status === 'closed' ? 'Issue resolved through direct customer contact and policy adjustment.' : undefined,
          lastUpdated: lastUpdated.toISOString(),
        };
      });

      setEscalations(mockEscalations);
    } catch (error) {
      console.error('Error fetching escalations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEscalations = escalations.filter(escalation => {
    const matchesSearch = searchTerm === '' || 
      escalation.issueSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      escalation.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = selectedPriority === 'all' || escalation.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || escalation.status === selectedStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleViewEscalation = (escalation: EscalatedTicket) => {
    setSelectedEscalation(escalation);
    setResolutionSummary(escalation.resolutionSummary || '');
    setShowEscalationDetail(true);
  };

  const handleAddNote = () => {
    if (!selectedEscalation || !adminNote.trim()) return;

    const newNote: EscalationNote = {
      id: `note-${Date.now()}`,
      adminId: 'admin-1',
      adminName: 'Current Admin',
      note: adminNote,
      timestamp: new Date().toISOString(),
      action: 'note',
    };

    setEscalations(prev => prev.map(escalation => 
      escalation.id === selectedEscalation.id 
        ? { 
            ...escalation, 
            adminNotes: [...escalation.adminNotes, newNote],
            lastUpdated: new Date().toISOString()
          }
        : escalation
    ));

    setSelectedEscalation(prev => prev ? {
      ...prev,
      adminNotes: [...prev.adminNotes, newNote],
      lastUpdated: new Date().toISOString()
    } : null);

    setAdminNote('');
  };

  const handleUpdateStatus = (status: EscalatedTicket['status']) => {
    if (!selectedEscalation) return;

    setEscalations(prev => prev.map(escalation => 
      escalation.id === selectedEscalation.id 
        ? { 
            ...escalation, 
            status,
            resolutionSummary: status === 'resolved' || status === 'closed' ? resolutionSummary : undefined,
            lastUpdated: new Date().toISOString()
          }
        : escalation
    ));

    setSelectedEscalation(prev => prev ? {
      ...prev,
      status,
      resolutionSummary: status === 'resolved' || status === 'closed' ? resolutionSummary : undefined,
      lastUpdated: new Date().toISOString()
    } : null);
  };

  const getPriorityBadge = (priority: string) => {
    const config = PRIORITIES.find(p => p.value === priority);
    return <Badge className={config?.color}>{config?.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const config = STATUSES.find(s => s.value === status);
    return <Badge className={config?.color}>{config?.label}</Badge>;
  };

  const getUserTypeBadge = (type: string) => {
    return type === 'student' ? 
      <Badge className="bg-blue-100 text-blue-800">Student</Badge> :
      <Badge className="bg-purple-100 text-purple-800">Tutor</Badge>;
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
          <h1 className="text-3xl font-bold">Escalations</h1>
          <p className="text-muted-foreground">
            Handle priority and unresolved tickets requiring higher-level attention
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchEscalations}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">
                  {escalations.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Review</p>
                <p className="text-2xl font-bold">
                  {escalations.filter(e => e.status === 'in_review').length}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Priority</p>
                <p className="text-2xl font-bold">
                  {escalations.filter(e => e.priority === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold">
                  {escalations.filter(e => e.status === 'resolved' && 
                    new Date(e.lastUpdated).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search escalations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map(priority => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="all">All Status</SelectItem>
                  {STATUSES.map(status => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Escalations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Escalated Tickets ({filteredEscalations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Original Agent</TableHead>
                <TableHead>User Info</TableHead>
                <TableHead>Issue Summary</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Escalated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEscalations.slice(0, 10).map((escalation) => (
                <TableRow key={escalation.id}>
                  <TableCell className="font-medium">{escalation.ticketNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>{escalation.originalAgent.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{escalation.submittedBy.name}</p>
                        {getUserTypeBadge(escalation.submittedBy.type)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{escalation.issueSummary}</TableCell>
                  <TableCell>{getPriorityBadge(escalation.priority)}</TableCell>
                  <TableCell>{getStatusBadge(escalation.status)}</TableCell>
                  <TableCell>{new Date(escalation.escalatedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewEscalation(escalation)}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Review Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleUpdateStatus('assigned')}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Assign Agent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus('resolved')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Mark Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Escalation Detail Dialog */}
      <Dialog open={showEscalationDetail} onOpenChange={setShowEscalationDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Escalation Details - {selectedEscalation?.ticketNumber}
            </DialogTitle>
            <DialogDescription>
              Review and manage escalated support case
            </DialogDescription>
          </DialogHeader>
          
          {selectedEscalation && (
            <div className="space-y-6">
              {/* Escalation Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">Original Ticket</Label>
                  <p className="mt-1">{selectedEscalation.originalTicketId}</p>
                </div>
                <div>
                  <Label className="font-medium">Escalated By</Label>
                  <p className="mt-1">{selectedEscalation.escalatedBy}</p>
                </div>
                <div>
                  <Label className="font-medium">User</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span>{selectedEscalation.submittedBy.name}</span>
                    {getUserTypeBadge(selectedEscalation.submittedBy.type)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Status & Priority</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedEscalation.status)}
                    {getPriorityBadge(selectedEscalation.priority)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Escalation Reason</Label>
                  <p className="mt-1">{selectedEscalation.escalationReason}</p>
                </div>
                <div>
                  <Label className="font-medium">Assigned To</Label>
                  <p className="mt-1">{selectedEscalation.assignedTo?.name || 'Unassigned'}</p>
                </div>
              </div>

              {/* Issue Summary */}
              <div className="space-y-2">
                <Label className="text-lg font-medium">Issue Summary</Label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p>{selectedEscalation.issueSummary}</p>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Admin Notes & History</Label>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-3">
                  {selectedEscalation.adminNotes.map((note) => (
                    <div key={note.id} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{note.adminName}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(note.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1">{note.note}</p>
                      {note.action && (
                        <Badge variant="outline" className="mt-2">
                          {note.action}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Note */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Add Admin Note</Label>
                <Textarea
                  placeholder="Add notes about investigation, resolution steps, or decisions..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleAddNote} disabled={!adminNote.trim()}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>

              {/* Resolution Summary */}
              {(selectedEscalation.status === 'resolved' || selectedEscalation.status === 'closed') && (
                <div className="space-y-4">
                  <Label className="text-lg font-medium">Resolution Summary</Label>
                  <Textarea
                    placeholder="Provide a summary of how this escalation was resolved..."
                    value={resolutionSummary}
                    onChange={(e) => setResolutionSummary(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Status Update Buttons */}
              <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                <Label className="font-medium">Update Status:</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('assigned')}
                  disabled={selectedEscalation.status === 'assigned'}
                >
                  Assign
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('in_review')}
                  disabled={selectedEscalation.status === 'in_review'}
                >
                  In Review
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('resolved')}
                  disabled={selectedEscalation.status === 'resolved'}
                >
                  Resolved
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUpdateStatus('closed')}
                  disabled={selectedEscalation.status === 'closed'}
                >
                  Close
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalationDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
