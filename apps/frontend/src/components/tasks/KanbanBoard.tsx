import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, Plus, CheckCircle2, CircleDashed } from 'lucide-react';
import { Card } from '../../design-system/Card.tsx';
import { Button } from '../../design-system/Button.tsx';

interface Task {
    id: string;
    title: string;
    status: 'todo' | 'in-progress' | 'done';
}

const initialTasks: Task[] = [
    { id: '1', title: 'Prepare Chemistry Lab for Class 10A', status: 'todo' },
    { id: '2', title: 'Fix 3D Printer Nozzle', status: 'in-progress' },
    { id: '3', title: 'Restock Paper in Computer Lab', status: 'done' },
];

const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState(initialTasks);

    const moveTask = (id: string, newStatus: Task['status']) => {
        setTasks(tasks.map((task) => (task.id === id ? { ...task, status: newStatus } : task)));
    };

    const columns: { id: Task['status']; title: string; icon: any; color: string }[] = [
        { id: 'todo', title: 'To Do', icon: CircleDashed, color: 'text-text-muted' },
        { id: 'in-progress', title: 'In Progress', icon: MoreHorizontal, color: 'text-primary-400' },
        { id: 'done', title: 'Completed', icon: CheckCircle2, color: 'text-green-400' },
    ];

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-display font-bold text-white">Task Board</h1>
                    <p className="text-text-muted">Manage your daily duties.</p>
                </div>
                <Button variant="secondary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                </Button>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col h-full bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <col.icon className={`w-5 h-5 ${col.color}`} />
                            <h3 className="font-bold text-white">{col.title}</h3>
                            <span className="ml-auto text-xs text-text-muted bg-white/10 px-2 py-1 rounded-full">
                                {tasks.filter((t) => t.status === col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
                            {tasks
                                .filter((t) => t.status === col.id)
                                .map((task) => (
                                    <motion.div layoutId={task.id} key={task.id}>
                                        <Card className="p-4 hover:border-primary-500/30 transition-colors cursor-pointer group">
                                            <p className="text-white font-medium text-sm">{task.title}</p>
                                            <div className="mt-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {col.id !== 'done' && (
                                                    <button
                                                        onClick={() => moveTask(task.id, 'done')}
                                                        className="text-xs text-green-400 hover:text-green-300"
                                                    >
                                                        Complete
                                                    </button>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KanbanBoard;
