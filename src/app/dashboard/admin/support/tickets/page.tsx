'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
  Send,
  Paperclip,
  User,
  MessageCircle,
  RefreshCw,
  Archive,
  FileText,
  Calendar,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  submittedBy: {
    id: string;
    name: string;
    email: string;
    type: 'student' | 'tutor';
    avatar?: string;
  };
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  lastUpdated: string;
  description: string;
  messages: TicketMessage[];
  assignedAgent?: string;
}

interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  message: string;
  timestamp: string;
  attachments?: string[];
}

const CATEGORIES = [
  { value: 'technical', label: 'Technical Issue' },
  { value: 'payment', label: 'Payment & Billing' },
  { value: 'booking', label: 'Session Booking' },
  { value: 'account', label: 'Account Issues' },
  { value: 'quality', label: 'Session Quality' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];

const STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-green-100 text-green-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'resolved', label: 'Resolved', color: 'bg-blue-100 text-blue-800' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' },
];

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState<string[]>([]);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock support tickets data
      const mockTickets: SupportTicket[] = Array.from({ length: 20 }, (_, i) => {
        const priorities: SupportTicket['priority'][] = ['low', 'medium', 'high', 'urgent'];
        const statuses: SupportTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed'];
        const categories = ['technical', 'payment', 'booking', 'account', 'quality', 'other'];
        const userTypes: ('student' | 'tutor')[] = ['student', 'tutor'];
        
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30));
        
        const lastUpdated = new Date(createdDate);
        lastUpdated.setHours(lastUpdated.getHours() + Math.floor(Math.random() * 48));

        const userType = userTypes[Math.floor(Math.random() * userTypes.length)];
        
        return {
          id: `ticket-${i + 1}`,
          ticketNumber: `TKT-${String(i + 1).padStart(4, '0')}`,
          submittedBy: {
            id: `user-${i + 1}`,
            name: userType === 'student' ? `Student ${i + 1}` : `Tutor ${i + 1}`,
            email: `${userType}${i + 1}@example.com`,
            type: userType,
          },
          subject: [
            'Unable to join session',
            'Payment not processed',
            'Video quality issues',
            'Account locked',
            'Refund request',
            'Technical difficulties',
            'Session not showing in dashboard',
            'Email notifications not working'
          ][Math.floor(Math.random() * 8)],
          category: categories[Math.floor(Math.random() * categories.length)],
          priority: priorities[Math.floor(Math.random() * priorities.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          createdAt: createdDate.toISOString(),
          lastUpdated: lastUpdated.toISOString(),
          description: 'I am experiencing issues with the platform. Could you please help me resolve this?',
          messages: [
            {
              id: 'msg-1',
              senderId: `user-${i + 1}`,
              senderName: userType === 'student' ? `Student ${i + 1}` : `Tutor ${i + 1}`,
              senderType: 'user',
              message: 'I am experiencing issues with the platform. Could you please help me resolve this?',
              timestamp: createdDate.toISOString(),
            }
          ],
          assignedAgent: Math.random() > 0.5 ? 'Admin User' : undefined,
        };
      });

      setTickets(mockTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || ticket.category === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
  };

  const handleCloseTicket = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId ? { ...ticket, status: 'closed' as const } : ticket
    ));
  };

  const handleBulkClose = () => {
    setTickets(prev => prev.map(ticket => 
      selectedTickets.includes(ticket.id) ? { ...ticket, status: 'closed' as const } : ticket
    ));
    setSelectedTickets([]);
  };

  const handleSendResponse = () => {
    if (!selectedTicket || !responseMessage.trim()) return;

    const newMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'admin-1',
      senderName: 'Admin Support',
      senderType: 'admin',
      message: responseMessage,
      timestamp: new Date().toISOString(),
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            messages: [...ticket.messages, newMessage],
            status: 'in_progress' as const,
            lastUpdated: new Date().toISOString()
          }
        : ticket
    ));

    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      status: 'in_progress' as const,
      lastUpdated: new Date().toISOString()
    } : null);

    setResponseMessage('');
  };

  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(ticket => ticket.id));
    }
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
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage student and tutor support requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTickets}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {selectedTickets.length > 0 && (
            <Button onClick={handleBulkClose}>
              <Archive className="w-4 h-4 mr-2" />
              Close Selected ({selectedTickets.length})
            </Button>
          )}
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
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="all">All Categories</SelectItem>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Ticket #</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.slice(0, 10).map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTickets.includes(ticket.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedTickets(prev => [...prev, ticket.id]);
                        } else {
                          setSelectedTickets(prev => prev.filter(id => id !== ticket.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <div>
                        <p className="font-medium">{ticket.submittedBy.name}</p>
                        <div className="flex items-center gap-1">
                          {getUserTypeBadge(ticket.submittedBy.type)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORIES.find(c => c.value === ticket.category)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                  <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                  <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(ticket.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewTicket(ticket)}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleCloseTicket(ticket.id)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Close Ticket
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

      {/* Ticket Detail Dialog */}
      <Dialog open={showTicketDetail} onOpenChange={setShowTicketDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Ticket Details - {selectedTicket?.ticketNumber}
            </DialogTitle>
            <DialogDescription>
              Support conversation and ticket management
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="font-medium">Submitted By</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" />
                    <span>{selectedTicket.submittedBy.name}</span>
                    {getUserTypeBadge(selectedTicket.submittedBy.type)}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTicket.submittedBy.email}</p>
                </div>
                <div>
                  <Label className="font-medium">Ticket Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                </div>
                <div>
                  <Label className="font-medium">Category</Label>
                  <p className="mt-1">{CATEGORIES.find(c => c.value === selectedTicket.category)?.label}</p>
                </div>
                <div>
                  <Label className="font-medium">Created</Label>
                  <p className="mt-1">{new Date(selectedTicket.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Conversation</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderType === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm font-medium">{message.senderName}</p>
                        <p className="mt-1">{message.message}</p>
                        <p className="text-xs mt-2 opacity-75">
                          {new Date(message.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Response Form */}
              <div className="space-y-4">
                <Label className="text-lg font-medium">Send Response</Label>
                <Textarea
                  placeholder="Type your response here..."
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSendResponse} disabled={!responseMessage.trim()}>
                    <Send className="w-4 h-4 mr-2" />
                    Send Response
                  </Button>
                  <Button variant="outline">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Attach File
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTicketDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
