import api from './api';
import type { Post, PaginatedResponse, PostQueryParams } from '../types/post.types';

export const postService = {
  getPosts: async (params?: PostQueryParams) => {
    const response = await api.get<PaginatedResponse<Post>>('/posts', { params });
    return response.data;
  },

  getPostBySlug: async (slug: string) => {
    const response = await api.get<{ data: Post }>(`/posts/${slug}`);
    return response.data.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createPost: async (data: any) => {
    const response = await api.post<{ data: Post }>('/posts', data);
    return response.data.data;
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatePost: async (id: string, data: any) => {
    const response = await api.patch<{ data: Post }>(`/posts/${id}`, data);
    return response.data.data;
  },

  deletePost: async (id: string) => {
    await api.delete(`/posts/${id}`);
  },
};
