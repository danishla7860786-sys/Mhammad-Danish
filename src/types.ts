export interface User {
  id: string; // e.g., "7777" (custom premium ID or 4-digit)
  name: string;
  avatar: string;
  bio: string;
  coins: number; // purchased currency
  diamonds: number; // earned currency from receiving gifts
  level: number;
  badge: 'Guest' | 'Host' | 'Manager' | 'Reseller' | 'Super Admin' | string;
  frame?: string; // profile frame styling
  vipBadge?: string;
  family?: string;
  relationshipCP?: string; // name of CP partner
  gender?: 'Male' | 'Female' | 'Other' | string;
  age?: number;
  country?: string;
  dp?: string; // display picture URL
  role?: string; // e.g., 'Independent Host', 'Agency Owner', 'BD Owner'
  hasCreatedRoom?: boolean;
  myCreatedRoom?: any;
}

export interface Proposal {
  id: string;
  applicantName: string;
  category: string;
  experience: string;
  socialLinks: string;
  introLink: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  timestamp: string;
}

export interface DMMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  recipientId: string;
  text: string;
  timestamp: string;
  giftIcon?: string;
  read?: boolean;
  isSystem?: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  text: string;
  type: 'proposal' | 'coin_received' | 'official';
  timestamp: string;
  read: boolean;
}

export interface MicSeat {
  index: number;
  user: User | null;
  isMuted: boolean;
  isLocked: boolean;
}

export interface Gift {
  id: string;
  name: string;
  cost: number;
  icon: string;
  animationType: 'sparkle' | 'heart-rain' | 'sports-car' | 'lucky-bag' | 'rocket';
  category: 'Popular' | 'Luxury' | 'Interactive' | 'Special';
}

export interface PKBattle {
  isActive: boolean;
  timeLeft: number; // in seconds
  ourPoints: number;
  enemyPoints: number;
  ourTopGivers: { name: string; avatar: string; contribution: number }[];
  enemyTopGivers?: { name: string; avatar: string; contribution: number }[];
  enemyName: string;
  enemyAvatar: string;
}

export interface Room {
  id: string;
  title: string;
  host: User;
  description: string;
  category: 'Music' | 'Gaming' | 'Chat' | 'Social';
  privacy: 'Public' | 'Password' | 'Private';
  password?: string;
  country: string;
  language: string;
  viewers: number;
  seats: MicSeat[];
  pk: PKBattle | null;
  isPromoted?: boolean;
  promotionType?: string;
  giftsReceived?: number;
}

export interface ChatMessage {
  id: string;
  user?: User;
  text: string;
  isSystem?: boolean;
  gift?: {
    name: string;
    icon: string;
    count: number;
    cost: number;
  };
  timestamp: string;
}

export interface AgencyHost {
  id: string;
  name: string;
  agencyId: string;
  targetHours: number;
  hoursCompleted: number;
  diamondsEarned: number;
  level: number;
  status: 'Active' | 'Pending' | 'Terminated';
}

export interface Agency {
  id: string;
  name: string;
  ownerName: string;
  totalHosts: number;
  monthlyRevenueDiamonds: number;
  status: 'Verified' | 'Pending';
}

export interface Reseller {
  id: string;
  name: string;
  jazzcashNumber: string;
  easypaisaNumber: string;
  availableCoinsBulk: number;
  discountRate: number; // e.g., 20%
}

export interface ResellerLog {
  id: string;
  resellerId: string;
  resellerName: string;
  targetUserId: string;
  targetUserName: string;
  amount: number;
  timestamp: string;
}

export interface ModerationLog {
  id: string;
  moderatorId: string;
  moderatorName: string;
  targetUserId: string;
  targetUserName: string;
  action: 'Mute' | 'Kick' | 'Ban' | 'Unban';
  roomId?: string;
  reason: string;
  timestamp: string;
}

export interface EstimateItem {
  id: string;
  name: string;
  phase: 'Design' | 'Core' | 'Gaming' | 'Admin & Reseller' | 'Launch';
  devCostRange: [number, number]; // [min, max] in USD
  devTimeDays: number;
  description: string;
  techKeywords: string[];
}
