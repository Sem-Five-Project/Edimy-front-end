"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  getFaqStats,
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  FaqDto,
  FaqStatsDto,
} from "@/lib/adminfaq";

const FAQ_CATEGORIES = [
  { value: "TUTOR", label: "Tutor" },
  { value: "STUDENT", label: "Student" },
];

export default function FAQManagementPage() {
  const [faqs, setFaqs] = useState<FaqDto[]>([]);
  const [stats, setStats] = useState<FaqStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [faqsData, statsData] = await Promise.all([
        getAllFaqs(),
        getFaqStats(),
      ]);
      setFaqs(faqsData);
      setStats(statsData);
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.response?.data?.error ||
        err?.message || 
        "Failed to fetch FAQ data. Please ensure the backend server is running.";
      
      setError(errorMessage);
      console.error("Error fetching FAQ data:", err);
      console.error("Error details:", {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      searchTerm === "" ||
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "active" && faq.isActive) ||
      (selectedStatus === "inactive" && !faq.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateFAQ = async () => {
    try {
      if (!formData.question || !formData.answer || !formData.category) {
        setError("All fields are required");
        return;
      }

      await createFaq({
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        isActive: formData.isActive,
      });

      await fetchData(); // Refresh data
      setFormData({ question: "", answer: "", category: "", isActive: true });
      setShowCreateDialog(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to create FAQ");
    }
  };

  const handleEditFAQ = async () => {
    if (!selectedFaq) return;

    try {
      await updateFaq(selectedFaq.faqId, {
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        isActive: formData.isActive,
      });

      await fetchData(); // Refresh data
      setShowEditDialog(false);
      setSelectedFaq(null);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to update FAQ");
    }
  };

  const handleDeleteFAQ = async (faqId: number) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await deleteFaq(faqId);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to delete FAQ");
    }
  };

  const handleToggleStatus = async (faq: FaqDto) => {
    try {
      await updateFaq(faq.faqId, {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: !faq.isActive,
      });
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message || "Failed to toggle status");
    }
  };

  const openEditDialog = (faq: FaqDto) => {
    setSelectedFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
    });
    setShowEditDialog(true);
  };

  const openPreviewDialog = (faq: FaqDto) => {
    setSelectedFaq(faq);
    setShowPreviewDialog(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">Inactive</Badge>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = FAQ_CATEGORIES.find((c) => c.value === category);
    return <Badge variant="outline">{categoryConfig?.label || category}</Badge>;
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "", category: "", isActive: true });
    setError(null);
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
          <h1 className="text-3xl font-bold">FAQ Management</h1>
          <p className="text-muted-foreground">
            Manage help content for students and tutors
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create FAQ
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Error Loading FAQ Data
                </h3>
                <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
                <div className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <p>Possible causes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Backend server is not running (expected at http://localhost:8083/api)</li>
                    <li>FAQ endpoints are not implemented on the backend</li>
                    <li>Database connection issue</li>
                    <li>CORS or network connectivity problems</li>
                  </ul>
                </div>
                <Button 
                  onClick={fetchData} 
                  variant="outline" 
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total FAQs
                </p>
                <p className="text-2xl font-bold">{stats?.totalFaqs || 0}</p>
              </div>
              <HelpCircle className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active FAQs
                </p>
                <p className="text-2xl font-bold">{stats?.activeFaqs || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Categories
                </p>
                <p className="text-2xl font-bold">
                  {stats?.categoryCount || 0}
                </p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search FAQs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
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
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>FAQs ({filteredFAQs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFAQs.map((faq) => (
                <TableRow key={faq.faqId}>
                  <TableCell className="max-w-md">
                    <div className="truncate" title={faq.question}>
                      {faq.question}
                    </div>
                  </TableCell>
                  <TableCell>{getCategoryBadge(faq.category)}</TableCell>
                  <TableCell>{getStatusBadge(faq.isActive)}</TableCell>
                  <TableCell>
                    {new Date(faq.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openPreviewDialog(faq)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(faq)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(faq)}
                      >
                        {faq.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFAQ(faq.faqId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFAQs.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-gray-500"
                  >
                    No FAQs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create FAQ Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New FAQ</DialogTitle>
            <DialogDescription>
              Add a new frequently asked question to help users
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="question">
                Question
              </Label>
              <Input
                id="question"
                placeholder="Enter the question..."
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="answer">
                Answer
              </Label>
              <Textarea
                id="answer"
                placeholder="Enter the detailed answer..."
                value={formData.answer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, answer: e.target.value }))
                }
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="status">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateFAQ}
              disabled={
                !formData.question || !formData.answer || !formData.category
              }
            >
              Create FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the FAQ question and answer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-question">
                Question
              </Label>
              <Input
                id="edit-question"
                placeholder="Enter the question..."
                value={formData.question}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, question: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-answer">
                Answer
              </Label>
              <Textarea
                id="edit-answer"
                placeholder="Enter the detailed answer..."
                value={formData.answer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, answer: e.target.value }))
                }
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {FAQ_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-status"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isActive: checked }))
                }
              />
              <Label htmlFor="edit-status">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditFAQ}>
              Update FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview FAQ Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>FAQ Preview</DialogTitle>
            <DialogDescription>
              How this FAQ will appear to users
            </DialogDescription>
          </DialogHeader>

          {selectedFaq && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getCategoryBadge(selectedFaq.category)}
                {getStatusBadge(selectedFaq.isActive)}
              </div>

              <Accordion type="single" defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    {selectedFaq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    {selectedFaq.answer}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex items-center justify-between text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <span>FAQ ID: {selectedFaq.faqId}</span>
                </div>
                <span>
                  Created:{" "}
                  {new Date(selectedFaq.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPreviewDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
