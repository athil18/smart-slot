import React from 'react';
import { Card, Button, LoadingState, EmptyState, ErrorState } from '../../design-system';
import { useAuth } from '../../context/AuthContext';
import { VerificationBanner } from '../../components/VerificationBanner';
import { useStaffDashboard } from '../../hooks/useStaffDashboard';
import { NavLink } from 'react-router-dom';
import './StaffDashboard.css';

const StaffDashboard: React.FC = () => {
    const { user } = useAuth();
    const { data, isLoading, error, refetch } = useStaffDashboard();

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={(error as any).message} onRetry={() => refetch()} />;

    const stats = data?.stats || { total: 0, booked: 0, available: 0 };
    const recentAppointments = data?.recentAppointments || [];

    return (
        <div className="staff-dashboard">
            {(user?.verificationStatus === 'pending' || user?.verificationStatus === 'rejected') && (
                <VerificationBanner
                    status={user.verificationStatus as 'pending' | 'rejected'}
                    reason={user.rejectionReason}
                />
            )}
            <header className="page-header">
                <h1>Staff Dashboard</h1>
            </header>

            <div className="stats-grid">
                <Card>
                    <div className="stat-item">
                        <span className="stat-label">Total Slots</span>
                        <span className="stat-value">{stats.total}</span>
                    </div>
                </Card>
                <Card>
                    <div className="stat-item">
                        <span className="stat-label">Booked Today</span>
                        <span className="stat-value">{stats.booked}</span>
                    </div>
                </Card>
                <Card>
                    <div className="stat-item">
                        <span className="stat-label">Available</span>
                        <span className="stat-value">{stats.available}</span>
                    </div>
                </Card>
            </div>

            <div className="dashboard-grid">
                <Card header={<h3>Today's Appointments</h3>} footer={<NavLink to="/staff/appointments" className="view-all">View All Appointments</NavLink>}>
                    {recentAppointments.length > 0 ? (
                        <div className="appointment-list">
                            {recentAppointments.map(appt => (
                                <div key={appt.id} className="appointment-item">
                                    <div className="appt-info">
                                        <p className="appt-time">
                                            {new Date(appt.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="appt-meta">{appt.user.name} | {appt.slot.resource.name}</p>
                                    </div>
                                    <span className={`status-pill status-${appt.status}`}>{appt.status}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No appointments scheduled for today." />
                    )}
                </Card>

                <Card header={<h3>Quick Actions</h3>}>
                    <div className="quick-actions">
                        <NavLink to="/staff/slots/new">
                            <Button fullWidth variant="primary">Create New Slot</Button>
                        </NavLink>
                        <NavLink to="/staff/slots">
                            <Button fullWidth variant="secondary">Manage My Slots</Button>
                        </NavLink>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default StaffDashboard;
