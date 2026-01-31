import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../design-system';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

interface SlotFormProps {
    onSuccess: () => void;
    onCancel: () => void;
    initialData?: any; // If editing
    resources: Array<{ id: string; name: string }>;
}

interface SlotFormData {
    resourceId: string;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    date: string;      // YYYY-MM-DD
    isRecurring: boolean;
    repeatCount: number; // Weeks
    daysOfWeek: number[]; // 0-6
}

const DAYS = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
];

export const SlotForm: React.FC<SlotFormProps> = ({ onSuccess, onCancel, resources }) => {
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SlotFormData>({
        defaultValues: {
            repeatCount: 1,
            daysOfWeek: [],
            isRecurring: false
        }
    });

    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Watch fields for logic
    const isRecurring = watch('isRecurring');
    const selectedDays = watch('daysOfWeek');

    const toggleDay = (day: number) => {
        const current = selectedDays || [];
        if (current.includes(day)) {
            setValue('daysOfWeek', current.filter(d => d !== day));
        } else {
            setValue('daysOfWeek', [...current, day]);
        }
    };

    const onSubmit = async (data: SlotFormData) => {
        setIsLoading(true);
        try {
            // Combine Date + Time
            const startDateTime = new Date(`${data.date}T${data.startTime}`);
            const endDateTime = new Date(`${data.date}T${data.endTime}`);

            if (data.isRecurring) {
                // Bulk Create
                if (data.daysOfWeek.length === 0) {
                    addToast('Please select at least one day for recurrence', 'error');
                    setIsLoading(false);
                    return;
                }

                await apiClient.post('/slots/bulk', {
                    resourceId: data.resourceId,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    daysOfWeek: data.daysOfWeek,
                    repeatCount: Number(data.repeatCount)
                });
            } else {
                // Single Create
                await apiClient.post('/slots', {
                    resourceId: data.resourceId,
                    startTime: startDateTime.toISOString(),
                    endTime: endDateTime.toISOString(),
                    isRecurring: false
                });
            }

            addToast('Slot(s) created successfully', 'success');
            onSuccess();
        } catch (error: any) {
            console.error(error);
            addToast(error.response?.data?.error?.message || 'Failed to create slot', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* Resource Select */}
            <div className="space-y-1">
                <label className="ds-input-label">Resource</label>
                <select
                    {...register('resourceId', { required: 'Resource is required' })}
                    className="ds-input w-full"
                >
                    <option value="">Select a resource...</option>
                    {resources.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                </select>
                {errors.resourceId && <span className="ds-input-error">{errors.resourceId.message}</span>}
            </div>

            {/* Date & Time Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                    type="date"
                    label="Date"
                    {...register('date', { required: 'Date is required' })}
                    error={errors.date}
                />
                <Input
                    type="time"
                    label="Start Time"
                    {...register('startTime', { required: 'Start time is required' })}
                    error={errors.startTime}
                />
                <Input
                    type="time"
                    label="End Time"
                    {...register('endTime', { required: 'End time is required' })}
                    error={errors.endTime}
                />
            </div>

            {/* Recurrence Toggle */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        id="recurring"
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-primary-500 focus:ring-primary-500/50"
                        {...register('isRecurring')}
                    />
                    <label htmlFor="recurring" className="text-white font-medium cursor-pointer">
                        Repeat this slot?
                    </label>
                </div>

                {/* Recurrence Options */}
                {isRecurring && (
                    <div className="pl-8 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                            <label className="ds-input-label">Repeat for how many weeks?</label>
                            <Input
                                type="number"
                                min="1"
                                max="52"
                                {...register('repeatCount', { min: 1 })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="ds-input-label">Days of Week</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => toggleDay(day.value)}
                                        className={`
                                            px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                                            ${selectedDays?.includes(day.value)
                                                ? 'bg-primary-500 text-white shadow-neon'
                                                : 'bg-white/5 text-text-muted hover:bg-white/10 hover:text-white'}
                                        `}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-text-muted">
                                Select days to repeat. If none selected, defaults to the day of the chosen Date.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading}>
                    {isLoading ? 'Creating...' : isRecurring ? 'Create Recurring Slots' : 'Create Slot'}
                </Button>
            </div>
        </form>
    );
};
