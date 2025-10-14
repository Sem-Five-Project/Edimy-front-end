"use client";

import { useState, useEffect } from "react";
import {
  getFinancialReports,
  getTransactions,
  getPayouts,
  type FinancialReport,
  type TransactionFilters,
  type PayoutFilters,
} from "@/lib/paymentsData";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp as TrendIcon,
  FileText,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
];

export default function FinancialReportsPage() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [selectedReport, setSelectedReport] =
    useState<string>("revenue_overview");
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [tutorPerformanceData, setTutorPerformanceData] = useState<any[]>([]);
  const [commissionData, setCommissionData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    fetchReports();
    fetchChartData();
  }, [selectedPeriod]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await getFinancialReports(selectedPeriod);
      setReports(response);
    } catch (error) {
      console.error("Error fetching financial reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      // Generate mock chart data based on transactions and payouts
      const transactionsData = await getTransactions({
        page: 1,
        limit: 1000,
        dateFrom: getDateFromPeriod(selectedPeriod),
        dateTo: new Date().toISOString().split("T")[0],
      } as TransactionFilters);

      const payoutsData = await getPayouts({
        page: 1,
        limit: 1000,
        dateFrom: getDateFromPeriod(selectedPeriod),
        dateTo: new Date().toISOString().split("T")[0],
      } as PayoutFilters);

      // Generate revenue trend data
      const revenueByDate = generateRevenueByDate(
        transactionsData.transactions,
        selectedPeriod,
      );
      setRevenueData(revenueByDate);

      // Generate payment method breakdown
      const paymentMethods = generatePaymentMethodData(
        transactionsData.transactions,
      );
      setPaymentMethodData(paymentMethods);

      // Generate tutor performance data
      const tutorPerformance = generateTutorPerformanceData(
        payoutsData.payouts,
      );
      setTutorPerformanceData(tutorPerformance);

      // Generate commission data
      const commissions = generateCommissionData(transactionsData.transactions);
      setCommissionData(commissions);

      // Generate growth data
      const growth = generateGrowthData(
        transactionsData.transactions,
        selectedPeriod,
      );
      setGrowthData(growth);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  const getDateFromPeriod = (period: string): string => {
    const now = new Date();
    switch (period) {
      case "7d":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      case "30d":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      case "90d":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      case "1y":
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
    }
  };

  const generateRevenueByDate = (transactions: any[], period: string) => {
    const days =
      period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const dayTransactions = transactions.filter(
        (t) => t.transactionDate.startsWith(dateStr) && t.status === "Paid",
      );

      const revenue = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const commission = revenue * 0.15; // 15% commission

      result.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        revenue: Math.round(revenue),
        commission: Math.round(commission),
        transactions: dayTransactions.length,
      });
    }

    return result;
  };

  const generatePaymentMethodData = (transactions: any[]) => {
    const methods = transactions.reduce(
      (acc, t) => {
        if (t.status === "Paid") {
          acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalAmount = Object.values(methods).reduce(
      (sum: number, amount) => sum + (amount as number),
      0,
    );

    return Object.entries(methods).map(([method, amount]) => ({
      name: method,
      value: Math.round(amount as number),
      percentage: Math.round(((amount as number) / totalAmount) * 100),
    }));
  };

  const generateTutorPerformanceData = (payouts: any[]) => {
    const tutorStats = payouts.reduce(
      (acc, p) => {
        const tutorName = p.tutor.name;
        if (!acc[tutorName]) {
          acc[tutorName] = { earnings: 0, sessions: 0 };
        }
        acc[tutorName].earnings += p.amount;
        acc[tutorName].sessions += 1;
        return acc;
      },
      {} as Record<string, { earnings: number; sessions: number }>,
    );

    return Object.entries(tutorStats)
      .map(([name, stats]) => ({
        tutor: name,
        earnings: Math.round(
          (stats as { earnings: number; sessions: number }).earnings,
        ),
        sessions: (stats as { earnings: number; sessions: number }).sessions,
        avgPerSession: Math.round(
          (stats as { earnings: number; sessions: number }).earnings /
            (stats as { earnings: number; sessions: number }).sessions,
        ),
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);
  };

  const generateCommissionData = (transactions: any[]) => {
    const monthlyCommissions = transactions
      .filter((t) => t.status === "Paid")
      .reduce(
        (acc, t) => {
          const month = new Date(t.transactionDate).toLocaleDateString(
            "en-US",
            { month: "short" },
          );
          acc[month] = (acc[month] || 0) + t.amount * 0.15;
          return acc;
        },
        {} as Record<string, number>,
      );

    return Object.entries(monthlyCommissions).map(([month, commission]) => ({
      month,
      commission: Math.round(commission as number),
    }));
  };

  const generateGrowthData = (transactions: any[], period: string) => {
    const paidTransactions = transactions.filter((t) => t.status === "Paid");
    const currentTotal = paidTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Simulate previous period data for growth calculation
    const previousTotal = currentTotal * (0.8 + Math.random() * 0.4);
    const growth = ((currentTotal - previousTotal) / previousTotal) * 100;

    return [
      {
        period: selectedPeriod,
        current: Math.round(currentTotal),
        previous: Math.round(previousTotal),
        growth: Math.round(growth * 100) / 100,
      },
    ];
  };

  const getCurrentReport = () => {
    return reports.find((r) => r.type === selectedReport) || reports[0];
  };

  const handleExportReport = async () => {
    // Simulate report export
    const reportData = {
      period: selectedPeriod,
      report: selectedReport,
      data: getCurrentReport(),
      charts: {
        revenue: revenueData,
        paymentMethods: paymentMethodData,
        tutorPerformance: tutorPerformanceData,
      },
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial_report_${selectedReport}_${selectedPeriod}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  const currentReport = getCurrentReport();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-muted-foreground">
            Generate and view detailed financial reports and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedPeriod}
            onValueChange={(value) => setSelectedPeriod(value as any)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchReports} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {currentReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold">
                    ${currentReport.metrics.totalRevenue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {currentReport.metrics.revenueGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${currentReport.metrics.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(currentReport.metrics.revenueGrowth)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Commission Earned
                  </p>
                  <p className="text-2xl font-bold">
                    ${currentReport.metrics.commissionEarned.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {currentReport.metrics.commissionGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${currentReport.metrics.commissionGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(currentReport.metrics.commissionGrowth)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Transactions
                  </p>
                  <p className="text-2xl font-bold">
                    {currentReport.metrics.totalTransactions.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {currentReport.metrics.transactionGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${currentReport.metrics.transactionGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(currentReport.metrics.transactionGrowth)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Average Order Value
                  </p>
                  <p className="text-2xl font-bold">
                    ${currentReport.metrics.averageOrderValue.toLocaleString()}
                  </p>
                  <div className="flex items-center mt-1">
                    {currentReport.metrics.aovGrowth >= 0 ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm ${currentReport.metrics.aovGrowth >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {Math.abs(currentReport.metrics.aovGrowth)}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Report Tabs */}
      <Tabs value={selectedReport} onValueChange={setSelectedReport}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue_overview">Revenue Overview</TabsTrigger>
          <TabsTrigger value="commission_analysis">
            Commission Analysis
          </TabsTrigger>
          <TabsTrigger value="tutor_performance">Tutor Performance</TabsTrigger>
          <TabsTrigger value="payment_insights">Payment Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue_overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Area
                      type="monotone"
                      dataKey="commission"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) =>
                        `${name} (${percentage}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentReport?.breakdown.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium">{item.category}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${item.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.percentage}% of total
                      </p>
                      <Progress value={item.percentage} className="w-24 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commission_analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendIcon className="w-5 h-5" />
                Commission Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={commissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tutor_performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Top Performing Tutors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={tutorPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="tutor"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="earnings" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tutor Performance Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4">Tutor</th>
                      <th className="text-left p-4">Total Earnings</th>
                      <th className="text-left p-4">Sessions</th>
                      <th className="text-left p-4">Avg per Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tutorPerformanceData.map((tutor, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-4 font-medium">{tutor.tutor}</td>
                        <td className="p-4">
                          ${tutor.earnings.toLocaleString()}
                        </td>
                        <td className="p-4">{tutor.sessions}</td>
                        <td className="p-4">
                          ${tutor.avgPerSession.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment_insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethodData.map((method, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="font-medium">{method.name}</span>
                      <div className="flex items-center gap-2">
                        <span>${method.value.toLocaleString()}</span>
                        <Badge variant="secondary">{method.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {growthData.map((data, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Revenue Growth</span>
                      <div className="flex items-center gap-2">
                        {data.growth >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-600" />
                        )}
                        <span
                          className={
                            data.growth >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          {Math.abs(data.growth)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current: ${data.current.toLocaleString()} | Previous: $
                      {data.previous.toLocaleString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
