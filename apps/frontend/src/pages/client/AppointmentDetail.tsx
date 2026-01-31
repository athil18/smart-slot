import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, Button, Input, LoadingState, ErrorState, useToast } from '../../design-system';
import { useAppointmentById, useRescheduleAppointment, useCancelAppointment } from '../../hooks/useAppointmentDetail';
import { useSlots } from '../../hooks/useSlots';
import { rescheduleSchema, RescheduleInput } from '../../schemas/appointment.schema';
import './AppointmentDetail.css';

const AppointmentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    const { data: appointment, isLoading, error } = useAppointmentById(id!);
    const { data: availableSlots } = useSlots({ date: selectedDate });
    const rescheduleMutation = useRescheduleAppointment(id!);
    const cancelMutation = useCancelAppointment(id!);

    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RescheduleInput>({
        resolver: zodResolver(rescheduleSchema)
    });

    const newDate = watch('newDate');

    React.useEffect(() => {
        if (newDate) {
            setSelectedDate(newDate);
        }
    }, [newDate]);

    if (isLoading) return <LoadingState />;
    if (error || !appointment) return <ErrorState message="Appointment not found" onRetry={() => navigate('/appointments')} />;

    const canEdit = appointment.status === 'confirmed';
    const isCurrentSlot = (slotId: string) => slotId === appointment.slot.id;

    const onSubmit = async (data: RescheduleInput) => {
        if (isCurrentSlot(data.newSlotId)) {
            addToast('New slot must be different from current booking', 'error');
            return;
        }

        try {
            await rescheduleMutation.mutateAsync(data.newSlotId);
            addToast('Appointment rescheduled successfully!', 'success');
            setIsEditing(false);
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Reschedule failed', 'error');
        }
    };

    const handleCancel = async () => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

        try {
            await cancelMutation.mutateAsync();
            addToast('Appointment cancelled', 'success');
        } catch (err: any) {
            addToast(err.response?.data?.message || 'Cancellation failed', 'error');
        }
    };

    const handleEditCancel = () => {
        setIsEditing(false);
        setValue('newDate', '');
        setValue('newSlotId', '');
        setSelectedDate('');
    };

    return (
        <div className="appointment-detail">
            <header className="page-header">
                <h1>Appointment Details</h1>
                <Button variant="ghost" onClick={() => navigate('/appointments')}>
                    ← Back to Appointments
                </Button>
            </header>

            <Card>
                {/* View State */}
                {!isEditing && (
                    <>
                        <div className="detail-header">
                            <span className={`status-badge status-${appointment.status}`}>
                                {appointment.status}
                            </span>
                            {canEdit && (
                                <Button variant="secondary" onClick={() => setIsEditing(true)}>
                                    Edit
                                </Button>
                            )}
                        </div>

                        <div className="detail-body">
                            <div className="detail-section">
                                <h3>Booking Information</h3>
                                <p><strong>Date:</strong> {new Date(appointment.slot.startTime).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                <p><strong>Time:</strong> {new Date(appointment.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(appointment.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p><strong>Staff:</strong> {appointment.slot.staff.name}</p>
                                <p><strong>Resource:</strong> {appointment.slot.resource.name} ({appointment.slot.resource.type})</p>
                            </div>

                            <div className="detail-section">
                                <h3>Your Information</h3>
                                <p><strong>Name:</strong> {appointment.user.name}</p>
                                <p><strong>Email:</strong> {appointment.user.email}</p>
                            </div>
                        </div>

                        {canEdit && (
                            <div className="detail-actions">
                                <Button variant="ghost" className="btn-danger" onClick={handleCancel} disabled={cancelMutation.isPending}>
                                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Appointment'}
                                </Button>
                            </div>
                        )}
                    </>
                )}

                {/* Edit State */}
                {isEditing && (
                    <form onSubmit={handleSubmit(onSubmit)} className="edit-form">
                        <div className="current-booking">
                            <h3>Current Booking</h3>
                            <p className="current-info">
                                {new Date(appointment.slot.startTime).toLocaleDateString()} at {new Date(appointment.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="current-meta">
                                {appointment.slot.staff.name} | {appointment.slot.resource.name}
                            </p>
                        </div>

                        <div className="reschedule-section">
                            <h3>Reschedule To:</h3>
                            <Input
                                label="New Date"
                                type="date"
                                {...register('newDate')}
                                error={errors.newDate?.message}
                                min={new Date().toISOString().split('T')[0]}
                            />

                            {newDate && (
                                <div className="slot-selection">
                                    <label className="ds-input-label">New Time Slot</label>
                                    {availableSlots && availableSlots.length > 0 ? (
                                        <select
                                            className="ds-input"
                                            {...register('newSlotId')}
                                        >
                                            <option value="">Select a time slot</option>
                                            {availableSlots
                                                .filter(slot => slot.status === 'available')
                                                .map(slot => (
                                                    <option key={slot.id} value={slot.id}>
                                                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({slot.resource.name})
                                                    </option>
                                                ))}
                                        </select>
                                    ) : (
                                        <p className="no-slots-message">No available slots on this date</p>
                                    )}
                                    {errors.newSlotId && <span className="error-message">{errors.newSlotId.message}</span>}
                                </div>
                            )}
                        </div>

                        <div className="form-actions">
                            <Button type="button" variant="ghost" onClick={handleEditCancel}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={rescheduleMutation.isPending || !newDate || !watch('newSlotId')}
                            >
                                {rescheduleMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default AppointmentDetail;
