import { useState, useEffect, useCallback, useRef } from 'react';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface SharedTimerState {
  isRunning: boolean;
  elapsedTime: number; // seconds
  startTime: string | null;
  lastUpdated: string;
  startedBy: string;
  startedByName: string;
  pausedBy: string | null;
  pausedByName: string | null;
}

const SHARED_TIMER_KEY = 'focustrack_shared_timer';

export function useSharedTimer(userId: string, userName: string) {
  const [state, setState] = useState<SharedTimerState>({
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
    lastUpdated: new Date().toISOString(),
    startedBy: '',
    startedByName: '',
    pausedBy: null,
    pausedByName: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load state from storage and sync
  useEffect(() => {
    const loadState = () => {
      const saved = safeGetItem<SharedTimerState | null>(SHARED_TIMER_KEY, null);
      if (saved) {
        // Calculate current elapsed time if running
        if (saved.isRunning && saved.startTime) {
          const start = new Date(saved.startTime).getTime();
          const now = new Date().getTime();
          const additionalSeconds = Math.floor((now - start) / 1000);
          saved.elapsedTime += additionalSeconds;
          saved.startTime = new Date().toISOString(); // Reset start time
        }
        setState(saved);
      }
    };

    loadState();

    // Listen for storage changes (other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SHARED_TIMER_KEY) {
        loadState();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Poll for changes every 500ms (for same-tab sync)
    const pollInterval = setInterval(() => {
      const saved = safeGetItem<SharedTimerState | null>(SHARED_TIMER_KEY, null);
      if (saved && saved.lastUpdated !== state.lastUpdated) {
        loadState();
      }
    }, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.lastUpdated]);

  // Timer interval
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prev => ({
          ...prev,
          elapsedTime: prev.elapsedTime + 1,
        }));
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning]);

  const saveState = useCallback((newState: SharedTimerState) => {
    safeSetItem(SHARED_TIMER_KEY, newState);
    setState(newState);
  }, []);

  const start = useCallback(() => {
    const newState: SharedTimerState = {
      isRunning: true,
      elapsedTime: state.elapsedTime,
      startTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      startedBy: userId,
      startedByName: userName,
      pausedBy: null,
      pausedByName: null,
    };
    saveState(newState);
  }, [state.elapsedTime, userId, userName, saveState]);

  const pause = useCallback(() => {
    const newState: SharedTimerState = {
      ...state,
      isRunning: false,
      lastUpdated: new Date().toISOString(),
      pausedBy: userId,
      pausedByName: userName,
    };
    saveState(newState);
  }, [state, userId, userName, saveState]);

  const resume = useCallback(() => {
    const newState: SharedTimerState = {
      ...state,
      isRunning: true,
      startTime: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      pausedBy: null,
      pausedByName: null,
    };
    saveState(newState);
  }, [state, saveState]);

  const stop = useCallback(() => {
    const newState: SharedTimerState = {
      ...state,
      isRunning: false,
      lastUpdated: new Date().toISOString(),
    };
    saveState(newState);
  }, [state, saveState]);

  const reset = useCallback(() => {
    const newState: SharedTimerState = {
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
      lastUpdated: new Date().toISOString(),
      startedBy: '',
      startedByName: '',
      pausedBy: null,
      pausedByName: null,
    };
    saveState(newState);
  }, [saveState]);

  // Format elapsed time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formattedTime = formatTime(state.elapsedTime);

  return {
    isRunning: state.isRunning,
    elapsedTime: state.elapsedTime,
    formattedTime,
    startedBy: state.startedByName,
    pausedBy: state.pausedByName,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
