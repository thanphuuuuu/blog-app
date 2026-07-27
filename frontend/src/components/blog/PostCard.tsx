import { Image as ImageIcon, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Post } from '../../types/post.types';
import { Badge } from '../ui/Badge';
import { formatDate } from '../../utils/format';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  const primaryCategory = post.categories?.[0];

  return (
    <Link
      to={`/posts/${post.slug}`}
      className="group block bg-white border border-slate-200 rounded-xl overflow-hidden transition-colors duration-150 ease-in-out hover:border-slate-300"
    >
      {/* Thumbnail */}
      <div className="w-full aspect-video bg-slate-100 flex items-center justify-center relative">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageIcon size={40} className="text-slate-300" />
        )}
      </div>

      {/* Card Body */}
      <div className="p-4">
        {/* Category Tag */}
        {primaryCategory && (
          <div className="mb-2">
            <Badge variant="default">{primaryCategory.name}</Badge>
          </div>
        )}

        {/* Title */}
        <h3 className="text-[15px] font-semibold text-slate-900 leading-[1.4] mb-[6px] group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-[13px] text-slate-500 leading-[1.5] line-clamp-2 mb-4">
          {post.excerpt || post.content.replace(/<[^>]+>/g, '').substring(0, 150)}
        </p>

        {/* Footer */}
        <div className="pt-[10px] border-t border-slate-100 flex items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 shrink-0">
              {post.author.avatar_url ? (
                <img
                  src={post.author.avatar_url}
                  alt={post.author.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={14} className="text-slate-400" />
              )}
            </div>
            <span className="text-[12px] text-slate-500 truncate max-w-[100px]">
              {post.author.username}
            </span>
          </div>

          {/* Meta (Date) */}
          <div className="text-[11px] text-slate-400 shrink-0">
            {formatDate(post.created_at)}
          </div>
        </div>
      </div>
    </Link>
  );
};
