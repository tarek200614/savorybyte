import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-saffron/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

    const variants = {
      primary:
        'bg-saffron hover:bg-saffron-600 text-white font-semibold shadow-lg shadow-saffron-950/40 border border-saffron-400/30 active:translate-y-px',
      secondary:
        'bg-[#101B2E] hover:bg-[#162238] text-ivory border border-[#182640] shadow-sm',
      danger:
        'bg-terracotta hover:bg-terracotta-light text-white shadow-md shadow-terracotta-950/30 border border-terracotta-400/30',
      outline:
        'border border-champagne/40 text-champagne-light hover:bg-champagne/10 hover:border-champagne hover:text-champagne-light',
      ghost: 'text-stone-300 hover:bg-[#101B2E] hover:text-ivory',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          clsx(baseStyles, variants[variant], sizes[size], className)
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
