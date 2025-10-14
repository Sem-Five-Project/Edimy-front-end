'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getTutorById,
  deleteTutor,
  type TutorDto
} from '@/lib/adminTutor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Trash2, 
  Mail, 
  Calendar, 
  Clock,
  DollarSign,
  Star,
  User,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TutorProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TutorProfilePage({ params }: TutorProfilePageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [tutor, setTutor] = useState<TutorDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTutorData();
  }, [resolvedParams.id]);

  const fetchTutorData = async () => {
    setLoading(true);
    try {
      const tutorData = await getTutorById(resolvedParams.id);
      setTutor(tutorData);
    } catch (error) {
      console.error('Error fetching tutor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tutor) return;
    
    setDeleting(true);
    try {
      await deleteTutor(resolvedParams.id);
      router.push('/dashboard/admin/users/tutors');
    } catch (error) {
      console.error('Error deleting tutor:', error);
      setDeleting(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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
          <p className="text-gray-600 mt-2">The tutor you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/users/tutors">Back to Tutors</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/admin/users/tutors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tutors
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Tutor Profile</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href={`/dashboard/admin/users/tutors/${resolvedParams.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Admin Settings
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the tutor's account and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={tutor.profilePictureUrl} />
              <AvatarFallback className="text-2xl">
                {tutor.firstName[0]}{tutor.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{tutor.firstName} {tutor.lastName}</h2>
                  <Badge className={getStatusBadgeColor(tutor.status)}>
                    {tutor.status}
                  </Badge>
                  {tutor.verified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{tutor.userName}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">${tutor.hourlyRate}/hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Rating: {tutor.rating}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.experienceInMonths} months experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{tutor.classCompletionRate}% completion rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Joined {new Date(tutor.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {tutor.bio && (
                <div>
                  <h4 className="font-medium mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground">{tutor.bio}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Admin Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Account Status</h4>
              <div className="flex items-center gap-2">
                <Badge className={getStatusBadgeColor(tutor.status)}>
                  {tutor.status}
                </Badge>
                {tutor.accountLocked && (
                  <Badge variant="destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Locked
                  </Badge>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Verification</h4>
              <Badge variant={tutor.verified ? "default" : "secondary"}>
                {tutor.verified ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Not Verified
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Last Activity</h4>
            <p className="text-sm text-muted-foreground">
              Last login: {tutor.lastLogin ? new Date(tutor.lastLogin).toLocaleString() : 'Never'}
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(tutor.updatedAt).toLocaleString()}
            </p>
          </div>

          {tutor.adminNotes && (
            <div>
              <h4 className="font-medium mb-2">Admin Notes</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">{tutor.adminNotes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
