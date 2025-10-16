export async function getOverviewData() {
  try {
    // Server-side API call - first try to get a fresh access token from refresh token cookie
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api";
    
    // Get cookies from the request headers
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');
    
    // Try to refresh the access token first using the refresh token cookie
    let accessToken = null;
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { 'Cookie': cookieHeader }),
        },
        credentials: 'include',
      });
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        accessToken = refreshData.accessToken;
      }
    } catch (refreshError) {
      console.error('Failed to refresh token on server:', refreshError);
    }
    
    // Now fetch the homepage data with the access token
    const response = await fetch(`${API_BASE_URL}/admin/homepage`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { 'Cookie': cookieHeader }),
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch homepage data: ${response.status}`);
    }

    const data = await response.json();

    return {
      views: {
        value: data.totalSessions,
        growthRate: data.sessionGainPercentage,
      },
      profit: {
        value: data.totalProfit,
        growthRate: data.sessionProfitGainPercentage,
      },
      products: {
        value: data.totalSubjects,
        growthRate: data.subjectGainPercentage,
      },
      users: {
        value: data.totalUsers,
        growthRate: data.userGainPercentage,
      },
    };
  } catch (error) {
    console.error('Error fetching overview data:', error);
    // Return fallback data if API call fails
    return {
      views: {
        value: 0,
        growthRate: 0,
      },
      profit: {
        value: 0,
        growthRate: 0,
      },
      products: {
        value: 0,
        growthRate: 0,
      },
      users: {
        value: 0,
        growthRate: 0,
      },
    };
  }
}

export async function getChatsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: "Jacob Jones",
      profile: "/images/user/user-01.png",
      isActive: true,
      lastMessage: {
        content: "See you tomorrow at the meeting!",
        type: "text",
        timestamp: "2024-12-19T14:30:00Z",
        isRead: false,
      },
      unreadCount: 3,
    },
    {
      name: "Wilium Smith",
      profile: "/images/user/user-03.png",
      isActive: true,
      lastMessage: {
        content: "Thanks for the update",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "Johurul Haque",
      profile: "/images/user/user-04.png",
      isActive: false,
      lastMessage: {
        content: "What's up?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "M. Chowdhury",
      profile: "/images/user/user-05.png",
      isActive: false,
      lastMessage: {
        content: "Where are you now?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 2,
    },
    {
      name: "Akagami",
      profile: "/images/user/user-07.png",
      isActive: false,
      lastMessage: {
        content: "Hey, how are you?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
  ];
}
