import React, { useEffect, useState } from 'react';
import { Button } from '../../design-system';
import { X } from 'lucide-react';

interface User {
    id?: string;
    name: string;
    email: string;
    role: string;
    createdAt?: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    user?: User | null; // If provided, we are in Edit mode
    title: string;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user, title }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'client',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                role: user.role || 'client',
                password: '' // Password not editable directly here for security simplicity, or blank implies no change
            });
        } else {
            setFormData({ name: '', email: '', role: 'client', password: '' });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-surface-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-surface-900/50">
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-text-muted hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Name</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-1">Role</label>
                        <select
                            className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="client">Client</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-surface-900 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting} className="flex-1 shadow-neon">
                            {isSubmitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;
