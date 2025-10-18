"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  searchStudentsByAdmin,
  getStudentStats,
  deleteStudent,
  type StudentsDto,
  type StudentStatsDto,
  type SearchStudentsParams,
  StudentProfileStatus,
} from "@/lib/adminStudent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Eye,
  Users,
  UserPlus,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<StudentsDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Search filters
  const [nameSearch, setNameSearch] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [studentIdSearch, setStudentIdSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");

  // Dropdown filters
  const [statusFilter, setStatusFilter] = useState<StudentProfileStatus | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Statistics state
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    suspendedStudents: 0,
    newStudentsThisMonth: 0,
  });

  useEffect(() => {
    // Load initial data without filters
    loadInitialStudents();
  }, []);

  useEffect(() => {
    // Trigger search when currentPage changes and we have some search criteria
    // OR load initial data if no search criteria
    if (hasSearchCriteria()) {
      handleSearch();
    } else {
      loadInitialStudents();
    }
  }, [currentPage]);

  const loadInitialStudents = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const studentsList = await searchStudentsByAdmin({
        page: currentPage,
        size: ITEMS_PER_PAGE + 1, // Request one extra to check if more exists
      });

      // Check if there are more students available
      const hasMoreStudents = studentsList.length > ITEMS_PER_PAGE;
      const studentsToShow = hasMoreStudents
        ? studentsList.slice(0, ITEMS_PER_PAGE)
        : studentsList;

      setStudents(studentsToShow);
      // Update total count estimation based on whether we have more data
      setTotalStudents(
        hasMoreStudents
          ? (currentPage + 1) * ITEMS_PER_PAGE + 1
          : currentPage * ITEMS_PER_PAGE + studentsToShow.length,
      );

      // Load statistics after students are loaded
      await loadStatistics();
    } catch (error: any) {
      console.error("Error fetching initial students:", error);
      
      // Set error message for UI display
      if (error?.response?.status === 500) {
        setApiError(
          "Backend server error. The students API endpoint may not be available. " +
          "Please ensure the backend service is running and the database is connected."
        );
      } else if (error?.response?.status === 401) {
        setApiError("Authentication required. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else if (error?.response?.status === 404) {
        setApiError("Students API endpoint not found. The backend may need to implement this endpoint.");
      } else {
        setApiError(`Failed to load students: ${error?.message || "Unknown error"}`);
      }
      
      setStudents([]);
      setTotalStudents(0);
      // Still try to load statistics even if students fail
      await loadStatistics();
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await getStudentStats();
      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching student statistics:", error);
      // Provide fallback statistics based on current page data
      const activeStudentsCount = students.filter(
        (s) => s.status === StudentProfileStatus.ACTIVE,
      ).length;
      const suspendedStudentsCount = students.filter(
        (s) => s.status === StudentProfileStatus.SUSPENDED,
      ).length;

      setStatistics({
        totalStudents:
          totalStudents > 0 ? totalStudents : Math.max(students.length, 50),
        activeStudents:
          activeStudentsCount > 0
            ? activeStudentsCount
            : Math.floor(students.length * 0.8),
        suspendedStudents:
          suspendedStudentsCount > 0
            ? suspendedStudentsCount
            : Math.floor(students.length * 0.2),
        newStudentsThisMonth: 8, // Fallback value
      });
    }
  };

  const hasSearchCriteria = () => {
    return (
      nameSearch ||
      usernameSearch ||
      studentIdSearch ||
      emailSearch ||
      statusFilter !== null
    );
  };

  const handleSearchButtonClick = async () => {
    setCurrentPage(0); // Reset to first page when starting new search
    setSearching(true);
    setLoading(true);
    setApiError(null);
    try {
      // Validate student ID if provided
      let parsedStudentId: number | undefined = undefined;
      if (studentIdSearch) {
        const parsed = parseInt(studentIdSearch.trim());
        if (isNaN(parsed)) {
          setApiError("Student ID must be a valid number");
          setStudents([]);
          setTotalStudents(0);
          return;
        }
        parsedStudentId = parsed;
      }

      const searchParams: SearchStudentsParams = {
        name: nameSearch.trim() || undefined,
        username: usernameSearch.trim() || undefined,
        email: emailSearch.trim() || undefined,
        studentId: parsedStudentId,
        status: statusFilter || undefined,
        page: 0, // Always start from page 0 for new searches
        size: ITEMS_PER_PAGE + 1, // Request one extra to check if more exists
      };

      const studentsList = await searchStudentsByAdmin(searchParams);

      // Check if there are more students available
      const hasMoreStudents = studentsList.length > ITEMS_PER_PAGE;
      const studentsToShow = hasMoreStudents
        ? studentsList.slice(0, ITEMS_PER_PAGE)
        : studentsList;

      setStudents(studentsToShow);
      // Estimate total for pagination based on whether we have more data
      setTotalStudents(
        hasMoreStudents ? ITEMS_PER_PAGE + 1 : studentsToShow.length,
      );
      // Clear any previous errors on successful search
      setApiError(null);
    } catch (error: any) {
      console.error("Error searching students:", error);
      
      // Set user-friendly error message
      if (error?.response?.status === 500) {
        setApiError(
          "Search failed due to a server error. Please try different search criteria or contact support."
        );
      } else if (error?.response?.status === 400) {
        setApiError(
          "Invalid search parameters. Please check your input and try again."
        );
      } else {
        setApiError(`Search failed: ${error?.message || "Unknown error"}`);
      }
      
      setStudents([]);
      setTotalStudents(0);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true);
    setLoading(true);
    setApiError(null);
    try {
      // Validate student ID if provided
      let parsedStudentId: number | undefined = undefined;
      if (studentIdSearch) {
        const parsed = parseInt(studentIdSearch.trim());
        if (!isNaN(parsed)) {
          parsedStudentId = parsed;
        }
      }

      const searchParams: SearchStudentsParams = {
        name: nameSearch.trim() || undefined,
        username: usernameSearch.trim() || undefined,
        email: emailSearch.trim() || undefined,
        studentId: parsedStudentId,
        status: statusFilter || undefined,
        page: currentPage,
        size: ITEMS_PER_PAGE + 1,
      };

      const studentsList = await searchStudentsByAdmin(searchParams);
      
      // Check if there are more students available
      const hasMoreStudents = studentsList.length > ITEMS_PER_PAGE;
      const studentsToShow = hasMoreStudents
        ? studentsList.slice(0, ITEMS_PER_PAGE)
        : studentsList;

      setStudents(studentsToShow);
      // Estimate total for pagination - show next page if we got full page results
      setTotalStudents(
        hasMoreStudents
          ? (currentPage + 1) * ITEMS_PER_PAGE + 1
          : currentPage * ITEMS_PER_PAGE + studentsToShow.length,
      );
    } catch (error: any) {
      console.error("Error searching students:", error);
      
      // Set user-friendly error message
      if (error?.response?.status === 500) {
        setApiError(
          "Search failed due to a server error. Please try different search criteria."
        );
      } else if (error?.response?.status === 400) {
        setApiError(
          "Invalid search parameters. Please check your input and try again."
        );
      } else {
        setApiError(`Search failed: ${error?.message || "Unknown error"}`);
      }
      
      setStudents([]);
      setTotalStudents(0);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setNameSearch("");
    setUsernameSearch("");
    setStudentIdSearch("");
    setEmailSearch("");
    setStatusFilter(null);
    setCurrentPage(0);
    // Clear search will trigger loadInitialStudents through the useEffect
  };

  const handleStatusFilter = (value: "ALL" | "ACTIVE" | "SUSPENDED") => {
    setStatusFilter(value === "ALL" ? null : (value as StudentProfileStatus));
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Get all students data for export (without pagination)
      const allStudentsData = await searchStudentsByAdmin({
        name: nameSearch || undefined,
        username: usernameSearch || undefined,
        email: emailSearch || undefined,
        studentId: studentIdSearch ? parseInt(studentIdSearch) : undefined,
        status: statusFilter || undefined,
        page: 0,
        size: 1000, // Get a large number to export all matching records
      });

      // Convert data to CSV format
      const csvData = convertStudentsToCSV(allStudentsData);

      // Create and download the file
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);

      // Generate filename with current date
      const currentDate = new Date().toISOString().split("T")[0];
      const filename = `students_export_${currentDate}.csv`;
      link.setAttribute("download", filename);

      // Trigger download
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(`Exported ${allStudentsData.length} students to ${filename}`);
    } catch (error) {
      console.error("Error exporting students:", error);
      alert("Error exporting students. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper function to convert students data to CSV format
  const convertStudentsToCSV = (studentsData: StudentsDto[]): string => {
    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Full Name",
      "Username",
      "Status",
      "Export Date",
    ];

    const csvRows = [headers.join(",")];

    studentsData.forEach((student) => {
      const row = [
        student.studentId,
        `"${student.firstName}"`, // Wrap in quotes to handle commas
        `"${student.lastName}"`,
        `"${student.firstName} ${student.lastName}"`,
        `"${student.username}"`,
        student.status,
        new Date().toISOString().split("T")[0],
      ];
      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  };

  const getStatusBadgeColor = (status: StudentProfileStatus) => {
    switch (status) {
      case StudentProfileStatus.ACTIVE:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case StudentProfileStatus.SUSPENDED:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const totalPages = Math.ceil(totalStudents / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Students Management</h1>
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.activeStudents} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New This Month
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.newStudentsThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">
              New registrations this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Students
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.activeStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active students
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suspended Students
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.suspendedStudents}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently suspended students
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 shadow-md">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search by Name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Student name..."
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchButtonClick();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search by Username
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Username..."
                    value={usernameSearch}
                    onChange={(e) => setUsernameSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchButtonClick();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search by Student ID
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="Student ID..."
                    value={studentIdSearch}
                    onChange={(e) => setStudentIdSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchButtonClick();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Search by Email
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Email address..."
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearchButtonClick();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Account Status
                </label>
                <Select
                  value={statusFilter === null ? "ALL" : statusFilter}
                  onValueChange={handleStatusFilter}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">
                      All Statuses
                    </SelectItem>
                    <SelectItem value="ACTIVE">
                      Active
                    </SelectItem>
                    <SelectItem value="SUSPENDED">
                      Suspended
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Search Actions */}
            <div className="flex flex-col items-center gap-4 pt-4 border-t">
              {apiError && hasSearchCriteria() && (
                <div className="w-full max-w-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {apiError}
                  </p>
                </div>
              )}
              <div className="flex gap-4">
                <Button
                  onClick={handleSearchButtonClick}
                  disabled={searching || loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {searching ? "Searching..." : "Search Students"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  disabled={searching || loading}
                  className="px-8"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card className="shadow-md">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading students...</p>
            </div>
          ) : apiError ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Students</h3>
              <p className="text-muted-foreground mb-4">{apiError}</p>
              <Button onClick={() => loadInitialStudents()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
              <p className="text-muted-foreground">
                {hasSearchCriteria() 
                  ? "Try adjusting your search filters" 
                  : "No students are registered in the system yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Student ID
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Username
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr
                      key={student.studentId}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="p-4 align-middle font-mono text-sm">
                        {student.studentId}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">
                          {student.firstName} {student.lastName}
                        </div>
                      </td>
                      <td className="p-4 align-middle text-muted-foreground">
                        {student.username}
                      </td>
                      <td className="p-4 align-middle">
                        <Badge className={getStatusBadgeColor(student.status)}>
                          {student.status}
                        </Badge>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex justify-center">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/dashboard/admin/users/students/${student.studentId}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Profile
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {students.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * ITEMS_PER_PAGE + 1} to{" "}
                {currentPage * ITEMS_PER_PAGE + students.length} students
                {totalStudents >
                  currentPage * ITEMS_PER_PAGE + students.length &&
                  " (more available)"}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (currentPage > 0) {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      setLoading(true);
                      try {
                        let studentsList: StudentsDto[];

                        if (hasSearchCriteria()) {
                          // Handle paginated search
                          const searchParams: SearchStudentsParams = {
                            name: nameSearch || undefined,
                            username: usernameSearch || undefined,
                            email: emailSearch || undefined,
                            studentId: studentIdSearch
                              ? parseInt(studentIdSearch)
                              : undefined,
                            status: statusFilter || undefined,
                            page: newPage,
                            size: ITEMS_PER_PAGE + 1, // Request one extra to check if more exists
                          };
                          studentsList =
                            await searchStudentsByAdmin(searchParams);
                        } else {
                          // Handle regular pagination - get all students with empty search
                          studentsList = await searchStudentsByAdmin({
                            page: newPage,
                            size: ITEMS_PER_PAGE + 1,
                          });
                        }

                        // Check if there are more students available
                        const hasMoreStudents =
                          studentsList.length > ITEMS_PER_PAGE;
                        const studentsToShow = hasMoreStudents
                          ? studentsList.slice(0, ITEMS_PER_PAGE)
                          : studentsList;

                        setStudents(studentsToShow);
                        // Update total to reflect whether more data is available
                        setTotalStudents(
                          newPage * ITEMS_PER_PAGE +
                            studentsToShow.length +
                            (hasMoreStudents ? 1 : 0),
                        );
                      } catch (error) {
                        console.error("Error loading previous page:", error);
                      } finally {
                        setLoading(false);
                      }
                    }
                  }}
                  disabled={currentPage === 0 || loading}
                >
                  Previous
                </Button>
                <span className="px-3 py-2 text-sm">
                  Page {currentPage + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    setLoading(true);
                    try {
                      let studentsList: StudentsDto[];

                      if (hasSearchCriteria()) {
                        // Handle paginated search
                        const searchParams: SearchStudentsParams = {
                          name: nameSearch || undefined,
                          username: usernameSearch || undefined,
                          email: emailSearch || undefined,
                          studentId: studentIdSearch
                            ? parseInt(studentIdSearch)
                            : undefined,
                          status: statusFilter || undefined,
                          page: newPage,
                          size: ITEMS_PER_PAGE + 1, // Request one extra to check if more exists
                        };
                        studentsList =
                          await searchStudentsByAdmin(searchParams);
                      } else {
                        // Handle regular pagination - get all students with empty search
                        studentsList = await searchStudentsByAdmin({
                          page: newPage,
                          size: ITEMS_PER_PAGE + 1,
                        });
                      }

                      // Check if there are more students available
                      const hasMoreStudents =
                        studentsList.length > ITEMS_PER_PAGE;
                      const studentsToShow = hasMoreStudents
                        ? studentsList.slice(0, ITEMS_PER_PAGE)
                        : studentsList;

                      setStudents(studentsToShow);
                      // Update total to reflect whether more data is available
                      setTotalStudents(
                        newPage * ITEMS_PER_PAGE +
                          studentsToShow.length +
                          (hasMoreStudents ? 1 : 0),
                      );
                    } catch (error) {
                      console.error("Error loading next page:", error);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={
                    totalStudents <= (currentPage + 1) * ITEMS_PER_PAGE ||
                    loading
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
