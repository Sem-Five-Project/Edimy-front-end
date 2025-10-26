"use client";
import { useAuth } from "@/contexts/AuthContext";
import React, { use, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Award, Star, TrendingUp } from "lucide-react";
import { Subject, TutorSubject } from "@/types";
import {
  ratingAPI
} from "@/lib/api";

interface AnalyticsSectionProps {
  subjects: TutorSubject[];
}

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type DataPoint = { x: string | number; y: number };

interface PaymentsOverview {
  totalReceived: number; // in smallest currency unit or full (we'll treat as full for display)
  monthlySeries: DataPoint[];
  currency?: string;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ subjects }) => {
  const {user} = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  // Payments state (client-side fallback/mock). In future this can be passed as a prop or fetched
  const [payments, setPayments] = useState<PaymentsOverview | null>(null);
  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');

  const [totalPaidSessions, setTotalPaidSessions] = useState<number[]>([]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewSubject("");
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setNewSubject(e.target.value);
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    handleCloseModal();
  };

  useEffect(() => {
    // fetch payments analytics
    const fetchAnalytics = async () => {
      const tutorId = Number(user?.tutorId ?? 0);
      if (!tutorId) return;
      try {
        const res = await ratingAPI.getTutorEarningsAnalytics(tutorId);
        const payload = (res as any).data ?? (res as any).payload ?? (res as any);
        const monthlyPayment = (payload.monthlyEarnings) as DataPoint[];
        const total = payload.totalEarnings ?? monthlyPayment.reduce((sum, p) => sum + (p.y || 0), 0);
        setPayments({ totalReceived: total, monthlySeries: monthlyPayment, currency: payload.currency ?? 'LKR' });
        console.log('Fetched payments analytic***********:', { totalReceived: total, monthlySeries: monthlyPayment, currency: payload.currency ?? 'LKR' });
      } catch (err) {
        // failed to load analytics — fallback to zeros
        setPayments({ totalReceived: 0, monthlySeries: monthNames.map((m) => ({ x: m, y: 0 })), currency: 'LKR' });
      }
    };

    fetchAnalytics();
  }, [user?.tutorId]);

  // helpers
  const formatCurrency = (value: number, currency = 'LKR') => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
    } catch (e) {
      return `${currency} ${value}`;
    }
  };

  // Chart configuration: provide explicit categories and numeric series so ApexCharts renders all months
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const chartOptions: any = payments
    ? {
        chart: {
          id: 'payments-chart',
          toolbar: { show: false },
          zoom: { enabled: false },
          animations: { enabled: true },
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.05 } },
        xaxis: {
          type: 'category',
          categories: timeframe === 'monthly' ? monthNames : monthNames.map((_, i) => String(new Date().getFullYear() - (11 - i))),
          labels: { rotate: 0, hideOverlappingLabels: false, trim: false },
        },
        yaxis: { labels: { formatter: (val: number) => `${val}` } },
        tooltip: { y: { formatter: (val: number) => formatCurrency(val, payments.currency) } },
        colors: ['#7c3aed'],
        markers: { size: 4 },
      }
    : {};

  const chartSeries: any = payments
    ? [
        {
          name: 'Received',
          data: timeframe === 'monthly' ? payments.monthlySeries.map((d) => d.y) : payments.monthlySeries.map((d) => d.y * 12),
        },
      ]
    : [];

  


  useEffect(() => {
    const fetchPaidSessions = async () => {
      const tutorId = Number(user?.tutorId ?? 0);
      if (!tutorId) {
        setTotalPaidSessions([]);
        return;
      }
      try {
        const res = await ratingAPI.getTutorTotalPaidSessions(tutorId);  
        console.log('Fetched total paid sessions******:', res);      
        setTotalPaidSessions(res.totalPaidSessions ?? []);
      } catch (err) {
        setTotalPaidSessions([]);
      }
    };
    fetchPaidSessions();
  }, [user?.tutorId]);

  const totalSessions = totalPaidSessions.reduce((a, b) => a + b, 0);

  const sessionsChartOptions: any = {
    chart: { id: 'sessions-chart', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 8, columnWidth: '55%' } },
    dataLabels: { enabled: false },
    xaxis: { categories: monthNames, labels: { rotate: 0 } },
    yaxis: { title: { text: 'Sessions' } },
    colors: ['#0ea5e9'],
  };

  const sessionsChartSeries = [{ name: 'Paid sessions', data: totalPaidSessions }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="mr-3 text-purple-600" size={24} />
            Teaching Subjects
          </h2>
          <button
            className="mb-2 bg-purple-600 text-white rounded-md px-4 py-2 hover:bg-purple-700 transition"
            onClick={handleOpenModal}
          >
            Add Subject
          </button>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-gray-200 relative">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-purple-700">
                      Add New Subject
                    </h2>
                    <button
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                      onClick={handleCloseModal}
                      aria-label="Close"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x text-gray-400"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                  <form onSubmit={handleAddSubject}>
                    <input
                      type="text"
                      value={newSubject}
                      onChange={handleInputChange}
                      placeholder="Enter subject name"
                      className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition"
                      >
                        Add
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {subjects.length > 0 ? (
            <div className="space-y-3">
              {subjects.map((subject, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-200 border-l-4 border-purple-500"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                        {subject.subjectName ?? subject}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {(subject.subjectName ?? subject).charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No subjects assigned yet</p>
            </div>
          )}
        </div>
      </div>
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-1 flex items-center">
                  <TrendingUp className="mr-3 text-green-600" size={20} />
                  Payments Received
                </h2>
                <p className="text-sm text-gray-500">Overview of payments received by you</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setTimeframe('monthly')}
                  className={`px-3 py-1 rounded-full text-sm ${timeframe === 'monthly' ? 'bg-gray-100' : 'bg-transparent'}`}
                >
                  Monthly
                </button>
                {/* <button
                  onClick={() => setTimeframe('yearly')}
                  className={`px-3 py-1 rounded-full text-sm ${timeframe === 'yearly' ? 'bg-gray-100' : 'bg-transparent'}`}
                >
                  Yearly
                </button> */}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 h-full">
                  <p className="text-sm text-gray-500">Total received</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2">{payments ? formatCurrency(payments.totalReceived, payments.currency) : '—'}</h3>
                  <p className="text-sm text-green-600 mt-1 flex items-center"><Star className="mr-2" size={14}/> {payments ? `${Math.round((payments.totalReceived / 12) * 100) / 100} avg / mo` : ''}</p>
                  <div className="mt-4 text-xs text-gray-500 space-y-2">
                    {/* <div className="flex justify-between">
                      <span>Sessions paid</span>
                      <span className="font-semibold">{Math.round((payments?.totalReceived ?? 0) / 50)}</span>
                    </div> */}
                    {/* <div className="flex justify-between">
                      <span>Pending payouts</span>
                      <span className="font-semibold">{formatCurrency(Math.round((payments?.totalReceived ?? 0) * 0.1), payments?.currency)}</span>
                    </div> */}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="rounded-xl p-2">
                  {payments ? (
                    <Chart options={chartOptions} series={chartSeries} type="area" height={260} />
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
                  )}
                </div>
              </div>
            </div>
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total paid sessions (year)</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-2">{totalSessions}</h3>
                    {/* <p className="text-xs text-gray-500 mt-2">This is the sum of sessions marked as paid across the 12 months (mock data).</p> */}
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Paid sessions by month</h4>
                    <Chart options={sessionsChartOptions} series={sessionsChartSeries} type="bar" height={220} />
                  </div>
                </div>
              </div>
          </div>
        </div>
    </div>
  );
};

export default AnalyticsSection;
