import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse rounded-xl bg-charcoal/80 border border-white/5', className)
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="p-6 rounded-2xl bg-charcoal border border-champagne/15 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
