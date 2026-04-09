import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { MeditationSession, ExerciseEntry, WaterEntry, MoodEntry, ExerciseType, MoodType } from '@/types';
import { useAuth } from './AuthContext';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface WellnessContextType {
  meditationSessions: MeditationSession[];
  addMeditationSession: (session: Omit<MeditationSession, 'id' | 'userId' | 'userName' | 'userAvatar' | 'completedAt'>) => void;
  getUserMeditationSessions: () => MeditationSession[];
  getTotalMeditationMinutes: () => number;
  
  exerciseEntries: ExerciseEntry[];
  addExerciseEntry: (entry: Omit<ExerciseEntry, 'id' | 'userId' | 'userName' | 'userAvatar'>) => void;
  getUserExerciseEntries: () => ExerciseEntry[];
  getTotalExerciseMinutes: () => number;
  getExerciseByType: (type: ExerciseType) => ExerciseEntry[];
  
  waterEntries: WaterEntry[];
  addWaterEntry: (amount: number) => void;
  getTodayWaterIntake: () => number;
  getUserWaterEntries: () => WaterEntry[];
  
  moodEntries: MoodEntry[];
  addMoodEntry: (entry: Omit<MoodEntry, 'id' | 'userId' | 'date'>) => void;
  getUserMoodEntries: () => MoodEntry[];
  getTodayMood: () => MoodEntry | undefined;
  getMoodStats: () => Record<MoodType, number>;
}

const WellnessContext = createContext<WellnessContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MEDITATION: 'focustrack_meditation',
  EXERCISE: 'focustrack_exercise',
  WATER: 'focustrack_water',
  MOOD: 'focustrack_mood',
};

export function WellnessProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [meditationSessions, setMeditationSessions] = useState<MeditationSession[]>([]);
  const [exerciseEntries, setExerciseEntries] = useState<ExerciseEntry[]>([]);
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  // Load data
  useEffect(() => {
    setMeditationSessions(safeGetItem<MeditationSession[]>(STORAGE_KEYS.MEDITATION, []));
    setExerciseEntries(safeGetItem<ExerciseEntry[]>(STORAGE_KEYS.EXERCISE, []));
    setWaterEntries(safeGetItem<WaterEntry[]>(STORAGE_KEYS.WATER, []));
    setMoodEntries(safeGetItem<MoodEntry[]>(STORAGE_KEYS.MOOD, []));
  }, []);

  // Save data
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.MEDITATION, meditationSessions);
  }, [meditationSessions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.EXERCISE, exerciseEntries);
  }, [exerciseEntries]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.WATER, waterEntries);
  }, [waterEntries]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.MOOD, moodEntries);
  }, [moodEntries]);

  // Meditation functions
  const addMeditationSession = useCallback((sessionData: Omit<MeditationSession, 'id' | 'userId' | 'userName' | 'userAvatar' | 'completedAt'>) => {
    if (!user) return;

    const newSession: MeditationSession = {
      ...sessionData,
      id: `meditation_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      completedAt: new Date().toISOString(),
    };

    setMeditationSessions(prev => [newSession, ...prev]);
  }, [user]);

  const getUserMeditationSessions = useCallback(() => {
    if (!user) return [];
    return meditationSessions.filter(s => s.userId === user.id);
  }, [meditationSessions, user]);

  const getTotalMeditationMinutes = useCallback(() => {
    if (!user) return 0;
    return meditationSessions
      .filter(s => s.userId === user.id)
      .reduce((sum, s) => sum + s.duration, 0);
  }, [meditationSessions, user]);

  // Exercise functions
  const addExerciseEntry = useCallback((entryData: Omit<ExerciseEntry, 'id' | 'userId' | 'userName' | 'userAvatar'>) => {
    if (!user) return;

    const newEntry: ExerciseEntry = {
      ...entryData,
      id: `exercise_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
    };

    setExerciseEntries(prev => [newEntry, ...prev]);
  }, [user]);

  const getUserExerciseEntries = useCallback(() => {
    if (!user) return [];
    return exerciseEntries.filter(e => e.userId === user.id);
  }, [exerciseEntries, user]);

  const getTotalExerciseMinutes = useCallback(() => {
    if (!user) return 0;
    return exerciseEntries
      .filter(e => e.userId === user.id)
      .reduce((sum, e) => sum + e.duration, 0);
  }, [exerciseEntries, user]);

  const getExerciseByType = useCallback((type: ExerciseType) => {
    if (!user) return [];
    return exerciseEntries.filter(e => e.userId === user.id && e.type === type);
  }, [exerciseEntries, user]);

  // Water functions
  const addWaterEntry = useCallback((amount: number) => {
    if (!user) return;

    const newEntry: WaterEntry = {
      id: `water_${Date.now()}`,
      userId: user.id,
      amount,
      date: new Date().toISOString(),
    };

    setWaterEntries(prev => [newEntry, ...prev]);
  }, [user]);

  const getTodayWaterIntake = useCallback(() => {
    if (!user) return 0;
    const today = new Date().toISOString().split('T')[0];
    return waterEntries
      .filter(w => w.userId === user.id && new Date(w.date).toISOString().split('T')[0] === today)
      .reduce((sum, w) => sum + w.amount, 0);
  }, [waterEntries, user]);

  const getUserWaterEntries = useCallback(() => {
    if (!user) return [];
    return waterEntries.filter(w => w.userId === user.id);
  }, [waterEntries, user]);

  // Mood functions
  const addMoodEntry = useCallback((entryData: Omit<MoodEntry, 'id' | 'userId' | 'date'>) => {
    if (!user) return;

    const newEntry: MoodEntry = {
      ...entryData,
      id: `mood_${Date.now()}`,
      userId: user.id,
      date: new Date().toISOString(),
    };

    setMoodEntries(prev => [newEntry, ...prev]);
  }, [user]);

  const getUserMoodEntries = useCallback(() => {
    if (!user) return [];
    return moodEntries.filter(m => m.userId === user.id);
  }, [moodEntries, user]);

  const getTodayMood = useCallback(() => {
    if (!user) return undefined;
    const today = new Date().toISOString().split('T')[0];
    return moodEntries.find(m => 
      m.userId === user.id && 
      new Date(m.date).toISOString().split('T')[0] === today
    );
  }, [moodEntries, user]);

  const getMoodStats = useCallback(() => {
    if (!user) return { terrible: 0, bad: 0, neutral: 0, good: 0, excellent: 0 };
    
    const userMoods = moodEntries.filter(m => m.userId === user.id);
    const stats: Record<MoodType, number> = {
      terrible: 0,
      bad: 0,
      neutral: 0,
      good: 0,
      excellent: 0,
    };
    
    userMoods.forEach(m => {
      stats[m.mood]++;
    });
    
    return stats;
  }, [moodEntries, user]);

  return (
    <WellnessContext.Provider value={{
      meditationSessions,
      addMeditationSession,
      getUserMeditationSessions,
      getTotalMeditationMinutes,
      exerciseEntries,
      addExerciseEntry,
      getUserExerciseEntries,
      getTotalExerciseMinutes,
      getExerciseByType,
      waterEntries,
      addWaterEntry,
      getTodayWaterIntake,
      getUserWaterEntries,
      moodEntries,
      addMoodEntry,
      getUserMoodEntries,
      getTodayMood,
      getMoodStats,
    }}>
      {children}
    </WellnessContext.Provider>
  );
}

export function useWellness() {
  const context = useContext(WellnessContext);
  if (context === undefined) {
    throw new Error('useWellness must be used within a WellnessProvider');
  }
  return context;
}
