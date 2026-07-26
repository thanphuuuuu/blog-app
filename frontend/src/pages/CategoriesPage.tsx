import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Folder,
  Search,
  Plus,
  X,
  Sparkles,
  PenSquare,
  Tag,
} from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PostCard } from "../components/blog/PostCard";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCatId, setSelectedCatId] = useState<string>("all");

  // Modal states for creating a new category
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [catRes, postRes] = await Promise.all([
        api.get("/categories"),
        api.get("/posts?limit=200"),
      ]);

      if (catRes.data?.success && Array.isArray(catRes.data.data)) {
        setCategories(catRes.data.data);
      } else if (Array.isArray(catRes.data)) {
        setCategories(catRes.data);
      }

      if (postRes.data?.success && Array.isArray(postRes.data.data)) {
        setPosts(postRes.data.data);
      } else if (Array.isArray(postRes.data)) {
        setPosts(postRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch categories/posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter categories by search input and tab selection
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesTab =
        selectedCatId === "all" ||
        cat.id === selectedCatId ||
        cat.slug === selectedCatId;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cat.name?.toLowerCase().includes(q) ||
        cat.description?.toLowerCase().includes(q) ||
        cat.slug?.toLowerCase().includes(q);

      return matchesTab && matchesSearch;
    });
  }, [categories, searchQuery, selectedCatId]);

  // Group posts dynamically under each category
  const categoryGroups = useMemo(() => {
    return filteredCategories.map((cat) => {
      const catPosts = posts.filter((post) =>
        post.categories?.some(
          (c: any) =>
            c.id === cat.id ||
            c.slug?.toLowerCase() === cat.slug?.toLowerCase(),
        ),
      );
      return {
        category: cat,
        posts: catPosts,
      };
    });
  }, [filteredCategories, posts]);

  const handleOpenModal = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setErrorMsg("");
    setNewCatName("");
    setNewCatDesc("");
    setIsModalOpen(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      setCreating(true);
      setErrorMsg("");
      const res = await api.post("/categories", {
        name: newCatName.trim(),
        description: newCatDesc.trim() || undefined,
      });

      if (res.status === 200 || res.status === 201) {
        setIsModalOpen(false);
        setNewCatName("");
        setNewCatDesc("");
        await fetchData();
      }
    } catch (err: any) {
      console.error("Create category error:", err);
      setErrorMsg(
        err.response?.data?.message ||
          "Không thể tạo thể loại mới. Vui lòng thử lại sau.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Navbar />

      <main className="flex-1 w-full max-w-[1140px] mx-auto px-4 py-10 md:py-14">
        {/* Top Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-[32px] md:text-[44px] font-extrabold text-slate-900 tracking-tight mb-3.5 leading-tight">
            Khám phá theo Thể loại
          </h1>
          <p className="text-[15px] md:text-[16px] text-slate-600 leading-relaxed">
            Các bài viết do cộng đồng đăng tải được nhóm tự động theo thể loại.
            Chọn chủ đề bạn yêu thích để đọc ngay!
          </p>
        </section>

        {/* Search & Dynamic Category Tabs Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 md:p-6 shadow-sm mb-10 space-y-4">
          <div className="w-full">
            {/* Search Input */}
            <div className="relative w-full">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Tìm kiếm thể loại bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Filter Pills generated dynamically from database categories */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCatId("all")}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                selectedCatId === "all"
                  ? "bg-black text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
              }`}
            >
              Tất cả ({categories.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id || cat.slug}
                onClick={() => setSelectedCatId(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 ${
                  selectedCatId === cat.id
                    ? "bg-black text-white shadow-sm"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700"
                }`}
              >
                <Tag
                  size={13}
                  className={
                    selectedCatId === cat.id ? "text-white" : "text-slate-400"
                  }
                />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Body: Render Grouped Posts by Category */}
        {loading ? (
          <div className="space-y-8">
            {[...Array(3)].map((_, i) => (
              <CategoryGroupSkeleton key={i} />
            ))}
          </div>
        ) : categoryGroups.length === 0 ? (
          <div className="text-center py-20 px-4 border border-dashed border-slate-200 rounded-3xl bg-white shadow-sm">
            <Sparkles size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-[18px] font-bold text-slate-800 mb-1">
              Không tìm thấy thể loại phù hợp
            </h3>
            <p className="text-[14px] text-slate-500 max-w-md mx-auto mb-6">
              {searchQuery
                ? `Không có thể loại nào khớp với từ khóa "${searchQuery}".`
                : "Hiện chưa có thể loại bài viết nào trong hệ thống."}
            </p>
            <Button
              variant="ghost"
              onClick={handleOpenModal}
              className="rounded-full px-6"
            >
              + Tạo thể loại mới
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            {categoryGroups.map(({ category, posts: groupPosts }) => (
              <section
                key={category.id || category.slug}
                className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6"
              >
                {/* Category Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                      <Folder size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">
                          {category.name}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[12px] font-bold border border-blue-100">
                          {groupPosts.length} bài viết
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-[13px] text-slate-500 mt-0.5">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/?category=${category.slug}`}
                    className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 shrink-0"
                  >
                    Xem tất cả bài thuộc thể loại &rarr;
                  </Link>
                </div>

                {/* Posts List / Grid for this Category */}
                {groupPosts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 px-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-[14px] text-slate-500 font-medium mb-3">
                      Chưa có bài viết nào thuộc thể loại{" "}
                      <strong>"{category.name}"</strong>.
                    </p>
                    <Button
                      variant="ghost"
                      onClick={() => navigate("/posts/create")}
                      className="rounded-full px-5 text-[13px]"
                    >
                      <PenSquare size={15} className="mr-1.5" />
                      Viết bài đầu tiên cho thể loại này
                    </Button>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </main>

      {/* Modal Tạo Thể Loại Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-[20px] font-bold text-slate-900">
                  Tạo Thể loại Mới
                </h2>
                <p className="text-[13px] text-slate-500">
                  Thêm thể loại bài viết mới vào hệ thống
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-[13px] font-medium border border-red-100">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Tên thể loại <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Ví dụ: Nhiếp ảnh, Trí tuệ nhân tạo, Âm nhạc..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                  Mô tả ngắn (không bắt buộc)
                </label>
                <textarea
                  rows={3}
                  placeholder="Mô tả tóm tắt nội dung về thể loại này..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsModalOpen(false)}
                  disabled={creating}
                  className="rounded-full"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={creating}
                  disabled={!newCatName.trim() || creating}
                  className="rounded-full px-6"
                >
                  Tạo thể loại
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

// ─── Skeleton Loading Component ──────────────────────────────────────────────

const CategoryGroupSkeleton = () => (
  <div className="bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 animate-pulse space-y-6">
    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-100 rounded-2xl" />
        <div className="space-y-2">
          <div className="h-5 bg-slate-100 rounded-md w-36" />
          <div className="h-3 bg-slate-100 rounded-md w-48" />
        </div>
      </div>
      <div className="h-4 bg-slate-100 rounded-md w-24" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-slate-100 rounded-xl" />
      ))}
    </div>
  </div>
);
