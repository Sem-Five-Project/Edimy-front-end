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

export const getChatsData = async () => {
  try {
    const serverApi = await createServerApi();
    const response = await serverApi.get('/admin/chats');
    const data = response.data?.data ?? response.data;
    
    // If backend returns an array, use it directly
    if (Array.isArray(data)) return data;
    
    // Otherwise try to extract chats property
    return data?.chats ?? data;
  } catch (error) {
    console.error('Error fetching chats via api:', error);
    
    // Fake delay (preserve original UX expectation)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Fallback mocked chats
    return [
      {
        name: 'Jacob Jones',
        profile: '/images/user/user-01.png',
        isActive: true,
        lastMessage: {
          content: 'See you tomorrow at the meeting!',
          type: 'text',
          timestamp: '2024-12-19T14:30:00Z',
          isRead: false,
        },
        unreadCount: 3,
      },
      {
        name: 'Wilium Smith',
        profile: '/images/user/user-03.png',
        isActive: true,
        lastMessage: {
          content: 'Thanks for the update',
          type: 'text',
          timestamp: '2024-12-19T10:15:00Z',
          isRead: true,
        },
        unreadCount: 0,
      },
      {
        name: 'Johurul Haque',
        profile: '/images/user/user-04.png',
        isActive: false,
        lastMessage: {
          content: "What's up?",
          type: 'text',
          timestamp: '2024-12-19T10:15:00Z',
          isRead: true,
        },
        unreadCount: 0,
      },
      {
        name: 'M. Chowdhury',
        profile: '/images/user/user-05.png',
        isActive: false,
        lastMessage: {
          content: 'Where are you now?',
          type: 'text',
          timestamp: '2024-12-19T10:15:00Z',
          isRead: true,
        },
        unreadCount: 2,
      },
      {
        name: 'Akagami',
        profile: '/images/user/user-07.png',
        isActive: false,
        lastMessage: {
          content: 'Hey, how are you?',
          type: 'text',
          timestamp: '2024-12-19T10:15:00Z',
          isRead: true,
        },
        unreadCount: 0,
      },
    ];
  }
};

