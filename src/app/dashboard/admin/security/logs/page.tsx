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
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  User,
  Calendar,
  Monitor,
  MapPin,
  Globe,
  Shield,
  Clock,
} from "lucide-react";

interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  role: "Student" | "Tutor" | "Admin";
  loginTime: string;
  ipAddress: string;
  deviceInfo: string;
  browser: string;
  location: string;
  status: "Success" | "Failed";
  failureReason?: string;
  sessionDuration?: string;
}

const mockAccessLogs: AccessLog[] = [
  {
    id: "1",
    userId: "user-001",
    userName: "Alex Chen",
    role: "Student",
    loginTime: "2024-03-15 10:30:45",
    ipAddress: "192.168.1.100",
    deviceInfo: "Desktop - Windows 11",
    browser: "Chrome 122.0",
    location: "New York, USA",
    status: "Success",
    sessionDuration: "2h 45m",
  },
  {
    id: "2",
    userId: "tutor-001",
    userName: "Dr. Sarah Johnson",
    role: "Tutor",
    loginTime: "2024-03-15 09:15:20",
    ipAddress: "203.0.113.45",
    deviceInfo: "Mobile - iOS 17",
    browser: "Safari 17.0",
    location: "London, UK",
    status: "Success",
    sessionDuration: "4h 20m",
  },
  {
    id: "3",
    userId: "user-002",
    userName: "Emma Wilson",
    role: "Student",
    loginTime: "2024-03-15 08:45:10",
    ipAddress: "198.51.100.23",
    deviceInfo: "Desktop - macOS 14",
    browser: "Chrome 122.0",
    location: "Toronto, Canada",
    status: "Failed",
    failureReason: "Invalid password",
  },
  {
    id: "4",
    userId: "admin-001",
    userName: "Admin User",
    role: "Admin",
    loginTime: "2024-03-15 07:30:15",
    ipAddress: "172.16.0.10",
    deviceInfo: "Desktop - Ubuntu 22.04",
    browser: "Firefox 124.0",
    location: "San Francisco, USA",
    status: "Success",
    sessionDuration: "6h 15m",
  },
  {
    id: "5",
    userId: "user-003",
    userName: "James Smith",
    role: "Student",
    loginTime: "2024-03-15 14:20:30",
    ipAddress: "203.0.113.67",
    deviceInfo: "Tablet - iPadOS 17",
    browser: "Safari 17.0",
    location: "Sydney, Australia",
    status: "Failed",
    failureReason: "Account temporarily locked",
  },
  {
    id: "6",
    userId: "tutor-002",
    userName: "Prof. Michael Brown",
    role: "Tutor",
    loginTime: "2024-03-15 13:45:20",
    ipAddress: "192.0.2.100",
    deviceInfo: "Desktop - Windows 11",
    browser: "Edge 122.0",
    location: "Berlin, Germany",
    status: "Success",
    sessionDuration: "3h 30m",
  },
];

export default function AccessLogs() {
  const [logs, setLogs] = useState<AccessLog[]>(mockAccessLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentLog, setCurrentLog] = useState<AccessLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || log.role === roleFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(filteredLogs.map((log) => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (logId: string, checked: boolean) => {
    if (checked) {
      setSelectedLogs([...selectedLogs, logId]);
    } else {
      setSelectedLogs(selectedLogs.filter((id) => id !== logId));
    }
  };

  const handleFlagSuspicious = (logId: string) => {
    // In a real application, this would flag the log entry
    console.log(`Flagging log ${logId} as suspicious`);
  };

  const openViewDialog = (log: AccessLog) => {
    setCurrentLog(log);
    setIsViewDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Success":
        return "default";
      case "Failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Tutor":
        return "default";
      case "Student":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Mock data for statistics
  const loginStats = {
    totalLogins: 1247,
    successfulLogins: 1186,
    failedLogins: 61,
    uniqueUsers: 342,
    successRate: 95.1,
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Access Logs</h2>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loginStats.totalLogins.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loginStats.successfulLogins.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {loginStats.successRate}% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {loginStats.failedLogins}
            </div>
            <p className="text-xs text-muted-foreground">Requires monitoring</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loginStats.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3h 24m</div>
            <p className="text-xs text-muted-foreground">Average duration</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Access Logs</CardTitle>
          <CardDescription>
            Monitor user login activity and system access for security
            compliance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user, IP address, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Tutor">Tutor</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Success">Success</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedLogs.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedLogs.length} log(s) selected
              </span>
              <Button size="sm" variant="outline">
                <AlertTriangle className="mr-1 h-3 w-3" />
                Flag as Suspicious
              </Button>
            </div>
          )}

          {/* Access Logs Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedLogs.length === filteredLogs.length &&
                        filteredLogs.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device/Browser</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedLogs.includes(log.id)}
                        onCheckedChange={(checked) =>
                          handleSelectLog(log.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{log.userName}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.userId}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(log.role)}>
                        {log.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {log.loginTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                        {log.ipAddress}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Monitor className="mr-2 h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm">{log.deviceInfo}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.browser}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                        {log.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status}
                      </Badge>
                      {log.status === "Failed" && log.failureReason && (
                        <div className="text-xs text-red-600 mt-1">
                          {log.failureReason}
                        </div>
                      )}
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
                          <DropdownMenuItem onClick={() => openViewDialog(log)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            View User Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleFlagSuspicious(log.id)}
                            className="text-orange-600"
                          >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Flag Suspicious
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No access logs found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Log Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Access Log Details</DialogTitle>
          </DialogHeader>
          {currentLog && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">User</Label>
                  <p className="text-sm">{currentLog.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentLog.userId}
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 text-xs"
                  >
                    View User Profile
                  </Button>
                </div>
                <div>
                  <Label className="font-semibold">Role</Label>
                  <Badge
                    variant={getRoleBadgeVariant(currentLog.role)}
                    className="w-fit mt-1"
                  >
                    {currentLog.role}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Login Time</Label>
                  <p className="text-sm">{currentLog.loginTime}</p>
                </div>
                <div>
                  <Label className="font-semibold">Session Duration</Label>
                  <p className="text-sm">
                    {currentLog.sessionDuration || "N/A"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">IP Address</Label>
                  <p className="text-sm">{currentLog.ipAddress}</p>
                </div>
                <div>
                  <Label className="font-semibold">Location</Label>
                  <p className="text-sm">{currentLog.location}</p>
                </div>
              </div>

              <div>
                <Label className="font-semibold">Device Information</Label>
                <p className="text-sm">{currentLog.deviceInfo}</p>
                <p className="text-xs text-muted-foreground">
                  {currentLog.browser}
                </p>
              </div>

              <div>
                <Label className="font-semibold">Status</Label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(currentLog.status)}>
                    {currentLog.status}
                  </Badge>
                  {currentLog.status === "Failed" &&
                    currentLog.failureReason && (
                      <div className="mt-1 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-sm text-red-600">
                          Failure Reason: {currentLog.failureReason}
                        </p>
                      </div>
                    )}
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
    </div>
  );
}
