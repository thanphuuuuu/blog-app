import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User as UserIcon, Trash2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { postService } from '../services/postService';
import api from '../services/api';
import type { Post, Comment } from '../types/post.types';
import { formatDate, calcReadTime } from '../utils/format';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../hooks/useAuth';

export const PostDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Post state
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Like state
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // Comment state
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const isOwner = !!(post && user && post.author.id === user.id);

  // Load post on mount
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const data = await postService.getPostBySlug(slug);
        setPost(data);
        // Dùng likesCount từ backend (loadRelationCountAndMap)
        setLikesCount(data.likesCount ?? 0);
      } catch (err: unknown) {
        const e = err as { response?: { data?: { message?: string } } };
        setError(e.response?.data?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // Load comments khi biết post.id
  useEffect(() => {
    if (!post?.id) return;
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const res = await api.get(`/posts/${post.id}/comments`);
        if (res.data?.success) setComments(res.data.data);
      } catch {
        // comments load fail — không crash page
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [post?.id]);

  // Load trạng thái like của user hiện tại với bài viết này
  useEffect(() => {
    if (!post?.id || !isAuthenticated) {
      setIsLiked(false);
      return;
    }
    const fetchLikeStatus = async () => {
      try {
        const res = await api.get<{ success: boolean; data: { liked: boolean } }>(`/posts/${post.id}/like/status`);
        if (res.data?.success) {
          setIsLiked(!!res.data.data.liked);
        }
      } catch {
        // Lỗi load trạng thái like — bỏ qua âm thầm
      }
    };
    fetchLikeStatus();
  }, [post?.id, isAuthenticated]);

  // Toggle like / unlike
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!post || isLikeLoading) return;

    // Optimistic update ngay lập tức
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? c - 1 : c + 1));
    setIsLikeLoading(true);

    try {
      if (wasLiked) {
        // Unlike
        await api.delete(`/posts/${post.id}/like`);
      } else {
        // Like
        await api.post(`/posts/${post.id}/like`);
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      // 409 = đã like rồi — đồng bộ lại state
      if (e.response?.status === 409) {
        setIsLiked(true);
        setLikesCount((c) => c + (wasLiked ? 0 : 0)); // giữ nguyên
      } else {
        // Rollback nếu lỗi khác
        setIsLiked(wasLiked);
        setLikesCount((c) => (wasLiked ? c + 1 : c - 1));
      }
    } finally {
      setIsLikeLoading(false);
    }
  };

  // Submit comment
  const handleCommentSubmit = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!commentText.trim() || !post) return;

    try {
      setIsSubmittingComment(true);
      await api.post(`/posts/${post.id}/comments`, { content: commentText.trim() });
      setCommentText('');
      // Reload comments sau khi đăng
      const res = await api.get(`/posts/${post.id}/comments`);
      if (res.data?.success) setComments(res.data.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Xóa comment (chỉ tác giả)
  const handleDeleteComment = async (commentId: string) => {
    if (!post) return;
    try {
      await api.delete(`/comments/${commentId}`);
      // Xóa khỏi state ngay
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      alert('Failed to delete comment');
    }
  };

  // Loading / Error states
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <LoadingSpinner size={40} />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex justify-center items-center text-slate-500">
          {error || 'Post not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-10">
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categories?.map((cat) => (
              <Badge key={cat.id} variant="active">{cat.name}</Badge>
            ))}
          </div>

          <h1 className="text-[28px] md:text-[36px] font-bold text-slate-900 leading-[1.2] tracking-[-0.5px] mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 border-y border-slate-100 py-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden border border-slate-200 flex items-center justify-center shrink-0">
              {post.author.avatar_url ? (
                <img src={post.author.avatar_url} alt={post.author.username} className="w-full h-full object-cover" />
              ) : (
                <UserIcon size={20} className="text-slate-400" />
              )}
            </div>
            <div>
              <div className="text-[15px] font-medium text-slate-900">{post.author.username}</div>
              <div className="text-[13px] text-slate-500">
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.cover_image && (
          <figure className="mb-10 rounded-xl overflow-hidden bg-slate-100 max-h-[480px]">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
          </figure>
        )}

        {/* Content */}
        <article className="prose prose-slate max-w-none text-[18px] leading-[1.8] text-slate-800 mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Like / Comment count bar */}
        <div className="flex items-center gap-4 py-6 border-y border-slate-200 mb-12">
          {/* Like button */}
          <button
            onClick={handleLikeToggle}
            disabled={isLikeLoading || isOwner}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-150 ${
              isOwner
                ? 'text-slate-400 border border-slate-200 cursor-not-allowed opacity-75'
                : isLiked
                ? 'bg-red-50 text-red-500 border border-red-200 hover:bg-red-100'
                : 'text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
            title={isOwner ? 'Bạn không thể thả tim bài viết của chính mình' : isAuthenticated ? (isLiked ? 'Unlike' : 'Like') : 'Sign in to like'}
          >
            <Heart
              size={18}
              className={`transition-all duration-150 ${
                isOwner ? 'text-slate-400' : isLiked ? 'fill-red-500 text-red-500' : ''
              }`}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment count (không click) */}
          <button
            onClick={() => commentInputRef.current?.focus()}
            disabled={isOwner}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[14px] font-medium text-slate-500 border border-slate-200 transition-all duration-150 ${
              isOwner ? 'cursor-default' : 'hover:bg-slate-50'
            }`}
          >
            <MessageCircle size={18} />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* Comment Section */}
        <section className="mb-12">
          <h3 className="text-[20px] font-bold text-slate-900 mb-6">
            Comments ({comments.length})
          </h3>

          {/* Comment input */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-8">
            {isOwner ? (
              <div className="text-center py-3 text-[14px] text-slate-500 font-medium">
                Bạn là tác giả bài viết. Bạn chỉ có thể xem lượt thích và trả lời bình luận của độc giả bên dưới.
              </div>
            ) : isAuthenticated ? (
              <>
                <Textarea
                  ref={commentInputRef}
                  placeholder="What are your thoughts?"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="mb-3 bg-white"
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button
                    variant="primary"
                    onClick={handleCommentSubmit}
                    loading={isSubmittingComment}
                    disabled={!commentText.trim()}
                  >
                    Respond
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-[14px] text-slate-500 mb-3">Sign in to join the conversation</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
              </div>
            )}
          </div>

          {/* Comments list */}
          {commentsLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size={24} />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-[14px] text-slate-500 py-8 border border-dashed border-slate-200 rounded-xl">
              Be the first to comment.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUserId={user?.id}
                  onDelete={handleDeleteComment}
                  onReply={(parentId, content) => {
                    if (!isAuthenticated) {
                      navigate('/login');
                      return;
                    }
                    // Gửi reply
                    api.post(`/posts/${post.id}/comments`, { content, parent_id: parentId })
                      .then(async () => {
                        const res = await api.get(`/posts/${post.id}/comments`);
                        if (res.data?.success) setComments(res.data.data);
                      })
                      .catch(() => alert('Failed to post reply'));
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

// ─── CommentItem component ────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => void;
  isReply?: boolean;
}

const CommentItem = ({ comment, currentUserId, onDelete, onReply, isReply = false }: CommentItemProps) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(comment.id, replyText.trim());
    setReplyText('');
    setShowReplyBox(false);
  };

  return (
    <div className={`${isReply ? 'ml-10 pl-4 border-l-2 border-slate-100' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
          {comment.author?.avatar_url ? (
            <img src={comment.author.avatar_url} alt={comment.author.username} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={15} className="text-slate-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[14px] font-semibold text-slate-900">{comment.author?.username}</span>
            <span className="text-[12px] text-slate-400">{formatDate(comment.created_at)}</span>
          </div>

          <p className="text-[15px] text-slate-700 leading-[1.6] whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-2">
            {!isReply && (
              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="text-[12px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Reply
              </button>
            )}
            {currentUserId === comment.author_id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-[12px] text-red-400 hover:text-red-600 transition-colors flex items-center gap-1"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>

          {/* Reply input box */}
          {showReplyBox && (
            <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <Textarea
                placeholder={`Reply to ${comment.author?.username}...`}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={2}
                className="mb-2 bg-white text-[14px]"
              />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setShowReplyBox(false); setReplyText(''); }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleReplySubmit} disabled={!replyText.trim()}>
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 flex flex-col gap-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              currentUserId={currentUserId}
              onDelete={onDelete}
              onReply={onReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
};
