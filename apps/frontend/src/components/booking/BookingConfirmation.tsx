import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Hash, Mail, CalendarPlus, CheckCircle2 } from 'lucide-react';
import { Button } from '../../design-system';
import './BookingConfirmation.css';

interface BookingDetails {
    amenityIcon: string;
    amenityName: string;
    resourceName: string;
    date: string;
    startTime: string;
    endTime: string;
    bookingId: string;
}

interface BookingConfirmationProps {
    booking: BookingDetails;
    onViewBookings: () => void;
    onCancel: () => void;
}

// Confetti particle component
const Confetti = () => {
    const confettiColors = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        left: `${particle.x}%`,
                        backgroundColor: particle.color,
                        top: '-5%',
                    }}
                    initial={{ y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                        y: ['0vh', '110vh'],
                        opacity: [1, 1, 0],
                        rotate: [0, 360 * 3],
                        x: [0, (Math.random() - 0.5) * 100],
                    }}
                    transition={{
                        duration: particle.duration,
                        delay: particle.delay,
                        ease: 'easeOut',
                    }}
                />
            ))}
        </div>
    );
};

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
    booking,
    onViewBookings,
    onCancel
}) => {
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowConfetti(false), 4000);
        return () => clearTimeout(timer);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12,
            },
        },
    };

    return (
        <motion.div
            className="booking-confirmation"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {showConfetti && <Confetti />}

            {/* Success Animation */}
            <motion.div
                className="success-animation"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: 'spring',
                    stiffness: 200,
                    damping: 15,
                    delay: 0.2,
                }}
            >
                <motion.div
                    className="checkmark-circle"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                >
                    <svg className="checkmark" viewBox="0 0 52 52">
                        <motion.circle
                            className="checkmark-circle-bg"
                            cx="26"
                            cy="26"
                            r="25"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        />
                        <motion.path
                            className="checkmark-check"
                            fill="none"
                            d="M14.1 27.2l7.1 7.2 16.7-16.8"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.4, delay: 0.8 }}
                        />
                    </svg>
                </motion.div>
            </motion.div>

            <motion.h2
                className="confirmation-title"
                variants={itemVariants}
            >
                Booking Confirmed!
            </motion.h2>
            <motion.p
                className="confirmation-subtitle"
                variants={itemVariants}
            >
                You're all set. We've sent a confirmation to your email.
            </motion.p>

            <motion.div
                className="booking-details-card"
                variants={itemVariants}
                whileHover={{
                    y: -4,
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
                }}
                transition={{ type: 'spring', stiffness: 300 }}
            >
                <motion.div
                    className="amenity-header"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1, type: 'spring' }}
                >
                    <motion.span
                        className="amenity-icon-large"
                        whileHover={{ scale: 1.2, rotate: 360 }}
                        transition={{ duration: 0.6 }}
                    >
                        {booking.amenityIcon}
                    </motion.span>
                    <div className="amenity-info">
                        <h3 className="resource-name">{booking.resourceName}</h3>
                        <p className="amenity-type">{booking.amenityName}</p>
                    </div>
                </motion.div>

                <motion.div
                    className="booking-meta"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.1,
                                delayChildren: 1.2,
                            },
                        },
                    }}
                >
                    {[
                        { icon: Calendar, label: 'Date', value: booking.date },
                        { icon: Clock, label: 'Time', value: `${booking.startTime} - ${booking.endTime}` },
                        { icon: Hash, label: 'Booking ID', value: `#${booking.bookingId.slice(0, 8)}` },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            className="meta-item"
                            variants={itemVariants}
                            whileHover={{ scale: 1.02, x: 4 }}
                        >
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.2 }}
                                transition={{ duration: 0.5 }}
                            >
                                <item.icon className="meta-icon-svg" size={20} />
                            </motion.div>
                            <div className="meta-content">
                                <span className="meta-label">{item.label}</span>
                                <span className="meta-value">{item.value}</span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.div>

            <motion.div
                className="confirmation-actions"
                variants={itemVariants}
            >
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="primary"
                        size="lg"
                        className="action-primary"
                        onClick={onViewBookings}
                    >
                        <CheckCircle2 size={18} className="mr-2" />
                        View My Bookings
                    </Button>
                </motion.div>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onCancel}
                    >
                        ❌ Cancel Booking
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div
                className="extra-actions"
                variants={itemVariants}
            >
                <motion.button
                    className="link-button"
                    whileHover={{ scale: 1.05, color: '#8B5CF6' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Mail size={16} className="mr-1" />
                    Email Confirmation
                </motion.button>
                <motion.button
                    className="link-button"
                    whileHover={{ scale: 1.05, color: '#3B82F6' }}
                    whileTap={{ scale: 0.95 }}
                >
                    <CalendarPlus size={16} className="mr-1" />
                    Add to Calendar
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default BookingConfirmation;
