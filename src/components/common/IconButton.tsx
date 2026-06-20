import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = ({
  icon,
  children,
  variant = 'secondary',
  size = 'md',
  className,
  ...props
}: IconButtonProps) => {
  const baseStyles =
    'inline-flex items-center justify-center gap-1.5 font-display transition-all duration-200 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-accent-gold/90 text-ink-900 border-accent-gold hover:bg-accent-gold focus:ring-accent-gold/50 shadow-md hover:shadow-lg',
    secondary:
      'bg-parchment-100 text-ink-800 border-cork-400 hover:bg-parchment-200 focus:ring-cork-400/50 shadow-sm',
    ghost:
      'bg-transparent text-parchment-100 border-transparent hover:bg-parchment-100/10 focus:ring-parchment-100/30',
    danger:
      'bg-accent-red/90 text-parchment-50 border-accent-red hover:bg-accent-red focus:ring-accent-red/50',
  };

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};
