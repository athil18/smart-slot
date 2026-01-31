import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Monitor, FlaskConical, Printer, Coffee } from 'lucide-react';
import { Card } from '../../design-system/Card.tsx';
import { Button } from '../../design-system/Button.tsx';

const resources = [
    { id: '1', name: 'Chemistry Lab', icon: FlaskConical, color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'Secure a spot for experiments.' },
    { id: '2', name: '3D Printer', icon: Printer, color: 'text-orange-400', bg: 'bg-orange-400/10', desc: 'Print your CAD designs.' },
    { id: '3', name: 'Study Pod', icon: Coffee, color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Quiet space for focus.' },
    { id: '4', name: 'Computer Lab', icon: Monitor, color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'High-spec workstations.' },
];

const BookingMarketplace: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-display font-bold text-white">What do you need today?</h1>
                <p className="text-text-muted text-lg">Select a resource to book a slot instantly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                    <motion.div
                        key={resource.id}
                        whileHover={{ y: -5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Card className="h-full border border-white/5 hover:border-primary-500/50 hover:shadow-neon transition-all cursor-pointer group" onClick={() => navigate(`/slots?resource=${resource.id}`)}>
                            <div className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className={`w-16 h-16 rounded-2xl ${resource.bg} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                                    <resource.icon className={`w-8 h-8 ${resource.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white">{resource.name}</h3>
                                <p className="text-text-muted">{resource.desc}</p>
                                <div className="pt-4 w-full">
                                    <Button fullWidth variant="ghost" className="group-hover:bg-primary-500 group-hover:text-white transition-colors">
                                        Check Availability
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default BookingMarketplace;
