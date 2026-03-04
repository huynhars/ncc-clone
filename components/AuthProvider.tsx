'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken } from '@/src/lib/api';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    login: (token: string) => void;
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const storedToken = getAuthToken();
        if (storedToken) {
            setToken(storedToken)
        }
    }, [])

    const login = (newToken: string) => {
        setToken(newToken)
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token_expiry')
    }

    return (
        <AuthContext.Provider value={{
            isAuthenticated: !!token,
            token,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
