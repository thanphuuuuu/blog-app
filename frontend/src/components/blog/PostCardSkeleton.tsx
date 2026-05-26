export const PostCardSkeleton = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-slate-100"></div>

      {/* Card Body Skeleton */}
      <div className="p-4">
        {/* Category Tag Skeleton */}
        <div className="mb-2">
          <div className="h-[20px] bg-slate-100 rounded-full w-16"></div>
        </div>

        {/* Title Skeleton */}
        <div className="h-[20px] bg-slate-100 rounded mb-[6px] w-3/4"></div>

        {/* Description Skeleton */}
        <div className="mb-4">
          <div className="h-[14px] bg-slate-100 rounded w-full mb-2"></div>
          <div className="h-[14px] bg-slate-100 rounded w-5/6"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="pt-[10px] border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 shrink-0"></div>
            <div className="h-[12px] bg-slate-100 rounded w-20"></div>
          </div>
          <div className="h-[12px] bg-slate-100 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};
