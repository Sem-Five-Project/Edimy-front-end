'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getTutorById, 
  getTutorSessions, 
  getTutorEarnings,
  getTutorReviews,
  updateTutorStatus,
  deleteTutor,
  getAdminActions,
  type Tutor,
  type TutorSession,
  type TutorEarning,
  type TutorReview,
  type AdminAction
} from '@/lib/tutorsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Edit, 
  UserX, 
  UserCheck, 
  Trash2, 
  Mail, 
  Phone, 
  Calendar, 
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  User,
  BookOpen,
  MessageSquare,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface TutorProfilePageProps {
  params: {
    id: string;
  };
}

export default function TutorProfilePage({ params }: TutorProfilePageProps) {
  const router = useRouter();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [sessions, setSessions] = useState<TutorSession[]>([]);
  const [earnings, setEarnings] = useState<TutorEarning[]>([]);
  const [reviews, setReviews] = useState<TutorReview[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTutorData();
  }, [params.id]);

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      const [
        tutorData,
        sessionsData,
        earningsData,
        reviewsData,
        actionsData
      ] = await Promise.all([
        getTutorById(params.id),
        getTutorSessions(params.id),
        getTutorEarnings(params.id),
        getTutorReviews(params.id),
        getAdminActions(params.id)
      ]);

      setTutor(tutorData);
      setSessions(sessionsData);
      setEarnings(earningsData);
      setReviews(reviewsData);
      setAdminActions(actionsData);
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: Tutor['status']) => {
    if (!tutor) return;
    
    setActionLoading(true);
    try {
      await updateTutorStatus(tutor.id, newStatus);
      setTutor({ ...tutor, status: newStatus });
      fetchTutorData(); // Refresh to get updated admin actions
    } catch (error) {
      console.error('Error updating tutor status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tutor) return;
    
    setActionLoading(true);
    try {
      await deleteTutor(tutor.id);
      router.push('/dashboard/admin/users/tutors');
    } catch (error) {
      console.error('Error deleting tutor:', error);
      setActionLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Suspended': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h2 className="text-2xl font-bold text-gray-900">Tutor Not Found</h2>
          <p className="text-gray-600 mt-2">The tutor you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/users/tutors">Back to Tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'Upcoming');
  const completedSessions = sessions.filter(s => s.status === 'Completed');
  const totalEarningsAmount = earnings.reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/users/tutors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tutors
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Tutor Profile</h1>
      </div>

      {/* Tutor Info Card */}
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
                  <p className="text-muted-foreground">ID: {tutor.tutorId}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    className={getStatusBadgeColor(tutor.status)}
                  >
                    {tutor.status}
                  </Badge>
                  {tutor.isVerified && (
                    <Badge variant="outline" className="text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  {tutor.flags && tutor.flags.map((flag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {flag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <span>Joined {new Date(tutor.registrationDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-medium">{tutor.averageRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({tutor.totalReviews} reviews)</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">{tutor.totalSessions}</span> sessions completed
                </div>
                <div className="text-sm">
                  <span className="font-medium">${tutor.totalEarnings.toFixed(2)}</span> total earnings
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Last login:</span>
                  <div className="font-medium">
                    {tutor.lastLogin ? new Date(tutor.lastLogin).toLocaleString() : 'Never'}
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Upcoming sessions:</span>
                  <div className="font-medium">{tutor.upcomingSessions}</div>
                </div>
              </div>
            </div>
          </div>

          {tutor.bio && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Bio</h3>
                <p className="text-muted-foreground">{tutor.bio}</p>
              </div>
            </>
          )}

          {tutor.notes && (
            <>
              <Separator className="my-4" />
              <div>
                <h3 className="font-medium mb-2">Admin Notes</h3>
                <p className="text-muted-foreground">{tutor.notes}</p>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <Separator className="my-4" />
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/dashboard/admin/users/tutors/${tutor.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
            
            {tutor.status === 'Active' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600">
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Suspend Tutor Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to suspend {tutor.name}'s account? This will prevent them from accepting new sessions.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleStatusUpdate('Suspended')}
                      disabled={actionLoading}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {actionLoading ? 'Processing...' : 'Suspend'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {tutor.status === 'Suspended' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-green-600">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Reactivate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reactivate Tutor Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to reactivate {tutor.name}'s account?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleStatusUpdate('Active')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading ? 'Processing...' : 'Reactivate'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Tutor Account</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {tutor.name}'s account? This action cannot be undone and will remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {actionLoading ? 'Processing...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="subjects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="subjects">Subjects & Rates</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Subjects & Hourly Rates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tutor.subjects.map((subject, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{subject.subject}</h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{subject.experienceLevel}</Badge>
                          <span className="font-bold text-lg">${subject.hourlyRate}/hr</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Weekly Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tutor.availability.length > 0 ? (
                <div className="space-y-3">
                  {tutor.availability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="font-medium">{slot.day}</div>
                        <div className="text-muted-foreground">
                          {slot.startTime} - {slot.endTime}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={slot.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {slot.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No availability schedule set
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions ({upcomingSessions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{session.studentName}</div>
                          <div className="text-sm text-muted-foreground">{session.subject}</div>
                        </div>
                        <Badge className={getSessionStatusColor(session.status)}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div>{new Date(session.date).toLocaleString()}</div>
                        <div>{session.duration} minutes • ${session.earnings.toFixed(2)}</div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No upcoming sessions
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Completed Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {completedSessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{session.studentName}</div>
                          <div className="text-sm text-muted-foreground">{session.subject}</div>
                        </div>
                        {session.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm">{session.rating}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <div>{new Date(session.date).toLocaleDateString()}</div>
                        <div>${session.earnings.toFixed(2)}</div>
                        {session.studentReview && (
                          <div className="text-muted-foreground italic">
                            "{session.studentReview}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="earnings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalEarningsAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  All time earnings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${pendingEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Awaiting payment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average per Session</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${tutor.totalSessions > 0 ? (tutor.totalEarnings / tutor.totalSessions).toFixed(2) : '0.00'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per completed session
                </p>
              </CardContent>
            </Card>

            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-1">
                          <div className="font-medium">{earning.type}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(earning.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="font-bold">${earning.amount.toFixed(2)}</div>
                          <Badge className={getPaymentStatusColor(earning.status)}>
                            {earning.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Student Reviews & Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium">{review.studentName}</div>
                        <div className="text-sm text-muted-foreground">{review.subject}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-2">{review.review}</p>
                    <div className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Admin Actions Log */}
      {adminActions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Admin Actions Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminActions.map((action) => (
                <div key={action.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-1" />
                  <div className="flex-1">
                    <div className="font-medium">{action.action}</div>
                    <div className="text-sm text-muted-foreground">
                      by {action.adminName} on {new Date(action.date).toLocaleString()}
                    </div>
                    {action.details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {action.details}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
