"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  CreditCard, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ArrowLeft,
  Calendar
} from "lucide-react"
import Link from "next/link"

interface Payment {
  id: string
  date: string
  tutorName: string
  subject: string
  amount: number
  status: "completed" | "pending" | "failed"
  paymentMethod: string
  transactionId: string
}

export default function PaymentHistoryPage() {
  const [timeFilter, setTimeFilter] = useState<string>("all")

  const payments: Payment[] = [
    {
      id: "1",
      date: "2024-01-15",
      tutorName: "Dr. Sarah Johnson",
      subject: "Advanced Mathematics",
      amount: 2500,
      status: "completed",
      paymentMethod: "Credit Card",
      transactionId: "TXN001234567"
    },
    {
      id: "2",
      date: "2024-01-10",
      tutorName: "Prof. Michael Chen",
      subject: "Physics",
      amount: 3000,
      status: "completed",
      paymentMethod: "PayPal",
      transactionId: "TXN001234568"
    },
    {
      id: "3",
      date: "2024-01-05",
      tutorName: "Ms. Emily Davis",
      subject: "Chemistry",
      amount: 2000,
      status: "pending",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN001234569"
    },
    {
      id: "4",
      date: "2023-12-20",
      tutorName: "Dr. James Wilson",
      subject: "Biology",
      amount: 2800,
      status: "completed",
      paymentMethod: "Credit Card",
      transactionId: "TXN001234570"
    },
    {
      id: "5",
      date: "2023-08-15",
      tutorName: "Prof. Lisa Anderson",
      subject: "English Literature",
      amount: 2200,
      status: "completed",
      paymentMethod: "PayPal",
      transactionId: "TXN001234571"
    },
    {
      id: "6",
      date: "2023-02-10",
      tutorName: "Dr. Robert Brown",
      subject: "History",
      amount: 1800,
      status: "completed",
      paymentMethod: "Bank Transfer",
      transactionId: "TXN001234572"
    },
  ]

  const filterPaymentsByTime = (payments: Payment[]) => {
    const now = new Date()
    const currentDate = now.getTime()

    switch (timeFilter) {
      case "lastMonth": {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).getTime()
        return payments.filter(p => new Date(p.date).getTime() >= lastMonth)
      }
      case "last6Months": {
        const last6Months = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()).getTime()
        return payments.filter(p => new Date(p.date).getTime() >= last6Months)
      }
      case "lastYear": {
        const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).getTime()
        return payments.filter(p => new Date(p.date).getTime() >= lastYear)
      }
      case "all":
      default:
        return payments
    }
  }

  const filteredPayments = filterPaymentsByTime(payments)

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
    }
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
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Payment History</h1>
          <p className="text-slate-600">Track all your transactions and billing details</p>
        </div>

        {/* Payments Table Card */}
        <Card className="border-blue-200 bg-white shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-br from-blue-500 to-blue-600 border-b border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-white text-2xl flex items-center gap-2 mb-1">
                  <CreditCard className="h-6 w-6" />
                  Transaction History
                </CardTitle>
                <CardDescription className="text-blue-100">
                  View and download your payment receipts
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-100" />
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-48 bg-white/90 border-blue-200 hover:bg-white focus:border-blue-300 focus:ring-blue-300">
                    <SelectValue placeholder="Select time period" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-blue-200">
                    <SelectItem value="all" className="hover:bg-blue-50">All Time</SelectItem>
                    <SelectItem value="lastMonth" className="hover:bg-blue-50">Last Month</SelectItem>
                    <SelectItem value="last6Months" className="hover:bg-blue-50">Last 6 Months</SelectItem>
                    <SelectItem value="lastYear" className="hover:bg-blue-50">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-100 border-b border-slate-200">
                    <TableHead className="font-bold text-slate-900 text-base">Date</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Tutor</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Subject</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Amount</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Method</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Status</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Transaction ID</TableHead>
                    <TableHead className="font-bold text-slate-900 text-base">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.length > 0 ? (
                    filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-blue-50 transition-colors border-b border-slate-100">
                        <TableCell className="font-medium text-slate-900">
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-slate-700 font-medium">{payment.tutorName}</TableCell>
                        <TableCell className="text-slate-700">{payment.subject}</TableCell>
                        <TableCell className="font-bold text-green-600 text-base">
                          Rs. {payment.amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-slate-700">{payment.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-slate-600 text-sm font-mono">
                          {payment.transactionId}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Receipt
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <CreditCard className="h-12 w-12 text-slate-400" />
                          <p className="text-slate-600 text-lg font-medium">No payments found</p>
                          <p className="text-slate-500 text-sm">Try selecting a different time period</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}