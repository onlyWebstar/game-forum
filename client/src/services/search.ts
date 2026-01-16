// services/search.ts
import api from './api';

export interface SearchFilters {
  query: string;
  type?: 'all' | 'games' | 'users' | 'posts';
  limit?: number;
}

export const searchService = {
  // Global search
  search: async (filters: SearchFilters) => {
    const params = new URLSearchParams();
    params.append('q', filters.query);
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`/search?${params.toString()}`);
    return response.data;
  },

  // Search games
  searchGames: async (query: string, limit = 10) => {
    const response = await api.get(`/games?search=${query}&limit=${limit}`);
    return response.data;
  },

  // Search users
  searchUsers: async (query: string, limit = 10) => {
    const response = await api.get(`/users/search?q=${query}&limit=${limit}`);
    return response.data;
  },

  // Search posts
  searchPosts: async (query: string, limit = 10) => {
    const response = await api.get(`/posts?search=${query}&limit=${limit}`);
    return response.data;
  },
};