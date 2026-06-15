import React, { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={cn(
            'flex h-11 w-full rounded-md border border-overlay bg-base px-3 py-2 text-sm text-primary ring-offset-base file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
            error && 'border-love focus-visible:ring-love',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <span className="text-xs text-love mt-1 block">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
