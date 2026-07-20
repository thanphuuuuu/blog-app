import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { PostCard } from "../components/blog/PostCard";
import { PostCardSkeleton } from "../components/blog/PostCardSkeleton";
import { Pagination } from "../components/ui/Pagination";
import { usePosts } from "../hooks/usePosts";
import api from "../services/api";

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") || undefined;

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    categoryParam,
  );
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const postsSectionRef = useRef<HTMLDivElement>(null);

  const handleStartReading = () => {
    postsSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Sync selectedCategory with searchParams categoryParam
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCurrentPage(1);
  }, [categoryParam]);

  // Fetch real categories from database
  useEffect(() => {
    api
      .get("/categories")
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setDbCategories(res.data.data);
        } else if (Array.isArray(res.data)) {
          setDbCategories(res.data);
        }
      })
      .catch((err) => console.error("Failed to fetch categories:", err));
  }, []);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      limit: 9,
      category: selectedCategory ? selectedCategory.toLowerCase() : undefined,
    }),
    [currentPage, selectedCategory],
  );

  const { posts, loading, error, meta } = usePosts(queryParams);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 lg:px-6 py-10">
        {/* Premium Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-[#0b1528] via-[#0f172a] to-[#1e293b] rounded-[32px] p-8 md:p-12 lg:p-16 mb-12 shadow-xl border border-slate-800">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left side content */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              {/* Trending Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-900/35 border border-blue-800/80 text-blue-300 text-[12px] font-semibold mb-6">
                <TrendingUp size={14} className="text-blue-400" />
                <span>Trending this week</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-[36px] md:text-[48px] lg:text-[54px] font-extrabold text-white leading-[1.1] tracking-tight mb-4">
                Insights & <span className="text-blue-400">Ideas</span>
                <br />
                worth reading
              </h1>

              {/* Description */}
              <p className="text-[15px] md:text-[16px] text-slate-300 max-w-lg mb-8 leading-relaxed">
                Discover the latest trends, thoughts, and best practices from
                our community of writers.
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleStartReading}
                  className="px-6 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-100 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md text-[14px]"
                >
                  Start Reading
                </button>
              </div>
            </div>

            {/* Right side mock code container */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
              <div className="relative w-full max-w-[420px] bg-slate-950/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 md:p-8 font-mono text-[13px] md:text-[14px] leading-relaxed text-slate-300 shadow-2xl overflow-hidden select-none">
                {/* Visual code details */}
                <div className="text-slate-500 mb-2">
                  // fetch trending posts
                </div>
                <div>
                  <span className="text-indigo-400 font-semibold">const</span>{" "}
                  posts ={" "}
                  <span className="text-indigo-400 font-semibold">await</span>
                </div>
                <div className="pl-4">
                  <span className="text-emerald-400">postService</span>.
                  <span className="text-sky-400">findAll</span>(&#123;
                </div>
                <div className="pl-8">
                  <span className="text-amber-300">sortBy</span>:{" "}
                  <span className="text-amber-200">'likes'</span>,
                </div>
                <div className="pl-8">
                  <span className="text-amber-300">limit</span>:{" "}
                  <span className="text-sky-300">10</span>
                </div>
                <div className="pl-4">&#125;)</div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Row */}
        <section
          ref={postsSectionRef}
          className="mb-10 border-b border-slate-200"
        >
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <button
              onClick={() => {
                setSearchParams({});
                setCurrentPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                !selectedCategory
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              All Posts
            </button>
            {dbCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => {
                  setSearchParams({ category: cat.slug });
                  setCurrentPage(1);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                  selectedCategory?.toLowerCase() === cat.slug.toLowerCase()
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Latest Posts Grid */}
        <section className="mb-16">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-center mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <PostCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              No posts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        {!loading && meta && meta.totalPages > 1 && (
          <section className="flex justify-center mb-10">
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};
