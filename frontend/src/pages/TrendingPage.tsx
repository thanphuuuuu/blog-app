import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Heart,
  Code,
  Palette,
  Database,
  ShieldCheck,
  Compass,
  FileText,
  Flame,
  Trophy,
  Hash,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { usePosts } from "../hooks/usePosts";
import { formatDate, calcReadTime } from "../utils/format";
import api from "../services/api";

type Timeframe = "week" | "month" | "all";

export const TrendingPage = () => {
  const [timeframe, setTimeframe] = useState<Timeframe>("all");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const [searchTag, setSearchTag] = useState<string | undefined>(undefined);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Fetch real categories from the database for dynamic pills
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

  // Combine dynamic categories
  const categoriesList = useMemo(() => {
    return [
      { name: "All", slug: undefined },
      ...dbCategories.map((c) => ({ name: c.name, slug: c.slug })),
    ];
  }, [dbCategories]);

  // Query parameters for the true trending algorithm
  const queryParams = useMemo(
    () => ({
      sortBy: "trending" as const,
      timeframe,
      category: selectedCategory,
      search: searchTag,
      limit: 10,
      page: 1,
    }),
    [timeframe, selectedCategory, searchTag],
  );

  const { posts, loading, error } = usePosts(queryParams);

  // Helper to map category name to premium styles and custom vector icons
  const getCategoryStyle = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (
      name.includes("tech") ||
      name.includes("code") ||
      name.includes("dev") ||
      name.includes("typescript")
    ) {
      return {
        bgColor: "bg-blue-50 text-blue-600 border-blue-100",
        icon: <Code size={20} className="text-blue-500" />,
        badgeStyle: "bg-blue-50 text-blue-600",
      };
    }
    if (
      name.includes("design") ||
      name.includes("ui") ||
      name.includes("ux") ||
      name.includes("visual")
    ) {
      return {
        bgColor: "bg-purple-50 text-purple-600 border-purple-100",
        icon: <Palette size={20} className="text-purple-500" />,
        badgeStyle: "bg-purple-50 text-purple-600",
      };
    }
    if (
      name.includes("db") ||
      name.includes("database") ||
      name.includes("sql") ||
      name.includes("data")
    ) {
      return {
        bgColor: "bg-amber-50 text-amber-600 border-amber-100",
        icon: <Database size={20} className="text-amber-500" />,
        badgeStyle: "bg-amber-50 text-amber-600",
      };
    }
    if (
      name.includes("backend") ||
      name.includes("server") ||
      name.includes("nest") ||
      name.includes("security") ||
      name.includes("api")
    ) {
      return {
        bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
        icon: <ShieldCheck size={20} className="text-emerald-500" />,
        badgeStyle: "bg-emerald-50 text-emerald-600",
      };
    }
    if (
      name.includes("life") ||
      name.includes("growth") ||
      name.includes("personal")
    ) {
      return {
        bgColor: "bg-pink-50 text-pink-600 border-pink-100",
        icon: <Compass size={20} className="text-pink-500" />,
        badgeStyle: "bg-pink-50 text-pink-600",
      };
    }
    return {
      bgColor: "bg-slate-50 text-slate-600 border-slate-100",
      icon: <FileText size={20} className="text-slate-500" />,
      badgeStyle: "bg-slate-50 text-slate-600",
    };
  };

  // Compute Top Authors dynamically based on actual loaded posts
  const topAuthors = useMemo(() => {
    const authorsMap: Record<
      string,
      {
        name: string;
        avatarUrl?: string;
        postsCount: number;
        likesCount: number;
      }
    > = {};

    posts.forEach((post) => {
      const username = post.author.username;
      if (!authorsMap[username]) {
        authorsMap[username] = {
          name: username,
          avatarUrl: post.author.avatar_url,
          postsCount: 0,
          likesCount: 0,
        };
      }
      authorsMap[username].postsCount += 1;
      authorsMap[username].likesCount += post.likesCount ?? 0;
    });

    return Object.values(authorsMap)
      .sort((a, b) => b.likesCount - a.likesCount)
      .slice(0, 5);
  }, [posts]);

  // Compute Hot Tags dynamically based on real posts
  const hotTags = useMemo(() => {
    const tags = new Set<string>();
    posts.forEach((post) => {
      post.categories.forEach((c) => {
        tags.add(c.name.toLowerCase());
      });
      // Extract popular keywords from titles as potential hashtags
      const keywords = post.title
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/);
      keywords.forEach((word) => {
        if (
          word.length > 3 &&
          ![
            "with",
            "from",
            "your",
            "that",
            "this",
            "post",
            "blog",
            "what",
            "here",
            "more",
          ].includes(word)
        ) {
          tags.add(word);
        }
      });
    });

    return Array.from(tags).slice(0, 8);
  }, [posts]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 py-8 md:py-12">
        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp size={28} className="text-blue-600" />
              <h1 className="text-[28px] md:text-[34px] font-extrabold text-slate-900 tracking-tight">
                Trending
              </h1>
            </div>
            <p className="text-[14px] md:text-[15px] text-slate-500 font-medium ml-1">
              Ranked by likes + comments + views
            </p>
          </div>

          {/* Timeframe pill control */}
          <div className="flex p-1 bg-slate-100 rounded-xl self-start md:self-center border border-slate-200">
            {(["week", "month", "all"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 text-[13px] font-semibold rounded-lg capitalize transition-all duration-150 ${
                  timeframe === t
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {t === "all" ? "All time" : t}
              </button>
            ))}
          </div>
        </header>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-slate-100 scrollbar-hide">
          {categoriesList.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.slug);
                setSearchTag(undefined);
              }}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold border transition-all duration-150 ${
                selectedCategory === cat.slug && !searchTag
                  ? "bg-black text-white border-black shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {searchTag && (
            <button
              onClick={() => setSearchTag(undefined)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-[13px] font-semibold bg-black text-white border-black shadow-sm flex items-center gap-1.5"
            >
              #{searchTag} <span className="text-[10px] opacity-75">✕</span>
            </button>
          )}

        </div>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Trending Post Cards */}
          <div className="lg:col-span-8 flex flex-col divide-y divide-slate-100">
            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[14px] text-center mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex flex-col gap-6">
                {[...Array(5)].map((_, i) => (
                  <TrendingPostSkeleton key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <TrendingUp size={44} className="mx-auto mb-4 opacity-25" />
                <p className="text-[15px] font-medium">
                  No trending posts found in this filter.
                </p>
              </div>
            ) : (
              posts.map((post, index) => {
                const style = getCategoryStyle(
                  post.categories?.[0]?.name || "",
                );
                return (
                  <Link
                    key={post.id}
                    to={`/posts/${post.slug}`}
                    className="group flex items-start gap-4 py-6 first:pt-0 last:pb-0 hover:bg-slate-50/50 px-2 rounded-xl transition-all duration-150"
                  >
                    {/* Rank Badge */}
                    <div className="w-8 font-extrabold text-[18px] md:text-[22px] text-blue-600 pt-3 text-center shrink-0">
                      {index + 1}
                    </div>

                    {/* Category styled custom placeholder */}
                    <div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 border ${style.bgColor}`}
                    >
                      {style.icon}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                      {/* Mini Category tag */}
                      {post.categories?.[0] && (
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider mb-2 ${style.badgeStyle}`}
                        >
                          {post.categories[0].name}
                        </span>
                      )}

                      {/* Title */}
                      <h3 className="text-[16px] md:text-[18px] font-bold text-slate-900 leading-[1.35] mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-150">
                        {post.title}
                      </h3>

                      {/* Author and Date */}
                      <div className="flex items-center gap-1.5 text-[12px] md:text-[13px] text-slate-400">
                        <span className="font-semibold text-slate-600">
                          {post.author.username}
                        </span>
                        <span>·</span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>

                    {/* Right side stats column */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                      <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-900">
                        <Heart
                          size={14}
                          className="text-red-500 fill-red-500 shrink-0"
                        />
                        <span>{post.likesCount ?? 0}</span>
                      </div>

                      <div className="text-[12px] text-slate-400 font-medium">
                        {post.commentsCount ?? 0} comments
                      </div>

                      {/* Flame Hot badge for Rank 1 */}
                      {index === 0 && (
                        <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-orange-50 border border-orange-100 rounded-md text-[10px] font-bold text-orange-600 animate-pulse">
                          <Flame size={10} className="fill-orange-600" />
                          <span>Hot</span>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Right Column: Premium Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full">
            {/* Top Authors Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Trophy size={18} className="text-amber-500" />
                <h2 className="text-[16px] font-bold text-slate-900">
                  Top authors
                </h2>
              </div>

              <div className="flex flex-col gap-4">
                {topAuthors.length === 0 ? (
                  <div className="text-[13px] text-slate-400 text-center py-4 font-medium">
                    No active authors found.
                  </div>
                ) : (
                  topAuthors.map((author, i) => {
                    const initials =
                      author.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase() || "U";
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {/* Circular avatar placeholder */}
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 font-bold text-[12px] flex items-center justify-center border border-slate-200 shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="text-[14px] font-semibold text-slate-900 leading-tight">
                              {author.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                              {author.postsCount} posts this month
                            </div>
                          </div>
                        </div>

                        {/* Total likes count on the right */}
                        <div className="flex items-center gap-1 text-[13px] font-bold text-blue-600">
                          <span>{author.likesCount}</span>
                          <Heart
                            size={11}
                            className="fill-blue-600 text-blue-600"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Hot Tags Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Hash size={18} className="text-blue-500" />
                <h2 className="text-[16px] font-bold text-slate-900">
                  Hot tags
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {hotTags.length === 0 ? (
                  <div className="text-[13px] text-slate-400 text-center py-2 font-medium w-full">
                    No tags found.
                  </div>
                ) : (
                  hotTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setSearchTag(tag)}
                      className={`px-3 py-1 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
                        searchTag === tag
                          ? "bg-black text-white shadow-sm"
                          : "bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 hover:border-slate-200"
                      }`}

                    >
                      #{tag}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// ─── TrendingPostSkeleton ─────────────────────────────────────────────────────

const TrendingPostSkeleton = () => (
  <div className="flex items-start gap-4 py-6 border-b border-slate-100 animate-pulse">
    {/* Rank */}
    <div className="w-8 h-8 rounded-lg bg-slate-100 shrink-0" />
    {/* Category Box */}
    <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0" />
    {/* Content Area */}
    <div className="flex-1 min-w-0 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-16" />
      <div className="h-5 bg-slate-100 rounded w-4/5" />
      <div className="h-4 bg-slate-100 rounded w-2/5" />
    </div>
    {/* Right stats */}
    <div className="w-16 flex flex-col items-end gap-2 shrink-0">
      <div className="h-4 bg-slate-100 rounded w-10" />
      <div className="h-3 bg-slate-100 rounded w-12" />
    </div>
  </div>
);
