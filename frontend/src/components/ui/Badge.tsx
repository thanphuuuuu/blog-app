import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'active';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-medium transition-colors duration-150',
        variant === 'default' && 'bg-slate-100 text-slate-500 hover:bg-slate-200',
        variant === 'active' && 'bg-blue-50 text-blue-600 border border-blue-200',
        className
      )}
    >
      {children}
    </span>
  );
};
