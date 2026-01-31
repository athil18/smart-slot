import React, { HTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    header?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    noPadding?: boolean;
    className?: string;
}

export const Card: React.FC<CardProps> = ({
    header,
    footer,
    children,
    className = '',
    noPadding = false,
    ...props
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={twMerge(
                "relative group overflow-hidden rounded-2xl",
                "bg-bg-card/40 backdrop-blur-xl",
                "border border-white/5",
                "shadow-glass",
                className
            )}
            {...(props as any)}
        >
            {/* Gradient Border Shine */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-500" />
            <div className="absolute -inset-px bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

            {header && (
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 backdrop-brightness-110">
                    <div className="font-display font-semibold text-xl text-white tracking-wide">
                        {header}
                    </div>
                </div>
            )}

            <div className={clsx("relative z-10", !noPadding && "p-6")}>
                {children}
            </div>

            {footer && (
                <div className="px-6 py-4 border-t border-white/5 bg-white/5 backdrop-brightness-90">
                    {footer}
                </div>
            )}
        </motion.div>
    );
};
