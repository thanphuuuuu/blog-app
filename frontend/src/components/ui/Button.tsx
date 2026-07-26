import { forwardRef } from 'react';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading || disabled}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 ease-in-out active:scale-98',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          
          // Variants
          variant === 'primary' && 'bg-black text-white hover:bg-slate-800 focus:ring-slate-900',
          variant === 'ghost' && 'bg-transparent text-slate-500 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400',
          variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',

          
          // Sizes
          size === 'sm' && 'px-3 py-1.5 text-xs rounded-md',
          size === 'md' && 'px-5 py-2.5 text-sm rounded-lg',
          size === 'lg' && 'px-6 py-3 text-base rounded-xl',
          
          // States
          (loading || disabled) && 'opacity-50 cursor-not-allowed active:scale-100',
          
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
