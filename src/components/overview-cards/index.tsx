'use client';

import { compactFormat } from "@/lib/format-number";
import { OverviewCard } from "./card";
import * as icons from "./icons";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type OverviewData = {
  views: { value: number; growthRate: number };
  profit: { value: number; growthRate: number };
  products: { value: number; growthRate: number };
  users: { value: number; growthRate: number };
};

export function OverviewCardsGroup() {
  const [data, setData] = useState<OverviewData>({
    views: { value: 0, growthRate: 0 },
    profit: { value: 0, growthRate: 0 },
    products: { value: 0, growthRate: 0 },
    users: { value: 0, growthRate: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/admin/homepage');
        const apiData = response.data?.data ?? response.data;

        setData({
          views: {
            value: apiData?.totalSessions ?? 0,
            growthRate: apiData?.sessionGainPercentage ?? 0,
          },
          profit: {
            value: apiData?.totalProfit ?? 0,
            growthRate: apiData?.sessionProfitGainPercentage ?? 0,
          },
          products: {
            value: apiData?.totalSubjects ?? 0,
            growthRate: apiData?.subjectGainPercentage ?? 0,
          },
          users: {
            value: apiData?.totalUsers ?? 0,
            growthRate: apiData?.userGainPercentage ?? 0,
          },
        });
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <OverviewCard
        label="Total Sessions"
        data={{
          value: compactFormat(data.views.value),
          growthRate: data.views.growthRate,
        }}
        Icon={icons.Sessions}
      />

      <OverviewCard
        label="Total Profit"
        data={{
          value: compactFormat(data.profit.value) + " LKR",
          growthRate: data.profit.growthRate,
        }}
        Icon={icons.Profit}
      />

      <OverviewCard
        label="Total Subjects"
        data={{
          value: compactFormat(data.products.value),
          growthRate: data.products.growthRate,
        }}
        Icon={icons.Subjects}
      />

      <OverviewCard
        label="Total Users"
        data={{
          value: compactFormat(data.users.value),
          growthRate: data.users.growthRate,
        }}
        Icon={icons.Users}
      />
    </div>
  );
}
