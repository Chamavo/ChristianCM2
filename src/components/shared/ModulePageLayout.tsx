import React from 'react';
import { motion } from 'framer-motion';
import FloatingBubbles from '@/components/FloatingBubbles';

interface ModulePageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const ModulePageLayout: React.FC<ModulePageLayoutProps> = ({ children, className = "" }) => {
    return (
        <div className={`min-h-screen relative overflow-hidden bg-white ${className}`}>
            {/* Decorative background elements */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <FloatingBubbles />

            <main className="relative z-10 flex flex-col items-center">
                {children}
            </main>
        </div>
    );
};

export default ModulePageLayout;
