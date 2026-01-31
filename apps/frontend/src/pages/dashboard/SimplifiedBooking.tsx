import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Button } from '../../design-system';
import AmenityCard from '../../components/booking/AmenityCard';
import TimeSlotPicker from '../../components/booking/TimeSlotPicker';
import BookingConfirmation from '../../components/booking/BookingConfirmation';
import { VerificationBanner } from '../../components/VerificationBanner';
import './SimplifiedBooking.css';

interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    resource?: {
        id: string;
        name: string;
        type: string;
    };
}

interface Amenity {
    icon: string;
    name: string;
    type: string;
    color: string;
}

interface SimplifiedBookingProps {
    accessible?: boolean;
}

const SimplifiedBooking: React.FC<SimplifiedBookingProps> = ({ accessible = false }) => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    // Booking flow state
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);
    const [selectedDate, setSelectedDate] = useState(0); // Index in days array
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

    // Data state
    const [amenities, setAmenities] = useState<Amenity[]>([]);
    const [currentCategoryName, setCurrentCategoryName] = useState<string>('');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false);

    // Generate next 7 days
    const days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
            date,
            label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
    });

    // Define amenities based on user role OR onboarding category
    useEffect(() => {
        const roleAmenities: Record<string, Amenity[]> = {
            research: [
                { icon: '🧪', name: 'Chem Lab', type: 'lab', color: '#3b82f6' },
                { icon: '🧬', name: 'Bio-Safety Lab', type: 'lab', color: '#10b981' },
                { icon: '⚛️', name: 'Physics Suite', type: 'lab', color: '#6366f1' },
                { icon: '🖨️', name: '3D Printer', type: 'equipment', color: '#8b5cf6' },
                { icon: '🔬', name: 'Advanced Optics', type: 'equipment', color: '#8b5cf6' },
                { icon: '🖥️', name: 'Compute Node', type: 'equipment', color: '#3b82f6' },
            ],
            venture: [
                { icon: '👥', name: 'Boardroom', type: 'room', color: '#10b981' },
                { icon: '🎤', name: 'VC Pitch Room', type: 'room', color: '#f59e0b' },
                { icon: '🤫', name: 'Focus Booth', type: 'room', color: '#6366f1' },
                { icon: '🎙️', name: 'AV Studio', type: 'studio', color: '#ec4899' },
                { icon: '💻', name: 'Incubator Desk', type: 'room', color: '#3b82f6' },
                { icon: '🤝', name: 'Pit Stop', type: 'room', color: '#10b981' },
            ],
            academic: [
                { icon: '📚', name: 'Study Pod', type: 'room', color: '#10b981' },
                { icon: '📖', name: 'Digital Library', type: 'room', color: '#3b82f6' },
                { icon: '🏫', name: 'Seminar Hall', type: 'room', color: '#f59e0b' },
                { icon: '💻', name: 'Cloud Lab', type: 'lab', color: '#3b82f6' },
                { icon: '✏️', name: 'Testing Room', type: 'room', color: '#ef4444' },
                { icon: '📖', name: 'Tutoring', type: 'room', color: '#10b981' },
            ],
            public: [
                { icon: '🏛️', name: 'Grand Hall', type: 'room', color: '#10b981' },
                { icon: '📸', name: 'Press Briefing', type: 'room', color: '#ec4899' },
                { icon: '🤝', name: 'Liaison Hub', type: 'room', color: '#3b82f6' },
                { icon: '🔒', name: 'Vault Room', type: 'room', color: '#6366f1' },
                { icon: '🗄️', name: 'Archives', type: 'room', color: '#94a3b8' },
                { icon: '📋', name: 'Flex Office', type: 'room', color: '#10b981' },
            ],
            wellness: [
                { icon: '🏋️', name: 'Iron Hub', type: 'gym', color: '#f59e0b' },
                { icon: '🧘', name: 'Yoga Suite', type: 'room', color: '#10b981' },
                { icon: '💧', name: 'Hydro Hub', type: 'room', color: '#3b82f6' },
                { icon: '🕯️', name: 'Zen Zone', type: 'room', color: '#10b981' },
                { icon: '🥗', name: 'Nutri-Lab', type: 'room', color: '#22c55e' },
                { icon: '👥', name: 'Social Lounge', type: 'room', color: '#10b981' },
            ],
            student: [
                { icon: '📚', name: 'Study Pod', type: 'room', color: '#10b981' },
                { icon: '💻', name: 'Cloud Lab', type: 'lab', color: '#3b82f6' },
                { icon: '🏋️', name: 'Iron Hub', type: 'gym', color: '#f59e0b' }
            ],
            staff: [
                { icon: '👥', name: 'Boardroom', type: 'room', color: '#10b981' },
                { icon: '📋', name: 'Flex Office', type: 'room', color: '#10b981' },
                { icon: '📖', name: 'Tutoring', type: 'room', color: '#10b981' }
            ],
            default: [
                { icon: '📚', name: 'Study Pod', type: 'room', color: '#10b981' },
                { icon: '💻', name: 'Cloud Lab', type: 'lab', color: '#3b82f6' },
                { icon: '🎙️', name: 'AV Studio', type: 'studio', color: '#ec4899' }
            ]
        };

        // Check for onboarding category first
        const onboardingCategoryStr = sessionStorage.getItem('onboarding_category');
        let currentAmenities: Amenity[] = [];

        if (onboardingCategoryStr) {
            try {
                const category = JSON.parse(onboardingCategoryStr);
                currentAmenities = roleAmenities[category.id] || roleAmenities.default;
                setCurrentCategoryName(category.title || category.id.charAt(0).toUpperCase() + category.id.slice(1));
            } catch (e) {
                console.error('Failed to parse onboarding category', e);
            }
        } else {
            // Fall back to user role
            const userRole = user?.role || 'default';
            currentAmenities = roleAmenities[userRole] || roleAmenities.default;
            setCurrentCategoryName(userRole.charAt(0).toUpperCase() + userRole.slice(1) + ' Services');
        }

        setAmenities(currentAmenities);

        // Auto-select amenity if coming from Explorer
        const selectedAmenityName = sessionStorage.getItem('selected_amenity_name');
        if (selectedAmenityName && currentAmenities.length > 0) {
            const found = currentAmenities.find(a => a.name === selectedAmenityName);
            if (found) {
                setSelectedAmenity(found);
                setStep(2);
                sessionStorage.removeItem('selected_amenity_name'); // Clear after use
            }
        }
    }, [user]);

    // Recover pending booking after auth
    useEffect(() => {
        const pending = sessionStorage.getItem('pending_booking');
        if (pending && user && step === 1) {
            try {
                const state = JSON.parse(pending);
                setSelectedAmenity(state.selectedAmenity);
                setSelectedSlotId(state.selectedSlotId);
                setSelectedDate(state.selectedDate);
                setStep(state.step);
                addToast('Resuming your booking...', 'info');
                // We don't automatically confirm to give user one last look at the selection
            } catch (e) {
                console.error('Failed to parse pending booking', e);
                sessionStorage.removeItem('pending_booking');
            }
        }
    }, [user, step]);

    // Fetch slots when amenity and date change
    useEffect(() => {
        if (selectedAmenity && step === 2) {
            fetchSlots();
        }
    }, [selectedAmenity, selectedDate, step]);

    const fetchSlots = async () => {
        if (!selectedAmenity) return;

        try {
            setLoading(true);
            const targetDate = days[selectedDate].date.toISOString().split('T')[0];
            const response = await apiClient.get(`/slots?date=${targetDate}&status=available`);

            // Filter by amenity type OR partial name match for uniqueness
            const filtered = (response.data.data || []).filter((slot: Slot) => {
                const nameMatch = slot.resource?.name?.toLowerCase().includes(selectedAmenity.name.toLowerCase().split(' ')[0]);
                const typeMatch = slot.resource?.type === selectedAmenity.type;
                return nameMatch || typeMatch;
            });

            setSlots(filtered);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
            setSlots([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAmenitySelect = (amenity: Amenity) => {
        setSelectedAmenity(amenity);
        setStep(2);
    };

    const handleSlotSelect = async (slotId: string) => {
        setSelectedSlotId(slotId);
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlotId || !selectedAmenity) return;

        // AUTH GATE: Trigger only at the point of booking confirmation
        if (!user) {
            addToast('Please sign in to complete your booking', 'info');

            // Save current booking state to session for recovery after login
            const bookingState = {
                selectedAmenity,
                selectedSlotId,
                selectedDate,
                step: 2 // Return to confirmation step
            };
            sessionStorage.setItem('pending_booking', JSON.stringify(bookingState));

            // Redirect to login with current path for return
            navigate('/login', { state: { from: { pathname: '/dashboard' } } });
            return;
        }

        try {
            setBookingInProgress(true);
            const response = await apiClient.post('/appointments', {
                slotId: selectedSlotId,
                priority: 'normal',
                notes: `Booked via ${accessible ? 'Accessible' : 'Simplified'} interface - ${selectedAmenity.name}`
            });

            const slot = slots.find(s => s.id === selectedSlotId);
            if (slot) {
                setConfirmedBooking({
                    amenityIcon: selectedAmenity.icon,
                    amenityName: selectedAmenity.name,
                    resourceName: slot.resource?.name || selectedAmenity.name,
                    date: days[selectedDate].fullDate,
                    startTime: formatTime(slot.startTime),
                    endTime: formatTime(slot.endTime),
                    bookingId: response.data.data?.id || 'unknown'
                });
                setStep(3);
                addToast('Booking confirmed successfully!', 'success');
                sessionStorage.removeItem('pending_booking'); // Clear after success
            }
        } catch (error: any) {
            console.error('Booking failed:', error);
            const errorMessage = error?.response?.data?.error?.message
                || error?.message
                || 'Booking failed. Please try again.';

            addToast(`❌ ${errorMessage}`, 'error');
        } finally {
            setBookingInProgress(false);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Guided mode for first-time visitors or those coming from onboarding
    const [guided, setGuided] = useState(false);

    useEffect(() => {
        const isFirstTime = !sessionStorage.getItem('booking_tutorial_seen');
        if (isFirstTime || sessionStorage.getItem('onboarding_complete')) {
            setGuided(true);
        }
    }, []);

    const completeGuide = () => {
        setGuided(false);
        sessionStorage.setItem('booking_tutorial_seen', 'true');
    };

    const resetBooking = () => {
        setStep(1);
        setSelectedAmenity(null);
        setSelectedDate(0);
        setSelectedSlotId(null);
        setConfirmedBooking(null);
    };

    const getGuidedMessage = () => {
        switch (step) {
            case 1: return "Step 1: Choose the service or facility you'd like to reserve.";
            case 2: return "Step 2: Select your preferred date and time from the available slots.";
            case 3: return "Success! Your reservation is confirmed. See you then!";
            default: return "";
        }
    };


    return (
        <div className={`simplified-booking ${accessible ? 'accessible-mode' : ''}`}>
            {(user?.verificationStatus === 'pending' || user?.verificationStatus === 'rejected') && (
                <VerificationBanner
                    status={user.verificationStatus as 'pending' | 'rejected'}
                    reason={user.rejectionReason}
                />
            )}

            {/* Guided Flow Banner */}
            {guided && (
                <div className="guided-banner slide-down">
                    <div className="guided-content">
                        <span className="guided-badge">GUIDED MODE</span>
                        <p className="guided-text">{getGuidedMessage()}</p>
                    </div>
                    <button className="close-guide-btn" onClick={completeGuide}>×</button>
                </div>
            )}

            {/* Progress Indicator */}
            <div className="progress-steps">
                <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Choose</span>
                </div>
                <div className="step-line" />
                <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Time</span>
                </div>
                <div className="step-line" />
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Done</span>
                </div>
            </div>

            {/* Step 1: Amenity Selection */}
            {step === 1 && (
                <div className="step-container fade-in">
                    <div className="step-header">
                        <div className="title-group">
                            <h1 className="step-title">What do you need?</h1>
                            <p className="step-subtitle">Showing {currentCategoryName}</p>
                        </div>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/explorer')}
                            className="explorer-link-btn"
                        >
                            🌐 Discover All Services
                        </Button>
                    </div>

                    <div className="category-switcher">
                        {Object.keys({ research: 1, venture: 1, academic: 1, public: 1, wellness: 1 }).map(catId => (
                            <button
                                key={catId}
                                className={`cat-switch-btn ${currentCategoryName.toLowerCase().includes(catId) ? 'active' : ''}`}
                                onClick={() => {
                                    const titles: any = { research: 'Research', venture: 'Venture', academic: 'Academic', public: 'Public', wellness: 'Wellness' };
                                    sessionStorage.setItem('onboarding_category', JSON.stringify({ id: catId, title: titles[catId] }));
                                    window.dispatchEvent(new Event('storage')); // Trigger re-render if needed or just use state
                                    // Actually, let's just update state directly for better UX
                                    const roleAmenities: any = {
                                        research: [
                                            { icon: '🧪', name: 'Chem Lab', type: 'lab', color: '#3b82f6' },
                                            { icon: '🧬', name: 'Bio-Safety Lab', type: 'lab', color: '#10b981' },
                                            { icon: '⚛️', name: 'Physics Suite', type: 'lab', color: '#6366f1' },
                                            { id: '3d_printer', icon: '🖨️', name: '3D Printer', type: 'equipment', color: '#8b5cf6' },
                                            { id: 'spec_equip', icon: '🔬', name: 'Advanced Optics', type: 'equipment', color: '#8b5cf6' },
                                            { id: 'hpc_cluster', icon: '🖥️', name: 'Compute Node', type: 'equipment', color: '#3b82f6' },
                                        ],
                                        venture: [
                                            { icon: '👥', name: 'Boardroom', type: 'room', color: '#10b981' },
                                            { icon: '🎤', name: 'VC Pitch Room', type: 'room', color: '#f59e0b' },
                                            { icon: '🤫', name: 'Focus Booth', type: 'room', color: '#6366f1' },
                                            { icon: '🎙️', name: 'AV Studio', type: 'studio', color: '#ec4899' },
                                            { icon: '💻', name: 'Incubator Desk', type: 'room', color: '#3b82f6' },
                                            { icon: '🤝', name: 'Pit Stop', type: 'room', color: '#10b981' },
                                        ],
                                        academic: [
                                            { icon: '📚', name: 'Study Pod', type: 'room', color: '#10b981' },
                                            { icon: '📖', name: 'Digital Library', type: 'room', color: '#3b82f6' },
                                            { icon: '🏫', name: 'Seminar Hall', type: 'room', color: '#f59e0b' },
                                            { icon: '💻', name: 'Cloud Lab', type: 'lab', color: '#3b82f6' },
                                            { icon: '✏️', name: 'Testing Room', type: 'room', color: '#ef4444' },
                                            { icon: '📖', name: 'Tutoring', type: 'room', color: '#10b981' },
                                        ],
                                        public: [
                                            { icon: '🏛️', name: 'Grand Hall', type: 'room', color: '#10b981' },
                                            { icon: '📸', name: 'Press Briefing', type: 'room', color: '#ec4899' },
                                            { icon: '🤝', name: 'Liaison Hub', type: 'room', color: '#3b82f6' },
                                            { icon: '🔒', name: 'Vault Room', type: 'room', color: '#6366f1' },
                                            { icon: '🗄️', name: 'Archives', type: 'room', color: '#94a3b8' },
                                            { icon: '📋', name: 'Flex Office', type: 'room', color: '#10b981' },
                                        ],
                                        wellness: [
                                            { icon: '🏋️', name: 'Iron Hub', type: 'gym', color: '#f59e0b' },
                                            { icon: '🧘', name: 'Yoga Suite', type: 'room', color: '#10b981' },
                                            { icon: '💧', name: 'Hydro Hub', type: 'room', color: '#3b82f6' },
                                            { icon: '🕯️', name: 'Zen Zone', type: 'room', color: '#10b981' },
                                            { icon: '🥗', name: 'Nutri-Lab', type: 'room', color: '#22c55e' },
                                            { icon: '👥', name: 'Social Lounge', type: 'room', color: '#10b981' },
                                        ]
                                    };
                                    setAmenities(roleAmenities[catId]);
                                    setCurrentCategoryName(titles[catId]);
                                }}
                            >
                                {catId.charAt(0).toUpperCase() + catId.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="amenity-grid">
                        {amenities.map((amenity, index) => (
                            <AmenityCard
                                key={index}
                                icon={amenity.icon}
                                name={amenity.name}
                                type={amenity.type}
                                available={Math.floor(Math.random() * 10) + 1} // Mock availability
                                color={amenity.color}
                                onSelect={() => handleAmenitySelect(amenity)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Step 2: Time Selection */}
            {step === 2 && selectedAmenity && (
                <div className="step-container fade-in">
                    <button className="back-button" onClick={() => setStep(1)}>
                        ← Back
                    </button>

                    <div className="selected-amenity-banner">
                        <span className="banner-icon">{selectedAmenity.icon}</span>
                        <span className="banner-text">{selectedAmenity.name}</span>
                    </div>

                    <h1 className="step-title">When do you need it?</h1>

                    {/* Date Selector */}
                    <div className="date-selector">
                        {days.slice(0, 5).map((day, index) => (
                            <button
                                key={index}
                                className={`date-btn ${selectedDate === index ? 'active' : ''}`}
                                onClick={() => setSelectedDate(index)}
                            >
                                <span className="date-label">{day.label}</span>
                                <span className="date-value">{day.fullDate.split(',')[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Time Slots */}
                    {loading ? (
                        <div className="loading-message">Finding available times...</div>
                    ) : slots.length > 0 ? (
                        <>
                            <TimeSlotPicker
                                slots={slots.map(slot => ({
                                    id: slot.id,
                                    time: slot.startTime,
                                    displayTime: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
                                    available: true
                                }))}
                                selectedSlotId={selectedSlotId}
                                onSelect={handleSlotSelect}
                            />

                            {selectedSlotId && (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    className="confirm-slot-btn"
                                    onClick={handleConfirmBooking}
                                    disabled={bookingInProgress}
                                >
                                    {bookingInProgress ? 'Booking...' : '✓ Confirm Booking'}
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="empty-message">
                            <span className="empty-icon">📭</span>
                            <p>No {selectedAmenity.name} available on {days[selectedDate].label}</p>
                            <p className="empty-hint">Try a different day</p>
                        </div>
                    )}
                </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && confirmedBooking && (
                <div className="step-container fade-in">
                    <BookingConfirmation
                        booking={confirmedBooking}
                        onViewBookings={() => navigate('/appointments')}
                        onCancel={resetBooking}
                    />
                </div>
            )}

            {/* Help Section for Accessible Mode */}
            {accessible && step < 3 && (
                <div className="help-banner">
                    <span className="help-icon">❓</span>
                    <span className="help-text">Need assistance?</span>
                    <Button variant="secondary" size="sm">
                        📞 Call Support
                    </Button>
                </div>
            )}
        </div>
    );
};

export default SimplifiedBooking;
