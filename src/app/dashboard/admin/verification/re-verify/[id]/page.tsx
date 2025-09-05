'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getReVerificationRequestById, 
  approveReVerificationRequest, 
  rejectReVerificationRequest,
  getReVerificationAuditLogs,
  downloadReVerificationDocument,
  type ReVerificationRequest,
  type ReVerificationAuditLog
} from '@/lib/reVerificationData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Mail, 
  Star, 
  Download,
  FileText,
  User,
  BookOpen,
  MessageSquare,
  Award,
  CheckCircle2,
  Eye,
  Plus,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ReVerificationReviewPageProps {
  params: {
    id: string;
  };
}

export default function ReVerificationReviewPage({ params }: ReVerificationReviewPageProps) {
  const router = useRouter();
  const [request, setRequest] = useState<ReVerificationRequest | null>(null);
  const [auditLogs, setAuditLogs] = useState<ReVerificationAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');

  useEffect(() => {
    fetchRequestData();
  }, [params.id]);

  const fetchRequestData = async () => {
    setLoading(true);
    try {
      const [requestData, logsData] = await Promise.all([
        getReVerificationRequestById(params.id),
        getReVerificationAuditLogs(params.id)
      ]);

      setRequest(requestData);
      setAuditLogs(logsData);
    } catch (error) {
      console.error('Error fetching request data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!request) return;
    
    setActionLoading(true);
    try {
      await approveReVerificationRequest(request.id, 'Admin User', approvalNotes);
      router.push('/dashboard/admin/verification/re-verify');
    } catch (error) {
      console.error('Error approving request:', error);
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request || !rejectionReason.trim()) return;
    
    setActionLoading(true);
    try {
      await rejectReVerificationRequest(request.id, 'Admin User', rejectionReason, rejectionNotes);
      router.push('/dashboard/admin/verification/re-verify');
    } catch (error) {
      console.error('Error rejecting request:', error);
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = async (docId: string) => {
    try {
      const downloadUrl = await downloadReVerificationDocument(docId);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Reviewed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'Certificate': return <Award className="w-4 h-4" />;
      case 'Degree': return <BookOpen className="w-4 h-4" />;
      case 'Professional License': return <CheckCircle2 className="w-4 h-4" />;
      case 'Experience Letter': return <FileText className="w-4 h-4" />;
      case 'Portfolio': return <User className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Request Not Found</h2>
          <p className="text-gray-600 mt-2">The re-verification request you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/verification/re-verify">Back to Re-verification</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/verification/re-verify">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Re-verification
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Re-verification Request Review</h1>
          <p className="text-muted-foreground">Review tutor subject addition request</p>
        </div>
      </div>

      {/* Request Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={request.tutorProfilePicture} />
                <AvatarFallback className="text-2xl">
                  {request.tutorName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">{request.tutorName}</h2>
                  <p className="text-muted-foreground">Subject Addition Request</p>
                </div>
                <Badge className={getStatusBadgeColor(request.status)}>
                  {request.status}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{request.tutorRating}</span>
                  <span className="text-muted-foreground text-sm">tutor rating</span>
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{request.tutorEmail}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted {new Date(request.submissionDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>{request.currentSubjects.length} current subjects</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">New Subjects:</span>
                  <div className="font-medium">{request.newSubjectRequests.length} requested</div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Documents:</span>
                  <div className="font-medium">{request.supportingDocuments.length} uploaded</div>
                </div>
                {request.reviewedBy && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Reviewed by:</span>
                    <div className="font-medium">{request.reviewedBy}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {request.status === 'Pending' && (
            <>
              <Separator className="my-6" />
              <div className="flex gap-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Request
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve Re-verification Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to approve {request.tutorName}'s request to add new subjects? 
                        The subjects will be added to their profile and students can book sessions.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <Label htmlFor="approval-notes">Approval Notes (Optional)</Label>
                      <Textarea
                        id="approval-notes"
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        placeholder="Add any notes about the approval..."
                        className="mt-2"
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Request
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reject Re-verification Request</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reject {request.tutorName}'s request? 
                        They will be notified with the reason provided.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                        <Textarea
                          id="rejection-reason"
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Please provide a clear reason for rejection..."
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="rejection-notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="rejection-notes"
                          value={rejectionNotes}
                          onChange={(e) => setRejectionNotes(e.target.value)}
                          placeholder="Any additional notes or suggestions..."
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleReject}
                        disabled={actionLoading || !rejectionReason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Keep Pending
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="current-subjects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="current-subjects">Current Subjects</TabsTrigger>
          <TabsTrigger value="new-requests">New Requests</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="tutor-info">Tutor Info</TabsTrigger>
          <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="current-subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Current Teaching Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {request.currentSubjects.map((subject, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-lg">{subject.subject}</h3>
                          <Badge variant="outline">{subject.experienceLevel}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Current Rate:</span>
                            <div className="font-bold text-lg">${subject.currentRate}/hr</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-bold">{subject.rating}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Teaching Experience:</span>
                            <div className="font-medium">{subject.yearsTeaching} years</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Total Sessions:</span>
                            <div className="font-medium">{subject.totalSessions}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                New Subject Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {request.newSubjectRequests.map((newSubject, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-xl text-green-700">{newSubject.subject}</h3>
                          <Badge variant="outline" className="text-green-600">
                            {newSubject.experienceLevel}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <DollarSign className="w-6 h-6 mx-auto text-green-600 mb-1" />
                            <div className="font-bold text-2xl text-green-700">${newSubject.proposedRate}</div>
                            <div className="text-sm text-muted-foreground">Proposed Rate/hr</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <TrendingUp className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                            <div className="font-bold text-2xl text-blue-700">{newSubject.yearsOfExperience}</div>
                            <div className="text-sm text-muted-foreground">Years Experience</div>
                          </div>
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <Award className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                            <div className="font-bold text-lg text-purple-700">{newSubject.qualifications.length}</div>
                            <div className="text-sm text-muted-foreground">Qualifications</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Motivation</h4>
                          <p className="text-muted-foreground">{newSubject.motivation}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Qualifications</h4>
                          <div className="flex flex-wrap gap-2">
                            {newSubject.qualifications.map((qualification, qIndex) => (
                              <Badge key={qIndex} variant="secondary">
                                <Award className="w-3 h-3 mr-1" />
                                {qualification}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Supporting Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.supportingDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <div className="font-medium">{doc.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.type} • {formatFileSize(doc.fileSize)} • 
                          Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
                          {doc.relatedSubject && <span> • For {doc.relatedSubject}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadDocument(doc.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(doc.downloadUrl, '_blank')}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor-info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Tutor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {request.tutorBio && (
                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-muted-foreground">{request.tutorBio}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Overall Rating</h3>
                  <div className="flex items-center gap-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{request.tutorRating}</span>
                    <span className="text-muted-foreground">out of 5</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Teaching Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div>Total sessions: {request.currentSubjects.reduce((sum, s) => sum + s.totalSessions, 0)}</div>
                    <div>Teaching experience: {Math.max(...request.currentSubjects.map(s => s.yearsTeaching))} years</div>
                    <div>Subjects teaching: {request.currentSubjects.length}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-logs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium">{log.action} by {log.adminName}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.date).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Subjects: {log.affectedSubjects.join(', ')}
                        </div>
                        {log.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Notes: {log.notes}
                          </div>
                        )}
                        {log.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">
                            Reason: {log.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No audit logs yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
