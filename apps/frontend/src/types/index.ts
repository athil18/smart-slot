import { User } from '@smartslot/shared';

export type { User };

export interface Resource {
    id: string;
    name: string;
    type: 'room' | 'equipment' | 'other';
    capacity: number;
    status: 'available' | 'maintenance' | 'out_of_service';
}

export interface Slot {
    id: string;
    staffId: string;
    resourceId?: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked' | 'cancelled';
    isRecurring: boolean;
    staff?: { name: string };
    resource?: { name: string; type: string };
}

export interface Appointment {
    id: string;
    clientId: string;
    slotId: string;
    priority: 'normal' | 'urgent';
    notes?: string;
    status: 'confirmed' | 'cancelled' | 'rescheduled';
    createdAt: string;
    slot?: Slot;
}
