import React, { useState } from 'react';
import { Card, Button } from '../../design-system';

const AuditLogs: React.FC = () => {
    // Mock audit data for "CNN Report" style visualization
    const [logs] = useState([
        { id: 1, action: 'LOGIN_SUCCESS', user: 'Nick Fury', ip: '192.168.1.10', time: '2 mins ago', status: 'success' },
        { id: 2, action: 'SLOT_CREATE', user: 'Dr. Sarah Connor', ip: '10.0.0.5', time: '15 mins ago', status: 'success' },
        { id: 3, action: 'BOOKING_CONFLICT', user: 'Tony Stark', ip: '172.16.0.1', time: '1 hour ago', status: 'warning' },
        { id: 4, action: 'SYSTEM_BACKUP', user: 'SYSTEM', ip: 'localhost', time: '4 hours ago', status: 'info' },
        { id: 5, action: 'LOGIN_FAILED', user: 'Unknown', ip: '45.32.11.90', time: '5 hours ago', status: 'error' },
    ]);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header>
                <h1 className="text-3xl font-display font-bold text-white">System Audit Logs</h1>
                <p className="text-text-muted mt-1">Live telemetry of system events and security checkpoints.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-emerald-500">
                    <div className="text-sm text-text-muted uppercase tracking-wider font-bold">System Health</div>
                    <div className="text-3xl font-bold text-white mt-2">99.99%</div>
                    <div className="text-xs text-emerald-400 mt-1">Normal Operation</div>
                </Card>
                <Card className="border-l-4 border-l-blue-500">
                    <div className="text-sm text-text-muted uppercase tracking-wider font-bold">Active User Sessions</div>
                    <div className="text-3xl font-bold text-white mt-2">42</div>
                    <div className="text-xs text-blue-400 mt-1">+12% from last hour</div>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <div className="text-sm text-text-muted uppercase tracking-wider font-bold">Security Alerts</div>
                    <div className="text-3xl font-bold text-white mt-2">0</div>
                    <div className="text-xs text-text-muted mt-1">No active threats</div>
                </Card>
            </div>

            <Card header={<h3 className="text-lg font-bold text-white">Recent Event Stream</h3>} className="p-0 overflow-hidden">
                <div className="divide-y divide-white/5">
                    {logs.map(log => (
                        <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                        log.status === 'warning' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' :
                                            log.status === 'error' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' :
                                                'bg-blue-500'
                                    }`} />
                                <div>
                                    <div className="text-sm font-bold text-white">{log.action}</div>
                                    <div className="text-xs text-text-muted">User: <span className="text-primary-300">{log.user}</span> • IP: {log.ip}</div>
                                </div>
                            </div>
                            <div className="text-xs font-mono text-text-muted">{log.time}</div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-white/5 text-center">
                    <Button variant="ghost" size="sm" fullWidth>View Full History</Button>
                </div>
            </Card>
        </div>
    );
};

export default AuditLogs;
