import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';
import userEvent from '@testing-library/user-event';

describe('Button Component', () => {
    describe('Rendering', () => {
        it('renders children text', () => {
            render(<Button>Click Me</Button>);
            expect(screen.getByText('Click Me')).toBeInTheDocument();
        });

        it('renders as button element by default', () => {
            render(<Button>Submit</Button>);
            const button = screen.getByRole('button', { name: 'Submit' });
            expect(button.tagName).toBe('BUTTON');
        });
    });

    describe('Variants', () => {
        it('applies primary variant class', () => {
            render(<Button variant="primary">Primary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('ds-button--primary');
        });

        it('applies secondary variant class', () => {
            render(<Button variant="secondary">Secondary</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('ds-button--secondary');
        });

        it('applies ghost variant class', () => {
            render(<Button variant="ghost">Ghost</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('ds-button--ghost');
        });
    });

    describe('Sizes', () => {
        it('applies small size class', () => {
            render(<Button size="sm">Small</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('ds-button--sm');
        });

        it('applies large size class', () => {
            render(<Button size="lg">Large</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('ds-button--lg');
        });
    });

    describe('States', () => {
        it('disables button when disabled prop is true', () => {
            render(<Button disabled>Disabled</Button>);
            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('applies fullWidth class when fullWidth prop is true', () => {
            render(<Button fullWidth>Full Width</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveClass('ds-button--full');
        });
    });

    describe('Interactions', () => {
        it('calls onClick handler when clicked', async () => {
            const handleClick = vi.fn();
            const user = userEvent.setup();

            render(<Button onClick={handleClick}>Click Me</Button>);
            await user.click(screen.getByRole('button'));

            expect(handleClick).toHaveBeenCalledTimes(1);
        });

        it('does not call onClick when disabled', async () => {
            const handleClick = vi.fn();
            const user = userEvent.setup();

            render(<Button onClick={handleClick} disabled>Disabled</Button>);
            await user.click(screen.getByRole('button'));

            expect(handleClick).not.toHaveBeenCalled();
        });
    });

    describe('Type Attribute', () => {
        it('does not set type attribute by default (browser defaults to submit)', () => {
            render(<Button>Default</Button>);
            const button = screen.getByRole('button');
            // HTML buttons default to type="submit" if not specified
            expect(button).not.toHaveAttribute('type');
        });

        it('accepts type="submit"', () => {
            render(<Button type="submit">Submit</Button>);
            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'submit');
        });
    });
});
