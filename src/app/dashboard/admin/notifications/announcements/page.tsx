"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Megaphone,
  Plus,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  RefreshCw,
  Send,
  Clock,
  Users,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  audience: "students" | "tutors" | "both";
  status: "active" | "scheduled" | "expired" | "draft";
  createdDate: string;
  scheduledDate?: string;
  expiryDate?: string;
  createdBy: string;
  sentCount?: number;
  deliveryStatus?: {
    sent: number;
    delivered: number;
    opened: number;
    failed: number;
  };
}

const AUDIENCE_OPTIONS = [
  { value: "students", label: "Students Only", icon: Users },
  { value: "tutors", label: "Tutors Only", icon: GraduationCap },
  { value: "both", label: "Students & Tutors", icon: Users },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState<
    Announcement[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] =
    useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    audience: "both" as Announcement["audience"],
    scheduledDate: "",
    expiryDate: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    filterAnnouncements();
  }, [announcements, searchTerm, selectedAudience, selectedStatus]);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockAnnouncements: Announcement[] = [
        {
          id: "announcement-1",
          title: "Platform Maintenance Scheduled",
          message:
            "We will be performing scheduled maintenance on our platform this Sunday from 2 AM to 6 AM EST. During this time, the platform will be temporarily unavailable. We apologize for any inconvenience and appreciate your understanding.",
          audience: "both",
          status: "active",
          createdDate: "2024-01-15",
          scheduledDate: "2024-01-20",
          expiryDate: "2024-01-21",
          createdBy: "Admin",
          sentCount: 1456,
          deliveryStatus: {
            sent: 1456,
            delivered: 1432,
            opened: 1089,
            failed: 24,
          },
        },
        {
          id: "announcement-2",
          title: "New Subject Categories Available",
          message:
            "We are excited to announce the addition of new subject categories including Advanced Mathematics, Computer Programming, and Language Arts. Tutors can now update their profiles to include these new subjects.",
          audience: "tutors",
          status: "active",
          createdDate: "2024-01-12",
          createdBy: "Admin",
          sentCount: 156,
          deliveryStatus: {
            sent: 156,
            delivered: 154,
            opened: 132,
            failed: 2,
          },
        },
        {
          id: "announcement-3",
          title: "Student Referral Program Launch",
          message:
            "Refer a friend and get $10 credit! Our new referral program allows students to earn credits for every successful referral. Share your unique referral code and start earning today.",
          audience: "students",
          status: "scheduled",
          createdDate: "2024-01-10",
          scheduledDate: "2024-01-25",
          createdBy: "Marketing Team",
        },
        {
          id: "announcement-4",
          title: "Holiday Schedule Updates",
          message:
            "Please note that our customer support hours will be modified during the upcoming holiday season. Support will be available from 9 AM to 5 PM EST instead of our regular 24/7 service.",
          audience: "both",
          status: "expired",
          createdDate: "2023-12-20",
          expiryDate: "2024-01-05",
          createdBy: "Support Team",
          sentCount: 2341,
          deliveryStatus: {
            sent: 2341,
            delivered: 2298,
            opened: 1876,
            failed: 43,
          },
        },
        {
          id: "announcement-5",
          title: "New Payment Methods Available",
          message:
            "We now accept Apple Pay and Google Pay for all transactions. Update your payment preferences in your account settings to take advantage of these convenient payment options.",
          audience: "both",
          status: "draft",
          createdDate: "2024-01-08",
          createdBy: "Product Team",
        },
      ];

      setAnnouncements(mockAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAnnouncements = () => {
    let filtered = announcements;

    if (searchTerm) {
      filtered = filtered.filter(
        (announcement) =>
          announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          announcement.message.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedAudience !== "all") {
      filtered = filtered.filter(
        (announcement) => announcement.audience === selectedAudience,
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (announcement) => announcement.status === selectedStatus,
      );
    }

    setFilteredAnnouncements(filtered);
  };

  const handleCreateAnnouncement = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      message: "",
      audience: "both",
      scheduledDate: "",
      expiryDate: "",
    });
    setShowCreateDialog(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      audience: announcement.audience,
      scheduledDate: announcement.scheduledDate || "",
      expiryDate: announcement.expiryDate || "",
    });
    setShowCreateDialog(true);
  };

  const handleSaveAnnouncement = () => {
    if (editingAnnouncement) {
      // Update existing announcement
      setAnnouncements((prev) =>
        prev.map((announcement) =>
          announcement.id === editingAnnouncement.id
            ? {
                ...announcement,
                ...formData,
                status: formData.scheduledDate
                  ? "scheduled"
                  : ("draft" as Announcement["status"]),
              }
            : announcement,
        ),
      );
    } else {
      // Create new announcement
      const newAnnouncement: Announcement = {
        id: `announcement-${Date.now()}`,
        ...formData,
        status: formData.scheduledDate ? "scheduled" : "draft",
        createdDate: new Date().toISOString().split("T")[0],
        createdBy: "Admin",
      };
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
    }
    setShowCreateDialog(false);
  };

  const handlePublishAnnouncement = (announcementId: string) => {
    setAnnouncements((prev) =>
      prev.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              status: "active" as Announcement["status"],
              sentCount: Math.floor(Math.random() * 1000) + 500,
              deliveryStatus: {
                sent: Math.floor(Math.random() * 1000) + 500,
                delivered: Math.floor(Math.random() * 950) + 450,
                opened: Math.floor(Math.random() * 800) + 300,
                failed: Math.floor(Math.random() * 50) + 5,
              },
            }
          : announcement,
      ),
    );
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    setAnnouncements((prev) =>
      prev.filter((announcement) => announcement.id !== announcementId),
    );
  };

  const handleViewAnnouncement = (announcement: Announcement) => {
    setViewingAnnouncement(announcement);
    setShowViewDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800">Expired</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAudienceBadge = (audience: string) => {
    const audienceConfig = AUDIENCE_OPTIONS.find((a) => a.value === audience);
    const IconComponent = audienceConfig?.icon || Users;

    return (
      <div className="flex items-center gap-1">
        <IconComponent className="w-4 h-4" />
        <span>{audienceConfig?.label || audience}</span>
      </div>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "scheduled":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case "draft":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
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
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">
            Create and manage system-wide announcements for users
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleCreateAnnouncement}>
            <Plus className="w-4 h-4 mr-2" />
            Create Announcement
          </Button>
          <Button variant="outline" onClick={fetchAnnouncements}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Announcements
                </p>
                <p className="text-2xl font-bold">{announcements.length}</p>
              </div>
              <Megaphone className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">
                  {announcements.filter((a) => a.status === "active").length}
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
                <p className="text-sm font-medium text-muted-foreground">
                  Scheduled
                </p>
                <p className="text-2xl font-bold">
                  {announcements.filter((a) => a.status === "scheduled").length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sent
                </p>
                <p className="text-2xl font-bold">
                  {announcements
                    .reduce((sum, a) => sum + (a.sentCount || 0), 0)
                    .toLocaleString()}
                </p>
              </div>
              <Send className="w-8 h-8 text-purple-600" />
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
              <Label htmlFor="search">Search Announcements</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="audience">Audience</Label>
              <Select
                value={selectedAudience}
                onValueChange={setSelectedAudience}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="all">All Audiences</SelectItem>
                  {AUDIENCE_OPTIONS.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      {audience.label}
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
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5" />
            Announcements ({filteredAnnouncements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead>Sent Count</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAnnouncements.map((announcement) => (
                <TableRow key={announcement.id}>
                  <TableCell className="font-medium max-w-xs">
                    <div className="truncate" title={announcement.title}>
                      {announcement.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAudienceBadge(announcement.audience)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(announcement.status)}
                      {getStatusBadge(announcement.status)}
                    </div>
                  </TableCell>
                  <TableCell>{announcement.createdDate}</TableCell>
                  <TableCell>{announcement.scheduledDate || "-"}</TableCell>
                  <TableCell>
                    {announcement.sentCount?.toLocaleString() || "-"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white dark:bg-gray-800 border shadow-lg"
                      >
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleViewAnnouncement(announcement)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditAnnouncement(announcement)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {(announcement.status === "draft" ||
                          announcement.status === "scheduled") && (
                          <DropdownMenuItem
                            onClick={() =>
                              handlePublishAnnouncement(announcement.id)
                            }
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Publish Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            handleDeleteAnnouncement(announcement.id)
                          }
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

      {/* Create/Edit Announcement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement
                ? "Edit Announcement"
                : "Create New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update your announcement"
                : "Create a new announcement for your users"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter announcement title"
              />
            </div>
            <div>
              <Label htmlFor="audience">Audience</Label>
              <Select
                value={formData.audience}
                onValueChange={(value: Announcement["audience"]) =>
                  setFormData((prev) => ({ ...prev, audience: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map((audience) => (
                    <SelectItem key={audience.value} value={audience.value}>
                      <div className="flex items-center gap-2">
                        <audience.icon className="w-4 h-4" />
                        {audience.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Enter announcement message..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledDate">Schedule Date (Optional)</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      scheduledDate: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAnnouncement}>
              {editingAnnouncement ? "Update" : "Create"} Announcement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Announcement Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Announcement Details</DialogTitle>
            <DialogDescription>
              View announcement information and delivery statistics
            </DialogDescription>
          </DialogHeader>
          {viewingAnnouncement && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <p className="font-medium">{viewingAnnouncement.title}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(viewingAnnouncement.status)}
                    {getStatusBadge(viewingAnnouncement.status)}
                  </div>
                </div>
                <div>
                  <Label>Audience</Label>
                  <div className="mt-1">
                    {getAudienceBadge(viewingAnnouncement.audience)}
                  </div>
                </div>
                <div>
                  <Label>Created By</Label>
                  <p className="font-medium">{viewingAnnouncement.createdBy}</p>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-wrap">
                    {viewingAnnouncement.message}
                  </p>
                </div>
              </div>

              {viewingAnnouncement.deliveryStatus && (
                <div>
                  <Label>Delivery Statistics</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {viewingAnnouncement.deliveryStatus.sent}
                      </p>
                      <p className="text-sm text-blue-600">Sent</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {viewingAnnouncement.deliveryStatus.delivered}
                      </p>
                      <p className="text-sm text-green-600">Delivered</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        {viewingAnnouncement.deliveryStatus.opened}
                      </p>
                      <p className="text-sm text-purple-600">Opened</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {viewingAnnouncement.deliveryStatus.failed}
                      </p>
                      <p className="text-sm text-red-600">Failed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
