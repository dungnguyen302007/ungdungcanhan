import React from 'react';
import { Wallet } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
                        Quản Lý Chi Tiêu
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-sm">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                </div>
            </div>
        </header>
    );
};
