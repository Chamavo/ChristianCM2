import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
    user: string | null;
    login: (username: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Recover session from localStorage on mount
        const storedUser = localStorage.getItem("christian_cm2_user");
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = (username: string) => {
        if (!username.trim()) return;
        const formattedName = username.trim();
        localStorage.setItem("christian_cm2_user", formattedName);
        setUser(formattedName);
    };

    const logout = () => {
        localStorage.removeItem("christian_cm2_user");
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
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
