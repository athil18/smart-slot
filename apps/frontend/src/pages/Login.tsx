import React from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button, Card } from '@/design-system';
import FormField from '@/components/FormField';
import { loginSchema, LoginInput } from '@/schemas/auth.schema';

const Login: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema)
    });

    const { login } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [isLoading, setIsLoading] = React.useState(false);

    // Get intended destination or default to /dashboard
    const from = (location.state as any)?.from?.pathname || '/dashboard';
    const isExpired = searchParams.get('expired') === 'true';

    const onSubmit = async (data: LoginInput) => {
        setIsLoading(true);
        try {
            const user = await login(data.email, data.password);

            addToast(`Welcome back, ${user.name}!`, 'success');

            // Role-aware redirect
            const defaultPath =
                user.role === 'admin' ? '/admin/dashboard' :
                    user.role === 'staff' ? '/staff/dashboard' :
                        '/dashboard';

            navigate(from !== '/dashboard' ? from : defaultPath, { replace: true });
        } catch (err: any) {
            const message = err.response?.data?.error?.message || err.message || 'Login failed. Please check your credentials.';
            addToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md relative">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary-500/10 blur-[100px] rounded-full pointer-events-none" />

                <Card
                    className="relative z-10"
                    header={
                        <div className="text-center">
                            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Welcome Back</h2>
                            <p className="text-sm text-text-muted mt-1 font-normal">Sign in to access your dashboard</p>
                        </div>
                    }
                >
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                        {isExpired && (
                            <div className="bg-warning/10 border border-warning/20 text-warning px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <span className="text-lg">⚠</span>
                                <div>Your session has expired. Please log in again.</div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <FormField
                                name="email"
                                label="Email"
                                type="email"
                                placeholder="name@company.com"
                                register={register}
                                error={errors.email}
                            />

                            <div className="space-y-1">
                                <FormField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    register={register}
                                    error={errors.password}
                                />
                                <div className="text-right">
                                    <Button variant="ghost" className="!text-xs !p-0 h-auto hover:bg-transparent text-primary-400 hover:text-primary-300" onClick={() => navigate('/forgot-password')} type="button">
                                        Forgot Password?
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <Button type="submit" variant="primary" className="w-full shadow-neon mt-2" disabled={isLoading}>
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center text-sm text-text-muted">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-primary-400 hover:text-primary-300 font-medium transition-colors hover:underline"
                        >
                            Create account
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Login;
