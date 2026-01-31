import React, { useState, useEffect } from 'react';
import { Card, Button, LoadingState, ErrorState } from '../../design-system';
import apiClient from '../../api/apiClient';
import UserModal from '../../components/admin/UserModal';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    accessLevel?: number;
    organization?: string;
    department?: string;
    phone?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    verificationData?: string;
    createdAt: string;
}

const getVerificationBadgeStyle = (status: string) => {
    switch (status) {
        case 'verified': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'rejected': return 'bg-error/10 text-error border-error/20';
        case 'pending':
        default: return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-neon-sm';
    }
};

// Role badge styling configuration
const getRoleBadgeStyle = (role: string) => {
    switch (role) {
        case 'admin':
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'staff':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'scientist':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'entrepreneur':
            return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
        case 'politician':
            return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        case 'retiree':
            return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
        case 'student':
        default:
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
};

const getRoleIcon = (role: string) => {
    switch (role) {
        case 'admin': return '🔐';
        case 'staff': return '👨‍💼';
        case 'scientist': return '🔬';
        case 'entrepreneur': return '💼';
        case 'politician': return '🏛️';
        case 'retiree': return '👴';
        case 'student': return '🎓';
        default: return '👤';
    }
};

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await apiClient.get('/admin/users');
            setUsers(data.data || []);
            setIsLoading(false);
        } catch (err) {
            setError('Failed to load users');
            setIsLoading(false);
        }
    };

    const handleCreate = async (formData: any) => {
        await apiClient.post('/admin/users', formData);
        fetchUsers();
    };

    const handleUpdate = async (formData: any) => {
        if (!selectedUser) return;
        await apiClient.put(`/admin/users/${selectedUser.id}`, formData);
        fetchUsers();
    };

    const handleVerify = async (userId: string, status: 'verified' | 'rejected') => {
        let reason = '';
        if (status === 'rejected') {
            reason = window.prompt('Please provide a reason for rejection:') || 'Documentation incomplete';
        }

        try {
            await apiClient.patch(`/admin/users/${userId}/verify`, { status, reason });
            fetchUsers();
        } catch (err) {
            console.error('Failed to verify user', err);
        }
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await apiClient.delete(`/admin/users/${userId}`);
                fetchUsers();
            } catch (err) {
                console.error('Failed to delete user', err);
            }
        }
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    if (isLoading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">User Management</h1>
                    <p className="text-text-muted mt-1">View and manage system access.</p>
                </div>
                <Button variant="primary" className="shadow-neon" onClick={openCreateModal}>Add User</Button>
            </header>

            <Card className="overflow-hidden !p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 border-b border-white/10 text-text-muted uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Organization</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-medium text-white">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-surface-700 to-surface-600 flex items-center justify-center text-xs font-bold border border-white/10 text-primary-300">
                                                {user.name?.charAt(0) || '?'}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}>
                                            <span>{getRoleIcon(user.role)}</span>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {user.organization || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <span className={`inline-flex items-center w-fit gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getVerificationBadgeStyle(user.verificationStatus)}`}>
                                                {user.verificationStatus}
                                            </span>
                                            {user.verificationStatus === 'pending' && (
                                                <div className="flex gap-2 mt-1">
                                                    <button
                                                        onClick={() => handleVerify(user.id, 'verified')}
                                                        className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold underline"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleVerify(user.id, 'rejected')}
                                                        className="text-[10px] text-error hover:text-red-300 font-bold underline"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <Button size="sm" variant="ghost" className="text-text-muted hover:text-white" onClick={() => openEditModal(user)}>Edit</Button>
                                        <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={() => handleDelete(user.id)}>Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={selectedUser ? handleUpdate : handleCreate}
                user={selectedUser}
                title={selectedUser ? 'Edit User' : 'Add New User'}
            />
        </div>
    );
};

export default UsersPage;
