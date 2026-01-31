import React, { useState, useMemo } from 'react';
import { Card, LoadingState, ErrorState, Button, Input, Modal } from '../../design-system';
import { useSlots } from '../../hooks/useSlots';
import { SlotForm } from '../../components/SlotForm';
import apiClient from '../../api/apiClient';
import './ManageSlots.css';

const ManageSlots: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'booked'>('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState<any>(null);

    const { data: slots, isLoading: slotsLoading, error: slotError, refetch: refetchSlots } = useSlots();

    // Quick resource fetch (ideally move to hook)
    const [resources, setResources] = useState<any[]>([]);
    const [resourcesLoading, setResourcesLoading] = useState(false);

    React.useEffect(() => {
        if (showCreateModal) {
            setResourcesLoading(true);
            apiClient.get('/resources')
                .then((res: any) => setResources(res.data.data))
                .catch(console.error)
                .finally(() => setResourcesLoading(false));
        }
    }, [showCreateModal]);

    // ... existing filter logic

    // Memoize filtered slots to prevent re-calculation on every render
    const filteredSlots = useMemo(() => {
        return slots?.filter(slot => {
            const matchesSearch = slot.resource.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || slot.status === statusFilter;
            return matchesSearch && matchesStatus;
        }) || [];
    }, [slots, searchTerm, statusFilter]);

    if (slotsLoading) return <LoadingState />;
    if (slotError) return <ErrorState message={(slotError as any).message} onRetry={() => refetchSlots()} />;

    return (
        <div className="manage-slots">
            <header className="page-header">
                <h1>Manage Slots</h1>
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                    Create New Slot
                </Button>
            </header>

            {/* Filters */}
            <Card className="filters-card">
                <div className="filters-grid">
                    <Input
                        label="Search by Resource"
                        placeholder="Type resource name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="filter-group">
                        <label className="ds-input-label">Status</label>
                        <select
                            className="ds-input"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">All</option>
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Desktop Table / Mobile Cards */}
            <Card>
                <div className="slots-table-container">
                    {/* Desktop Table (≥ 768px) */}
                    <table className="slots-table desktop-only" role="table" aria-label="Slots management table">
                        <thead>
                            <tr>
                                <th>Start Time</th>
                                <th>End Time</th>
                                <th>Resource</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSlots.map(slot => (
                                <tr key={slot.id}>
                                    <td>{new Date(slot.startTime).toLocaleString()}</td>
                                    <td>{new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{slot.resource.name} ({slot.resource.type})</td>
                                    <td>
                                        <span className={`status-badge status-${slot.status}`}>
                                            {slot.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setEditingSlot(slot)}
                                            disabled={slot.status === 'booked'}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Mobile Cards (< 768px) */}
                    <div className="slots-cards mobile-only">
                        {filteredSlots.map(slot => (
                            <div key={slot.id} className="slot-card">
                                <div className="slot-card-header">
                                    <span className="slot-time">
                                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={`status-badge status-${slot.status}`}>
                                        {slot.status}
                                    </span>
                                </div>
                                <div className="slot-card-body">
                                    <p><strong>Resource:</strong> {slot.resource.name} ({slot.resource.type})</p>
                                    <p><strong>Date:</strong> {new Date(slot.startTime).toLocaleDateString()}</p>
                                </div>
                                <div className="slot-card-actions">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => setEditingSlot(slot)}
                                        disabled={slot.status === 'booked'}
                                    >
                                        Edit Slot
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Create Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Slot"
            >
                {resourcesLoading ? (
                    <div className="p-8 text-center text-text-muted">Loading resources...</div>
                ) : (
                    <SlotForm
                        resources={resources}
                        onSuccess={() => {
                            setShowCreateModal(false);
                            refetchSlots();
                        }}
                        onCancel={() => setShowCreateModal(false)}
                    />
                )}
            </Modal>

            {/* Edit Modal */}
            {editingSlot && (
                <Modal
                    isOpen={!!editingSlot}
                    onClose={() => setEditingSlot(null)}
                    title="Edit Slot"
                >
                    <p>Edit Slot Form for: {editingSlot.resource.name}</p>
                    <Button onClick={() => setEditingSlot(null)}>Close</Button>
                </Modal>
            )}
        </div>
    );
};

export default ManageSlots;
