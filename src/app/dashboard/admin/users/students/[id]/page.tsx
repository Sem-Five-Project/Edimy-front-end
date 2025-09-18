'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getStudentByIdForAdmin, 
  updateStudentByIdForAdmin,
  deleteStudent,
  type StudentDtoForAdmin,
  StudentProfileStatus
} from '@/lib/adminStudent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Edit, 
  UserCheck, 
  UserX, 
  Trash2, 
  Mail,
  Calendar,
  Clock,
  User,
  Shield,
  AlertCircle,
  Save,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const studentId = params.id as string;

  const [student, setStudent] = useState<StudentDtoForAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<StudentProfileStatus>(StudentProfileStatus.ACTIVE);
  const [isEditing, setIsEditing] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [actionResult, setActionResult] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (studentId && !isNaN(parseInt(studentId))) {
      loadStudentData();
    }
  }, [studentId]);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const studentData = await getStudentByIdForAdmin(parseInt(studentId));
      setStudent(studentData);
      setAdminNotes(studentData.adminNotes || '');
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!student) return;

    console.log('🔍 Starting status update...');
    console.log('Student ID:', student.studentId);
    console.log('Current Status:', student.status);
    console.log('New Status:', newStatus);

    setUpdating(true);
    setActionResult(null);
    
    try {
      console.log('📤 Sending update request to backend...');
      const updateData = { status: newStatus };
      console.log('Update payload:', updateData);
      
      const updatedStudent = await updateStudentByIdForAdmin(student.studentId, updateData);
      console.log('✅ Backend response received:', updatedStudent);
      
      setStudent(updatedStudent);
      setShowStatusDialog(false);
      
      // Show success message
      const statusText = newStatus === StudentProfileStatus.ACTIVE ? 'reactivated' : 'suspended';
      setActionResult({
        type: 'success',
        message: `Student ${student.firstName} ${student.lastName} has been successfully ${statusText}.`
      });

      toast({
        title: "Status Updated",
        description: `Student has been ${statusText} successfully.`,
        duration: 5000,
      });

      // Clear success message after 5 seconds
      setTimeout(() => setActionResult(null), 5000);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      console.error('Error details:', {
        message: (error as any)?.message,
        status: (error as any)?.response?.status,
        data: (error as any)?.response?.data
      });
      
      setActionResult({
        type: 'error',
        message: 'Failed to update student status. Please try again or contact support if the problem persists.'
      });

      toast({
        title: "Error",
        description: "Failed to update student status. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStudent = async () => {
    if (!student) return;

    setDeleting(true);
    setActionResult(null);
    try {
      await deleteStudent(student.studentId);
      
      toast({
        title: "Student Deleted",
        description: `${student.firstName} ${student.lastName} has been successfully deleted.`,
        duration: 5000,
      });

      // Navigate back with a delay to show the toast
      setTimeout(() => {
        router.push('/dashboard/admin/users/students');
      }, 1000);
    } catch (error) {
      console.error('Error deleting student:', error);
      setActionResult({
        type: 'error',
        message: 'Failed to delete student. Please try again or contact support if the problem persists.'
      });

      toast({
        title: "Error",
        description: "Failed to delete student. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!student) return;

    setUpdating(true);
    setActionResult(null);
    try {
      const updatedStudent = await updateStudentByIdForAdmin(student.studentId, {
        adminNotes: adminNotes
      });
      setStudent(updatedStudent);
      setIsEditing(false);
      
      setActionResult({
        type: 'success',
        message: 'Admin notes have been successfully updated.'
      });

      toast({
        title: "Notes Updated",
        description: "Admin notes have been saved successfully.",
        duration: 3000,
      });

      // Clear success message after 3 seconds
      setTimeout(() => setActionResult(null), 3000);
    } catch (error) {
      console.error('Error updating admin notes:', error);
      setActionResult({
        type: 'error',
        message: 'Failed to update admin notes. Please try again.'
      });

      toast({
        title: "Error",
        description: "Failed to update admin notes. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: StudentProfileStatus) => {
    switch (status) {
      case StudentProfileStatus.ACTIVE: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case StudentProfileStatus.SUSPENDED: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold">Student Not Found</h2>
              <p className="text-muted-foreground">The requested student could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Result Banner */}
      {actionResult && (
        <Card className={`border-l-4 ${actionResult.type === 'success' 
          ? 'border-l-green-500 bg-green-50 dark:bg-green-950' 
          : 'border-l-red-500 bg-red-50 dark:bg-red-950'
        }`}>
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2">
              {actionResult.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-sm font-medium ${actionResult.type === 'success' 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
              }`}>
                {actionResult.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Student Profile</h1>
            <p className="text-muted-foreground">Detailed view and management</p>
          </div>
        </div>
        <div className="flex gap-2">
          {student.status === StudentProfileStatus.ACTIVE ? (
            <Button 
              variant="outline"
              onClick={() => { setNewStatus(StudentProfileStatus.SUSPENDED); setShowStatusDialog(true); }}
              disabled={updating || deleting}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend Account
                </>
              )}
            </Button>
          ) : student.status === StudentProfileStatus.SUSPENDED ? (
            <Button 
              variant="outline"
              onClick={() => { setNewStatus(StudentProfileStatus.ACTIVE); setShowStatusDialog(true); }}
              disabled={updating || deleting}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Reactivate Account
                </>
              )}
            </Button>
          ) : null}
          <Button 
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={updating || deleting}
          >
            {deleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Account
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Student Basic Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={student.profilePictureUrl} />
              <AvatarFallback className="text-lg">
                {student.firstName[0]}{student.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                  {student.accountLocked && (
                    <Badge variant="destructive">
                      <Shield className="w-3 h-3 mr-1" />
                      Account Locked
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-mono">
                  Student ID: {student.studentId} | User ID: {student.userId}
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{student.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">@{student.userName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Registered: {formatDate(student.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Last login: {student.lastLogin ? formatDate(student.lastLogin) : 'Never'}
                  </span>
                </div>
              </div>

              {student.educationLevel && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Education Level:</label>
                  <p className="text-sm mt-1">{student.educationLevel}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="admin-notes">Admin Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">First Name:</span>
                  <span>{student.firstName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Name:</span>
                  <span>{student.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{student.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span>@{student.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Locked:</span>
                  <span className={student.accountLocked ? 'text-red-600' : 'text-green-600'}>
                    {student.accountLocked ? 'Yes' : 'No'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created At:</span>
                  <span>{formatDate(student.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated:</span>
                  <span>{formatDate(student.updatedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Login:</span>
                  <span>{student.lastLogin ? formatDate(student.lastLogin) : 'Never'}</span>
                </div>
                {student.educationLevel && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Education Level:</span>
                    <span>{student.educationLevel}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="admin-notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Admin Notes
              </CardTitle>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAdminNotes(student.adminNotes || '');
                        setIsEditing(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveNotes}
                      disabled={updating}
                    >
                      {updating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Notes
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Notes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes about this student..."
                  rows={6}
                  className="w-full"
                />
              ) : (
                <div className="min-h-[120px] p-4 bg-muted rounded-md">
                  {student.adminNotes ? (
                    <p className="text-sm whitespace-pre-wrap">{student.adminNotes}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      No admin notes available. Click "Edit Notes" to add notes about this student.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Status Update Dialog */}
      <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {newStatus === StudentProfileStatus.ACTIVE ? (
                <UserCheck className="h-5 w-5 text-green-600" />
              ) : (
                <UserX className="h-5 w-5 text-yellow-600" />
              )}
              {newStatus === StudentProfileStatus.ACTIVE ? 'Reactivate Student Account' : 'Suspend Student Account'}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <span>
                  Are you sure you want to {newStatus === StudentProfileStatus.ACTIVE ? 'reactivate' : 'suspend'}{' '}
                  <span className="font-semibold">{student.firstName} {student.lastName}</span>'s account?
                </span>
                {newStatus === StudentProfileStatus.SUSPENDED ? (
                  <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3 mt-3">
                    <div className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Suspension Effects:</strong><br />
                      • Student will be unable to log in<br />
                      • Access to all features will be restricted<br />
                      • Existing sessions will be terminated<br />
                      • Account can be reactivated later
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded p-3 mt-3">
                    <div className="text-sm text-green-800 dark:text-green-200">
                      <strong>Reactivation Effects:</strong><br />
                      • Student will regain full access to their account<br />
                      • All features will be restored<br />
                      • Student can log in immediately
                    </div>
                  </div>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleStatusUpdate}
              disabled={updating}
              className={newStatus === StudentProfileStatus.ACTIVE ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {newStatus === StudentProfileStatus.ACTIVE ? 'Reactivating...' : 'Suspending...'}
                </>
              ) : (
                <>
                  {newStatus === StudentProfileStatus.ACTIVE ? 'Reactivate Account' : 'Suspend Account'}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Student Account
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <span>
                  You are about to permanently delete{' '}
                  <span className="font-semibold">{student.firstName} {student.lastName}</span>'s account.
                </span>
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800 dark:text-red-200">
                      <strong>Warning: This action is permanent and cannot be undone!</strong>
                      <ul className="mt-2 space-y-1 list-disc list-inside">
                        <li>All student data will be permanently deleted</li>
                        <li>Course enrollments and progress will be lost</li>
                        <li>Associated bookings and history will be removed</li>
                        <li>This action cannot be reversed</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <span className="text-sm">
                  If you're unsure, consider suspending the account instead, which can be reversed later.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setNewStatus(StudentProfileStatus.SUSPENDED);
                setShowStatusDialog(true);
              }}
              disabled={deleting}
            >
              Suspend Instead
            </Button>
            <AlertDialogAction 
              onClick={handleDeleteStudent}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Permanently
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
