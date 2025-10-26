import api from "./api";

/**
 * Client-side admin API calls that use the authenticated api instance
 * These should be used in Client Components or API routes
 */

export const adminAPI = {
  getHomepageData: async () => {
    try {
      const response = await api.get('/admin/homepage');
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw error;
    }
  },

  getChatsData: async () => {
    try {
      const response = await api.get('/admin/chats');
      const data = response.data?.data ?? response.data;
      
      // If backend returns an array, use it directly
      if (Array.isArray(data)) return data;
      
      // Otherwise try to extract chats property
      return data?.chats ?? data;
    } catch (error) {
      console.error('Error fetching chats data:', error);
      throw error;
    }
  },
};
