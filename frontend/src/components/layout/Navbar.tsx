import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, PenSquare, User as UserIcon } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Trending", path: "/trending" },
    { name: "Categories", path: "/categories" },
  ];

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full h-[64px] bg-white border-b border-slate-200/90 shadow-sm">
      <div className="max-w-[1200px] h-full mx-auto px-4 lg:px-6 flex items-center justify-between">
        {/* Logo (Icon Badge: Black bg, White text) */}
        <Link
          to="/"
          className="text-[19px] font-black text-slate-900 tracking-tight flex items-center gap-2 hover:opacity-90 transition-opacity"
          onClick={closeMenu}
        >
          <span className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-extrabold text-[15px]">
            B
          </span>
          <span className="tracking-tight">BlogApp</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-50 p-1 rounded-full border border-slate-200/80">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[13px] font-medium transition-all duration-150",
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60",
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth Section */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {/* Write Post Quick Link (Black bg, White text) */}
              <Link
                to="/posts/create"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors shadow-sm"
              >
                <PenSquare size={14} />
                <span>Create post</span>
              </Link>

              {/* Profile Link */}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
              >
                <div className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
                  <UserIcon size={11} />
                </div>
                <span>{user?.username}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="px-3.5 py-1.5 text-[12px] font-medium rounded-full border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign in
              </Link>

              {/* Get started button (Black bg, White text) */}
              <Link
                to="/register"
                className="px-4 py-1.5 text-[13px] font-semibold text-white bg-black rounded-full hover:bg-slate-800 transition-colors shadow-sm"
              >
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <button
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[64px] left-0 w-full bg-white border-b border-slate-200 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={closeMenu}
                  className={cn(
                    "block px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
                    isActive
                      ? "bg-black text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {link.name}
                </Link>
              );
            })}

            <div className="h-px bg-slate-100 my-2" />

            {isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/posts/create"
                  onClick={closeMenu}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-black text-white font-semibold text-[14px]"
                >
                  <PenSquare size={16} />
                  <span>Create new post</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Personal page ({user?.username})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-[14px] font-medium text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block text-center px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="block text-center px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white bg-black"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
