import React from 'react';
import { Card, LoadingState, EmptyState, ErrorState, Button } from '../../design-system';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { useMyAppointments } from '../../hooks/useAppointments';
import './ClientDashboard.css';

const ClientDashboard: React.FC = () => {
    const { user } = useAuth();
    const { data: appointments, isLoading, error, refetch } = useMyAppointments('upcoming');

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={(error as any).message} onRetry={() => refetch()} />;

    const recentAppointments = appointments?.slice(0, 3) || [];

    return (
        <div className="client-dashboard">
            <header className="page-header">
                <h1>Welcome back, {user?.name}!</h1>
            </header>

            <div className="dashboard-grid">
                <Card header={<h3>Recent Appointments</h3>} footer={<NavLink to="/appointments" className="view-all">View All Appointments</NavLink>}>
                    {recentAppointments.length > 0 ? (
                        <div className="appointment-list">
                            {recentAppointments.map(appt => (
                                <div key={appt.id} className="appointment-item">
                                    <div className="appt-info">
                                        <p className="appt-date">{new Date(appt.slot.startTime).toLocaleDateString()}</p>
                                        <p className="appt-time">
                                            {new Date(appt.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(appt.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="appt-meta">{appt.slot.staff.name} | {appt.slot.resource.name}</p>
                                    </div>
                                    <div className="appt-actions">
                                        <Button size="sm" variant="ghost">View Details</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No upcoming appointments. Browse available slots to get started." />
                    )}
                </Card>

                <Card header={<h3>Quick Actions</h3>}>
                    <div className="quick-actions">
                        <NavLink to="/slots">
                            <Button fullWidth variant="primary">Browse Available Slots</Button>
                        </NavLink>
                        <NavLink to="/appointments">
                            <Button fullWidth variant="secondary">View My Appointments</Button>
                        </NavLink>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ClientDashboard;
