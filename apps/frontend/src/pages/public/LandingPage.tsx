import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../../design-system';
import './LandingPage.css';

const LandingPage: React.FC = () => {
    return (
        <div className="landing-page">
            {/* 1. Hero Section */}
            <section className="section-hero">
                <div className="section-content">
                    <div className="text-col">
                        <h2>The Future of<br />Resource Management.</h2>
                        <p>SmartSlot replaces chaos with mathematical precision. Manage labs, equipment, and conference rooms with zero conflicts.</p>
                        <div className="flex flex-wrap gap-4">
                            <NavLink to="/onboarding">
                                <Button variant="primary" size="lg" className="shadow-neon">Explore Services</Button>
                            </NavLink>
                            <NavLink to="/register">
                                <Button variant="secondary" size="lg">Join Now</Button>
                            </NavLink>
                        </div>
                    </div>
                    <div className="visual-col">
                        <div className="glass-showcase p-8">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                <span className="text-sm text-gray-300 font-medium">Live Booking Data</span>
                            </div>
                            <div className="mb-4">
                                <h3 className="text-2xl font-bold text-white mb-1">Weekly Overview</h3>
                                <p className="text-sm text-gray-400">Active bookings this week</p>
                            </div>
                            <div className="h-64 w-full">
                                <svg viewBox="0 0 280 180" className="w-full h-full">
                                    {/* Bar Chart */}
                                    {[
                                        { day: 'Mon', value: 30, x: 20 },
                                        { day: 'Tue', value: 45, x: 70 },
                                        { day: 'Wed', value: 60, x: 120 },
                                        { day: 'Thu', value: 55, x: 170 },
                                        { day: 'Fri', value: 70, x: 220 }
                                    ].map((bar, i) => (
                                        <g key={i}>
                                            <rect
                                                x={bar.x}
                                                y={140 - bar.value}
                                                width="35"
                                                height={bar.value}
                                                fill="url(#barGradient)"
                                                rx="4"
                                                className="animate-pulse-slow"
                                                style={{ animationDelay: `${i * 0.1}s` }}
                                            />
                                            <text
                                                x={bar.x + 17.5}
                                                y={155}
                                                fill="#94a3b8"
                                                fontSize="11"
                                                textAnchor="middle"
                                            >
                                                {bar.day}
                                            </text>
                                            <text
                                                x={bar.x + 17.5}
                                                y={135 - bar.value}
                                                fill="#fff"
                                                fontSize="12"
                                                fontWeight="bold"
                                                textAnchor="middle"
                                            >
                                                {bar.value}
                                            </text>
                                        </g>
                                    ))}
                                    <defs>
                                        <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. Client Section */}
            <section className="section-client">
                <div className="section-content">
                    <div className="visual-col">
                        <div className="glass-showcase flex items-center justify-center">
                            <div className="p-8 text-center">
                                <span className="text-6xl mb-4 block">📅</span>
                                <h3 className="text-2xl font-bold text-white">Instant Booking</h3>
                            </div>
                        </div>
                    </div>
                    <div className="text-col">
                        <h2>For Clients:<br />Frictionless Access.</h2>
                        <p>Browse availability in real-time. Book high-demand resources in seconds. Receive instant confirmations.</p>
                        <NavLink to="/explorer">
                            <Button variant="secondary" className="text-white border-white/20 hover:bg-white/10">Browse Explorer</Button>
                        </NavLink>
                    </div>
                </div>
            </section>

            {/* 3. Staff Section */}
            <section className="section-staff">
                <div className="section-content">
                    <div className="text-col">
                        <h2>For Staff:<br />Command Your Schedule.</h2>
                        <p>Define recurring availability windows. Managing 10 weeks of slots takes just one click.</p>
                        <NavLink to="/login">
                            <Button variant="secondary" className="text-white border-white/20 hover:bg-white/10">Staff Login</Button>
                        </NavLink>
                    </div>
                    <div className="visual-col">
                        <div className="glass-showcase flex items-center justify-center">
                            <div className="grid grid-cols-3 gap-2 w-64">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className={`h-12 rounded border border-white/10 ${i % 2 === 0 ? 'bg-primary-500/40' : 'bg-transparent'}`}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. Admin Section */}
            <section className="section-admin">
                <div className="section-content">
                    <div className="visual-col">
                        <div className="glass-showcase relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative z-10 flex items-center justify-center h-full">
                                <span className="text-6xl">🛡️</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-col">
                        <h2>For Admins:<br />Total Control.</h2>
                        <p>Monitor system health. Audit every action. Manage users and resources with military-grade precision.</p>
                        <NavLink to="/login">
                            <Button variant="secondary" className="text-white border-white/20 hover:bg-white/10">Admin Console</Button>
                        </NavLink>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="section-testimonials py-24">
                <div className="section-content flex-col !grid-cols-1">
                    <div className="text-center mb-16">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <span className="text-yellow-400 text-2xl">⭐⭐⭐⭐⭐</span>
                            <span className="text-sm text-gray-400">4.9/5 from 200+ institutions</span>
                        </div>
                        <h2 className="text-4xl font-bold text-white">Loved by Students & Staff</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Testimonial 1 */}
                        <div className="glass-card p-8">
                            <p className="text-lg text-gray-300 mb-6 italic leading-relaxed">
                                "SmartSlot reduced our lab booking conflicts from 20+ per week to zero.
                                The time savings are incredible."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">SC</div>
                                <div>
                                    <p className="font-semibold text-white">Dr. Sarah Chen</p>
                                    <p className="text-sm text-gray-400">Chemistry Department Head, MIT</p>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="glass-card p-8">
                            <p className="text-lg text-gray-300 mb-6 italic leading-relaxed">
                                "Students can finally book 3D printers without standing in line.
                                Game changer for our maker space."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center text-white font-bold">MR</div>
                                <div>
                                    <p className="font-semibold text-white">Marcus Rodriguez</p>
                                    <p className="text-sm text-gray-400">Makerspace Coordinator, Stanford</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Integration Showcase */}
            <section className="section-integrations py-24 bg-bg-dark">
                <div className="section-content flex-col !grid-cols-1 text-center">
                    <h3 className="text-blue-400 uppercase tracking-wider text-sm font-semibold mb-4">
                        INTEGRATIONS
                    </h3>
                    <h2 className="text-4xl font-bold text-white mb-4">
                        Connect your apps with SmartSlot
                    </h2>
                    <p className="text-gray-400 mb-12 max-w-2xl mx-auto text-lg">
                        Effortlessly integrate your existing tech stack—from collaboration platforms
                        and SAML SSO to Google Workspace and Microsoft 365.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center max-w-4xl mx-auto mb-12">
                        {/* Google Workspace */}
                        <div className="integration-icon text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">🔵</div>
                            <p className="text-sm text-gray-400">Google Workspace</p>
                        </div>

                        {/* Microsoft 365 */}
                        <div className="integration-icon text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">🟦</div>
                            <p className="text-sm text-gray-400">Microsoft 365</p>
                        </div>

                        {/* Slack */}
                        <div className="integration-icon text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">💬</div>
                            <p className="text-sm text-gray-400">Slack</p>
                        </div>

                        {/* Zoom */}
                        <div className="integration-icon text-center">
                            <div className="w-20 h-20 mx-auto mb-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">📹</div>
                            <p className="text-sm text-gray-400">Zoom</p>
                        </div>
                    </div>

                    <NavLink to="/register">
                        <Button variant="primary" size="lg" className="shadow-neon">
                            Request Demo →
                        </Button>
                    </NavLink>
                </div>
            </section>

            {/* Footer */}
            <footer className="section-footer py-20 border-t border-white/10 bg-bg-dark text-center">
                <div className="section-content flex-col !h-auto">
                    <div className="mb-12">
                        <h2 className="text-3xl font-display font-bold text-white mb-4">Ready to upgrade?</h2>
                        <NavLink to="/register">
                            <Button variant="primary" size="lg" className="shadow-neon">Start Free Trial</Button>
                        </NavLink>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left w-full border-t border-white/5 pt-12">
                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-text-muted text-sm">
                                <li><a href="#" className="hover:text-primary-400">Features</a></li>
                                <li><a href="#" className="hover:text-primary-400">Integrations</a></li>
                                <li><a href="#" className="hover:text-primary-400">Pricing</a></li>
                                <li><a href="#" className="hover:text-primary-400">Changelog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Company</h4>
                            <ul className="space-y-2 text-text-muted text-sm">
                                <li><a href="#" className="hover:text-primary-400">About</a></li>
                                <li><a href="#" className="hover:text-primary-400">Careers</a></li>
                                <li><a href="#" className="hover:text-primary-400">Blog</a></li>
                                <li><a href="#" className="hover:text-primary-400">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Legal</h4>
                            <ul className="space-y-2 text-text-muted text-sm">
                                <li><a href="#" className="hover:text-primary-400">Privacy</a></li>
                                <li><a href="#" className="hover:text-primary-400">Terms</a></li>
                                <li><a href="#" className="hover:text-primary-400">Security</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4">Social</h4>
                            <div className="flex gap-4">
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">𝕏</a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">In</a>
                                <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary-500 transition-colors">G</a>
                            </div>
                        </div>
                    </div>
                    <div className="mt-12 text-text-muted text-xs">
                        © 2026 SmartSlot Inc. All rights reserved. Designed by Antigravity.
                    </div>
                </div>
            </footer>
        </div >
    );
};

export default LandingPage;
