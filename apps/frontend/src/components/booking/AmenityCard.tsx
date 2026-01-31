import React from 'react';
import { motion } from 'framer-motion';
import './AmenityCard.css';

interface AmenityCardProps {
    icon: string;        // Emoji icon
    name: string;        // "Study Pod", "Computer Lab"
    type: string;        // "room", "lab", "equipment"
    available: number;   // Available slots count
    color: string;       // Color accent (hex)
    onSelect: () => void;
}

// Map amenity types to image filenames
const getImageForType = (type: string, name: string): string => {
    // Try to match by name first
    const nameLower = name.toLowerCase();
    if (nameLower.includes('study') || nameLower.includes('pod')) {
        return '/images/resources/study-pod.jpg';
    }
    if (nameLower.includes('3d') || nameLower.includes('print')) {
        return '/images/resources/3d-printing.jpg';
    }
    if (nameLower.includes('chem') || nameLower.includes('lab') || nameLower.includes('science')) {
        return '/images/resources/chemistry-lab.jpg';
    }
    if (nameLower.includes('computer') || nameLower.includes('mac')) {
        return '/images/resources/computer-lab.jpg';
    }
    if (nameLower.includes('gym') || nameLower.includes('fitness')) {
        return '/images/resources/gym.jpg';
    }
    if (nameLower.includes('av') || nameLower.includes('studio') || nameLower.includes('podcast')) {
        return '/images/resources/podcast-studio.jpg';
    }

    // Fallback by type
    const typeMap: Record<string, string> = {
        'room': '/images/resources/study-pod.jpg',
        'lab': '/images/resources/chemistry-lab.jpg',
        'equipment': '/images/resources/3d-printing.jpg',
        'studio': '/images/resources/podcast-studio.jpg',
        'gym': '/images/resources/gym.jpg',
    };

    return typeMap[type] || '/images/resources/study-pod.jpg';
};

const AmenityCard: React.FC<AmenityCardProps> = ({
    icon,
    name,
    type,
    available,
    color,
    onSelect
}) => {
    const imageUrl = getImageForType(type, name);
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <motion.button
            className={`amenity-card amenity-type-${type}`}
            onClick={onSelect}
            style={{ borderColor: color }}
            aria-label={`Book ${name}, ${available} slots available`}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                scale: 1.05,
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 20 }
            }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="amenity-image-container"
                animate={{
                    scale: isHovered ? 1.1 : 1,
                }}
                transition={{ duration: 0.4 }}
            >
                {!imageError ? (
                    <>
                        {!imageLoaded && (
                            <motion.div
                                className="amenity-icon-fallback"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                {icon}
                            </motion.div>
                        )}
                        <motion.img
                            src={imageUrl}
                            alt={name}
                            className={`amenity-background-image ${imageLoaded ? 'loaded' : ''}`}
                            onLoad={() => setImageLoaded(true)}
                            onError={() => setImageError(true)}
                            loading="lazy"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: imageLoaded ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                        />
                        <motion.div
                            className="amenity-overlay"
                            animate={{
                                opacity: isHovered ? 0.3 : 0.6,
                            }}
                            transition={{ duration: 0.3 }}
                        />
                    </>
                ) : (
                    <motion.div
                        className="amenity-icon-fallback"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                    >
                        {icon}
                    </motion.div>
                )}
            </motion.div>
            <motion.div
                className="amenity-icon"
                animate={{
                    scale: isHovered ? 1.2 : 1,
                    rotate: isHovered ? 360 : 0,
                }}
                transition={{
                    scale: { duration: 0.3 },
                    rotate: { duration: 0.6, ease: "easeInOut" }
                }}
            >
                {icon}
            </motion.div>
            <motion.div
                className="amenity-name"
                animate={{
                    y: isHovered ? -2 : 0,
                }}
                transition={{ duration: 0.2 }}
            >
                {name}
            </motion.div>
            <motion.div
                className="amenity-badge"
                style={{ backgroundColor: `${color}33` }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                whileHover={{
                    scale: 1.1,
                    backgroundColor: `${color}55`,
                }}
            >
                <motion.span
                    className="available-count"
                    animate={{
                        scale: isHovered ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                >
                    {available}
                </motion.span>
                <span className="available-label">available</span>
            </motion.div>
        </motion.button>
    );
};

export default AmenityCard;
