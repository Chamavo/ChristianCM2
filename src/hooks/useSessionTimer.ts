import { useState, useEffect, useCallback, useRef } from 'react';

const SESSION_DURATION_SEC = 20 * 60; // 20 minutes
const STORAGE_KEY = 'orthographe_session_timer';

interface SessionData {
    date: string;       // YYYY-MM-DD — resets daily
    elapsedSec: number; // total seconds used today
}

const getTodayKey = (): string => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

const loadSession = (): SessionData => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const data: SessionData = JSON.parse(stored);
            if (data.date === getTodayKey()) return data;
        }
    } catch { /* ignore */ }
    return { date: getTodayKey(), elapsedSec: 0 };
};

const saveSession = (data: SessionData) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch { /* ignore */ }
};

/**
 * Hook: 20-minute daily session timer for the Orthographe module.
 * - `remainingSec`: seconds left in today's session
 * - `isTimeUp`: true when the 20 minutes are exhausted
 * - `formattedTime`: "MM:SS" display string
 * - `isRunning`: whether the timer is actively counting
 * - `start()` / `pause()`: control the timer
 */
export const useSessionTimer = () => {
    const [elapsedSec, setElapsedSec] = useState(() => loadSession().elapsedSec);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const remainingSec = Math.max(0, SESSION_DURATION_SEC - elapsedSec);
    const isTimeUp = remainingSec <= 0;

    const minutes = Math.floor(remainingSec / 60);
    const seconds = remainingSec % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Tick every second when running
    useEffect(() => {
        if (isRunning && !isTimeUp) {
            intervalRef.current = setInterval(() => {
                setElapsedSec(prev => {
                    const next = prev + 1;
                    saveSession({ date: getTodayKey(), elapsedSec: next });
                    return next;
                });
            }, 1000);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, isTimeUp]);

    // Auto-stop when time is up
    useEffect(() => {
        if (isTimeUp && isRunning) {
            setIsRunning(false);
        }
    }, [isTimeUp, isRunning]);

    const start = useCallback(() => {
        if (!isTimeUp) setIsRunning(true);
    }, [isTimeUp]);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    return { remainingSec, isTimeUp, formattedTime, isRunning, start, pause };
};
