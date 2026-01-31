import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system';
import './CategoryExplorer.css';

interface Amenity {
    id: string;
    icon: string;
    name: string;
    type: string;
    description: string;
    color: string;
}

interface Category {
    id: string;
    title: string;
    icon: string;
    description: string;
    amenities: Amenity[];
}

const CATEGORIES: Category[] = [
    {
        id: 'research',
        title: 'Research & Science',
        icon: '🔬',
        description: 'Elite laboratories and specialized equipment for breakthrough scientific work.',
        amenities: [
            { id: 'chem_lab', icon: '🧪', name: 'Chem Lab', type: 'lab', description: 'Fully equipped wet lab for chemical analysis.', color: '#3b82f6' },
            { id: 'bio_lab', icon: '🧬', name: 'Bio-Safety Lab', type: 'lab', description: 'BSL-2 secure environment for biological research.', color: '#10b981' },
            { id: 'physics_lab', icon: '⚛️', name: 'Physics Suite', type: 'lab', description: 'High-energy physics and mechanics laboratory.', color: '#6366f1' },
            { id: '3d_printer', icon: '🖨️', name: '3D Printer', type: 'equipment', description: 'High-precision industrial 3D printing station.', color: '#8b5cf6' },
            { id: 'spec_equip', icon: '🔬', name: 'Advanced Optics', type: 'equipment', description: 'Specialized optical measurement & imaging tools.', color: '#8b5cf6' },
            { id: 'hpc_cluster', icon: '🖥️', name: 'Compute Node', type: 'equipment', description: 'Access to high-performance computing clusters.', color: '#3b82f6' },
        ]
    },
    {
        id: 'venture',
        title: 'Venture & Business',
        icon: '🚀',
        description: 'Professional collaboration spaces designed for high-growth startups and innovators.',
        amenities: [
            { id: 'meeting_room', icon: '👥', name: 'Boardroom', type: 'room', description: 'Smart meeting room with 4K display and VC gear.', color: '#10b981' },
            { id: 'pitch_room', icon: '🎤', name: 'VC Pitch Room', type: 'room', description: 'Formal presentation room for investor meetings.', color: '#f59e0b' },
            { id: 'focus_booth', icon: '🤫', name: 'Focus Booth', type: 'room', description: 'Soundproof single-user work pod for deep deep work.', color: '#6366f1' },
            { id: 'av_studio', icon: '🎙️', name: 'AV Studio', type: 'studio', description: 'Soundproof studio for podcasts and content creation.', color: '#ec4899' },
            { id: 'hot_desk', icon: '💻', name: 'Incubator Desk', type: 'room', description: 'Dedicated desk in our co-working startup space.', color: '#3b82f6' },
            { id: 'collab_zone', icon: '🤝', name: 'Pit Stop', type: 'room', description: 'Open collaborative space for rapid brainstorming.', color: '#10b981' },
        ]
    },
    {
        id: 'academic',
        title: 'Academic Excellence',
        icon: '🎓',
        description: 'Quiet, focused learning environments for students and professional educators.',
        amenities: [
            { id: 'study_pod', icon: '📚', name: 'Study Pod', type: 'room', description: 'Private soundproof booth for deep focus study.', color: '#10b981' },
            { id: 'library_lounge', icon: '📖', name: 'Digital Library', type: 'room', description: 'Comfortable area for reading and digital research.', color: '#3b82f6' },
            { id: 'seminar_hall', icon: '🏫', name: 'Seminar Hall', type: 'room', description: 'Medium-sized hall for guest lectures and classes.', color: '#f59e0b' },
            { id: 'computer_lab', icon: '💻', name: 'Cloud Lab', type: 'lab', description: 'Workstations with high-end GPUs and AI dev tools.', color: '#3b82f6' },
            { id: 'testing_center', icon: '✏️', name: 'Testing Room', type: 'room', description: 'Secure, silent room for formal examinations.', color: '#ef4444' },
            { id: 'tutoring_room', icon: '📖', name: 'Tutoring', type: 'room', description: 'One-on-one private space for learning support.', color: '#10b981' },
        ]
    },
    {
        id: 'public',
        title: 'Public Service',
        icon: '🏛️',
        description: 'Secure, professional venues for government, administration, and public events.',
        amenities: [
            { id: 'conf_hall', icon: '🏛️', name: 'Grand Hall', type: 'room', description: 'Large capacity venue for townhalls and conferences.', color: '#10b981' },
            { id: 'press_room', icon: '📸', name: 'Press Briefing', type: 'room', description: 'Dedicated media room for official announcements.', color: '#ec4899' },
            { id: 'liaison_office', icon: '🤝', name: 'Liaison Hub', type: 'room', description: 'Front-facing office for citizen meetings.', color: '#3b82f6' },
            { id: 'secure_room', icon: '🔒', name: 'Vault Room', type: 'room', description: 'Enhanced security room for sensitive discussions.', color: '#6366f1' },
            { id: 'records_wing', icon: '🗄️', name: 'Archives', type: 'room', description: 'Secure storage and access to digital records.', color: '#94a3b8' },
            { id: 'admin_office', icon: '📋', name: 'Flex Office', type: 'room', description: 'Private administrative office for desk-based work.', color: '#10b981' },
        ]
    },
    {
        id: 'wellness',
        title: 'Health & Wellness',
        icon: '🧘',
        description: 'Facilities dedicated to physical recovery, mental clarity, and social wellbeing.',
        amenities: [
            { id: 'fitness_center', icon: '🏋️', name: 'Iron Hub', type: 'gym', description: 'Premium fitness center with Olympic-grade gear.', color: '#f59e0b' },
            { id: 'yoga_pavilion', icon: '🧘', name: 'Yoga Suite', type: 'room', description: 'Spacious, calm room for yoga and pilates.', color: '#10b981' },
            { id: 'hydro_suite', icon: '💧', name: 'Hydro Hub', type: 'room', description: 'Sauna and hydrotherapy facilities for recovery.', color: '#3b82f6' },
            { id: 'wellness_room', icon: '🕯️', name: 'Zen Zone', type: 'room', description: 'Tranquil space for meditation and mental recovery.', color: '#10b981' },
            { id: 'nutrition_clinic', icon: '🥗', name: 'Nutri-Lab', type: 'room', description: 'Consultation space for health and diet planning.', color: '#22c55e' },
            { id: 'community_space', icon: '👥', name: 'Social Lounge', type: 'room', description: 'Casual area for community networking and games.', color: '#10b981' },
        ]
    }
];


const CategoryExplorer: React.FC = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | string>('all');

    const handleBookNow = (category: Category, amenity: Amenity) => {
        // Store selected category and amenity for the booking page
        sessionStorage.setItem('onboarding_category', JSON.stringify({ id: category.id, title: category.title }));
        sessionStorage.setItem('selected_amenity_name', amenity.name);
        navigate('/dashboard');
    };

    const filteredCategories = CATEGORIES.filter(cat => {
        const matchesTab = activeTab === 'all' || cat.id === activeTab;
        const matchesSearch = cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.amenities.some(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesTab && matchesSearch;
    });

    return (
        <div className="category-explorer fade-in">
            <header className="explorer-hero">
                <h1>Discovery Explorer</h1>
                <p>Browse our entire ecosystem of world-class facilities and specialized resources.</p>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search for labs, studios, equipment..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <span className="search-icon">🔍</span>
                </div>
            </header>

            <nav className="explorer-tabs">
                <button
                    className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    All Services
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`tab-btn ${activeTab === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(cat.id)}
                    >
                        {cat.title}
                    </button>
                ))}
            </nav>

            <div className="explorer-grid">
                {filteredCategories.map(category => (
                    <section key={category.id} className="category-section">
                        <div className="category-header">
                            <span className="cat-icon-large">{category.icon}</span>
                            <div className="cat-info">
                                <h2>{category.title}</h2>
                                <p>{category.description}</p>
                            </div>
                        </div>

                        <div className="amenity-cards-grid">
                            {category.amenities
                                .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.description.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map(amenity => (
                                    <div key={amenity.id} className="amenity-explorer-card glass-card">
                                        <div className="amenity-header">
                                            <span className="amenity-icon" style={{ backgroundColor: `${amenity.color}20`, color: amenity.color }}>
                                                {amenity.icon}
                                            </span>
                                            <span className="amenity-type-badge">{amenity.type}</span>
                                        </div>
                                        <h3>{amenity.name}</h3>
                                        <p>{amenity.description}</p>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => handleBookNow(category, amenity)}
                                            className="book-btn"
                                        >
                                            Explore Slots →
                                        </Button>
                                    </div>
                                ))}
                        </div>
                    </section>
                ))}
            </div>

            {filteredCategories.length === 0 && (
                <div className="no-results">
                    <span className="no-results-icon">📂</span>
                    <h3>No matching services found</h3>
                    <p>Try searching for something else or browse another category.</p>
                    <Button variant="primary" onClick={() => { setSearchTerm(''); setActiveTab('all'); }}>
                        Show All Services
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CategoryExplorer;
