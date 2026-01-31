import React, { useEffect } from 'react';
import './Toast.css';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
    variant?: ToastVariant;
    message: string;
    duration?: number;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
    variant = 'info',
    message,
    duration = 3000,
    onClose
}) => {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ'
    };

    return (
        <div
            className={`ds-toast ds-toast--${variant}`}
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
        >
            <span className="ds-toast-icon" aria-hidden="true">
                {icons[variant]}
            </span>
            <span className="ds-toast-message">{message}</span>
            <button
                className="ds-toast-close"
                onClick={onClose}
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    );
};

// Toast Container Hook
import { useState, useCallback } from 'react';

export interface ToastItem {
    id: string;
    variant: ToastVariant;
    message: string;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const addToast = useCallback((variant: ToastVariant, message: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, variant, message }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return { toasts, addToast, removeToast };
};

// Toast Container Component
export const ToastContainer: React.FC<{ toasts: ToastItem[]; removeToast: (id: string) => void }> = ({
    toasts,
    removeToast
}) => {
    return (
        <div className="ds-toast-container" aria-live="polite" aria-atomic="false">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    variant={toast.variant}
                    message={toast.message}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </div>
    );
};
