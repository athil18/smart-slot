import React, { useState, useMemo, useCallback } from 'react';
import { Card, LoadingState, EmptyState, ErrorState, Button, Input, useToast } from '../../design-system';
import { useSlots, useBookSlot } from '../../hooks/useSlots';
import './BrowseSlots.css';

// Memoized SlotCard component to prevent unnecessary re-renders
const SlotCard = React.memo(({ slot, onBook, isBooking, isBooked }: { slot: any, onBook: (id: string) => void, isBooking: boolean, isBooked: boolean }) => (
    <Card className="slot-card">
        <div className="slot-header">
            <p className="slot-time">
                {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <span className={`status-badge status-${slot.status}`}>
                {slot.status}
            </span>
        </div>
        <div className="slot-details">
            <p><strong>Staff:</strong> {slot.staff.name}</p>
            <p><strong>Resource:</strong> {slot.resource.name} ({slot.resource.type})</p>
            <p className="slot-date"><strong>Date:</strong> {new Date(slot.startTime).toLocaleDateString()}</p>
        </div>
        <Button
            fullWidth
            onClick={() => onBook(slot.id)}
            disabled={isBooked || isBooking}
        >
            {isBooking ? 'Booking...' : isBooked ? 'Booked' : 'Book Now'}
        </Button>
    </Card>
));

const BrowseSlots: React.FC = () => {
    const { addToast } = useToast();
    const [filters, setFilters] = useState({
        date: '',
        type: 'all'
    });

    // Memoize queryFilters to prevent infinite re-fetching loops if useSlots depends on object identity
    const queryFilters = useMemo(() => ({
        date: filters.date || undefined,
        type: filters.type === 'all' ? undefined : filters.type
    }), [filters.date, filters.type]);

    const { data: slots, isLoading, error, refetch } = useSlots(queryFilters);
    const bookMutation = useBookSlot(queryFilters);

    const handleBook = useCallback(async (slotId: string) => {
        try {
            await bookMutation.mutateAsync(slotId);
            addToast('Appointment booked successfully!', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Booking failed', 'error');
        }
    }, [bookMutation, addToast]);

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={(error as any).message} onRetry={() => refetch()} />;

    return (
        <div className="browse-slots">
            <header className="page-header">
                <h1>Browse Available Slots</h1>
            </header>

            <Card className="filters-card">
                <div className="filters-grid">
                    <Input
                        label="Date"
                        type="date"
                        value={filters.date}
                        onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
                    />
                    <div className="filter-group">
                        <label className="ds-input-label">Resource Type</label>
                        <select
                            className="ds-input"
                            value={filters.type}
                            onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
                        >
                            <option value="all">All Types</option>
                            <option value="room">Room</option>
                            <option value="equipment">Equipment</option>
                        </select>
                    </div>
                </div>
            </Card>

            <div className="slots-results">
                {slots && slots.length > 0 ? (
                    <div className="slots-grid">
                        {slots.map(slot => (
                            <SlotCard
                                key={slot.id}
                                slot={slot}
                                onBook={handleBook}
                                isBooking={bookMutation.isPending}
                                isBooked={slot.status === 'booked'}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState message="No slots available for selected filters." actionLabel="Clear Filters" onAction={() => setFilters({ date: '', type: 'all' })} />
                )}
            </div>
        </div>
    );
};

export default BrowseSlots;
