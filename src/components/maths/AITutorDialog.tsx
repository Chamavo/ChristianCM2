import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AITutorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    message: string | null;
    isLoading: boolean;
    title?: string;
}

const AITutorDialog: React.FC<AITutorDialogProps> = ({
    isOpen,
    onClose,
    message,
    isLoading,
    title = "Ton tuteur t'explique 🤖"
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-1 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-card rounded-[1.4rem] p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        animate={{ rotate: [0, 10, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl"
                                    >
                                        <Bot className="w-6 h-6 text-white" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-foreground">{title}</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <div className="min-h-[120px] max-h-[300px] overflow-y-auto">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                            <Loader2 className="w-10 h-10 text-primary" />
                                        </motion.div>
                                        <p className="text-muted-foreground text-center">Je réfléchis à la meilleure façon de t'expliquer... 🤔</p>
                                    </div>
                                ) : message ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                        <div className="bg-muted/50 rounded-2xl p-4">
                                            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{message}</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Sparkles className="w-4 h-4 text-yellow-500" />
                                            <span>Continue à t'entraîner, tu vas y arriver ! 💪</span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                                        <p className="text-muted-foreground text-center">Un problème est survenu. Réessaie ! 🙏</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 flex justify-center">
                                <Button onClick={onClose} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8">
                                    J'ai compris ! ✨
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AITutorDialog;
