import React, { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Label: React.FC<LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none text-subtle peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block',
        className
      )}
      {...props}
    />
  );
};
