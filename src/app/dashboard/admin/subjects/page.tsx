"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PlusIcon, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";

interface Subject {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  updatedDate: string;
}

const CATEGORIES = [
  'Mathematics',
  'Science',
  'Languages',
  'Computer Science',
  'Arts',
  'Social Studies',
  'Business',
  'Engineering',
  'Medicine',
  'Other'
];

const mockSubjects: Subject[] = [
  {
    id: '1',
    name: 'Advanced Calculus',
    category: 'Mathematics',
    description: 'Advanced mathematical concepts including limits, derivatives, and integrals',
    status: 'Active',
    createdDate: '2024-01-15',
    updatedDate: '2024-03-20'
  },
  {
    id: '2',
    name: 'Organic Chemistry',
    category: 'Science',
    description: 'Study of carbon-based compounds and their reactions',
    status: 'Active',
    createdDate: '2024-01-20',
    updatedDate: '2024-02-15'
  },
  {
    id: '3',
    name: 'Spanish Grammar',
    category: 'Languages',
    description: 'Comprehensive Spanish grammar rules and applications',
    status: 'Inactive',
    createdDate: '2024-02-01',
    updatedDate: '2024-02-28'
  },
  {
    id: '4',
    name: 'Data Structures',
    category: 'Computer Science',
    description: 'Fundamental data structures and algorithms',
    status: 'Active',
    createdDate: '2024-02-10',
    updatedDate: '2024-03-15'
  },
  {
    id: '5',
    name: 'Digital Art',
    category: 'Arts',
    description: 'Creating art using digital tools and techniques',
    status: 'Active',
    createdDate: '2024-02-20',
    updatedDate: '2024-03-01'
  }
];

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>(mockSubjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    status: true
  });

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || !categoryFilter || subject.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || !statusFilter || subject.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSubjects(filteredSubjects.map(subject => subject.id));
    } else {
      setSelectedSubjects([]);
    }
  };

  const handleSelectSubject = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects([...selectedSubjects, subjectId]);
    } else {
      setSelectedSubjects(selectedSubjects.filter(id => id !== subjectId));
    }
  };

  const handleBulkActivate = () => {
    setSubjects(subjects.map(subject => 
      selectedSubjects.includes(subject.id) 
        ? { ...subject, status: 'Active' as const, updatedDate: new Date().toISOString().split('T')[0] }
        : subject
    ));
    setSelectedSubjects([]);
  };

  const handleBulkDeactivate = () => {
    setSubjects(subjects.map(subject => 
      selectedSubjects.includes(subject.id) 
        ? { ...subject, status: 'Inactive' as const, updatedDate: new Date().toISOString().split('T')[0] }
        : subject
    ));
    setSelectedSubjects([]);
  };

  const handleBulkDelete = () => {
    setSubjects(subjects.filter(subject => !selectedSubjects.includes(subject.id)));
    setSelectedSubjects([]);
  };

  const handleCreateSubject = () => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      status: formData.status ? 'Active' : 'Inactive',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0]
    };
    
    setSubjects([...subjects, newSubject]);
    setIsCreateDialogOpen(false);
    resetForm();
  };

  const handleUpdateSubject = () => {
    if (!currentSubject) return;
    
    setSubjects(subjects.map(subject => 
      subject.id === currentSubject.id 
        ? {
            ...subject,
            name: formData.name,
            category: formData.category,
            description: formData.description,
            status: formData.status ? 'Active' : 'Inactive',
            updatedDate: new Date().toISOString().split('T')[0]
          }
        : subject
    ));
    setIsEditDialogOpen(false);
    resetForm();
    setCurrentSubject(null);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjects(subjects.filter(subject => subject.id !== subjectId));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      status: true
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (subject: Subject) => {
    setCurrentSubject(subject);
    setFormData({
      name: subject.name,
      category: subject.category,
      description: subject.description,
      status: subject.status === 'Active'
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (subject: Subject) => {
    setCurrentSubject(subject);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Subject Management</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateDialog}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
          <CardDescription>
            Manage all subjects and categories for tutoring sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
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
          {selectedSubjects.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedSubjects.length} subject(s) selected
              </span>
              <Button size="sm" onClick={handleBulkActivate}>
                Activate
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkDeactivate}>
                Deactivate
              </Button>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                Delete
              </Button>
            </div>
          )}

          {/* Subjects Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedSubjects.length === filteredSubjects.length && filteredSubjects.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Updated Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={(checked) => handleSelectSubject(subject.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subject.category}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{subject.description}</TableCell>
                    <TableCell>
                      <Badge variant={subject.status === 'Active' ? 'default' : 'secondary'}>
                        {subject.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{subject.createdDate}</TableCell>
                    <TableCell>{subject.updatedDate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white dark:bg-gray-800 border shadow-lg">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(subject)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(subject)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDeleteSubject(subject.id)}
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

          {filteredSubjects.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No subjects found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Subject Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to the tutoring catalog.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter subject description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              />
              <Label htmlFor="status">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateSubject}>
              Create Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Update the subject information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Subject Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter subject description"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              />
              <Label htmlFor="edit-status">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleUpdateSubject}>
              Update Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Subject Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Subject Details</DialogTitle>
          </DialogHeader>
          {currentSubject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label className="font-semibold">Subject Name</Label>
                <p className="text-sm">{currentSubject.name}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Category</Label>
                <Badge variant="outline" className="w-fit">{currentSubject.category}</Badge>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Description</Label>
                <p className="text-sm">{currentSubject.description}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Status</Label>
                <Badge variant={currentSubject.status === 'Active' ? 'default' : 'secondary'} className="w-fit">
                  {currentSubject.status}
                </Badge>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Created Date</Label>
                <p className="text-sm">{currentSubject.createdDate}</p>
              </div>
              <div className="grid gap-2">
                <Label className="font-semibold">Last Updated</Label>
                <p className="text-sm">{currentSubject.updatedDate}</p>
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
