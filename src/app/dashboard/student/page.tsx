'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion'; // Added for animations
import { CalendarDays, Clock, Star, BookOpen, ChevronRight, AlertCircle, Search, CreditCard, GraduationCap, Bell, TrendingUp, Award, Target, SearchIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input'; // Added for search bar
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Added for tooltips
import { bookingAPI, studentAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Types remain the same
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
  const [searchQuery, setSearchQuery] = useState(''); // Added for subject search

  const suggestedTutors: SuggestedTutor[] = [
    { id: '1', name: 'Dr. Sarah Johnson', subject: 'Mathematics', rating: 4.9, price: 60, image: '' },
    { id: '2', name: 'Prof. Michael Chen', subject: 'Physics', rating: 4.8, price: 55, image: '' },
    { id: '3', name: 'Dr. Emily Davis', subject: 'Chemistry', rating: 4.7, price: 50, image: '' },
  ];

  const displayName = useMemo(() => {
    const u = user as any;
    return u?.fullName || u?.name || u?.displayName || 'Student';
  }, [user]);

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

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  const formatTime = useCallback((timeString: string) => {
    const date = new Date(`2000-01-01T${timeString}`);
    return isNaN(date.getTime()) ? 'Invalid Time' : date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  // Filter subjects based on search query
  const filteredSubjects = useMemo(() => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'IT', 'History', 'Economics'];
    return subjects.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  // Animation variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Welcome Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-blue-800 dark:via-blue-900 dark:to-indigo-900 rounded-2xl shadow-2xl"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
          <div className="relative px-6 sm:px-8 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  Welcome back, {displayName}! 👋
                </h1>
                <p className="text-blue-100 text-base sm:text-lg">
                  Ready to unlock your potential today?
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <div className="text-xs text-blue-100">Total Classes</div>
                  <div className="text-2xl font-bold text-white">{stats?.classCount ?? 0}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
                  <div className="text-xs text-blue-100">Sessions</div>
                  <div className="text-2xl font-bold text-white">{stats?.sessionCount ?? 0}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <TooltipProvider>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Search, label: 'Find Tutors', description: 'Discover expert instructors', path: '/dashboard/student/find-tutor', color: 'blue' },
              { icon: GraduationCap, label: 'My Classes', description: 'View schedule & progress', path: '/dashboard/student/profile/classes', color: 'indigo' },
              { icon: CreditCard, label: 'Payment', description: 'Manage your billing', path: '/dashboard/student/pay-for-next-month', color: 'emerald' },
              { icon: CalendarDays, label: 'Bookings', description: 'Manage reservations', path: '/dashboard/student/profile/bookings', color: 'purple' },
            ].map((action, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <motion.button
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => router.push(action.path)}
                    className={`group relative overflow-hidden bg-white dark:bg-slate-900 rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800 hover:border-${action.color}-300 dark:hover:border-${action.color}-700`}
                    aria-label={action.label}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br from-${action.color}-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative flex items-start gap-4">
                      <div className={`p-3 bg-${action.color}-100 dark:bg-${action.color}-900/30 rounded-xl group-hover:scale-110 transition-transform`}>
                        <action.icon className={`h-6 w-6 text-${action.color}-600 dark:text-${action.color}-400`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">{action.label}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{action.description}</div>
                      </div>
                    </div>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent>{action.description}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Classes */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Upcoming Classes
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                        Your next scheduled sessions
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {parsedUpcoming.length} Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                          <Skeleton className="h-16 w-16 rounded-xl" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-56" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : parsedUpcoming.length > 0 ? (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {parsedUpcoming.map(({ booking, nextDate }) => (
                          <motion.div
                            key={booking.booking_id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="group flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={() => router.push(`/dashboard/student/profile/bookings/${booking.booking_id}`)}
                            onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/student/profile/bookings/${booking.booking_id}`)}
                          >
                            <div className="flex-shrink-0 text-center bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 min-w-[70px]">
                              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{nextDate!.getDate()}</div>
                              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                {nextDate!.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                                {booking.class_details.tutor.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {formatTime(booking.class_details.class_times[0]?.start_time || '09:00')} -
                                  {formatTime(booking.class_details.class_times[0]?.end_time || '10:00')}
                                </span>
                              </div>
                              <Badge variant="secondary" className="text-xs">
                                {booking.class_details.subject.name}
                              </Badge>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <CalendarDays className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">No upcoming classes scheduled</p>
                      <Button onClick={() => router.push('/dashboard/student/find-tutor')} className="bg-blue-600 hover:bg-blue-700">
                        Find a Tutor
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Bookings */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Current Bookings
                      </CardTitle>
                      <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                        Active and upcoming sessions
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/dashboard/student/profile/bookings')}
                      className="border-slate-300 dark:border-slate-700"
                      aria-label="View all bookings"
                    >
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-56" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      <AnimatePresence>
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
                            <motion.div
                              key={b.booking_id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                              role="button"
                              tabIndex={0}
                              onClick={() => router.push(`/dashboard/student/profile/bookings/${b.booking_id}`)}
                              onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/student/profile/bookings/${b.booking_id}`)}
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                                  <AvatarImage src={b.class_details.tutor.image || ''} alt={`${b.class_details.tutor.name}'s avatar`} />
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white font-semibold">
                                    {tutorInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-0.5 truncate">
                                    {b.class_details.tutor.name}
                                  </h5>
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                      {b.class_details.subject.name}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                                      {b.class_details.language.name}
                                    </Badge>
                                  </div>
                                  {next ? (
                                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                                      <span className="flex items-center gap-1">
                                        <CalendarDays className="h-3.5 w-3.5" />
                                        {formatDate(next.toISOString())}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {formatTime(b.class_details.class_times[0]?.start_time || '09:00')}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="text-xs text-slate-500 dark:text-slate-500">No upcoming date</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                <Badge
                                  variant={b.booking_status.toUpperCase() === 'CONFIRMED' ? 'default' : 'secondary'}
                                  className={b.booking_status.toUpperCase() === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : ''}
                                  aria-label={`Booking status: ${b.booking_status}`}
                                >
                                  {b.booking_status}
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => router.push('/dashboard/student/profile/bookings')}
                                  className="hidden sm:flex"
                                  aria-label="Manage booking"
                                >
                                  Manage
                                </Button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                        <BookOpen className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">No bookings yet</p>
                      <Button onClick={() => router.push('/dashboard/student/find-tutor')} className="bg-blue-600 hover:bg-blue-700">
                        Find a Tutor
                      </Button>
                    </div>
                  )}
                  {error && (
                    <div className="mt-4 flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Explore Subjects */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <CardTitle className="text-xl text-slate-900 dark:text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Explore Subjects
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    Jump into topics that interest you
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="text"
                        placeholder="Search subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                        aria-label="Search subjects"
                      />
                    </div>
                  </div>
                  <AnimatePresence>
                    <div className="flex flex-wrap gap-2">
                      {filteredSubjects.map((s) => (
                        <motion.button
                          key={s}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => router.push(`/dashboard/student/find-tutor?subject=${s.toLowerCase()}`)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-full text-sm font-medium transition-all hover:scale-105"
                          aria-label={`Explore ${s}`}
                        >
                          {s}
                        </motion.button>
                      ))}
                    </div>
                  </AnimatePresence>
                  {filteredSubjects.length === 0 && (
                    <p className="text-slate-600 dark:text-slate-400 text-center mt-4">No subjects found</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Cards with Progress Tracker */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-lg">
                  <CardContent className="p-5 text-center">
                    {isLoading ? (
                      <Skeleton className="h-10 w-16 mx-auto bg-white/20" />
                    ) : (
                      <div className="text-3xl font-bold mb-1">{stats?.classCount ?? bookings.length}</div>
                    )}
                    <p className="text-sm text-blue-100 font-medium">Active Classes</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white border-0 shadow-lg">
                  <CardContent className="p-5 text-center">
                    {isLoading ? (
                      <Skeleton className="h-10 w-16 mx-auto bg-white/20" />
                    ) : (
                      <>
                        <div className="text-3xl font-bold mb-1">{stats?.sessionCount ?? 0}</div>
                        <div className="w-full bg-indigo-100/20 h-2 rounded-full mt-2">
                          <div
                            className="bg-indigo-300 h-2 rounded-full"
                            style={{ width: `${Math.min((stats?.sessionCount ?? 0) * 10, 100)}%` }}
                          />
                        </div>
                      </>
                    )}
                    <p className="text-sm text-indigo-100 font-medium mt-2">Completed Sessions</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Announcements */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Announcements
                    <Badge variant="destructive" className="ml-2">2 New</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg backdrop-blur-sm">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Keep Schedule Updated</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Add preferred times for better tutor matches.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-900/60 rounded-lg backdrop-blur-sm">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                      <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Monthly Classes</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Pay early to secure sessions without interruption.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Suggested Tutors */}
            <motion.div initial="hidden" animate="visible" variants={cardVariants}>
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg">
                <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <CardTitle className="text-lg text-slate-900 dark:text-white">Top Tutors</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">Highly rated instructors</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <AnimatePresence>
                      {suggestedTutors.map((tutor) => (
                        <motion.div
                          key={tutor.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="group flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => router.push(`/dashboard/student/tutor/${tutor.id}`)}
                          onKeyDown={(e) => e.key === 'Enter' && router.push(`/dashboard/student/tutor/${tutor.id}`)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-700 shadow-sm">
                              <AvatarImage src={tutor.image} alt={`${tutor.name}'s avatar`} />
                              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold text-sm">
                                {tutor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-sm text-slate-900 dark:text-white mb-0.5 truncate">
                                {tutor.name}
                              </h5>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 truncate">{tutor.subject}</p>
                              <div className="flex items-center gap-1">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{tutor.rating}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">${tutor.price}<span className="text-xs font-normal text-slate-500">/hr</span></p>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-7 px-3 border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600"
                              aria-label={`View ${tutor.name}'s profile`}
                            >
                              View
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  <Button
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
                    onClick={() => router.push('/dashboard/student/find-tutor')}
                    aria-label="Browse all tutors"
                  >
                    Browse All Tutors
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}