import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Friend, FriendRequest, LeaderboardEntry, Comment } from '@/types';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { safeGetItem, safeSetItem } from '@/lib/storage';

interface SocialContextType {
  // Friends
  friends: Friend[];
  friendRequests: FriendRequest[];
  sendFriendRequest: (toUserId: string, toUserName: string, toUserAvatar?: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  getFriendsList: () => { userId: string; userName: string; userAvatar?: string }[];
  getPendingRequests: () => FriendRequest[];
  isFriend: (userId: string) => boolean;
  hasPendingRequest: (userId: string) => boolean;
  
  // Leaderboard
  getLeaderboard: (period: 'weekly' | 'monthly' | 'allTime') => LeaderboardEntry[];
  getUserRank: (userId: string) => number;
  
  // Comments
  addComment: (activityId: string, text: string) => void;
  getComments: (activityId: string) => Comment[];
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const FRIENDS_KEY = 'focustrack_friends';
const FRIEND_REQUESTS_KEY = 'focustrack_friend_requests';

// Mock users for leaderboard
const MOCK_USERS = [
  { id: 'user_1', name: 'Ahmet Yılmaz', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ahmet' },
  { id: 'user_2', name: 'Zeynep Kaya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zeynep' },
  { id: 'user_3', name: 'Mehmet Demir', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mehmet' },
  { id: 'user_4', name: 'Ayşe Yıldız', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse' },
  { id: 'user_5', name: 'Can Özdemir', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=can' },
];

export function SocialProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const friendsData = safeGetItem<Friend[]>(FRIENDS_KEY, []);
    const requestsData = safeGetItem<FriendRequest[]>(FRIEND_REQUESTS_KEY, []);

    setFriends(friendsData);
    setFriendRequests(requestsData);
  }, []);

  useEffect(() => {
    safeSetItem(FRIENDS_KEY, friends);
  }, [friends]);

  useEffect(() => {
    safeSetItem(FRIEND_REQUESTS_KEY, friendRequests);
  }, [friendRequests]);

  // Friend functions
  const sendFriendRequest = useCallback((toUserId: string, _toUserName: string, _toUserAvatar?: string) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }

    if (user.id === toUserId) {
      toast.error('Kendinize arkadaşlık isteği gönderemezsiniz');
      return;
    }

    if (isFriend(toUserId)) {
      toast.error('Bu kullanıcı zaten arkadaşınız');
      return;
    }

    if (hasPendingRequest(toUserId)) {
      toast.error('Zaten bekleyen bir isteğiniz var');
      return;
    }

    const newRequest: FriendRequest = {
      id: `req_${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      fromUserAvatar: user.avatar,
      toUserId,
      status: 'pending',
      createdAt: new Date(),
    };

    setFriendRequests(prev => [...prev, newRequest]);
    toast.success('Arkadaşlık isteği gönderildi');
  }, [user]);

  const acceptFriendRequest = useCallback((requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (!request) return;

    // Create friendship (both directions)
    const friendship1: Friend = {
      userId: request.fromUserId,
      friendId: request.toUserId,
      status: 'accepted',
      createdAt: new Date(),
    };
    const friendship2: Friend = {
      userId: request.toUserId,
      friendId: request.fromUserId,
      status: 'accepted',
      createdAt: new Date(),
    };

    setFriends(prev => [...prev, friendship1, friendship2]);
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success('Arkadaşlık isteği kabul edildi');
  }, [friendRequests]);

  const rejectFriendRequest = useCallback((requestId: string) => {
    setFriendRequests(prev => prev.filter(r => r.id !== requestId));
    toast.success('Arkadaşlık isteği reddedildi');
  }, []);

  const removeFriend = useCallback((friendId: string) => {
    if (!user) return;
    setFriends(prev => prev.filter(f => 
      !(f.userId === user.id && f.friendId === friendId) &&
      !(f.userId === friendId && f.friendId === user.id)
    ));
    toast.success('Arkadaşlıktan çıkarıldı');
  }, [user]);

  const getFriendsList = useCallback(() => {
    if (!user) return [];
    const userFriends = friends.filter(f => f.userId === user.id && f.status === 'accepted');
    return userFriends.map(f => {
      const friendUser = MOCK_USERS.find(u => u.id === f.friendId);
      return {
        userId: f.friendId,
        userName: friendUser?.name || 'Bilinmeyen',
        userAvatar: friendUser?.avatar,
      };
    });
  }, [friends, user]);

  const getPendingRequests = useCallback(() => {
    if (!user) return [];
    return friendRequests.filter(r => r.toUserId === user.id && r.status === 'pending');
  }, [friendRequests, user]);

  const isFriend = useCallback((userId: string) => {
    if (!user) return false;
    return friends.some(f => 
      f.userId === user.id && f.friendId === userId && f.status === 'accepted'
    );
  }, [friends, user]);

  const hasPendingRequest = useCallback((userId: string) => {
    if (!user) return false;
    return friendRequests.some(r => 
      (r.fromUserId === user.id && r.toUserId === userId && r.status === 'pending') ||
      (r.fromUserId === userId && r.toUserId === user.id && r.status === 'pending')
    );
  }, [friendRequests, user]);

  // Leaderboard
  const getLeaderboard = useCallback((_period: 'weekly' | 'monthly' | 'allTime'): LeaderboardEntry[] => {
    // Generate mock leaderboard data
    const entries: LeaderboardEntry[] = MOCK_USERS.map((u, index) => ({
      userId: u.id,
      userName: u.name,
      userAvatar: u.avatar,
      score: Math.floor(Math.random() * 5000) + 1000,
      workHours: Math.floor(Math.random() * 100) + 20,
      readingHours: Math.floor(Math.random() * 50) + 5,
      streak: Math.floor(Math.random() * 30) + 1,
      rank: index + 1,
    }));

    return entries.sort((a, b) => b.score - a.score).map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
  }, []);

  const getUserRank = useCallback((userId: string) => {
    const leaderboard = getLeaderboard('weekly');
    const entry = leaderboard.find(e => e.userId === userId);
    return entry?.rank || 0;
  }, [getLeaderboard]);

  // Comments
  const addComment = useCallback((_activityId: string, _text: string) => {
    if (!user) {
      toast.error('Lütfen önce giriş yapın');
      return;
    }
    // Comments are stored in the activity, handled in DataContext
    toast.success('Yorum eklendi');
  }, [user]);

  const getComments = useCallback((_activityId: string) => {
    // This would be implemented with the activity data
    return [] as Comment[];
  }, []);

  return (
    <SocialContext.Provider value={{
      friends,
      friendRequests,
      sendFriendRequest,
      acceptFriendRequest,
      rejectFriendRequest,
      removeFriend,
      getFriendsList,
      getPendingRequests,
      isFriend,
      hasPendingRequest,
      getLeaderboard,
      getUserRank,
      addComment,
      getComments,
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
}

