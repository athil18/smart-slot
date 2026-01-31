import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/apiClient';

export const useAppointmentById = (id: string) => {
    return useQuery({
        queryKey: ['appointment', id],
        queryFn: async () => {
            const response = await api.get(`/appointments/${id}`);
            return response.data.data;
        },
        enabled: !!id,
        staleTime: 60 * 1000, // 1 minute
    });
};

export const useRescheduleAppointment = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newSlotId: string) => {
            const response = await api.patch(`/appointments/${id}`, { newSlotId });
            return response.data.data;
        },
        onMutate: async (newSlotId) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['appointment', id] });

            // Snapshot the previous value
            const previousAppointment = queryClient.getQueryData(['appointment', id]);

            // Get the new slot data from the available slots cache
            const slotsData = queryClient.getQueryData<any[]>(['slots']);
            const newSlot = slotsData?.find(s => s.id === newSlotId);

            // Optimistically update to the new value
            if (newSlot) {
                queryClient.setQueryData(['appointment', id], (old: any) => ({
                    ...old,
                    slot: newSlot
                }));
            }

            return { previousAppointment };
        },
        onError: (_err, _newSlotId, context) => {
            // Rollback to previous value on error
            if (context?.previousAppointment) {
                queryClient.setQueryData(['appointment', id], context.previousAppointment);
            }
        },
        onSettled: () => {
            // Always refetch after error or success
            queryClient.invalidateQueries({ queryKey: ['appointment', id] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};

export const useCancelAppointment = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const response = await api.delete(`/appointments/${id}`);
            return response.data.data;
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['appointment', id] });
            const previousAppointment = queryClient.getQueryData(['appointment', id]);

            // Optimistically update status to cancelled
            queryClient.setQueryData(['appointment', id], (old: any) => ({
                ...old,
                status: 'cancelled'
            }));

            return { previousAppointment };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousAppointment) {
                queryClient.setQueryData(['appointment', id], context.previousAppointment);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['appointment', id] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};
