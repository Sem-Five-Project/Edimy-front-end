'use client';

import { getOngoingSessions, getSessionById, type SessionsDto } from '@/lib/adminSession';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
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
  DialogHeader,
  DialogTitle,
  DialogFooter
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
  const [ongoingSessions, setOngoingSessions] = useState<SessionsDto[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<SessionsDto[]>([]);
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

  // View session dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewSession, setViewSession] = useState<null | import('@/lib/adminSession').SessionDto>(null);
  const [viewLoading, setViewLoading] = useState(false);

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
      // No student name/email in SessionsDto, so skip or implement if you have mapping
    }

    if (tutorSearch) {
      filtered = filtered.filter(session =>
        session.tutorId.toString().includes(tutorSearch)
      );
    }

    if (subjectSearch) {
      filtered = filtered.filter(session =>
        session.title.toLowerCase().includes(subjectSearch.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [ongoingSessions, studentSearch, tutorSearch, subjectSearch]);

  const fetchOngoingSessions = async () => {
    setLoading(true);
    try {
      const response = await getOngoingSessions();
      setOngoingSessions(response.content);
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

  const handleViewSession = async (sessionId: number) => {
    setViewLoading(true);
    setViewDialogOpen(true);
    try {
      const session = await getSessionById(sessionId);
      setViewSession(session);
    } catch (e) {
      setViewSession(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleJoinMeeting = (url: string) => {
    if (url) window.open(url, '_blank');
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
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ongoing Sessions</h1>
        <button onClick={fetchOngoingSessions} className="px-4 py-2 bg-blue-500 text-white rounded">Refresh</button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ongoing Sessions ({ongoingSessions.length} total)</CardTitle>
          <hr className="my-2 border-muted-foreground/30" />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-center p-4">Session ID</th>
                  <th className="text-center p-4">Title</th>
                  <th className="text-center p-4">Tutor ID</th>
                  <th className="text-center p-4">Class ID</th>
                  <th className="text-center p-4">Start Time</th>
                  <th className="text-center p-4">Duration</th>
                  <th className="text-center p-4">Status</th>
                  <th className="text-center p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted-foreground">No ongoing sessions found.</td>
                  </tr>
                ) : (
                  filteredSessions.map(session => (
                    <tr key={session.sessionId} className="border-b hover:bg-muted/50">
                      <td className="p-4 text-center">
                        <div className="font-mono text-sm">{session.sessionId}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm">{session.title}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-mono text-sm">{session.tutorId}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="font-mono text-sm">{session.classId}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm">{new Date(session.startTime).toLocaleString()}</div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="text-sm">{session.duration}</div>
                      </td>
                      <td className="p-4 text-center">
                        <Badge className={
                          session.status === 'Ongoing'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : session.status === 'Scheduled'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : session.status === 'Completed'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                            : session.status === 'Cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
                        }>
                          {session.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        <Button size="sm" variant="outline" onClick={() => handleViewSession(session.sessionId)}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Session Details</DialogTitle>
          </DialogHeader>
          {viewLoading ? (
            <div>Loading...</div>
          ) : viewSession ? (
            <div className="space-y-2">
              <div><b>Session ID:</b> {viewSession.sessionId}</div>
              <div><b>Title:</b> {viewSession.title}</div>
              <div><b>Tutor ID:</b> {viewSession.tutorId}</div>
              <div><b>Class ID:</b> {viewSession.classId}</div>
              <div><b>Start Time:</b> {new Date(viewSession.startTime).toLocaleString()}</div>
              <div><b>End Time:</b> {new Date(viewSession.endTime).toLocaleString()}</div>
              <div className="flex gap-2 mt-4">
                <Button variant="default" className="px-4 py-2 rounded font-semibold border border-white" onClick={() => handleJoinMeeting(viewSession.moderatorLink)}>
                  Join as Host
                </Button>
                <Button variant="secondary" className="px-4 py-2 rounded font-semibold border border-white" onClick={() => handleJoinMeeting(viewSession.participantLink)}>
                  Join as Participant
                </Button>
              </div>
            </div>
          ) : (
            <div>Session not found.</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
