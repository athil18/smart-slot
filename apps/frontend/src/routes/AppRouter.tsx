import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../design-system';

// Lazy load pages
const BrowseSlots = lazy(() => import('../pages/client/BrowseSlots'));
const MyAppointments = lazy(() => import('../pages/client/MyAppointments'));
const AppointmentDetail = lazy(() => import('../pages/client/AppointmentDetail'));
const StaffDashboard = lazy(() => import('../pages/staff/StaffDashboard'));
const ManageSlots = lazy(() => import('../pages/staff/ManageSlots'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const LandingPage = lazy(() => import('../pages/public/LandingPage'));
const Login = lazy(() => import('../pages/Login'));
const Register = lazy(() => import('../pages/Register'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResourceManager = lazy(() => import('../pages/ResourceManager'));
const UsersPage = lazy(() => import('../pages/admin/UsersPage'));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const PromptAuditor = lazy(() => import('../pages/admin/PromptAuditor'));

// Role-Specific Dashboards
const SimplifiedBooking = lazy(() => import('../pages/dashboard/SimplifiedBooking'));
const AdvancedBooking = lazy(() => import('../pages/dashboard/AdvancedBooking'));
const VIPDashboard = lazy(() => import('../pages/dashboard/VIPDashboard'));
const BookingMarketplace = lazy(() => import('../pages/dashboard/BookingMarketplace'));
const SlotTemplateBuilder = lazy(() => import('../pages/dashboard/SlotTemplateBuilder'));
const KanbanBoard = lazy(() => import('../components/tasks/KanbanBoard'));
const OnboardingJourney = lazy(() => import('../pages/public/OnboardingJourney'));
const CategoryExplorer = lazy(() => import('../pages/public/CategoryExplorer'));

// Helper function for role-based dashboard routing
const getDashboardByRole = (role?: string) => {
    if (!role) return <SimplifiedBooking />;

    switch (role) {
        case 'admin':
            return <AdminDashboard />;
        case 'politician':
            return <VIPDashboard />;
        case 'scientist':
        case 'entrepreneur':
            return <AdvancedBooking />;
        case 'staff':
            return <StaffDashboard />;
        case 'retiree':
        case 'student':
        case 'client': // Backward compatibility
        default:
            return <SimplifiedBooking />;
    }
};

const PrivateRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
    const { user, authState } = useAuth();
    const location = useLocation();

    if (authState === 'loading') return <LoadingState fullScreen />;

    if (authState === 'unauthenticated' || !user) {
        // Preserve intended destination in location state
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

const AppRouter = () => {
    const { user } = useAuth();

    return (
        <Suspense fallback={<LoadingState fullScreen />}>
            <Routes>
                <Route element={<MainLayout />}>
                    {/* Public Routes */}
                    <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
                    <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
                    <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
                    <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPassword />} />
                    <Route path="/onboarding" element={<OnboardingJourney />} />
                    <Route path="/explorer" element={<CategoryExplorer />} />

                    {/* Discovery Dashboard - Open to Guests */}
                    <Route path="/dashboard" element={getDashboardByRole(user?.role)} />

                    {/* Booking Routes - Discovery is Public, Confirmation inside will gate auth */}
                    <Route path="/market" element={<BookingMarketplace />} />
                    <Route path="/slots" element={<BrowseSlots />} />

                    {/* Protected Routes for Auth'd Users */}
                    <Route path="/appointments" element={<PrivateRoute><MyAppointments /></PrivateRoute>} />
                    <Route path="/appointments/:id" element={<PrivateRoute><AppointmentDetail /></PrivateRoute>} />

                    {/* Advanced Booking - Only for specific roles */}
                    <Route path="/advanced-booking" element={
                        <PrivateRoute roles={['scientist', 'entrepreneur']}>
                            <AdvancedBooking />
                        </PrivateRoute>
                    } />

                    {/* VIP Routes - Politicians */}
                    <Route path="/vip" element={<PrivateRoute roles={['politician']}><VIPDashboard /></PrivateRoute>} />

                    {/* Staff Routes */}
                    <Route path="/staff/dashboard" element={<PrivateRoute roles={['staff']}><StaffDashboard /></PrivateRoute>} />
                    <Route path="/staff/slots" element={<PrivateRoute roles={['staff']}><ManageSlots /></PrivateRoute>} />
                    <Route path="/tasks" element={<PrivateRoute><KanbanBoard /></PrivateRoute>} />

                    {/* Admin Routes - Protected by role check */}
                    <Route path="/admin/dashboard" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                    <Route path="/admin/users" element={<PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>} />
                    <Route path="/admin/resources" element={<PrivateRoute roles={['admin']}><ResourceManager /></PrivateRoute>} />
                    <Route path="/admin/logs" element={<PrivateRoute roles={['admin']}><AuditLogs /></PrivateRoute>} />
                    <Route path="/admin/templates" element={<PrivateRoute roles={['admin']}><SlotTemplateBuilder /></PrivateRoute>} />
                    <Route path="/admin/auditor" element={<PrivateRoute roles={['admin']}><PromptAuditor /></PrivateRoute>} />
                </Route>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Suspense>
    );
};

export default AppRouter;
