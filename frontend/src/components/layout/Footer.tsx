import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-6 px-4 lg:px-6 mt-auto">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link to="/" className="text-[15px] font-bold text-slate-900 tracking-tight">
            BlogApp
          </Link>
          <p className="text-[12px] text-slate-400 mt-1">
            © {new Date().getFullYear()} BlogApp · Built with React + NestJS
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="flex items-center gap-5 text-[13px] text-slate-500">
          <Link to="/about" className="hover:text-slate-900 transition-colors">
            About
          </Link>
          <Link to="/privacy" className="hover:text-slate-900 transition-colors">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-slate-900 transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
};
