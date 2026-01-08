import React from 'react';
import { Header } from './Header';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans relative">
            {/* Decorative background blobs */}
            <div className="fixed -top-24 -left-24 w-96 h-96 bg-violet-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="fixed -top-24 -right-24 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <Header />
            <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-6 pt-32 space-y-8 relative z-10">
                {children}
            </main>
            <footer className="text-center p-6 text-gray-400 text-xs relative z-10">
                © {new Date().getFullYear()} Family Expense Tracker. Built with ❤️ for your family.
            </footer>
        </div>
    );
};
