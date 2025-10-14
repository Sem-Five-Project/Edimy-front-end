'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
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
} from 'recharts';
import {
  Mail,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  AlertTriangle,
  Shield,
  Settings,
  RefreshCw,
  Download,
  Filter,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Globe,
  Key,
  Bell,
} from 'lucide-react';

interface EmailStats {
  totalSent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  spamReports: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  spamRate: number;
}

interface EmailActivity {
  id: string;
  email: string;
  template: string;
  status: 'delivered' | 'bounced' | 'opened' | 'clicked' | 'spam' | 'unsubscribed';
  timestamp: string;
  subject: string;
  bounceReason?: string;
}

interface DomainStatus {
  domain: string;
  status: 'verified' | 'pending' | 'failed';
  type: 'sending' | 'tracking';
  lastChecked: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  lastResponse: number;
}

interface TrendData {
  date: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function SendGridDashboardPage() {
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [activities, setActivities] = useState<EmailActivity[]>([]);
  const [domains, setDomains] = useState<DomainStatus[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    fetchSendGridData();
  }, [selectedTimeframe]);

  const fetchSendGridData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock email statistics
      const mockStats: EmailStats = {
        totalSent: 15847,
        delivered: 15234,
        opened: 8456,
        clicked: 2134,
        bounced: 413,
        spamReports: 23,
        unsubscribed: 67,
        openRate: 55.5,
        clickRate: 13.5,
        bounceRate: 2.6,
        spamRate: 0.1,
      };

      // Mock email activity
      const mockActivities: EmailActivity[] = Array.from({ length: 20 }, (_, i) => {
        const statuses: EmailActivity['status'][] = ['delivered', 'bounced', 'opened', 'clicked', 'spam'];
        const templates = ['Session Confirmation', 'Payment Receipt', 'Welcome Email', 'Password Reset', 'Newsletter'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const timestamp = new Date();
        timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 48));
        
        return {
          id: `activity-${i + 1}`,
          email: `user${i + 1}@example.com`,
          template: templates[Math.floor(Math.random() * templates.length)],
          status,
          timestamp: timestamp.toISOString(),
          subject: 'Your session has been confirmed',
          bounceReason: status === 'bounced' ? 'Invalid email address' : undefined,
        };
      });

      // Mock domain status
      const mockDomains: DomainStatus[] = [
        {
          domain: 'mail.eduplatform.com',
          status: 'verified',
          type: 'sending',
          lastChecked: '2024-01-15T10:00:00Z',
        },
        {
          domain: 'eduplatform.com',
          status: 'verified',
          type: 'tracking',
          lastChecked: '2024-01-15T10:00:00Z',
        },
        {
          domain: 'test.eduplatform.com',
          status: 'pending',
          type: 'sending',
          lastChecked: '2024-01-15T09:30:00Z',
        },
      ];

      // Mock webhook configurations
      const mockWebhooks: WebhookConfig[] = [
        {
          id: 'webhook-1',
          url: 'https://api.eduplatform.com/webhooks/sendgrid',
          events: ['delivered', 'opened', 'clicked', 'bounced'],
          status: 'active',
          lastResponse: 200,
        },
        {
          id: 'webhook-2',
          url: 'https://analytics.eduplatform.com/email-events',
          events: ['spam_report', 'unsubscribe'],
          status: 'active',
          lastResponse: 200,
        },
      ];

      // Mock trend data
      const mockTrendData: TrendData[] = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sent: Math.floor(Math.random() * 1000) + 500,
          delivered: Math.floor(Math.random() * 900) + 450,
          opened: Math.floor(Math.random() * 400) + 200,
          clicked: Math.floor(Math.random() * 100) + 50,
          bounced: Math.floor(Math.random() * 50) + 10,
        };
      });

      setStats(mockStats);
      setActivities(mockActivities);
      setDomains(mockDomains);
      setWebhooks(mockWebhooks);
      setTrendData(mockTrendData);
      setApiKey('SG.****************************');
    } catch (error) {
      console.error('Error fetching SendGrid data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = searchTerm === '' || 
      activity.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.template.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || activity.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case 'opened':
        return <Badge className="bg-blue-100 text-blue-800">Opened</Badge>;
      case 'clicked':
        return <Badge className="bg-purple-100 text-purple-800">Clicked</Badge>;
      case 'bounced':
        return <Badge className="bg-red-100 text-red-800">Bounced</Badge>;
      case 'spam':
        return <Badge className="bg-orange-100 text-orange-800">Spam</Badge>;
      case 'unsubscribed':
        return <Badge className="bg-gray-100 text-gray-800">Unsubscribed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDomainStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleUpdateApiKey = () => {
    setApiKey(newApiKey);
    setNewApiKey('');
    setShowApiKeyDialog(false);
  };

  const pieChartData = stats ? [
    { name: 'Delivered', value: stats.delivered, color: '#00C49F' },
    { name: 'Opened', value: stats.opened, color: '#0088FE' },
    { name: 'Clicked', value: stats.clicked, color: '#FFBB28' },
    { name: 'Bounced', value: stats.bounced, color: '#FF8042' },
    { name: 'Spam', value: stats.spamReports, color: '#8884D8' },
  ] : [];

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
          <h1 className="text-3xl font-bold">SendGrid Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor email delivery, statistics, and configuration
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchSendGridData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Email Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                  <p className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm ml-1 text-green-600">+12.5%</span>
                  </div>
                </div>
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                  <p className="text-2xl font-bold">{stats.openRate}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm ml-1 text-green-600">+2.1%</span>
                  </div>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                  <p className="text-2xl font-bold">{stats.clickRate}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm ml-1 text-red-600">-0.8%</span>
                  </div>
                </div>
                <MousePointer className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bounce Rate</p>
                  <p className="text-2xl font-bold">{stats.bounceRate}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm ml-1 text-green-600">-0.3%</span>
                  </div>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="statistics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="space-y-6">
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Email Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Email Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sent" stroke="#8884d8" strokeWidth={2} name="Sent" />
                    <Line type="monotone" dataKey="delivered" stroke="#82ca9d" strokeWidth={2} name="Delivered" />
                    <Line type="monotone" dataKey="opened" stroke="#ffc658" strokeWidth={2} name="Opened" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Email Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Email Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Email Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Delivered</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.delivered.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Opened</p>
                    <p className="text-2xl font-bold text-green-600">{stats.opened.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900">Clicked</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.clicked.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-900">Bounced</p>
                    <p className="text-2xl font-bold text-red-600">{stats.bounced.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Activity Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by email or template..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="clicked">Clicked</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                      <SelectItem value="spam">Spam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Email Activity ({filteredActivities.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.slice(0, 10).map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell className="font-medium">{activity.email}</TableCell>
                      <TableCell>{activity.template}</TableCell>
                      <TableCell>{getStatusBadge(activity.status)}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        {activity.bounceReason && (
                          <span className="text-sm text-red-600">{activity.bounceReason}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuration" className="space-y-6">
          {/* API Key Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Key Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Current API Key</Label>
                  <div className="flex gap-2 mt-2">
                    <Input value={apiKey} readOnly className="font-mono" />
                    <Button onClick={() => setShowApiKeyDialog(true)}>
                      <Settings className="w-4 h-4 mr-2" />
                      Update
                    </Button>
                  </div>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertTitle>Security Note</AlertTitle>
                  <AlertDescription>
                    Keep your API key secure and never share it publicly. Rotate it regularly for enhanced security.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Domain Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Domain Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Domain</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {domains.map((domain) => (
                    <TableRow key={domain.domain}>
                      <TableCell className="font-medium">{domain.domain}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {domain.type === 'sending' ? 'Sending' : 'Tracking'}
                        </Badge>
                      </TableCell>
                      <TableCell>{getDomainStatusBadge(domain.status)}</TableCell>
                      <TableCell>{new Date(domain.lastChecked).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Webhook Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Webhook Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Response</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-mono text-sm max-w-xs truncate">
                        {webhook.url}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {webhook.status === 'active' ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                          <Badge className={webhook.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {webhook.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={webhook.lastResponse === 200 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {webhook.lastResponse}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-2" />
                          Configure
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {/* Alert Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Delivery Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">High Bounce Rate Alert</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when bounce rate exceeds 5%
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Spam Report Alert</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when spam reports exceed 0.5%
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Delivery Failure Alert</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when delivery rate drops below 95%
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Volume Spike Alert</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when send volume increases by 200%
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Webhook Failure Alert</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when webhooks fail to respond
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Domain Issues Alert</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when domain verification fails
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>High Bounce Rate Detected</AlertTitle>
                  <AlertDescription>
                    Bounce rate has increased to 6.2% in the last hour. Consider reviewing your email list.
                    <span className="text-xs text-muted-foreground ml-2">2 hours ago</span>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Domain Verification Successful</AlertTitle>
                  <AlertDescription>
                    Domain mail.eduplatform.com has been successfully verified for sending.
                    <span className="text-xs text-muted-foreground ml-2">1 day ago</span>
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Webhook Response Delay</AlertTitle>
                  <AlertDescription>
                    Webhook endpoint is responding slowly (avg 5.2s). Consider optimizing your endpoint.
                    <span className="text-xs text-muted-foreground ml-2">2 days ago</span>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* API Key Update Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update SendGrid API Key</DialogTitle>
            <DialogDescription>
              Enter your new SendGrid API key. Make sure it has the necessary permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newApiKey">New API Key</Label>
              <Input
                id="newApiKey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="SG...."
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApiKeyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateApiKey}>
              Update API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
