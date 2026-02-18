import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ProgressData {
    solvedProblems: number[];
    lastPath: string;
}

interface UserContextType {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
    isLoading: boolean;
    progress: ProgressData;
    markProblemSolved: (id: number) => void;
    updateLastPath: (path: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState<ProgressData>({ solvedProblems: [], lastPath: '/' });

    // Helper to get storage key
    const getStorageKey = (username: string) => `christian_cm2_progress_${username}`;

    useEffect(() => {
        // Recover user session from localStorage on mount
        const storedUser = localStorage.getItem("christian_cm2_user");
        if (storedUser) {
            setUser(storedUser);
            // Load progress for this user
            const savedProgress = localStorage.getItem(getStorageKey(storedUser));
            if (savedProgress) {
                try {
                    setProgress(JSON.parse(savedProgress));
                } catch (e) {
                    console.error("Failed to parse progress", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    const saveProgress = (username: string, newProgress: ProgressData) => {
        localStorage.setItem(getStorageKey(username), JSON.stringify(newProgress));
    };

    const login = (username: string) => {
        if (!username.trim()) return;
        const formattedName = username.trim();
        localStorage.setItem("christian_cm2_user", formattedName);
        setUser(formattedName);

        // Load or initialize progress
        const savedProgress = localStorage.getItem(getStorageKey(formattedName));
        if (savedProgress) {
            try {
                setProgress(JSON.parse(savedProgress));
            } catch (e) {
                setProgress({ solvedProblems: [], lastPath: '/' });
            }
        } else {
            setProgress({ solvedProblems: [], lastPath: '/' });
        }
    };

    const logout = () => {
        localStorage.removeItem("christian_cm2_user");
        setUser(null);
        setProgress({ solvedProblems: [], lastPath: '/' });
    };

    const markProblemSolved = (id: number) => {
        if (!user) return;
        setProgress(prev => {
            if (prev.solvedProblems.includes(id)) return prev;
            const newProgress = {
                ...prev,
                solvedProblems: [...prev.solvedProblems, id]
            };
            saveProgress(user, newProgress);
            return newProgress;
        });
    };

    const updateLastPath = (path: string) => {
        if (!user || path === '/login') return; // Don't save login page as last path
        setProgress(prev => {
            if (prev.lastPath === path) return prev;
            const newProgress = {
                ...prev,
                lastPath: path
            };
            saveProgress(user, newProgress);
            return newProgress;
        });
    };

    return (
        <UserContext.Provider value={{
            user,
            login,
            logout,
            isLoading,
            progress,
            markProblemSolved,
            updateLastPath
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
