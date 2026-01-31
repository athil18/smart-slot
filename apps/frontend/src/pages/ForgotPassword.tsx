import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '../design-system';
import { forgotPasswordSchema, ForgotPasswordInput } from '../schemas/auth.schema';

const ForgotPassword: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(forgotPasswordSchema)
    });

    const navigate = useNavigate();
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const onSubmit = async (_data: ForgotPasswordInput) => {
        setIsLoading(true);
        // Mock API call simulation
        setTimeout(() => {
            setIsSubmitted(true);
            setIsLoading(false);
        }, 1500);
    };

    if (isSubmitted) {
        return (
            <div className="ds-auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <Card style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{ marginBottom: 'var(--space-4)', fontSize: '48px' }}>check_circle</div>
                    <h2 style={{ margin: '0 0 var(--space-2) 0' }}>Check your email</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                        We've sent password reset instructions to your email address.
                    </p>
                    <Button variant="primary" fullWidth onClick={() => navigate('/login')}>
                        Return to Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="ds-auth-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <Card style={{ width: '100%', maxWidth: '400px' }} header={<h2 style={{ textAlign: 'center', margin: 0 }}>Reset Password</h2>}>
                <p style={{ textAlign: 'center', marginBottom: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="your@email.com"
                        fullWidth
                        {...register('email')}
                        error={errors.email?.message}
                    />

                    <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
                        {isLoading ? 'Sending Link...' : 'Send Reset Link'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                        Back to Login
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ForgotPassword;
