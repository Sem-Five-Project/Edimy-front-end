'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Plus,
  MoreHorizontal,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
  HelpCircle,
  CheckCircle,
  XCircle,
  Calendar,
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastUpdated: string;
  createdBy: string;
  viewCount: number;
  helpfulVotes: number;
  order: number;
}

const FAQ_CATEGORIES = [
  { value: 'booking', label: 'Session Booking' },
  { value: 'payment', label: 'Payment & Billing' },
  { value: 'technical', label: 'Technical Support' },
  { value: 'account', label: 'Account Management' },
  { value: 'quality', label: 'Session Quality' },
  { value: 'policies', label: 'Policies & Terms' },
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
];

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock FAQ data
      const mockFAQs: FAQ[] = [
        {
          id: 'faq-1',
          question: 'How do I book a tutoring session?',
          answer: 'To book a tutoring session, go to your dashboard, browse available tutors, select your preferred time slot, and click "Book Now". You can pay securely through our payment system.',
          category: 'booking',
          status: 'active',
          createdAt: '2024-01-10T10:00:00Z',
          lastUpdated: '2024-01-15T14:30:00Z',
          createdBy: 'Admin User',
          viewCount: 156,
          helpfulVotes: 23,
          order: 1,
        },
        {
          id: 'faq-2',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway.',
          category: 'payment',
          status: 'active',
          createdAt: '2024-01-12T09:00:00Z',
          lastUpdated: '2024-01-12T09:00:00Z',
          createdBy: 'Admin User',
          viewCount: 89,
          helpfulVotes: 15,
          order: 2,
        },
        {
          id: 'faq-3',
          question: 'Can I cancel or reschedule a session?',
          answer: 'Yes, you can cancel or reschedule a session up to 24 hours before the scheduled time. To do this, go to your bookings in the dashboard and select the appropriate option.',
          category: 'booking',
          status: 'active',
          createdAt: '2024-01-08T16:00:00Z',
          lastUpdated: '2024-01-20T11:15:00Z',
          createdBy: 'Support Manager',
          viewCount: 134,
          helpfulVotes: 28,
          order: 3,
        },
        {
          id: 'faq-4',
          question: 'How do I reset my password?',
          answer: 'Click on "Forgot Password" on the login page, enter your email address, and you will receive a password reset link. Follow the instructions in the email to create a new password.',
          category: 'account',
          status: 'active',
          createdAt: '2024-01-05T13:00:00Z',
          lastUpdated: '2024-01-18T10:45:00Z',
          createdBy: 'Tech Support',
          viewCount: 67,
          helpfulVotes: 12,
          order: 4,
        },
        {
          id: 'faq-5',
          question: 'What should I do if I experience technical issues during a session?',
          answer: 'If you experience technical issues, first check your internet connection. If the problem persists, try refreshing the page or rejoining the session. Contact our technical support team if issues continue.',
          category: 'technical',
          status: 'active',
          createdAt: '2024-01-14T11:30:00Z',
          lastUpdated: '2024-01-14T11:30:00Z',
          createdBy: 'Tech Support',
          viewCount: 45,
          helpfulVotes: 8,
          order: 5,
        },
        {
          id: 'faq-6',
          question: 'How do I become a tutor on the platform?',
          answer: 'To become a tutor, click "Apply as Tutor" on our homepage, complete the application form, upload your credentials, and wait for our verification process. This typically takes 2-3 business days.',
          category: 'getting-started',
          status: 'inactive',
          createdAt: '2024-01-03T14:20:00Z',
          lastUpdated: '2024-01-16T16:30:00Z',
          createdBy: 'HR Team',
          viewCount: 203,
          helpfulVotes: 45,
          order: 6,
        }
      ];

      setFaqs(mockFAQs);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || faq.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateFAQ = () => {
    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: formData.question,
      answer: formData.answer,
      category: formData.category,
      status: formData.status,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      createdBy: 'Current Admin',
      viewCount: 0,
      helpfulVotes: 0,
      order: faqs.length + 1,
    };

    setFaqs(prev => [newFaq, ...prev]);
    setFormData({ question: '', answer: '', category: '', status: 'active' });
    setShowCreateDialog(false);
  };

  const handleEditFAQ = () => {
    if (!selectedFaq) return;

    setFaqs(prev => prev.map(faq => 
      faq.id === selectedFaq.id 
        ? { 
            ...faq, 
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            status: formData.status,
            lastUpdated: new Date().toISOString()
          }
        : faq
    ));

    setShowEditDialog(false);
    setSelectedFaq(null);
  };

  const handleDeleteFAQ = (faqId: string) => {
    setFaqs(prev => prev.filter(faq => faq.id !== faqId));
  };

  const handleToggleStatus = (faqId: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === faqId 
        ? { ...faq, status: faq.status === 'active' ? 'inactive' as const : 'active' as const }
        : faq
    ));
  };

  const openEditDialog = (faq: FAQ) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      status: faq.status,
    });
    setShowEditDialog(true);
  };

  const openPreviewDialog = (faq: FAQ) => {
    setSelectedFaq(faq);
    setShowPreviewDialog(true);
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800">Active</Badge> :
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = FAQ_CATEGORIES.find(c => c.value === category);
    return <Badge variant="outline">{categoryConfig?.label || category}</Badge>;
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
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-muted-foreground">
            Manage help content for students and tutors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchFAQs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create FAQ
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total FAQs</p>
                <p className="text-2xl font-bold">{faqs.length}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active FAQs</p>
                <p className="text-2xl font-bold">
                  {faqs.filter(f => f.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {faqs.reduce((sum, faq) => sum + faq.viewCount, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">
                  {new Set(faqs.map(f => f.category)).size}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
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
                  placeholder="Search FAQs..."
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
                  {FAQ_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Table */}
      <Card>
        <CardHeader>
          <CardTitle>FAQs ({filteredFAQs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Helpful</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFAQs.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell className="max-w-md">
                    <p className="font-medium truncate">{faq.question}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {faq.answer.substring(0, 100)}...
                    </p>
                  </TableCell>
                  <TableCell>{getCategoryBadge(faq.category)}</TableCell>
                  <TableCell>{getStatusBadge(faq.status)}</TableCell>
                  <TableCell>{faq.viewCount.toLocaleString()}</TableCell>
                  <TableCell>{faq.helpfulVotes}</TableCell>
                  <TableCell>{new Date(faq.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openPreviewDialog(faq)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(faq)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(faq.id)}>
                          {faq.status === 'active' ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteFAQ(faq.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Create FAQ Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New FAQ</DialogTitle>
            <DialogDescription>
              Add a new frequently asked question to help users
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter the question..."
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the detailed answer..."
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  {FAQ_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFAQ}
              disabled={!formData.question || !formData.answer || !formData.category}
            >
              Create FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the FAQ question and answer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question</Label>
              <Input
                id="edit-question"
                placeholder="Enter the question..."
                value={formData.question}
                onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Answer</Label>
              <Textarea
                id="edit-answer"
                placeholder="Enter the detailed answer..."
                value={formData.answer}
                onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                rows={5}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  {FAQ_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'inactive' }))}
              />
              <Label htmlFor="edit-status">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFAQ}>
              Update FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview FAQ Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>FAQ Preview</DialogTitle>
            <DialogDescription>
              How this FAQ will appear to users
            </DialogDescription>
          </DialogHeader>
          
          {selectedFaq && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryBadge(selectedFaq.category)}
                {getStatusBadge(selectedFaq.status)}
              </div>
              
              <Accordion type="single" defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    {selectedFaq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="prose max-w-none">
                      <p>{selectedFaq.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex items-center justify-between text-sm text-muted-foreground p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedFaq.viewCount} views
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {selectedFaq.helpfulVotes} helpful
                  </span>
                </div>
                <span>Updated: {new Date(selectedFaq.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
