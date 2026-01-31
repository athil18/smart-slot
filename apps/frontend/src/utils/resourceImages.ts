// Resource image mapping utility
// Maps resource names to their corresponding images

export const resourceImages: Record<string, string> = {
    // Exact matches from database
    'Chemistry Lab (Suite 101)': '/images/resources/chemistry-lab.jpg',
    '3D Printing Station': '/images/resources/3d-printing.jpg',
    'Quiet Study Pod A': '/images/resources/study-pod.jpg',
    'Computer Lab (Macs)': '/images/resources/computer-lab.jpg',
    'Gym / Fitness Center': '/images/resources/gym.jpg',
    'AV Room / Podcast Studio': '/images/resources/podcast-studio.jpg',
};

// Fallback image by resource type
export const resourceImagesByType: Record<string, string> = {
    lab: '/images/resources/chemistry-lab.jpg',
    equipment: '/images/resources/3d-printing.jpg',
    room: '/images/resources/study-pod.jpg',
};

// Get image for a resource by name or type
export function getResourceImage(resourceName: string, resourceType?: string): string {
    // Try exact match first
    if (resourceImages[resourceName]) {
        return resourceImages[resourceName];
    }

    // Fallback to type-based image
    if (resourceType && resourceImagesByType[resourceType]) {
        return resourceImagesByType[resourceType];
    }

    // Default fallback
    return '/images/resources/study-pod.jpg';
}

export default resourceImages;
