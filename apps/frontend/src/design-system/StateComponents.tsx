import React from 'react';
import './StateComponents.css';

export interface LoadingStateProps {
    fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ fullScreen }) => (
    <div className={`ds-state-container ds-loading-state ${fullScreen ? 'ds-loading-fullscreen' : ''}`} aria-label="Loading content">
        <div className="ds-skeleton ds-skeleton-header"></div>
        <div className="ds-skeleton-grid">
            <div className="ds-skeleton ds-skeleton-card"></div>
            <div className="ds-skeleton ds-skeleton-card"></div>
            <div className="ds-skeleton ds-skeleton-card"></div>
        </div>
    </div>
);

export interface EmptyStateProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, actionLabel, onAction, icon = '📭' }) => (
    <div className="ds-state-container ds-empty-state">
        <span className="ds-state-icon" aria-hidden="true">{icon}</span>
        <p className="ds-state-message">{message}</p>
        {actionLabel && onAction && (
            <button className="ds-button ds-button--primary ds-button--md" onClick={onAction}>
                {actionLabel}
            </button>
        )}
    </div>
);

export interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message = 'Failed to load data', onRetry }) => (
    <div className="ds-state-container ds-error-state">
        <span className="ds-state-icon" aria-hidden="true">⚠️</span>
        <p className="ds-state-message">{message}</p>
        {onRetry && (
            <button className="ds-button ds-button--secondary ds-button--md" onClick={onRetry}>
                Retry
            </button>
        )}
    </div>
);
