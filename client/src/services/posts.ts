// services/posts.ts
import api from './api';

export interface PostFilters {
  game?: string;
  author?: string;
  postType?: 'discussion' | 'review' | 'guide' | 'question';
  tags?: string;
  search?: string;
  sort?: 'recent' | 'popular' | 'trending' | 'oldest';
  page?: number;
  limit?: number;
  featured?: boolean;
  pinned?: boolean;
}

export interface CreatePostData {
  title: string;
  content: string;
  game: string;
  postType: 'discussion' | 'review' | 'guide' | 'question';
  tags?: string[];
  images?: Array<{ url: string; caption?: string }>;
}

export const postsService = {
  // Get all posts with filters
  getPosts: async (filters: PostFilters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  },

  // Get single post by ID
  getPost: async (id: string) => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Create new post
  createPost: async (postData: CreatePostData) => {
    const response = await api.post('/posts', postData);
    return response.data;
  },

  // Update post
  updatePost: async (id: string, postData: Partial<CreatePostData>) => {
    const response = await api.put(`/posts/${id}`, postData);
    return response.data;
  },

  // Delete post
  deletePost: async (id: string) => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Pin/unpin post (moderator/admin)
  togglePin: async (id: string) => {
    const response = await api.put(`/posts/${id}/pin`);
    return response.data;
  },

  // Lock/unlock post (moderator/admin)
  toggleLock: async (id: string) => {
    const response = await api.put(`/posts/${id}/lock`);
    return response.data;
  },
};