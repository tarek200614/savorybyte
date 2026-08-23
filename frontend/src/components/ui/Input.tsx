import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-sm transition-all duration-200 focus:outline-none focus:ring-2',
              error
                ? 'border-rose-500/80 focus:ring-rose-500/40'
                : 'border-slate-800 focus:border-amber-500/80 focus:ring-amber-500/30',
              className
            )
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
