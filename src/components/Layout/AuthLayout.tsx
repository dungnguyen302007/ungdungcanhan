import React, { useState } from 'react';
import { LoginPage } from '../Auth/LoginPage';
import { RegisterPage } from '../Auth/RegisterPage';
import { useAuthStore } from '../../store/useAuthStore';

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    const { user } = useAuthStore();
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    // If user is logged in, show the App
    if (user) {
        return <>{children}</>;
    }

    // Otherwise, show Auth screens
    if (authMode === 'login') {
        return <LoginPage onSwitchToRegister={() => setAuthMode('register')} />;
    }

    return <RegisterPage onSwitchToLogin={() => setAuthMode('login')} />;
};
