// Özel çift modu tipleri

export interface CoupleConnection {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  user1Avatar?: string;
  user2Avatar?: string;
  createdAt: string;
  connectionCode: string;
}

export type FeedPostType = 'work' | 'text' | 'image';

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: FeedPostType;
  content: {
    // Work type
    duration?: number;
    category?: string;
    description?: string;
    // Text type
    text?: string;
    // Image type
    imageUrl?: string;
    caption?: string;
  };
  createdAt: string;
  partnerReaction?: '❤️' | '🔥' | '👏' | '💪' | null;
}

export interface PartnerInfo {
  id: string;
  name: string;
  avatar?: string;
  isConnected: boolean;
}

export interface CoupleStats {
  totalWorkHoursTogether: number;
  longestStreakTogether: number;
  currentStreakTogether: number;
  postsCount: number;
  reactionsGiven: number;
  reactionsReceived: number;
}
