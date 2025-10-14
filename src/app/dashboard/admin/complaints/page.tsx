"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  AlertTriangle,
  X,
  User,
  Calendar,
  Hash,
} from "lucide-react";

interface Complaint {
  id: string;
  complaintId: string;
  submittedBy: {
    name: string;
    id: string;
    type: "Student" | "Tutor";
  };
  against: {
    name: string;
    id: string;
    type: "Student" | "Tutor";
  };
  issueType: string;
  description: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High" | "Critical";
  dateSubmitted: string;
  lastUpdated: string;
  adminResponse?: string;
  resolution?: string;
  resolutionType?: "Refund" | "Warning" | "Suspension" | "No Action";
  responses: Array<{
    id: string;
    author: string;
    authorType: "Admin" | "User";
    message: string;
    timestamp: string;
  }>;
}

const ISSUE_TYPES = [
  "Payment Dispute",
  "Inappropriate Behavior",
  "Session Quality",
  "Technical Issues",
  "Cancellation Issues",
  "Billing Problem",
  "Harassment",
  "Other",
];

const mockComplaints: Complaint[] = [
  {
    id: "1",
    complaintId: "CMP-2024-001",
    submittedBy: { name: "Alex Chen", id: "student-001", type: "Student" },
    against: { name: "Dr. Sarah Johnson", id: "tutor-001", type: "Tutor" },
    issueType: "Session Quality",
    description:
      "The tutor was consistently late and unprepared for sessions. I feel like I wasted my money.",
    status: "In Progress",
    priority: "Medium",
    dateSubmitted: "2024-03-15",
    lastUpdated: "2024-03-16",
    responses: [
      {
        id: "1",
        author: "Alex Chen",
        authorType: "User",
        message:
          "The tutor was consistently late and unprepared for sessions. I feel like I wasted my money.",
        timestamp: "2024-03-15 10:30",
      },
      {
        id: "2",
        author: "Admin Support",
        authorType: "Admin",
        message:
          "Thank you for reporting this issue. We are investigating the matter and will contact the tutor for their response.",
        timestamp: "2024-03-16 09:15",
      },
    ],
  },
  {
    id: "2",
    complaintId: "CMP-2024-002",
    submittedBy: { name: "Dr. Lisa Garcia", id: "tutor-003", type: "Tutor" },
    against: { name: "James Smith", id: "student-003", type: "Student" },
    issueType: "Inappropriate Behavior",
    description:
      "Student was disrespectful and used inappropriate language during the session.",
    status: "Resolved",
    priority: "High",
    dateSubmitted: "2024-03-14",
    lastUpdated: "2024-03-15",
    resolution: "Warning issued to student",
    resolutionType: "Warning",
    responses: [
      {
        id: "1",
        author: "Dr. Lisa Garcia",
        authorType: "User",
        message:
          "Student was disrespectful and used inappropriate language during the session.",
        timestamp: "2024-03-14 14:20",
      },
      {
        id: "2",
        author: "Admin Support",
        authorType: "Admin",
        message:
          "We have reviewed the session recording and will issue a warning to the student.",
        timestamp: "2024-03-15 11:30",
      },
    ],
  },
  {
    id: "3",
    complaintId: "CMP-2024-003",
    submittedBy: { name: "Emma Wilson", id: "student-002", type: "Student" },
    against: { name: "Prof. Michael Brown", id: "tutor-002", type: "Tutor" },
    issueType: "Payment Dispute",
    description:
      "I was charged for a session that the tutor cancelled at the last minute.",
    status: "Open",
    priority: "Medium",
    dateSubmitted: "2024-03-13",
    lastUpdated: "2024-03-13",
    responses: [
      {
        id: "1",
        author: "Emma Wilson",
        authorType: "User",
        message:
          "I was charged for a session that the tutor cancelled at the last minute.",
        timestamp: "2024-03-13 16:45",
      },
    ],
  },
  {
    id: "4",
    complaintId: "CMP-2024-004",
    submittedBy: { name: "Sophie Davis", id: "student-004", type: "Student" },
    against: { name: "Prof. David Lee", id: "tutor-004", type: "Tutor" },
    issueType: "Harassment",
    description: "The tutor made inappropriate personal comments and requests.",
    status: "In Progress",
    priority: "Critical",
    dateSubmitted: "2024-03-12",
    lastUpdated: "2024-03-14",
    responses: [
      {
        id: "1",
        author: "Sophie Davis",
        authorType: "User",
        message: "The tutor made inappropriate personal comments and requests.",
        timestamp: "2024-03-12 19:30",
      },
      {
        id: "2",
        author: "Admin Manager",
        authorType: "Admin",
        message:
          "This is a serious allegation. We are conducting a full investigation and have temporarily suspended the tutor.",
        timestamp: "2024-03-14 08:00",
      },
    ],
  },
];

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>(mockComplaints);
  const [searchTerm, setSearchTerm] = useState("");
  const [issueTypeFilter, setIssueTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedComplaints, setSelectedComplaints] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [currentComplaint, setCurrentComplaint] = useState<Complaint | null>(
    null,
  );
  const [responseMessage, setResponseMessage] = useState("");
  const [resolutionType, setResolutionType] = useState<string>("");

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.submittedBy.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      complaint.against.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIssueType =
      issueTypeFilter === "all" || complaint.issueType === issueTypeFilter;
    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || complaint.priority === priorityFilter;

    return (
      matchesSearch && matchesIssueType && matchesStatus && matchesPriority
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComplaints(
        filteredComplaints.map((complaint) => complaint.id),
      );
    } else {
      setSelectedComplaints([]);
    }
  };

  const handleSelectComplaint = (complaintId: string, checked: boolean) => {
    if (checked) {
      setSelectedComplaints([...selectedComplaints, complaintId]);
    } else {
      setSelectedComplaints(
        selectedComplaints.filter((id) => id !== complaintId),
      );
    }
  };

  const handleBulkClose = () => {
    setComplaints(
      complaints.map((complaint) =>
        selectedComplaints.includes(complaint.id)
          ? {
              ...complaint,
              status: "Closed" as const,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : complaint,
      ),
    );
    setSelectedComplaints([]);
  };

  const handleBulkEscalate = () => {
    setComplaints(
      complaints.map((complaint) =>
        selectedComplaints.includes(complaint.id)
          ? {
              ...complaint,
              priority: "Critical" as const,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : complaint,
      ),
    );
    setSelectedComplaints([]);
  };

  const handleUpdateStatus = (
    complaintId: string,
    newStatus: "Open" | "In Progress" | "Resolved" | "Closed",
  ) => {
    setComplaints(
      complaints.map((complaint) =>
        complaint.id === complaintId
          ? {
              ...complaint,
              status: newStatus,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : complaint,
      ),
    );
  };

  const openViewDialog = (complaint: Complaint) => {
    setCurrentComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const openResponseDialog = (complaint: Complaint) => {
    setCurrentComplaint(complaint);
    setResponseMessage("");
    setResolutionType("");
    setIsResponseDialogOpen(true);
  };

  const handleSendResponse = () => {
    if (!currentComplaint || !responseMessage.trim()) return;

    const newResponse = {
      id: Date.now().toString(),
      author: "Admin Support",
      authorType: "Admin" as const,
      message: responseMessage,
      timestamp: new Date().toLocaleString(),
    };

    const updatedComplaint = {
      ...currentComplaint,
      responses: [...currentComplaint.responses, newResponse],
      lastUpdated: new Date().toISOString().split("T")[0],
      status:
        resolutionType && resolutionType !== "none"
          ? ("Resolved" as const)
          : ("In Progress" as const),
      ...(resolutionType &&
        resolutionType !== "none" && {
          resolution: responseMessage,
          resolutionType: resolutionType as
            | "Refund"
            | "Warning"
            | "Suspension"
            | "No Action",
        }),
    };

    setComplaints(
      complaints.map((complaint) =>
        complaint.id === currentComplaint.id ? updatedComplaint : complaint,
      ),
    );

    setIsResponseDialogOpen(false);
    setCurrentComplaint(null);
    setResponseMessage("");
    setResolutionType("");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Open":
        return "destructive";
      case "In Progress":
        return "secondary";
      case "Resolved":
        return "default";
      case "Closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "destructive";
      case "High":
        return "secondary";
      case "Medium":
        return "outline";
      case "Low":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Complaint Management
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Complaints & Disputes</CardTitle>
          <CardDescription>
            Handle user complaints and dispute resolution for students and
            tutors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={issueTypeFilter} onValueChange={setIssueTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Issue Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Issue Types</SelectItem>
                {ISSUE_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedComplaints.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedComplaints.length} complaint(s) selected
              </span>
              <Button size="sm" onClick={handleBulkClose}>
                <X className="mr-1 h-3 w-3" />
                Close
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkEscalate}
              >
                <AlertTriangle className="mr-1 h-3 w-3" />
                Escalate
              </Button>
            </div>
          )}

          {/* Complaints Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedComplaints.length ===
                          filteredComplaints.length &&
                        filteredComplaints.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Complaint ID</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Against</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComplaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedComplaints.includes(complaint.id)}
                        onCheckedChange={(checked) =>
                          handleSelectComplaint(
                            complaint.id,
                            checked as boolean,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {complaint.complaintId}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {complaint.submittedBy.name}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {complaint.submittedBy.type}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {complaint.against.name}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {complaint.against.type}
                          </Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{complaint.issueType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getPriorityBadgeVariant(complaint.priority)}
                      >
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(complaint.status)}>
                        {complaint.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {complaint.dateSubmitted}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
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
                            onClick={() => openViewDialog(complaint)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openResponseDialog(complaint)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Respond
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(complaint.id, "In Progress")
                            }
                          >
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(complaint.id, "Resolved")
                            }
                          >
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateStatus(complaint.id, "Closed")
                            }
                          >
                            Close Complaint
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredComplaints.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No complaints found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Complaint Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
          </DialogHeader>
          {currentComplaint && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Complaint ID</Label>
                  <p className="text-sm">{currentComplaint.complaintId}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant={getStatusBadgeVariant(currentComplaint.status)}
                    className="w-fit mt-1"
                  >
                    {currentComplaint.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Submitted By</Label>
                  <p className="text-sm">{currentComplaint.submittedBy.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {currentComplaint.submittedBy.type}
                  </Badge>
                  <br />
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 text-xs"
                  >
                    View Profile
                  </Button>
                </div>
                <div>
                  <Label className="font-semibold">Against</Label>
                  <p className="text-sm">{currentComplaint.against.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {currentComplaint.against.type}
                  </Badge>
                  <br />
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 text-xs"
                  >
                    View Profile
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Issue Type</Label>
                  <Badge variant="outline" className="w-fit mt-1">
                    {currentComplaint.issueType}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Priority</Label>
                  <Badge
                    variant={getPriorityBadgeVariant(currentComplaint.priority)}
                    className="w-fit mt-1"
                  >
                    {currentComplaint.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Complaint Description</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{currentComplaint.description}</p>
                </div>
              </div>

              {currentComplaint.resolution && (
                <div>
                  <Label className="font-semibold">Resolution</Label>
                  <div className="mt-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="default">
                        {currentComplaint.resolutionType}
                      </Badge>
                    </div>
                    <p className="text-sm">{currentComplaint.resolution}</p>
                  </div>
                </div>
              )}

              <div>
                <Label className="font-semibold">Conversation Thread</Label>
                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                  {currentComplaint.responses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg ${
                        response.authorType === "Admin"
                          ? "bg-blue-50 dark:bg-blue-900/20 ml-4"
                          : "bg-gray-50 dark:bg-gray-800 mr-4"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {response.author}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {response.timestamp}
                        </span>
                      </div>
                      <p className="text-sm">{response.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Date Submitted</Label>
                  <p className="text-sm">{currentComplaint.dateSubmitted}</p>
                </div>
                <div>
                  <Label className="font-semibold">Last Updated</Label>
                  <p className="text-sm">{currentComplaint.lastUpdated}</p>
                </div>
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

      {/* Response Dialog */}
      <Dialog
        open={isResponseDialogOpen}
        onOpenChange={setIsResponseDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Respond to Complaint</DialogTitle>
            <DialogDescription>
              Send a response to the user and optionally resolve the complaint.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="response">Response Message</Label>
              <Textarea
                id="response"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Enter your response..."
                rows={4}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="resolution-type">
                Resolution Type (Optional)
              </Label>
              <Select value={resolutionType} onValueChange={setResolutionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select resolution type" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="none">No Resolution</SelectItem>
                  <SelectItem value="Refund">Refund</SelectItem>
                  <SelectItem value="Warning">Warning</SelectItem>
                  <SelectItem value="Suspension">Suspension</SelectItem>
                  <SelectItem value="No Action">No Action Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResponseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSendResponse}>
              Send Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
