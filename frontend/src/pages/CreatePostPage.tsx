import { useState, useEffect, useRef } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Upload, X, ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { postService } from '../services/postService';
import api from '../services/api';
import type { Category } from '../types/post.types';

export const CreatePostPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
  const [coverImageBase64, setCoverImageBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        if (response.data?.success && Array.isArray(response.data.data)) {
          setAvailableCategories(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Compress ảnh bằng Canvas API trước khi gửi lên server
  // Lý do: ảnh gốc có thể hàng MB, base64 sẽ rất lớn và vượt giới hạn server
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        // Giới hạn chiều rộng tối đa 1200px, giữ tỉ lệ khung hình
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

        // Nén xuống quality 0.75 (75%) — đủ chất lượng cho thumbnail blog
        const compressed = canvas.toDataURL('image/jpeg', 0.75);
        URL.revokeObjectURL(objectUrl);
        resolve(compressed);
      };

      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
      img.src = objectUrl;
    });
  };

  // Xử lý khi người dùng chọn file từ máy tính
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

  const handleSubmit = async (isPublished: boolean) => {
    if (!title.trim() || !content.trim()) return;

    try {
      setIsSubmitting(true);

      const payload = {
        title,
        content,
        excerpt: content.substring(0, 150),
        // Gửi base64 string lên server nếu có chọn ảnh
        cover_image: coverImageBase64 || undefined,
        is_published: isPublished,
        category_ids: selectedCategoryId ? [selectedCategoryId] : undefined,
      };

      console.log('Sending payload:', { ...payload, cover_image: payload.cover_image ? '[base64 image]' : undefined });

      const newPost = await postService.createPost(payload);
      navigate(`/posts/${newPost.slug}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      console.error('Axios error details:', axiosErr.response?.data);
      const errMsg = axiosErr.response?.data?.message || 'Failed to create post';
      alert(`Error creating post: ${Array.isArray(errMsg) ? errMsg.join(', ') : errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-[800px] mx-auto px-4 py-8 md:py-12 flex flex-col">
        {/* Title Input */}
        <input
          type="text"
          placeholder="New post title here..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-[32px] md:text-[40px] font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none bg-transparent mb-6"
        />

        {/* Category & Cover Image */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Category Dropdown */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-[14px] focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 transition-all bg-white text-slate-700"
          >
            <option value="">Select a Category</option>
            {availableCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* File Picker */}
          <div className="flex-1">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="cover-image-input"
            />

            {coverImagePreview ? (
              /* Preview ảnh đã chọn */
              <div className="relative w-full h-[42px] rounded-lg overflow-hidden border border-slate-200 group">
                <img
                  src={coverImagePreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-between px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <span className="text-white text-[12px] font-medium">Cover image selected</span>
                  <button
                    onClick={handleRemoveCover}
                    className="text-white hover:text-red-300 transition-colors"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              /* Nút chọn ảnh */
              <label
                htmlFor="cover-image-input"
                className="flex items-center gap-2 w-full h-[42px] border border-dashed border-slate-300 rounded-lg px-4 text-[14px] text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all duration-150"
              >
                <ImageIcon size={15} />
                <span>Choose cover image...</span>
                <Upload size={14} className="ml-auto text-slate-400" />
              </label>
            )}
          </div>
        </div>

        {/* Editor Area */}
        <Textarea
          placeholder="Write your story here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 min-h-[400px] text-[16px] leading-[1.8] border-none focus:ring-0 p-0 resize-y mb-8"
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting || !title || !content}
          >
            Save Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSubmit(true)}
            loading={isSubmitting}
            disabled={!title || !content}
          >
            Publish
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};
