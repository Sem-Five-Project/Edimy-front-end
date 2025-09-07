'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getSessions, 
  cancelSession,
  type SessionData 
} from '@/lib/sessionsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Search,
  MoreHorizontal,
  Eye,
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  Play,
  Square,
  RefreshCw,
  Activity,
  Flag,
  VideoIcon,
  MessageSquare,
  Phone,
  ExternalLink
} from 'lucide-react';

interface OngoingSessionWithDetails extends SessionData {
  elapsedTime: number; // minutes since start
  flaggedComplaints: number;
  attendanceStatus: 'both-joined' | 'tutor-only' | 'student-only' | 'none-joined';
  lastActivity: string;
  sessionQuality: 'good' | 'poor' | 'unknown';
}

type JoinMode = 'observer' | 'participant';

export default function OngoingSessionsPage() {
  const [ongoingSessions, setOngoingSessions] = useState<OngoingSessionWithDetails[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<OngoingSessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [studentSearch, setStudentSearch] = useState('');
  const [tutorSearch, setTutorSearch] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  
  // Dialog states
  const [selectedSession, setSelectedSession] = useState<OngoingSessionWithDetails | null>(null);
  const [showSessionDetail, setShowSessionDetail] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [joinMode, setJoinMode] = useState<JoinMode>('observer');
  const [endReason, setEndReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    fetchOngoingSessions();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchOngoingSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = ongoingSessions;
    
    if (studentSearch) {
      filtered = filtered.filter(session =>
        session.student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        session.student.email.toLowerCase().includes(studentSearch.toLowerCase())
      );
    }
    
    if (tutorSearch) {
      filtered = filtered.filter(session =>
        session.tutor.name.toLowerCase().includes(tutorSearch.toLowerCase()) ||
        session.tutor.email.toLowerCase().includes(tutorSearch.toLowerCase())
      );
    }
    
    if (subjectSearch) {
      filtered = filtered.filter(session =>
        session.subject.toLowerCase().includes(subjectSearch.toLowerCase())
      );
    }
    
    setFilteredSessions(filtered);
  }, [ongoingSessions, studentSearch, tutorSearch, subjectSearch]);

  const fetchOngoingSessions = async () => {
    try {
      const response = await getSessions({ status: 'Ongoing' });
      
      // Transform sessions to include additional ongoing session data
      const enhancedSessions: OngoingSessionWithDetails[] = response.sessions.map(session => {
        const startTime = session.attendance.sessionStartTime 
          ? new Date(session.attendance.sessionStartTime)
          : new Date(session.scheduledDate + 'T' + session.scheduledTime);
        
        const elapsedMinutes = Math.floor((Date.now() - startTime.getTime()) / (1000 * 60));
        
        let attendanceStatus: OngoingSessionWithDetails['attendanceStatus'] = 'none-joined';
        if (session.attendance.studentJoined && session.attendance.tutorJoined) {
          attendanceStatus = 'both-joined';
        } else if (session.attendance.tutorJoined) {
          attendanceStatus = 'tutor-only';
        } else if (session.attendance.studentJoined) {
          attendanceStatus = 'student-only';
        }

        return {
          ...session,
          elapsedTime: elapsedMinutes,
          flaggedComplaints: Math.floor(Math.random() * 3), // Mock data
          attendanceStatus,
          lastActivity: new Date(Date.now() - Math.random() * 300000).toISOString(), // Random within last 5 min
          sessionQuality: Math.random() > 0.8 ? 'poor' : 'good'
        };
      });
      
      setOngoingSessions(enhancedSessions);
    } catch (error) {
      console.error('Error fetching ongoing sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async (session: OngoingSessionWithDetails, mode: JoinMode) => {
    setIsActionLoading(true);
    try {
      // Simulate join action
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add audit log entry
      const action = mode === 'observer' ? 'joined as Observer' : 'joined as Participant';
      session.history.push({
        action: `Admin ${action}`,
        timestamp: new Date().toISOString(),
        performedBy: 'Admin User',
        details: `Admin joined session ${session.id} as ${mode}`
      });
      
      // Open meeting link
      if (session.meetingLink) {
        window.open(`${session.meetingLink}?role=${mode}&admin=true`, '_blank');
      }
      
      setShowJoinDialog(false);
      console.log(`Joined session ${session.id} as ${mode}`);
    } catch (error) {
      console.error('Error joining session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEndSession = async (session: OngoingSessionWithDetails) => {
    setIsActionLoading(true);
    try {
      const success = await cancelSession(session.id, endReason, 'admin-001');
      if (success) {
        setShowEndDialog(false);
        setEndReason('');
        fetchOngoingSessions();
      }
    } catch (error) {
      console.error('Error ending session:', error);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getAttendanceStatusColor = (status: OngoingSessionWithDetails['attendanceStatus']) => {
    switch (status) {
      case 'both-joined': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'tutor-only': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'student-only': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'none-joined': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getAttendanceStatusText = (status: OngoingSessionWithDetails['attendanceStatus']) => {
    switch (status) {
      case 'both-joined': return 'Both Joined';
      case 'tutor-only': return 'Tutor Only';
      case 'student-only': return 'Student Only';
      case 'none-joined': return 'None Joined';
      default: return 'Unknown';
    }
  };

  const formatElapsedTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
            {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Live Sessions Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of active tutoring sessions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOngoingSessions} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-muted-foreground">
            Auto-refresh: 10s
          </div>
        </div>
      </div>

      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-xl font-bold">{ongoingSessions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Both Joined</p>
                <p className="text-xl font-bold">
                  {ongoingSessions.filter(s => s.attendanceStatus === 'both-joined').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Flag className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Flagged Issues</p>
                <p className="text-xl font-bold">
                  {ongoingSessions.reduce((sum, s) => sum + s.flaggedComplaints, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Duration</p>
                <p className="text-xl font-bold">
                  {ongoingSessions.length > 0 
                    ? formatElapsedTime(Math.round(ongoingSessions.reduce((sum, s) => sum + s.elapsedTime, 0) / ongoingSessions.length))
                    : '0m'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Student</Label>
              <Input
                placeholder="Search student name or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
              />
            </div>
            <div>
              <Label>Tutor</Label>
              <Input
                placeholder="Search tutor name or email..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
              />
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                placeholder="Search subject..."
                value={subjectSearch}
                onChange={(e) => setSubjectSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Ongoing Sessions</h3>
            <p className="text-muted-foreground">
              {ongoingSessions.length === 0 
                ? "There are currently no active sessions."
                : "No sessions match your search criteria."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Live Sessions ({filteredSessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Session ID</th>
                    <th className="text-left p-4">Student</th>
                    <th className="text-left p-4">Tutor</th>
                    <th className="text-left p-4">Subject</th>
                    <th className="text-left p-4">Start Time</th>
                    <th className="text-left p-4">Elapsed</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Flags</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.map((session) => (
                    <tr key={session.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{session.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session.attendance.studentJoined ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="font-medium">{session.student.name}</div>
                            <div className="text-sm text-muted-foreground">{session.student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            session.attendance.tutorJoined ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="font-medium">{session.tutor.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ⭐ {session.tutor.rating}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{session.subject}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {session.attendance.sessionStartTime
                            ? new Date(session.attendance.sessionStartTime).toLocaleTimeString()
                            : session.scheduledTime
                          }
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatElapsedTime(session.elapsedTime)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getAttendanceStatusColor(session.attendanceStatus)}>
                          {getAttendanceStatusText(session.attendanceStatus)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {session.flaggedComplaints > 0 ? (
                          <div className="flex items-center gap-1">
                            <Flag className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-red-600">{session.flaggedComplaints}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">None</span>
                        )}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border border-border shadow-md">
                            <DropdownMenuItem onClick={() => {
                              setSelectedSession(session);
                              setShowSessionDetail(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedSession(session);
                              setJoinMode('observer');
                              setShowJoinDialog(true);
                            }}>
                              <VideoIcon className="w-4 h-4 mr-2" />
                              Join as Observer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedSession(session);
                              setJoinMode('participant');
                              setShowJoinDialog(true);
                            }}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Join as Participant
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setSelectedSession(session);
                                setShowEndDialog(true);
                              }}
                            >
                              <Square className="w-4 h-4 mr-2" />
                              End Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Detail Dialog */}
      <Dialog open={showSessionDetail} onOpenChange={setShowSessionDetail}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Session Details - {selectedSession?.id}</DialogTitle>
            <DialogDescription>
              Live session monitoring and control panel
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subject:</span>
                      <Badge variant="outline">{selectedSession.subject}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{selectedSession.duration} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Elapsed:</span>
                      <span className="font-medium">{formatElapsedTime(selectedSession.elapsedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Progress:</span>
                      <span>{Math.min(100, Math.round((selectedSession.elapsedTime / selectedSession.duration) * 100))}%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Payment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Session Fee:</span>
                      <span className="font-medium">${selectedSession.payment.sessionFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge className={
                        selectedSession.payment.paymentStatus === 'Paid' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedSession.payment.paymentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Student
                      <div className={`w-3 h-3 rounded-full ${
                        selectedSession.attendance.studentJoined ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{selectedSession.student.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedSession.student.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Tutor
                      <div className={`w-3 h-3 rounded-full ${
                        selectedSession.attendance.tutorJoined ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">{selectedSession.tutor.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedSession.tutor.email}</p>
                      <p className="text-sm text-muted-foreground">Rating: ⭐ {selectedSession.tutor.rating}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Admin Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Admin Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-3">
                    <Button onClick={() => {
                      setJoinMode('observer');
                      setShowJoinDialog(true);
                      setShowSessionDetail(false);
                    }}>
                      <VideoIcon className="w-4 h-4 mr-2" />
                      Join as Observer
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setJoinMode('participant');
                      setShowJoinDialog(true);
                      setShowSessionDetail(false);
                    }}>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Join as Participant
                    </Button>
                    <Button variant="destructive" onClick={() => {
                      setShowEndDialog(true);
                      setShowSessionDetail(false);
                    }}>
                      <Square className="w-4 h-4 mr-2" />
                      End Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSessionDetail(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Session Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Join Session as {joinMode === 'observer' ? 'Observer' : 'Participant'}
            </DialogTitle>
            <DialogDescription>
              {joinMode === 'observer' 
                ? "You will join this session silently. Participants won't see you."
                : "You will join this session as a visible participant. Both student and tutor will see you."
              }
            </DialogDescription>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Session: {selectedSession.id}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Subject: {selectedSession.subject}</div>
                  <div>Elapsed: {formatElapsedTime(selectedSession.elapsedTime)}</div>
                  <div>Student: {selectedSession.student.name}</div>
                  <div>Tutor: {selectedSession.tutor.name}</div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <strong>Note:</strong> Your join activity will be logged for audit purposes.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedSession && handleJoinSession(selectedSession, joinMode)}
              disabled={isActionLoading}
            >
              {isActionLoading ? 'Joining...' : `Join as ${joinMode}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* End Session Dialog */}
      <AlertDialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>End Session Early</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately terminate the ongoing session. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="endReason">Reason for ending session</Label>
            <Textarea
              id="endReason"
              placeholder="Enter reason for ending session early..."
              value={endReason}
              onChange={(e) => setEndReason(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSession && handleEndSession(selectedSession)}
              disabled={!endReason.trim() || isActionLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isActionLoading ? 'Ending...' : 'End Session'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
