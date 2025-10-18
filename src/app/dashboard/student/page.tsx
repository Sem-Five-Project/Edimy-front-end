'use client';

/**
 * Student Dashboard - React Query Implementation
 * 
 * This page uses React Query for data fetching with 5-minute caching.
 * Benefits:
 * - Reduces unnecessary API calls
 * - Improves performance and user experience
 * - Automatic background refetching
 * - Stale-while-revalidate pattern
 * 
 * Cache Strategy:
 * - staleTime: 5 minutes (data considered fresh for 5 min)
 * - gcTime: 5 minutes (cached data persists for 5 min)
 * - Automatic refetch on window focus (can be disabled if needed)
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Clock,CheckCircle, Star, BookOpen, ChevronRight, Globe ,AlertCircle, Search, CreditCard, GraduationCap, Bell, TrendingUp, Users, Award, Play, Video, MessageCircle, X, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { bookingAPI, studentAPI, filterAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Tutor, Subject } from '@/types';

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
  const { user, effectiveStudentId, loadStudentAcademicInfo } = useAuth();

  // 5-minute cache for all queries
  const CACHE_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

  // React Query: Bookings and Stats
  const { 
    data: bookingsData, 
    isLoading: isLoadingBookings, 
    error: bookingsError 
  } = useQuery({
    queryKey: ['studentBookings', effectiveStudentId],
    queryFn: async () => {
      if (!effectiveStudentId) return { bookings: [], stats: null };
      
      const [bookingsRes, statsRes] = await Promise.all([
        bookingAPI.getStudentBookingDetails(Number(effectiveStudentId)),
        studentAPI.loadStudentProfileInfo(Number(effectiveStudentId)),
      ]);
      
      return {
        bookings: bookingsRes.success ? (bookingsRes.data || []) : [],
        stats: statsRes.success ? {
          classCount: statsRes.data.classCount ?? 0,
          sessionCount: statsRes.data.sessionCount ?? 0,
        } : null,
      };
    },
    enabled: !!effectiveStudentId,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
  });

  const bookings = bookingsData?.bookings || [];
  const stats = bookingsData?.stats || null;
  const isLoading = isLoadingBookings;
  const error = bookingsError ? 'Failed to load bookings' : null;

  // React Query: Suggested Tutors
  const { 
    data: suggestedTutors = [], 
    isLoading: loadingTutors, 
    error: tutorQueryError 
  } = useQuery({
    queryKey: ['suggestedTutors', user?.educationLevel, user?.stream],
    queryFn: async () => {
      const edu = (user?.educationLevel ?? null) as string | null;
      const stream = (user?.stream ?? null) as string | null;
      const res = await filterAPI.searchTutors({ educationLevel: edu, stream }, 1, 6);
      
      if (res?.success) {
        const list = Array.isArray((res.data as any)?.content)
          ? (res.data as any).content as Tutor[]
          : Array.isArray(res.data) ? (res.data as any as Tutor[]) : [];
        return list;
      }
      throw new Error(res?.error || 'Failed to load tutors');
    },
    enabled: true,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
  });

  const tutorError = tutorQueryError ? 'Failed to load tutors' : null;


  // React Query: My Classes
  const { 
    data: myClasses = [], 
    isLoading: loadingClasses, 
    error: classesQueryError 
  } = useQuery({
    queryKey: ['myClasses', effectiveStudentId],
    queryFn: async () => {
      const res = await studentAPI.getMyClasses(Number(effectiveStudentId));
      if (res?.success) {
        return res.data?.classes || [];
      }
      throw new Error(res?.error || 'Failed to load classes');
    },
    enabled: !!effectiveStudentId,
    staleTime: CACHE_TIME,
    gcTime: CACHE_TIME,
  });

  const classesError = classesQueryError ? 'Failed to load classes' : null;

  // Real-time upcoming class highlight (within next 30 minutes) - no memo, minimal caching
  const {
    data: upcomingData,
    isFetching: fetchingUpcoming,
    refetch: refetchUpcoming,
  } = useQuery({
    queryKey: ['upcomingClasses', effectiveStudentId],
    queryFn: async () => {
      if (!effectiveStudentId) return { upcoming: false, classes: [] } as any;
      const res = await studentAPI.getUpcomingClasses(Number(effectiveStudentId));
      if (res.success) return res.data;
      return { upcoming: false, classes: [] };
    },
    enabled: !!effectiveStudentId,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000,
  });

  // Ensure academic info exists (educationLevel/stream) in context
  useEffect(() => {
    if (user?.role === 'STUDENT' && (user.educationLevel === undefined || user.stream === undefined)) {
      // fire and forget to enrich user in context
      loadStudentAcademicInfo().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  const displayName = useMemo(() => {
    const u = user as any;
    return u?.fullName || u?.name || u?.displayName || 'Student';
  }, [user]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 shadow-2xl mb-8">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="relative px-6 sm:px-8 lg:px-12 py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
                    <span className="text-xs font-medium text-white/90">Welcome Back</span>
                  </div>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
                  Hello, <span className="bg-gradient-to-r from-blue-100 to-white bg-clip-text text-transparent">{displayName}</span>
                </h1>
                <p className="text-lg text-blue-100 mb-6 max-w-2xl">
                  Your learning journey continues. Ready for today's session?
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group"
                    onClick={() => router.push('/dashboard/student/find-tutor')}
                  >
                    <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Find a Tutor
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border border-white/20 font-semibold"
                    onClick={() => router.push('/dashboard/student/profile/classes')}
                  >
                    <GraduationCap className="h-5 w-5 mr-2" />
                    My Classes
                  </Button>
                </div>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8 flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-24 h-24 lg:w-32 lg:h-32 bg-white/20 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="xl:col-span-2 space-y-6">
            {/* Upcoming class (30 minutes window) - always visible */}
            <Card className="border-0 shadow-lg bg-emerald-50/70">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-emerald-700" />
                  </div>
                  <CardTitle className="text-emerald-800">Upcoming class (next 30 minutes)</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refetchUpcoming()}
                  disabled={fetchingUpcoming}
                  className="border-emerald-300 text-emerald-700 p-2"
                >
                  <Clock
                    className={`w-4 h-4 ${fetchingUpcoming ? 'animate-spin text-emerald-700' : 'text-emerald-700'}`}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                {!upcomingData ? (
                  <div className="text-sm text-slate-600">Loading upcoming status…</div>
                ) : upcomingData.upcoming && upcomingData.classes?.length > 0 ? (
                  upcomingData.classes.slice(0, 1).map((c: any) => (
                    <div
                      key={c.classId}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-emerald-200"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-800">{c.subjectName || 'Class'}</div>
                        <div className="text-xs text-slate-600">{c.tutorName} • {c.languageName}</div>
                      </div>
                      {c.linkForMeeting ? (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => window.open(c.linkForMeeting, '_blank')}
                        >
                          <Video className="w-4 h-4 mr-2" /> Join Now
                        </Button>
                      ) : (
                        <Badge variant="outline" className="border-emerald-300 text-emerald-700">
                          No Link
                        </Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-emerald-200 text-sm text-slate-700">
                    No upcoming classes in the next 30 minutes.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Get started with your learning journey</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-3 hover:bg-blue-50 hover:border-blue-200 group transition-all duration-200"
                  onClick={() => router.push('/dashboard/student/find-tutor')}
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Search className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">Find Tutor</div>
                    <div className="text-xs text-gray-500 mt-1">Search & Book</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-3 hover:bg-green-50 hover:border-green-200 group transition-all duration-200"
                  onClick={() => router.push('/dashboard/student/profile/classes')}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <GraduationCap className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">My Classes</div>
                    <div className="text-xs text-gray-500 mt-1">Schedule & Progress</div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-3 hover:bg-purple-50 hover:border-purple-200 group transition-all duration-200"
                  onClick={() => router.push('/dashboard/student/pay-for-next-month')}
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">Payment</div>
                    <div className="text-xs text-gray-500 mt-1">Monthly Plans</div>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Current Bookings */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">My Bookings</CardTitle>
                  <CardDescription>Your scheduled learning sessions</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => router.push('/dashboard/student/profile/bookings')}
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        <Skeleton className="h-16 w-16 rounded-xl" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-4">
                    {bookings.slice(0, 3).map((b: BookingDetails, index) => {
                      const tutorInitials = b.class_details.tutor.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .slice(0, 2);
                      const allSlots = (b.class_details.class_times || []).flatMap((ct) => ct.slots || []);
                      const next = allSlots
                        .map((d) => new Date(d))
                        .filter((d) => !isNaN(d.getTime()) && d >= new Date())
                        .sort((a, c) => a.getTime() - c.getTime())[0];
                      
return (
  <div
    key={b.booking_id}
    className="flex gap-4 group cursor-pointer"
    onClick={() => router.push("/dashboard/student/profile/bookings")}
  >
    {/* 📅 Date Section */}
    <div className="relative">
      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow">
        {next ? (
          <>
            <div className="text-lg font-bold leading-none">{next.getDate()}</div>
            <div className="text-xs uppercase tracking-wide">
              {next.toLocaleDateString("en-US", { month: "short" })}
            </div>
          </>
        ) : (
          <Calendar className="w-8 h-8" />
        )}
      </div>
      {index < bookings.slice(0, 3).length - 1 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-gray-200"></div>
      )}
    </div>

    {/* 🧾 Booking Card */}
    <div className="relative flex-1 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 shadow-sm">
      {/* ✅ Status Badge - Top Right */}
      <div
        className={`absolute top-3 right-3 flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${
          b.booking_status.toUpperCase() === "CONFIRMED"
            ? "bg-green-100 text-green-700 border-green-200"
            : b.booking_status.toUpperCase() === "CANCELLED"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-yellow-100 text-yellow-700 border-yellow-200"
        }`}
      >
        {b.booking_status.toUpperCase() === "CONFIRMED" ? (
          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
        ) : b.booking_status.toUpperCase() === "CANCELLED" ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-600" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-yellow-600" />
        )}
        {b.booking_status}
      </div>

      {/* Tutor Info */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
            {b.class_details.tutor.name}
          </h4>

          {/* Subject + Language */}
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-gray-800">Subject:</span>{" "}
              {b.class_details.subject.name}
            </span>
            <span className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-gray-800">Language:</span>{" "}
              {b.class_details.language.name}
            </span>
          </div>

          {/* Date + Time */}
          {next && (
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
              <span className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4 text-blue-500" />
                {formatDate(next.toISOString())}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-blue-500" />
                {formatTime(b.class_details.class_times[0]?.start_time || "09:00")} -{" "}
                {formatTime(b.class_details.class_times[0]?.end_time || "10:00")}
              </span>
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  </div>
);
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Yet</h3>
                    <p className="text-gray-500 mb-4">Start your learning journey by finding a tutor</p>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/dashboard/student/find-tutor')}>
                      Find Your First Tutor
                    </Button>
                  </div>
                )}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Announcements */}


            {/* Your Classes (from /students/me/classes) */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span className="text-lg font-semibold text-gray-900">Your Classes</span>
                  </div>
                  <Link 
                    href="/dashboard/student/profile/classes"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                  >
                    View All
                  </Link>
                </CardTitle>
                <CardDescription>Access your current classes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingClasses ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-12 h-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : myClasses.length > 0 ? (
                  <div className="space-y-3">
                    {myClasses.slice(0, 3).map((cls) => (
                      <div 
                        key={cls.classId} 
                        className="group relative p-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-lg hover:shadow-md transition-all duration-200 hover:border-indigo-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-indigo-100 border-2 border-indigo-200 rounded-full flex items-center justify-center shadow-sm">
                              <BookOpen className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">
                                {cls.className || `Class #${cls.classId}`}
                              </h4>
                              <Badge variant="outline" className="text-xs px-2 py-0.5 bg-white/80 border-indigo-200 text-indigo-700">
                                Live
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              {cls.date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(cls.date)}
                                </div>
                              )}
                              {cls.startTime && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(cls.startTime)}{cls.endTime ? ` - ${formatTime(cls.endTime)}` : ''}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {cls.linkForMeeting ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 px-3 bg-green-100 hover:bg-green-200 text-green-700 hover:text-green-800 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  try { window.open(cls.linkForMeeting || '#', '_blank'); } catch {}
                                }}
                              >
                                <Video className="w-4 h-4 mr-1" />
                                Join
                              </Button>
                            ) : (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
                                No Link
                              </Badge>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-indigo-100 hover:text-indigo-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle class details
                              }}
                            >
                              <Calendar className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {myClasses.length > 3 && (
                      <div className="text-center pt-2">
                        <Link 
                          href="/dashboard/student/profile/classes"
                          className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                          View {myClasses.length - 3} more classes
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">No classes enrolled yet</p>
                    <p className="text-xs text-gray-500 mt-1">Browse tutors to start learning</p>
                    <Button className="mt-3 bg-indigo-600 hover:bg-indigo-700" onClick={() => router.push('/dashboard/student/find-tutor')}>
                      Find a Class
                    </Button>
                  </div>
                )}
                {classesError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {classesError}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggested Tutors */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">Suggested Tutors</CardTitle>
                <CardDescription>Personalized for you</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingTutors ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-56" />
                        </div>
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                    ))}
                  </div>
                ) : suggestedTutors.length > 0 ? (
                  <div className="space-y-4">
                    {suggestedTutors.slice(0, 3).map((tutor) => {
                      const name = [tutor.firstName, tutor.lastName].filter(Boolean).join(' ') || tutor.username || 'Tutor';
                      const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                      const primarySubject = (Array.isArray(tutor.subjects) && tutor.subjects[0]?.subjectName) || 'Subject';
                      const rating = typeof tutor.rating === 'number' ? tutor.rating.toFixed(1) : '4.5';
                      const price = tutor.hourlyRate ?? tutor.subjects?.[0]?.hourlyRate ?? 0;
                      return (
                        <div key={tutor.tutorProfileId ?? tutor.id ?? `${tutor.username}-${tutor.email}`} className="group p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                          onClick={() => router.push('/dashboard/student/find-tutor')}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 ring-2 ring-blue-100">
                                <AvatarImage src={tutor.profileImage || ''} />
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h5 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {name}
                                </h5>
                                <p className="text-xs text-gray-500">{primarySubject}</p>
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs text-gray-600">{rating}</span>
                                  <span className="text-xs text-gray-400">•</span>
                                  <span className="text-xs text-gray-600">{price ? `Rs. ${price}/hr` : 'Rate N/A'}</span>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 mt-4" onClick={() => router.push('/dashboard/student/find-tutor')}>
                      Browse All Tutors
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No tutor suggestions yet</p>
                    <Button className="mt-3 bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/dashboard/student/find-tutor')}>
                      Find Tutors
                    </Button>
                  </div>
                )}
                {tutorError && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {tutorError}
                  </div>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
}