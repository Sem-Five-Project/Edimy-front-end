"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  Filter,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  BookOpen,
  Star,
  MapPin,
  Calendar,
  Activity,
  UserPlus,
  Search,
} from "lucide-react";

interface UserData {
  date: string;
  newStudents: number;
  newTutors: number;
  activeStudents: number;
  activeTutors: number;
  totalUsers: number;
}

interface TopUser {
  id: string;
  name: string;
  type: "student" | "tutor";
  sessionsCount: number;
  totalSpent?: number;
  totalEarned?: number;
  rating?: number;
  joinDate: string;
  subject?: string;
  location: string;
}

interface SubjectPreference {
  subject: string;
  students: number;
  percentage: number;
  growth: number;
}

interface LocationData {
  location: string;
  users: number;
  students: number;
  tutors: number;
}

interface RetentionData {
  period: string;
  studentRetention: number;
  tutorRetention: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82ca9d",
];

const USER_TYPES = ["All Users", "Students", "Tutors"];
const LOCATIONS = [
  "All Locations",
  "New York",
  "California",
  "Texas",
  "Florida",
  "Illinois",
];
const SUBJECTS = [
  "All Subjects",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Computer Science",
];

export default function UserAnalyticsPage() {
  const [userData, setUserData] = useState<UserData[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [subjectPreferences, setSubjectPreferences] = useState<
    SubjectPreference[]
  >([]);
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [retentionData, setRetentionData] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedUserType, setSelectedUserType] = useState("All Users");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [dateRange, setDateRange] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUserAnalytics();
  }, [selectedUserType, selectedLocation, selectedSubject, dateRange]);

  const fetchUserAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user growth data
      const mockUserData: UserData[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const newStudents = Math.floor(Math.random() * 20) + 5;
        const newTutors = Math.floor(Math.random() * 5) + 1;

        return {
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          newStudents,
          newTutors,
          activeStudents: Math.floor(Math.random() * 200) + 100,
          activeTutors: Math.floor(Math.random() * 50) + 20,
          totalUsers: newStudents + newTutors,
        };
      });

      // Mock top users data
      const subjects = [
        "Mathematics",
        "Physics",
        "Chemistry",
        "Biology",
        "English",
        "Computer Science",
      ];
      const locations = [
        "New York",
        "California",
        "Texas",
        "Florida",
        "Illinois",
      ];
      const mockTopUsers: TopUser[] = Array.from({ length: 20 }, (_, i) => {
        const isStudent = i < 10;
        const joinDate = new Date();
        joinDate.setMonth(joinDate.getMonth() - Math.floor(Math.random() * 12));

        return {
          id: `user-${i + 1}`,
          name: isStudent ? `Student ${i + 1}` : `Tutor ${i - 9}`,
          type: isStudent ? "student" : "tutor",
          sessionsCount: Math.floor(Math.random() * 100) + 10,
          totalSpent: isStudent
            ? Math.floor(Math.random() * 2000) + 200
            : undefined,
          totalEarned: !isStudent
            ? Math.floor(Math.random() * 5000) + 500
            : undefined,
          rating: !isStudent
            ? Math.round((Math.random() * 1 + 4) * 10) / 10
            : undefined,
          joinDate: joinDate.toISOString().split("T")[0],
          subject: !isStudent
            ? subjects[Math.floor(Math.random() * subjects.length)]
            : undefined,
          location: locations[Math.floor(Math.random() * locations.length)],
        };
      });

      // Sort students by total spent and tutors by total earned
      const topStudents = mockTopUsers
        .filter((user) => user.type === "student")
        .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
      const topTutors = mockTopUsers
        .filter((user) => user.type === "tutor")
        .sort((a, b) => (b.totalEarned || 0) - (a.totalEarned || 0));

      // Mock subject preferences
      const mockSubjectPreferences: SubjectPreference[] = subjects.map(
        (subject) => {
          const students = Math.floor(Math.random() * 200) + 50;
          return {
            subject,
            students,
            percentage: 0, // Will calculate below
            growth: Math.floor(Math.random() * 40) - 10, // -10% to +30%
          };
        },
      );

      const totalSubjectStudents = mockSubjectPreferences.reduce(
        (sum, sp) => sum + sp.students,
        0,
      );
      mockSubjectPreferences.forEach((sp) => {
        sp.percentage = Math.round((sp.students / totalSubjectStudents) * 100);
      });

      // Mock location data
      const mockLocationData: LocationData[] = locations
        .map((location) => {
          const students = Math.floor(Math.random() * 150) + 50;
          const tutors = Math.floor(Math.random() * 30) + 10;
          return {
            location,
            students,
            tutors,
            users: students + tutors,
          };
        })
        .sort((a, b) => b.users - a.users);

      // Mock retention data
      const mockRetentionData: RetentionData[] = [
        { period: "Week 1", studentRetention: 95, tutorRetention: 98 },
        { period: "Week 2", studentRetention: 87, tutorRetention: 92 },
        { period: "Month 1", studentRetention: 78, tutorRetention: 85 },
        { period: "Month 3", studentRetention: 65, tutorRetention: 78 },
        { period: "Month 6", studentRetention: 52, tutorRetention: 70 },
        { period: "Year 1", studentRetention: 42, tutorRetention: 65 },
      ];

      setUserData(mockUserData);
      setTopUsers([...topStudents, ...topTutors]);
      setSubjectPreferences(mockSubjectPreferences);
      setLocationData(mockLocationData);
      setRetentionData(mockRetentionData);
    } catch (error) {
      console.error("Error fetching user analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTopUsers = topUsers.filter((user) => {
    const matchesType =
      selectedUserType === "All Users" ||
      (selectedUserType === "Students" && user.type === "student") ||
      (selectedUserType === "Tutors" && user.type === "tutor");
    const matchesLocation =
      selectedLocation === "All Locations" ||
      user.location === selectedLocation;
    const matchesSubject =
      selectedSubject === "All Subjects" || user.subject === selectedSubject;
    const matchesSearch =
      searchTerm === "" ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesLocation && matchesSubject && matchesSearch;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getUserTypeBadge = (type: string) => {
    return type === "student" ? (
      <Badge className="bg-blue-100 text-blue-800">Student</Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">Tutor</Badge>
    );
  };

  const getTrendIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getTrendColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  // Calculate summary statistics
  const totalActiveUsers =
    userData[userData.length - 1]?.activeStudents +
      userData[userData.length - 1]?.activeTutors || 0;
  const newUsersThisMonth = userData.reduce(
    (sum, day) => sum + day.totalUsers,
    0,
  );
  const averageStudentRetention =
    retentionData.reduce((sum, r) => sum + r.studentRetention, 0) /
    retentionData.length;
  const averageTutorRetention =
    retentionData.reduce((sum, r) => sum + r.tutorRetention, 0) /
    retentionData.length;

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
          <h1 className="text-3xl font-bold">User Analytics</h1>
          <p className="text-muted-foreground">
            Track student and tutor activity, engagement, and growth patterns
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchUserAnalytics} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="userType">User Type</Label>
              <Select
                value={selectedUserType}
                onValueChange={setSelectedUserType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {USER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select
                value={selectedLocation}
                onValueChange={setSelectedLocation}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="subject">Subject Preference</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Active Users
                </p>
                <p className="text-2xl font-bold">
                  {totalActiveUsers.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm ml-1 text-green-600">+12.5%</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  New Users (30d)
                </p>
                <p className="text-2xl font-bold">{newUsersThisMonth}</p>
                <p className="text-sm text-muted-foreground">
                  Students & Tutors
                </p>
              </div>
              <UserPlus className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Student Retention
                </p>
                <p className="text-2xl font-bold">
                  {averageStudentRetention.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Average across periods
                </p>
              </div>
              <Activity className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tutor Retention
                </p>
                <p className="text-2xl font-bold">
                  {averageTutorRetention.toFixed(1)}%
                </p>
                <p className="text-sm text-muted-foreground">
                  Average across periods
                </p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>New User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="newStudents"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                  name="New Students"
                />
                <Area
                  type="monotone"
                  dataKey="newTutors"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.6}
                  name="New Tutors"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Active Users Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Active Students vs Tutors</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="activeStudents"
                  stroke="#8884d8"
                  strokeWidth={2}
                  name="Active Students"
                />
                <Line
                  type="monotone"
                  dataKey="activeTutors"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  name="Active Tutors"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Subject Preferences & Location Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Student Subject Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPreferences.map((subject, index) => (
                <div
                  key={subject.subject}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="font-medium">{subject.subject}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{subject.students}</p>
                      <p className="text-sm text-muted-foreground">
                        {subject.percentage}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(subject.growth)}
                      <span
                        className={`text-sm ${getTrendColor(subject.growth)}`}
                      >
                        {Math.abs(subject.growth)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="students" fill="#8884d8" name="Students" />
                <Bar dataKey="tutors" fill="#82ca9d" name="Tutors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Retention Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>User Retention Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "Retention Rate"]} />
              <Line
                type="monotone"
                dataKey="studentRetention"
                stroke="#8884d8"
                strokeWidth={3}
                name="Student Retention"
                dot={{ fill: "#8884d8", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="tutorRetention"
                stroke="#82ca9d"
                strokeWidth={3}
                name="Tutor Retention"
                dot={{ fill: "#82ca9d", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Users Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Active Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Most Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopUsers
                  .filter((user) => user.type === "student")
                  .slice(0, 8)
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.name}
                      </TableCell>
                      <TableCell>{student.sessionsCount}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(student.totalSpent || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {student.location}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Most Active Tutors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Most Active Tutors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Sessions</TableHead>
                  <TableHead>Total Earned</TableHead>
                  <TableHead>Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTopUsers
                  .filter((user) => user.type === "tutor")
                  .slice(0, 8)
                  .map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell className="font-medium">
                        {tutor.name}
                      </TableCell>
                      <TableCell>{tutor.sessionsCount}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(tutor.totalEarned || 0)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {tutor.rating}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* User Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key User Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900">
                Peak Activity Hours
              </h4>
              <p className="text-sm text-blue-700">
                Most user activity occurs between 6-9 PM, with weekends showing
                30% higher engagement.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900">
                Mathematics Dominance
              </h4>
              <p className="text-sm text-green-700">
                Mathematics accounts for 35% of all subject preferences, with
                22% growth this quarter.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900">
                Geographic Growth
              </h4>
              <p className="text-sm text-purple-700">
                California and New York lead in user registrations, with Texas
                showing fastest growth rate.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
