"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  Video,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Booking {
  id: string;
  tutorName: string;
  tutorImage: string;
  subject: string;
  date: string;
  time: string;
  duration: string;
  status: "upcoming" | "completed" | "cancelled";
  zoomLink: string;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const bookings: Booking[] = [
    {
      id: "1",
      tutorName: "Dr. Sarah Johnson",
      tutorImage: "/placeholder.svg",
      subject: "Advanced Mathematics",
      date: "2024-01-20",
      time: "10:00 AM",
      duration: "1 hour",
      status: "upcoming",
      zoomLink: "https://zoom.us/j/123456789",
    },
    {
      id: "2",
      tutorName: "Prof. Michael Chen",
      tutorImage: "/placeholder.svg",
      subject: "Physics",
      date: "2024-01-22",
      time: "02:00 PM",
      duration: "1.5 hours",
      status: "upcoming",
      zoomLink: "https://zoom.us/j/987654321",
    },
    {
      id: "3",
      tutorName: "Ms. Emily Davis",
      tutorImage: "/placeholder.svg",
      subject: "Chemistry",
      date: "2024-01-15",
      time: "03:00 PM",
      duration: "1 hour",
      status: "completed",
      zoomLink: "https://zoom.us/j/456789123",
    },
  ];

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const confirmCancel = () => {
    console.log("Cancelling booking:", selectedBooking?.id);
    setCancelDialogOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "upcoming":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Upcoming
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
    }
  };

  const filterBookings = (status: Booking["status"]) => {
    return bookings.filter((b) => b.status === status);
  };

  const totalUpcoming = filterBookings("upcoming").length;
  const totalCompleted = filterBookings("completed").length;

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <Card className="border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-md">
              <AvatarImage src={booking.tutorImage} alt={booking.tutorName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                {booking.tutorName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-slate-900 text-xl mb-1">
                {booking.subject}
              </CardTitle>
              <CardDescription className="text-slate-600 font-medium flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                {booking.tutorName}
              </CardDescription>
              <div className="flex gap-2 mt-2">
                {getStatusBadge(booking.status)}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Session Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-slate-600">Date</p>
                <p className="font-semibold text-slate-900">
                  {new Date(booking.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-slate-600">Time & Duration</p>
                <p className="font-semibold text-slate-900">
                  {booking.time} ({booking.duration})
                </p>
              </div>
            </div>

            {/* Zoom Link */}
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <Video className="h-6 w-6 text-purple-600" />
              <div className="flex-1">
                <p className="text-xs text-purple-700 font-medium mb-1">
                  Zoom Meeting Link
                </p>
                <a
                  href={booking.zoomLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-purple-600 hover:text-purple-700 hover:underline break-all flex items-center gap-1"
                >
                  Join Zoom Session
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <Button
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
                onClick={() => window.open(booking.zoomLink, "_blank")}
              >
                <Video className="h-4 w-4 mr-1" />
                Join Now
              </Button>
            </div>
          </div>

          {/* Actions */}
          {booking.status === "upcoming" && (
            <div className="flex gap-2 pt-4 border-t border-slate-200">
              <Button
                variant="outline"
                className="flex-1 border-slate-300 hover:bg-slate-100 font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50 font-medium"
                onClick={() => handleCancelBooking(booking)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student/profile">
            <Button
              variant="ghost"
              className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            My Bookings
          </h1>
          <p className="text-slate-600">
            Manage your scheduled online tutoring sessions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalUpcoming}</p>
              <p className="text-blue-100 text-sm mt-1">Scheduled bookings</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-slate-900">
                {totalCompleted}
              </p>
              <p className="text-slate-600 text-sm mt-1">Finished sessions</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white border border-slate-200 shadow-sm mb-6">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="cancelled"
              className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700"
            >
              Cancelled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {filterBookings("upcoming").length > 0 ? (
              filterBookings("upcoming").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 text-lg font-medium">
                    No upcoming bookings
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Book a session to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {filterBookings("completed").length > 0 ? (
              filterBookings("completed").map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 text-lg font-medium">
                    No completed sessions yet
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Your finished sessions will appear here
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            <Card className="border-slate-200 bg-white shadow-lg">
              <CardContent className="py-12 text-center">
                <XCircle className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 text-lg font-medium">
                  No cancelled bookings
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Cancelled sessions will appear here
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="bg-white border-red-200 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Cancel Booking
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Are you sure you want to cancel this booking? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="py-4 space-y-2 bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Subject:</span>{" "}
                  {selectedBooking.subject}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Tutor:</span>{" "}
                  {selectedBooking.tutorName}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(selectedBooking.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">Time:</span>{" "}
                  {selectedBooking.time}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
                className="border-slate-300 hover:bg-slate-100"
              >
                Keep Booking
              </Button>
              <Button
                onClick={confirmCancel}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Cancel Booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
