import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import { Plus, GripVertical, Clock, Save, Trash2 } from 'lucide-react';
import { Button } from '../../design-system/Button.tsx';
import { Card } from '../../design-system/Card.tsx';
import { Input } from '../../design-system/Input.tsx';

interface TemplateItem {
    id: string;
    name: string;
    duration: string;
}

const initialItems: TemplateItem[] = [
    { id: '1', name: 'Morning Shift', duration: '08:00 - 12:00' },
    { id: '2', name: 'Lunch Break', duration: '12:00 - 13:00' },
    { id: '3', name: 'Afternoon Lab', duration: '13:00 - 17:00' },
];

const SlotTemplateBuilder: React.FC = () => {
    const [items, setItems] = useState(initialItems);
    const [newItemName, setNewItemName] = useState('');

    const addNewItem = () => {
        if (!newItemName) return;
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItemName,
            duration: '09:00 - 10:00', // Default
        };
        setItems([...items, newItem]);
        setNewItemName('');
    };

    const removeItem = (id: string) => {
        setItems(items.filter((item) => item.id !== id));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Schedule Templates</h1>
                    <p className="text-text-muted">Design your ideal day by dragging blocks.</p>
                </div>
                <Button variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    Save Template
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Template Canvas */}
                <div className="lg:col-span-2 space-y-6">
                    <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-4">
                        {items.map((item) => (
                            <Reorder.Item key={item.id} value={item}>
                                <Card className="flex items-center gap-4 p-4 border border-white/5 cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors">
                                    <GripVertical className="text-text-muted" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-white">{item.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-primary-400">
                                            <Clock size={14} />
                                            <span>{item.duration}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </Card>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>

                    {items.length === 0 && (
                        <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-2xl text-text-muted">
                            No blocks yet. Add one from the right!
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    <Card className="p-6 sticky top-24">
                        <h3 className="text-xl font-bold text-white mb-4">Add Block</h3>
                        <div className="space-y-4">
                            <Input
                                label="Block Name"
                                placeholder="e.g. Chemistry Lab 101"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                            />
                            <Button fullWidth variant="secondary" onClick={addNewItem}>
                                <Plus className="w-4 h-4 mr-2" />
                                Add to Canvas
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SlotTemplateBuilder;
