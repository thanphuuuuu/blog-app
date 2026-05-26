import type { User } from './user.types';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Comment {
  id: string;
  content: string;
  author_id: string;
  post_id: string;
  parent_id: string | null;
  created_at: string;
  author: User;
  replies?: Comment[];
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  is_published: boolean;
  view_count: number;
  author: User;
  categories: Category[];
  created_at: string;
  updated_at: string;
  // Populated by loadRelationCountAndMap in backend
  likesCount?: number;
  commentsCount?: number;
  // Legacy field (kept for compatibility)
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  author?: string;
  likedBy?: string;
  timeframe?: 'week' | 'month' | 'all';
  sortBy?: 'latest' | 'views' | 'likes' | 'trending';
}
