import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/apiClient';

export interface Appointment {
    id: string;
    status: 'confirmed' | 'cancelled';
    slot: {
        startTime: string;
        endTime: string;
        staff: { name: string };
        resource: { name: string };
    };
    user: { name: string };
}

export const useMyAppointments = (status?: string) => {
    return useQuery<Appointment[]>({
        queryKey: ['appointments', { status }],
        queryFn: async () => {
            const response = await api.get('/appointments/my', { params: { status } });
            return response.data.data;
        },
        staleTime: 60 * 1000, // 1 minute
    });
};

export const useCancelAppointment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (appointmentId: string) => {
            const response = await api.patch(`/appointments/${appointmentId}/cancel`);
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['slots'] });
        },
    });
};
