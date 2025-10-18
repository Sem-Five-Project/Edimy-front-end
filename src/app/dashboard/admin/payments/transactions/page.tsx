"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAllPayments,
  type Payment,
} from "@/lib/adminPayments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Download,
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const ITEMS_PER_PAGE = 15;

export default function AllTransactionsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Filters - keeping for future backend implementation
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<string>("all");

  // Dialog states
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPaymentDetail, setShowPaymentDetail] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllPayments();
      if (response.success) {
        setPayments(response.payments);
        setTotalPayments(response.count);
      } else {
        setError("Failed to fetch payments");
      }
    } catch (err: any) {
      const errorMessage = 
        err?.response?.data?.message || 
        err?.message || 
        "Failed to fetch payment data. Please ensure the backend server is running.";
      setError(errorMessage);
      console.error("Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter payments based on search and filters
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      searchTerm === "" ||
      payment.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.orderId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.paymentStatus === statusFilter;

    const matchesType =
      paymentTypeFilter === "all" || 
      (payment.paymentType === paymentTypeFilter) ||
      (paymentTypeFilter === "all" && !payment.paymentType);

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadgeColor = (status: Payment['paymentStatus']) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "FAILED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "ROLLBACKED_PENDING_ADMIN":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPaymentTypeColor = (type: Payment['paymentType'] | null) => {
    if (!type) {
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
    switch (type) {
      case "CREDIT_CARD":
        return "bg-blue-100 text-blue-800";
      case "DEBIT_CARD":
        return "bg-purple-100 text-purple-800";
      case "PAYPAL":
        return "bg-indigo-100 text-indigo-800";
      case "CASH":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats from filtered payments
  const stats = {
    totalAmount: filteredPayments.reduce((sum, p) => sum + p.amount, 0),
    successAmount: filteredPayments
      .filter((p) => p.paymentStatus === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: filteredPayments
      .filter((p) => p.paymentStatus === "PENDING")
      .reduce((sum, p) => sum + p.amount, 0),
    refundedAmount: filteredPayments
      .filter((p) => p.paymentStatus === "REFUNDED")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  // Pagination for filtered payments
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);

  if (loading && payments.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">All Payments</h1>
          <p className="text-muted-foreground">
            Monitor and manage all payment transactions on the platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPayments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                  Error Loading Payment Data
                </h3>
                <p className="text-red-800 dark:text-red-200 mb-4">{error}</p>
                <Button 
                  onClick={fetchPayments} 
                  variant="outline" 
                  className="mt-4 border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Amount
                </p>
                <p className="text-2xl font-bold">
                  LKR {stats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Success
                </p>
                <p className="text-2xl font-bold">
                  LKR {stats.successAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold">
                  LKR {stats.pendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Refunded
                </p>
                <p className="text-2xl font-bold">
                  LKR {stats.refundedAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by Payment ID or Order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                  <SelectItem value="ROLLBACKED_PENDING_ADMIN">Rollback Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Payment Type</Label>
              <Select
                value={paymentTypeFilter}
                onValueChange={setPaymentTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="CASH">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Payments ({filteredPayments.length} total)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Payment ID</th>
                  <th className="text-left p-4">Order ID</th>
                  <th className="text-left p-4">Student ID</th>
                  <th className="text-left p-4">Tutor ID</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Payment Type</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((payment) => (
                    <tr
                      key={payment.paymentId}
                      className="border-b hover:bg-muted/50"
                    >
                      <td className="p-4">
                        <div className="font-mono text-sm">{payment.paymentId}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm">{payment.orderId}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm">{payment.studentId}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-sm">{payment.tutorId || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">LKR {payment.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.currency || 'LKR'}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getPaymentTypeColor(payment.paymentType)}>
                          {payment.paymentType ? payment.paymentType.replace("_", " ") : "N/A"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={getStatusBadgeColor(payment.paymentStatus)}>
                          {payment.paymentStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {payment.paymentTime
                            ? new Date(payment.paymentTime).toLocaleDateString()
                            : payment.createdAt
                            ? new Date(payment.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {payment.paymentTime
                            ? new Date(payment.paymentTime).toLocaleTimeString()
                            : payment.createdAt
                            ? new Date(payment.createdAt).toLocaleTimeString()
                            : ''}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="bg-background border border-border shadow-md"
                          >
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentDetail(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {payment.classId && (
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/admin/sessions/${payment.classId}`}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  View Class
                                </Link>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredPayments.length)} of{" "}
                {filteredPayments.length} payments
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Detail Dialog */}
      <Dialog
        open={showPaymentDetail}
        onOpenChange={setShowPaymentDetail}
      >
        <DialogContent className="max-w-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle>
              Payment Details - {selectedPayment?.paymentId}
            </DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Payment ID
                  </Label>
                  <p className="font-mono text-sm">{selectedPayment.paymentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Order ID
                  </Label>
                  <p className="font-mono text-sm">{selectedPayment.orderId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Student ID
                  </Label>
                  <p className="font-mono text-sm">{selectedPayment.studentId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Tutor ID
                  </Label>
                  <p className="font-mono text-sm">{selectedPayment.tutorId || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Amount
                  </Label>
                  <p className="font-bold text-lg">
                    LKR {selectedPayment.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayment.currency || 'LKR'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </Label>
                  <p className="font-medium">{selectedPayment.paymentMethod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Status
                  </Label>
                  <Badge className={getStatusBadgeColor(selectedPayment.paymentStatus)}>
                    {selectedPayment.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Payment Type
                  </Label>
                  <Badge className={getPaymentTypeColor(selectedPayment.paymentType)}>
                    {selectedPayment.paymentType ? selectedPayment.paymentType.replace("_", " ") : "N/A"}
                  </Badge>
                </div>
              </div>

              {selectedPayment.cardHolderName && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Card Holder Name
                  </Label>
                  <p className="font-medium">{selectedPayment.cardHolderName}</p>
                </div>
              )}

              {selectedPayment.classId && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Class ID
                  </Label>
                  <Link
                    href={`/dashboard/admin/sessions/${selectedPayment.classId}`}
                    className="text-blue-600 hover:underline font-mono text-sm"
                  >
                    {selectedPayment.classId}
                  </Link>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedPayment.createdAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Created At
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedPayment.createdAt).toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedPayment.paymentTime && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Payment Time
                    </Label>
                    <p className="text-sm">
                      {new Date(selectedPayment.paymentTime).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {selectedPayment.completedAt && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Completed At
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedPayment.completedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {selectedPayment.payherePaymentId && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    PayHere Payment ID
                  </Label>
                  <p className="font-mono text-sm">{selectedPayment.payherePaymentId}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDetail(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
