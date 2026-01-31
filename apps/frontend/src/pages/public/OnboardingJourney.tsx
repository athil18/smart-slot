import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system';
import './OnboardingJourney.css';

// ==================== TYPE DEFINITIONS ====================
type OnboardingStage = 'welcome' | 'enquiry' | 'category' | 'purpose';

interface Category {
    id: string;
    icon: string;
    title: string;
    description: string;
    purposes: Purpose[];
}

interface Purpose {
    id: string;
    label: string;
    description: string;
}

// ==================== DATA DEFINITIONS ====================

const MOTIVATIONAL_QUOTES = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
];

const SERVICE_CATEGORIES: Category[] = [
    {
        id: 'research',
        icon: '🔬',
        title: 'Research & Science',
        description: 'Advanced laboratories, specialized equipment, and data analysis tools',
        purposes: [
            { id: 'r1', label: 'Laboratory Access', description: 'Book fully equipped chemistry, biology, or physics labs' },
            { id: 'r2', label: 'Equipment Rental', description: 'Reserve 3D printers, microscopes, and specialized tools' },
            { id: 'r3', label: 'Data Analysis', description: 'Access high-performance computing resources' },
            { id: 'r4', label: 'Collaborative Research', description: 'Shared research spaces for team projects' },
        ]
    },
    {
        id: 'venture',
        icon: '🚀',
        title: 'Venture & Business',
        description: 'Professional spaces for meetings, pitches, and collaboration',
        purposes: [
            { id: 'v1', label: 'Investor Meetings', description: 'Private rooms for pitch presentations' },
            { id: 'v2', label: 'Team Collaboration', description: 'Open workspaces for brainstorming sessions' },
            { id: 'v3', label: 'Content Creation', description: 'AV studios for podcast and video recording' },
            { id: 'v4', label: 'Networking Events', description: 'Event spaces for professional gatherings' },
        ]
    },
    {
        id: 'academic',
        icon: '🎓',
        title: 'Academic Excellence',
        description: 'Focused learning environments for students and educators',
        purposes: [
            { id: 'a1', label: 'Individual Study', description: 'Quiet study pods for focused work' },
            { id: 'a2', label: 'Group Projects', description: 'Collaborative spaces for team assignments' },
            { id: 'a3', label: 'Computer Lab', description: 'Access to specialized software and hardware' },
            { id: 'a4', label: 'Tutoring Sessions', description: 'Private rooms for one-on-one learning' },
        ]
    },
    {
        id: 'public',
        icon: '🏛️',
        title: 'Public Service',
        description: 'Secure and professional spaces for governance and administration',
        purposes: [
            { id: 'p1', label: 'Official Meetings', description: 'Secure conference halls for government business' },
            { id: 'p2', label: 'Public Consultations', description: 'Meeting rooms for citizen engagement' },
            { id: 'p3', label: 'Administrative Work', description: 'Private offices for sensitive tasks' },
            { id: 'p4', label: 'Training Sessions', description: 'Spaces for staff development programs' },
        ]
    },
    {
        id: 'wellness',
        icon: '🧘',
        title: 'Health & Wellness',
        description: 'Facilities for physical fitness and mental well-being',
        purposes: [
            { id: 'w1', label: 'Fitness Training', description: 'Access to gym equipment and workout spaces' },
            { id: 'w2', label: 'Yoga & Meditation', description: 'Tranquil rooms for mindfulness practice' },
            { id: 'w3', label: 'Health Consultations', description: 'Private spaces for wellness appointments' },
            { id: 'w4', label: 'Community Activities', description: 'Group spaces for social wellness programs' },
        ]
    },
];

// ==================== COMPONENT ====================

const OnboardingJourney: React.FC = () => {
    const navigate = useNavigate();
    const [stage, setStage] = useState<OnboardingStage>('welcome');
    const [quoteIndex, setQuoteIndex] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedPurpose, setSelectedPurpose] = useState<Purpose | null>(null);

    // ==================== EFFECTS ====================

    // Rotate motivational quotes
    useEffect(() => {
        if (stage === 'welcome') {
            const interval = setInterval(() => {
                setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [stage]);

    // ==================== HANDLERS ====================

    const handleCategorySelect = (category: Category) => {
        setSelectedCategory(category);
        setSelectedPurpose(null); // Reset purpose when category changes
        setStage('purpose');
    };

    const handlePurposeSelect = (purpose: Purpose) => {
        setSelectedPurpose(purpose);
    };

    const handleCompleteScreening = () => {
        if (!selectedCategory || !selectedPurpose) return;

        // Store screening data for the remaining 75% workflow
        const screeningData = {
            category: selectedCategory,
            purpose: selectedPurpose,
            completedAt: new Date().toISOString(),
            screeningPhase: '25%'
        };
        sessionStorage.setItem('onboarding_screening', JSON.stringify(screeningData));
        sessionStorage.setItem('onboarding_category', JSON.stringify(selectedCategory));
        sessionStorage.setItem('onboarding_purpose', JSON.stringify(selectedPurpose));
        sessionStorage.setItem('onboarding_complete', 'true');

        // Navigate to the dashboard (start of 75% workflow)
        navigate('/dashboard');
    };

    const getStageNumber = () => {
        const stages: OnboardingStage[] = ['welcome', 'enquiry', 'category', 'purpose'];
        return stages.indexOf(stage) + 1;
    };

    // ==================== RENDER ====================

    return (
        <div className="onboarding-journey">
            {/* Progress Indicator */}
            <div className="onboarding-progress">
                <div className="progress-info">
                    <span className="progress-label">Screening Progress</span>
                    <span className="progress-fraction">{getStageNumber()} of 4</span>
                </div>
                <div className="progress-dots">
                    {(['welcome', 'enquiry', 'category', 'purpose'] as OnboardingStage[]).map((s, i) => (
                        <div
                            key={s}
                            className={`progress-dot ${stage === s ? 'active' : ''} ${(['welcome', 'enquiry', 'category', 'purpose'] as OnboardingStage[]).indexOf(stage) > i ? 'completed' : ''
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* ==================== STAGE 1: WELCOME ==================== */}
            {stage === 'welcome' && (
                <div className="stage stage-welcome fade-in">
                    <div className="welcome-header">
                        <h1 className="welcome-title">Welcome to SmartSlot</h1>
                        <p className="welcome-subtitle">Your journey to optimized resource management begins here</p>
                    </div>

                    <div className="quote-card glass-card">
                        <blockquote className="quote-text">
                            "{MOTIVATIONAL_QUOTES[quoteIndex].text}"
                        </blockquote>
                        <cite className="quote-author">— {MOTIVATIONAL_QUOTES[quoteIndex].author}</cite>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        className="pulse-animation"
                        onClick={() => setStage('enquiry')}
                    >
                        Begin My Journey ✨
                    </Button>
                </div>
            )}

            {/* ==================== STAGE 2: ENQUIRY SETUP ==================== */}
            {stage === 'enquiry' && (
                <div className="stage stage-enquiry fade-in">
                    <div className="enquiry-content">
                        <div className="enquiry-icon">📋</div>
                        <h1>Let's Understand Your Needs</h1>
                        <p className="enquiry-subtitle">
                            We're committed to providing you with the best possible experience.
                            To serve you better, we'll ask a few quick questions about your requirements.
                        </p>

                        <div className="enquiry-benefits">
                            <div className="benefit-item">
                                <span className="benefit-icon">🎯</span>
                                <div className="benefit-text">
                                    <strong>Personalized Service</strong>
                                    <span>Tailored recommendations based on your needs</span>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">⚡</span>
                                <div className="benefit-text">
                                    <strong>Faster Booking</strong>
                                    <span>Quick access to relevant resources</span>
                                </div>
                            </div>
                            <div className="benefit-item">
                                <span className="benefit-icon">🔒</span>
                                <div className="benefit-text">
                                    <strong>Secure Process</strong>
                                    <span>Your preferences are kept confidential</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        size="lg"
                        onClick={() => setStage('category')}
                    >
                        Continue →
                    </Button>
                </div>
            )}

            {/* ==================== STAGE 3: CATEGORY SELECTION ==================== */}
            {stage === 'category' && (
                <div className="stage stage-category fade-in">
                    <h1>Select Your Service Category</h1>
                    <p className="category-subtitle">Choose the area that best matches your requirements</p>

                    <div className="category-grid">
                        {SERVICE_CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                className="category-card glass-card"
                                onClick={() => handleCategorySelect(category)}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <h3 className="category-title">{category.title}</h3>
                                <p className="category-description">{category.description}</p>
                                <span className="category-count">{category.purposes.length} options</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ==================== STAGE 4: PURPOSE SELECTION ==================== */}
            {stage === 'purpose' && selectedCategory && (
                <div className="stage stage-purpose fade-in">
                    <div className="purpose-header">
                        <button className="back-button" onClick={() => setStage('category')}>
                            ← Back to Categories
                        </button>
                        <div className="selected-category-badge">
                            <span>{selectedCategory.icon}</span>
                            <span>{selectedCategory.title}</span>
                        </div>
                    </div>

                    <h1>What's Your Purpose?</h1>
                    <p className="purpose-subtitle">Select the specific service you're looking for</p>

                    <div className="purpose-list">
                        {selectedCategory.purposes.map((purpose) => (
                            <button
                                key={purpose.id}
                                className={`purpose-card glass-card ${selectedPurpose?.id === purpose.id ? 'selected' : ''}`}
                                onClick={() => handlePurposeSelect(purpose)}
                            >
                                <div className="purpose-radio">
                                    {selectedPurpose?.id === purpose.id && <span className="radio-check">✓</span>}
                                </div>
                                <div className="purpose-content">
                                    <h3 className="purpose-label">{purpose.label}</h3>
                                    <p className="purpose-description">{purpose.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Screening Complete Section */}
                    <div className="screening-complete-section">
                        <div className="screening-divider">
                            <span>25% Screening Complete</span>
                        </div>
                        <p className="screening-note">
                            Your selections will be used to personalize your experience in the next phase.
                        </p>
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={!selectedPurpose}
                            onClick={handleCompleteScreening}
                        >
                            Continue to Booking →
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OnboardingJourney;
