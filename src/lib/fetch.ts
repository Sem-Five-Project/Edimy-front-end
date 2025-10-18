import createServerApi from "./server-api";

export const getOverviewData = async () => {
  try {
    const serverApi = await createServerApi();
    const response = await serverApi.get('/admin/homepage');
    const data = response.data?.data ?? response.data;

    return {
      views: {
        value: data?.totalSessions ?? 0,
        growthRate: data?.sessionGainPercentage ?? 0,
      },
      profit: {
        value: data?.totalProfit ?? 0,
        growthRate: data?.sessionProfitGainPercentage ?? 0,
      },
      products: {
        value: data?.totalSubjects ?? 0,
        growthRate: data?.subjectGainPercentage ?? 0,
      },
      users: {
        value: data?.totalUsers ?? 0,
        growthRate: data?.userGainPercentage ?? 0,
      },
    };
  } catch (error) {
    console.error('Error fetching overview data via api:', error);
    // Fallback data
    return {
      views: { value: 0, growthRate: 0 },
      profit: { value: 0, growthRate: 0 },
      products: { value: 0, growthRate: 0 },
      users: { value: 0, growthRate: 0 },
    };
  }
};

