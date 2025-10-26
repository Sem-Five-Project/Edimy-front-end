import createServerApi from "@/lib/server-api";

export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      name: "Desktop",
      percentage: 0.65,
      amount: 1625,
    },
    {
      name: "Tablet",
      percentage: 0.1,
      amount: 250,
    },
    {
      name: "Mobile",
      percentage: 0.2,
      amount: 500,
    },
    {
      name: "Unknown",
      percentage: 0.05,
      amount: 125,
    },
  ];

  if (timeFrame === "yearly") {
    data[0].amount = 19500;
    data[1].amount = 3000;
    data[2].amount = 6000;
    data[3].amount = 1500;
  }

  return data;
}

export async function getPaymentsOverviewData(
  timeFrame?: "monthly" | "yearly" | (string & {}),
) {
  try {
    const serverApi = await createServerApi();
    const response = await serverApi.get('/admin/homepage');
    const data = response.data?.data ?? response.data;

    // Map month numbers to month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Transform data based on timeFrame
    if (timeFrame === "yearly") {
      // Use yearlyPayments for yearly view
      return {
        received: data.yearlyPayments.map((item: { monthOrYear: number; totalPayments: number }) => ({
          x: item.monthOrYear,
          y: Math.round(item.totalPayments / 1000), // Convert to thousands for better display
        })),
        due: [], // No due data in the API response, empty array
      };
    }

    // Use monthlyPaymentsForLastYear for monthly view (default)
    return {
      received: data.monthlyPaymentsForLastYear.map((item: { monthOrYear: number; totalPayments: number }) => ({
        x: monthNames[item.monthOrYear - 1],
        y: Math.round(item.totalPayments / 1000), // Convert to thousands for better display
      })),
      due: [], // No due data in the API response, empty array
    };
  } catch (error) {
    console.error("Error fetching payments overview data:", error);

    // Fallback to mock data in case of error (optional)
    if (timeFrame === "yearly") {
      return {
        received: [
          { x: 2020, y: 450 },
          { x: 2021, y: 620 },
          { x: 2022, y: 780 },
          { x: 2023, y: 920 },
          { x: 2024, y: 1080 },
        ],
        due: [],
      };
    }

    return {
      received: [
        { x: "Jan", y: 0 },
        { x: "Feb", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Apr", y: 0 },
        { x: "May", y: 0 },
        { x: "Jun", y: 0 },
        { x: "Jul", y: 0 },
        { x: "Aug", y: 0 },
        { x: "Sep", y: 0 },
        { x: "Oct", y: 0 },
        { x: "Nov", y: 0 },
        { x: "Dec", y: 0 },
      ],
      due: [],
    };
  }
}

export async function getWeeksProfitData(timeFrame?: string) {
  try {
    const serverApi = await createServerApi();
    const response = await serverApi.get('/admin/homepage');
    const data = response.data?.data ?? response.data;

    // Use sessionsThisWeek or sessionsLastWeek based on timeFrame
    const sessionsData = timeFrame === "last week" ? data.sessionsLastWeek : data.sessionsThisWeek;

    return {
      completed: sessionsData.map((item: { day: string; completedSessionCount: number; cancelledSessionCount: number }) => ({
        x: item.day,
        y: item.completedSessionCount,
      })),
      upcoming: sessionsData.map((item: { day: string; completedSessionCount: number; cancelledSessionCount: number }) => ({
        x: item.day,
        y: item.cancelledSessionCount,
      })),
    };
  } catch (error) {
    console.error("Error fetching weeks profit data:", error);

    // Fallback to mock data in case of error
    if (timeFrame === "last week") {
      return {
        completed: [
          { x: "Mon", y: 0 },
          { x: "Tue", y: 0 },
          { x: "Wed", y: 0 },
          { x: "Thu", y: 0 },
          { x: "Fri", y: 0 },
          { x: "Sat", y: 0 },
          { x: "Sun", y: 0 },
        ],
        upcoming: [
          { x: "Mon", y: 0 },
          { x: "Tue", y: 0 },
          { x: "Wed", y: 0 },
          { x: "Thu", y: 0 },
          { x: "Fri", y: 0 },
          { x: "Sat", y: 0 },
          { x: "Sun", y: 0 },
        ],
      };
    }

    return {
      completed: [
        { x: "Mon", y: 0 },
        { x: "Tue", y: 0 },
        { x: "Wed", y: 0 },
        { x: "Thu", y: 0 },
        { x: "Fri", y: 0 },
        { x: "Sat", y: 0 },
        { x: "Sun", y: 0 },
      ],
      upcoming: [
        { x: "Mon", y: 0 },
        { x: "Tue", y: 0 },
        { x: "Wed", y: 0 },
        { x: "Thu", y: 0 },
        { x: "Fri", y: 0 },
        { x: "Sat", y: 0 },
        { x: "Sun", y: 0 },
      ],
    };
  }
}

export async function getCampaignVisitorsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_visitors: 784_000,
    performance: -1.5,
    chart: [
      { x: "S", y: 168 },
      { x: "S", y: 385 },
      { x: "M", y: 201 },
      { x: "T", y: 298 },
      { x: "W", y: 187 },
      { x: "T", y: 195 },
      { x: "F", y: 291 },
    ],
  };
}

export async function getVisitorsAnalyticsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212, 270,
    190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312,
  ].map((value, index) => ({ x: index + 1 + "", y: value }));
}


