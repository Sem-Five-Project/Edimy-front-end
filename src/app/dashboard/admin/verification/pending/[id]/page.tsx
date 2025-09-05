'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getPendingTutorById, 
  approveTutor, 
  rejectTutor,
  requestAdditionalInfo,
  getReviewHistory,
  downloadDocument,
  type PendingTutor,
  type ReviewAction,
  type TutorDocument
} from '@/lib/pendingTutorsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  Phone, 
  Calendar, 
  DollarSign,
  Star,
  Download,
  FileText,
  AlertTriangle,
  User,
  BookOpen,
  MessageSquare,
  Globe,
  Award,
  CheckCircle2,
  Eye
} from 'lucide-react';

interface TutorReviewPageProps {
  params: {
    id: string;
  };
}

export default function TutorReviewPage({ params }: TutorReviewPageProps) {
  const router = useRouter();
  const [tutor, setTutor] = useState<PendingTutor | null>(null);
  const [reviewHistory, setReviewHistory] = useState<ReviewAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [additionalInfoRequirements, setAdditionalInfoRequirements] = useState<string[]>([]);
  const [newRequirement, setNewRequirement] = useState('');

  const predefinedRequirements = [
    'Updated ID proof document',
    'Additional educational certificates',
    'Professional references',
    'Teaching experience verification',
    'Background check clearance',
    'Updated resume/CV',
    'Portfolio samples',
    'Video introduction'
  ];

  useEffect(() => {
    fetchTutorData();
  }, [params.id]);

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      const [tutorData, historyData] = await Promise.all([
        getPendingTutorById(params.id),
        getReviewHistory(params.id)
      ]);

      setTutor(tutorData);
      setReviewHistory(historyData);
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!tutor) return;
    
    setActionLoading(true);
    try {
      await approveTutor(tutor.id, approvalNotes);
      router.push('/dashboard/admin/verification/pending');
    } catch (error) {
      console.error('Error approving tutor:', error);
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!tutor || !rejectionReason.trim()) return;
    
    setActionLoading(true);
    try {
      await rejectTutor(tutor.id, rejectionReason, rejectionNotes);
      router.push('/dashboard/admin/verification/pending');
    } catch (error) {
      console.error('Error rejecting tutor:', error);
      setActionLoading(false);
    }
  };

  const handleRequestAdditionalInfo = async () => {
    if (!tutor || additionalInfoRequirements.length === 0) return;
    
    setActionLoading(true);
    try {
      await requestAdditionalInfo(tutor.id, additionalInfoRequirements);
      router.push('/dashboard/admin/verification/pending');
    } catch (error) {
      console.error('Error requesting additional info:', error);
      setActionLoading(false);
    }
  };

  const handleDownloadDocument = async (doc: TutorDocument) => {
    try {
      const downloadUrl = await downloadDocument(doc.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Pending Review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Additional Info Required': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'ID Proof': return <User className="w-4 h-4" />;
      case 'Educational Certificate': return <Award className="w-4 h-4" />;
      case 'Professional Certificate': return <Star className="w-4 h-4" />;
      case 'Resume/CV': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const addRequirement = () => {
    if (newRequirement.trim() && !additionalInfoRequirements.includes(newRequirement.trim())) {
      setAdditionalInfoRequirements([...additionalInfoRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (requirement: string) => {
    setAdditionalInfoRequirements(additionalInfoRequirements.filter(r => r !== requirement));
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

  if (!tutor) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Application Not Found</h2>
          <p className="text-gray-600 mt-2">The tutor application you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/verification/pending">Back to Pending Approvals</Link>
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
          <Link href="/dashboard/admin/verification/pending">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pending Approvals
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Tutor Application Review</h1>
          <p className="text-muted-foreground">Review and approve tutor verification request</p>
        </div>
      </div>

      {/* Application Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-start gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={tutor.profilePicture} />
                <AvatarFallback className="text-2xl">
                  {tutor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div>
                  <h2 className="text-2xl font-bold">{tutor.name}</h2>
                  <p className="text-muted-foreground">Tutor Application</p>
                </div>
                <Badge className={getStatusBadgeColor(tutor.status)}>
                  {tutor.status}
                </Badge>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>{tutor.email}</span>
                </div>
                {tutor.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{tutor.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Applied {new Date(tutor.submissionDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Rate Range:</span>
                  <div className="font-medium">${tutor.hourlyRateRange.min} - ${tutor.hourlyRateRange.max}/hr</div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Subjects:</span>
                  <div className="font-medium">{tutor.subjects.length} subjects</div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Documents:</span>
                  <div className="font-medium">{tutor.documents.length} uploaded</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <Separator className="my-6" />
          <div className="flex gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Application
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Approve Tutor Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to approve {tutor.name}'s application? 
                    They will become an active tutor and be visible in search results.
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
                  Reject Application
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject Tutor Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to reject {tutor.name}'s application? 
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

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">
                  <Clock className="w-4 h-4 mr-2" />
                  Request Additional Info
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Request Additional Information</AlertDialogTitle>
                  <AlertDialogDescription>
                    Select what additional information is needed from {tutor.name}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 space-y-4">
                  <div>
                    <Label>Select Requirements</Label>
                    <div className="mt-2 space-y-2">
                      {predefinedRequirements.map((requirement) => (
                        <div key={requirement} className="flex items-center space-x-2">
                          <Checkbox
                            checked={additionalInfoRequirements.includes(requirement)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setAdditionalInfoRequirements([...additionalInfoRequirements, requirement]);
                              } else {
                                removeRequirement(requirement);
                              }
                            }}
                          />
                          <label className="text-sm">{requirement}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Custom Requirement</Label>
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newRequirement}
                        onChange={(e) => setNewRequirement(e.target.value)}
                        placeholder="Add custom requirement..."
                        className="flex-1 px-3 py-2 border rounded-md"
                        onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                      />
                      <Button onClick={addRequirement} size="sm">Add</Button>
                    </div>
                  </div>
                  {additionalInfoRequirements.length > 0 && (
                    <div>
                      <Label>Selected Requirements</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {additionalInfoRequirements.map((requirement) => (
                          <Badge 
                            key={requirement} 
                            variant="secondary" 
                            className="cursor-pointer"
                            onClick={() => removeRequirement(requirement)}
                          >
                            {requirement} ✕
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleRequestAdditionalInfo}
                    disabled={actionLoading || additionalInfoRequirements.length === 0}
                  >
                    {actionLoading ? 'Processing...' : 'Send Request'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="basic-info" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="subjects">Subjects & Rates</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="experience">Experience</TabsTrigger>
          <TabsTrigger value="history">Review History</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {tutor.bio && (
                <div>
                  <h3 className="font-medium mb-2">Bio</h3>
                  <p className="text-muted-foreground">{tutor.bio}</p>
                </div>
              )}

              {tutor.motivation && (
                <div>
                  <h3 className="font-medium mb-2">Motivation Statement</h3>
                  <p className="text-muted-foreground">{tutor.motivation}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Education</h3>
                  <p className="text-muted-foreground">{tutor.education}</p>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {tutor.languages.map((language, index) => (
                      <Badge key={index} variant="outline">
                        <Globe className="w-3 h-3 mr-1" />
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Availability</h3>
                <p className="text-muted-foreground">{tutor.availability}</p>
              </div>

              {tutor.additionalNotes && (
                <div>
                  <h3 className="font-medium mb-2">Additional Notes</h3>
                  <p className="text-muted-foreground">{tutor.additionalNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subjects & Proposed Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutor.subjects.map((subject, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{subject.subject}</h3>
                          <Badge variant="outline">{subject.experienceLevel}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Proposed Rate:</span>
                            <span className="font-bold text-lg">${subject.proposedRate}/hr</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Experience:</span>
                            <span className="text-sm">{subject.yearsOfExperience} years</span>
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
                Uploaded Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tutor.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(doc.type)}
                      <div>
                        <div className="font-medium">{doc.filename}</div>
                        <div className="text-sm text-muted-foreground">
                          {doc.type} • {formatFileSize(doc.fileSize)} • 
                          Uploaded {new Date(doc.uploadDate).toLocaleDateString()}
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
                        onClick={() => handleDownloadDocument(doc)}
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

        <TabsContent value="experience">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Experience & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Professional Experience</h3>
                <p className="text-muted-foreground">{tutor.experience}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Education Background</h3>
                <p className="text-muted-foreground">{tutor.education}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Certifications</h3>
                <div className="flex flex-wrap gap-2">
                  {tutor.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Proposed Hourly Rate Range</h3>
                <div className="text-2xl font-bold">
                  ${tutor.hourlyRateRange.min} - ${tutor.hourlyRateRange.max} per hour
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on subjects and experience level
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Review History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {reviewHistory.length > 0 ? (
                <div className="space-y-4">
                  {reviewHistory.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />
                      <div className="flex-1">
                        <div className="font-medium">{action.action}</div>
                        <div className="text-sm text-muted-foreground">
                          by {action.adminName} on {new Date(action.date).toLocaleString()}
                        </div>
                        {action.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {action.notes}
                          </div>
                        )}
                        {action.rejectionReason && (
                          <div className="text-sm text-red-600 mt-1">
                            Reason: {action.rejectionReason}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No review history yet
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
