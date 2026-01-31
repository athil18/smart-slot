import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { Button } from '../../design-system';
import { VerificationBanner } from '../../components/VerificationBanner';
import './AdvancedBooking.css';

interface Resource {
    id: string;
    name: string;
    type: string;
    capacity: number;
}

interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    status: string;
    resource?: Resource;
    staff?: { name: string };
}

const AdvancedBooking: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [slots, setSlots] = useState<Slot[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringWeeks, setRecurringWeeks] = useState(4);
    const [filterType, setFilterType] = useState<string>('all');

    useEffect(() => {
        fetchResources();
        fetchSlots();
    }, [filterType, dateRange]);

    // Recover pending advanced booking after auth
    useEffect(() => {
        const pending = sessionStorage.getItem('pending_advanced_booking');
        if (pending && user) {
            try {
                const state = JSON.parse(pending);
                setSelectedSlots(state.selectedSlots);
                setFilterType(state.filterType);
                setDateRange(state.dateRange);
                setIsRecurring(state.isRecurring);
                setRecurringWeeks(state.recurringWeeks);
                addToast('Resuming your bulk booking selection...', 'info');
            } catch (e) {
                console.error('Failed to parse pending advanced booking', e);
                sessionStorage.removeItem('pending_advanced_booking');
            }
        }
    }, [user]);

    const fetchResources = async () => {
        try {
            const response = await apiClient.get('/resources');
            setResources(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch resources:', error);
        }
    };

    const fetchSlots = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ status: 'available' });
            if (filterType !== 'all') params.append('resourceType', filterType);
            if (dateRange.start) params.append('startDate', dateRange.start);
            if (dateRange.end) params.append('endDate', dateRange.end);

            const response = await apiClient.get(`/slots?${params}`);
            setSlots(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch slots:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSlotSelection = (slotId: string) => {
        setSelectedSlots(prev =>
            prev.includes(slotId)
                ? prev.filter(id => id !== slotId)
                : [...prev, slotId]
        );
    };

    const handleBulkBook = async () => {
        if (selectedSlots.length === 0) {
            addToast('Please select at least one slot', 'error');
            return;
        }

        // AUTH GATE: Trigger only at the point of booking confirmation
        if (!user) {
            addToast('Please sign in to complete your bulk booking', 'info');

            // Save state for recovery
            const advancedBookingState = {
                selectedSlots,
                filterType,
                dateRange,
                isRecurring,
                recurringWeeks
            };
            sessionStorage.setItem('pending_advanced_booking', JSON.stringify(advancedBookingState));

            navigate('/login', { state: { from: { pathname: '/dashboard' } } });
            return;
        }

        try {
            const bookingPromises = selectedSlots.map(slotId =>
                apiClient.post('/appointments', {
                    slotId,
                    priority: user?.role === 'scientist' ? 'urgent' : 'normal',
                    notes: `Bulk booking via Advanced interface${isRecurring ? ` (Recurring: ${recurringWeeks} weeks)` : ''}`
                })
            );

            await Promise.all(bookingPromises);
            addToast(`✅ Successfully booked ${selectedSlots.length} slot(s)!`, 'success');
            setSelectedSlots([]);
            sessionStorage.removeItem('pending_advanced_booking');
            fetchSlots();
        } catch (error) {
            console.error('Bulk booking failed:', error);
            addToast('❌ Some bookings failed. Please try again.', 'error');
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
    };

    const resourceTypes = [...new Set(resources.map(r => r.type))];

    return (
        <div className="advanced-booking">
            {(user?.verificationStatus === 'pending' || user?.verificationStatus === 'rejected') && (
                <VerificationBanner
                    status={user.verificationStatus as 'pending' | 'rejected'}
                    reason={user.rejectionReason}
                />
            )}
            {/* Header */}
            <div className="advanced-header">
                <div>
                    <h1>Advanced Booking</h1>
                    <p className="role-badge">
                        {user?.role === 'scientist' ? '🔬 Scientist Mode' : '💼 Entrepreneur Mode'}
                    </p>
                </div>
                <div className="header-actions">
                    <Button variant="secondary" size="sm">
                        📋 My Templates
                    </Button>
                    <Button variant="secondary" size="sm">
                        🔄 Recurring Setup
                    </Button>
                </div>
            </div>

            {/* Entrepreneur Hero Gallery */}
            <div className="entrepreneur-hero">
                <div className="hero-main">
                    <img src="/images/entrepreneur/team.jpg" alt="Team collaboration" className="hero-img" />
                    <div className="hero-overlay"></div>
                    <div className="hero-text">
                        <span className="hero-tag">🚀 Startup Mode</span>
                        <h2>Build Your Vision</h2>
                        <p>Multi-select slots for your project timeline</p>
                    </div>
                </div>
                <div className="hero-side">
                    <div className="hero-card">
                        <img src="/images/entrepreneur/hustle.jpg" alt="Entrepreneur hustling" className="hero-img" />
                        <div className="hero-overlay"></div>
                        <div className="hero-text">
                            <span className="hero-mini-tag">Hustle</span>
                        </div>
                    </div>
                    <div className="hero-card">
                        <img src="/images/entrepreneur/focus.jpg" alt="Focused work" className="hero-img" />
                        <div className="hero-overlay"></div>
                        <div className="hero-text">
                            <span className="hero-mini-tag">Focus</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-panel">
                <div className="filter-group">
                    <label>Resource Type</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Types</option>
                        {resourceTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group">
                    <label>Date Range</label>
                    <div className="date-inputs">
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="date-input"
                        />
                        <span>to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="date-input"
                        />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Recurring Booking</label>
                    <div className="recurring-toggle">
                        <input
                            type="checkbox"
                            id="recurring"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                        />
                        <label htmlFor="recurring">Enable</label>
                        {isRecurring && (
                            <select
                                value={recurringWeeks}
                                onChange={(e) => setRecurringWeeks(Number(e.target.value))}
                                className="weeks-select"
                            >
                                {[2, 4, 6, 8, 10, 12].map(w => (
                                    <option key={w} value={w}>{w} weeks</option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>
            </div>

            {/* Selection Summary */}
            {selectedSlots.length > 0 && (
                <div className="selection-bar">
                    <span className="selection-count">
                        {selectedSlots.length} slot{selectedSlots.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="selection-actions">
                        <Button variant="secondary" size="sm" onClick={() => setSelectedSlots([])}>
                            Clear
                        </Button>
                        <Button variant="primary" size="sm" onClick={handleBulkBook}>
                            Book Selected →
                        </Button>
                    </div>
                </div>
            )}

            {/* Slots Table */}
            <div className="slots-table-container">
                {loading ? (
                    <div className="loading-state">Loading slots...</div>
                ) : (
                    <table className="slots-table">
                        <thead>
                            <tr>
                                <th className="checkbox-col">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedSlots(slots.map(s => s.id));
                                            } else {
                                                setSelectedSlots([]);
                                            }
                                        }}
                                        checked={selectedSlots.length === slots.length && slots.length > 0}
                                    />
                                </th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Resource</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {slots.map(slot => {
                                const { date, time } = formatDateTime(slot.startTime);
                                const endTime = formatDateTime(slot.endTime).time;
                                return (
                                    <tr
                                        key={slot.id}
                                        className={selectedSlots.includes(slot.id) ? 'selected' : ''}
                                    >
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedSlots.includes(slot.id)}
                                                onChange={() => toggleSlotSelection(slot.id)}
                                            />
                                        </td>
                                        <td>{date}</td>
                                        <td>{time} - {endTime}</td>
                                        <td>{slot.resource?.name || 'N/A'}</td>
                                        <td>
                                            <span className={`type-badge ${slot.resource?.type}`}>
                                                {slot.resource?.type || 'general'}
                                            </span>
                                        </td>
                                        <td>{slot.resource?.capacity || '-'}</td>
                                        <td>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => toggleSlotSelection(slot.id)}
                                            >
                                                {selectedSlots.includes(slot.id) ? 'Remove' : 'Add'}
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!loading && slots.length === 0 && (
                    <div className="empty-table">
                        <p>No slots match your filters. Try adjusting the criteria.</p>
                    </div>
                )}
            </div>

            {/* Priority Queue Info */}
            <div className="priority-info">
                <h3>🚀 Priority Queue Status</h3>
                <p>
                    {user?.role === 'scientist'
                        ? 'Your bookings receive priority access for lab equipment.'
                        : 'Entrepreneurs can access bulk booking for project timelines.'}
                </p>
                <div className="queue-stats">
                    <div className="queue-stat">
                        <span className="stat-value">3</span>
                        <span className="stat-label">Active Requests</span>
                    </div>
                    <div className="queue-stat">
                        <span className="stat-value">~2h</span>
                        <span className="stat-label">Avg. Wait Time</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvancedBooking;
