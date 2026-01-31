import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import apiClient, { setAccessToken, ApiResponse } from '@/api/apiClient';
import { User, AuthResponse } from '@smartslot/shared';

/**
 * Authentication states (per PROMPT_AUDIT prompt_15):
 * - loading: Initial state, checking auth
 * - authenticated: User is logged in
 * - unauthenticated: User not logged in or session expired
 */
export type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextType {
    user: User | null;
    authState: AuthState;
    login: (email: string, password: string) => Promise<User>;
    register: (data: any) => Promise<User>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [authState, setAuthState] = useState<AuthState>('loading');

    // Initialize auth state by attempting to refresh existing session
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Attempt to refresh using HttpOnly cookie
                const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/refresh');
                if (data.success && data.data) {
                    setAccessToken(data.data.accessToken);
                    setUser(data.data.user);
                    setAuthState('authenticated');
                } else {
                    setAuthState('unauthenticated');
                }
            } catch {
                // No valid session - user needs to log in
                setAuthState('unauthenticated');
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<User> => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });

        if (!data.success || !data.data) {
            throw new Error(data.error?.message || 'Login failed');
        }

        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        setAuthState('authenticated');

        return data.data.user;
    }, []);

    const register = useCallback(async (registrationData: any): Promise<User> => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', registrationData);

        if (!data.success || !data.data) {
            throw new Error(data.error?.message || 'Registration failed');
        }

        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        setAuthState('authenticated');

        return data.data.user;
    }, []);

    const logout = useCallback(async (): Promise<void> => {
        try {
            await apiClient.post('/auth/logout');
        } finally {
            // Always clear local state, even if API call fails
            setAccessToken(null);
            setUser(null);
            setAuthState('unauthenticated');
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, authState, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
