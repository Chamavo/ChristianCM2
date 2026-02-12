// Level blocking system - uses Supabase for persistence
// Falls back to localStorage only when user is not authenticated

import { supabase } from '@/integrations/supabase/mathsClient';

export interface LevelBlockInfo {
    level: number;
    failCount: number;
    isBlocked: boolean;
    requiredCorrectStreak: number;
    currentCorrectStreak: number;
    levelInProgress?: boolean;
    levelStartedAt?: string;
    requiredRevisionModule?: string | null;
}

interface ProgressionRow {
    id: string;
    user_id: string;
    student_id: string | null;
    student_name: string;
    mode: string;
    current_level: number;
    fail_count: number;
    is_blocked: boolean;
    required_correct_streak: number;
    current_correct_streak: number;
    level_in_progress: boolean | null;
    level_started_at: string | null;
    extra_data: Record<string, unknown> | null;
}

const rowToBlockInfo = (row: ProgressionRow): LevelBlockInfo => ({
    level: row.current_level,
    failCount: row.fail_count,
    isBlocked: row.is_blocked,
    requiredCorrectStreak: row.required_correct_streak,
    currentCorrectStreak: row.current_correct_streak,
    levelInProgress: row.level_in_progress ?? undefined,
    levelStartedAt: row.level_started_at ?? undefined,
});

const getLocalStorageKey = (username: string, mode: string = 'progression') =>
    `levelBlocking_${username.toLowerCase()}_${mode}`;

// Get current user ID
const getCurrentUserId = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
};

// Get blocking info - tries database first, falls back to localStorage
export const getBlockingInfo = async (
    username: string,
    mode: string = 'progression'
): Promise<LevelBlockInfo | null> => {
    const userId = await getCurrentUserId();

    if (userId) {
        // Try database first
        const { data, error } = await supabase
            .from('student_progression')
            .select('*')
            .eq('user_id', userId)
            .eq('student_name', username.toLowerCase())
            .eq('mode', mode)
            .maybeSingle();

        if (!error && data) {
            return rowToBlockInfo(data as ProgressionRow);
        }
    }

    // Fallback to localStorage
    const key = getLocalStorageKey(username, mode);
    const localData = localStorage.getItem(key);

    if (!localData) return null;

    try {
        return JSON.parse(localData);
    } catch {
        return null;
    }
};

// Save progression to database (and localStorage as backup)
const saveProgression = async (
    username: string,
    mode: string,
    info: LevelBlockInfo
): Promise<void> => {
    const userId = await getCurrentUserId();
    const key = getLocalStorageKey(username, mode);

    // Always save to localStorage as backup
    localStorage.setItem(key, JSON.stringify(info));

    if (!userId) return;

    // Upsert to database
    const { error } = await supabase
        .from('student_progression')
        .upsert({
            user_id: userId,
            student_name: username.toLowerCase(),
            mode,
            current_level: info.level,
            fail_count: info.fail_count,
            is_blocked: info.is_blocked,
            required_correct_streak: info.required_correct_streak,
            current_correct_streak: info.current_correct_streak,
            level_in_progress: info.levelInProgress ?? false,
            level_started_at: info.level_started_at ?? null,
        }, {
            onConflict: 'user_id,student_name,mode'
        });

    if (error) {
        console.error('Failed to save progression to database:', error);
    }
};

export const markLevelStarted = async (
    username: string,
    level: number,
    mode: string = 'progression'
): Promise<void> => {
    const existing = await getBlockingInfo(username, mode) || {
        level,
        failCount: 0,
        isBlocked: false,
        requiredCorrectStreak: 10,
        currentCorrectStreak: 0,
    };

    existing.levelInProgress = true;
    existing.levelStartedAt = new Date().toISOString();
    existing.level = level;

    await saveProgression(username, mode, existing);
};

export const markLevelCompleted = async (
    username: string,
    level: number,
    mode: string = 'progression'
): Promise<void> => {
    const existing = await getBlockingInfo(username, mode);

    if (existing) {
        existing.levelInProgress = false;
        await saveProgression(username, mode, existing);
    }
};

export const recordLevelSuccess = async (
    username: string,
    level: number,
    mode: string = 'progression'
): Promise<void> => {
    const existing = await getBlockingInfo(username, mode) || {
        level,
        failCount: 0,
        isBlocked: false,
        requiredCorrectStreak: 10,
        currentCorrectStreak: 0,
    };

    existing.failCount = 0;
    existing.isBlocked = false;
    existing.currentCorrectStreak = (existing.currentCorrectStreak || 0) + 1;
    existing.level = level;

    await saveProgression(username, mode, existing);
};

export const recordLevelFailure = async (
    username: string,
    level: number,
    mode: string = 'progression'
): Promise<LevelBlockInfo | null> => {
    const existing = await getBlockingInfo(username, mode) || {
        level,
        failCount: 0,
        isBlocked: false,
        requiredCorrectStreak: 10,
        currentCorrectStreak: 0,
    };

    existing.failCount = (existing.failCount || 0) + 1;
    existing.currentCorrectStreak = 0;
    existing.level = level;

    // Block after 3 consecutive failures
    if (existing.failCount >= 3) {
        existing.isBlocked = true;
    }

    await saveProgression(username, mode, existing);
    return existing;
};

export const checkAndRecordAbandon = async (username: string): Promise<LevelBlockInfo | null> => {
    return null;
};

export const unblockLevel = async (
    username: string,
    level: number,
    mode: string = 'progression'
): Promise<void> => {
    const existing = await getBlockingInfo(username, mode);

    if (existing) {
        existing.isBlocked = false;
        existing.failCount = 0;
        await saveProgression(username, mode, existing);
    }
};

export const updateCurrentLevel = async (
    username: string,
    newLevel: number,
    mode: string = 'progression'
): Promise<void> => {
    const existing = await getBlockingInfo(username, mode) || {
        level: newLevel,
        failCount: 0,
        isBlocked: false,
        requiredCorrectStreak: 10,
        currentCorrectStreak: 0,
    };

    existing.level = newLevel;
    existing.failCount = 0;
    existing.isBlocked = false;

    await saveProgression(username, mode, existing);
};

export const getCurrentLevel = async (
    username: string,
    mode: string = 'progression'
): Promise<number> => {
    const info = await getBlockingInfo(username, mode);
    return info?.level ?? 1;
};

export const isLevelBlocked = (info: LevelBlockInfo | null, level: number): boolean => {
    return info !== null && info.isBlocked && info.level === level;
};

export const getBlockedLevel = (info: LevelBlockInfo | null): number | null => {
    return info && info.isBlocked ? info.level : null;
};
