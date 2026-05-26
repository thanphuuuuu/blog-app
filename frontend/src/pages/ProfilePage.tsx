import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, FileText, Camera } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { useAuthContext } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import api from '../services/api';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  // avatarPreview: dùng để hiển thị, có thể là URL cũ hoặc base64 mới
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  // avatarBase64: chỉ có giá trị khi người dùng chọn ảnh mới từ máy
  const [avatarBase64, setAvatarBase64] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Compress avatar bằng Canvas — giới hạn 300px, JPEG 80%
  const compressAvatar = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 300;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Failed to load image')); };
      img.src = objectUrl;
    });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressAvatar(file);
      setAvatarBase64(compressed);
      setAvatarPreview(compressed);
    } catch {
      setErrorMsg('Không thể xử lý ảnh. Vui lòng thử ảnh khác.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    try {
      setIsSaving(true);

      // Chỉ gửi những field có giá trị
      const payload: Record<string, string> = {};
      if (username.trim()) payload.username = username.trim();
      if (bio.trim() !== (user?.bio || '').trim()) payload.bio = bio.trim();
      // Chỉ gửi avatar_url nếu người dùng chọn ảnh mới
      if (avatarBase64) payload.avatar_url = avatarBase64;

      const response = await api.patch('/users/me', payload);
      const updatedUser = response.data.data;

      // Cập nhật Context để Navbar phản chiếu thông tin mới
      dispatch({
        type: 'LOGIN',
        payload: {
          access_token: '',
          refresh_token: '',
          user: updatedUser,
        },
      });

      setAvatarBase64('');
      setSuccessMsg('Profile updated successfully!');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr.response?.data?.message || 'Failed to update profile';
      setErrorMsg(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col md:flex-row py-8 px-4 lg:px-6 gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-[240px] shrink-0 border-r border-slate-200 pr-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt={user?.username} className="w-full h-full object-cover" />
              ) : (
                <User className="text-slate-400" />
              )}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-semibold text-slate-900 truncate">{user?.username}</h3>
              <p className="text-[13px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <FileText size={18} /> My Posts
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <Settings size={18} /> Profile
            </Link>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left w-full mt-4"
            >
              <LogOut size={18} /> Log out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h1 className="text-[24px] font-bold text-slate-900 mb-8">Edit Profile</h1>

          {successMsg && (
            <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-[14px] rounded-lg">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[14px] rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="max-w-[500px] flex flex-col gap-5">

            {/* Avatar Picker */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-3">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                {/* Avatar Preview */}
                <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border-2 border-slate-200">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={32} className="text-slate-300" />
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  id="avatar-input"
                />

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="avatar-input"
                    className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 hover:border-slate-300 cursor-pointer transition-all duration-150"
                  >
                    <Camera size={14} />
                    Choose photo
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarPreview('');
                        setAvatarBase64('');
                        if (avatarInputRef.current) avatarInputRef.current.value = '';
                      }}
                      className="text-[12px] text-red-500 hover:text-red-600 text-left transition-colors"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                Bio
              </label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" loading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};
