import { useMemo } from 'react';
import type { TimerSession } from '@/types';

interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastWorkDate: Date | null;
  streakActive: boolean;
}

/**
 * Calculate real streak from timer sessions
 * A streak is maintained if user worked on consecutive days
 */
export function useStreak(sessions: TimerSession[]): StreakInfo {
  return useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastWorkDate: null,
        streakActive: false,
      };
    }

    // Get unique dates with work sessions (sorted descending)
    const workDates = [...new Set(
      sessions
        .filter(s => s.duration > 0)
        .map(s => new Date(s.startedAt).toDateString())
    )].map(d => new Date(d))
      .sort((a, b) => b.getTime() - a.getTime());

    if (workDates.length === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastWorkDate: null,
        streakActive: false,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if streak is active (worked today or yesterday)
    const lastWorkDate = workDates[0];
    lastWorkDate.setHours(0, 0, 0, 0);
    
    const streakActive = lastWorkDate.getTime() === today.getTime() || 
                        lastWorkDate.getTime() === yesterday.getTime();

    // Calculate current streak
    let currentStreak = 0;
    if (streakActive) {
      currentStreak = 1;
      
      for (let i = 1; i < workDates.length; i++) {
        const prevDate = new Date(workDates[i - 1]);
        const currDate = new Date(workDates[i]);
        
        prevDate.setHours(0, 0, 0, 0);
        currDate.setHours(0, 0, 0, 0);
        
        const diffTime = prevDate.getTime() - currDate.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    
    // Reverse to go from oldest to newest
    const sortedDates = [...workDates].sort((a, b) => a.getTime() - b.getTime());
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      
      prevDate.setHours(0, 0, 0, 0);
      currDate.setHours(0, 0, 0, 0);
      
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    return {
      currentStreak,
      longestStreak,
      lastWorkDate: workDates[0],
      streakActive,
    };
  }, [sessions]);
}

/**
 * Get streak message based on current streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Başlamak için mükemmel bir gün!';
  if (streak === 1) return 'Güzel başlangıç! Devam et!';
  if (streak < 3) return `${streak} gün streak! Böyle devam!`;
  if (streak < 7) return `🔥 ${streak} gün streak! Harika gidiyorsun!`;
  if (streak < 14) return `🔥🔥 ${streak} gün streak! Muhteşem!`;
  if (streak < 30) return `🚀 ${streak} gün streak! Efsanesin!`;
  return `🏆 ${streak} gün streak! Efsanevi performans!`;
}
