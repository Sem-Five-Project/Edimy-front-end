// "use client"

// import React, { useEffect, useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"
// import {
//   CreditCard,
//   Download,
//   CheckCircle2,
//   XCircle,
//   Clock,
//   ArrowLeft,
//   Calendar
// } from "lucide-react"
// import Link from "next/link"

// interface Payment {
//   id: string
//   date: string
//   tutorName: string
//   subject: string
//   amount: number
//   status: "completed" | "pending" | "failed"

// }

// export default function PaymentHistoryPage() {
//   const [timeFilter, setTimeFilter] = useState<string>("all")

//   const payments: Payment[] = [
//     {
//       id: "1",
//       date: "2024-01-15",
//       tutorName: "Dr. Sarah Johnson",
//       subject: "Advanced Mathematics",
//       amount: 2500,
//       status: "completed",
//       //paymentMethod: "Credit Card",
//       //transactionId: "TXN001234567"
//     },
//     {
//       id: "2",
//       date: "2024-01-10",
//       tutorName: "Prof. Michael Chen",
//       subject: "Physics",
//       amount: 3000,
//       status: "completed",
//       //paymentMethod: "PayPal",
//       //transactionId: "TXN001234568"
//     },
//     {
//       id: "3",
//       date: "2024-01-05",
//       tutorName: "Ms. Emily Davis",
//       subject: "Chemistry",
//       amount: 2000,
//       status: "pending",
//       //paymentMethod: "Bank Transfer",
//       //transactionId: "TXN001234569"
//     },
//     {
//       id: "4",
//       date: "2023-12-20",
//       tutorName: "Dr. James Wilson",
//       subject: "Biology",
//       amount: 2800,
//       status: "completed",
//       //paymentMethod: "Credit Card",
//       //transactionId: "TXN001234570"
//     },
//     {
//       id: "5",
//       date: "2023-08-15",
//       tutorName: "Prof. Lisa Anderson",
//       subject: "English Literature",
//       amount: 2200,
//       status: "completed",
//       //paymentMethod: "PayPal",
//       //transactionId: "TXN001234571"
//     },
//     {
//       id: "6",
//       date: "2023-02-10",
//       tutorName: "Dr. Robert Brown",
//       subject: "History",
//       amount: 1800,
//       status: "completed",
//       //paymentMethod: "Bank Transfer",
//       //transactionId: "TXN001234572"
//     },
//   ]
//   useEffect(()=>{

//   },[])

//   const filterPaymentsByTime = (payments: Payment[]) => {
//     const now = new Date()
//     const currentDate = now.getTime()

//     switch (timeFilter) {
//       case "lastMonth": {
//         const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()
//         return payments.filter(p => new Date(p.date).getTime() >= lastMonth)
//       }
//       case "last6Months": {
//         const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime()
//         return payments.filter(p => new Date(p.date).getTime() >= last6Months)
//       }
//       case "lastYear": {
//         const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime()
//         return payments.filter(p => new Date(p.date).getTime() >= lastYear)
//       }
//       case "all":
//       default:
//         return payments
//     }
//   }

//   const filteredPayments = filterPaymentsByTime(payments)

//   const getStatusBadge = (status: Payment["status"]) => {
//     switch (status) {
//       case "completed":
//         return (
//           <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
//             <CheckCircle2 className="h-3 w-3 mr-1" />
//             Completed
//           </Badge>
//         )
//       case "pending":
//         return (
//           <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300">
//             <Clock className="h-3 w-3 mr-1" />
//             Pending
//           </Badge>
//         )
//       case "failed":
//         return (
//           <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">
//             <XCircle className="h-3 w-3 mr-1" />
//             Failed
//           </Badge>
//         )
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
//       <div className="container mx-auto px-4 py-8 max-w-7xl">
//         {/* Header */}
//         <div className="mb-8">
//           <Link href="/dashboard/student/profile">
//             <Button variant="ghost" className="mb-4 text-slate-700 hover:text-slate-900 hover:bg-slate-200">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Back to Profile
//             </Button>
//           </Link>
//           <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment History</h1>
//           <p className="text-slate-600">Track all your transactions and billing details</p>
//         </div>

//         {/* Payments Table Card */}
//         <Card className="border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
//           <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 border-b border-blue-200">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div>
//                 <CardTitle className="text-white text-2xl flex items-center gap-2 mb-1">
//                   <CreditCard className="h-6 w-6" />
//                   Transaction History
//                 </CardTitle>
//                 <CardDescription className="text-blue-100">
//                   View and download your payment receipts
//                 </CardDescription>
//               </div>
//               <div className="flex items-center gap-2">
//                 <Calendar className="h-5 w-5 text-blue-100" />
//                 <Select value={timeFilter} onValueChange={setTimeFilter}>
//                   <SelectTrigger className="w-48 bg-white/90 border-blue-200 hover:bg-white focus:border-blue-300 focus:ring-blue-300">
//                     <SelectValue placeholder="Select time period" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white border-blue-200">
//                     <SelectItem value="all" className="hover:bg-blue-50">All Time</SelectItem>
//                     <SelectItem value="lastMonth" className="hover:bg-blue-50">Last Month</SelectItem>
//                     <SelectItem value="last6Months" className="hover:bg-blue-50">Last 6 Months</SelectItem>
//                     <SelectItem value="lastYear" className="hover:bg-blue-50">Last Year</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="p-0">
//             <div className="overflow-x-auto">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-slate-50 hover:bg-slate-100 border-b border-slate-200">
//                     <TableHead className="font-bold text-slate-900 text-base">Date</TableHead>
//                     <TableHead className="font-bold text-slate-900 text-base">Tutor</TableHead>
//                     <TableHead className="font-bold text-slate-900 text-base">Subject</TableHead>
//                     <TableHead className="font-bold text-slate-900 text-base">Amount</TableHead>
//                     <TableHead className="font-bold text-slate-900 text-base">Status</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredPayments.length > 0 ? (
//                     filteredPayments.map((payment) => (
//                       <TableRow key={payment.id} className="hover:bg-blue-50 transition-colors border-b border-slate-100">
//                         <TableCell className="font-medium text-slate-900">
//                           {new Date(payment.date).toLocaleDateString('en-US', {
//                             year: 'numeric',
//                             month: 'short',
//                             day: 'numeric'
//                           })}
//                         </TableCell>
//                         <TableCell className="text-slate-700 font-medium">{payment.tutorName}</TableCell>
//                         <TableCell className="text-slate-700">{payment.subject}</TableCell>
//                         <TableCell className="font-bold text-green-600 text-base">
//                           Rs. {payment.amount.toLocaleString()}
//                         </TableCell>
//                         <TableCell>{getStatusBadge(payment.status)}</TableCell>

//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={8} className="text-center py-12">
//                         <div className="flex flex-col items-center gap-3">
//                           <CreditCard className="h-12 w-12 text-slate-400" />
//                           <p className="text-slate-600 text-lg font-medium">No payments found</p>
//                           <p className="text-slate-500 text-sm">Try selecting a different time period</p>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Filter,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  User,
  BookOpen,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { studentAPI } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface APIPayment {
  amount: number;
  tutorName: string | null;
  subject: string | null;
  status: string | null;
  paymentTime: number | null;
}

interface Payment {
  id: string;
  amount: number;
  tutorName: string;
  subject: string;
  status: "completed" | "pending" | "failed";
  paymentTime: string;
  method?: string;
  orderId?: string;
}

type TimeFilter = "last_month" | "last_6_months" | "last_year" | "all_time";

export default function PaymentHistoryPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all_time");

  // Fetch payment data with React Query
  const {
    data: payments,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery<Payment>({
    queryKey: ["studentPayments", userId, timeFilter],
    enabled: Boolean(userId),
    queryFn: async () => {
      const res = await studentAPI.loadStudentProfilePayment(
        userId,
        timeFilter,
      );
      const apiPayment = res.data as APIPayment;
      // Transform the API payment into our Payment type
      return {
        id: String(Math.random()), // Generate a random ID since API doesn't provide one
        amount: apiPayment.amount,
        tutorName: apiPayment.tutorName || "Unknown Tutor",
        subject: apiPayment.subject || "Unknown Subject",
        status:
          (apiPayment.status?.toLowerCase() as
            | "completed"
            | "pending"
            | "failed") || "pending",
        paymentTime: apiPayment.paymentTime
          ? new Date(apiPayment.paymentTime).toISOString()
          : new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  const isLoading = isPending || isFetching;

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
    }
  };

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "last_month":
        return "Last Month";
      case "last_6_months":
        return "Last 6 Months";
      case "last_year":
        return "Last Year";
      case "all_time":
        return "All Time";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student/profile">
            <Button
              variant="ghost"
              className="mb-4 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Payment History
              </h1>
              <p className="text-gray-600">
                Track all your payment transactions
              </p>
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <Select
                value={timeFilter}
                onValueChange={(value) => setTimeFilter(value as TimeFilter)}
              >
                <SelectTrigger className="w-[180px] bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Payment History List */}
        <Card className="border-blue-200 bg-white shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
            <CardTitle className="text-gray-900 text-2xl">
              Transaction History
            </CardTitle>
            <CardDescription className="text-gray-600">
              All your payment transactions for{" "}
              {getTimeFilterLabel(timeFilter).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 text-lg">
                  Loading payment history...
                </p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-16">
                <XCircle className="h-12 w-12 text-red-600 mb-4" />
                <p className="text-gray-600 text-lg">Failed to load payments</p>
                <p className="text-gray-500 text-sm mt-2">
                  {error?.message || "Please try again"}
                </p>
              </div>
            ) : !payments ? (
              <div className="flex flex-col items-center justify-center py-16">
                <CreditCard className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg font-medium">
                  No payments found
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  No transactions for{" "}
                  {getTimeFilterLabel(timeFilter).toLowerCase()}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="border-gray-200 hover:shadow-lg transition-all duration-200 bg-white">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left Section: Basic Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex-1 space-y-2">
                          {/* Subject */}
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Subject
                              </p>
                              <h3 className="font-bold text-gray-900 text-base">
                                {payments.subject}
                              </h3>
                            </div>
                          </div>

                          {/* Tutor Name */}
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                Tutor
                              </p>
                              <p className="text-gray-900 font-semibold text-sm">
                                {payments.tutorName}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center Section: Date & Time */}
                      <div className="flex items-center gap-2 lg:min-w-[180px] p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Date & Time
                          </p>
                          <p className="text-gray-900 font-semibold text-sm">
                            {new Date(payments.paymentTime).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {new Date(payments.paymentTime).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Right Section: Amount & Status */}
                      <div className="flex flex-col items-end gap-2 lg:min-w-[160px]">
                        <div className="text-right p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-md w-full">
                          <p className="text-xs text-gray-600 uppercase tracking-wide">
                            Amount
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            Rs. {payments.amount.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 w-full justify-end">
                          {getStatusBadge(payments.status as any)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
