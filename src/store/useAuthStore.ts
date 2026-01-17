import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppUser } from '../types';

interface AuthState {
    user: AppUser | null;
    isLoading: boolean;
    setUser: (user: AppUser | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isLoading: true,
            setUser: (user) => set({ user }),
            setLoading: (loading) => set({ isLoading: loading }),
            logout: () => set({ user: null }),
        }),
        {
            name: 'auth-storage',
            version: 1,
        }
    )
);
