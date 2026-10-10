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
              'w-full px-4 py-2.5 rounded-xl bg-[#08111F] border text-ivory placeholder-stone-400 text-sm transition-all duration-200 focus:outline-none focus:ring-2',
              error
                ? 'border-terracotta/80 focus:ring-terracotta/40'
                : 'border-[#182640] focus:border-saffron/80 focus:ring-saffron/30',
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
