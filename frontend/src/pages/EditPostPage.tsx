import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService } from '../services/postService';
import api from '../services/api';
import type { Category, Post } from '../types/post.types';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const EditPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [coverImageBase64, setCoverImageBase64] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick category creation states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Fetch categories and post data on load
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch available categories
        const catRes = await api.get('/categories');
        if (catRes.data?.success && Array.isArray(catRes.data.data)) {
          setAvailableCategories(catRes.data.data);
        } else if (Array.isArray(catRes.data)) {
          setAvailableCategories(catRes.data);
        }

        // 2. Fetch the post to edit
        if (slug) {
          const postData = await postService.getPostBySlug(slug);
          setPost(postData);
          setTitle(postData.title);
          setContent(postData.content);
          
          if (postData.cover_image) {
            setCoverImagePreview(postData.cover_image);
            setCoverImageBase64(postData.cover_image);
          }
          
          if (postData.categories && postData.categories.length > 0) {
            setSelectedCategoryId(postData.categories[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load edit page data:', err);
        alert('Không thể tải dữ liệu bài viết.');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [slug, navigate]);

  // Compress image before upload using Canvas API
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const MAX_WIDTH = 1200;
        let { width, height } = img;
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        URL.revokeObjectURL(objectUrl);
        resolve(compressed);
      };

      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
      img.src = objectUrl;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setCoverImageBase64(compressed);
      setCoverImagePreview(compressed);
    } catch (err) {
      console.error('Image compression failed:', err);
      alert('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
    }
  };

  const handleRemoveCover = () => {
    setCoverImagePreview('');
    setCoverImageBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleQuickAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      setCreatingCategory(true);
      const res = await api.post('/categories', { name: newCatName.trim() });
      const created = res.data?.data || res.data;
      if (created && created.id) {
        setAvailableCategories((prev) => [...prev, created]);
        setSelectedCategoryId(created.id);
      }
      setNewCatName('');
      setIsAddingCategory(false);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tạo thể loại mới');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (isPublished: boolean) => {
    if (!post || !title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        title,
        content,
        excerpt: content.substring(0, 150),
        cover_image: coverImageBase64 || null,
        is_published: isPublished,
        category_ids: selectedCategoryId ? [selectedCategoryId] : [],
      };

      const updatedPost = await postService.updatePost(post.id, payload);
      navigate(`/posts/${updatedPost.slug}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      console.error('Axios error details:', axiosErr.response?.data);
      const errMsg = axiosErr.response?.data?.message || 'Failed to update post';
      alert(`Lỗi khi lưu bài viết: ${Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size={40} />
            <p className="text-slate-500 font-medium">Đang tải dữ liệu bài viết...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-4 py-8 md:py-12 flex flex-col">
        {/* 1. Title Input (Top) */}
        <input
          type="text"
          placeholder="Tiêu đề bài viết..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[32px] md:text-[40px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent mb-6"
        />

        {/* 2. Category Selection (Next) */}
        <div className="w-full mb-6">
          <label className="block text-[13px] font-semibold text-slate-600 mb-2">
            Thể loại bài viết <span className="text-red-500">*</span>
          </label>
          {isAddingCategory ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Tên thể loại mới..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 border border-blue-500 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none ring-2 ring-blue-500/10"
                autoFocus
              />
              <Button
                variant="primary"
                onClick={handleQuickAddCategory}
                loading={creatingCategory}
                disabled={!newCatName.trim() || creatingCategory}
                className="px-4 py-2.5 text-[13px] rounded-xl"
              >
                Lưu
              </Button>
              <button
                type="button"
                onClick={() => setIsAddingCategory(false)}
                className="p-2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                if (e.target.value === '__NEW__') {
                  setIsAddingCategory(true);
                } else {
                  setSelectedCategoryId(e.target.value);
                }
              }}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[14px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all bg-white text-slate-700 shadow-sm"
            >
              <option value="">-- Chọn thể loại bài viết --</option>
              {availableCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__NEW__">+ Thêm thể loại mới...</option>
            </select>
          )}
        </div>

        {/* 3. Cover Image Selection (Next - Large vertical preview box) */}
        <div className="w-full mb-8">
          <label className="block text-[13px] font-semibold text-slate-600 mb-2">
            Ảnh bìa bài viết (Cover Image)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="cover-image-input"
          />

          {coverImagePreview ? (
            <div className="relative w-full min-h-[220px] max-h-[360px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 group flex items-center justify-center">
              <img
                src={coverImagePreview}
                alt="Cover preview"
                className="w-full h-full max-h-[360px] object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <label
                  htmlFor="cover-image-input"
                  className="px-4 py-2 bg-white/90 hover:bg-white text-slate-800 text-[13px] font-semibold rounded-full cursor-pointer transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Upload size={15} />
                  <span>Đổi ảnh khác</span>
                </label>
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white text-[13px] font-semibold rounded-full transition-all shadow-sm flex items-center gap-1.5"
                >
                  <X size={15} />
                  <span>Xóa ảnh</span>
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="cover-image-input"
              className="flex flex-col items-center justify-center gap-2 w-full h-[180px] border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl bg-slate-50/50 hover:bg-blue-50/30 cursor-pointer transition-all duration-200 text-center p-6 group"
            >
              <div className="p-3.5 bg-white rounded-full shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                <ImageIcon size={28} className="text-blue-500" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                  Tải lên ảnh bìa cho bài viết
                </p>
                <p className="text-[12px] text-slate-400">
                  Hỗ trợ PNG, JPG, JPEG, WEBP (Tự động nén ảnh tối ưu)
                </p>
              </div>
            </label>
          )}
        </div>

        {/* 4. Editor Area */}
        <Textarea
          placeholder="Nội dung bài viết..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 min-h-[350px] text-[16px] leading-[1.8] border-none focus:ring-0 p-0 resize-y mb-8"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !title || !content}
          >
            Lưu bản nháp
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(true)}
            loading={isSubmitting}
            disabled={!title || !content}
          >
            Cập nhật bài viết
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
