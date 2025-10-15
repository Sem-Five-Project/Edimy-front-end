'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarDays, Clock, Star, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { bookingAPI, studentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Minimal type for booking details from API
type BookingDetails = {
  booking_id: number;
  booking_status: string;
  paid_amount: number;
  class_details: {
    tutor: { id: number; name: string };
    subject: { id: number; name: string };
    language: { id: number; name: string };
    class_times: { slots: string[]; start_time: string; end_time: string }[];
  };
};

type SuggestedTutor = { id: string; name: string; subject: string; rating: number; price: number; image: string };

export default function StudentDashboard() {
  const router = useRouter();
  const { user, effectiveStudentId } = useAuth();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ classCount: number; sessionCount: number } | null>(null);

  const suggestedTutors: SuggestedTutor[] = [
    { id: '1', name: 'Dr. Sarah Johnson', subject: 'Mathematics', rating: 4.9, price: 60, image: '' },
    { id: '2', name: 'Prof. Michael Chen', subject: 'Physics', rating: 4.8, price: 55, image: '' },
    { id: '3', name: 'Dr. Emily Davis', subject: 'Chemistry', rating: 4.7, price: 50, image: '' },
  ];

  const displayName = useMemo(() => {
    const u = user as any;
    return u?.fullName || u?.name || u?.displayName || 'Student';
  }, [user]);

  // Fetch current student's booking details + profile stats
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!effectiveStudentId) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const [bookingsRes, statsRes] = await Promise.all([
          bookingAPI.getStudentBookingDetails(Number(effectiveStudentId)),
          studentAPI.loadStudentProfileInfo(Number(effectiveStudentId)),
        ]);
        if (!cancelled) {
          if (bookingsRes.success) setBookings(bookingsRes.data || []);
          else setError(bookingsRes.error || 'Failed to load bookings');
          if (statsRes.success) setStats({
            classCount: statsRes.data.classCount ?? 0,
            sessionCount: statsRes.data.sessionCount ?? 0,
          });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load data');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [effectiveStudentId]);

  // Derive upcoming classes by looking for next upcoming slot per booking
  const parsedUpcoming = useMemo(() => {
    const now = new Date();
    const items = bookings.map((b: BookingDetails) => {
      const allSlots = (b.class_details.class_times || []).flatMap((ct) => ct.slots || []);
      const nextDate = allSlots
        .map((d) => new Date(d))
        .filter((d) => !isNaN(d.getTime()) && d >= now)
        .sort((a, b) => a.getTime() - b.getTime())[0];
      return { booking: b, nextDate: nextDate || null };
    }).filter((x) => !!x.nextDate);
    return items.sort((a, b) => (a.nextDate!.getTime() - b.nextDate!.getTime())).slice(0, 3);
  }, [bookings]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {displayName}!</h1>
        <p className="text-blue-100">Ready to continue your learning journey?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Current Bookings & Upcoming Classes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Bookings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Current Bookings</CardTitle>
                <CardDescription>Your active and upcoming sessions</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/dashboard/student/profile/bookings')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 w-full">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-56" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : bookings.length > 0 ? (
                <div className="space-y-4">
                  {bookings.slice(0, 3).map((b: BookingDetails) => {
                    const tutorInitials = b.class_details.tutor.name
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .slice(0, 2);
                    const allSlots = (b.class_details.class_times || []).flatMap((ct) => ct.slots || []);
                    const next = allSlots
                      .map((d) => new Date(d))
                      .filter((d) => !isNaN(d.getTime()) && d >= new Date())
                      .sort((a, b) => a.getTime() - b.getTime())[0];
                    return (
                      <div
                        key={b.booking_id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Avatar>
                            <AvatarImage src={''} />
                            <AvatarFallback>{tutorInitials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{b.class_details.tutor.name}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary">{b.class_details.subject.name}</Badge>
                              <Badge variant="outline">{b.class_details.language.name}</Badge>
                            </div>
                            {next ? (
                              <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                                <CalendarDays className="h-4 w-4" />
                                <span>{formatDate(next.toISOString())}</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>
                                  {formatTime(b.class_details.class_times[0]?.start_time || '09:00')} -
                                  {formatTime(b.class_details.class_times[0]?.end_time || '10:00')}
                                </span>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground mt-1">No upcoming date</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={b.booking_status.toUpperCase() === 'CONFIRMED' ? 'default' : 'secondary'}>
                            {b.booking_status}
                          </Badge>
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push('/dashboard/student/profile/bookings')}
                            >
                              Manage
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <Button className="mt-4" onClick={() => router.push('/dashboard/student/find-tutor')}>
                    Find a Tutor
                  </Button>
                </div>
              )}
              {error && (
                <div className="mt-3 flex items-center text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 mr-1.5" /> {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Classes</CardTitle>
              <CardDescription>Your next scheduled sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i: number) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4 w-full">
                        <Skeleton className="h-10 w-10 rounded-md" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : parsedUpcoming.length > 0 ? (
                <div className="space-y-4">
                  {parsedUpcoming.map(({ booking, nextDate }: { booking: BookingDetails; nextDate: Date | null }) => (
                    <div key={booking.booking_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{nextDate!.getDate()}</div>
                          <div className="text-sm text-muted-foreground">
                            {nextDate!.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">{booking.class_details.tutor.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(booking.class_details.class_times[0]?.start_time || '09:00')} -
                            {formatTime(booking.class_details.class_times[0]?.end_time || '10:00')}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.class_details.subject.name}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming classes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Suggestions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto" />
                ) : (
                  <div className="text-2xl font-bold text-primary">{stats?.classCount ?? bookings.length}</div>
                )}
                <p className="text-sm text-muted-foreground">Total Classes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                {isLoading ? (
                  <Skeleton className="h-8 w-12 mx-auto" />
                ) : (
                  <div className="text-2xl font-bold text-primary">{stats?.sessionCount ?? 0}</div>
                )}
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </CardContent>
            </Card>
          </div>

          {/* Suggested Tutors */}
          <Card>
            <CardHeader>
              <CardTitle>Suggested Tutors</CardTitle>
              <CardDescription>Based on your interests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestedTutors.map((tutor: SuggestedTutor) => (
                  <div key={tutor.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={tutor.image} />
                        <AvatarFallback>
                          {tutor.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h5 className="font-medium text-sm">{tutor.name}</h5>
                        <p className="text-xs text-muted-foreground">{tutor.subject}</p>
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs">{tutor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${tutor.price}/hr</p>
                      <Button size="sm" variant="outline" className="text-xs">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4" variant="outline" onClick={() => router.push('/dashboard/student/find-tutor')}>
                Browse All Tutors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}