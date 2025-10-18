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
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Edit,
  Star,
  MessageSquare,
  User,
  Calendar,
} from "lucide-react";

interface Review {
  id: string;
  tutorName: string;
  tutorId: string;
  studentName: string;
  studentId: string;
  rating: number;
  reviewText: string;
  dateSubmitted: string;
  status: "Visible" | "Hidden" | "Pending";
  adminNotes?: string;
}

const mockReviews: Review[] = [
  {
    id: "1",
    tutorName: "Dr. Sarah Johnson",
    tutorId: "tutor-001",
    studentName: "Alex Chen",
    studentId: "student-001",
    rating: 5,
    reviewText:
      "Excellent tutor! Very knowledgeable and patient. Helped me understand calculus concepts clearly.",
    dateSubmitted: "2024-03-15",
    status: "Visible",
  },
  {
    id: "2",
    tutorName: "Prof. Michael Brown",
    tutorId: "tutor-002",
    studentName: "Emma Wilson",
    studentId: "student-002",
    rating: 2,
    reviewText:
      "The tutor was often late and seemed unprepared. Not worth the money.",
    dateSubmitted: "2024-03-14",
    status: "Pending",
    adminNotes: "Investigating timing issues with this tutor",
  },
  {
    id: "3",
    tutorName: "Dr. Lisa Garcia",
    tutorId: "tutor-003",
    studentName: "James Smith",
    studentId: "student-003",
    rating: 4,
    reviewText: "Good teacher, but the sessions could be more interactive.",
    dateSubmitted: "2024-03-13",
    status: "Visible",
  },
  {
    id: "4",
    tutorName: "Prof. David Lee",
    tutorId: "tutor-004",
    studentName: "Sophie Davis",
    studentId: "student-004",
    rating: 1,
    reviewText: "Terrible experience. The tutor was rude and inappropriate.",
    dateSubmitted: "2024-03-12",
    status: "Hidden",
    adminNotes: "Hidden due to inappropriate language",
  },
  {
    id: "5",
    tutorName: "Dr. Anna Martinez",
    tutorId: "tutor-005",
    studentName: "Ryan Johnson",
    studentId: "student-005",
    rating: 5,
    reviewText: "Amazing tutor! Made chemistry so much easier to understand.",
    dateSubmitted: "2024-03-11",
    status: "Visible",
  },
];

export default function RatingsReviews() {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch =
      review.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.reviewText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating =
      ratingFilter === "all" || review.rating.toString() === ratingFilter;
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;

    return matchesSearch && matchesRating && matchesStatus;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">({rating})</span>
      </div>
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReviews(filteredReviews.map((review) => review.id));
    } else {
      setSelectedReviews([]);
    }
  };

  const handleSelectReview = (reviewId: string, checked: boolean) => {
    if (checked) {
      setSelectedReviews([...selectedReviews, reviewId]);
    } else {
      setSelectedReviews(selectedReviews.filter((id) => id !== reviewId));
    }
  };

  const handleBulkApprove = () => {
    setReviews(
      reviews.map((review) =>
        selectedReviews.includes(review.id)
          ? { ...review, status: "Visible" as const }
          : review,
      ),
    );
    setSelectedReviews([]);
  };

  const handleBulkReject = () => {
    setReviews(
      reviews.map((review) =>
        selectedReviews.includes(review.id)
          ? { ...review, status: "Hidden" as const }
          : review,
      ),
    );
    setSelectedReviews([]);
  };

  const handleApproveReview = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, status: "Visible" as const }
          : review,
      ),
    );
  };

  const handleRejectReview = (reviewId: string) => {
    setReviews(
      reviews.map((review) =>
        review.id === reviewId
          ? { ...review, status: "Hidden" as const }
          : review,
      ),
    );
  };

  const openViewDialog = (review: Review) => {
    setCurrentReview(review);
    setAdminNotes(review.adminNotes || "");
    setIsViewDialogOpen(true);
  };

  const openEditDialog = (review: Review) => {
    setCurrentReview(review);
    setAdminNotes(review.adminNotes || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveAdminNotes = () => {
    if (!currentReview) return;

    setReviews(
      reviews.map((review) =>
        review.id === currentReview.id ? { ...review, adminNotes } : review,
      ),
    );
    setIsEditDialogOpen(false);
    setCurrentReview(null);
    setAdminNotes("");
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Visible":
        return "default";
      case "Hidden":
        return "destructive";
      case "Pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Ratings & Reviews Moderation
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Management</CardTitle>
          <CardDescription>
            Monitor and moderate tutor ratings and student reviews to ensure
            quality and appropriateness.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews, tutors, or students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Rating" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Visible">Visible</SelectItem>
                <SelectItem value="Hidden">Hidden</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="flex items-center space-x-2 mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-sm font-medium">
                {selectedReviews.length} review(s) selected
              </span>
              <Button size="sm" onClick={handleBulkApprove}>
                <Check className="mr-1 h-3 w-3" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkReject}
              >
                <X className="mr-1 h-3 w-3" />
                Reject
              </Button>
            </div>
          )}

          {/* Reviews Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={
                        selectedReviews.length === filteredReviews.length &&
                        filteredReviews.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Review Preview</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReviews.includes(review.id)}
                        onCheckedChange={(checked) =>
                          handleSelectReview(review.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{review.tutorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {review.studentName}
                      </div>
                    </TableCell>
                    <TableCell>{renderStars(review.rating)}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate">{review.reviewText}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {review.dateSubmitted}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(review.status)}>
                        {review.status}
                      </Badge>
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
                            onClick={() => openViewDialog(review)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(review)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Notes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {review.status !== "Visible" && (
                            <DropdownMenuItem
                              onClick={() => handleApproveReview(review.id)}
                            >
                              <Check className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {review.status !== "Hidden" && (
                            <DropdownMenuItem
                              onClick={() => handleRejectReview(review.id)}
                              className="text-red-600"
                            >
                              <X className="mr-2 h-4 w-4" />
                              Hide
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No reviews found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Review Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Details</DialogTitle>
          </DialogHeader>
          {currentReview && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Tutor</Label>
                  <p className="text-sm">{currentReview.tutorName}</p>
                  <Button variant="link" className="p-0 h-auto text-blue-600">
                    View Tutor Profile
                  </Button>
                </div>
                <div>
                  <Label className="font-semibold">Student</Label>
                  <p className="text-sm">{currentReview.studentName}</p>
                  <Button variant="link" className="p-0 h-auto text-blue-600">
                    View Student Profile
                  </Button>
                </div>
              </div>
              <div>
                <Label className="font-semibold">Rating</Label>
                <div className="mt-1">{renderStars(currentReview.rating)}</div>
              </div>
              <div>
                <Label className="font-semibold">Review Text</Label>
                <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm">{currentReview.reviewText}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-semibold">Date Submitted</Label>
                  <p className="text-sm">{currentReview.dateSubmitted}</p>
                </div>
                <div>
                  <Label className="font-semibold">Status</Label>
                  <Badge
                    variant={getStatusBadgeVariant(currentReview.status)}
                    className="w-fit mt-1"
                  >
                    {currentReview.status}
                  </Badge>
                </div>
              </div>
              {currentReview.adminNotes && (
                <div>
                  <Label className="font-semibold">Admin Notes</Label>
                  <div className="mt-1 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-sm">{currentReview.adminNotes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button type="button" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Admin Notes Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Admin Notes</DialogTitle>
            <DialogDescription>
              Add or update administrative notes for this review.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="admin-notes">Admin Notes</Label>
              <Textarea
                id="admin-notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter administrative notes about this review..."
                rows={4}
              />
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
            <Button type="button" onClick={handleSaveAdminNotes}>
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
