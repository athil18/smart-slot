import React, { InputHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: any; // Accept react-hook-form error object or string
    fullWidth?: boolean;
    startAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, helperText, error, fullWidth = false, startAdornment, className = '', ...props }, ref) => {
        const id = useId();
        const inputId = props.id || id;

        // Handle both string and FieldError object
        const errorMessage = typeof error === 'string' ? error : error?.message;
        const hasError = Boolean(errorMessage);

        return (
            <div className={clsx("flex flex-col gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <label
                        htmlFor={inputId}
                        className="text-sm font-medium text-text-muted ml-0.5 transition-colors group-focus-within:text-primary-400"
                    >
                        {label}
                        {props.required && <span className="text-accent ml-1">*</span>}
                    </label>
                )}

                <div className={twMerge(
                    "relative flex items-center transition-all duration-300",
                    "bg-bg-card/50 backdrop-blur-sm border rounded-xl",
                    "focus-within:ring-2 focus-within:ring-primary-500/50 focus-within:border-primary-500 focus-within:shadow-neon",
                    hasError
                        ? "border-error/50 focus-within:ring-error/50 focus-within:border-error"
                        : "border-white/10 hover:border-white/20",
                    props.disabled && "opacity-50 cursor-not-allowed"
                )}>
                    {startAdornment && (
                        <div className="pl-3 text-text-muted">
                            {startAdornment}
                        </div>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={twMerge(
                            "w-full bg-transparent px-4 py-2.5 text-sm text-text-main placeholder-text-subtle/50 outline-none rounded-xl",
                            startAdornment && "pl-2",
                            className
                        )}
                        {...props}
                    />
                </div>

                {(helperText || errorMessage) && (
                    <div
                        id={`${inputId}-description`}
                        className={clsx(
                            "text-xs ml-1",
                            hasError ? "text-error" : "text-text-subtle"
                        )}
                        role={hasError ? 'alert' : undefined}
                    >
                        {errorMessage || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

Input.displayName = 'Input';
