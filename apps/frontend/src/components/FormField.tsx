import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

export interface FormFieldProps {
    name: string;
    label: string;
    type?: 'text' | 'email' | 'password' | 'date' | 'select' | 'textarea';
    placeholder?: string;
    helperText?: string;
    options?: Array<{ value: string; label: string }>;
    register: UseFormRegister<any>;
    error?: FieldError;
    rows?: number; // For textarea
    [key: string]: any; // Additional props
}

export const FormFieldComponent: React.FC<FormFieldProps> = ({
    name,
    label,
    type = 'text',
    placeholder,
    helperText,
    options,
    register,
    error,
    rows = 4,
    ...rest
}) => {
    const fieldId = `field-${name}`;
    const errorId = `${fieldId}-error`;

    const baseInputStyles = `
        w-full px-4 py-2.5 rounded-lg bg-bg-dark/50 border border-white/10 
        text-white placeholder:text-text-muted/50 transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
        disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const errorInputStyles = 'border-error ring-1 ring-error/50 focus:ring-error';

    const renderInput = () => {
        const commonProps = {
            id: fieldId,
            className: `${baseInputStyles} ${error ? errorInputStyles : ''}`,
            'aria-invalid': !!error,
            'aria-describedby': error ? errorId : undefined,
            ...register(name),
            ...rest,
        };

        switch (type) {
            case 'select':
                return (
                    <select {...commonProps}>
                        <option value="">Select an option</option>
                        {options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                );

            case 'textarea':
                return <textarea {...commonProps} rows={rows} />;

            default:
                return <input type={type} placeholder={placeholder} {...commonProps} />;
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor={fieldId} className="text-sm font-medium text-text-muted ml-1">
                {label}
            </label>
            {renderInput()}
            {helperText && !error && <span className="text-xs text-text-subtle ml-1">{helperText}</span>}
            {error && (
                <span id={errorId} className="text-xs text-error font-medium flex items-center gap-1 ml-1" role="alert">
                    ⚠ {error.message}
                </span>
            )}
        </div>
    );
};

export const FormField = React.memo(FormFieldComponent);
export default FormField;
