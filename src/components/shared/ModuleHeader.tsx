import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, LucideIcon } from 'lucide-react';

interface ModuleHeaderProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    onBack: () => void;
    colorClass?: string;
    variant?: 'orthographe' | 'maths' | 'concentration';
}

const variantStyles = {
    orthographe: "text-orange-600",
    maths: "text-blue-600",
    concentration: "text-purple-600",
};

const iconBgStyles = {
    orthographe: "bg-orange-100",
    maths: "bg-blue-100",
    concentration: "bg-purple-100",
};

const ModuleHeader: React.FC<ModuleHeaderProps> = ({
    title,
    subtitle,
    icon: Icon,
    onBack,
    variant = 'maths'
}) => {
    return (
        <div className="w-full max-w-6xl flex items-center justify-between mb-8 px-4">
            <motion.button
                whileHover={{ scale: 1.1, x: -5 }}
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="p-3 rounded-full bg-white shadow-md hover:bg-slate-50 transition-colors flex items-center gap-2 text-slate-600 font-black border-2 border-slate-100"
            >
                <ArrowLeft className="w-6 h-6" />
                <span className="hidden sm:inline">Retour</span>
            </motion.button>

            <div className="flex flex-col items-center flex-1">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className={`p-2 rounded-xl ${iconBgStyles[variant]}`}>
                            <Icon className={`w-6 h-6 ${variantStyles[variant]}`} />
                        </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tight">
                        {title}
                    </h1>
                </div>
                {subtitle && (
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="w-24 sm:w-32" /> {/* Spacer to center the title */}
        </div>
    );
};

export default ModuleHeader;
