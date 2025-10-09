'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  cancelSession, 
  rescheduleSession, 
  refundSession
} from '@/lib/sessionsData';
import { getSessionById as getAdminSessionById, updateSession, type SessionDto } from '@/lib/adminSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  XCircle,
  Calendar,
  VideoIcon,
  ExternalLink,
} from 'lucide-react';

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<SessionDto | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Form states
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Editable fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const sessionData = await getAdminSessionById(Number(sessionId));
      setSession(sessionData);
      setEditTitle(sessionData.title || '');
      setEditStartTime(toDatetimeLocalString(sessionData.startTime));
      setEditEndTime(toDatetimeLocalString(sessionData.endTime));
      setEditStatus(sessionData.status || '');
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!session) return;
    setIsActionLoading(true);
    try {
      const success = await cancelSession(session.sessionId.toString(), cancelReason, 'admin-001');
      if (success) {
        setShowCancelDialog(false);
        setCancelReason('');
        fetchSession(); // Refresh data
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!session) return;
    setIsActionLoading(true);
    try {
      const success = await rescheduleSession(session.sessionId.toString(), newDate, newTime, 'admin-001');
      if (success) {
        setShowRescheduleDialog(false);
        setNewDate('');
        setNewTime('');
        fetchSession(); // Refresh data
      }
    } catch (error) {
      console.error('Error rescheduling session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save handler for editable fields
  const handleSaveEdit = async () => {
    if (!session) return;
    setIsActionLoading(true);
    try {
      // Convert datetime-local back to LocalDateTime string (no timezone conversion)
      const toLocalDateTime = (val: string) => {
        if (!val) return '';
        // val is in 'YYYY-MM-DDTHH:mm' or 'YYYY-MM-DDTHH:mm:ss' format
        // Ensure seconds are present
        return val.length === 16 ? val + ':00' : val;
      };
      const sessionDto = {
        ...session,
        title: editTitle !== '' ? editTitle : session.title,
        startTime: editStartTime !== '' ? toLocalDateTime(editStartTime) : session.startTime,
        endTime: editEndTime !== '' ? toLocalDateTime(editEndTime) : session.endTime,
        status: editStatus !== '' ? editStatus : session.status,
      };
      await updateSession(session.sessionId, sessionDto);
      setIsEditing(false);
      fetchSession();
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Ongoing': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
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

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The session you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/dashboard/admin/sessions">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sessions
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/sessions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Session Details</h1>
            <p className="text-muted-foreground">Session ID: {session.sessionId}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {session.status === 'Upcoming' && (
            <>
              <Button variant="outline" onClick={() => setShowRescheduleDialog(true)}>
                <Calendar className="w-4 h-4 mr-2" />
                Reschedule
              </Button>
              <Button variant="destructive" onClick={() => setShowCancelDialog(true)}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Session
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setIsEditing((v) => !v)}>
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Cancel Edit' : 'Edit Session'}
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <Badge className={getStatusColor(session.status)} variant="outline">
          {session.status}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Session Info - Full Width */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-6 h-6" />
                Session Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              {/* Editable fields */}
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Session Name</Label>
                    <Input 
                      value={editTitle} 
                      onChange={e => setEditTitle(e.target.value)}
                      className="h-12 text-base"
                      placeholder="Enter session name"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Start Time</Label>
                    <Input 
                      type="datetime-local" 
                      value={toDatetimeLocalString(editStartTime)} 
                      onChange={e => setEditStartTime(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">End Time</Label>
                    <Input 
                      type="datetime-local" 
                      value={toDatetimeLocalString(editEndTime)} 
                      onChange={e => setEditEndTime(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-foreground">Status</Label>
                    <select 
                      className="w-full border border-input rounded-md px-3 py-3 text-base bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                      value={editStatus} 
                      onChange={e => setEditStatus(e.target.value)}
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Tutor ID</Label>
                    <div className="h-12 px-3 py-3 border border-input rounded-md bg-muted text-base flex items-center">
                      {session.tutorId}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Subject ID</Label>
                    <div className="h-12 px-3 py-3 border border-input rounded-md bg-muted text-base flex items-center">
                      {session.subjectId}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Class ID</Label>
                    <div className="h-12 px-3 py-3 border border-input rounded-md bg-muted text-base flex items-center">
                      {session.classId}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Student IDs</Label>
                    <div className="h-12 px-3 py-3 border border-input rounded-md bg-muted text-base flex items-center">
                      {Array.isArray(session.studentIds) ? session.studentIds.join(', ') : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Created At</Label>
                    <div className="h-12 px-3 py-3 border border-input rounded-md bg-muted text-base flex items-center">
                      {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="md:col-span-2 lg:col-span-3 pt-4">
                    <Button 
                      onClick={handleSaveEdit} 
                      disabled={isActionLoading}
                      className="h-12 px-8 text-base font-semibold"
                      size="lg"
                    >
                      {isActionLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Session Name</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.title}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Start Time</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.startTime ? new Date(session.startTime).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">End Time</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.endTime ? new Date(session.endTime).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Status</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      <Badge className={getStatusColor(session.status)} variant="outline">
                        {session.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Tutor ID</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.tutorId}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Subject ID</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.subjectId}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Class ID</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.classId}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Student IDs</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {Array.isArray(session.studentIds) ? session.studentIds.join(', ') : 'N/A'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-muted-foreground">Created At</Label>
                    <div className="h-12 px-4 py-3 bg-muted/50 rounded-lg border text-base font-medium flex items-center">
                      {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meeting Links Section */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <VideoIcon className="w-6 h-6" />
                Meeting Links
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-muted-foreground">Moderator Link</Label>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-mono break-all">{session.moderatorLink || 'Not available'}</p>
                    {session.moderatorLink && (
                      <Button 
                        className="mt-3" 
                        variant="outline" 
                        onClick={() => window.open(session.moderatorLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join as Host
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-base font-semibold text-muted-foreground">Participant Link</Label>
                  <div className="p-4 bg-muted/50 rounded-lg border">
                    <p className="text-sm font-mono break-all">{session.participantLink || 'Not available'}</p>
                    {session.participantLink && (
                      <Button 
                        className="mt-3" 
                        variant="outline" 
                        onClick={() => window.open(session.participantLink, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join as Participant
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Session Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the session and automatically process a refund if payment was made.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="cancelReason">Cancellation Reason</Label>
            <Textarea
              id="cancelReason"
              placeholder="Enter reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={!cancelReason.trim() || isActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isActionLoading ? 'Cancelling...' : 'Cancel Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for this session.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newDateTime">New Date & Time</Label>
              <Input
                id="newDateTime"
                type="datetime-local"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={!newDate || isActionLoading}
            >
              {isActionLoading ? 'Rescheduling...' : 'Reschedule Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function toDatetimeLocalString(dateStr: string | undefined) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
