// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date | string;
  theme?: 'light' | 'dark';
  accentColor?: string;
  soundEnabled?: boolean;
  notificationsEnabled?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (name: string, email: string, password: string) => boolean;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// Timer Types
export interface TimerSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  duration: number; // in minutes
  category: string;
  description?: string;
  startedAt: Date | string;
  endedAt: Date | string;
  isShared: boolean;
  projectId?: string;
}

export interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  elapsedTime: number; // in seconds
  category: string;
  description: string;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  autoStartWork: boolean;
}

// Sleep Types
export interface SleepEntry {
  id: string;
  userId: string;
  date: Date | string;
  hours: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
}

// Book Types
export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: string;
  totalPages?: number;
}

export interface ReadingSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  pagesRead: number;
  duration: number; // in minutes
  date: Date;
  isShared: boolean;
}

// Activity Feed Types
export type ActivityType = 'timer' | 'sleep' | 'reading' | 'meditation' | 'exercise' | 'water' | 'mood';

export interface Activity {
  id: string;
  type: ActivityType;
  userId: string;
  userName: string;
  userAvatar?: string;
  data: TimerSession | SleepEntry | ReadingSession | MeditationSession | ExerciseEntry | WaterEntry | MoodEntry;
  createdAt: Date | string;
  likes: number;
  comments: Comment[];
  likedBy: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
}

// Stats Types
export interface DailyStats {
  date: string;
  workMinutes: number;
  sleepHours: number;
  readingMinutes: number;
  meditationMinutes: number;
  exerciseMinutes: number;
  waterGlasses: number;
}

export interface WeeklyStats {
  days: DailyStats[];
  totalWorkHours: number;
  totalSleepHours: number;
  totalReadingHours: number;
  averageWorkHours: number;
  averageSleepHours: number;
  averageReadingHours: number;
}

export interface BookStats {
  book: Book;
  totalPagesRead: number;
  totalTimeMinutes: number;
  sessionsCount: number;
}

// ==================== NEW FEATURES ====================

// Goals Types
export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'work' | 'reading' | 'sleep' | 'meditation' | 'exercise' | 'water';
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date | string;
  endDate: Date | string;
  isCompleted: boolean;
  isActive: boolean;
  createdAt: Date | string;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: 'streak' | 'total' | 'single';
    category: string;
    value: number;
  };
}

export interface UserBadge {
  badgeId: string;
  earnedAt: Date | string;
}

// Todo Types
export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date | string;
  projectId?: string;
  tags: string[];
  createdAt: Date | string;
  completedAt?: Date | string;
}

// Project Types
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  targetHours?: number;
  completedHours: number;
  status: 'active' | 'completed' | 'archived';
  createdAt: Date | string;
}

// Meditation Types
export interface MeditationSession {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  duration: number; // minutes
  type: 'breathing' | 'mindfulness' | 'body_scan' | 'guided';
  completedAt: Date | string;
  isShared: boolean;
}

// Exercise Types
export type ExerciseType = 'running' | 'walking' | 'cycling' | 'swimming' | 'gym' | 'yoga' | 'other';

export interface ExerciseEntry {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: ExerciseType;
  duration: number; // minutes
  distance?: number; // km
  calories?: number;
  notes?: string;
  date: Date | string;
  isShared: boolean;
}

// Water Types
export interface WaterEntry {
  id: string;
  userId: string;
  amount: number; // glasses (250ml)
  date: Date | string;
}

// Mood Types
export type MoodType = 'terrible' | 'bad' | 'neutral' | 'good' | 'excellent';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodType;
  note?: string;
  activities: string[];
  date: Date | string;
}

// Friend Types
export interface Friend {
  userId: string;
  friendId: string;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: Date | string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date | string;
}

// Focus Room Types
export interface FocusRoom {
  id: string;
  name: string;
  description?: string;
  hostId: string;
  hostName: string;
  participants: FocusRoomParticipant[];
  maxParticipants: number;
  isPrivate: boolean;
  password?: string;
  sessionDuration: number;
  breakDuration: number;
  status: 'waiting' | 'active' | 'break' | 'ended';
  createdAt: Date | string;
  startedAt?: Date | string;
}

export interface FocusRoomParticipant {
  userId: string;
  userName: string;
  userAvatar?: string;
  joinedAt: Date | string;
  isReady: boolean;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'goal_completed' | 'badge_earned' | 'friend_request' | 'comment' | 'like' | 'reminder' | 'streak';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

// Reminder Types
export interface Reminder {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'sleep' | 'water' | 'reading' | 'exercise' | 'custom';
  time: string; // HH:mm format
  days: number[]; // 0-6 (Sunday-Saturday)
  isActive: boolean;
}

// Sound Types
export type SoundType = 'white_noise' | 'rain' | 'ocean' | 'forest' | 'cafe' | 'lofi' | 'none';

export interface SoundSettings {
  type: SoundType;
  volume: number;
  isPlaying: boolean;
}

// Theme Types
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
}

// Leaderboard Types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  workHours: number;
  readingHours: number;
  streak: number;
  rank: number;
}

// Calendar Types
export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  type: ActivityType;
  date: Date | string;
  duration?: number;
  data?: unknown;
}

// Export Types
export interface ExportData {
  user: User;
  timerSessions: TimerSession[];
  sleepEntries: SleepEntry[];
  readingSessions: ReadingSession[];
  meditationSessions: MeditationSession[];
  exerciseEntries: ExerciseEntry[];
  waterEntries: WaterEntry[];
  moodEntries: MoodEntry[];
  goals: Goal[];
  todos: Todo[];
  projects: Project[];
  badges: UserBadge[];
  exportedAt: Date | string;
}

// ==================== NEW ADVANCED FEATURES ====================

// Smart Break Types
export interface BreakReminder {
  id: string;
  userId: string;
  workDuration: number; // minutes before break
  breakDuration: number; // minutes of break
  isEnabled: boolean;
  lastTriggered?: Date | string;
}

// Optimal Hours Analysis
export interface HourlyProductivity {
  hour: number; // 0-23
  totalWorkMinutes: number;
  sessionCount: number;
  averageFocusScore: number;
}

// Predictions
export interface DailyPrediction {
  date: Date | string;
  predictedWorkMinutes: number;
  confidence: number; // 0-100
  suggestion: string;
}

// Time Blocking Types
export interface TimeBlock {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  dayOfWeek: number; // 0-6
  color: string;
  category: string;
  isRecurring: boolean;
  isCompleted: boolean;
}

// Routine Types
export type RoutineType = 'morning' | 'evening' | 'custom';

export interface Routine {
  id: string;
  userId: string;
  name: string;
  type: RoutineType;
  tasks: RoutineTask[];
  targetTime?: string; // HH:mm
  isActive: boolean;
  streak: number;
  lastCompleted?: Date | string;
}

export interface RoutineTask {
  id: string;
  title: string;
  duration: number; // minutes
  isCompleted: boolean;
  order: number;
}

// Habit Chain Types
export interface Habit {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  targetDays: number; // 21, 66, 90, or custom
  currentStreak: number;
  longestStreak: number;
  completedDates: (Date | string)[];
  isActive: boolean;
  createdAt: Date | string;
}

// Daily Notes Types
export interface DailyNote {
  id: string;
  userId: string;
  date: Date | string;
  content: string;
  mood?: MoodType;
  tags: string[];
  isGratitude: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Idea Vault Types
export interface Idea {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isVoiceNote: boolean;
  audioUrl?: string;
  createdAt: Date | string;
}

// Voice Note Types
export interface VoiceNote {
  id: string;
  userId: string;
  title: string;
  audioBlob: Blob;
  duration: number; // seconds
  transcript?: string;
  createdAt: Date | string;
}

// Productivity Score Types
export interface ProductivityMetrics {
  date: Date | string;
  workScore: number; // 0-100
  consistencyScore: number; // 0-100
  focusScore: number; // 0-100
  balanceScore: number; // 0-100
  overallScore: number; // 0-100
}

// Comparison Types
export interface PeriodComparison {
  currentPeriod: {
    workHours: number;
    readingHours: number;
    meditationMinutes: number;
    exerciseMinutes: number;
    sleepHours: number;
    waterGlasses: number;
  };
  previousPeriod: {
    workHours: number;
    readingHours: number;
    meditationMinutes: number;
    exerciseMinutes: number;
    sleepHours: number;
    waterGlasses: number;
  };
  changes: {
    workHoursChange: number; // percentage
    readingHoursChange: number;
    meditationMinutesChange: number;
    exerciseMinutesChange: number;
    sleepHoursChange: number;
    waterGlassesChange: number;
  };
}