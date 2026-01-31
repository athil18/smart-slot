import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import FormField from './FormField';

// Wrapper component to provide react-hook-form context
const FormFieldWrapper = ({ error }: { error?: any }) => {
    const { register } = useForm();
    return (
        <FormField
            name="email"
            label="Email Address"
            type="email"
            placeholder="your@email.com"
            register={register}
            error={error}
        />
    );
};

describe('FormField Component', () => {
    describe('Rendering', () => {
        it('renders label and input field', () => {
            render(<FormFieldWrapper />);

            expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
        });

        it('renders with correct input type', () => {
            render(<FormFieldWrapper />);

            const input = screen.getByLabelText('Email Address');
            expect(input).toHaveAttribute('type', 'email');
        });
    });

    describe('Error Handling', () => {
        it('displays error message when error prop is provided', () => {
            const error = { message: 'Email is required' };
            render(<FormFieldWrapper error={error} />);

            expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
        });

        it('adds error class to input when error exists', () => {
            const error = { message: 'Invalid email format' };
            render(<FormFieldWrapper error={error} />);

            const input = screen.getByLabelText('Email Address');
            expect(input).toHaveClass('ds-input-error');
        });

        it('does not display error message when no error', () => {
            render(<FormFieldWrapper />);

            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA attributes when error exists', () => {
            const error = { message: 'Invalid email' };
            render(<FormFieldWrapper error={error} />);

            const input = screen.getByLabelText('Email Address');
            expect(input).toHaveAttribute('aria-invalid', 'true');
            expect(input).toHaveAttribute('aria-describedby');
        });

        it('error message has role="alert" for screen readers', () => {
            const error = { message: 'Email is required' };
            render(<FormFieldWrapper error={error} />);

            const errorMessage = screen.getByText(/Email is required/i);
            expect(errorMessage).toHaveAttribute('role', 'alert');
        });

        it('associates label with input via htmlFor and id', () => {
            render(<FormFieldWrapper />);

            const label = screen.getByText('Email Address');
            const input = screen.getByLabelText('Email Address');

            expect(label).toHaveAttribute('for', input.id);
        });
    });
});
