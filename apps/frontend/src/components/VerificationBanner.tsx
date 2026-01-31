import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VerificationBannerProps {
    status: 'pending' | 'rejected';
    reason?: string;
    onContact?: () => void;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({ status, reason, onContact }) => {
    const [isVisible, setIsVisible] = React.useState(true);

    if (!isVisible) return null;

    const bannerVariants = {
        hidden: {
            opacity: 0,
            y: -50,
            scale: 0.95
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            scale: 0.95,
            transition: { duration: 0.3 }
        }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        }
    };

    const pulseVariants = {
        pulse: {
            scale: [1, 1.05, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse" as const
            }
        }
    };

    if (status === 'pending') {
        return (
            <AnimatePresence>
                <motion.div
                    className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center gap-4 mb-6 backdrop-blur-sm shadow-lg"
                    variants={bannerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)'
                    }}
                >
                    <motion.div
                        className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl relative overflow-hidden"
                        variants={iconVariants}
                    >
                        <motion.div
                            className="absolute inset-0 bg-amber-500/10 rounded-full"
                            variants={pulseVariants}
                            animate="pulse"
                        />
                        <motion.span
                            animate={{
                                rotate: 360,
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }}
                        >
                            ⏳
                        </motion.span>
                    </motion.div>
                    <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.h4
                            className="text-amber-400 font-bold text-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Account Verification Pending
                        </motion.h4>
                        <motion.p
                            className="text-text-muted text-xs mt-0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            Your professional credentials are being reviewed by our administrators. Some advanced features may be restricted until verified.
                        </motion.p>
                    </motion.div>
                    <motion.button
                        className="text-amber-500/50 hover:text-amber-500 transition-colors"
                        onClick={() => setIsVisible(false)}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Dismiss banner"
                    >
                        ✕
                    </motion.button>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (status === 'rejected') {
        return (
            <AnimatePresence>
                <motion.div
                    className="bg-error/10 border border-error/20 p-4 rounded-xl flex items-center gap-4 mb-6 backdrop-blur-sm shadow-lg"
                    variants={bannerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)'
                    }}
                >
                    <motion.div
                        className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-xl relative overflow-hidden"
                        variants={iconVariants}
                    >
                        <motion.div
                            className="absolute inset-0 bg-error/10 rounded-full"
                            animate={{
                                scale: [1, 1.2, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatType: "reverse"
                            }}
                        />
                        <motion.span
                            animate={{
                                rotate: [0, -10, 10, -10, 0],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                        >
                            ⚠️
                        </motion.span>
                    </motion.div>
                    <motion.div
                        className="flex-1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <motion.h4
                            className="text-error font-bold text-sm"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Verification Declined
                        </motion.h4>
                        <motion.p
                            className="text-text-muted text-xs mt-0.5"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            {reason || "The provided documents did not meet our verification criteria. Please update your profile or contact support."}
                        </motion.p>
                    </motion.div>
                    {onContact && (
                        <motion.button
                            onClick={onContact}
                            className="px-4 py-2 bg-error/20 hover:bg-error/30 text-error text-xs font-bold rounded-lg transition-colors"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            whileHover={{
                                scale: 1.05,
                                boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Contact Support
                        </motion.button>
                    )}
                    <motion.button
                        className="text-error/50 hover:text-error transition-colors"
                        onClick={() => setIsVisible(false)}
                        whileHover={{ scale: 1.2, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Dismiss banner"
                    >
                        ✕
                    </motion.button>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null;
};
