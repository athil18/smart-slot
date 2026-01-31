import React, { useState } from 'react';
import { Card, LoadingState, EmptyState, ErrorState, Button, useToast } from '../../design-system';
import { useMyAppointments, useCancelAppointment } from '../../hooks/useAppointments';
import './MyAppointments.css';

const MyAppointments: React.FC = () => {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');

    const { data: appointments, isLoading, error, refetch } = useMyAppointments(activeTab);
    const cancelMutation = useCancelAppointment();

    const handleCancel = async (id: string) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        try {
            await cancelMutation.mutateAsync(id);
            addToast('Appointment cancelled successfully', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Cancellation failed', 'error');
        }
    };

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={(error as any).message} onRetry={() => refetch()} />;

    return (
        <div className="my-appointments">
            <header className="page-header">
                <h1>My Appointments</h1>
            </header>

            <div className="tabs">
                {(['upcoming', 'past', 'cancelled'] as const).map(tab => (
                    <button
                        key={tab}
                        className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="appointments-list">
                {appointments && appointments.length > 0 ? (
                    <div className="appointments-stack">
                        {appointments.map(appt => (
                            <Card key={appt.id} className="appt-card">
                                <div className="appt-info">
                                    <div className="appt-main">
                                        <p className="appt-date">
                                            {new Date(appt.slot.startTime).toLocaleDateString(undefined, {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                        <p className="appt-time">
                                            {new Date(appt.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(appt.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="appt-details">
                                        <p><strong>Staff:</strong> {appt.slot.staff.name}</p>
                                        <p><strong>Resource:</strong> {appt.slot.resource.name}</p>
                                        <span className={`status-pill status-${appt.status}`}>
                                            {appt.status}
                                        </span>
                                    </div>
                                </div>
                                {activeTab === 'upcoming' && (
                                    <div className="appt-actions">
                                        <Button variant="secondary" size="sm">Reschedule</Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="btn-danger"
                                            onClick={() => handleCancel(appt.id)}
                                            disabled={cancelMutation.isPending}
                                        >
                                            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        message={`You have no ${activeTab} appointments.`}
                        actionLabel={activeTab === 'upcoming' ? 'Browse Slots' : undefined}
                        onAction={activeTab === 'upcoming' ? () => window.location.href = '/slots' : undefined}
                    />
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
