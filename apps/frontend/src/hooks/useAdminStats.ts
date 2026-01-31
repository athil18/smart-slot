import { useQuery } from '@tanstack/react-query';
import api from '../api/apiClient';

export interface AdminStats {
    summary: {
        users: number;
        slots: number;
        appointments: number;
        resources: number;
    };
    charts: {
        bookingsByDay: { day: string; count: number }[];
    };
    recentLogs: {
        performedBy?: { name: string };
        action: string;
        timestamp: string;
    }[];
}

export const useAdminStats = () => {
    return useQuery<AdminStats>({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const response = await api.get('/admin/stats');
            return response.data.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
