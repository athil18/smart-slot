import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/apiClient';

export interface Slot {
    id: string;
    startTime: string;
    endTime: string;
    status: 'available' | 'booked';
    staff: { name: string };
    resource: { name: string; type: string };
}

export const useSlots = (filters?: { date?: string; type?: string }) => {
    return useQuery<Slot[]>({
        queryKey: ['slots', filters],
        queryFn: async () => {
            const response = await api.get('/slots', { params: filters });
            return response.data.data;
        },
        staleTime: 30 * 1000, // 30 seconds for slots as they are highly volatile
    });
};

export const useBookSlot = (filters?: { date?: string; type?: string }) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slotId: string) => {
            const response = await api.post('/appointments', { slotId });
            return response.data.data;
        },
        onMutate: async (slotId) => {
            await queryClient.cancelQueries({ queryKey: ['slots', filters] });
            const previousSlots = queryClient.getQueryData(['slots', filters]);

            queryClient.setQueryData(['slots', filters], (old: Slot[] | undefined) => {
                return old?.map(slot =>
                    slot.id === slotId ? { ...slot, status: 'booked' } : slot
                );
            });

            return { previousSlots };
        },
        onError: (_err, _slotId, context) => {
            if (context?.previousSlots) {
                queryClient.setQueryData(['slots', filters], context.previousSlots);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['slots', filters] });
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
        },
    });
};
