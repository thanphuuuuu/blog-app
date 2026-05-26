import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner = ({ size = 20, className }: LoadingSpinnerProps) => {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-blue-600', className)}
    />
  );
};
