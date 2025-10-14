"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getTutorById,
  updateTutorAdminFields,
  type TutorDto,
} from "@/lib/adminTutor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, User, Shield, Star, FileText } from "lucide-react";

interface TutorEditPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TutorEditPage({ params }: TutorEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [tutor, setTutor] = useState<TutorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state - focusing on admin-editable fields
  const [formData, setFormData] = useState({
    adminNotes: "",
    verified: false,
    rating: 0,
    status: "ACTIVE" as "ACTIVE" | "SUSPENDED",
  });

  useEffect(() => {
    fetchTutor();
  }, [resolvedParams.id]);

  const fetchTutor = async () => {
    setLoading(true);
    try {
      console.log("Fetching tutor with ID:", resolvedParams.id);
      const tutorData = await getTutorById(resolvedParams.id);
      console.log("Fetched tutor data:", tutorData);

      if (tutorData) {
        setTutor(tutorData);
        setFormData({
          adminNotes: tutorData.adminNotes || "",
          verified: tutorData.verified,
          rating: tutorData.rating || 0,
          status: tutorData.status,
        });
        console.log("Set form data:", {
          adminNotes: tutorData.adminNotes || "",
          verified: tutorData.verified,
          rating: tutorData.rating || 0,
          status: tutorData.status,
        });
      }
    } catch (error) {
      console.error("Error fetching tutor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Saving tutor with ID:", resolvedParams.id);
      console.log("Form data being sent:", formData);

      // Validate and clean up the form data before sending
      const cleanFormData = {
        ...formData,
        rating: isNaN(formData.rating)
          ? 0
          : Math.max(0, Math.min(5, formData.rating)), // Clamp rating between 0-5
        adminNotes: formData.adminNotes?.trim() || "", // Trim whitespace
      };

      console.log("Cleaned form data:", cleanFormData);

      await updateTutorAdminFields(resolvedParams.id, cleanFormData);
      router.push(`/dashboard/admin/users/tutors/${resolvedParams.id}`);
    } catch (error: any) {
      console.error("Error saving tutor:", error);

      // More detailed error message based on error type
      let errorMessage = "Error saving changes. Please try again.";

      if (error?.response?.status === 500) {
        errorMessage =
          "Server error occurred. Please check the server logs and try again.";
      } else if (error?.response?.status === 400) {
        errorMessage = "Invalid data provided. Please check your inputs.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Tutor not found. The tutor may have been deleted.";
      } else if (error?.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action.";
      } else if (error?.response?.data?.message) {
        errorMessage = `Error: ${error.response.data.message}`;
      }

      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Tutor Not Found</h2>
          <p className="text-gray-600 mt-2">
            The tutor you're trying to edit doesn't exist.
          </p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/users/tutors">Back to Tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/admin/users/tutors/${resolvedParams.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Tutor - Admin Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Tutor Basic Info Display */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Tutor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Name</Label>
              <p className="text-lg font-medium">
                {tutor.firstName} {tutor.lastName}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-lg">{tutor.email}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Username
              </Label>
              <p className="text-lg">{tutor.userName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Hourly Rate
              </Label>
              <p className="text-lg font-medium">${tutor.hourlyRate}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Experience
              </Label>
              <p className="text-lg">{tutor.experienceInMonths} months</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">
                Completion Rate
              </Label>
              <p className="text-lg">{tutor.classCompletionRate}%</p>
            </div>
          </div>
          {tutor.bio && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-500">Bio</Label>
              <p className="text-sm text-gray-700 mt-1">{tutor.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        {/* Admin Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Verification Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-base font-medium">
                <Shield className="w-4 h-4" />
                Verification Status
              </Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) =>
                    handleInputChange("verified", checked as boolean)
                  }
                />
                <label htmlFor="verified" className="text-sm font-medium">
                  Verified Tutor
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Verified tutors are displayed with a verification badge to
                students
              </p>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status" className="text-base font-medium">
                Account Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ACTIVE" | "SUSPENDED") =>
                  handleInputChange("status", value)
                }
              >
                <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white hover:bg-slate-700 focus:ring-slate-600">
                  <SelectValue className="text-white" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="ACTIVE"
                    className="text-green-300 hover:bg-slate-700 focus:bg-slate-700 focus:text-green-300"
                  >
                    Active
                  </SelectItem>
                  <SelectItem
                    value="SUSPENDED"
                    className="text-yellow-300 hover:bg-slate-700 focus:bg-slate-700 focus:text-yellow-300"
                  >
                    Suspended
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Suspended tutors cannot accept new bookings or conduct sessions
              </p>
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label
                htmlFor="rating"
                className="flex items-center gap-2 text-base font-medium"
              >
                <Star className="w-4 h-4" />
                Admin Rating Override
              </Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating || 0}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  const clampedValue = Math.max(0, Math.min(5, value));
                  handleInputChange("rating", clampedValue);
                }}
                placeholder="0.0"
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Override the calculated rating (0-5). Leave at 0 to use
                calculated rating.
              </p>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label
                htmlFor="adminNotes"
                className="flex items-center gap-2 text-base font-medium"
              >
                <FileText className="w-4 h-4" />
                Admin Notes
              </Label>
              <Textarea
                id="adminNotes"
                value={formData.adminNotes}
                onChange={(e) =>
                  handleInputChange("adminNotes", e.target.value)
                }
                placeholder="Internal notes for admin use only. This is not visible to the tutor or students."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                These notes are only visible to administrators and are not
                shared with tutors or students
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/admin/users/tutors/${resolvedParams.id}`}>
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
