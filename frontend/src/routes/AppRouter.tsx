import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { HomePage } from '../pages/HomePage';
import { TrendingPage } from '../pages/TrendingPage';
import { CategoriesPage } from '../pages/CategoriesPage';
import { PostDetailPage } from '../pages/PostDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { CreatePostPage } from '../pages/CreatePostPage';
import { EditPostPage } from '../pages/EditPostPage';
import { ProfilePage } from '../pages/ProfilePage';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trending" element={<TrendingPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/posts/:slug" element={<PostDetailPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/posts/create" element={<CreatePostPage />} />
        <Route path="/posts/edit/:slug" element={<EditPostPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
};
