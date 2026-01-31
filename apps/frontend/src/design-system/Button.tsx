import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', fullWidth = false, loading = false, children, className = '', ...props }, ref) => {

        const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-300 rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-dark focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transform";

        const variants = {
            primary: "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-neon hover:shadow-[0_0_20px_rgba(99,102,241,0.6)] border border-primary-400/20",
            secondary: "bg-surface-800/50 text-primary-300 border border-primary-500/30 hover:bg-surface-700 hover:border-primary-500/60 backdrop-blur-md",
            ghost: "bg-transparent text-text-muted hover:text-white hover:bg-white/5",
            danger: "bg-error text-white hover:bg-red-600 shadow-lg shadow-red-500/20",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-xs gap-1.5",
            md: "px-5 py-2.5 text-sm gap-2",
            lg: "px-8 py-3.5 text-base gap-3",
        };

        const MotionButton = motion.button;

        return (
            <MotionButton
                ref={ref}
                whileHover={{ scale: props.disabled ? 1 : 1.02, y: props.disabled ? 0 : -1 }}
                whileTap={{ scale: props.disabled ? 1 : 0.98 }}
                className={twMerge(
                    baseStyles,
                    variants[variant],
                    sizes[size],
                    fullWidth && "w-full",
                    className
                )}
                disabled={loading || props.disabled}
                {...(props as any)}
            >
                {/* Shine Effect Overlay */}
                {variant === 'primary' && !props.disabled && (
                    <div className="absolute inset-0 -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                )}

                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                    </>
                ) : children}
            </MotionButton>
        );
    }
);

Button.displayName = 'Button';
