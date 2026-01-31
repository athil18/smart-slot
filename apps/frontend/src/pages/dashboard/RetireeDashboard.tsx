import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { Button } from '../../design-system';
import { VerificationBanner } from '../../components/VerificationBanner';
import './RetireeDashboard.css';

interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    resource?: { name: string; type: string };
}

const RetireeDashboard: React.FC = () => {
    const { user } = useAuth();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAvailableSlots();
    }, []);

    const fetchAvailableSlots = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/slots?status=available');
            // Get slots relevant for retirees
            const allSlots = response.data.data || [];
            setSlots(allSlots.slice(0, 6));
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (slotId: string) => {
        try {
            await apiClient.post('/appointments', { slotId });
            alert('✅ Booking successful!');
            fetchAvailableSlots();
        } catch (error: any) {
            const errorMessage = error?.response?.data?.error?.message
                || 'Booking failed. Please try again.';
            alert(`❌ ${errorMessage}`);
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="retiree-dashboard">
            {(user?.verificationStatus === 'pending' || user?.verificationStatus === 'rejected') && (
                <VerificationBanner
                    status={user.verificationStatus as 'pending' | 'rejected'}
                    reason={user.rejectionReason}
                />
            )}

            {/* Welcome Header */}
            <div className="retiree-header">
                <h1>Welcome, {user?.name?.split(' ')[0] || 'Friend'}</h1>
                <p className="header-subtitle">Your wellness journey starts here</p>
            </div>

            {/* Hero Image Gallery */}
            <div className="retiree-hero-gallery">
                <div className="hero-card main">
                    <img
                        src="/images/retiree/couple.jpg"
                        alt="Happy retired couple enjoying autumn"
                        className="hero-image"
                    />
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <span className="hero-tag">Featured</span>
                        <h2>Community Activities</h2>
                        <p>Join our vibrant community programs</p>
                    </div>
                </div>
                <div className="hero-card secondary">
                    <img
                        src="/images/retiree/veteran.jpg"
                        alt="Proud veteran"
                        className="hero-image"
                    />
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <span className="hero-tag">Veterans</span>
                        <h3>Veteran Services</h3>
                    </div>
                </div>
                <div className="hero-card secondary">
                    <img
                        src="/images/retiree/beach-walk.jpg"
                        alt="Peaceful beach walk"
                        className="hero-image"
                    />
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <span className="hero-tag">Wellness</span>
                        <h3>Outdoor Activities</h3>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="retiree-stats">
                <div className="stat-card">
                    <span className="stat-icon">🌞</span>
                    <div className="stat-info">
                        <span className="stat-value">{slots.length}</span>
                        <span className="stat-label">Available Sessions</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <div className="stat-info">
                        <span className="stat-value">2</span>
                        <span className="stat-label">Upcoming</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">❤️</span>
                    <div className="stat-info">
                        <span className="stat-value">5</span>
                        <span className="stat-label">This Month</span>
                    </div>
                </div>
            </div>

            {/* Available Slots */}
            <div className="retiree-section">
                <h2>📋 Available Sessions</h2>
                <p className="section-subtitle">Easy booking with just one click</p>

                {loading ? (
                    <div className="loading-message">Finding available sessions...</div>
                ) : (
                    <div className="slots-grid">
                        {slots.map(slot => (
                            <div key={slot.id} className="slot-card">
                                <div className="slot-datetime">
                                    <span className="slot-date">{formatDate(slot.startTime)}</span>
                                    <span className="slot-time">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                </div>
                                <div className="slot-resource">{slot.resource?.name || 'General Session'}</div>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => handleBook(slot.id)}
                                >
                                    Book Now
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Help Section */}
            <div className="retiree-help">
                <div className="help-card">
                    <span className="help-icon">📞</span>
                    <h3>Need Assistance?</h3>
                    <p>Our friendly staff is here to help</p>
                    <Button variant="secondary">Call Support</Button>
                </div>
                <div className="help-card">
                    <span className="help-icon">🏠</span>
                    <h3>Home Visits</h3>
                    <p>Request a home visit appointment</p>
                    <Button variant="secondary">Request Visit</Button>
                </div>
            </div>
        </div>
    );
};

export default RetireeDashboard;
