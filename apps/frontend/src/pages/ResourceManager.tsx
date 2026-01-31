import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { Button, Card, Input } from '../design-system';
import { useToast } from '../context/ToastContext';
import { Plus, Package, Edit2, Trash2, Check, X } from 'lucide-react';
import { Resource } from '../types';

const ResourceManager = () => {
    const [resources, setResources] = useState<Resource[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [newResource, setNewResource] = useState({ name: '', type: 'room' as const, capacity: 1 });
    const [editing, setEditing] = useState<Resource | null>(null);
    const { addToast } = useToast();

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const { data } = await apiClient.get('/resources');
            setResources(data.data || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await apiClient.post('/resources', newResource);
            if (data.success) {
                setResources([...resources, data.data]);
                setShowAdd(false);
                setNewResource({ name: '', type: 'room', capacity: 1 });
                addToast('Resource created successfully!', 'success');
            }
        } catch (error) {
            addToast('Failed to create resource. Please try again.', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This may affect existing slots.')) return;
        try {
            await apiClient.delete(`/resources/${id}`);
            setResources(resources.filter((r: Resource) => r.id !== id));
            addToast('Resource deleted successfully', 'success');
        } catch (error) {
            addToast('Failed to delete resource', 'error');
        }
    };

    const handleUpdate = async (id: string) => {
        try {
            const { data } = await apiClient.put(`/resources/${id}`, editing);
            if (data.success) {
                setResources(resources.map((r: Resource) => r.id === id ? data.data : r));
                setEditing(null);
                addToast('Resource updated successfully', 'success');
            }
        } catch (error) {
            addToast('Failed to update resource', 'error');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Resource Manager</h1>
                    <p className="text-text-muted mt-1 uppercase text-[10px] font-bold tracking-widest">Manage rooms, equipment, and other assets</p>
                </div>
                <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'secondary' : 'primary'}>
                    {showAdd ? 'Cancel' : <><Plus size={18} className="mr-2" /> Add Resource</>}
                </Button>
            </div>

            {showAdd && (
                <Card className="mb-12 border-primary/30 animate-in fade-in slide-in-from-top-4">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-2">
                            <Input
                                label="Name"
                                type="text"
                                value={newResource.name}
                                onChange={(e) => setNewResource({ ...newResource, name: e.target.value })}
                                placeholder="Meeting Room A"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-text-muted ml-0.5">Type</label>
                            <select
                                value={newResource.type}
                                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                                className="ds-input w-full"
                            >
                                <option value="room">Room</option>
                                <option value="equipment">Equipment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Input
                                label="Capacity"
                                type="number"
                                value={newResource.capacity}
                                onChange={(e) => setNewResource({ ...newResource, capacity: parseInt(e.target.value) })}
                                min="1"
                                required
                            />
                        </div>
                        <Button type="submit" fullWidth className="uppercase tracking-widest text-xs h-11">Create Resource</Button>
                    </form>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource: Resource) => (
                    <Card key={resource.id} className="relative group hover:border-white/10 transition-colors">
                        {editing?.id === resource.id ? (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={editing.name}
                                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-lg font-bold"
                                />
                                <div className="flex gap-2">
                                    <button onClick={() => handleUpdate(resource.id)} className="p-2 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500/20 transition-colors">
                                        <Check size={18} />
                                    </button>
                                    <button onClick={() => setEditing(null)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
                                        <Package className="text-primary" size={20} />
                                    </div>
                                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditing(resource)} className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(resource.id)} className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{resource.name}</h3>
                                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mb-4">{resource.type} • Capacity: {resource.capacity}</p>
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${resource.status === 'available' ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-amber-500 shadow-lg shadow-amber-500/20'}`}></div>
                                    <span className="text-text-muted uppercase tracking-widest font-bold text-[9px]">{resource.status}</span>
                                </div>
                            </>
                        )}
                    </Card>
                ))}
            </div>

            {resources.length === 0 && (
                <div className="p-20 text-center text-text-muted italic border-2 border-dashed border-white/5 rounded-3xl">
                    No resources cataloged. Click 'Add Resource' to expand the system.
                </div>
            )}
        </div>
    );
};

export default ResourceManager;
