import { useQuery } from '@tanstack/react-query';
import api from '../api/apiClient';

export interface StaffDashboardData {
    stats: {
        total: number;
        booked: number;
        available: number;
    };
    recentAppointments: any[];
}

export const useStaffDashboard = () => {
    return useQuery<StaffDashboardData>({
        queryKey: ['staff', 'dashboard'],
        queryFn: async () => {
            const [slotsRes, apptsRes] = await Promise.all([
                api.get('/slots'),
                api.get('/appointments/my') // For now, reuse this
            ]);

            const slots = Array.isArray(slotsRes.data?.data) ? slotsRes.data.data : [];
            const appointments = Array.isArray(apptsRes.data?.data) ? apptsRes.data.data : [];

            return {
                stats: {
                    total: slots.length,
                    booked: slots.filter((s: any) => s.status === 'booked').length,
                    available: slots.filter((s: any) => s.status === 'available').length
                },
                recentAppointments: appointments.slice(0, 5)
            };
        },
        staleTime: 30 * 1000,
    });
};
