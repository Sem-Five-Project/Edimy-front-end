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
  AlertTriangle,
  Shield,
  CreditCard,
  Users,
  Activity,
  Ban,
  FileText,
  Hash,
  Calendar,
  User,
} from "lucide-react";

interface FraudAlert {
  id: string;
  type:
    | "Multiple Accounts"
    | "Suspicious Payment"
    | "Session Abuse"
    | "Login Pattern";
  description: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  detectedAt: string;
  affectedUsers: string[];
  isActive: boolean;
}

interface FraudCase {
  id: string;
  caseId: string;
  usersInvolved: Array<{
    id: string;
    name: string;
    role: "Student" | "Tutor";
  }>;
  issueType:
    | "Multiple Accounts"
    | "Suspicious Payment"
    | "Session Abuse"
    | "Login Pattern";
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "Investigating" | "Resolved" | "Closed";
  openedDate: string;
  lastUpdated: string;
  investigationNotes: string;
  evidenceItems: string[];
  resolution?: string;
  resolutionActions?: string[];
}

const mockFraudAlerts: FraudAlert[] = [
  {
    id: "1",
    type: "Multiple Accounts",
    description:
      "3 accounts detected using the same payment method and device fingerprint",
    severity: "High",
    detectedAt: "2024-03-15 14:30:00",
    affectedUsers: ["user-001", "user-002", "user-003"],
    isActive: true,
  },
  {
    id: "2",
    type: "Suspicious Payment",
    description:
      "Multiple failed payment attempts followed by successful payment from different card",
    severity: "Medium",
    detectedAt: "2024-03-15 13:45:00",
    affectedUsers: ["user-004"],
    isActive: true,
  },
  {
    id: "3",
    type: "Login Pattern",
    description:
      "15 failed login attempts from different IP addresses within 5 minutes",
    severity: "Critical",
    detectedAt: "2024-03-15 12:20:00",
    affectedUsers: ["tutor-001"],
    isActive: false,
  },
  {
    id: "4",
    type: "Session Abuse",
    description:
      "User booking and cancelling sessions repeatedly to abuse refund policy",
    severity: "Medium",
    detectedAt: "2024-03-15 11:15:00",
    affectedUsers: ["user-005"],
    isActive: true,
  },
];

const mockFraudCases: FraudCase[] = [
  {
    id: "1",
    caseId: "FRAUD-2024-001",
    usersInvolved: [
      { id: "user-001", name: "Alex Chen", role: "Student" },
      { id: "user-002", name: "John Doe", role: "Student" },
      { id: "user-003", name: "Jane Smith", role: "Student" },
    ],
    issueType: "Multiple Accounts",
    severity: "High",
    status: "Investigating",
    openedDate: "2024-03-15",
    lastUpdated: "2024-03-16",
    investigationNotes:
      "All three accounts created within 24 hours, same payment method, similar email patterns. Investigating if these are legitimate separate users.",
    evidenceItems: [
      "Same credit card ending in 1234",
      "IP address 192.168.1.100 used for all registrations",
      "Similar email patterns (variations of alexchen)",
      "Device fingerprint match across all accounts",
    ],
  },
  {
    id: "2",
    caseId: "FRAUD-2024-002",
    usersInvolved: [
      { id: "tutor-001", name: "Dr. Sarah Johnson", role: "Tutor" },
    ],
    issueType: "Login Pattern",
    severity: "Critical",
    status: "Resolved",
    openedDate: "2024-03-14",
    lastUpdated: "2024-03-15",
    investigationNotes:
      "Brute force attack detected. User confirmed account compromise. Password reset enforced and 2FA enabled.",
    evidenceItems: [
      "67 failed login attempts in 10 minutes",
      "Login attempts from 15 different countries",
      "User reported suspicious activity",
      "Successful login from known user device after attack",
    ],
    resolution: "Account secured, password reset, 2FA enabled",
    resolutionActions: [
      "Password Reset",
      "2FA Enforcement",
      "Security Training",
    ],
  },
  {
    id: "3",
    caseId: "FRAUD-2024-003",
    usersInvolved: [{ id: "user-005", name: "Emma Wilson", role: "Student" }],
    issueType: "Session Abuse",
    severity: "Medium",
    status: "Open",
    openedDate: "2024-03-13",
    lastUpdated: "2024-03-14",
    investigationNotes:
      "User has cancelled 8 sessions within 24 hours of booking, always requesting full refunds. Pattern suggests policy abuse.",
    evidenceItems: [
      "12 bookings in past week",
      "8 cancellations within refund period",
      "Always books premium tutors",
      "Cancellation reasons vary but timeline is consistent",
    ],
  },
];

export default function FraudMonitoring() {
  const [alerts, setAlerts] = useState<FraudAlert[]>(mockFraudAlerts);
  const [cases, setCases] = useState<FraudCase[]>(mockFraudCases);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [isViewCaseDialogOpen, setIsViewCaseDialogOpen] = useState(false);
  const [isInvestigateDialogOpen, setIsInvestigateDialogOpen] = useState(false);
  const [currentCase, setCurrentCase] = useState<FraudCase | null>(null);
  const [investigationNotes, setInvestigationNotes] = useState("");

  const filteredCases = cases.filter((fraudCase) => {
    const matchesSearch =
      fraudCase.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fraudCase.usersInvolved.some((user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    const matchesSeverity =
      severityFilter === "all" || fraudCase.severity === severityFilter;
    const matchesStatus =
      statusFilter === "all" || fraudCase.status === statusFilter;
    const matchesType =
      typeFilter === "all" || fraudCase.issueType === typeFilter;

    return matchesSearch && matchesSeverity && matchesStatus && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCases(filteredCases.map((fraudCase) => fraudCase.id));
    } else {
      setSelectedCases([]);
    }
  };

  const handleSelectCase = (caseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCases([...selectedCases, caseId]);
    } else {
      setSelectedCases(selectedCases.filter((id) => id !== caseId));
    }
  };

  const handleUpdateCaseStatus = (
    caseId: string,
    newStatus: "Open" | "Investigating" | "Resolved" | "Closed",
  ) => {
    setCases(
      cases.map((fraudCase) =>
        fraudCase.id === caseId
          ? {
              ...fraudCase,
              status: newStatus,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : fraudCase,
      ),
    );
  };

  const handleSuspendUser = (userId: string) => {
    // In a real application, this would suspend the user
    console.log(`Suspending user ${userId}`);
  };

  const openViewCaseDialog = (fraudCase: FraudCase) => {
    setCurrentCase(fraudCase);
    setIsViewCaseDialogOpen(true);
  };

  const openInvestigateDialog = (fraudCase: FraudCase) => {
    setCurrentCase(fraudCase);
    setInvestigationNotes(fraudCase.investigationNotes);
    setIsInvestigateDialogOpen(true);
  };

  const handleSaveInvestigation = () => {
    if (!currentCase) return;

    setCases(
      cases.map((fraudCase) =>
        fraudCase.id === currentCase.id
          ? {
              ...fraudCase,
              investigationNotes,
              lastUpdated: new Date().toISOString().split("T")[0],
              status: "Investigating" as const,
            }
          : fraudCase,
      ),
    );
    setIsInvestigateDialogOpen(false);
    setCurrentCase(null);
    setInvestigationNotes("");
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "destructive";
      case "High":
        return "destructive";
      case "Medium":
        return "secondary";
      case "Low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Open":
        return "destructive";
      case "Investigating":
        return "secondary";
      case "Resolved":
        return "default";
      case "Closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const alertsStats = {
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((alert) => alert.isActive).length,
    criticalAlerts: alerts.filter((alert) => alert.severity === "Critical")
      .length,
    resolvedToday: 3,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Fraud Monitoring</h2>
      </div>

      {/* Alert Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alertsStats.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {alertsStats.activeAlerts}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Shield className="h-4 w-4 text-red-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {alertsStats.criticalAlerts}
            </div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Today
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alertsStats.resolvedToday}
            </div>
            <p className="text-xs text-muted-foreground">Cases closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Fraud Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Fraud Alerts</CardTitle>
          <CardDescription>
            Real-time fraud detection alerts requiring immediate attention.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts
              .filter((alert) => alert.isActive)
              .map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        alert.severity === "Critical"
                          ? "text-red-600"
                          : alert.severity === "High"
                            ? "text-orange-600"
                            : alert.severity === "Medium"
                              ? "text-yellow-600"
                              : "text-blue-600"
                      }`}
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={getSeverityBadgeVariant(alert.severity)}
                        >
                          {alert.severity}
                        </Badge>
                        <span className="font-medium">{alert.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Detected: {alert.detectedAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {alert.affectedUsers.length} user(s)
                    </Badge>
                    <Button size="sm">Investigate</Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Fraud Cases Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fraud Cases</CardTitle>
          <CardDescription>
            Detailed fraud cases under investigation and resolved cases.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search cases or users..."
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
                <SelectItem value="Multiple Accounts">
                  Multiple Accounts
                </SelectItem>
                <SelectItem value="Suspicious Payment">
                  Suspicious Payment
                </SelectItem>
                <SelectItem value="Session Abuse">Session Abuse</SelectItem>
                <SelectItem value="Login Pattern">Login Pattern</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter by Severity" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Investigating">Investigating</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedCases.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedCases.length} case(s) selected
              </span>
              <Button size="sm" variant="outline">
                Mark as Investigating
              </Button>
              <Button size="sm" variant="destructive">
                <Ban className="mr-1 h-3 w-3" />
                Suspend Users
              </Button>
            </div>
          )}

          {/* Cases Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedCases.length === filteredCases.length &&
                        filteredCases.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Users Involved</TableHead>
                  <TableHead>Issue Type</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Opened</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.map((fraudCase) => (
                  <TableRow key={fraudCase.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedCases.includes(fraudCase.id)}
                        onCheckedChange={(checked) =>
                          handleSelectCase(fraudCase.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Hash className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{fraudCase.caseId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {fraudCase.usersInvolved.slice(0, 2).map((user) => (
                          <div key={user.id} className="flex items-center">
                            <User className="mr-2 h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{user.name}</span>
                            <Badge variant="outline" className="ml-1 text-xs">
                              {user.role}
                            </Badge>
                          </div>
                        ))}
                        {fraudCase.usersInvolved.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{fraudCase.usersInvolved.length - 2} more
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{fraudCase.issueType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getSeverityBadgeVariant(fraudCase.severity)}
                      >
                        {fraudCase.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(fraudCase.status)}>
                        {fraudCase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {fraudCase.openedDate}
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
                            onClick={() => openViewCaseDialog(fraudCase)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openInvestigateDialog(fraudCase)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Investigate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateCaseStatus(
                                fraudCase.id,
                                "Investigating",
                              )
                            }
                          >
                            Mark Investigating
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleUpdateCaseStatus(fraudCase.id, "Resolved")
                            }
                          >
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() =>
                              fraudCase.usersInvolved.forEach((user) =>
                                handleSuspendUser(user.id),
                              )
                            }
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Users
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No fraud cases found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Case Details Dialog */}
      <Dialog
        open={isViewCaseDialogOpen}
        onOpenChange={setIsViewCaseDialogOpen}
      >
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Fraud Case Details</DialogTitle>
          </DialogHeader>
          {currentCase && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Case ID</Label>
                  <p className="text-sm">{currentCase.caseId}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant={getStatusBadgeVariant(currentCase.status)}
                    className="w-fit mt-1"
                  >
                    {currentCase.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Issue Type</Label>
                  <Badge variant="outline" className="w-fit mt-1">
                    {currentCase.issueType}
                  </Badge>
                </div>
                <div>
                  <Label className="font-semibold">Severity</Label>
                  <Badge
                    variant={getSeverityBadgeVariant(currentCase.severity)}
                    className="w-fit mt-1"
                  >
                    {currentCase.severity}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Users Involved</Label>
                <div className="mt-2 space-y-2">
                  {currentCase.usersInvolved.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 border rounded"
                    >
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{user.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {user.role}
                        </Badge>
                      </div>
                      <Button variant="link" size="sm">
                        View Profile
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Evidence</Label>
                <div className="mt-2 space-y-1">
                  {currentCase.evidenceItems.map((evidence, index) => (
                    <div
                      key={index}
                      className="text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      • {evidence}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="font-semibold">Investigation Notes</Label>
                <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm">{currentCase.investigationNotes}</p>
                </div>
              </div>

              {currentCase.resolution && (
                <div>
                  <Label className="font-semibold">Resolution</Label>
                  <div className="mt-1 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-sm">{currentCase.resolution}</p>
                    {currentCase.resolutionActions && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {currentCase.resolutionActions.map((action, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {action}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Date Opened</Label>
                  <p className="text-sm">{currentCase.openedDate}</p>
                </div>
                <div>
                  <Label className="font-semibold">Last Updated</Label>
                  <p className="text-sm">{currentCase.lastUpdated}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsViewCaseDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investigation Dialog */}
      <Dialog
        open={isInvestigateDialogOpen}
        onOpenChange={setIsInvestigateDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Investigation</DialogTitle>
            <DialogDescription>
              Add or update investigation notes for this fraud case.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="investigation-notes">Investigation Notes</Label>
              <Textarea
                id="investigation-notes"
                value={investigationNotes}
                onChange={(e) => setInvestigationNotes(e.target.value)}
                placeholder="Enter investigation findings and next steps..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInvestigateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveInvestigation}>
              Save Investigation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
