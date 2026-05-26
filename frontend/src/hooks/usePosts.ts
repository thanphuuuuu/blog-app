import { useState, useEffect, useCallback } from 'react';
import { postService } from '../services/postService';
import type { Post, PostQueryParams, PaginatedResponse } from '../types/post.types';

export const usePosts = (initialParams?: PostQueryParams) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginatedResponse<Post>['meta'] | null>(null);

  const fetchPosts = useCallback(async (params?: PostQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const result = await postService.getPosts(params);
      setPosts(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  const paramsString = initialParams ? JSON.stringify(initialParams) : '';

  useEffect(() => {
    fetchPosts(initialParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchPosts, paramsString]);

  return { posts, loading, error, meta, fetchPosts };
};
