import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  BreakReminder, 
  HourlyProductivity, 
  DailyPrediction,
  ProductivityMetrics 
} from '@/types';
import { useAuth } from './AuthContext';
import { useData } from './DataContext';
import { useWellness } from './WellnessContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface SmartFeaturesContextType {
  // Break Reminders
  breakReminders: BreakReminder[];
  addBreakReminder: (workDuration: number, breakDuration: number) => void;
  toggleBreakReminder: (id: string) => void;
  deleteBreakReminder: (id: string) => void;
  shouldSuggestBreak: (currentWorkMinutes: number) => BreakReminder | null;
  
  // Optimal Hours
  getOptimalWorkHours: () => HourlyProductivity[];
  getBestWorkHours: () => number[];
  
  // Predictions
  getDailyPrediction: () => DailyPrediction;
  getWeeklyPrediction: () => DailyPrediction[];
  
  // Productivity Score
  getTodayProductivityScore: () => ProductivityMetrics;
  getWeeklyProductivityScores: () => ProductivityMetrics[];
  
  // Smart Suggestions
  getSmartSuggestions: () => string[];
}

const SmartFeaturesContext = createContext<SmartFeaturesContextType | undefined>(undefined);

const BREAK_REMINDERS_KEY = 'focustrack_break_reminders';

export function SmartFeaturesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { getUserTimerSessions, getUserSleepEntries } = useData();
  const { getUserMeditationSessions, getUserExerciseEntries } = useWellness();
  
  const [breakReminders, setBreakReminders] = useState<BreakReminder[]>([]);

  // Load break reminders
  useEffect(() => {
    const data = safeGetItem<BreakReminder[]>(BREAK_REMINDERS_KEY, []);
    if (data.length > 0) {
      setBreakReminders(data);
    } else if (user) {
      // Default break reminders
      setBreakReminders([
        {
          id: 'break_1',
          userId: user.id,
          workDuration: 45,
          breakDuration: 5,
          isEnabled: true,
        },
        {
          id: 'break_2',
          userId: user.id,
          workDuration: 90,
          breakDuration: 15,
          isEnabled: true,
        },
      ]);
    }
  }, [user]);

  // Save break reminders
  useEffect(() => {
    safeSetItem(BREAK_REMINDERS_KEY, breakReminders);
  }, [breakReminders]);

  // Break reminder functions
  const addBreakReminder = useCallback((workDuration: number, breakDuration: number) => {
    if (!user) return;
    
    const newReminder: BreakReminder = {
      id: `break_${Date.now()}`,
      userId: user.id,
      workDuration,
      breakDuration,
      isEnabled: true,
    };
    
    setBreakReminders(prev => [...prev, newReminder]);
    toast.success('Mola hatırlatıcısı eklendi');
  }, [user]);

  const toggleBreakReminder = useCallback((id: string) => {
    setBreakReminders(prev => prev.map(r => 
      r.id === id ? { ...r, isEnabled: !r.isEnabled } : r
    ));
  }, []);

  const deleteBreakReminder = useCallback((id: string) => {
    setBreakReminders(prev => prev.filter(r => r.id !== id));
    toast.success('Mola hatırlatıcısı silindi');
  }, []);

  const shouldSuggestBreak = useCallback((currentWorkMinutes: number): BreakReminder | null => {
    return breakReminders.find(r => 
      r.isEnabled && 
      currentWorkMinutes >= r.workDuration &&
      currentWorkMinutes < r.workDuration + 5
    ) || null;
  }, [breakReminders]);

  // Optimal hours analysis
  const getOptimalWorkHours = useCallback((): HourlyProductivity[] => {
    if (!user) return [];
    
    const sessions = getUserTimerSessions();
    const hourlyData: Record<number, HourlyProductivity> = {};
    
    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = {
        hour: i,
        totalWorkMinutes: 0,
        sessionCount: 0,
        averageFocusScore: 0,
      };
    }
    
    // Analyze sessions
    sessions.forEach(session => {
      const hour = new Date(session.startedAt).getHours();
      hourlyData[hour].totalWorkMinutes += session.duration;
      hourlyData[hour].sessionCount += 1;
    });
    
    // Calculate focus scores (based on session duration consistency)
    Object.values(hourlyData).forEach(hour => {
      if (hour.sessionCount > 0) {
        hour.averageFocusScore = Math.min(
          100,
          (hour.totalWorkMinutes / hour.sessionCount / 60) * 100
        );
      }
    });
    
    return Object.values(hourlyData);
  }, [user, getUserTimerSessions]);

  const getBestWorkHours = useCallback((): number[] => {
    const hourlyData = getOptimalWorkHours();
    return hourlyData
      .filter(h => h.totalWorkMinutes > 0)
      .sort((a, b) => b.totalWorkMinutes - a.totalWorkMinutes)
      .slice(0, 5)
      .map(h => h.hour);
  }, [getOptimalWorkHours]);

  // Predictions
  const getDailyPrediction = useCallback((): DailyPrediction => {
    if (!user) {
      return {
        date: new Date(),
        predictedWorkMinutes: 0,
        confidence: 0,
        suggestion: 'Veri toplamaya devam edin',
      };
    }
    
    const sessions = getUserTimerSessions();
    const last7Days = sessions.filter(s => {
      const daysDiff = (Date.now() - new Date(s.startedAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    });
    
    const avgDailyWork = last7Days.length > 0
      ? last7Days.reduce((sum, s) => sum + s.duration, 0) / 7
      : 120;
    
    const todayWork = sessions
      .filter(s => new Date(s.startedAt).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.duration, 0);
    
    const remaining = Math.max(0, avgDailyWork - todayWork);
    const confidence = Math.min(100, last7Days.length * 10 + 30);
    
    let suggestion = '';
    if (remaining > 60) {
      suggestion = `Bugün hedefinize ulaşmak için ${Math.ceil(remaining / 60)} saat daha çalışmalısınız`;
    } else if (remaining > 0) {
      suggestion = `Bugün hedefinize ulaşmak için ${remaining} dakika daha çalışmalısınız`;
    } else {
      suggestion = 'Tebrikler! Bugünkü hedefinize ulaştınız 🎉';
    }
    
    return {
      date: new Date(),
      predictedWorkMinutes: Math.round(avgDailyWork),
      confidence,
      suggestion,
    };
  }, [user, getUserTimerSessions]);

  const getWeeklyPrediction = useCallback((): DailyPrediction[] => {
    const predictions: DailyPrediction[] = [];
    const basePrediction = getDailyPrediction();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      predictions.push({
        ...basePrediction,
        date,
        confidence: Math.max(20, basePrediction.confidence - i * 10),
      });
    }
    
    return predictions;
  }, [getDailyPrediction]);

  // Productivity Score
  const getTodayProductivityScore = useCallback((): ProductivityMetrics => {
    if (!user) {
      return {
        date: new Date(),
        workScore: 0,
        consistencyScore: 0,
        focusScore: 0,
        balanceScore: 0,
        overallScore: 0,
      };
    }
    
    const today = new Date().toDateString();
    const sessions = getUserTimerSessions();
    const todaySessions = sessions.filter(s => 
      new Date(s.startedAt).toDateString() === today
    );
    
    const todayWorkMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
    const workScore = Math.min(100, (todayWorkMinutes / 240) * 100); // 4 hours = 100
    
    // Consistency score based on session count
    const consistencyScore = Math.min(100, todaySessions.length * 20);
    
    // Focus score based on average session duration
    const avgSessionDuration = todaySessions.length > 0
      ? todayWorkMinutes / todaySessions.length
      : 0;
    const focusScore = Math.min(100, (avgSessionDuration / 60) * 100);
    
    // Balance score (work + wellness)
    const sleep = getUserSleepEntries().find(s => 
      new Date(s.date).toDateString() === today
    );
    const meditation = getUserMeditationSessions().filter(s => 
      new Date(s.completedAt).toDateString() === today
    );
    const exercise = getUserExerciseEntries().filter(s => 
      new Date(s.date).toDateString() === today
    );
    
    const hasSleep = sleep && sleep.hours >= 6 ? 25 : 0;
    const hasMeditation = meditation.length > 0 ? 25 : 0;
    const hasExercise = exercise.length > 0 ? 25 : 0;
    const hasWork = todayWorkMinutes > 0 ? 25 : 0;
    const balanceScore = hasSleep + hasMeditation + hasExercise + hasWork;
    
    const overallScore = Math.round(
      (workScore * 0.4 + consistencyScore * 0.2 + focusScore * 0.2 + balanceScore * 0.2)
    );
    
    return {
      date: new Date(),
      workScore: Math.round(workScore),
      consistencyScore: Math.round(consistencyScore),
      focusScore: Math.round(focusScore),
      balanceScore,
      overallScore,
    };
  }, [user, getUserTimerSessions, getUserSleepEntries, getUserMeditationSessions, getUserExerciseEntries]);

  const getWeeklyProductivityScores = useCallback((): ProductivityMetrics[] => {
    const scores: ProductivityMetrics[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Calculate score for each day (simplified)
      const sessions = getUserTimerSessions().filter(s => 
        new Date(s.startedAt).toDateString() === date.toDateString()
      );
      
      const workMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
      const workScore = Math.min(100, (workMinutes / 240) * 100);
      
      scores.push({
        date,
        workScore: Math.round(workScore),
        consistencyScore: Math.round(Math.min(100, sessions.length * 20)),
        focusScore: Math.round(Math.min(100, (workMinutes / Math.max(1, sessions.length) / 60) * 100)),
        balanceScore: workScore > 0 ? 50 : 0,
        overallScore: Math.round(workScore * 0.5 + 25),
      });
    }
    
    return scores;
  }, [getUserTimerSessions]);

  // Smart Suggestions
  const getSmartSuggestions = useCallback((): string[] => {
    if (!user) return [];
    
    const suggestions: string[] = [];
    const sessions = getUserTimerSessions();
    const todayWork = sessions
      .filter(s => new Date(s.startedAt).toDateString() === new Date().toDateString())
      .reduce((sum, s) => sum + s.duration, 0);
    
    const bestHours = getBestWorkHours();
    
    // Time-based suggestions
    const currentHour = new Date().getHours();
    if (bestHours.includes(currentHour) && todayWork < 120) {
      suggestions.push('🎯 Verimli saatinizdesiniz! Çalışmaya başlayın.');
    }
    
    // Work duration suggestions
    if (todayWork === 0) {
      suggestions.push('📅 Bugün henüz çalışma yapmadınız. Başlamak için harika bir zaman!');
    } else if (todayWork < 60) {
      suggestions.push('⏱️ Bugün sadece 1 saat çalıştınız. Hedefinize ulaşmak için devam edin.');
    } else if (todayWork >= 240) {
      suggestions.push('🎉 Bugün 4 saat çalıştınız! Mola vermeyi unutmayın.');
    }
    
    // Break suggestions
    if (todayWork > 0 && todayWork % 45 < 5) {
      suggestions.push('☕ 45 dakikadır çalışıyorsunuz. 5 dakika mola verin!');
    }
    
    // Optimal hours suggestion
    if (bestHours.length > 0) {
      const nextBestHour = bestHours.find(h => h > currentHour);
      if (nextBestHour) {
        suggestions.push(`🌟 En verimli saatiniz ${nextBestHour}:00. O saatte çalışmayı planlayın!`);
      }
    }
    
    // Streak suggestion
    const yesterdayWork = sessions
      .filter(s => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return new Date(s.startedAt).toDateString() === yesterday.toDateString();
      })
      .reduce((sum, s) => sum + s.duration, 0);
    
    if (yesterdayWork > 0 && todayWork === 0) {
      suggestions.push('🔥 Dün çalıştınız! Streak\'inizi korumak için bugün de çalışın.');
    }
    
    return suggestions.slice(0, 3);
  }, [user, getUserTimerSessions, getBestWorkHours]);

  return (
    <SmartFeaturesContext.Provider value={{
      breakReminders,
      addBreakReminder,
      toggleBreakReminder,
      deleteBreakReminder,
      shouldSuggestBreak,
      getOptimalWorkHours,
      getBestWorkHours,
      getDailyPrediction,
      getWeeklyPrediction,
      getTodayProductivityScore,
      getWeeklyProductivityScores,
      getSmartSuggestions,
    }}>
      {children}
    </SmartFeaturesContext.Provider>
  );
}

export function useSmartFeatures() {
  const context = useContext(SmartFeaturesContext);
  if (context === undefined) {
    throw new Error('useSmartFeatures must be used within a SmartFeaturesProvider');
  }
  return context;
}
