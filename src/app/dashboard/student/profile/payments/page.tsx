"use client"

import React, { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Calendar,
  User,
  BookOpen,
  DollarSign,
  Receipt,
  Filter as FilterIcon,
} from "lucide-react"
import Link from "next/link"
import { studentAPI } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface Payment {
  id: string
  amount: number
  tutorName: string
  subject: string
  status: "completed" | "pending" | "failed"
  paymentTime: string
  method?: string
  orderId?: string
}

type TimeFilter = "last_month" | "last_6_months" | "last_year" | "all_time"

export default function PaymentHistoryPage() {
  const { user } = useAuth()
  const studentId = user?.studentId != null ? String(user.studentId) : null
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all_time")

  const {
    data: payments,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery<Payment[]>({
    queryKey: ["studentPayments", studentId, timeFilter],
    enabled: Boolean(studentId),
    queryFn: async () => {
      if (!studentId) return []

      const res = await studentAPI.loadStudentProfilePayment(String(studentId), timeFilter)
      const data: any = res?.data

      const normalize = (p: any): Payment => {
        const getTimeString = (t: any) => {
          if (!t) return new Date().toISOString()
          if (typeof t?.toDate === "function") return t.toDate().toISOString()
          if (typeof t === "number") return new Date(t).toISOString()
          return String(t)
        }

        return {
          id: p?.id ?? p?._id ?? String(p?.orderId ?? Math.random()),
          amount: Number(p?.amount ?? 0),
          tutorName: p?.tutorName ?? p?.tutor?.name ?? "Unknown",
          subject: p?.subject ?? "Unknown",
          status: (p?.status ?? "completed") as Payment["status"],
          paymentTime: getTimeString(p?.paymentTime),
          method: p?.method,
          orderId: p?.orderId,
        }
      }

      if (Array.isArray(data)) {
        return data.map((it) => normalize(it))
      }

      if (data && Array.isArray(data.payments)) {
        return data.payments.map((it: any) => normalize(it))
      }

      if (data && typeof data === "object") {
        return [normalize(data)]
      }

      return []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  const isLoading = isPending

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300 font-medium">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300 font-medium">
            <XCircle className="h-3.5 w-3.5 mr-1.5" />
            Failed
          </Badge>
        )
    }
  }

  const getTimeFilterLabel = (filter: TimeFilter) => {
    switch (filter) {
      case "last_month":
        return "Last Month"
      case "last_6_months":
        return "Last 6 Months"
      case "last_year":
        return "Last Year"
      case "all_time":
        return "All Time"
    }
  }

  const totalSpent = useMemo(() => {
    if (!payments) return 0
    return payments.reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  return (
    <div className="min-h-screen bg-white">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 -z-10" />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/student/profile">
            <Button variant="ghost" className="mb-6 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment History</h1>
              <p className="text-slate-600 text-lg">Track and manage all your payment transactions</p>
            </div>
            
            {/* Time Filter - Single Div */}
              
              <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
                
                <SelectTrigger className="w-[200px] border-0 focus:ring-0 font-medium text-slate-700">
                  
                                <FilterIcon className="h-5 w-5 text-blue-600" />

                  <SelectValue />

                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-lg">
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="all_time">All Time</SelectItem>
                </SelectContent>
              </Select>
          </div>
        </div>

        {/* Single Stat Card - Total Spent */}
        <div className="mb-8">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium mb-1">Total Spent</p>
                  <p className="text-4xl font-bold text-slate-900">Rs. {totalSpent.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 mt-2">Across all transactions</p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment History List */}
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
            <CardTitle className="text-slate-900 text-2xl font-semibold">Transaction History</CardTitle>
            <CardDescription className="text-slate-600">
              All your payment transactions for {getTimeFilterLabel(timeFilter).toLowerCase()}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-600 text-lg font-medium">Loading payment history...</p>
              </div>
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-20">
                <XCircle className="h-12 w-12 text-rose-600 mb-4" />
                <p className="text-slate-900 text-lg font-semibold mb-2">Failed to load payments</p>
                <p className="text-slate-500">{error?.message || "Please try again"}</p>
              </div>
            ) : !payments || payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <CreditCard className="h-20 w-20 text-slate-300 mb-6" />
                <p className="text-slate-900 text-xl font-semibold mb-2">No payments found</p>
                <p className="text-slate-500">
                  No transactions for {getTimeFilterLabel(timeFilter).toLowerCase()}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {isFetching && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Refreshing data...
                  </div>
                )}
                {payments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="border-slate-200 hover:shadow-lg transition-all duration-200 bg-white hover:border-blue-200"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                        {/* Left Section: Basic Info */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Subject</p>
                              <h3 className="font-bold text-slate-900 text-lg">
                                {payment.subject}
                              </h3>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <User className="h-5 w-5 text-slate-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Tutor</p>
                              <p className="text-slate-900 font-semibold text-base">
                                {payment.tutorName}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Center Section: Date & Time */}
                        <div className="xl:min-w-[200px] bg-slate-50 rounded-xl p-4 border border-slate-200">
                          <div className="flex items-center gap-3 mb-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date & Time</p>
                          </div>
                          <p className="text-slate-900 font-bold text-base mb-1">
                            {new Date(payment.paymentTime).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          <p className="text-slate-600 text-sm">
                            {new Date(payment.paymentTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        {/* Right Section: Amount & Status */}
                        <div className="flex flex-col gap-3 xl:min-w-[180px]">
                          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white shadow-lg">
                            <p className="text-xs uppercase tracking-wider font-medium text-blue-100 mb-2">Amount</p>
                            <p className="text-3xl font-bold">
                              Rs. {payment.amount.toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex justify-end">
                            {getStatusBadge(payment.status)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}