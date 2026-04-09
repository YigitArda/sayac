import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, set, onValue, push, update } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import type { TimerSession, Todo, Goal } from '@/types';
import type { FeedPost } from '@/types/couple';

// Firestore Services
export class FirestoreService {
  // Timer Sessions
  static async saveTimerSession(userId: string, session: TimerSession): Promise<void> {
    const sessionRef = doc(db, 'users', userId, 'timerSessions', session.id);
    await setDoc(sessionRef, { ...session, timestamp: serverTimestamp() });
  }

  static async getTimerSessions(userId: string): Promise<TimerSession[]> {
    const q = query(
      collection(db, 'users', userId, 'timerSessions'),
      orderBy('startedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as TimerSession);
  }

  static onTimerSessionsChange(userId: string, callback: (sessions: TimerSession[]) => void): () => void {
    const q = query(
      collection(db, 'users', userId, 'timerSessions'),
      orderBy('startedAt', 'desc')
    );
    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => doc.data() as TimerSession);
      callback(sessions);
    });
  }

  // Todos
  static async saveTodo(userId: string, todo: Todo): Promise<void> {
    const todoRef = doc(db, 'users', userId, 'todos', todo.id);
    await setDoc(todoRef, todo);
  }

  static async getTodos(userId: string): Promise<Todo[]> {
    const q = query(collection(db, 'users', userId, 'todos'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Todo);
  }

  static onTodosChange(userId: string, callback: (todos: Todo[]) => void): () => void {
    const q = query(collection(db, 'users', userId, 'todos'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as Todo));
    });
  }

  // Goals
  static async saveGoal(userId: string, goal: Goal): Promise<void> {
    const goalRef = doc(db, 'users', userId, 'goals', goal.id);
    await setDoc(goalRef, goal);
  }

  static async getGoals(userId: string): Promise<Goal[]> {
    const q = query(collection(db, 'users', userId, 'goals'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Goal);
  }

  static onGoalsChange(userId: string, callback: (goals: Goal[]) => void): () => void {
    const q = query(collection(db, 'users', userId, 'goals'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as Goal));
    });
  }
}

// Realtime Database Services (for shared features like couple feed)
export class RealtimeDBService {
  // Shared Timer
  static setSharedTimer(timerId: string, data: any): Promise<void> {
    return set(ref(rtdb, `sharedTimers/${timerId}`), { ...data, lastUpdated: Date.now() });
  }

  static onSharedTimerChange(timerId: string, callback: (data: any) => void): () => void {
    const timerRef = ref(rtdb, `sharedTimers/${timerId}`);
    const unsubscribe = onValue(timerRef, (snapshot) => {
      callback(snapshot.val());
    });
    return unsubscribe;
  }

  // Couple Feed
  static async addFeedPost(coupleId: string, post: FeedPost): Promise<void> {
    const postsRef = ref(rtdb, `couples/${coupleId}/posts`);
    const newPostRef = push(postsRef);
    await set(newPostRef, post);
  }

  static onFeedPostsChange(coupleId: string, callback: (posts: FeedPost[]) => void): () => void {
    const postsRef = ref(rtdb, `couples/${coupleId}/posts`);
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const posts = Object.entries(data).map(([id, post]: [string, any]) => ({
          ...post,
          id,
        }));
        callback(posts.sort((a: any, b: any) => b.createdAt - a.createdAt));
      } else {
        callback([]);
      }
    });
    return unsubscribe;
  }

  static async addReaction(coupleId: string, postId: string, reaction: string): Promise<void> {
    await update(ref(rtdb, `couples/${coupleId}/posts/${postId}`), {
      partnerReaction: reaction
    });
  }
}
