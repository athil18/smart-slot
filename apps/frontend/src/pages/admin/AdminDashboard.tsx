import React from 'react';
import { Card, LoadingState, ErrorState } from '../../design-system';
import { useAdminStats } from '../../hooks/useAdminStats';
import { NavLink } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
    const { data: stats, isLoading, error, refetch } = useAdminStats();

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={(error as any).message} onRetry={() => refetch()} />;
    if (!stats) return <ErrorState message="No data available" onRetry={() => refetch()} />;

    const summaryCards = [
        { label: 'Total Users', value: stats.summary.users, color: 'primary' },
        { label: 'Total Slots', value: stats.summary.slots, color: 'secondary' },
        { label: 'Appointments', value: stats.summary.appointments, color: 'success' },
        { label: 'Resources', value: stats.summary.resources, color: 'neutral' }
    ];

    return (
        <div className="admin-dashboard">
            <header className="page-header">
                <h1>Admin Overview</h1>
            </header>

            <div className="stats-grid">
                {summaryCards.map(card => (
                    <Card key={card.label}>
                        <div className="stat-card-inner">
                            <span className="stat-label">{card.label}</span>
                            <span className={`stat-value color-${card.color}`}>{card.value}</span>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="dashboard-grid">
                <Card header={<h3>Recent Bookings</h3>}>
                    <div className="chart-placeholder">
                        <div className="bar-chart">
                            {stats.charts.bookingsByDay.map((d, i) => (
                                <div
                                    key={i}
                                    className="bar"
                                    style={{ height: `${(d.count / Math.max(...stats.charts.bookingsByDay.map(x => x.count), 1)) * 100}%` }}
                                    title={`${d.day}: ${d.count} bookings`}
                                ></div>
                            ))}
                        </div>
                        <div className="chart-labels">
                            {stats.charts.bookingsByDay.map((d, i) => (
                                <span key={i}>{d.day.split('-').slice(2).join('/')}</span>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card header={<h3>System Activity</h3>} footer={<NavLink to="/admin/logs" className="view-all">View Full Logs</NavLink>}>
                    <div className="logs-list">
                        {stats.recentLogs.map((log, i) => (
                            <div key={i} className="log-item">
                                <div className="log-info">
                                    <p className="log-action">{log.action.replace(/_/g, ' ')}</p>
                                    <p className="log-user">by {log.performedBy?.name || 'System'}</p>
                                </div>
                                <span className="log-time">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
