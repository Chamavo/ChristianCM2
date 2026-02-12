import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
    imageUrl?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    name = 'User',
    size = 'md',
    className,
    imageUrl
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-lg',
        xl: 'w-24 h-24 text-xl'
    };

    const initial = name.charAt(0).toUpperCase();

    const getColorClass = (char: string) => {
        const colors = [
            'bg-red-500', 'bg-orange-500', 'bg-amber-500',
            'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
            'bg-cyan-500', 'bg-sky-500', 'bg-blue-500',
            'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
            'bg-fuchsia-500', 'bg-pink-500', 'bg-rose-500'
        ];
        const index = char.charCodeAt(0) % colors.length;
        return colors[index];
    };

    const bgColor = getColorClass(initial);

    if (imageUrl) {
        return (
            <div className={`relative rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 ${sizeClasses[size]} ${className}`}>
                <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className={`relative rounded-full flex items-center justify-center font-bold text-white border-2 border-white shadow-sm shrink-0 ${bgColor} ${sizeClasses[size]} ${className}`}>
            {initial}
        </div>
    );
};

export default Avatar;
