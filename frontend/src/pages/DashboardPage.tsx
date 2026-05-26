import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../hooks/useAuth';
import { postService } from '../services/postService';
import type { Post } from '../types/post.types';
import { Button } from '../components/ui/Button';
import { formatDate } from '../utils/format';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Custom delete modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch only the user's posts, or pass an author filter
    const fetchUserPosts = async () => {
      try {
        setLoading(true);
        const data = await postService.getPosts({ limit: 50 });
        // Filter locally for now to simulate "My Posts" if backend doesn't support ?author= yet
        const myPosts = data.data.filter((p) => p.author.id === user?.id);
        setPosts(myPosts);
      } catch (err) {
        console.error('Failed to load posts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserPosts();
  }, [user]);

  const openDeleteModal = (id: string) => {
    setPostToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      setDeleteLoading(true);
      await postService.deletePost(postToDelete);
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete));
      setDeleteModalOpen(false);
      setPostToDelete(null);
    } catch (err) {
      alert('Failed to delete post');
    } finally {
      setDeleteLoading(false);
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
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover" />
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
            <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium">
              <FileText size={18} /> My Posts
            </Link>
            <Link to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
              <Settings size={18} /> Profile
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-left w-full mt-4"
            >
              <LogOut size={18} /> Log out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-[24px] font-bold text-slate-900">My Posts</h1>
            <Link to="/posts/create">
              <Button variant="primary" className="gap-2">
                <Plus size={18} /> New Post
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={32} />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
              <FileText className="mx-auto text-slate-300 mb-3" size={40} />
              <p className="text-slate-500 text-[15px]">You haven't written any posts yet.</p>
              <Link to="/posts/create">
                <Button variant="ghost" className="mt-4 text-blue-600">Start writing</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[13px] font-medium text-slate-500 uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Title</th>
                    <th className="pb-3 px-4 font-medium">Status</th>
                    <th className="pb-3 px-4 font-medium">Date</th>
                    <th className="pb-3 pl-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[14px]">
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 pr-4 font-medium text-slate-900 max-w-[200px] truncate">
                        <Link to={`/posts/${post.slug}`} className="hover:text-blue-600">
                          {post.title}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          post.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.is_published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/posts/edit/${post.slug}`}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => openDeleteModal(post.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-100 p-6 flex flex-col items-center text-center transition-all duration-200 transform scale-100">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash2 size={22} className="text-red-500 animate-pulse" />
            </div>
            <h3 className="text-[18px] font-bold text-slate-900 mb-2">Delete Post</h3>
            <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer text-[14px] flex-1"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-[14px] flex-1 flex items-center justify-center"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
