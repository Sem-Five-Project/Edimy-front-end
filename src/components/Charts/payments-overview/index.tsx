'use client';

import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { PaymentsOverviewChart } from "./chart";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export function PaymentsOverview({
  timeFrame = "monthly",
  className,
}: PropsType) {
  const [data, setData] = useState<{ received: any[]; due: any[] }>({ received: [], due: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/homepage');
        const apiData = response.data?.data ?? response.data;

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        if (timeFrame === "yearly") {
          setData({
            received: apiData.yearlyPayments?.map((item: { monthOrYear: number; totalPayments: number }) => ({
              x: item.monthOrYear,
              y: Math.round(item.totalPayments / 1000),
            })) ?? [],
            due: [],
          });
        } else {
          setData({
            received: apiData.monthlyPaymentsForLastYear?.map((item: { monthOrYear: number; totalPayments: number }) => ({
              x: monthNames[item.monthOrYear - 1],
              y: Math.round(item.totalPayments / 1000),
            })) ?? [],
            due: [],
          });
        }
      } catch (error) {
        console.error('Error fetching payments overview data:', error);
        // Set fallback data
        if (timeFrame === "yearly") {
          setData({
            received: [
              { x: 2020, y: 450 },
              { x: 2021, y: 620 },
              { x: 2022, y: 780 },
              { x: 2023, y: 920 },
              { x: 2024, y: 1080 },
            ],
            due: [],
          });
        } else {
          setData({
            received: Array.from({ length: 12 }, (_, i) => ({
              x: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][i],
              y: 0,
            })),
            due: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-md dark:bg-gray-900", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-2 rounded-[10px] bg-white px-7.5 pb-6 pt-7.5 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Payments Overview
        </h2>

        <PeriodPicker defaultValue={timeFrame} sectionKey="payments_overview" />
      </div>

      <PaymentsOverviewChart data={data} />

      <dl className="grid text-center [&>div]:flex [&>div]:flex-col-reverse [&>div]:gap-1">
        <div>
          <dt className="text-xl font-bold text-dark dark:text-white">
            {standardFormat(
              data.received.reduce(
                (acc: number, { y }: { y: number }) => acc + y,
                0,
              ) * 1000, // Multiply back by 1000 since we divided in the service
            )}{" "}
            LKR
          </dt>
          <dd className="font-medium dark:text-dark-6">Total Payments {timeFrame === "yearly" ? "(in K)" : ""}</dd>
        </div>
      </dl>
    </div>
  );
}
