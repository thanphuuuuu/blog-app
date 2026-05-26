import { forwardRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full border border-slate-200 rounded-lg px-[14px] py-[10px] text-[14px] text-slate-900 bg-white placeholder:text-slate-400',
          'transition-all duration-150 ease-in-out min-h-[100px] resize-y',
          'focus:outline-none focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/10',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
