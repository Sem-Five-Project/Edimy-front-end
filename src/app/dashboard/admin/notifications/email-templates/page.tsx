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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Mail,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Copy,
  CheckCircle,
  XCircle,
  Settings,
  FileText,
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  type: 'booking' | 'reminder' | 'cancellation' | 'payment' | 'welcome' | 'verification' | 'support';
  subject: string;
  body: string;
  status: 'active' | 'inactive';
  lastModified: string;
  createdBy: string;
  usageCount: number;
}

const TEMPLATE_TYPES = [
  { value: 'booking', label: 'Booking Confirmation' },
  { value: 'reminder', label: 'Session Reminder' },
  { value: 'cancellation', label: 'Cancellation Notice' },
  { value: 'payment', label: 'Payment Confirmation' },
  { value: 'welcome', label: 'Welcome Email' },
  { value: 'verification', label: 'Account Verification' },
  { value: 'support', label: 'Support Response' },
];

const MERGE_FIELDS = [
  '{{student_name}}',
  '{{tutor_name}}',
  '{{session_date}}',
  '{{session_time}}',
  '{{subject}}',
  '{{amount}}',
  '{{platform_name}}',
  '{{support_email}}',
  '{{verification_link}}',
  '{{session_link}}',
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'booking' as EmailTemplate['type'],
    subject: '',
    body: '',
    status: 'active' as EmailTemplate['status'],
  });

  useEffect(() => {
    fetchEmailTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedType, selectedStatus]);

  const fetchEmailTemplates = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTemplates: EmailTemplate[] = [
        {
          id: 'template-1',
          name: 'Session Booking Confirmation',
          type: 'booking',
          subject: 'Your tutoring session has been confirmed - \{\{session_date\}\}',
          body: `Dear \{\{student_name\}\},

Your tutoring session has been successfully booked!

Session Details:
- Tutor: \{\{tutor_name\}\}
- Subject: \{\{subject\}\}
- Date: \{\{session_date\}\}
- Time: \{\{session_time\}\}

Join your session: \{\{session_link\}\}

Best regards,
\{\{platform_name\}\} Team`,
          status: 'active',
          lastModified: '2024-01-15',
          createdBy: 'Admin',
          usageCount: 1250,
        },
        {
          id: 'template-2',
          name: 'Session Reminder - 24 Hours',
          type: 'reminder',
          subject: 'Reminder: Your session with \{\{tutor_name\}\} is tomorrow',
          body: `Hi \{\{student_name\}\},

This is a friendly reminder that you have a tutoring session scheduled for tomorrow.

Session Details:
- Tutor: \{\{tutor_name\}\}
- Subject: \{\{subject\}\}
- Date: \{\{session_date\}\}
- Time: \{\{session_time\}\}

Don't forget to join: \{\{session_link\}\}

See you tomorrow!
\{\{platform_name\}\} Team`,
          status: 'active',
          lastModified: '2024-01-10',
          createdBy: 'Admin',
          usageCount: 890,
        },
        {
          id: 'template-3',
          name: 'Payment Confirmation',
          type: 'payment',
          subject: 'Payment confirmation for your session - $\{\{amount\}\}',
          body: `Dear \{\{student_name\}\},

Your payment has been successfully processed.

Payment Details:
- Amount: $\{\{amount\}\}
- Session: \{\{subject\}\} with \{\{tutor_name\}\}
- Date: \{\{session_date\}\}

Thank you for using \{\{platform_name\}\}!

Best regards,
Support Team`,
          status: 'active',
          lastModified: '2024-01-08',
          createdBy: 'Admin',
          usageCount: 567,
        },
        {
          id: 'template-4',
          name: 'Session Cancellation Notice',
          type: 'cancellation',
          subject: 'Your session has been cancelled',
          body: `Dear \{\{student_name\}\},

We regret to inform you that your session has been cancelled.

Cancelled Session:
- Tutor: \{\{tutor_name\}\}
- Subject: \{\{subject\}\}
- Originally scheduled: \{\{session_date\}\} at \{\{session_time\}\}

If this was a paid session, your refund will be processed within 3-5 business days.

For any questions, contact us at \{\{support_email\}\}.

\{\{platform_name\}\} Team`,
          status: 'active',
          lastModified: '2024-01-05',
          createdBy: 'Admin',
          usageCount: 234,
        },
        {
          id: 'template-5',
          name: 'Welcome New Student',
          type: 'welcome',
          subject: 'Welcome to \{\{platform_name\}\} - Start learning today!',
          body: `Welcome \{\{student_name\}\}!

Thank you for joining \{\{platform_name\}\}. We're excited to help you achieve your learning goals.

Getting Started:
1. Complete your profile
2. Browse our expert tutors
3. Book your first session

Need help? Contact us at \{\{support_email\}\}.

Happy learning!
\{\{platform_name\}\} Team`,
          status: 'inactive',
          lastModified: '2024-01-01',
          createdBy: 'Admin',
          usageCount: 123,
        },
      ];

      setTemplates(mockTemplates);
    } catch (error) {
      console.error('Error fetching email templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(template => template.type === selectedType);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(template => template.status === selectedStatus);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      type: 'booking',
      subject: '',
      body: '',
      status: 'active',
    });
    setShowCreateDialog(true);
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      body: template.body,
      status: template.status,
    });
    setShowCreateDialog(true);
  };

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      // Update existing template
      setTemplates(prev => prev.map(template => 
        template.id === editingTemplate.id 
          ? { ...template, ...formData, lastModified: new Date().toISOString().split('T')[0] }
          : template
      ));
    } else {
      // Create new template
      const newTemplate: EmailTemplate = {
        id: `template-${Date.now()}`,
        ...formData,
        lastModified: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        usageCount: 0,
      };
      setTemplates(prev => [newTemplate, ...prev]);
    }
    setShowCreateDialog(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  const handlePreview = (template: EmailTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleBulkStatusChange = (status: 'active' | 'inactive') => {
    setTemplates(prev => prev.map(template => 
      selectedTemplates.includes(template.id) 
        ? { ...template, status, lastModified: new Date().toISOString().split('T')[0] }
        : template
    ));
    setSelectedTemplates([]);
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([]);
    } else {
      setSelectedTemplates(filteredTemplates.map(template => template.id));
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? 
      <Badge className="bg-green-100 text-green-800">Active</Badge> :
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = TEMPLATE_TYPES.find(t => t.value === type);
    return <Badge variant="outline">{typeConfig?.label || type}</Badge>;
  };

  const insertMergeField = (field: string) => {
    setFormData(prev => ({
      ...prev,
      body: prev.body + field
    }));
  };

  const renderPreview = (template: EmailTemplate) => {
    const sampleData = {
      '{{student_name}}': 'John Doe',
      '{{tutor_name}}': 'Jane Smith',
      '{{session_date}}': 'January 20, 2024',
      '{{session_time}}': '2:00 PM',
      '{{subject}}': 'Mathematics',
      '{{amount}}': '50',
      '{{platform_name}}': 'EduPlatform',
      '{{support_email}}': 'support@eduplatform.com',
      '{{verification_link}}': 'https://eduplatform.com/verify',
      '{{session_link}}': 'https://eduplatform.com/session/join',
    };

    let previewSubject = template.subject;
    let previewBody = template.body;

    Object.entries(sampleData).forEach(([key, value]) => {
      previewSubject = previewSubject.replace(new RegExp(key, 'g'), value);
      previewBody = previewBody.replace(new RegExp(key, 'g'), value);
    });

    return { subject: previewSubject, body: previewBody };
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
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">
            Manage email templates for notifications and communications
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
          <Button variant="outline" onClick={fetchEmailTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
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
              <Label htmlFor="search">Search Templates</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or subject..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Template Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="all">All Types</SelectItem>
                  {TEMPLATE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
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
            <div>
              <Label>Bulk Actions</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={selectedTemplates.length === 0}
                  onClick={() => handleBulkStatusChange('active')}
                >
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={selectedTemplates.length === 0}
                  onClick={() => handleBulkStatusChange('inactive')}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Templates ({filteredTemplates.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selectedTemplates.length === filteredTemplates.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTemplates.includes(template.id)}
                      onCheckedChange={() => handleSelectTemplate(template.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>{getTypeBadge(template.type)}</TableCell>
                  <TableCell className="max-w-xs truncate">{template.subject}</TableCell>
                  <TableCell>{getStatusBadge(template.status)}</TableCell>
                  <TableCell>{template.usageCount.toLocaleString()}</TableCell>
                  <TableCell>{template.lastModified}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handlePreview(template)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteTemplate(template.id)}
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

      {/* Create/Edit Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? 'Update your email template' : 'Create a new email template for notifications'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="templateType">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: EmailTemplate['type']) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="templateStatus">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: EmailTemplate['status']) => 
                      setFormData(prev => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <Label htmlFor="body">Email Body</Label>
                <Textarea
                  id="body"
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Enter email content..."
                  rows={12}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Merge Fields</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Click to insert merge fields into your template
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {MERGE_FIELDS.map(field => (
                    <Button
                      key={field}
                      variant="outline"
                      size="sm"
                      onClick={() => insertMergeField(field)}
                      className="justify-start text-xs"
                    >
                      {field}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Email Preview</DialogTitle>
            <DialogDescription>
              Preview how the email will look with sample data
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="font-semibold mb-2">Subject:</div>
                <div>{renderPreview(previewTemplate).subject}</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold mb-2">Email Body:</div>
                <div className="whitespace-pre-wrap text-sm">
                  {renderPreview(previewTemplate).body}
                </div>
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
