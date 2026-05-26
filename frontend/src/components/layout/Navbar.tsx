import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Trending', path: '/trending' },
    { name: 'Categories', path: '/categories' },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full h-[60px] bg-white border-b border-slate-200">
      <div className="max-w-[1200px] h-full mx-auto px-4 lg:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-[18px] font-bold text-slate-900 tracking-tight" onClick={closeMenu}>
          BlogApp
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                'px-3 py-2 rounded-md text-[14px] transition-colors',
                location.pathname === link.path
                  ? 'text-slate-900 font-medium'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-[14px] font-medium text-slate-700 hover:text-slate-900">
                {user?.username}
              </Link>
              <button
                onClick={() => logout()}
                className="px-3 py-1.5 text-xs font-medium rounded-md border border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-150"
              >
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <button
          className="md:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-md focus:outline-none"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[60px] left-0 w-full bg-white border-b border-slate-200 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={cn(
                  'block px-4 py-3 rounded-lg text-[15px] font-medium transition-colors',
                  location.pathname === link.path
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="h-px bg-slate-100 my-2" />
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={closeMenu} className="block px-4 py-3 rounded-lg text-[15px] font-medium text-slate-600 hover:bg-slate-50">
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg text-[15px] font-medium text-slate-600 hover:bg-slate-50"
                >
                  Log out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link to="/login" onClick={closeMenu} className="w-full">
                  <Button variant="ghost" className="w-full justify-center">Sign in</Button>
                </Link>
                <Link to="/register" onClick={closeMenu} className="w-full">
                  <Button variant="primary" className="w-full justify-center">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
