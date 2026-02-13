import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Sparkles, User, ArrowRight } from 'lucide-react';

const LoginScreen = () => {
    const { login } = useUser();
    const [name, setName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            login(name);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[48px] p-8 md:p-16 shadow-2xl max-w-lg w-full text-center border-4 border-white"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center relative">
                        <User className="w-12 h-12 text-indigo-500" />
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-2 -right-2 bg-yellow-400 p-2 rounded-full border-4 border-white"
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                    </div>
                </div>

                <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
                    Bienvenue !
                </h1>
                <p className="text-xl text-slate-500 font-bold mb-8">
                    Qui es-tu, champion ?
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Ton prénom (ex: Christian)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-center text-2xl py-8 rounded-[24px] border-4 border-slate-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 font-bold placeholder:font-medium"
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={!name.trim()}
                        className="w-full py-8 text-xl font-black rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl border-b-8 border-indigo-800 active:transform active:translate-y-1 active:border-b-4 transition-all"
                    >
                        COMMENCER <ArrowRight className="ml-2 w-6 h-6" strokeWidth={3} />
                    </Button>
                </form>

                <div className="mt-8 pt-8 border-t-2 border-slate-50">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                        ChristianCM2 • Apprentissage ludique
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginScreen;
