// services/games.ts
import api from './api';

export interface GameFilters {
  search?: string;
  genre?: string;
  platform?: string;
  sort?: 'recent' | 'popular' | 'rating' | 'title';
  page?: number;
  limit?: number;
  featured?: boolean;
}

export const gamesService = {
  // Get all games with filters
  getGames: async (filters: GameFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.genre && filters.genre !== 'All') params.append('genre', filters.genre);
    if (filters.platform && filters.platform !== 'All') params.append('platform', filters.platform);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.featured) params.append('featured', 'true');

    const response = await api.get(`/games?${params.toString()}`);
    return response.data;
  },

  // Get single game by ID or slug
  getGame: async (id: string) => {
    const response = await api.get(`/games/${id}`);
    return response.data;
  },

  // Get game statistics
  getGameStats: async (id: string) => {
    const response = await api.get(`/games/${id}/stats`);
    return response.data;
  },

  // Create game (admin only)
  createGame: async (gameData: any) => {
    const response = await api.post('/games', gameData);
    return response.data;
  },

  // Update game (admin only)
  updateGame: async (id: string, gameData: any) => {
    const response = await api.put(`/games/${id}`, gameData);
    return response.data;
  },

  // Delete game (admin only)
  deleteGame: async (id: string) => {
    const response = await api.delete(`/games/${id}`);
    return response.data;
  },
};