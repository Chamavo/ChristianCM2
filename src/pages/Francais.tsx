import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ProgressionView } from '@/components/orthographe/ProgressionView';
import FrenchLanding from '../components/orthographe/FrenchLanding';
import { DicteeModule } from '@/components/orthographe/DicteeModule';
import { EtudeTexteModule } from '@/components/orthographe/EtudeTexteModule';
import { useProgressionModule } from '@/hooks/useProgressionModule';
import { useNavigate } from 'react-router-dom';
import ModulePageLayout from '@/components/shared/ModulePageLayout';

type View = 'home' | 'progression' | 'dictee' | 'etude' | 'orthographe';

const FrancaisPage = () => {
    const [view, setView] = useState<View>('home');
    const [studentName] = useState('Christian');
    const navigate = useNavigate();

    // Use the primary hook for French progression
    const {
        progress,
        overallPercentage,
        status
    } = useProgressionModule(studentName);

    const handleModuleSelect = useCallback((module: string) => {
        switch (module) {
            case 'progression':
                setView('progression');
                break;
            case 'dictee':
                setView('dictee');
                break;
            case 'etude':
                setView('etude');
                break;
            default:
                toast.info("Ce module sera bientôt disponible !");
        }
    }, []);

    const handleBackToMenu = useCallback(() => {
        setView('home');
    }, []);

    const handleExit = useCallback(() => {
        navigate('/');
    }, [navigate]);

    return (
        <ModulePageLayout>
            {view === 'home' && (
                <FrenchLanding
                    studentName={studentName}
                    onModuleSelect={handleModuleSelect as any}
                    onBack={handleExit}
                />
            )}

            {view === 'progression' && (
                <ProgressionView
                    studentName={studentName}
                    onComplete={handleBackToMenu}
                    onBack={handleBackToMenu}
                />
            )}

            {view === 'dictee' && (
                <DicteeModule onBack={handleBackToMenu} />
            )}

            {view === 'etude' && (
                <EtudeTexteModule onBack={handleBackToMenu} />
            )}

            {view !== 'home' && view !== 'progression' && view !== 'dictee' && view !== 'etude' && (
                <div className="flex flex-col items-center justify-center p-8 text-center bg-white/40 backdrop-blur-md rounded-[48px] border-4 border-white shadow-2xl max-w-2xl mx-auto my-20">
                    <h2 className="text-4xl font-black text-slate-800 mb-6 uppercase tracking-tight">Module en construction</h2>
                    <p className="text-xl text-slate-500 font-bold mb-10">La vue "{view}" est en cours d'intégration.</p>
                    <button
                        onClick={handleBackToMenu}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-10 rounded-[28px] shadow-xl border-b-8 border-blue-800 transition-all active:translate-y-1 active:border-b-4"
                    >
                        Retour au menu
                    </button>
                </div>
            )}
        </ModulePageLayout>
    );
};

export default FrancaisPage;
