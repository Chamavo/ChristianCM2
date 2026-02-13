import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MathDashboard from '@/components/maths/MathDashboard';
import MathSession from '@/components/maths/MathSession';
import MathLevelEnd from '@/components/maths/MathLevelEnd';
import ProblemesDashboard from '@/components/maths/ProblemesDashboard';
import ProblemeSession from '@/components/maths/ProblemeSession';
import MathLanding from '@/components/maths/MathLanding';
import { getCurrentLevel, updateCurrentLevel } from '@/utils/maths/levelBlockingSystem';
import { generateLevelExercises, Exercise } from '@/utils/maths/exerciseGenerator';
import { getProblem, MathProblem, TOTAL_PROBLEMS, getSolvedCount } from '@/utils/maths/problemManager';

type ViewState = 'landing' | 'calcul_dashboard' | 'calcul_session' | 'calcul_result' | 'problemes_dashboard' | 'probleme_session';

const Mathematiques: React.FC = () => {
    const navigate = useNavigate();
    const [currentView, setCurrentView] = useState<ViewState>('landing');
    const [username] = useState('Christian');

    // Calcul State
    const [level, setLevel] = useState(1);
    const [currentSessionLevel, setCurrentSessionLevel] = useState(1);
    const [exercises, setExercises] = useState<Exercise[]>([]);

    // Result state
    const [lastScore, setLastScore] = useState(0);
    const [lastTime, setLastTime] = useState(0);
    const [lastSuccess, setLastSuccess] = useState(false);

    // Problemes State
    const [selectedProblem, setSelectedProblem] = useState<MathProblem | null>(null);
    const [solvedCount, setSolvedCount] = useState(0);

    useEffect(() => {
        const loadInitialData = async () => {
            const l = await getCurrentLevel(username, 'progression');
            setLevel(l);
            setSolvedCount(getSolvedCount());
        };
        loadInitialData();
    }, [username, currentView]);

    // --- Calcul Logic ---
    const handleStartLevel = async (lvl: number) => {
        const newExercises = await generateLevelExercises(lvl);
        setExercises(newExercises.slice(0, 10));
        setCurrentSessionLevel(lvl);
        setCurrentView('calcul_session');
    };

    const handleSessionComplete = async (score: number, timeSpent: number) => {
        setLastScore(score);
        setLastTime(timeSpent);
        const success = score >= 9;
        setLastSuccess(success);

        if (success && currentSessionLevel === level) {
            const nextLevel = level + 1;
            await updateCurrentLevel(username, nextLevel);
            setLevel(nextLevel);
        }
        setCurrentView('calcul_result');
    };

    // --- Problemes Logic ---
    const handleSelectProblem = (id: number) => {
        const problem = getProblem(id);
        if (problem) {
            setSelectedProblem(problem);
            setCurrentView('probleme_session');
        }
    };

    const handleProblemComplete = (success: boolean) => {
        if (success) {
            setSelectedProblem(null);
            setCurrentView('problemes_dashboard');
        }
    };

    // --- Navigation ---
    const handleBackToLanding = () => setCurrentView('landing');
    const handleExitApp = () => navigate('/');

    return (
        <>
            {currentView === 'landing' && (
                <MathLanding
                    level={level}
                    totalProblems={TOTAL_PROBLEMS}
                    solvedProblemsCount={solvedCount}
                    onSelectCalcul={() => setCurrentView('calcul_dashboard')}
                    onSelectProblemes={() => setCurrentView('problemes_dashboard')}
                    onBack={handleExitApp}
                />
            )}

            {currentView === 'calcul_dashboard' && (
                <MathDashboard
                    username={username}
                    currentLevel={level}
                    onStartLevel={handleStartLevel}
                    onBack={handleBackToLanding}
                />
            )}

            {currentView === 'calcul_session' && (
                <MathSession
                    level={currentSessionLevel}
                    exercises={exercises}
                    onComplete={handleSessionComplete}
                    onExit={() => setCurrentView('calcul_dashboard')}
                />
            )}

            {currentView === 'calcul_result' && (
                <MathLevelEnd
                    score={lastScore}
                    total={10}
                    timeSpent={lastTime}
                    level={currentSessionLevel}
                    isSuccess={lastSuccess}
                    onRetry={() => handleStartLevel(currentSessionLevel)}
                    onNext={() => handleStartLevel(currentSessionLevel + 1)}
                    onHome={() => setCurrentView('calcul_dashboard')}
                />
            )}

            {currentView === 'problemes_dashboard' && (
                <ProblemesDashboard
                    onSelectProblem={handleSelectProblem}
                    onBack={handleBackToLanding}
                />
            )}

            {currentView === 'probleme_session' && selectedProblem && (
                <ProblemeSession
                    problem={selectedProblem}
                    onBack={() => { setSelectedProblem(null); setCurrentView('problemes_dashboard'); }}
                    onComplete={handleProblemComplete}
                />
            )}
        </>
    );
};

export default Mathematiques;
