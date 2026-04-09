import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FeedPost, CoupleStats } from '@/types/couple';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface CoupleContextType {
  posts: FeedPost[];
  stats: CoupleStats;
  addPost: (post: Omit<FeedPost, 'id' | 'userId' | 'userName' | 'userAvatar' | 'createdAt'>) => void;
  addReaction: (postId: string, reaction: '❤️' | '🔥' | '👏' | '💪') => void;
  addWorkSession: (duration: number, category: string, description?: string) => void;
  deletePost: (postId: string) => void;
}

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

const POSTS_KEY = 'focustrack_couple_posts';

export function CoupleProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);

  // Load posts from storage
  useEffect(() => {
    const postsData = safeGetItem<FeedPost[]>(POSTS_KEY, []);
    setPosts(postsData);
  }, []);

  // Save posts to storage
  useEffect(() => {
    safeSetItem(POSTS_KEY, posts);
  }, [posts]);

  // Add new post
  const addPost = useCallback((postData: Omit<FeedPost, 'id' | 'userId' | 'userName' | 'userAvatar' | 'createdAt'>) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    const newPost: FeedPost = {
      ...postData,
      id: `post_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      createdAt: new Date().toISOString(),
    };

    setPosts(prev => [newPost, ...prev]);
    toast.success('Paylaşım eklendi! 💕');
  }, [user]);

  // Add reaction to post
  const addReaction = useCallback((postId: string, reaction: '❤️' | '🔥' | '👏' | '💪') => {
    if (!user) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId && post.userId !== user.id) {
        return { ...post, partnerReaction: reaction };
      }
      return post;
    }));
  }, [user]);

  // Add work session (automatically creates a post)
  const addWorkSession = useCallback((duration: number, category: string, description?: string) => {
    if (!user) return;

    const newPost: FeedPost = {
      id: `post_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      type: 'work',
      content: {
        duration,
        category,
        description,
      },
      createdAt: new Date().toISOString(),
    };

    setPosts(prev => [newPost, ...prev]);
    toast.success('Çalışma oturumu paylaşıldı! 💪');
  }, [user]);

  // Delete own post
  const deletePost = useCallback((postId: string) => {
    if (!user) return;
    
    setPosts(prev => prev.filter(post => {
      if (post.id === postId && post.userId === user.id) {
        return false;
      }
      return true;
    }));
    toast.success('Paylaşım silindi');
  }, [user]);

  // Calculate stats
  const stats: CoupleStats = {
    totalWorkHoursTogether: posts
      .filter(p => p.type === 'work')
      .reduce((sum, p) => sum + (p.content.duration || 0), 0) / 60,
    longestStreakTogether: 0,
    currentStreakTogether: 0,
    postsCount: posts.length,
    reactionsGiven: posts.filter(p => p.partnerReaction && p.userId !== user?.id).length,
    reactionsReceived: posts.filter(p => p.userId === user?.id && p.partnerReaction).length,
  };

  return (
    <CoupleContext.Provider value={{
      posts,
      stats,
      addPost,
      addReaction,
      addWorkSession,
      deletePost,
    }}>
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  const context = useContext(CoupleContext);
  if (context === undefined) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return context;
}
