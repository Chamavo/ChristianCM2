import React from 'react';
import { LogOut } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { motion } from 'framer-motion';

interface LogoutButtonProps {
    className?: string;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ className = "" }) => {
    const { logout } = useUser();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className={`flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full font-bold border-2 border-red-100 hover:bg-red-100 hover:border-red-200 transition-colors shadow-sm ${className}`}
        >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
        </motion.button>
    );
};

export default LogoutButton;
