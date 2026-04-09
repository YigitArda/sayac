import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TimeBlock, Routine, Habit } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface TimeBlockingContextType {
  // Time Blocks
  timeBlocks: TimeBlock[];
  addTimeBlock: (block: Omit<TimeBlock, 'id' | 'userId' | 'isCompleted'>) => void;
  updateTimeBlock: (id: string, updates: Partial<TimeBlock>) => void;
  deleteTimeBlock: (id: string) => void;
  toggleTimeBlockComplete: (id: string) => void;
  getTimeBlocksForDay: (dayOfWeek: number) => TimeBlock[];
  getTodayTimeBlocks: () => TimeBlock[];
  
  // Routines
  routines: Routine[];
  addRoutine: (routine: Omit<Routine, 'id' | 'userId' | 'streak' | 'lastCompleted'>) => void;
  updateRoutine: (id: string, updates: Partial<Routine>) => void;
  deleteRoutine: (id: string) => void;
  completeRoutine: (id: string) => void;
  getRoutineProgress: (id: string) => number;
  
  // Habits
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'isActive' | 'createdAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitComplete: (id: string) => void;
  getHabitProgress: (id: string) => number;
  getHabitStreak: (id: string) => number;
}

const TimeBlockingContext = createContext<TimeBlockingContextType | undefined>(undefined);

const TIME_BLOCKS_KEY = 'focustrack_time_blocks';
const ROUTINES_KEY = 'focustrack_routines';
const HABITS_KEY = 'focustrack_habits';

export function TimeBlockingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);

  // Load data
  useEffect(() => {
    const blocksData = safeGetItem<TimeBlock[]>(TIME_BLOCKS_KEY, []);
    const routinesData = safeGetItem<Routine[]>(ROUTINES_KEY, []);
    const habitsData = safeGetItem<Habit[]>(HABITS_KEY, []);

    setTimeBlocks(blocksData);
    setRoutines(routinesData);
    setHabits(habitsData);
  }, []);

  // Save data
  useEffect(() => {
    safeSetItem(TIME_BLOCKS_KEY, timeBlocks);
  }, [timeBlocks]);

  useEffect(() => {
    safeSetItem(ROUTINES_KEY, routines);
  }, [routines]);

  useEffect(() => {
    safeSetItem(HABITS_KEY, habits);
  }, [habits]);

  // Time Block functions
  const addTimeBlock = useCallback((blockData: Omit<TimeBlock, 'id' | 'userId' | 'isCompleted'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newBlock: TimeBlock = {
      ...blockData,
      id: `block_${Date.now()}`,
      userId: user.id,
      isCompleted: false,
    };

    setTimeBlocks(prev => [...prev, newBlock]);
    toast.success('Zaman bloğu eklendi');
  }, [user]);

  const updateTimeBlock = useCallback((id: string, updates: Partial<TimeBlock>) => {
    setTimeBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteTimeBlock = useCallback((id: string) => {
    setTimeBlocks(prev => prev.filter(b => b.id !== id));
    toast.success('Zaman bloğu silindi');
  }, []);

  const toggleTimeBlockComplete = useCallback((id: string) => {
    setTimeBlocks(prev => prev.map(b => {
      if (b.id === id) {
        const isCompleted = !b.isCompleted;
        if (isCompleted) {
          toast.success('Zaman bloğu tamamlandı! ✅');
        }
        return { ...b, isCompleted };
      }
      return b;
    }));
  }, []);

  const getTimeBlocksForDay = useCallback((dayOfWeek: number) => {
    if (!user) return [];
    return timeBlocks
      .filter(b => b.userId === user.id && b.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timeBlocks, user]);

  const getTodayTimeBlocks = useCallback(() => {
    const today = new Date().getDay();
    // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    const dayOfWeek = today === 0 ? 6 : today - 1;
    return getTimeBlocksForDay(dayOfWeek);
  }, [getTimeBlocksForDay]);

  // Routine functions
  const addRoutine = useCallback((routineData: Omit<Routine, 'id' | 'userId' | 'streak' | 'lastCompleted'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newRoutine: Routine = {
      ...routineData,
      id: `routine_${Date.now()}`,
      userId: user.id,
      streak: 0,
      lastCompleted: undefined,
    };

    setRoutines(prev => [...prev, newRoutine]);
    toast.success('Rutin oluşturuldu');
  }, [user]);

  const updateRoutine = useCallback((id: string, updates: Partial<Routine>) => {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    toast.success('Rutin silindi');
  }, []);

  const completeRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.map(r => {
      if (r.id === id) {
        const lastCompleted = r.lastCompleted ? new Date(r.lastCompleted) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let newStreak = r.streak;
        
        if (lastCompleted) {
          const lastDate = new Date(lastCompleted);
          lastDate.setHours(0, 0, 0, 0);
          const diffDays = (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (diffDays === 1) {
            newStreak = r.streak + 1;
            toast.success(`🔥 ${newStreak} gün streak!`);
          } else if (diffDays === 0) {
            toast.success('Rutin tamamlandı!');
          } else {
            newStreak = 1;
            toast.success('Rutin tamamlandı! (Streak sıfırlandı)');
          }
        } else {
          newStreak = 1;
          toast.success('İlk rutin tamamlandı! 🎉');
        }
        
        return {
          ...r,
          streak: newStreak,
          lastCompleted: new Date(),
        };
      }
      return r;
    }));
  }, []);

  const getRoutineProgress = useCallback((id: string) => {
    const routine = routines.find(r => r.id === id);
    if (!routine || routine.tasks.length === 0) return 0;
    
    const completed = routine.tasks.filter(t => t.isCompleted).length;
    return Math.round((completed / routine.tasks.length) * 100);
  }, [routines]);

  // Habit functions
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'userId' | 'currentStreak' | 'longestStreak' | 'completedDates' | 'isActive' | 'createdAt'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newHabit: Habit = {
      ...habitData,
      id: `habit_${Date.now()}`,
      userId: user.id,
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
      isActive: true,
      createdAt: new Date(),
    };

    setHabits(prev => [...prev, newHabit]);
    toast.success('Alışkanlık oluşturuldu');
  }, [user]);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    toast.success('Alışkanlık silindi');
  }, []);

  const toggleHabitComplete = useCallback((id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === id) {
        const today = new Date().toDateString();
        const isCompletedToday = h.completedDates.some(d => new Date(d).toDateString() === today);
        
        if (isCompletedToday) {
          // Uncomplete
          return {
            ...h,
            completedDates: h.completedDates.filter(d => new Date(d).toDateString() !== today),
            currentStreak: Math.max(0, h.currentStreak - 1),
          };
        } else {
          // Complete
          const newDates = [...h.completedDates, new Date()];
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const wasCompletedYesterday = h.completedDates.some(d => 
            new Date(d).toDateString() === yesterday.toDateString()
          );
          
          const newStreak = wasCompletedYesterday ? h.currentStreak + 1 : 1;
          const newLongest = Math.max(h.longestStreak, newStreak);
          
          if (newStreak === h.targetDays) {
            toast.success(`🎉 Tebrikler! "${h.name}" alışkanlığını kazandınız!`);
          } else if (newStreak % 7 === 0) {
            toast.success(`🔥 ${newStreak} gün streak!`);
          } else {
            toast.success('Alışkanlık tamamlandı!');
          }
          
          return {
            ...h,
            completedDates: newDates,
            currentStreak: newStreak,
            longestStreak: newLongest,
          };
        }
      }
      return h;
    }));
  }, []);

  const getHabitProgress = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return 0;
    return Math.round((habit.completedDates.length / habit.targetDays) * 100);
  }, [habits]);

  const getHabitStreak = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    return habit?.currentStreak || 0;
  }, [habits]);

  return (
    <TimeBlockingContext.Provider value={{
      timeBlocks,
      addTimeBlock,
      updateTimeBlock,
      deleteTimeBlock,
      toggleTimeBlockComplete,
      getTimeBlocksForDay,
      getTodayTimeBlocks,
      routines,
      addRoutine,
      updateRoutine,
      deleteRoutine,
      completeRoutine,
      getRoutineProgress,
      habits,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabitComplete,
      getHabitProgress,
      getHabitStreak,
    }}>
      {children}
    </TimeBlockingContext.Provider>
  );
}

export function useTimeBlocking() {
  const context = useContext(TimeBlockingContext);
  if (context === undefined) {
    throw new Error('useTimeBlocking must be used within a TimeBlockingProvider');
  }
  return context;
}
