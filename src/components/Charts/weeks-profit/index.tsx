'use client';

import { PeriodPicker } from "@/components/period-picker";
import { cn } from "@/lib/utils";
import { WeeksProfitChart } from "./chart";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type PropsType = {
  timeFrame?: string;
  className?: string;
};

export function WeeksProfit({ className, timeFrame }: PropsType) {
  const [data, setData] = useState<{ completed: any[]; upcoming: any[] }>({ completed: [], upcoming: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/homepage');
        const apiData = response.data?.data ?? response.data;

        const sessionsData = timeFrame === "last week" ? apiData.sessionsLastWeek : apiData.sessionsThisWeek;

        setData({
          completed: sessionsData?.map((item: { day: string; completedSessionCount: number }) => ({
            x: item.day,
            y: item.completedSessionCount,
          })) ?? [],
          upcoming: sessionsData?.map((item: { day: string; cancelledSessionCount: number }) => ({
            x: item.day,
            y: item.cancelledSessionCount,
          })) ?? [],
        });
      } catch (error) {
        console.error('Error fetching weeks profit data:', error);
        // Fallback data
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        setData({
          completed: days.map(day => ({ x: day, y: 0 })),
          upcoming: days.map(day => ({ x: day, y: 0 })),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeFrame]);

  if (loading) {
    return (
      <div className={cn("rounded-[10px] bg-white px-7.5 pt-7.5 shadow-md dark:bg-gray-900", className)}>
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
        "rounded-[10px] bg-white px-7.5 pt-7.5 shadow-md hover:shadow-lg transition-shadow dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Weekly Sessions Overview
        </h2>

        <PeriodPicker
          items={["this week", "last week"]}
          defaultValue={timeFrame || "this week"}
          sectionKey="weeks_profit"
        />
      </div>

      <WeeksProfitChart data={data} />
    </div>
  );
}
