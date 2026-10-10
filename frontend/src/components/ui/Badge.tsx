import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'blue' | 'purple' | 'rose' | 'slate' | 'saffron' | 'champagne' | 'terracotta' | 'botanical' | 'stone' | 'neutral';
}

export function Badge({
  children,
  className,
  variant = 'amber',
  ...props
}: BadgeProps) {
  const variants = {
    emerald: 'bg-botanical-900/60 text-botanical-light border-botanical-500/30',
    botanical: 'bg-botanical-900/60 text-botanical-light border-botanical-500/30',
    amber: 'bg-[#231E15] text-champagne-light border-champagne/30',
    champagne: 'bg-[#231E15] text-champagne-light border-champagne/30',
    saffron: 'bg-saffron-950/70 text-saffron-light border-saffron-500/30',
    rose: 'bg-terracotta-900/60 text-terracotta-light border-terracotta-500/30',
    terracotta: 'bg-terracotta-900/60 text-terracotta-light border-terracotta-500/30',
    blue: 'bg-[#0E1A2E] text-sky-300 border-sky-500/30',
    purple: 'bg-[#1E1428] text-purple-300 border-purple-500/30',
    slate: 'bg-[#101B2E] text-stone-300 border-[#182640]',
    stone: 'bg-[#101B2E] text-stone-300 border-[#182640]',
    neutral: 'bg-charcoal text-stone-300 border-white/10',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide uppercase font-mono',
          variants[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
