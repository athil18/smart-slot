import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import { Button } from '../../design-system';
import { VerificationBanner } from '../../components/VerificationBanner';
import './VIPDashboard.css';

interface VIPSlot {
    id: string;
    startTime: string;
    endTime: string;
    resource?: { name: string; type: string };
    isReserved: boolean;
}

interface AuditEntry {
    id: string;
    action: string;
    timestamp: string;
    details: string;
}

const VIPDashboard: React.FC = () => {
    const { user } = useAuth();
    const [vipSlots, setVipSlots] = useState<VIPSlot[]>([]);
    const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
    const [delegateEmail, setDelegateEmail] = useState('');
    const [showDelegateModal, setShowDelegateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVIPSlots();
        fetchAuditLog();
    }, []);

    const fetchVIPSlots = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/slots?status=available');
            // Simulate VIP reserved slots
            const slots = (response.data.data || []).slice(0, 6).map((slot: any, i: number) => ({
                ...slot,
                isReserved: i < 2 // First 2 are VIP reserved
            }));
            setVipSlots(slots);
        } catch (error) {
            console.error('Failed to fetch VIP slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAuditLog = async () => {
        // Simulated audit log for demonstration
        setAuditLog([
            { id: '1', action: 'Booking Created', timestamp: new Date().toISOString(), details: 'Conference Room A - 2:00 PM' },
            { id: '2', action: 'Delegate Added', timestamp: new Date(Date.now() - 86400000).toISOString(), details: 'jane.doe@gov.org' },
            { id: '3', action: 'Booking Modified', timestamp: new Date(Date.now() - 172800000).toISOString(), details: 'Changed from 3:00 PM to 4:00 PM' },
        ]);
    };

    const handleDelegateBooking = async () => {
        if (!delegateEmail) {
            alert('Please enter delegate email');
            return;
        }
        alert(`✅ Delegate booking permission granted to ${delegateEmail}`);
        setShowDelegateModal(false);
        setDelegateEmail('');
    };

    const handleQuickBook = async (slotId: string) => {
        try {
            await apiClient.post('/appointments', {
                slotId,
                priority: 'urgent',
                notes: 'VIP Priority Booking'
            });
            alert('✅ VIP Slot booked successfully!');
            fetchVIPSlots();
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
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="vip-dashboard">
            {(user?.verificationStatus === 'pending' || user?.verificationStatus === 'rejected') && (
                <VerificationBanner
                    status={user.verificationStatus as 'pending' | 'rejected'}
                    reason={user.rejectionReason}
                />
            )}
            {/* VIP Header */}
            <div className="vip-header">
                <div className="vip-title">
                    <span className="vip-badge">🏛️ VIP</span>
                    <h1>Executive Dashboard</h1>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" onClick={() => setShowDelegateModal(true)}>
                        👤 Manage Delegates
                    </Button>
                    <Button variant="primary">
                        📞 Contact Admin
                    </Button>
                </div>
            </div>

            {/* VIP Hero Banner */}
            <div className="vip-hero-banner">
                <img
                    src="/images/vip/executive-lounge.jpg"
                    alt=""
                    className="vip-hero-image"
                    aria-hidden="true"
                />
                <div className="vip-hero-overlay"></div>
                <div className="vip-hero-content">
                    <img
                        src="/images/vip/vip-pass.jpg"
                        alt="VIP Access"
                        className="vip-pass-image"
                    />
                    <div className="vip-hero-text">
                        <h2>Priority Access Enabled</h2>
                        <p>Your executive privileges grant you instant booking and dedicated support</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="vip-stats">
                <div className="stat-card gold">
                    <span className="stat-icon">⭐</span>
                    <div>
                        <span className="stat-value">2</span>
                        <span className="stat-label">Reserved Slots</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">📅</span>
                    <div>
                        <span className="stat-value">5</span>
                        <span className="stat-label">This Week</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">👥</span>
                    <div>
                        <span className="stat-value">1</span>
                        <span className="stat-label">Active Delegate</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-icon">⚡</span>
                    <div>
                        <span className="stat-value">Instant</span>
                        <span className="stat-label">Priority Access</span>
                    </div>
                </div>
            </div>

            {/* VIP Reserved Slots */}
            <div className="vip-section">
                <h2>🔒 Your Reserved Slots</h2>
                <p className="section-subtitle">These slots are exclusively held for your priority access</p>

                {loading ? (
                    <div className="loading-state">Loading your slots...</div>
                ) : (
                    <div className="vip-slots-grid">
                        {vipSlots.filter(s => s.isReserved).map(slot => (
                            <div key={slot.id} className="vip-slot-card reserved">
                                <div className="slot-badge">RESERVED</div>
                                <div className="slot-datetime">
                                    <span className="slot-date">{formatDate(slot.startTime)}</span>
                                    <span className="slot-time">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                                </div>
                                <div className="slot-resource">{slot.resource?.name || 'Executive Suite'}</div>
                                <Button variant="primary" size="sm" onClick={() => handleQuickBook(slot.id)}>
                                    Confirm Booking
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Available Priority Slots */}
            <div className="vip-section">
                <h2>⚡ Available Priority Slots</h2>
                <div className="vip-slots-grid">
                    {vipSlots.filter(s => !s.isReserved).map(slot => (
                        <div key={slot.id} className="vip-slot-card">
                            <div className="slot-datetime">
                                <span className="slot-date">{formatDate(slot.startTime)}</span>
                                <span className="slot-time">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                            </div>
                            <div className="slot-resource">{slot.resource?.name || 'Conference Room'}</div>
                            <Button variant="secondary" size="sm" onClick={() => handleQuickBook(slot.id)}>
                                Quick Book
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Audit Trail */}
            <div className="vip-section audit-section">
                <h2>📋 Your Activity Log</h2>
                <p className="section-subtitle">Personal audit trail (visible only to you)</p>
                <div className="audit-list">
                    {auditLog.map(entry => (
                        <div key={entry.id} className="audit-entry">
                            <div className="audit-icon">
                                {entry.action.includes('Created') ? '✅' :
                                    entry.action.includes('Delegate') ? '👤' : '✏️'}
                            </div>
                            <div className="audit-content">
                                <span className="audit-action">{entry.action}</span>
                                <span className="audit-details">{entry.details}</span>
                            </div>
                            <span className="audit-time">{formatDate(entry.timestamp)}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Delegate Modal */}
            {showDelegateModal && (
                <div className="modal-overlay" onClick={() => setShowDelegateModal(false)}>
                    <div className="delegate-modal" onClick={e => e.stopPropagation()}>
                        <h3>Add Delegate</h3>
                        <p>Grant booking permission to a staff member</p>
                        <input
                            type="email"
                            placeholder="delegate@organization.gov"
                            value={delegateEmail}
                            onChange={(e) => setDelegateEmail(e.target.value)}
                            className="delegate-input"
                        />
                        <div className="modal-actions">
                            <Button variant="secondary" onClick={() => setShowDelegateModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleDelegateBooking}>
                                Grant Access
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VIPDashboard;
