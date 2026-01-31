import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import { Button } from '../design-system';

const MainLayout: React.FC = () => {
    const { user, logout } = useAuth();
    const role = user?.role;
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navLinks = [
        // Common
        {
            to: role === 'admin' ? '/admin/dashboard' : role === 'staff' ? '/staff/dashboard' : '/dashboard',
            label: 'Home',
            show: true, // Always show Home/Discovery
            icon: 'LayoutGrid'
        },

        // Student / Client / Research / VIP - Discovery routes are public
        {
            to: '/market',
            label: 'Marketplace',
            show: true, // Publicly visible
            icon: 'Store'
        },
        {
            to: '/appointments',
            label: 'My Bookings',
            show: !!role && ['client', 'student', 'retiree', 'scientist', 'entrepreneur', 'politician'].includes(role),
            icon: 'CalendarCheck'
        },

        // Staff
        { to: '/tasks', label: 'Task Board', show: !!role, icon: 'Kanban' }, // Available to all roles for now
        { to: '/staff/slots', label: 'Manage Slots', show: role === 'staff', icon: 'CalendarClock' },
        { to: '/staff/appointments', label: 'Bookings', show: role === 'staff', icon: 'Users' },

        // Admin
        { to: '/admin/templates', label: 'Schedule Templates', show: role === 'admin', icon: 'FilePlus' },
        { to: '/admin/users', label: 'Users', show: role === 'admin', icon: 'Users' },
        { to: '/admin/resources', label: 'Resources', show: role === 'admin', icon: 'Box' },
        { to: '/admin/logs', label: 'Audit Logs', show: role === 'admin', icon: 'FileText' },
        { to: '/admin/auditor', label: 'Prompt Auditor', show: role === 'admin', icon: 'ShieldAlert' },
    ].filter(link => link.show);

    return (
        <div className="min-h-screen bg-bg-dark text-text-main font-sans selection:bg-primary-500 selection:text-white flex overflow-hidden">
            {/* Ambient Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-glow/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Glass Sidebar (Desktop) */}
            <aside className="hidden h-screen w-72 sticky top-0 md:flex flex-col border-r border-white/5 bg-bg-card/30 backdrop-blur-xl z-50">
                <div className="p-6">
                    <NavLink to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-neon group-hover:scale-105 transition-transform duration-300">
                            S
                        </div>
                        <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-primary-400 transition-colors">
                            SmartSlot
                        </span>
                    </NavLink>
                </div>

                <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto custom-scrollbar">
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                clsx(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group",
                                    isActive
                                        ? "text-white bg-primary-500/10 border border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                                        : "text-text-muted hover:text-white hover:bg-white/5 border border-transparent"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeNavIndicator"
                                            className="absolute left-0 w-1 h-6 bg-primary-500 rounded-r-full"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    )}
                                    <span className="relative z-10">{link.label}</span>
                                    {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary-400 shadow-neon" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/5 bg-white/5">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-surface-700 to-surface-600 border border-white/10 flex items-center justify-center font-bold text-primary-300">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                <p className="text-xs text-primary-400 capitalize">{user.role}</p>
                            </div>
                            <button onClick={logout} className="text-text-muted hover:text-white transition-colors">
                                <span className="sr-only">Logout</span>
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <NavLink to="/login">
                                <Button fullWidth variant="ghost" size="sm">Login</Button>
                            </NavLink>
                            <NavLink to="/register">
                                <Button fullWidth variant="primary" size="sm">Get Started</Button>
                            </NavLink>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-bg-card/80 backdrop-blur-xl border-b border-white/10 px-4 h-16 flex items-center justify-between">
                <NavLink to="/" className="font-display font-bold text-xl text-white">SmartSlot</NavLink>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-white p-2">
                    {isMobileMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 relative z-10 h-screen overflow-y-auto overflow-x-hidden md:p-8 pt-20 px-4 scroll-smooth">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="w-full max-w-7xl mx-auto pb-20"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 z-40 bg-bg-dark/95 backdrop-blur-xl md:hidden flex flex-col pt-20 px-6 gap-4"
                >
                    {navLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) => clsx("text-lg font-medium py-2 border-b border-white/5", isActive ? "text-primary-400" : "text-white")}
                        >
                            {link.label}
                        </NavLink>
                    ))}
                    <div className="mt-8 border-t border-white/10 pt-8">
                        {user ? (
                            <Button fullWidth onClick={() => { logout(); setIsMobileMenuOpen(false); }}>Logout</Button>
                        ) : (
                            <div className="space-y-3">
                                <NavLink to="/login" onClick={() => setIsMobileMenuOpen(false)}><Button fullWidth variant="ghost">Login</Button></NavLink>
                                <NavLink to="/register" onClick={() => setIsMobileMenuOpen(false)}><Button fullWidth variant="primary">Register</Button></NavLink>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MainLayout;
