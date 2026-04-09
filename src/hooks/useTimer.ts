import { useState, useEffect, useCallback, useRef } from 'react';

interface TimerState {
  isRunning: boolean;
  elapsedTime: number; // in seconds
  startTime: Date | null;
}

interface UseTimerReturn {
  isRunning: boolean;
  elapsedTime: number;
  formattedTime: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  startTime: Date | null;
}

export function useTimer(): UseTimerReturn {
  const [state, setState] = useState<TimerState>({
    isRunning: false,
    elapsedTime: 0,
    startTime: null,
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedTimeRef = useRef<number>(0);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const start = useCallback(() => {
    const now = new Date();
    setState({
      isRunning: true,
      elapsedTime: 0,
      startTime: now,
    });
    pausedTimeRef.current = 0;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    pausedTimeRef.current = state.elapsedTime;
    setState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, [state.elapsedTime]);

  const resume = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRunning: true,
    }));
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        elapsedTime: prev.elapsedTime + 1,
      }));
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isRunning: false,
    }));
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState({
      isRunning: false,
      elapsedTime: 0,
      startTime: null,
    });
    pausedTimeRef.current = 0;
  }, []);

  // Format elapsed time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRunning: state.isRunning,
    elapsedTime: state.elapsedTime,
    formattedTime: formatTime(state.elapsedTime),
    start,
    pause,
    resume,
    stop,
    reset,
    startTime: state.startTime,
  };
}
