import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Goal, Badge, UserBadge } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface GoalsContextType {
  goals: Goal[];
  badges: Badge[];
  userBadges: UserBadge[];
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentValue' | 'isCompleted'>) => void;
  updateGoalProgress: (goalId: string, value: number) => void;
  deleteGoal: (goalId: string) => void;
  getActiveGoals: () => Goal[];
  getCompletedGoals: () => Goal[];
  checkGoalCompletion: (category: string, value: number) => void;
  getBadgeById: (badgeId: string) => Badge | undefined;
  hasBadge: (badgeId: string) => boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

const GOALS_KEY = 'focustrack_goals';
const USER_BADGES_KEY = 'focustrack_user_badges';

// Predefined badges
const PREDEFINED_BADGES: Badge[] = [
  {
    id: 'badge_streak_7',
    name: '7 Gün Streak',
    description: '7 gün üst üste çalışma yap',
    icon: '🔥',
    color: '#ef4444',
    requirement: { type: 'streak', category: 'work', value: 7 },
  },
  {
    id: 'badge_streak_30',
    name: '30 Gün Streak',
    description: '30 gün üst üste çalışma yap',
    icon: '🏆',
    color: '#f59e0b',
    requirement: { type: 'streak', category: 'work', value: 30 },
  },
  {
    id: 'badge_work_100',
    name: '100 Saat Çalışma',
    description: 'Toplam 100 saat çalışma yap',
    icon: '💼',
    color: '#3b82f6',
    requirement: { type: 'total', category: 'work', value: 100 },
  },
  {
    id: 'badge_work_500',
    name: '500 Saat Çalışma',
    description: 'Toplam 500 saat çalışma yap',
    icon: '🚀',
    color: '#8b5cf6',
    requirement: { type: 'total', category: 'work', value: 500 },
  },
  {
    id: 'badge_reading_10',
    name: 'Kitap Kurdu',
    description: 'Toplam 10 saat kitap oku',
    icon: '📚',
    color: '#10b981',
    requirement: { type: 'total', category: 'reading', value: 10 },
  },
  {
    id: 'badge_reading_50',
    name: 'Bilge',
    description: 'Toplam 50 saat kitap oku',
    icon: '🎓',
    color: '#06b6d4',
    requirement: { type: 'total', category: 'reading', value: 50 },
  },
  {
    id: 'badge_night_owl',
    name: 'Gece Kuşu',
    description: 'Gece 12\'den sonra 10 saat çalış',
    icon: '🦉',
    color: '#6366f1',
    requirement: { type: 'total', category: 'night_work', value: 10 },
  },
  {
    id: 'badge_early_bird',
    name: 'Erken Kalkan',
    description: 'Sabah 6\'dan önce 10 saat çalış',
    icon: '🐦',
    color: '#f97316',
    requirement: { type: 'total', category: 'morning_work', value: 10 },
  },
  {
    id: 'badge_marathon',
    name: 'Maratoncu',
    description: 'Tek seferde 4 saat çalış',
    icon: '🏃',
    color: '#ec4899',
    requirement: { type: 'single', category: 'work', value: 240 },
  },
  {
    id: 'badge_water_7',
    name: 'Susuz Kalmayan',
    description: '7 gün üst üste 8 bardak su iç',
    icon: '💧',
    color: '#0ea5e9',
    requirement: { type: 'streak', category: 'water', value: 7 },
  },
];

export function GoalsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    const goalsData = safeGetItem<Goal[]>(GOALS_KEY, []);
    const badgesData = safeGetItem<UserBadge[]>(USER_BADGES_KEY, []);
    
    setGoals(goalsData);
    setUserBadges(badgesData);
  }, []);

  useEffect(() => {
    safeSetItem(GOALS_KEY, goals);
  }, [goals]);

  useEffect(() => {
    safeSetItem(USER_BADGES_KEY, userBadges);
  }, [userBadges]);

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentValue' | 'isCompleted'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      userId: user.id,
      currentValue: 0,
      isCompleted: false,
      createdAt: new Date(),
    };

    setGoals(prev => [newGoal, ...prev]);
    toast.success('Hedef oluşturuldu!');
  }, [user]);

  const updateGoalProgress = useCallback((goalId: string, value: number) => {
    setGoals(prev => prev.map(goal => {
      if (goal.id === goalId) {
        const newValue = Math.min(goal.currentValue + value, goal.targetValue);
        const isCompleted = newValue >= goal.targetValue;
        
        if (isCompleted && !goal.isCompleted) {
          toast.success(`🎉 "${goal.title}" hedefini tamamladın!`);
        }
        
        return { ...goal, currentValue: newValue, isCompleted };
      }
      return goal;
    }));
  }, []);

  const deleteGoal = useCallback((goalId: string) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    toast.success('Hedef silindi');
  }, []);

  const getActiveGoals = useCallback(() => {
    if (!user) return [];
    return goals.filter(g => g.userId === user.id && g.isActive && !g.isCompleted);
  }, [goals, user]);

  const getCompletedGoals = useCallback(() => {
    if (!user) return [];
    return goals.filter(g => g.userId === user.id && g.isCompleted);
  }, [goals, user]);

  const checkGoalCompletion = useCallback((category: string, value: number) => {
    if (!user) return;
    
    const activeGoals = getActiveGoals().filter(g => g.category === category);
    activeGoals.forEach(goal => {
      updateGoalProgress(goal.id, value);
    });
  }, [getActiveGoals, updateGoalProgress, user]);

  const getBadgeById = useCallback((badgeId: string) => {
    return PREDEFINED_BADGES.find(b => b.id === badgeId);
  }, []);

  const hasBadge = useCallback((badgeId: string) => {
    if (!user) return false;
    return userBadges.some(ub => ub.badgeId === badgeId);
  }, [userBadges, user]);



  return (
    <GoalsContext.Provider value={{
      goals,
      badges: PREDEFINED_BADGES,
      userBadges,
      addGoal,
      updateGoalProgress,
      deleteGoal,
      getActiveGoals,
      getCompletedGoals,
      checkGoalCompletion,
      getBadgeById,
      hasBadge,
    }}>
      {children}
    </GoalsContext.Provider>
  );
}

export function useGoals() {
  const context = useContext(GoalsContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  return context;
}
