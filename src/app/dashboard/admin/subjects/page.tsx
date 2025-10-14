"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  subjectAPI,
  Subject as BackendSubject,
  EducationLevel,
  HighSchoolStreamType,
} from "@/lib/adminSubject";

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState<BackendSubject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [educationFilter, setEducationFilter] = useState<string>("");
  const [streamFilter, setStreamFilter] = useState<string>("");
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<BackendSubject | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    educationLevel: "" as EducationLevel | "",
    stream: "none" as HighSchoolStreamType | "none" | "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await subjectAPI.getAllSubjects();
      setSubjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch subjects");
      console.error("Error fetching subjects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch = subject.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesEducation =
      educationFilter === "all" ||
      !educationFilter ||
      subject.educationLevel === educationFilter;
    const matchesStream =
      streamFilter === "all" ||
      !streamFilter ||
      (subject.stream && subject.stream === streamFilter);
    return matchesSearch && matchesEducation && matchesStream;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubjects(
        filteredSubjects.map((subject) => subject.subjectId!),
      );
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleSelectSubject = (subjectId: number, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter((id) => id !== subjectId));
    }
  };

  const handleBulkDelete = async () => {
    try {
      setIsLoading(true);
      // Delete selected subjects one by one
      for (const subjectId of selectedSubjects) {
        await subjectAPI.deleteSubject(subjectId);
      }
      // Refresh the subjects list
      await fetchSubjects();
      setSelectedSubjects([]);
    } catch (err: any) {
      setError(err.message || "Failed to delete subjects");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = async () => {
    try {
      if (!formData.name || !formData.educationLevel) {
        setError("Name and education level are required");
        return;
      }

      const newSubjectData = {
        name: formData.name,
        educationLevel: formData.educationLevel,
        ...(formData.stream &&
          formData.stream !== "none" && { stream: formData.stream }),
      };

      await subjectAPI.createSubject(newSubjectData);
      await fetchSubjects(); // Refresh the list
      setIsCreateDialogOpen(false);
      resetForm();
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to create subject");
    }
  };

  const handleDeleteSubject = async (subjectId: number) => {
    try {
      setIsLoading(true);
      await subjectAPI.deleteSubject(subjectId);
      await fetchSubjects(); // Refresh the list
    } catch (err: any) {
      setError(err.message || "Failed to delete subject");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      educationLevel: "",
      stream: "none",
    });
  };

  const openViewDialog = (subject: BackendSubject) => {
    setCurrentSubject(subject);
    setIsViewDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSubjects}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subject Management</h1>
          <p className="text-gray-600 mt-1">
            Manage subjects across different education levels
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={educationFilter} onValueChange={setEducationFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Education Level" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-gray-700"
                >
                  All Levels
                </SelectItem>
                {Object.values(EducationLevel).map((level) => (
                  <SelectItem
                    key={level}
                    value={level}
                    className="text-white hover:bg-gray-700"
                  >
                    {level.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={streamFilter} onValueChange={setStreamFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-gray-800 border-gray-600 text-white">
                <SelectValue placeholder="Stream" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem
                  value="all"
                  className="text-white hover:bg-gray-700"
                >
                  All Streams
                </SelectItem>
                {Object.values(HighSchoolStreamType).map((stream) => (
                  <SelectItem
                    key={stream}
                    value={stream}
                    className="text-white hover:bg-gray-700"
                  >
                    {stream}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions Bar */}
      {selectedSubjects.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedSubjects.length} subject(s) selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedSubjects.length === filteredSubjects.length &&
                      filteredSubjects.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Education Level</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubjects.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No subjects found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubjects.map((subject) => (
                  <TableRow key={subject.subjectId}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubjects.includes(subject.subjectId!)}
                        onCheckedChange={(checked) =>
                          handleSelectSubject(
                            subject.subjectId!,
                            checked as boolean,
                          )
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {subject.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subject.educationLevel.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {subject.stream ? (
                        <Badge variant="secondary">{subject.stream}</Badge>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openViewDialog(subject)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleDeleteSubject(subject.subjectId!)
                          }
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Subject</DialogTitle>
            <DialogDescription className="text-gray-300">
              Create a new subject for your educational platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
            {error && (
              <div className="text-red-500 text-sm bg-red-900/20 p-2 rounded">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300 font-medium">
                Subject Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter subject name"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="educationLevel"
                className="text-gray-300 font-medium"
              >
                Education Level
              </Label>
              <Select
                value={formData.educationLevel}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    educationLevel: value as EducationLevel,
                  })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {Object.values(EducationLevel).map((level) => (
                    <SelectItem
                      key={level}
                      value={level}
                      className="text-white hover:bg-gray-700"
                    >
                      {level.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stream" className="text-gray-300 font-medium">
                Stream (Optional)
              </Label>
              <Select
                value={formData.stream}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    stream:
                      value === "none"
                        ? "none"
                        : (value as HighSchoolStreamType),
                  })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select stream (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem
                    value="none"
                    className="text-white hover:bg-gray-700"
                  >
                    None
                  </SelectItem>
                  {Object.values(HighSchoolStreamType).map((stream) => (
                    <SelectItem
                      key={stream}
                      value={stream}
                      className="text-white hover:bg-gray-700"
                    >
                      {stream}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubject}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Subject Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Subject Details</DialogTitle>
          </DialogHeader>
          {currentSubject && (
            <div className="space-y-4 bg-gray-800 p-4 rounded-lg">
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">Name</Label>
                <p className="text-white bg-gray-700 px-3 py-2 rounded">
                  {currentSubject.name}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">
                  Education Level
                </Label>
                <p className="text-white bg-gray-700 px-3 py-2 rounded">
                  {currentSubject.educationLevel.replace(/_/g, " ")}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">Stream</Label>
                <p className="text-white bg-gray-700 px-3 py-2 rounded">
                  {currentSubject.stream || "N/A"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">Subject ID</Label>
                <p className="text-white bg-gray-700 px-3 py-2 rounded">
                  {currentSubject.subjectId}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => setIsViewDialogOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
