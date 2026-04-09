import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TimerSession, SleepEntry, ReadingSession, Book, Activity, DailyStats } from '@/types';
import { useAuth } from './AuthContext';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface DataContextType {
  timerSessions: TimerSession[];
  addTimerSession: (session: Omit<TimerSession, 'id' | 'userId' | 'userName' | 'userAvatar'>) => void;
  getUserTimerSessions: () => TimerSession[];
  sleepEntries: SleepEntry[];
  addSleepEntry: (entry: Omit<SleepEntry, 'id' | 'userId'>) => void;
  getUserSleepEntries: () => SleepEntry[];
  books: Book[];
  readingSessions: ReadingSession[];
  addBook: (book: Omit<Book, 'id'>) => Book;
  addReadingSession: (session: Omit<ReadingSession, 'id' | 'userId' | 'userName' | 'userAvatar'>) => void;
  getUserReadingSessions: () => ReadingSession[];
  activities: Activity[];
  getSharedActivities: () => Activity[];
  likeActivity: (activityId: string) => void;
  getDailyStats: (days?: number) => DailyStats[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TIMER: 'focustrack_timer_sessions',
  SLEEP: 'focustrack_sleep_entries',
  BOOKS: 'focustrack_books',
  READING: 'focustrack_reading_sessions',
  ACTIVITIES: 'focustrack_activities',
};

// Sample data for demo
const SAMPLE_BOOKS: Book[] = [
  { id: 'book_1', title: 'Atomic Habits', author: 'James Clear', totalPages: 320 },
  { id: 'book_2', title: 'Deep Work', author: 'Cal Newport', totalPages: 304 },
  { id: 'book_3', title: 'Sapiens', author: 'Yuval Noah Harari', totalPages: 443 },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Load data from storage
  useEffect(() => {
    setTimerSessions(safeGetItem<TimerSession[]>(STORAGE_KEYS.TIMER, []));
    setSleepEntries(safeGetItem<SleepEntry[]>(STORAGE_KEYS.SLEEP, []));
    setBooks(safeGetItem<Book[]>(STORAGE_KEYS.BOOKS, SAMPLE_BOOKS));
    setReadingSessions(safeGetItem<ReadingSession[]>(STORAGE_KEYS.READING, []));
    setActivities(safeGetItem<Activity[]>(STORAGE_KEYS.ACTIVITIES, []));
  }, []);

  // Save data to storage
  useEffect(() => {
    safeSetItem(STORAGE_KEYS.TIMER, timerSessions);
  }, [timerSessions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.SLEEP, sleepEntries);
  }, [sleepEntries]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.BOOKS, books);
  }, [books]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.READING, readingSessions);
  }, [readingSessions]);

  useEffect(() => {
    safeSetItem(STORAGE_KEYS.ACTIVITIES, activities);
  }, [activities]);

  const addTimerSession = useCallback((session: Omit<TimerSession, 'id' | 'userId' | 'userName' | 'userAvatar'>) => {
    if (!user) return;
    
    const newSession: TimerSession = {
      ...session,
      id: `timer_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
    };
    
    setTimerSessions(prev => [newSession, ...prev]);
    
    if (session.isShared) {
      const newActivity: Activity = {
        id: `act_${Date.now()}`,
        type: 'timer',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        data: newSession,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
      };
      setActivities(prev => [newActivity, ...prev]);
    }
  }, [user]);

  const getUserTimerSessions = useCallback(() => {
    if (!user) return [];
    return timerSessions.filter(s => s.userId === user.id);
  }, [timerSessions, user]);

  const addSleepEntry = useCallback((entry: Omit<SleepEntry, 'id' | 'userId'>) => {
    if (!user) return;
    
    const newEntry: SleepEntry = {
      ...entry,
      id: `sleep_${Date.now()}`,
      userId: user.id,
    };
    
    setSleepEntries(prev => [newEntry, ...prev]);
  }, [user]);

  const getUserSleepEntries = useCallback(() => {
    if (!user) return [];
    return sleepEntries.filter(s => s.userId === user.id);
  }, [sleepEntries, user]);

  const addBook = useCallback((bookData: Omit<Book, 'id'>): Book => {
    const newBook: Book = {
      ...bookData,
      id: `book_${Date.now()}`,
    };
    setBooks(prev => [...prev, newBook]);
    return newBook;
  }, []);

  const addReadingSession = useCallback((session: Omit<ReadingSession, 'id' | 'userId' | 'userName' | 'userAvatar'>) => {
    if (!user) return;
    
    const newSession: ReadingSession = {
      ...session,
      id: `read_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
    };
    
    setReadingSessions(prev => [newSession, ...prev]);
    
    if (session.isShared) {
      const newActivity: Activity = {
        id: `act_${Date.now()}`,
        type: 'reading',
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        data: newSession,
        createdAt: new Date().toISOString(),
        likes: 0,
        likedBy: [],
        comments: [],
      };
      setActivities(prev => [newActivity, ...prev]);
    }
  }, [user]);

  const getUserReadingSessions = useCallback(() => {
    if (!user) return [];
    return readingSessions.filter(s => s.userId === user.id);
  }, [readingSessions, user]);

  const getSharedActivities = useCallback(() => {
    return [...activities].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [activities]);

  const likeActivity = useCallback((activityId: string) => {
    if (!user) return;
    
    setActivities(prev => prev.map(act => {
      if (act.id === activityId && !act.likedBy?.includes(user.id)) {
        return {
          ...act,
          likes: act.likes + 1,
          likedBy: [...(act.likedBy || []), user.id],
        };
      }
      return act;
    }));
  }, [user]);

  const getDailyStats = useCallback((days: number = 7): DailyStats[] => {
    if (!user) return [];
    
    const stats: DailyStats[] = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTimerSessions = timerSessions.filter(s => 
        s.userId === user.id && 
        new Date(s.startedAt).toISOString().split('T')[0] === dateStr
      );
      
      const daySleep = sleepEntries.find(s => 
        s.userId === user.id && 
        new Date(s.date).toISOString().split('T')[0] === dateStr
      );
      
      const dayReading = readingSessions.filter(s => 
        s.userId === user.id && 
        new Date(s.date).toISOString().split('T')[0] === dateStr
      );
      
      stats.push({
        date: dateStr,
        workMinutes: dayTimerSessions.reduce((sum, s) => sum + s.duration, 0),
        sleepHours: daySleep?.hours || 0,
        readingMinutes: dayReading.reduce((sum, s) => sum + s.duration, 0),
        meditationMinutes: 0,
        exerciseMinutes: 0,
        waterGlasses: 0,
      });
    }
    
    return stats;
  }, [timerSessions, sleepEntries, readingSessions, user]);

  return (
    <DataContext.Provider value={{
      timerSessions,
      addTimerSession,
      getUserTimerSessions,
      sleepEntries,
      addSleepEntry,
      getUserSleepEntries,
      books,
      readingSessions,
      addBook,
      addReadingSession,
      getUserReadingSessions,
      activities,
      getSharedActivities,
      likeActivity,
      getDailyStats,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
