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
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  PlusIcon,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Tag,
} from "lucide-react";

interface Tag {
  id: string;
  name: string;
  associatedSubjects: string[];
  status: "Active" | "Inactive";
  createdDate: string;
  updatedDate: string;
}

const SUBJECTS = [
  "Advanced Calculus",
  "Organic Chemistry",
  "Spanish Grammar",
  "Data Structures",
  "Digital Art",
  "Linear Algebra",
  "Physics",
  "English Literature",
  "Web Development",
  "Photography",
];

const mockTags: Tag[] = [
  {
    id: "1",
    name: "Beginner Friendly",
    associatedSubjects: ["Spanish Grammar", "Digital Art", "Photography"],
    status: "Active",
    createdDate: "2024-01-15",
    updatedDate: "2024-03-20",
  },
  {
    id: "2",
    name: "Advanced Level",
    associatedSubjects: [
      "Advanced Calculus",
      "Organic Chemistry",
      "Data Structures",
    ],
    status: "Active",
    createdDate: "2024-01-20",
    updatedDate: "2024-02-15",
  },
  {
    id: "3",
    name: "STEM",
    associatedSubjects: [
      "Advanced Calculus",
      "Organic Chemistry",
      "Data Structures",
      "Linear Algebra",
      "Physics",
    ],
    status: "Active",
    createdDate: "2024-02-01",
    updatedDate: "2024-02-28",
  },
  {
    id: "4",
    name: "Creative",
    associatedSubjects: ["Digital Art", "Photography", "English Literature"],
    status: "Active",
    createdDate: "2024-02-10",
    updatedDate: "2024-03-15",
  },
  {
    id: "5",
    name: "Programming",
    associatedSubjects: ["Data Structures", "Web Development"],
    status: "Inactive",
    createdDate: "2024-02-20",
    updatedDate: "2024-03-01",
  },
  {
    id: "6",
    name: "Mathematics",
    associatedSubjects: ["Advanced Calculus", "Linear Algebra"],
    status: "Active",
    createdDate: "2024-03-01",
    updatedDate: "2024-03-10",
  },
];

export default function TagManagement() {
  const [tags, setTags] = useState<Tag[]>(mockTags);
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    associatedSubjects: [] as string[],
    status: true,
  });

  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" ||
      !subjectFilter ||
      tag.associatedSubjects.includes(subjectFilter);
    const matchesStatus =
      statusFilter === "all" || !statusFilter || tag.status === statusFilter;

    return matchesSearch && matchesSubject && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTags(filteredTags.map((tag) => tag.id));
    } else {
      setSelectedTags([]);
    }
  };

  const handleSelectTag = (tagId: string, checked: boolean) => {
    if (checked) {
      setSelectedTags([...selectedTags, tagId]);
    } else {
      setSelectedTags(selectedTags.filter((id) => id !== tagId));
    }
  };

  const handleBulkActivate = () => {
    setTags(
      tags.map((tag) =>
        selectedTags.includes(tag.id)
          ? {
              ...tag,
              status: "Active" as const,
              updatedDate: new Date().toISOString().split("T")[0],
            }
          : tag,
      ),
    );
    setSelectedTags([]);
  };

  const handleBulkDeactivate = () => {
    setTags(
      tags.map((tag) =>
        selectedTags.includes(tag.id)
          ? {
              ...tag,
              status: "Inactive" as const,
              updatedDate: new Date().toISOString().split("T")[0],
            }
          : tag,
      ),
    );
    setSelectedTags([]);
  };

  const handleBulkDelete = () => {
    setTags(tags.filter((tag) => !selectedTags.includes(tag.id)));
    setSelectedTags([]);
  };

  const handleCreateTag = () => {
    const newTag: Tag = {
      id: Date.now().toString(),
      name: formData.name,
      associatedSubjects: formData.associatedSubjects,
      status: formData.status ? "Active" : "Inactive",
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    };

    setTags([...tags, newTag]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateTag = () => {
    if (!currentTag) return;

    setTags(
      tags.map((tag) =>
        tag.id === currentTag.id
          ? {
              ...tag,
              name: formData.name,
              associatedSubjects: formData.associatedSubjects,
              status: formData.status ? "Active" : "Inactive",
              updatedDate: new Date().toISOString().split("T")[0],
            }
          : tag,
      ),
    );
    setIsEditDialogOpen(false);
    resetForm();
    setCurrentTag(null);
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter((tag) => tag.id !== tagId));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      associatedSubjects: [],
      status: true,
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (tag: Tag) => {
    setCurrentTag(tag);
    setFormData({
      name: tag.name,
      associatedSubjects: tag.associatedSubjects,
      status: tag.status === "Active",
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (tag: Tag) => {
    setCurrentTag(tag);
    setIsViewDialogOpen(true);
  };

  const handleSubjectToggle = (subject: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        associatedSubjects: [...formData.associatedSubjects, subject],
      });
    } else {
      setFormData({
        ...formData,
        associatedSubjects: formData.associatedSubjects.filter(
          (s) => s !== subject,
        ),
      });
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tag Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Tag
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Content Tags</CardTitle>
          <CardDescription>
            Manage content tags, filters, and search optimization for better
            content discovery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Subject" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Subjects</SelectItem>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedTags.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedTags.length} tag(s) selected
              </span>
              <Button size="sm" onClick={handleBulkActivate}>
                Activate
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleBulkDeactivate}
              >
                Deactivate
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkDelete}
              >
                Delete
              </Button>
            </div>
          )}

          {/* Tags Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedTags.length === filteredTags.length &&
                        filteredTags.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Tag Name</TableHead>
                  <TableHead>Associated Subjects</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTags.includes(tag.id)}
                        onCheckedChange={(checked) =>
                          handleSelectTag(tag.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                        {tag.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {tag.associatedSubjects
                          .slice(0, 3)
                          .map((subject, index) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {subject}
                            </Badge>
                          ))}
                        {tag.associatedSubjects.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{tag.associatedSubjects.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          tag.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {tag.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tag.createdDate}</TableCell>
                    <TableCell>{tag.updatedDate}</TableCell>
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
                          <DropdownMenuItem onClick={() => openViewDialog(tag)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(tag)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteTag(tag.id)}
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
          </div>

          {filteredTags.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No tags found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to improve content organization and searchability.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tag Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tag name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Associated Subjects</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {SUBJECTS.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`subject-${subject}`}
                      checked={formData.associatedSubjects.includes(subject)}
                      onCheckedChange={(checked) =>
                        handleSubjectToggle(subject, checked as boolean)
                      }
                    />
                    <Label htmlFor={`subject-${subject}`} className="text-sm">
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select subjects this tag should be associated with
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateTag}>
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag information and associated subjects.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Tag Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tag name"
              />
            </div>
            <div className="grid gap-2">
              <Label>Associated Subjects</Label>
              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {SUBJECTS.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-subject-${subject}`}
                      checked={formData.associatedSubjects.includes(subject)}
                      onCheckedChange={(checked) =>
                        handleSubjectToggle(subject, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`edit-subject-${subject}`}
                      className="text-sm"
                    >
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select subjects this tag should be associated with
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked })
                }
              />
              <Label htmlFor="edit-status">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateTag}>
              Update Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Tag Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tag Details</DialogTitle>
          </DialogHeader>
          {currentTag && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-semibold">Tag Name</Label>
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{currentTag.name}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Associated Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {currentTag.associatedSubjects.map((subject, index) => (
                    <Badge key={index} variant="outline">
                      {subject}
                    </Badge>
                  ))}
                </div>
                {currentTag.associatedSubjects.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No subjects associated
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Status</Label>
                <Badge
                  variant={
                    currentTag.status === "Active" ? "default" : "secondary"
                  }
                  className="w-fit"
                >
                  {currentTag.status}
                </Badge>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Created Date</Label>
                <p className="text-sm">{currentTag.createdDate}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Last Updated</Label>
                <p className="text-sm">{currentTag.updatedDate}</p>
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
