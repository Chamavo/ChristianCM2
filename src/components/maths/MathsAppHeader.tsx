import React from 'react';
import { Home, LogOut, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MathsAppHeaderProps {
    title?: string;
    subtitle?: string;
    showBack?: boolean;
    onBack?: () => void;
    onHome?: () => void;
    onLogout?: () => void;
    variant?: 'default' | 'transparent';
    username?: string;
}

const MathsAppHeader: React.FC<MathsAppHeaderProps> = ({
    title,
    subtitle,
    showBack = false,
    onBack,
    onHome,
    onLogout,
    variant = 'default',
    username = 'Élève',
}) => {
    const bgClasses = {
        default: 'bg-card/80 backdrop-blur-md border-b border-border/50 shadow-lg',
        transparent: 'bg-transparent',
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`sticky top-0 z-40 px-4 py-3 ${bgClasses[variant]}`}
        >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {showBack && onBack && (
                        <Button onClick={onBack} variant="ghost" size="sm" className="flex items-center gap-1.5 shrink-0">
                            <ChevronLeft className="w-4 h-4" />
                            <span>Retour</span>
                        </Button>
                    )}

                    {!showBack && onHome && (
                        <Button onClick={onHome} variant="ghost" size="sm" className="flex items-center gap-1.5 shrink-0">
                            <Home className="w-4 h-4" />
                            <span>Accueil</span>
                        </Button>
                    )}

                    {(title || subtitle) && (
                        <div className="min-w-0 flex-1 ml-2">
                            {title && <h1 className="text-lg font-bold truncate">{title}</h1>}
                            {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {onLogout && (
                        <Button onClick={onLogout} variant="ghost" size="icon" className="text-foreground/60 hover:text-destructive">
                            <LogOut className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>
        </motion.header>
    );
};

export default MathsAppHeader;
