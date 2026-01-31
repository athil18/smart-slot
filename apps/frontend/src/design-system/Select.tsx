import React, { SelectHTMLAttributes, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    helperText?: string;
    error?: any;
    fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, helperText, error, fullWidth = false, className = '', ...props }, ref) => {
        const id = useId();
        const selectId = props.id || id;

        const errorMessage = typeof error === 'string' ? error : error?.message;
        const hasError = Boolean(errorMessage);

        return (
            <div className={clsx("flex flex-col gap-1.5", fullWidth && "w-full")}>
                {label && (
                    <label
                        htmlFor={selectId}
                        className="text-sm font-medium text-text-muted ml-0.5"
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
                    <select
                        ref={ref}
                        id={selectId}
                        className={twMerge(
                            "w-full bg-transparent px-4 py-2.5 text-sm text-text-main placeholder-text-subtle/50 outline-none rounded-xl appearance-none",
                            "cursor-pointer",
                            className
                        )}
                        {...props}
                    >
                        <option value="" disabled className="bg-bg-dark">Select an option</option>
                        {options.map((option) => (
                            <option key={option.value} value={option.value} className="bg-bg-dark">
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 pointer-events-none text-text-muted">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {(helperText || errorMessage) && (
                    <div
                        className={clsx(
                            "text-xs ml-1",
                            hasError ? "text-error" : "text-text-subtle"
                        )}
                    >
                        {errorMessage || helperText}
                    </div>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';
