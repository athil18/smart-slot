import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { Button, Card, Input, Select, SelectOption } from '../design-system';
import { registerSchema, RegisterInput } from '../schemas/auth.schema';

const ROLES: SelectOption[] = [
    { label: 'Student', value: 'student' },
    { label: 'Staff Member', value: 'staff' },
    { label: 'Scientist / Researcher', value: 'scientist' },
    { label: 'Entrepreneur / Founder', value: 'entrepreneur' },
    { label: 'Politician / Official', value: 'politician' },
    { label: 'Retiree / Senior', value: 'retiree' },
];

const ENHANCED_ROLES_FIELDS: Record<string, { label: string, key: string, placeholder: string }[]> = {
    student: [
        { label: 'School Name', key: 'organization', placeholder: 'e.g. MIT, Stanford' },
        { label: 'Student ID Number', key: 'studentId', placeholder: 'ID-12345' },
        { label: 'Expected Graduation', key: 'graduationYear', placeholder: '2026' },
    ],
    staff: [
        { label: 'Organization', key: 'organization', placeholder: 'e.g. University Health' },
        { label: 'Department', key: 'department', placeholder: 'e.g. IT, HR' },
        { label: 'Staff ID', key: 'staffId', placeholder: 'ST-9988' },
    ],
    scientist: [
        { label: 'Research Institution', key: 'organization', placeholder: 'e.g. CERN, NASA' },
        { label: 'Primary Department', key: 'department', placeholder: 'e.g. Astrophysics' },
        { label: 'Grant Number (Optional)', key: 'grantId', placeholder: 'G-776' },
        { label: 'Research Area', key: 'researchArea', placeholder: 'e.g. Quantum Computing' },
    ],
    entrepreneur: [
        { label: 'Company / Startup', key: 'organization', placeholder: 'e.g. TechNova' },
        { label: 'Business Tax ID (EIN)', key: 'taxId', placeholder: '12-3456789' },
        { label: 'Company Website', key: 'companyUrl', placeholder: 'https://technova.io' },
    ],
    politician: [
        { label: 'Government Body', key: 'organization', placeholder: 'e.g. US Senate' },
        { label: 'Current Office', key: 'officeName', placeholder: 'Senator' },
        { label: 'Constituency', key: 'constituency', placeholder: 'New York' },
    ],
    retiree: [
        { label: 'Community Center', key: 'organization', placeholder: 'e.g. Silver Peak Center' },
        { label: 'Membership / Pension ID', key: 'pensionScheme', placeholder: 'ID-4455' },
    ]
};

import { useToast } from '../context/ToastContext';

const Register: React.FC = () => {
    const { register, handleSubmit, control, formState: { errors } } = useForm<RegisterInput>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'student'
        }
    });

    const selectedRole = useWatch({ control, name: 'role' });
    const { register: authRegister } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: RegisterInput) => {
        setIsLoading(true);

        // Prepare verification data from dynamic fields
        const roleFields = ENHANCED_ROLES_FIELDS[data.role] || [];
        const verificationData: Record<string, any> = {};

        // Some fields like organization/department are root user fields
        // Others go into the generic verificationData JSON
        const rootUserFields = ['organization', 'department'];

        roleFields.forEach(field => {
            const value = (data as any)[field.key];
            if (!rootUserFields.includes(field.key)) {
                verificationData[field.key] = value;
            }
        });

        const finalData = {
            ...data,
            verificationData
        };

        try {
            await authRegister(finalData);
            addToast('Registration successful! Welcome aboard.', 'success');
            navigate('/dashboard');
        } catch (err: any) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            addToast(message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="ds-auth-container flex justify-center items-center min-h-[85vh] py-12">
            <Card className="w-full max-w-xl shadow-2xl border-white/5 bg-bg-card/40 backdrop-blur-2xl"
                header={
                    <div className="text-center">
                        <h2 className="text-2xl font-display font-bold text-white">Join SmartSlot</h2>
                        <div className="flex justify-center gap-2 mt-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`h-1.5 w-12 rounded-full transition-colors ${step >= i ? 'bg-primary-500 shadow-neon' : 'bg-white/10'}`} />
                            ))}
                        </div>
                    </div>
                }>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {/* Step 1: Account Credentials */}
                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                fullWidth
                                {...register('name')}
                                error={errors.name}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@example.com"
                                fullWidth
                                {...register('email')}
                                error={errors.email}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    fullWidth
                                    {...register('password')}
                                    error={errors.password}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
                                    fullWidth
                                    {...register('confirmPassword')}
                                    error={errors.confirmPassword}
                                />
                            </div>
                            <Button type="button" variant="primary" fullWidth onClick={nextStep} className="mt-4">
                                Continue to Role Selection
                            </Button>
                        </div>
                    )}

                    {/* Step 2: Role Selection */}
                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <Select
                                label="What best describes you?"
                                options={ROLES}
                                fullWidth
                                {...register('role')}
                                error={errors.role}
                            />
                            <p className="text-xs text-text-muted px-2 italic">
                                Note: Your selection determines available features and requires verification.
                            </p>
                            <div className="flex gap-4 mt-6">
                                <Button type="button" variant="ghost" className="flex-1" onClick={prevStep}>Back</Button>
                                <Button type="button" variant="primary" className="flex-[2]" onClick={nextStep}>Verification Details</Button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Role-Specific Verification */}
                    {step === 3 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h3 className="text-sm font-semibold text-primary-400 border-b border-primary-500/20 pb-2 mb-4">
                                Verification for {ROLES.find(r => r.value === selectedRole)?.label}
                            </h3>

                            <Input
                                label="Phone Number"
                                placeholder="+1 (555) 000-0000"
                                fullWidth
                                {...register('phone')}
                                error={errors.phone}
                            />

                            {ENHANCED_ROLES_FIELDS[selectedRole]?.map((field) => (
                                <Input
                                    key={field.key}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    fullWidth
                                    {...register(field.key as any)}
                                    error={(errors as any)[field.key]}
                                />
                            ))}

                            <div className="mt-6 p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 space-y-2">
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Privacy Note</p>
                                <p className="text-xs text-text-muted leading-relaxed">
                                    This information is used solely for background verification to grant specific scheduling privileges. All data is encrypted and handled per our institutional privacy policy.
                                </p>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button type="button" variant="ghost" className="flex-1" onClick={prevStep}>Back</Button>
                                <Button type="submit" variant="primary" className="flex-[2] shadow-neon" disabled={isLoading}>
                                    {isLoading ? 'Processing...' : 'Complete Registration'}
                                </Button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="text-center mt-8 text-sm text-text-muted">
                    Already have an account? <Button variant="ghost" size="sm" className="text-primary-400 hover:text-primary-300" onClick={() => navigate('/login')}>Sign In</Button>
                </p>
            </Card>
        </div>
    );
};

export default Register;
