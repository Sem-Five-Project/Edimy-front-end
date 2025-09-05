'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getSessionById, 
  cancelSession, 
  rescheduleSession, 
  refundSession,
  type SessionData 
} from '@/lib/sessionsData';
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
  User,
  GraduationCap,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Edit,
  Download,
  MessageSquare
} from 'lucide-react';

export default function SessionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Form states
  const [cancelReason, setCancelReason] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const sessionData = await getSessionById(sessionId);
      setSession(sessionData);
      if (sessionData) {
        setRefundAmount(sessionData.payment.sessionFee.toString());
      }
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
      const success = await cancelSession(session.id, cancelReason, 'admin-001');
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
      const success = await rescheduleSession(session.id, newDate, newTime, 'admin-001');
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

  const handleRefund = async () => {
    if (!session) return;
    
    setIsActionLoading(true);
    try {
      const success = await refundSession(
        session.id, 
        parseFloat(refundAmount), 
        refundReason, 
        'admin-001'
      );
      if (success) {
        setShowRefundDialog(false);
        setRefundReason('');
        fetchSession(); // Refresh data
      }
    } catch (error) {
      console.error('Error processing refund:', error);
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

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Refunded': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
            <AlertTriangle className="w-12 h-12 mx-auto text-yellow-500 mb-4" />
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
            <p className="text-muted-foreground">Session ID: {session.id}</p>
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
          {session.payment.paymentStatus === 'Paid' && (
            <Button variant="outline" onClick={() => setShowRefundDialog(true)}>
              <DollarSign className="w-4 h-4 mr-2" />
              Process Refund
            </Button>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
        <Badge className={getStatusColor(session.status)} variant="outline">
          {session.status}
        </Badge>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date(session.updatedAt).toLocaleString()}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="payment">Payment Info</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="history">History & Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Subject</Label>
                    <p className="text-sm font-medium">{session.subject}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-sm font-medium">{session.duration} minutes</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date</Label>
                    <p className="text-sm font-medium">
                      {new Date(session.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Time</Label>
                    <p className="text-sm font-medium">{session.scheduledTime}</p>
                  </div>
                </div>

                {session.description && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <p className="text-sm">{session.description}</p>
                  </div>
                )}

                {session.meetingLink && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Meeting Link</Label>
                    <div className="flex items-center gap-2">
                      <Input value={session.meetingLink} readOnly className="text-xs" />
                      <Button size="sm" variant="outline" asChild>
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Session Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      ${session.payment.sessionFee}
                    </p>
                    <p className="text-sm text-muted-foreground">Session Fee</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {session.tutor.rating}
                    </p>
                    <p className="text-sm text-muted-foreground">Tutor Rating</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Booked:</span>
                    <span className="text-sm font-medium">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment Status:</span>
                    <Badge className={getPaymentStatusColor(session.payment.paymentStatus)}>
                      {session.payment.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="participants" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Student Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{session.student.name}</h3>
                    <p className="text-sm text-muted-foreground">{session.student.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Member Since:</span>
                    <span className="text-sm font-medium">
                      {new Date(session.student.joinedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tutor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Tutor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{session.tutor.name}</h3>
                    <p className="text-sm text-muted-foreground">{session.tutor.email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{session.tutor.rating}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Sessions:</span>
                    <span className="text-sm font-medium">{session.tutor.totalSessions}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Session Fee</Label>
                  <p className="text-2xl font-bold text-green-600">
                    ${session.payment.sessionFee} {session.payment.currency}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Payment Status</Label>
                  <div className="mt-1">
                    <Badge className={getPaymentStatusColor(session.payment.paymentStatus)}>
                      {session.payment.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {session.payment.paymentMethod && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Payment Method</Label>
                    <p className="text-sm font-medium">{session.payment.paymentMethod}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {session.payment.transactionId && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Transaction ID</Label>
                    <p className="text-sm font-mono">{session.payment.transactionId}</p>
                  </div>
                )}

                {session.payment.paidAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Paid At</Label>
                    <p className="text-sm">{new Date(session.payment.paidAt).toLocaleString()}</p>
                  </div>
                )}

                {session.payment.refundedAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Refunded At</Label>
                    <p className="text-sm">{new Date(session.payment.refundedAt).toLocaleString()}</p>
                  </div>
                )}

                {session.payment.refundAmount && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Refund Amount</Label>
                    <p className="text-sm font-medium text-red-600">
                      ${session.payment.refundAmount}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Attendance Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Attendance */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      session.attendance.studentJoined ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="font-semibold">Student Attendance</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`text-sm font-medium ${
                        session.attendance.studentJoined ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {session.attendance.studentJoined ? 'Joined' : 'Did not join'}
                      </span>
                    </div>
                    
                    {session.attendance.studentJoinTime && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Join Time:</span>
                        <span className="text-sm">
                          {new Date(session.attendance.studentJoinTime).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tutor Attendance */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-3 h-3 rounded-full ${
                      session.attendance.tutorJoined ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <h3 className="font-semibold">Tutor Attendance</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className={`text-sm font-medium ${
                        session.attendance.tutorJoined ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {session.attendance.tutorJoined ? 'Joined' : 'Did not join'}
                      </span>
                    </div>
                    
                    {session.attendance.tutorJoinTime && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Join Time:</span>
                        <span className="text-sm">
                          {new Date(session.attendance.tutorJoinTime).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Duration */}
              {session.attendance.actualDuration && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Session Duration</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Scheduled:</span>
                      <p className="text-sm font-medium">{session.duration} minutes</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Actual:</span>
                      <p className="text-sm font-medium">{session.attendance.actualDuration} minutes</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Session History & Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {session.history.map((entry, index) => (
                  <div key={index} className="flex gap-4 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium">{entry.action}</h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{entry.details}</p>
                      <p className="text-xs text-muted-foreground">
                        Performed by: {entry.performedBy}
                      </p>
                    </div>
                  </div>
                ))}
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
              <Label htmlFor="newDate">New Date</Label>
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="newTime">New Time</Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
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
              disabled={!newDate || !newTime || isActionLoading}
            >
              {isActionLoading ? 'Rescheduling...' : 'Reschedule Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
            <DialogDescription>
              Process a refund for this session payment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="refundAmount">Refund Amount ($)</Label>
              <Input
                id="refundAmount"
                type="number"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Original amount: ${session.payment.sessionFee}
              </p>
            </div>
            <div>
              <Label htmlFor="refundReason">Refund Reason</Label>
              <Textarea
                id="refundReason"
                placeholder="Enter reason for refund..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={!refundAmount || !refundReason.trim() || isActionLoading}
            >
              {isActionLoading ? 'Processing...' : 'Process Refund'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
