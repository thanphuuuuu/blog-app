import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Code, 
  Server, 
  Palette, 
  Database, 
  ShieldCheck, 
  Compass, 
  FileText 
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import api from '../services/api';

export const CategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and posts dynamically
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [catRes, postRes] = await Promise.all([
          api.get('/categories'),
          api.get('/posts?limit=100')
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
        console.error('Failed to fetch categories/posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map category details automatically
  const getCategoryDetails = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (slug === 'development') {
      return {
        icon: <Code size={36} className="text-blue-500" />,
        headerBg: 'bg-blue-50',
        pillBg: 'bg-blue-50 text-blue-600',
        description: 'Code, frameworks, architecture, and dev tools.',
        borderColor: 'hover:border-blue-200'
      };
    }
    if (slug === 'backend') {
      return {
        icon: <Server size={36} className="text-emerald-500" />,
        headerBg: 'bg-emerald-50',
        pillBg: 'bg-emerald-50 text-emerald-600',
        description: 'APIs, databases, auth, and server-side logic.',
        borderColor: 'hover:border-emerald-200'
      };
    }
    if (slug === 'design') {
      return {
        icon: <Palette size={36} className="text-amber-500" />,
        headerBg: 'bg-amber-50',
        pillBg: 'bg-amber-50 text-amber-600',
        description: 'UI/UX, components, typography, and layout.',
        borderColor: 'hover:border-amber-200'
      };
    }
    if (slug === 'database' || slug === 'db') {
      return {
        icon: <Database size={36} className="text-purple-500" />,
        headerBg: 'bg-purple-50',
        pillBg: 'bg-purple-50 text-purple-600',
        description: 'SQL, TypeORM, migrations, and data modeling.',
        borderColor: 'hover:border-purple-200'
      };
    }
    if (slug === 'security') {
      return {
        icon: <ShieldCheck size={36} className="text-pink-500" />,
        headerBg: 'bg-pink-50',
        pillBg: 'bg-pink-50 text-pink-600',
        description: 'JWT, bcrypt, guards, and best practices.',
        borderColor: 'hover:border-pink-200'
      };
    }
    if (slug === 'devlog' || slug === 'technology') {
      return {
        icon: <Code size={36} className="text-cyan-500" />,
        headerBg: 'bg-cyan-50',
        pillBg: 'bg-cyan-50 text-cyan-600',
        description: 'Project journals, lessons learned, and stories.',
        borderColor: 'hover:border-cyan-200'
      };
    }
    if (slug === 'lifestyle') {
      return {
        icon: <Compass size={36} className="text-rose-500" />,
        headerBg: 'bg-rose-50',
        pillBg: 'bg-rose-50 text-rose-600',
        description: 'Personal growth, productivity, and balanced living.',
        borderColor: 'hover:border-rose-200'
      };
    }
    if (slug === 'business') {
      return {
        icon: <Server size={36} className="text-orange-500" />,
        headerBg: 'bg-orange-50',
        pillBg: 'bg-orange-50 text-orange-600',
        description: 'Industry insights, startups, and career growth.',
        borderColor: 'hover:border-orange-200'
      };
    }
    return {
      icon: <FileText size={36} className="text-slate-500" />,
      headerBg: 'bg-slate-50',
      pillBg: 'bg-slate-50 text-slate-600',
      description: 'Explore the articles and stories in this category.',
      borderColor: 'hover:border-slate-200'
    };
  };

  // Compute actual counts dynamically
  const getPostCount = (categorySlug: string) => {
    return posts.filter(post => 
      post.categories?.some((c: any) => c.slug.toLowerCase() === categorySlug.toLowerCase())
    ).length;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 w-full max-w-[1000px] mx-auto px-4 py-12 md:py-16">
        {/* Title Section */}
        <section className="text-center mb-16">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-slate-900 tracking-tight mb-3">
            Explore Categories
          </h1>
          <p className="text-[15px] md:text-[16px] text-slate-500 font-medium">
            Find posts by the topics you care about most
          </p>
        </section>

        {/* Categories Card Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-slate-500 font-medium border border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
            No categories found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const details = getCategoryDetails(cat.name);
              const postCount = getPostCount(cat.slug);
              return (
                <div
                  key={cat.slug}
                  onClick={() => navigate(`/?category=${cat.slug}`)}
                  className={`group bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col h-[280px] ${details.borderColor}`}
                >
                  {/* Top Colored Header Section */}
                  <div className={`h-[100px] w-full flex items-center justify-center transition-colors duration-200 ${details.headerBg} group-hover:opacity-90`}>
                    {details.icon}
                  </div>

                  {/* Bottom Content Section */}
                  <div className="p-6 flex flex-col flex-1 min-w-0">
                    <h3 className="text-[18px] font-bold text-slate-900 mb-1.5 group-hover:text-blue-600 transition-colors duration-150">
                      {cat.name}
                    </h3>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-4 flex-1 line-clamp-2">
                      {cat.description || details.description}
                    </p>
                    <div className={`px-3.5 py-1 text-[11px] font-bold rounded-full w-fit ${details.pillBg}`}>
                      {postCount} posts
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

// ─── CategoryCardSkeleton ─────────────────────────────────────────────────────

const CategoryCardSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden h-[280px] animate-pulse">
    <div className="h-[100px] bg-slate-50" />
    <div className="p-6 flex flex-col flex-1 space-y-4">
      <div className="h-5 bg-slate-50 rounded w-1/2" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-slate-50 rounded w-full" />
        <div className="h-3 bg-slate-50 rounded w-5/6" />
      </div>
      <div className="h-5 bg-slate-50 rounded-full w-20" />
    </div>
  </div>
);
