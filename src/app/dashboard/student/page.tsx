'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Clock, Star, BookOpen, ChevronRight } from 'lucide-react';
//import { useNavigate } from 'react-router-dom';
import { useRouter } from 'next/navigation';

//import { bookingAPI } from '@/lib/api';
import { Booking } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
console.log("StudentDashboard render - user:", user);
  // useEffect(() => {
  //   loadUserBookings();
  // }, []);

  // const loadUserBookings = async () => {
  //   try {
  //     const response = await bookingAPI.getUserBookings();
  //     if (response.success) {
  //       setBookings(response.data);
  //     }
  //   } catch (error) {
  //     console.error('Failed to load bookings:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const upcomingClasses = bookings.filter(booking => 
    booking.status === 'confirmed' && 
    new Date(booking.slot.date) >= new Date()
  );

  const recentBookings = bookings.slice(0, 3);

  const suggestedTutors = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      rating: 4.9,
      price: 60,
      image: '',
    },
    {
      id: '2',
      name: 'Prof. Michael Chen',
      subject: 'Physics',
      rating: 4.8,
      price: 55,
      image: '',
    },
    {
      id: '3',
      name: 'Dr. Emily Davis',
      subject: 'Chemistry',
      rating: 4.7,
      price: 50,
      image: '',
    },
  ];

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
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName}!</h1>
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
                onClick={() => router.push('/bookings')}
              >
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    </div>
                  ))}
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={booking.tutor.profileImage} />
                          <AvatarFallback>
                            {booking.tutor.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{booking.tutor.fullName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {booking.tutor.subjects.join(', ')}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <CalendarDays className="h-4 w-4" />
                            <span>{formatDate(booking.slot.date)}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{formatTime(booking.slot.startTime)} - {formatTime(booking.slot.endTime)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${booking.slot.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No bookings yet</p>
                  <Button 
                    className="mt-4" 
                    onClick={() => router.push('/find-tutors')}
                  >
                    Find a Tutor
                  </Button>
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
              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {new Date(booking.slot.date).getDate()}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(booking.slot.date).toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium">{booking.tutor.fullName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(booking.slot.startTime)} - {formatTime(booking.slot.endTime)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {booking.tutor.subjects.join(', ')}
                          </p>
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
                <div className="text-2xl font-bold text-primary">{bookings.length}</div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{upcomingClasses.length}</div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
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
                {suggestedTutors.map((tutor) => (
                  <div key={tutor.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={tutor.image} />
                        <AvatarFallback>
                          {tutor.name.split(' ').map(n => n[0]).join('')}
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
              <Button 
                className="w-full mt-4" 
                variant="outline"
                onClick={() => router.push('/find-tutors')}
              >
                Browse All Tutors
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};