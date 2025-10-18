"use client"

import React, { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  Loader2,
  DollarSign
} from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import { bookingAPI } from "@/lib/api"
import { useCurrency } from "@/contexts/CurrencyContext"

// Types for the API response
interface BookingDetails {
  booking_id: number;
  booking_status: string;
  payment_id: string;
  paid_amount: number;
  class_details: {
    tutor: {
      id: number;
      name: string;
      bio: string | null;
    };
    subject: {
      id: number;
      name: string;
    };
    language: {
      id: number;
      name: string;
    };
    class_times: {
      slots: string[];
      start_time: string;
      end_time: string;
    }[];
  };
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<BookingDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refundLoading, setRefundLoading] = useState(false)
  const [refundSuccess, setRefundSuccess] = useState(false)
  const [refundError, setRefundError] = useState<string | null>(null)
  
  const { effectiveStudentId } = useAuth()
  const { formatPrice } = useCurrency()
  const queryClient = useQueryClient()

  const { data: bookings = [], isPending, isFetching } = useQuery<BookingDetails[]>({
    queryKey: ['studentBookings', effectiveStudentId],
    enabled: !!effectiveStudentId,
    queryFn: async () => {
      if (!effectiveStudentId) return []
      const response = await bookingAPI.getStudentBookingDetails(Number(effectiveStudentId))
      if (response.success) return response.data || []
      throw new Error(response.error || 'Failed to fetch booking details')
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
  const loading = isPending

  // Effect to log changes when bookings state is updated


  const handleCancelBooking = (booking: BookingDetails) => {
    setSelectedBooking(booking)
    setCancelDialogOpen(true)
  }

  const confirmCancel = async () => {
    if (!selectedBooking) return

    setRefundLoading(true)
    setRefundError(null)
    setRefundSuccess(false)

    try {
      console.log("Requesting refund for payment:", selectedBooking.payment_id)
      // Pass should_refund as false as per backend requirement
      const response = await bookingAPI.cancelBooking(selectedBooking.payment_id, false)
      
      console.log("Refund response:", response)

      if (response.success) {
        // Success - update the booking status to REFUNDED in cache
        queryClient.setQueryData<BookingDetails[] | undefined>(['studentBookings', effectiveStudentId], (prev) => {
          if (!prev) return prev
          return prev.map(b => b.booking_id === selectedBooking.booking_id ? { ...b, booking_status: 'REFUNDED' } : b)
        })
        setRefundSuccess(true)
        
        // Switch to cancelled tab to show the refunded booking
        setActiveTab("cancelled")
        
        // Close dialog after 2 seconds
        setTimeout(() => {
          setCancelDialogOpen(false)
          setSelectedBooking(null)
          setRefundSuccess(false)
        }, 2000)
      } else {
        const errorMessage = (response as any)?.data?.message || (response as any)?.error || "Failed to process refund"
        console.log("Refund failed with message:", errorMessage)
        setRefundError(errorMessage)
      }
    } catch (err: any) {
      console.error("Error cancelling booking:", err)
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        "An error occurred while processing the refund"
      setRefundError(errorMessage)
    } finally {
      setRefundLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    
    if (normalizedStatus === "BOOKED" || normalizedStatus === "CONFIRMED") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300">
          <Clock className="h-3 w-3 mr-1" />
          Confirmed
        </Badge>
      )
    } else if (normalizedStatus === "COMPLETED") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Completed
        </Badge>
      )
    } else if (normalizedStatus === "CANCELLED") {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      )
    } else if (normalizedStatus === "REFUNDED") {
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-300">
          <DollarSign className="h-3 w-3 mr-1" />
          Refunded
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300">
          <AlertCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      )
    }
  }

  const filterBookings = (status: string) => {
    return bookings.filter(b => {
      const bookingStatus = b.booking_status.toUpperCase()
      if (status === "upcoming") {
        return bookingStatus === "BOOKED" || bookingStatus === "CONFIRMED"
      } else if (status === "completed") {
        return bookingStatus === "COMPLETED"
      } else if (status === "cancelled") {
        return bookingStatus === "CANCELLED" || bookingStatus === "REFUNDED"
      }
      return false
    })
  }

  const totalUpcoming = filterBookings("upcoming").length
  const totalCompleted = filterBookings("completed").length

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':')
      const hour24 = parseInt(hours)
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24
      const ampm = hour24 >= 12 ? 'PM' : 'AM'
      return `${hour12}:${minutes} ${ampm}`
    } catch {
      return time
    }
  }

  const formatDateRange = (slots: string[]) => {
    if (slots.length === 0) return "No dates scheduled"
    if (slots.length === 1) {
      return new Date(slots[0]).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    }
    
    const sortedSlots = [...slots].sort()
    const firstDate = new Date(sortedSlots[0])
    const lastDate = new Date(sortedSlots[sortedSlots.length - 1])
    
    return `${firstDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${lastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${slots.length} sessions)`
  }

  const BookingCard = ({ booking }: { booking: BookingDetails }) => {
    const { class_details } = booking
    const allSlots = class_details.class_times.flatMap(ct => ct.slots).filter(slot => slot)
    const uniqueTimeSlots = class_details.class_times.filter(ct => ct.slots.length > 0)
    const [showAllSlots, setShowAllSlots] = useState(false)
    
    return (
      <Card className="border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl">
                  {class_details.tutor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-slate-900 text-xl mb-1">{class_details.subject.name}</CardTitle>
                <CardDescription className="text-slate-600 font-medium flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  {class_details.tutor.name}
                </CardDescription>
                <CardDescription className="text-slate-600 text-sm mb-2">
                  Language: {class_details.language.name}
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  {getStatusBadge(booking.booking_status)}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-slate-600">
                <DollarSign className="h-4 w-4" />
                <span className="font-semibold text-lg text-blue-600">
                  {formatPrice(booking.paid_amount)}
                </span>
              </div>
              <p className="text-xs text-slate-500">Total Paid</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Session Details */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600">Scheduled Sessions</p>
                  <p className="font-semibold text-slate-900">
                    {formatDateRange(allSlots)}
                  </p>
                </div>
              </div>

              {/* Time Slots */}
              {uniqueTimeSlots.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">Class Times:</p>
                  <div className="grid gap-2">
                    {(showAllSlots ? uniqueTimeSlots : uniqueTimeSlots.slice(0, 3)).map((timeSlot, index) => (
                      <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatTime(timeSlot.start_time)} - {formatTime(timeSlot.end_time)}
                            </p>
                            <p className="text-xs text-slate-600">
                              {timeSlot.slots.length} session{timeSlot.slots.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        {/* Show dates for this time slot */}
                        {timeSlot.slots.length > 0 && (
                          <div className="ml-7 space-y-1">
                            <p className="text-xs font-medium text-slate-500 mb-1">Dates:</p>
                            <div className="flex flex-wrap gap-1">
                              {timeSlot.slots.slice(0, 6).map((date, dateIndex) => (
                                <span
                                  key={dateIndex}
                                  className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-md"
                                >
                                  {new Date(date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </span>
                              ))}
                              {timeSlot.slots.length > 6 && (
                                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                                  +{timeSlot.slots.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {uniqueTimeSlots.length > 3 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSlots(!showAllSlots)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                      >
                        {showAllSlots 
                          ? `Show Less` 
                          : `Show ${uniqueTimeSlots.length - 3} More Time Slots`
                        }
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {booking.booking_status.toUpperCase() === "CONFIRMED" && (
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
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-slate-600 animate-pulse">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Link href="/dashboard/student/profile">
            <Button variant="ghost" className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <Card className="border-red-200 bg-white shadow-lg">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-red-500 mb-4" />
              <p className="text-red-600 text-lg font-medium mb-2">Error Loading Bookings</p>
              <p className="text-slate-500 text-sm">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student/profile">
            <Button variant="ghost" className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
          <p className="text-slate-600">Manage your scheduled online tutoring sessions</p>
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
              <p className="text-4xl font-bold text-slate-900">{totalCompleted}</p>
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
              filterBookings("upcoming").map(booking => (
                <BookingCard key={booking.booking_id} booking={booking} />
              ))
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-12 text-center">
                  <Calendar className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 text-lg font-medium">No upcoming bookings</p>
                  <p className="text-slate-500 text-sm mt-2">Book a session to get started</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {filterBookings("completed").length > 0 ? (
              filterBookings("completed").map(booking => (
                <BookingCard key={booking.booking_id} booking={booking} />
              ))
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 text-lg font-medium">No completed sessions yet</p>
                  <p className="text-slate-500 text-sm mt-2">Your finished sessions will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {filterBookings("cancelled").length > 0 ? (
              filterBookings("cancelled").map(booking => (
                <BookingCard key={booking.booking_id} booking={booking} />
              ))
            ) : (
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardContent className="py-12 text-center">
                  <XCircle className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                  <p className="text-slate-600 text-lg font-medium">No cancelled bookings</p>
                  <p className="text-slate-500 text-sm mt-2">Cancelled sessions will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="bg-white border-red-200 shadow-2xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-slate-900 text-xl flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-red-600" />
                Cancel Booking & Request Refund
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Review the refund policy before cancelling your booking.
              </DialogDescription>
            </DialogHeader>
            
            {selectedBooking && (
              <div className="space-y-4">
                {/* Booking Details */}
                <div className="py-4 space-y-2 bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Subject:</span> {selectedBooking.class_details.subject.name}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Tutor:</span> {selectedBooking.class_details.tutor.name}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Booking ID:</span> {selectedBooking.booking_id}
                  </p>
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold">Amount to Refund:</span> {formatPrice(selectedBooking.paid_amount)}
                  </p>
                </div>

                {/* Refund Policy */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Refund Policy
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
                    <li>You can only request a refund <strong>24 hours before</strong> the first session</li>
                    <li>Refunds processed <strong>immediately after payment</strong> may take a few minutes</li>
                    <li>Refunds requested after some time may take <strong>up to 10 business days</strong></li>
                    <li>The refund will be credited to your original payment method</li>
                  </ul>
                </div>

                {/* Success Message */}
                {refundSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <p className="font-semibold">Refund Processed Successfully!</p>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your booking has been cancelled and the refund has been initiated. 
                      You will receive the amount within the timeframe mentioned above.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {refundError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-5 w-5" />
                      <p className="font-semibold">Refund Failed</p>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{refundError}</p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setCancelDialogOpen(false)
                  setRefundError(null)
                  setRefundSuccess(false)
                }}
                disabled={refundLoading}
                className="border-slate-300 hover:bg-slate-100"
              >
                {refundSuccess ? "Close" : "Keep Booking"}
              </Button>
              {!refundSuccess && (
                <Button
                  onClick={confirmCancel}
                  disabled={refundLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {refundLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Refund...
                    </>
                  ) : (
                    "Yes, Cancel & Refund"
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}