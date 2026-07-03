import React, { useState, useEffect } from 'react';
import { 
  User, 
  Proposal, 
  DMMessage, 
  SystemNotification, 
  AgencyHost, 
  Agency 
} from '../types';
import { 
  User as UserIcon, 
  Sparkles, 
  Coins, 
  Award, 
  ShieldAlert, 
  Shield, 
  Activity, 
  MessageSquare, 
  Send, 
  Bell, 
  Check, 
  X, 
  Wallet, 
  Smartphone, 
  CreditCard, 
  ArrowRight, 
  History, 
  UserPlus, 
  Globe, 
  Flame,
  CheckCircle,
  Clock,
  Heart,
  Ban,
  ChevronRight,
  Landmark,
  Trophy,
  HelpCircle,
  Radio,
  Share2,
  Search
} from 'lucide-react';
import AgencyPortal from './AgencyPortal';
import ResellerPanel from './ResellerPanel';
import AdminPanel from './AdminPanel';
import BudgetEstimator from './BudgetEstimator';

interface ProfileHubProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  dmMessages: DMMessage[];
  setDmMessages: React.Dispatch<React.SetStateAction<DMMessage[]>>;
  systemNotifications: SystemNotification[];
  setSystemNotifications: React.Dispatch<React.SetStateAction<SystemNotification[]>>;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  securityLogs: any[];
  setSecurityLogs: React.Dispatch<React.SetStateAction<any[]>>;
  addAdminLog: (log: string) => void;
  mockUsers: any[];
  setMockUsers?: React.Dispatch<React.SetStateAction<any[]>>;
  onCoinsTransferred?: (targetId: string, amount: number) => void;
  adminLogs?: string[];
  clearLogs?: () => void;
  banUser?: (userId: string) => void;
  bannedUsers?: string[];
  initialTab?: string;
}

export default function ProfileHub({
  currentUser,
  setCurrentUser,
  proposals,
  setProposals,
  dmMessages,
  setDmMessages,
  systemNotifications,
  setSystemNotifications,
  transactions,
  setTransactions,
  securityLogs,
  setSecurityLogs,
  addAdminLog,
  mockUsers,
  setMockUsers,
  onCoinsTransferred,
  adminLogs = [],
  clearLogs = () => {},
  banUser = () => {},
  bannedUsers = [],
  initialTab
}: ProfileHubProps) {
  // Current Active Sub-Section Inside Profile Hub
  const [currentTab, setCurrentTab] = useState<string>(initialTab || 'profile');
  const [msgSortOrder, setMsgSortOrder] = useState<'newest' | 'oldest'>('oldest');
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');

  // Daily Check-in States
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(() => localStorage.getItem('voco_last_check_in'));
  const [checkInStreak, setCheckInStreak] = useState<number>(() => {
    const streak = localStorage.getItem('voco_check_in_streak');
    return streak ? parseInt(streak, 10) : 0;
  });
  const [showCheckInSuccessModal, setShowCheckInSuccessModal] = useState<boolean>(false);
  const [earnedAmount, setEarnedAmount] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const handleDailyCheckIn = (isAuto: boolean = false) => {
    const now = new Date();
    const lastCheckInStr = localStorage.getItem('voco_last_check_in');
    
    // Validate if check-in is genuinely available (24 hours check)
    if (lastCheckInStr) {
      const lastTime = new Date(lastCheckInStr).getTime();
      const timeDiff = now.getTime() - lastTime;
      if (timeDiff < 24 * 60 * 60 * 1000) {
        if (!isAuto) {
          alert('You have already checked in today! Please wait for the timer to expire.');
        }
        return;
      }
    }

    // Determine streak (consecutive if last check-in was < 48 hours ago, else reset to 1)
    let newStreak = 1;
    if (lastCheckInStr) {
      const lastTime = new Date(lastCheckInStr).getTime();
      const timeDiff = now.getTime() - lastTime;
      if (timeDiff < 48 * 60 * 60 * 1000) {
        newStreak = (checkInStreak % 7) + 1; // 7-day cycle
      }
    } else {
      newStreak = 1;
    }

    // Determine diamonds earned based on streak day
    const rewards = [50, 75, 100, 125, 150, 175, 300];
    const rewardIndex = (newStreak - 1) % 7;
    const diamondsEarned = rewards[rewardIndex];

    // Update state and localStorage
    const nowIso = now.toISOString();
    localStorage.setItem('voco_last_check_in', nowIso);
    localStorage.setItem('voco_check_in_streak', newStreak.toString());
    setLastCheckIn(nowIso);
    setCheckInStreak(newStreak);
    setEarnedAmount(diamondsEarned);
    setShowCheckInSuccessModal(true);

    // Update user diamonds
    setCurrentUser({
      ...currentUser,
      diamonds: currentUser.diamonds + diamondsEarned
    });

    // Add transaction log
    const newTx = {
      id: 'tx_checkin_' + Date.now(),
      type: 'Check-in Reward',
      item: `Daily Check-in Day ${newStreak} Reward`,
      amount: diamondsEarned,
      currency: 'Diamonds',
      status: 'Success',
      timestamp: now.toISOString().replace('T', ' ').substring(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    // System security log
    addAdminLog(`Daily Check-in System: ${currentUser.name} checked in (Streak: Day ${newStreak}) and claimed ${diamondsEarned} Diamonds.`);

    // Add profile activity log if available
    addProfileAdminLog(currentUser.id, `Claimed Daily Check-in Day ${newStreak} reward (+${diamondsEarned} Diamonds)`);

    // Add system notification
    const newNotif: SystemNotification = {
      id: 'notif_checkin_' + Date.now(),
      title: '🎁 Daily Check-In Reward Claimed!',
      text: `Mubarak Ho! You claimed +${diamondsEarned} Streamer Diamonds for checking in today (Streak: Day ${newStreak}/7). Keep checking in every 24 hours!`,
      type: 'coin_received',
      timestamp: 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [newNotif, ...prev]);
  };

  const handleResetCheckInTimer = () => {
    localStorage.removeItem('voco_last_check_in');
    setLastCheckIn(null);
    setTimeRemaining('');
    alert('Timer reset! You can now check-in again.');
  };

  useEffect(() => {
    // Check if check-in is available on app open (when ProfileHub mounts)
    const now = new Date();
    const lastCheckInStr = localStorage.getItem('voco_last_check_in');
    
    let isAvailable = true;
    if (lastCheckInStr) {
      const lastTime = new Date(lastCheckInStr).getTime();
      const timeDiff = now.getTime() - lastTime;
      if (timeDiff < 24 * 60 * 60 * 1000) {
        isAvailable = false;
      }
    }

    if (isAvailable) {
      // Auto check-in!
      handleDailyCheckIn(true);
    }

    // Set up countdown timer update
    const updateCountdown = () => {
      const lastTimeStr = localStorage.getItem('voco_last_check_in');
      if (!lastTimeStr) {
        setTimeRemaining('');
        return;
      }
      const lastTime = new Date(lastTimeStr).getTime();
      const nextAvailableTime = lastTime + 24 * 60 * 60 * 1000;
      const currentNow = new Date().getTime();
      const diff = nextAvailableTime - currentNow;

      if (diff <= 0) {
        setTimeRemaining('');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  // Sync if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setCurrentTab(initialTab);
    }
  }, [initialTab]);

  // Edit Profile States
  const [editName, setEditName] = useState(currentUser.name);
  const [editBio, setEditBio] = useState(currentUser.bio || '');
  const [editGender, setEditGender] = useState<string>(currentUser.gender || 'Male');
  const [editAge, setEditAge] = useState<number>(currentUser.age || 24);
  const [editCountry, setEditCountry] = useState<string>(currentUser.country || 'Pakistan 🇵🇰');

  // Keep edit profile form state synchronized with actual currentUser details
  useEffect(() => {
    setEditName(currentUser.name);
    setEditBio(currentUser.bio || '');
    setEditGender(currentUser.gender || 'Male');
    setEditAge(currentUser.age || 24);
    setEditCountry(currentUser.country || 'Pakistan 🇵🇰');
  }, [currentUser.name, currentUser.bio, currentUser.gender, currentUser.age, currentUser.country]);

  // Extract current user's (Danish's) own stream proposals instead of showing Kamran's or AI's applications
  const myProposals = proposals.filter(p => p.applicantName === currentUser.name || p.applicantName.includes('Danish'));
  const myProposal = myProposals[0] || null;

  // Proposal Form States
  const [propCategory, setPropCategory] = useState<'Sufi Singer' | 'Qawwali Host' | 'Gaming DJ' | 'Urdu Poet' | 'Ludo Master' | 'General Chat'>('Sufi Singer');
  const [propExperience, setPropExperience] = useState('');
  const [propSocialLinks, setPropSocialLinks] = useState('');
  const [propIntroLink, setPropIntroLink] = useState('');



  // Cashout Form States
  const [cashoutAmount, setCashoutAmount] = useState<number>(2000); // diamonds
  const [cashoutMethod, setCashoutMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank'>('JazzCash');
  const [cashoutDetails, setCashoutDetails] = useState('');

  // Diamond Exchange States
  const [exchangeAmount, setExchangeAmount] = useState<number>(1000); // diamonds


  // Agency System States
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteRoster, setInviteRoster] = useState<AgencyHost[]>([
    { id: '1001', name: 'Kamran (Host)', agencyId: '99331', targetHours: 30, hoursCompleted: 18, diamondsEarned: 24000, level: 32, status: 'Active' },
    { id: '1002', name: 'Aisha (AI)', agencyId: '99331', targetHours: 20, hoursCompleted: 14, diamondsEarned: 8500, level: 18, status: 'Active' },
    { id: '1003', name: 'Zain (AI)', agencyId: '99331', targetHours: 25, hoursCompleted: 9, diamondsEarned: 12500, level: 21, status: 'Active' }
  ]);
  const [inviteLogs, setInviteLogs] = useState<string[]>([]);

  // DM Messaging States
  const [activeContactId, setActiveContactId] = useState<string>('1001');
  const [typedMessage, setTypedMessage] = useState('');

  // --- PROMOTE SYSTEM STATES & HANDLERS ---
  const [promoteUserId, setPromoteUserId] = useState<string>('1001');
  const [promoteNewRole, setPromoteNewRole] = useState<string>('Super Admin');
  const [promoteLevelBoost, setPromoteLevelBoost] = useState<number>(5);
  const [promoteVIPBadge, setPromoteVIPBadge] = useState<string>('Gold VIP');
  
  const [promoteRoomId, setPromoteRoomId] = useState<string>('R109');
  const [promoteBoostTier, setPromoteBoostTier] = useState<string>('ELITE');

  const handlePromoteUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine target name
    let targetName = "Unknown";
    let isSelf = promoteUserId === currentUser.id;

    if (isSelf) {
      targetName = currentUser.name;
      const updatedUser = {
        ...currentUser,
        badge: promoteNewRole,
        level: currentUser.level + promoteLevelBoost,
        vipBadge: promoteVIPBadge === 'None' ? undefined : promoteVIPBadge
      };
      setCurrentUser(updatedUser);
    } else {
      const match = mockUsers.find(u => u.id === promoteUserId);
      if (match) {
        targetName = match.name;
      } else {
        targetName = `User #${promoteUserId}`;
      }

      if (setMockUsers) {
        setMockUsers(prev => prev.map(u => {
          if (u.id === promoteUserId) {
            return {
              ...u,
              badge: promoteNewRole,
              level: (u.level || 15) + promoteLevelBoost,
              vipBadge: promoteVIPBadge === 'None' ? undefined : promoteVIPBadge
            };
          }
          return u;
        }));
      }
    }

    // Add to logs & notify
    addAdminLog(`PROMOTION SYSTEM: User ID ${promoteUserId} (${targetName}) promoted to [${promoteNewRole}] with +${promoteLevelBoost} Levels & [${promoteVIPBadge}] Badge.`);
    addProfileAdminLog(currentUser.id, `Promoted User ${promoteUserId} to Role ${promoteNewRole}`);
    
    // Inject custom notification to recipient
    const sysNotif: SystemNotification = {
      id: 'notif_promote_' + Date.now(),
      title: '👑 Platform Promotion Granted',
      text: `Congratulations! You have been officially promoted to ${promoteNewRole} role with exclusive ${promoteVIPBadge} entrance badge privilege!`,
      type: 'official',
      timestamp: 'Just now',
      read: false
    };
    setSystemNotifications(prev => [sysNotif, ...prev]);

    // Send direct inbox congratulation message
    const autoDM: DMMessage = {
      id: 'dm_promote_' + Date.now(),
      senderId: '1002', // Aisha
      senderName: 'Aisha (AI)',
      senderAvatar: '👩',
      recipientId: currentUser.id,
      text: `Mubarak Ho! 🎉 You have promoted ID ${promoteUserId} (${targetName}) inside the VocoLive ecosystem. Visual badges and rank permissions are now live!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDmMessages(prev => [...prev, autoDM]);

    alert(`Mubarak Ho! ${targetName} (ID: ${promoteUserId}) has been promoted to ${promoteNewRole} role successfully!`);
  };

  const handleBoostRoom = (e: React.FormEvent) => {
    e.preventDefault();

    let cost = 200;
    let extraViewers = 100;
    if (promoteBoostTier === 'SPOTLIGHT') {
      cost = 500;
      extraViewers = 300;
    } else if (promoteBoostTier === 'ELITE') {
      cost = 1000;
      extraViewers = 800;
    }

    if (currentUser.coins < cost) {
      alert(`Insufficient Coins! Room promotion boost requires ${cost} Coins. Current Wallet balance is ${currentUser.coins} Coins.`);
      return;
    }

    // Deduct coins from reseller or current user
    setCurrentUser({
      ...currentUser,
      coins: currentUser.coins - cost
    });

    // Save boosted metadata to localStorage
    localStorage.setItem('voco_boosted_room_' + promoteRoomId, JSON.stringify({
      isPromoted: true,
      promotionType: promoteBoostTier,
      extraViewers: extraViewers
    }));

    // Find room name for visual logs
    const roomNames: Record<string, string> = {
      'R109': '✨ Sufi Night Vibes'
    };
    const rName = roomNames[promoteRoomId] || `Room ID #${promoteRoomId}`;

    addAdminLog(`ROOM BOOST: Promoted ${rName} (ID: ${promoteRoomId}) to [${promoteBoostTier}] list visibility for ${cost} Coins. Viewers boosted by +${extraViewers}.`);
    addProfileAdminLog(currentUser.id, `Boosted Room ID ${promoteRoomId} with Tier ${promoteBoostTier}`);

    const sysNotif: SystemNotification = {
      id: 'notif_boost_' + Date.now(),
      title: '🚀 Visibility Boost Activated',
      text: `Your spend of ${cost} Coins successfully boosted ${rName} with ${promoteBoostTier} golden badge list priority!`,
      type: 'coin_received',
      timestamp: 'Just now',
      read: false
    };
    setSystemNotifications(prev => [sysNotif, ...prev]);

    alert(`Visibility Boost Activated! ${rName} is now pinned with a PROMOTED status tag on the Arena Discovery tab.`);
  };

  // --- BUSINESS HUB SYSTEM STATES ---
  interface BusinessHost {
    id: string;
    name: string;
    targetPoints: number;
    achievedPoints: number;
    avatar: string;
  }

  interface BusinessAgency {
    id: string;
    name: string;
    ownerName: string;
    totalPoints: number;
    goalPoints: number;
  }

  // Active Role switcher for testing convenience and live preview fidelity
  const [selectedRole, setSelectedRole] = useState<string>(currentUser.role || 'BD Owner');

  // Sync role switch with actual user structure
  useEffect(() => {
    if (currentUser.role !== selectedRole) {
      setCurrentUser({ ...currentUser, role: selectedRole });
    }
  }, [selectedRole]);

  const [businessHosts, setBusinessHosts] = useState<BusinessHost[]>(() => {
    const saved = localStorage.getItem('voco_business_hosts');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1001', name: 'Ali Raza', targetPoints: 100000, achievedPoints: 85000, avatar: '👨‍💼' },
      { id: '1002', name: 'Kiran Shah', targetPoints: 50000, achievedPoints: 22000, avatar: '👩‍🎤' },
      { id: '1003', name: 'Sana Khan', targetPoints: 50000, achievedPoints: 34000, avatar: '👩‍🎨' }
    ];
  });

  const [bdAgencies, setBdAgencies] = useState<BusinessAgency[]>(() => {
    const saved = localStorage.getItem('voco_bd_agencies');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'AGENCY_ALPHA', name: 'Alpha Premium Agency', ownerName: 'OWNER_ALI', totalPoints: 137000, goalPoints: 200000 },
      { id: 'AGENCY_ROYAL', name: 'Royal Stars Agency', ownerName: 'OWNER_MALIK', totalPoints: 95000, goalPoints: 100000 }
    ];
  });

  const [bdOwnerId, setBdOwnerId] = useState<string>(() => {
    return localStorage.getItem('voco_bd_owner_id') || '7777';
  });

  const [pendingInvites, setPendingInvites] = useState<{ id: string; agencyName: string; ownerName: string; totalPoints: number; goalPoints: number }[]>(() => {
    const saved = localStorage.getItem('voco_pending_invites');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'AGENCY_OMEGA', agencyName: 'Omega Diamond Agency', ownerName: 'OWNER_SAJID', totalPoints: 60000, goalPoints: 100000 },
      { id: 'AGENCY_SINDH', agencyName: 'Sindh Warriors Agency', ownerName: 'OWNER_SHAH', totalPoints: 45000, goalPoints: 80000 }
    ];
  });

  const [inviteAgencyId, setInviteAgencyId] = useState('');
  const [newBdOwnerInput, setNewBdOwnerInput] = useState('');
  
  // Target setup states
  const [targetHostId, setTargetHostId] = useState('1001');
  const [targetPointsInput, setTargetPointsInput] = useState('');

  // Point simulator states
  const [simHostId, setSimHostId] = useState('1001');
  const [simPointsInput, setSimPointsInput] = useState('');

  // --- CORE BUSINESS SUITE STATES ---
  const [profileAdminLogs, setProfileAdminLogs] = useState<{ id: string; timestamp: string; adminId: string; log: string }[]>(() => {
    const saved = localStorage.getItem('voco_profile_admin_logs');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', timestamp: '10:05:23 AM', adminId: '1001', log: 'Admin 1001 kicked User 2022 from Seat #4' },
      { id: '2', timestamp: '10:14:11 AM', adminId: '99331', log: 'Target Set of 100,000 Points for Host 1001 (Kamran)' },
      { id: '3', timestamp: '10:22:45 AM', adminId: '1003', log: 'Admin 1003 banned abuser_321 via Hardware ID' },
      { id: '4', timestamp: '11:05:00 AM', adminId: '7777', log: 'Admin 7777 bound Agency Alpha (AGENCY_ALPHA) to BD Network Tree via Chokawa' },
      { id: '5', timestamp: '11:15:22 AM', adminId: '1001', log: 'Admin 1001 transferred 25,000 Coins to User 1003' },
      { id: '6', timestamp: '11:45:10 AM', adminId: '1003', log: 'Admin 1003 temp-muted User 2022 on Seat #3' },
      { id: '7', timestamp: '12:00:00 PM', adminId: '7777', log: 'Admin 7777 dismissed Agency Sindh (AGENCY_SINDH) from BD Network Tree via Chakwana' }
    ];
  });
  const [adminLogsSearch, setAdminLogsSearch] = useState('');
  const [resellerTargetId, setResellerTargetId] = useState('');
  const [resellerCoinsAmount, setResellerCoinsAmount] = useState('');
  const [pointsCalcInput, setPointsCalcInput] = useState('');

  // Persist logs in local storage
  useEffect(() => {
    localStorage.setItem('voco_profile_admin_logs', JSON.stringify(profileAdminLogs));
  }, [profileAdminLogs]);

  const addProfileAdminLog = (adminId: string, logMessage: string) => {
    const time = new Date().toLocaleTimeString();
    setProfileAdminLogs(prev => [
      {
        id: Date.now().toString(),
        timestamp: time,
        adminId,
        log: logMessage
      },
      ...prev
    ]);
  };

  // Persistency Effects
  useEffect(() => {
    localStorage.setItem('voco_business_hosts', JSON.stringify(businessHosts));
  }, [businessHosts]);

  useEffect(() => {
    localStorage.setItem('voco_bd_agencies', JSON.stringify(bdAgencies));
  }, [bdAgencies]);

  useEffect(() => {
    localStorage.setItem('voco_pending_invites', JSON.stringify(pendingInvites));
  }, [pendingInvites]);

  const handleSetHostTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetHostId || !targetPointsInput) {
      alert('Please enter points!');
      return;
    }
    const pts = Number(targetPointsInput);
    if (isNaN(pts) || pts <= 0) {
      alert('Points must be a positive number!');
      return;
    }
    setBusinessHosts(prev => prev.map(h => h.id === targetHostId ? { ...h, targetPoints: pts } : h));
    addAdminLog(`Points goal set of ${pts.toLocaleString()} pts ($${(pts / 1000).toFixed(2)}) for host ID ${targetHostId}`);
    addProfileAdminLog(currentUser.id, `Set Points Target of ${pts.toLocaleString()} pts for host ID ${targetHostId}`);
    alert('Host point goal assigned successfully!');
    setTargetPointsInput('');
  };

  const handleSimulateGiftPoints = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simHostId || !simPointsInput) {
      alert('Please enter simulated gift point value!');
      return;
    }
    const pts = Number(simPointsInput);
    if (isNaN(pts) || pts <= 0) {
      alert('Points must be a positive number!');
      return;
    }
    setBusinessHosts(prev => prev.map(h => h.id === simHostId ? { ...h, achievedPoints: h.achievedPoints + pts } : h));
    addAdminLog(`Gift Simulation: Host ID ${simHostId} received ${pts.toLocaleString()} points`);
    addProfileAdminLog('SIMULATOR', `Host ID ${simHostId} received ${pts.toLocaleString()} points via Gift Simulator`);
    alert(`Simulated ${pts.toLocaleString()} gift points successfully added to host!`);
    setSimPointsInput('');
  };

  const handleAppointBdOwner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBdOwnerInput.trim()) return;
    setBdOwnerId(newBdOwnerInput);
    localStorage.setItem('voco_bd_owner_id', newBdOwnerInput);
    addAdminLog(`BD Executive appointed to User ID: ${newBdOwnerInput}`);
    addProfileAdminLog(currentUser.id, `BD Executive appointed to User ID: ${newBdOwnerInput}`);
    alert(`User ID ${newBdOwnerInput} has been officially appointed as BD Owner!`);
    setNewBdOwnerInput('');
  };

  const handleInviteAgency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteAgencyId.trim()) return;
    
    const alreadyBound = bdAgencies.some(a => a.id.toLowerCase() === inviteAgencyId.toLowerCase());
    const alreadyPending = pendingInvites.some(a => a.id.toLowerCase() === inviteAgencyId.toLowerCase());
    if (alreadyBound) {
      alert('This agency is already bound to your tree!');
      return;
    }
    if (alreadyPending) {
      alert('An invitation is already pending for this agency ID!');
      return;
    }

    const newInvite = {
      id: inviteAgencyId.toUpperCase(),
      agencyName: `${inviteAgencyId.toUpperCase().replace('_', ' ')} Syndicate`,
      ownerName: `OWNER_${Math.random().toString(36).substring(3, 8).toUpperCase()}`,
      totalPoints: Math.floor(Math.random() * 50000) + 15000,
      goalPoints: 100000
    };

    setPendingInvites(prev => [...prev, newInvite]);
    addAdminLog(`BD Owner sent onboard invite to Agency ID: ${inviteAgencyId}`);
    addProfileAdminLog(currentUser.id, `BD Owner sent onboard invite to Agency ID: ${inviteAgencyId}`);
    alert(`Invitation sent to Agency ${newInvite.agencyName} (ID: ${newInvite.id})!`);
    setInviteAgencyId('');
  };

  const handleResellerTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resellerTargetId.trim()) {
      alert('Please enter a target User ID!');
      return;
    }
    const amount = Number(resellerCoinsAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount of Coins!');
      return;
    }

    if (currentUser.coins < amount) {
      alert(`Insufficient coins! Your current balance is ${currentUser.coins.toLocaleString()} Coins.`);
      return;
    }

    if (onCoinsTransferred) {
      onCoinsTransferred(resellerTargetId.trim(), amount);
    } else {
      setCurrentUser({ ...currentUser, coins: Math.max(0, currentUser.coins - amount) });
    }

    // Add profile audit logs
    addProfileAdminLog(currentUser.id, `Reseller System: Dispatched ${amount.toLocaleString()} Coins to User ID ${resellerTargetId}`);
    addAdminLog(`Reseller dispatched ${amount.toLocaleString()} Coins to Target ID "${resellerTargetId}"`);
    alert(`Transfer Successful!\nAllocated ${amount.toLocaleString()} Coins to User ID #${resellerTargetId}`);
    
    setResellerCoinsAmount('');
    setResellerTargetId('');
  };

  const handleChokawaOnboard = (agencyId: string) => {
    const found = pendingInvites.find(a => a.id === agencyId);
    if (!found) return;
    
    setPendingInvites(prev => prev.filter(a => a.id !== agencyId));
    setBdAgencies(prev => [...prev, {
      id: found.id,
      name: found.agencyName,
      ownerName: found.ownerName,
      totalPoints: found.totalPoints,
      goalPoints: found.goalPoints
    }]);
    addAdminLog(`BD Chokawa Action: Onboarded and bound agency "${found.agencyName}" to tree`);
    addProfileAdminLog(currentUser.id, `BD Chokawa: Approved & formally bound Agency "${found.agencyName}" (ID: ${found.id})`);
    alert(`Chokawa Onboard Approved: Agency ${found.agencyName} is now bound!`);
  };

  const handleChakwanaRemove = (agencyId: string) => {
    const found = bdAgencies.find(a => a.id === agencyId);
    if (!found) return;

    setBdAgencies(prev => prev.filter(a => a.id !== agencyId));
    setPendingInvites(prev => [...prev, {
      id: found.id,
      agencyName: found.name,
      ownerName: found.ownerName,
      totalPoints: found.totalPoints,
      goalPoints: found.goalPoints
    }]);
    addAdminLog(`BD Chakwana Action: Dismissed and removed agency "${found.name}" from tree`);
    addProfileAdminLog(currentUser.id, `BD Chakwana: Terminated and dismissed Agency "${found.name}" (ID: ${found.id})`);
    alert(`Chakwana Dismissed: Agency ${found.name} has been removed from tree.`);
  };

  const contacts = [
    { id: '1001', name: 'Kamran (Host)', avatar: '👨‍💼', badge: 'Verified Host', online: true },
    { id: '1002', name: 'Aisha (AI Streamer)', avatar: '👩‍🎤', badge: 'Agency Singer', online: true },
    { id: '1003', name: 'Zain (AI Ludo)', avatar: '👨‍💻', badge: 'Ludo Pro', online: false },
    { id: '99331', name: 'Agency Master Owner', avatar: '🦁', badge: 'Master Partner', online: true }
  ];

  // Quick Action triggers
  const handleSaveProfile = () => {
    setCurrentUser({
      ...currentUser,
      name: editName,
      bio: editBio,
      gender: editGender as any,
      age: editAge,
      country: editCountry
    });
    
    // Add Security Log
    const newLog = {
      id: 'sec_' + Date.now(),
      event: 'Profile details updated (Name, Age, Country)',
      device: 'Samsung Galaxy S24 Ultra (Android 14)',
      location: 'Lahore, Pakistan',
      ip: '182.180.119.42',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setSecurityLogs(prev => [newLog, ...prev]);
    addAdminLog(`Profile updated: ${editName}, Age: ${editAge}, Country: ${editCountry}`);
    alert('VocoLive Profile Saved Successfully!');
  };

  const handleApplyProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propExperience || !propSocialLinks) {
      alert('Please fill out experience and social links!');
      return;
    }

    const newProposal: Proposal = {
      id: 'prop_' + Date.now(),
      applicantName: currentUser.name,
      category: propCategory,
      experience: propExperience,
      socialLinks: propSocialLinks,
      introLink: propIntroLink || 'https://vocolive.audio/intros/new_talent.mp3',
      status: 'Pending',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setProposals(prev => [newProposal, ...prev]);
    addAdminLog(`New talent proposal submitted by ${currentUser.name} for ${propCategory}`);
    
    // Notify in system notifications
    const newNotif: SystemNotification = {
      id: 'notif_' + Date.now(),
      title: 'Proposal Received 📋',
      text: `Your application to register as a live streamer in category '${propCategory}' is received and is being vetted.`,
      type: 'proposal',
      timestamp: 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [newNotif, ...prev]);

    // Reset Form
    setPropExperience('');
    setPropSocialLinks('');
    setPropIntroLink('');
    alert('Your Talent Streamer Proposal has been submitted to VocoLive Board!');
  };

  const handleApproveProposal = (id: string, name: string, category: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
    addAdminLog(`Admin approved proposal #${id} of ${name}`);
    
    // Generate notification
    const newNotif: SystemNotification = {
      id: 'notif_apr_' + Date.now(),
      title: 'Proposal APPROVED! 🌟',
      text: `Congratulations ${name}! Your streamer profile for '${category}' has been verified. You can now start live streams with professional badge benefits.`,
      type: 'proposal',
      timestamp: 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [newNotif, ...prev]);
  };

  const handleRejectProposal = (id: string, name: string) => {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status: 'Rejected' } : p));
    addAdminLog(`Admin rejected proposal #${id} of ${name}`);
    
    const newNotif: SystemNotification = {
      id: 'notif_rej_' + Date.now(),
      title: 'Proposal Rejected ⚠️',
      text: `Your application for ${name} was rejected. Please review community guidelines and re-submit a comprehensive experience detail.`,
      type: 'proposal',
      timestamp: 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [newNotif, ...prev]);
  };

  const handleCashout = () => {
    if (currentUser.diamonds < cashoutAmount) {
      alert('Error: Insufficient diamonds in your VocoLive wallet!');
      return;
    }
    if (!cashoutDetails) {
      alert('Please enter details (account name, mobile wallet or bank IBAN)!');
      return;
    }

    // Convert: 1 Diamond = 0.8 PKR
    const pkrValue = Math.floor(cashoutAmount * 0.8);

    // Subtract diamonds
    setCurrentUser({
      ...currentUser,
      diamonds: currentUser.diamonds - cashoutAmount
    });

    // Add transaction log
    const newTx = {
      id: 'tx_cash_' + Date.now(),
      type: 'CashOut',
      item: `Converted ${cashoutAmount.toLocaleString()} Diamonds to Real Money`,
      amount: cashoutAmount,
      currency: 'Diamonds',
      cashAmount: pkrValue,
      cashCurrency: 'PKR',
      status: 'Success',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    addAdminLog(`Wallet cashout requested: ${cashoutAmount} Diamonds converted to ${pkrValue} PKR`);
    
    const newNotif: SystemNotification = {
      id: 'notif_out_' + Date.now(),
      title: 'Cash-out Processing 🏦',
      text: `Cashout request of ${cashoutAmount.toLocaleString()} Diamonds (${pkrValue} PKR) is processed successfully to ${cashoutMethod}.`,
      type: 'coin_received',
      timestamp: 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [newNotif, ...prev]);

    alert(`Cash-out Successful!\nSent ${pkrValue.toLocaleString()} PKR successfully to your ${cashoutMethod} account!`);
    setCashoutDetails('');
  };

  const getVipMultiplier = (badge?: string) => {
    if (!badge) return 1.0;
    if (badge === 'Bronze VIP') return 1.02;
    if (badge === 'Silver VIP') return 1.05;
    if (badge === 'Gold VIP') return 1.10;
    if (badge === 'Diamond VIP') return 1.20;
    return 1.0;
  };

  const handleDiamondExchange = () => {
    const isInputEmptyOrZero = exchangeAmount <= 0 || isNaN(exchangeAmount);
    const exceedsBalance = exchangeAmount > currentUser.diamonds;
    const belowMinimum = exchangeAmount < 100;
    const notMultipleOfTen = exchangeAmount % 10 !== 0;

    if (isInputEmptyOrZero) {
      alert('Please enter a valid amount of diamonds to exchange!');
      return;
    }
    if (exceedsBalance) {
      alert('Insufficient Diamonds! Please check your balance.');
      return;
    }
    if (belowMinimum) {
      alert('Minimum exchange limit is 100 Diamonds!');
      return;
    }
    if (notMultipleOfTen) {
      alert('Amount must be a multiple of 10 Diamonds!');
      return;
    }

    // Formula: Coins = Diamonds / 10
    const coinsEarned = Math.floor(exchangeAmount / 10);

    // Deduct diamonds and add coins
    setCurrentUser({
      ...currentUser,
      diamonds: currentUser.diamonds - exchangeAmount,
      coins: currentUser.coins + coinsEarned
    });

    // Add transaction log
    const newTx = {
      id: 'tx_exch_' + Date.now(),
      type: 'Exchange',
      item: `Exchanged ${exchangeAmount.toLocaleString()} Diamonds for ${coinsEarned.toLocaleString()} Coins`,
      amount: exchangeAmount,
      currency: 'Diamonds',
      cashAmount: coinsEarned,
      cashCurrency: 'Coins',
      status: 'Success',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setTransactions(prev => [newTx, ...prev]);

    addAdminLog(`Wallet exchange: ${exchangeAmount} Diamonds converted to ${coinsEarned} Coins (Strict rate: 10:1)`);

    const newNotif: SystemNotification = {
      id: 'notif_exch_' + Date.now(),
      title: 'Diamond Exchange Approved 🪙',
      text: `Successfully converted ${exchangeAmount.toLocaleString()} Streamer Diamonds into +${coinsEarned.toLocaleString()} Coins!`,
      type: 'coin_received',
      timestamp: 'Just Now',
      read: false
    };
    setSystemNotifications(prev => [newNotif, ...prev]);

    alert(`Exchange Successful!\nConverted ${exchangeAmount.toLocaleString()} Diamonds into +${coinsEarned.toLocaleString()} Coins instantly (Formula: Coins = Diamonds / 10).`);
  };

  const handleAgencyInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteUserId) {
      alert('Please enter a target User ID!');
      return;
    }

    // Simulate sending invite
    const targetUser = mockUsers.find(u => u.id === inviteUserId) || { id: inviteUserId, name: `Streamer #${inviteUserId}` };
    const logMsg = `[Pending] Agency invite sent to ${targetUser.name} (ID: #${inviteUserId})`;
    setInviteLogs(prev => [logMsg, ...prev]);
    addAdminLog(`Agency #99331 sent joining invitation to ID #${inviteUserId}`);

    // If it's a known AI user, accept after 2 seconds automatically for fun!
    if (inviteUserId === '1001' || inviteUserId === '1002' || inviteUserId === '1003') {
      setTimeout(() => {
        setInviteRoster(prev => {
          if (prev.some(h => h.id === inviteUserId)) return prev;
          return [
            ...prev,
            {
              id: inviteUserId,
              name: targetUser.name,
              agencyId: '99331',
              targetHours: 20,
              hoursCompleted: 0,
              diamondsEarned: 0,
              level: 15,
              status: 'Active'
            }
          ];
        });
        const acceptMsg = `[ACCEPTED] ${targetUser.name} (ID: #${inviteUserId}) accepted the agency joining invite!`;
        setInviteLogs(prev => [acceptMsg, ...prev]);
        addAdminLog(`${targetUser.name} joined Agency #99331 successfully.`);
      }, 2000);
    }

    setInviteUserId('');
    alert(`Invitation sent successfully to User ID #${inviteUserId}!`);
  };

  const handleSendMessage = () => {
    if (!typedMessage.trim()) return;

    const newDM: DMMessage = {
      id: 'dm_' + Date.now(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      recipientId: activeContactId,
      text: typedMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDmMessages(prev => [...prev, newDM]);
    setTypedMessage('');

    // Simulate AI response after a tiny delay
    setTimeout(() => {
      const activeName = contacts.find(c => c.id === activeContactId)?.name || 'Streamer';
      const responses = [
        `Bohat shukriya Danish bhai! VocoLive system main quality and dhol beat high frequency per chal rahi ha. ✨`,
        `Assalam-o-Alaikum, main ne abhi live room checkout kiya. Audio performance perfect ha zero delay k sath.`,
        `Coins wallet system dynamic ha. Reseller rate bohat best ha user k liye. 👍`,
        `Master agency owner reporting! Hmari streams 24/7 online ha, coins trigger speed are stunning.`
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];

      const aiDM: DMMessage = {
        id: 'dm_reply_' + Date.now(),
        senderId: activeContactId,
        senderName: activeName,
        senderAvatar: contacts.find(c => c.id === activeContactId)?.avatar || '👤',
        recipientId: currentUser.id,
        text: randomReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setDmMessages(prev => [...prev, aiDM]);
    }, 1500);
  };

  // Filter messages for current selected contact - show both user's sent messages and incoming replies
  // Strictly exclude and hide any system-generated notification messages (e.g. isSystem, status changes, profile updates, logs)
  const filteredChatMessages = dmMessages.filter(
    m => ((m.senderId === currentUser.id && m.recipientId === activeContactId) || 
          (m.senderId === activeContactId && m.recipientId === currentUser.id)) && 
         m.isSystem !== true &&
         !m.text.toLowerCase().includes('[system]') &&
         !m.text.toLowerCase().includes('status change') &&
         !m.text.toLowerCase().includes('profile update') &&
         !m.text.toLowerCase().includes('system log') &&
         !m.text.toLowerCase().includes('automated')
  );

  // Filter messages by sender name or content keywords if query exists
  const searchedChatMessages = chatSearchQuery.trim() === ''
    ? filteredChatMessages
    : filteredChatMessages.filter(m => {
        const query = chatSearchQuery.toLowerCase();
        const senderName = m.senderId === currentUser.id 
          ? currentUser.name.toLowerCase() 
          : (contacts.find(c => c.id === m.senderId)?.name || '').toLowerCase();
        const textMatch = m.text.toLowerCase().includes(query);
        const nameMatch = senderName.includes(query);
        return textMatch || nameMatch;
      });

  // Apply sorting toggle (newest vs oldest messages)
  const currentChatMessages = msgSortOrder === 'newest' 
    ? [...searchedChatMessages].reverse() 
    : [...searchedChatMessages];

  const unreadDMsCount = dmMessages.filter(
    m => m.recipientId === currentUser.id && m.read !== true
  ).length;

  // Mark messages from active contact as read when chat is open and active
  useEffect(() => {
    if (currentTab === 'chat' && activeContactId) {
      const hasUnread = dmMessages.some(
        m => m.senderId === activeContactId && m.recipientId === currentUser.id && m.read !== true
      );
      if (hasUnread) {
        setDmMessages(prev =>
          prev.map(m =>
            m.senderId === activeContactId && m.recipientId === currentUser.id && m.read !== true
              ? { ...m, read: true }
              : m
          )
        );
      }
    }
  }, [currentTab, activeContactId, dmMessages, currentUser.id, setDmMessages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* 1. Left side navigation hub - Act as gateway to sub-systems */}
      <div className="lg:col-span-3 bg-[#111226]/80 border border-white/5 p-4 rounded-3xl space-y-2.5 backdrop-blur-xl shadow-xl">
        <div className="p-3 border-b border-white/5 text-center space-y-2">
          <div className="inline-block relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl border-2 bg-slate-900 ${currentUser.frame || 'border-white/10'}`}>
              <span>{currentUser.avatar}</span>
            </div>
            {currentUser.vipBadge && currentUser.vipBadge !== 'None' && (
              <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded uppercase border border-slate-950">
                {currentUser.vipBadge}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white leading-tight">{currentUser.name}</h3>
            <p className="text-[10px] text-purple-400 font-mono mt-0.5">Premium ID: #{currentUser.id}</p>
          </div>

          {/* Compact live status labels mimicking real apps */}
          <div className="pt-2 border-t border-white/5 space-y-1.5 text-left font-sans text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Streamer App:</span>
              {myProposal ? (
                myProposal.status === 'Approved' ? (
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[8px] border border-emerald-500/20 uppercase tracking-wider">Approved ✅</span>
                ) : myProposal.status === 'Rejected' ? (
                  <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded text-[8px] border border-rose-500/20 uppercase tracking-wider">Rejected ❌</span>
                ) : (
                  <span className="text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded text-[8px] border border-yellow-500/20 uppercase tracking-wider animate-pulse">Pending ⏳</span>
                )
              ) : (
                <span className="text-slate-500 bg-white/5 px-1.5 py-0.5 rounded text-[8px]">Not Applied</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">Active Agency:</span>
              <span className="text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded text-[8px] border border-indigo-500/20 uppercase tracking-wider">Master #99331</span>
            </div>

            <div className="flex items-center justify-between bg-white/5 p-1 rounded-lg border border-white/5 mt-1 font-mono text-[9px]">
              <div className="flex items-center gap-0.5 text-amber-400 font-bold">
                <span>🪙</span> {currentUser.coins.toLocaleString()}
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="flex items-center gap-0.5 text-purple-400 font-bold">
                <span>💎</span> {currentUser.diamonds.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Nav Tabs */}
        <div className="space-y-2 max-h-[58vh] overflow-y-auto pr-1 scrollbar-thin">
          {[
            { id: 'profile', label: '👤 Edit Profile', desc: 'Identity, DP, Bio, details' },
            { id: 'business_hub', label: '💼 Business Dashboard', desc: 'Host, Agency & BD tools' },
            { id: 'promote_system', label: '🚀 Promote Center', desc: 'Role promotions & room boosts' },
            { id: 'agency_portal', label: '🏢 Agency Portal', desc: 'Talent roster & payroll' },
            { id: 'reseller_portal', label: '🪙 Reseller System', desc: 'Verified Coins Dispatch' },
            { id: 'admin_portal', label: '🛡️ Admin Portal', desc: 'Auditing & hardware bans' },
            { id: 'wallet', label: '🪙 Wallet & Coins', desc: 'Recharge & convert diamonds' },
            { id: 'agency', label: '🏢 Agency Manager', desc: 'Roster targets & invites' },
            { id: 'security', label: '🛡️ Logs & Security', desc: 'Device audits & transactions' },
            { id: 'chat', label: '💬 Message Hub', desc: '1-on-1 DM & Alerts', badge: (unreadDMsCount + systemNotifications.filter(n => !n.read).length) || undefined }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id as any);
                if (tab.id === 'chat') {
                  // mark all notifications as read
                  setSystemNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }
              }}
              className={`w-full p-2.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-300 group ${
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border-purple-500 text-white shadow-lg'
                  : 'bg-black/20 border-white/5 text-slate-400 hover:text-slate-100 hover:bg-white/5'
              }`}
            >
              <div>
                <p className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  {tab.label}
                </p>
                <p className="text-[9px] text-slate-500 font-mono mt-0.5 group-hover:text-slate-400 transition">{tab.desc}</p>
              </div>
              {tab.badge ? (
                <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-full animate-bounce">
                  {tab.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 opacity-40 group-hover:opacity-80 transition transform group-hover:translate-x-0.5`} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Tab View Area */}
      <div className="lg:col-span-9 bg-[#111226]/60 border border-white/5 p-6 rounded-3xl min-h-[550px] relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between">
        <div className="absolute top-0 right-0 w-[30%] h-[30%] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="space-y-6 flex-1">
          
          {/* TAB 1: EDIT PROFILE & IDENTITY */}
          {currentTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">

              {/* 🎁 Daily Check-In Reward System */}
              <div className="bg-gradient-to-br from-[#161a38] to-[#12142b] border border-purple-500/20 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden text-left">
                {/* Corner decorative light */}
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-500/10 blur-2xl pointer-events-none rounded-full" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl animate-bounce">🎁</span>
                    <div>
                      <h4 className="text-xs font-mono font-black text-purple-400 tracking-wider uppercase">Loyalty Reward Center</h4>
                      <h3 className="text-sm font-black text-white uppercase mt-0.5">📅 Daily Check-in Rewards</h3>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Current Streak</span>
                    <span className="text-xs font-black text-emerald-400">{checkInStreak} Days Consecutive</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {[50, 75, 100, 125, 150, 175, 300].map((reward, idx) => {
                    const dayNum = idx + 1;
                    const isClaimed = checkInStreak >= dayNum && !timeRemaining;
                    const isToday = checkInStreak === dayNum - 1 && timeRemaining === '';
                    
                    return (
                      <div
                        key={dayNum}
                        className={`relative rounded-xl p-2.5 border flex flex-col items-center justify-between text-center transition duration-200 min-h-[85px] ${
                          isClaimed
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : isToday
                            ? 'bg-purple-500/20 border-purple-500/50 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.15)]'
                            : 'bg-black/30 border-white/5'
                        }`}
                      >
                        <span className="text-[9px] font-mono text-slate-400 font-bold">Day {dayNum}</span>
                        <span className="text-lg my-1">{dayNum === 7 ? '💎🔥' : '💎'}</span>
                        <span className={`text-[10px] font-mono font-black ${isClaimed ? 'text-emerald-400' : 'text-slate-200'}`}>+{reward}</span>
                        {isClaimed && (
                          <span className="absolute -bottom-1 -right-1 text-[9px] bg-emerald-500 text-slate-950 rounded-full w-4.5 h-4.5 flex items-center justify-center font-black">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-300">
                      Earn free Streamer Diamonds! Complete your consecutive streak every 24 hours to unlock larger rewards.
                    </p>
                    {timeRemaining && (
                      <p className="text-[11px] text-indigo-400 font-mono mt-1 flex items-center gap-1">
                        <span>🕒 Next check-in in:</span>
                        <span className="font-bold bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.2 rounded font-mono">{timeRemaining}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full lg:w-auto shrink-0 flex-wrap sm:flex-nowrap">
                    {timeRemaining ? (
                      <button
                        type="button"
                        disabled
                        className="w-full sm:w-auto px-5 py-2.5 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center justify-center gap-1.5"
                      >
                        <span>✓</span> Checked In Today
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDailyCheckIn(false)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 font-sans"
                      >
                        🎁 Claim Day {((checkInStreak) % 7) + 1} Reward
                      </button>
                    )}

                    {/* Developer Test Helper */}
                    <button
                      type="button"
                      onClick={handleResetCheckInTimer}
                      className="px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 text-[9px] font-mono font-bold uppercase tracking-wider rounded-lg border border-red-500/10 transition active:scale-95 cursor-pointer whitespace-nowrap"
                      title="Testing shortcut: Click to reset 24h cooldown timer"
                    >
                      Reset Timer (Test)
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Premium Action Header - Triggers navigation to completely new page (Opens in separate tab) */}
              <div className="bg-[#151630] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-xl rounded-full pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-xs font-mono font-black text-indigo-400 tracking-wider uppercase">VocoLive Premium Actions</h4>
                    <h3 className="text-sm font-black text-white uppercase mt-0.5">Profile Header Operations Panel</h3>
                  </div>
                  <span className="text-[9px] bg-indigo-500/15 text-indigo-400 px-2 py-0.5 rounded font-mono font-black border border-indigo-500/20">TARGET: _BLANK</span>
                </div>

                {/* Four actions at the top of the profile */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <a 
                    href="/profile-actions.html?action=recharge" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center text-center p-3.5 bg-black/40 hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 rounded-xl transition transform active:scale-95 group duration-200"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-200">🪙</span>
                    <span className="text-[10px] font-black text-white tracking-wide uppercase mt-1.5">Recharge Wallet</span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">Buy Coins & Gems</span>
                  </a>

                  <a 
                    href="/profile-actions.html?action=talent" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center text-center p-3.5 bg-black/40 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition transform active:scale-95 group duration-200"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-200">🎙️</span>
                    <span className="text-[10px] font-black text-white tracking-wide uppercase mt-1.5">Apply for Host</span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">Streamer Salary</span>
                  </a>

                  <a 
                    href="/profile-actions.html?action=agency" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center text-center p-3.5 bg-black/40 hover:bg-indigo-500/15 border border-white/5 hover:border-indigo-500/30 rounded-xl transition transform active:scale-95 group duration-200"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-200">🏢</span>
                    <span className="text-[10px] font-black text-white tracking-wide uppercase mt-1.5">Register Agency</span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">Roster overrides</span>
                  </a>

                  <a 
                    href="/profile-actions.html?action=vip" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center text-center p-3.5 bg-black/40 hover:bg-purple-500/15 border border-white/5 hover:border-purple-500/30 rounded-xl transition transform active:scale-95 group duration-200"
                  >
                    <span className="text-2xl group-hover:scale-110 transition duration-200">👑</span>
                    <span className="text-[10px] font-black text-white tracking-wide uppercase mt-1.5">VIP Honor Club</span>
                    <span className="text-[8px] text-slate-500 font-mono mt-0.5">Get Royal Frames</span>
                  </a>
                </div>

                {/* User Story & Technical Requirement Card */}
                <div className="bg-black/35 border border-white/5 rounded-xl p-4 space-y-3 text-xs leading-relaxed font-sans">
                  <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                    <span>📋</span>
                    <span>Implementation Specification & User Story</span>
                  </div>
                  
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <p>
                      <strong className="text-white uppercase font-mono text-[9px] bg-purple-500/20 px-1 py-0.5 rounded mr-1">User Story:</strong> 
                      As a premium VocoLive member, I want clicking on any profile action at the top of my page to immediately trigger a secure navigation to a completely new page in a separate tab, so that my active live voice room audio connection and ongoing community discussion are never interrupted by full-screen modal overlays or loss of applet session state.
                    </p>
                    <p>
                      <strong className="text-white uppercase font-mono text-[9px] bg-indigo-500/20 px-1 py-0.5 rounded mr-1">Technical Requirement:</strong>
                      Action click triggers must execute isolated client-side routing with <code className="text-amber-400 font-mono">target="_blank"</code> properties pointing to decoupled premium action templates (<code className="text-indigo-300 font-mono">/profile-actions.html</code>). No inline modals or current-tab redirect states should be initialized.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <UserIcon className="w-5 h-5 text-purple-400" /> Identity Profile Management
                </h3>
                <p className="text-xs text-slate-400">Configure your official platform presence. High fidelity profiles attract more streamer support.</p>
              </div>

              {/* Edit Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Display Username</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Status Quote (Bio)</label>
                  <input
                    type="text"
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    placeholder="Short professional intro bio"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Gender Identity</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  >
                    <option value="Male">🤵 Male</option>
                    <option value="Female">👩 Female</option>
                    <option value="Secret">🔒 Secret</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Age (Years)</label>
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                      min="18"
                      max="100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Country & Region</label>
                    <input
                      type="text"
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 text-white rounded-xl px-3.5 py-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      placeholder="e.g. Pakistan 🇵🇰"
                    />
                  </div>
                </div>
              </div>

              {/* DP Emojis Selection */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Select Profile Display Emoji (DP)</span>
                <div className="flex flex-wrap gap-2.5">
                  {['🤵', '👑', '🦁', '🥷', '🦄', '👸', '⚡', '🦖', '🦊', '💎', '🍿', '🔥', '🎤', '🪐', '🦅', '🍀'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setCurrentUser({ ...currentUser, avatar: emoji });
                        addAdminLog(`Changed profile picture emoji to ${emoji}`);
                      }}
                      className={`w-11 h-11 rounded-xl bg-black/40 border text-xl flex items-center justify-center transition transform active:scale-95 hover:scale-105 ${
                        currentUser.avatar === emoji ? 'border-purple-500 bg-purple-500/20 shadow-lg' : 'border-white/5'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gorgeous Digital Member Card ID */}
              <div className="bg-gradient-to-r from-purple-950/40 via-[#101124] to-indigo-950/40 border border-purple-500/20 rounded-2xl p-5 relative overflow-hidden flex items-center gap-4">
                <div className="absolute right-[-10px] bottom-[-20px] text-[120px] opacity-5 pointer-events-none select-none">👑</div>
                
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl bg-[#14152a] border-4 relative ${currentUser.frame || 'border-white/10'}`}>
                  <span>{currentUser.avatar}</span>
                </div>

                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white uppercase tracking-wider">{currentUser.name}</span>
                    <span className="text-[8px] font-extrabold uppercase bg-purple-500 text-slate-950 px-1.5 py-0.5 rounded tracking-widest font-mono">LEVEL {currentUser.level}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Location: <strong className="text-white">{editCountry}</strong> • Gender: <strong className="text-white">{editGender}</strong> • Age: <strong className="text-white">{editAge}</strong></p>
                  <p className="text-xs text-slate-300 italic">"{currentUser.bio || 'No bio written yet. Fill it to attract followers!'}"</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider hover:shadow-lg hover:shadow-purple-500/20 transition active:scale-95"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {/* TAB: BUSINESS HUB (DURABLE & POLISHED CLOUD INSPIRED VISUALS) */}
          {currentTab === 'business_hub' && (
            <div className="space-y-6 animate-fade-in text-slate-200">
              <div className="border-b border-white/5 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                    💼 VocoLive Business Operations Hub
                  </h3>
                  <p className="text-xs text-slate-400">Manage hosting targets, agency rosters, dollar payout settings, and BD hierarchies in real-time.</p>
                </div>
                
                {/* Simulated Persona Switcher for Live Demo and Testing Convenience */}
                <div className="bg-black/60 border border-white/5 p-1 rounded-xl flex gap-1 self-start md:self-auto">
                  {(['Independent Host', 'Agency Owner', 'BD Owner'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        addAdminLog(`Switched persona to ${role} in Profile Business Dashboard`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 ${
                        selectedRole === role
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow shadow-purple-500/10'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                      }`}
                    >
                      {role === 'Independent Host' && '🎙️ Host'}
                      {role === 'Agency Owner' && '🏢 Agency'}
                      {role === 'BD Owner' && '👑 BD Owner'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ROLE A: INDEPENDENT HOST PANEL */}
              {selectedRole === 'Independent Host' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Progress Card */}
                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl md:col-span-2 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-purple-400 uppercase font-mono tracking-wider">Target Points Progress</span>
                          <h4 className="text-lg font-black text-white mt-1">🎙️ Host Center ({currentUser.name})</h4>
                        </div>
                        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider">
                          Active Host
                        </span>
                      </div>

                      {/* Cumulative stats */}
                      {(() => {
                        const myHost = businessHosts.find(h => h.id === '1001') || { targetPoints: 100000, achievedPoints: 85000 };
                        const percent = Math.min(100, Math.round((myHost.achievedPoints / myHost.targetPoints) * 100)) || 0;
                        const dollars = (myHost.achievedPoints / 1000);

                        return (
                          <div className="space-y-3.5">
                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-slate-400">Goal: <strong className="text-white">{myHost.targetPoints.toLocaleString()} pts</strong></span>
                              <span className="text-slate-400">Achieved: <strong className="text-white">{myHost.achievedPoints.toLocaleString()} pts</strong></span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-900/60 h-3.5 rounded-full overflow-hidden border border-white/5 p-0.5">
                              <div
                                style={{ width: `${percent}%` }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                              />
                            </div>

                            <div className="flex justify-between items-center bg-slate-950/40 border border-white/5 p-3 rounded-xl">
                              <div className="space-y-0.5">
                                <span className="text-[9px] text-slate-500 font-mono block uppercase">Progress</span>
                                <span className="text-sm font-black text-emerald-400 font-mono">{percent}% Completed</span>
                              </div>
                              <div className="text-right space-y-0.5">
                                <span className="text-[9px] text-slate-500 font-mono block uppercase">Dollars Earned</span>
                                <span className="text-sm font-black text-amber-400 font-mono">${dollars.toFixed(2)} USD</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Quick Rules Card */}
                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider font-mono">Platform Guidelines</span>
                        <h4 className="text-xs font-bold text-white uppercase">Payout Calibration Rules</h4>
                        <ul className="text-[10px] text-slate-400 space-y-1.5 list-disc list-inside">
                          <li>1,000 pts = $1.00 USD cash-out value.</li>
                          <li>Payouts are disbursed via JazzCash or EasyPaisa instantly on threshold.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Independent Host Simulator tools */}
                  <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-purple-400 font-mono">🧪 Host Simulator Panel (Gift sandbox)</h4>
                    <p className="text-[11px] text-slate-400">Select your host ID to simulate receiving direct audience gifts in real-time, instantly incrementing points and dollar conversion metrics.</p>
                    
                    <form onSubmit={handleSimulateGiftPoints} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Target Streamer</label>
                        <select
                          value={simHostId}
                          onChange={(e) => setSimHostId(e.target.value)}
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        >
                          {businessHosts.map(h => (
                            <option key={h.id} value={h.id}>🎙️ {h.name} (ID: {h.id})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Simulated Gift Points</label>
                        <input
                          type="number"
                          value={simPointsInput}
                          onChange={(e) => setSimPointsInput(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
                      >
                        Simulate Gift! 🎁
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ROLE B: AGENCY OWNER PANEL */}
              {selectedRole === 'Agency Owner' && (
                <div className="space-y-6 animate-fade-in">
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Target and Dollar Mapping Form */}
                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4 lg:col-span-1">
                      <div className="border-b border-white/5 pb-2">
                        <h4 className="text-xs font-black uppercase text-purple-400 font-mono">Assign Host Targets</h4>
                        <p className="text-[10px] text-slate-400">Map target points for registered hosts. Equivalent USD values update instantly.</p>
                      </div>

                      <form onSubmit={handleSetHostTarget} className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Streamer Host</label>
                          <select
                            value={targetHostId}
                            onChange={(e) => setTargetHostId(e.target.value)}
                            className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                          >
                            {businessHosts.map(h => (
                              <option key={h.id} value={h.id}>🎙️ {h.name} (ID: {h.id})</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Target Points Goal</label>
                          <input
                            type="number"
                            value={targetPointsInput}
                            onChange={(e) => setTargetPointsInput(e.target.value)}
                            placeholder="e.g. 50000"
                            className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                          />
                          {targetPointsInput && !isNaN(Number(targetPointsInput)) && (
                            <span className="text-[9px] text-emerald-400 font-bold font-mono mt-1 block">
                              Instant Value: ${(Number(targetPointsInput) / 1000).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                            </span>
                          )}
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
                        >
                          Set Target Goal 🚀
                        </button>
                      </form>
                    </div>

                    {/* Live Performance Roster Tracker & Totals */}
                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4 lg:col-span-2">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <div>
                          <h4 className="text-xs font-black uppercase text-purple-400 font-mono">Live Host Performance Tracker</h4>
                          <p className="text-[10px] text-slate-400">Real-time point progress and equivalent USD earnings per host.</p>
                        </div>
                        
                        {/* Cumulative Sum Box */}
                        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-white/5 text-right font-mono">
                          <span className="text-[8px] text-slate-500 uppercase block">Cumulative Total</span>
                          <span className="text-xs font-black text-amber-400">
                            {businessHosts.reduce((acc, curr) => acc + curr.achievedPoints, 0).toLocaleString()} pts
                          </span>
                          <span className="text-[9px] text-emerald-400 font-bold block">
                            (${ (businessHosts.reduce((acc, curr) => acc + curr.achievedPoints, 0) / 1000).toFixed(2) } USD)
                          </span>
                        </div>
                      </div>

                      {/* Performance Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-300 font-sans">
                          <thead>
                            <tr className="border-b border-white/5 text-slate-500 text-[9px] uppercase tracking-wider font-mono">
                              <th className="py-2.5">Host</th>
                              <th className="py-2.5">Target Points Progress</th>
                              <th className="py-2.5 text-right">Dollars Earned</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {businessHosts.map((host) => {
                              const percent = Math.min(100, Math.round((host.achievedPoints / host.targetPoints) * 100)) || 0;
                              return (
                                <tr key={host.id} className="hover:bg-white/5 transition duration-155">
                                  <td className="py-3 font-medium flex items-center gap-2">
                                    <span className="text-base">{host.avatar}</span>
                                    <div>
                                      <p className="text-white font-black">{host.name}</p>
                                      <p className="text-[8px] text-slate-500 font-mono">ID: {host.id}</p>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <div className="space-y-1 w-full max-w-[180px]">
                                      <div className="flex justify-between text-[10px] font-mono">
                                        <span>{host.achievedPoints.toLocaleString()} / {host.targetPoints.toLocaleString()} pts</span>
                                        <span className="text-purple-400 font-bold">{percent}%</span>
                                      </div>
                                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                                        <div
                                          style={{ width: `${percent}%` }}
                                          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full"
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 text-right font-mono text-amber-400 font-bold">
                                    ${(host.achievedPoints / 1000).toFixed(2)} USD
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Sandbox Gift simulation inside Agency owner too */}
                  <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-purple-400 font-mono">🧪 Host Performance Sandbox Simulator</h4>
                    <p className="text-[11px] text-slate-400">Simulate hosts getting support in real-time, helping you test progress bars, target thresholds, and agency cumulative point calculations.</p>
                    
                    <form onSubmit={handleSimulateGiftPoints} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-black/30 p-4 rounded-xl border border-white/5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Agency Host</label>
                        <select
                          value={simHostId}
                          onChange={(e) => setSimHostId(e.target.value)}
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        >
                          {businessHosts.map(h => (
                            <option key={h.id} value={h.id}>🎙️ {h.name} (ID: {h.id})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Simulate Point Addition</label>
                        <input
                          type="number"
                          value={simPointsInput}
                          onChange={(e) => setSimPointsInput(e.target.value)}
                          placeholder="e.g. 10000"
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
                      >
                        Simulate Agency Pts! 💎
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ROLE C: BD OWNER PANEL */}
              {selectedRole === 'BD Owner' && (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Aggregated Tree Tracker Summary (Bento Box cards) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-purple-950/40 via-[#101124] to-indigo-950/40 border border-purple-500/20 p-5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider font-mono">Active BD Representative</span>
                      <div className="space-y-1.5 mt-2">
                        <p className="text-base font-black text-white uppercase">{currentUser.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">ID Appointed: <strong className="text-emerald-400">ID {bdOwnerId}</strong></p>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono mt-4">Authorized BD Tree Master Nodes</span>
                    </div>

                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider font-mono">Total Bound Agencies Points</span>
                      <div className="space-y-1 mt-2">
                        <p className="text-2xl font-black text-amber-300 font-mono">
                          { (bdAgencies.reduce((acc, curr) => acc + curr.totalPoints, 0)).toLocaleString() } pts
                        </p>
                        <p className="text-[9px] text-slate-400">Summed total over all approved/bound agency rosters.</p>
                      </div>
                      <span className="text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded self-start mt-2">
                        Hierarchical Value: ${((bdAgencies.reduce((acc, curr) => acc + curr.totalPoints, 0)) / 1000).toFixed(2)} USD
                      </span>
                    </div>

                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider font-mono">Aggregated Tree Goal</span>
                      <div className="space-y-1 mt-2">
                        <p className="text-2xl font-black text-white font-mono">
                          { (bdAgencies.reduce((acc, curr) => acc + curr.goalPoints, 0)).toLocaleString() } pts
                        </p>
                        <p className="text-[9px] text-slate-400">Total assigned point target across all bound agencies.</p>
                      </div>
                      {(() => {
                        const totalPts = bdAgencies.reduce((acc, curr) => acc + curr.totalPoints, 0);
                        const totalGoal = bdAgencies.reduce((acc, curr) => acc + curr.goalPoints, 0);
                        const ratio = totalGoal > 0 ? Math.min(100, Math.round((totalPts / totalGoal) * 100)) : 0;
                        return (
                          <div className="mt-2 space-y-1">
                            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/5">
                              <div style={{ width: `${ratio}%` }} className="bg-indigo-500 h-full rounded-full" />
                            </div>
                            <span className="text-[9px] text-indigo-400 font-mono font-bold block">{ratio}% Ecosystem Target Complete</span>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Admin appointment & Bind Agency Form */}
                    <div className="space-y-6">
                      
                      {/* Appoint BD Form */}
                      <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                        <div className="border-b border-white/5 pb-2">
                          <h4 className="text-xs font-black uppercase text-purple-400 font-mono">Appoint BD Representative</h4>
                          <p className="text-[10px] text-slate-400">Assign/Appoint the Business Development Representative for the system by User ID.</p>
                        </div>

                        <form onSubmit={handleAppointBdOwner} className="flex gap-2">
                          <input
                            type="text"
                            value={newBdOwnerInput}
                            onChange={(e) => setNewBdOwnerInput(e.target.value)}
                            placeholder="Enter New BD User ID (e.g. 8888)"
                            className="flex-1 bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shrink-0"
                          >
                            Appoint
                          </button>
                        </form>
                      </div>

                      {/* Onboard Invite Agency Form (BD Chokawa) */}
                      <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                        <div className="border-b border-white/5 pb-2">
                          <h4 className="text-xs font-black uppercase text-purple-400 font-mono">Interactive Invite System</h4>
                          <p className="text-[10px] text-slate-400">Invite new agencies by registering their custom Agency ID to trigger onboard options.</p>
                        </div>

                        <form onSubmit={handleInviteAgency} className="space-y-3">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={inviteAgencyId}
                              onChange={(e) => setInviteAgencyId(e.target.value)}
                              placeholder="Enter Agency ID (e.g. AGENCY_DELTA)"
                              className="flex-1 bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shrink-0"
                            >
                              Send Onboard Invite
                            </button>
                          </div>
                          <span className="text-[9px] text-slate-500 italic font-mono block">Tip: Type any unique ID (like AGENCY_DELTA) to simulate an interactive agency request!</span>
                        </form>
                      </div>
                    </div>

                    {/* Vetting Pending Invites Table (BD Chokawa Approval List) */}
                    <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                      <div>
                        <h4 className="text-xs font-black uppercase text-purple-400 font-mono">BD Chokawa Vetting & Onboarding</h4>
                        <p className="text-[10px] text-slate-400">Approve pending agency applications to formally bind them to your BD Tree.</p>
                      </div>

                      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                        {pendingInvites.length === 0 ? (
                          <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-dashed border-white/5 text-slate-500 text-xs font-mono">
                            No pending onboarding applications
                          </div>
                        ) : (
                          pendingInvites.map(invite => (
                            <div key={invite.id} className="bg-slate-950 p-3 rounded-xl border border-white/5 flex items-center justify-between gap-4 hover:border-white/10 transition">
                              <div>
                                <h5 className="text-xs font-bold text-white uppercase">{invite.agencyName}</h5>
                                <p className="text-[9px] text-purple-400 font-mono mt-0.5">ID: {invite.id} • Owner: {invite.ownerName}</p>
                                <p className="text-[10px] text-slate-400 mt-1">Ecosystem Points: <strong className="text-slate-200">{invite.totalPoints.toLocaleString()}</strong></p>
                              </div>

                              <button
                                onClick={() => handleChokawaOnboard(invite.id)}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition active:scale-95"
                              >
                                Bind Agency (Chokawa) ✅
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BD Aggregated Tree Tracker Hierarchical View */}
                  <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                    <div>
                      <h4 className="text-xs font-black uppercase text-purple-400 font-mono">BD Tree Hierarchy & Dismissal (Chakwana)</h4>
                      <p className="text-[10px] text-slate-400">Currently bound agency nodes. Dismissing them removes them from the aggregated point totals.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bdAgencies.map((agency) => {
                        const ratio = Math.min(100, Math.round((agency.totalPoints / agency.goalPoints) * 100)) || 0;
                        return (
                          <div key={agency.id} className="bg-slate-950/60 p-4 rounded-xl border border-white/5 hover:border-purple-500/20 transition space-y-3 flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-xs font-black text-white uppercase tracking-wide">🏢 {agency.name}</h5>
                                <p className="text-[9px] text-slate-500 font-mono">Node ID: {agency.id} • Owner: {agency.ownerName}</p>
                              </div>
                              <button
                                onClick={() => handleChakwanaRemove(agency.id)}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded text-[9px] font-bold uppercase transition"
                                title="Dismiss Agency Node"
                              >
                                Dismiss Node (Chakwana)
                              </button>
                            </div>

                            <div className="space-y-1.5">
                              <div className="flex justify-between text-[10px] font-mono">
                                <span className="text-slate-400">Achieved: <strong className="text-white">{agency.totalPoints.toLocaleString()} pts</strong></span>
                                <span className="text-slate-400">Target: <strong className="text-white">{agency.goalPoints.toLocaleString()} pts</strong></span>
                              </div>
                              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
                                <div style={{ width: `${ratio}%` }} className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* --- MODULE 1: THE CORE PROFILE BUSINESS SUITE (NEW) --- */}
              <div className="border-t border-white/10 pt-6 space-y-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-white/5 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span className="text-purple-400">💼</span> VocoLive Core Profile Business Suite
                    </h4>
                    <p className="text-[10px] text-slate-400">App-wide accounting, target payouts calibration, and verified reseller dispatch desk.</p>
                  </div>
                  <span className="text-[9px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded uppercase font-black tracking-wider font-mono">
                    Administrative Terminal
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Panel 1: Target Plan System */}
                  <div className="bg-[#14152b]/90 border border-white/5 p-4 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <span className="text-lg">📈</span>
                        <h5 className="text-xs font-black uppercase text-white font-mono">Target Plan Calibration Chart</h5>
                      </div>
                      
                      <div className="space-y-2 text-[10px]">
                        <div className="grid grid-cols-2 bg-slate-950/40 p-2 rounded-lg border border-white/5 font-mono text-slate-300">
                          <span className="font-bold">Tier / Points Goal</span>
                          <span className="text-right font-bold text-amber-400">USD Payout ($)</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between p-1.5 border-b border-white/5 hover:bg-white/2 transition">
                            <span className="text-slate-400 font-bold">🥈 Silver: 50,000 pts</span>
                            <span className="font-mono text-emerald-400 font-bold">$50 USD</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-white/5 hover:bg-white/2 transition">
                            <span className="text-amber-400 font-bold">🥇 Gold: 100,000 pts</span>
                            <span className="font-mono text-emerald-400 font-bold">$100 USD</span>
                          </div>
                          <div className="flex justify-between p-1.5 border-b border-white/5 hover:bg-white/2 transition">
                            <span className="text-purple-400 font-bold">💎 Diamond: 250,000 pts</span>
                            <span className="font-mono text-emerald-400 font-bold">$250 USD</span>
                          </div>
                          <div className="flex justify-between p-1.5 hover:bg-white/2 transition">
                            <span className="text-rose-400 font-black">👑 Crown: 500,000 pts</span>
                            <span className="font-mono text-emerald-400 font-bold">$500 USD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Points Calculator */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2">
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Dynamic Target Calculator</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={pointsCalcInput}
                          onChange={(e) => setPointsCalcInput(e.target.value)}
                          placeholder="Type points (e.g. 75000)"
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                        />
                      </div>
                      {pointsCalcInput && !isNaN(Number(pointsCalcInput)) && Number(pointsCalcInput) > 0 && (
                        <div className="flex justify-between items-center bg-purple-500/5 p-1.5 rounded border border-purple-500/10 text-[10px] font-mono">
                          <span className="text-slate-400">Payout Value:</span>
                          <span className="text-amber-400 font-bold">${(Number(pointsCalcInput) / 1000).toLocaleString()} USD</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Panel 2: Reseller System */}
                  <div className="bg-[#14152b]/90 border border-white/5 p-4 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">🪙</span>
                          <h5 className="text-xs font-black uppercase text-white font-mono">Reseller Coins Allocation</h5>
                        </div>
                        <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded uppercase font-extrabold tracking-wider animate-pulse font-mono">
                          Verified Reseller
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Dispense virtual credit allocations directly to active user IDs. Balance decreases instantly upon transfer.
                      </p>

                      <form onSubmit={handleResellerTransfer} className="space-y-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase font-mono block">Target User ID</label>
                          <input
                            type="text"
                            value={resellerTargetId}
                            onChange={(e) => setResellerTargetId(e.target.value)}
                            placeholder="e.g. 1002"
                            className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase font-mono block">Amount of Coins</label>
                          <input
                            type="number"
                            value={resellerCoinsAmount}
                            onChange={(e) => setResellerCoinsAmount(e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition active:scale-95 shadow"
                        >
                          Transfer Coins ⚡
                        </button>
                      </form>
                    </div>

                    <div className="bg-slate-950/40 p-2.5 rounded-xl border border-white/5 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-400">My Reseller Balance:</span>
                      <span className="text-emerald-400 font-bold">{currentUser.coins.toLocaleString()} Coins</span>
                    </div>
                  </div>

                  {/* Panel 3: Admin Logs System */}
                  <div className="bg-[#14152b]/90 border border-white/5 p-4 rounded-2xl space-y-4 flex flex-col justify-between">
                    <div className="space-y-3 w-full">
                      <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                        <span className="text-lg">🛡️</span>
                        <h5 className="text-xs font-black uppercase text-white font-mono">Admin Logs System</h5>
                      </div>

                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={adminLogsSearch}
                            onChange={(e) => setAdminLogsSearch(e.target.value)}
                            placeholder="Filter by Admin ID..."
                            className="w-full bg-[#111221] border border-white/10 text-white rounded-lg pl-2.5 pr-8 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-mono"
                          />
                          <span className="absolute right-2.5 top-2 text-[10px] text-slate-500 select-none">🔍</span>
                        </div>

                        {/* Scrollable, timestamped panel */}
                        <div className="max-h-[160px] overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-white/10">
                          {(() => {
                            const filteredLogs = profileAdminLogs.filter(l => 
                              !adminLogsSearch.trim() || l.adminId.toLowerCase().includes(adminLogsSearch.toLowerCase().trim())
                            );

                            if (filteredLogs.length === 0) {
                              return (
                                <p className="text-[10px] text-slate-500 italic text-center py-4">No admin logs matched search.</p>
                              );
                            }

                            return filteredLogs.map((log) => (
                              <div key={log.id} className="bg-black/30 border border-white/5 p-2 rounded-lg text-[9px] font-mono leading-normal text-slate-300">
                                <div className="flex justify-between text-[8px] text-slate-500 border-b border-white/5 pb-1 mb-1">
                                  <span className="text-purple-400 font-bold">ADMIN ID: {log.adminId}</span>
                                  <span>{log.timestamp}</span>
                                </div>
                                <p className="text-slate-200">{log.log}</p>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/40 p-2 rounded-xl border border-white/5 text-[8.5px] text-slate-500 font-mono text-center">
                      Click dashboard actions to feed live audit streams.
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}



          {/* TAB 3: COIN & WALLET SYSTEM */}
          {currentTab === 'wallet' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-5 h-5 text-amber-400" /> Coin & Financial Wallet Suite
                </h3>
                <p className="text-xs text-slate-400">Recharge Gold Coins for premium gifting or cash out your earned streamer Diamonds/Beans directly into local currency.</p>
              </div>

              {/* Wallet Balances Panel */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-4 rounded-2xl flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-yellow-500 uppercase font-mono tracking-wider block">Gold Coins Balance 🪙</span>
                    <span className="text-3xl font-black text-white font-mono">{currentUser.coins.toLocaleString()}</span>
                    <p className="text-[9px] text-slate-400">Used for gifting live performers & spinning games.</p>
                  </div>
                  <div className="text-4xl">🪙</div>
                </div>

                <div className="bg-gradient-to-r from-purple-500/10 to-indigo-500/5 border border-purple-500/20 p-4 rounded-2xl flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-purple-400 uppercase font-mono tracking-wider block">Streamer Diamonds 💎</span>
                    <span className="text-3xl font-black text-white font-mono">{currentUser.diamonds.toLocaleString()}</span>
                    <p className="text-[9px] text-slate-400">Earned from gifts. Redeemable for real payouts!</p>
                  </div>
                  <div className="text-4xl">💎</div>
                </div>
              </div>

              {/* Recharge, Cashout, & Diamond Exchange split grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
                
                {/* 1. Cashout Portal */}
                <div className="md:col-span-6 bg-black/30 border border-white/5 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase text-white font-mono tracking-wide">Cash-out Converter</h4>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Diamonds Amount</label>
                      <input
                        type="number"
                        value={cashoutAmount}
                        onChange={(e) => setCashoutAmount(Number(e.target.value))}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-2.5 py-2 text-xs focus:outline-none font-mono text-purple-300"
                        min="500"
                        step="500"
                      />
                      <p className="text-[8px] text-slate-500 font-mono flex justify-between">
                        <span>Min: 500 💎</span>
                        <span>Value: ~{(cashoutAmount * 0.8).toLocaleString()} PKR</span>
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Destination</label>
                      <select
                        value={cashoutMethod}
                        onChange={(e) => setCashoutMethod(e.target.value as any)}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-2 py-2 text-xs focus:outline-none"
                      >
                        <option value="JazzCash">🇵🇰 JazzCash Wallet</option>
                        <option value="EasyPaisa">🇵🇰 EasyPaisa Wallet</option>
                        <option value="Bank">🇵🇰 Local Bank Account</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Account Title & Number</label>
                      <textarea
                        rows={2}
                        value={cashoutDetails}
                        onChange={(e) => setCashoutDetails(e.target.value)}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                        placeholder="Full account name, IBAN or mobile wallet register phone no."
                      />
                    </div>

                    <button
                      onClick={handleCashout}
                      className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition"
                    >
                      Process Instant Cash-out
                    </button>
                  </div>
                </div>

                {/* 2. System Diamond Exchange Center */}
                <div className="md:col-span-6 bg-gradient-to-b from-[#161730] to-[#0e0f20] border border-white/10 p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-2xl">
                  {/* Decorative glowing background */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-[40px] rounded-full pointer-events-none" />
                  
                  <div className="flex justify-between items-center pb-2 border-b border-white/5">
                    <div>
                      <h4 className="text-sm font-black uppercase text-white font-mono tracking-wide flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                        System Diamond Exchange
                      </h4>
                      <p className="text-[9.5px] text-slate-400">Official real-time streamer redemption panel</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Live Rates
                    </span>
                  </div>

                  {/* Strictly Fixed Exchange Rate Block */}
                  <div className="bg-white/5 border border-white/5 p-3 rounded-xl space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-medium">Strict Fixed Exchange Rate:</span>
                      <span className="text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 text-[9px] font-mono">
                        10 Diamonds = 1 Coin
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono">
                      Formula: Coins = Diamonds / 10 (e.g., 100 Diamonds = 10 Coins)
                    </p>
                  </div>

                  {/* Swap Input Form */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block">Diamonds to Exchange</label>
                        <span className="text-[9.5px] text-slate-500 font-mono">Wallet Balance: {currentUser.diamonds.toLocaleString()} 💎</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={exchangeAmount || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === '') {
                              setExchangeAmount(0);
                              return;
                            }
                            // Guard against negative values or decimal entries
                            const num = Math.floor(Math.abs(Number(val)));
                            setExchangeAmount(num);
                          }}
                          onKeyDown={(e) => {
                            // Block characters that form negatives, decimals, or exponents
                            if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl pl-3 pr-16 py-2 text-xs focus:outline-none focus:border-indigo-500 font-mono text-indigo-300 font-bold"
                          placeholder="Enter diamonds"
                        />
                        <span className="absolute right-3 top-2 text-[10px] text-purple-400 font-bold font-mono">💎 Beans</span>
                      </div>

                      {/* Live preview text as they type */}
                      {exchangeAmount > 0 && (
                        <p className="text-xs font-bold text-emerald-400 font-mono mt-1">
                          You will receive: {Math.floor(exchangeAmount / 10).toLocaleString()} Coins
                        </p>
                      )}

                      {/* Real-time Validation & Error Messages */}
                      {exchangeAmount > 0 && (
                        (() => {
                          const exceedsBalance = exchangeAmount > currentUser.diamonds;
                          const belowMinimum = exchangeAmount < 100;
                          const notMultipleOfTen = exchangeAmount % 10 !== 0;

                          if (exceedsBalance) {
                            return <p className="text-[10px] font-bold text-rose-500 font-mono mt-1">⚠️ Error: Insufficient Diamonds</p>;
                          }
                          if (belowMinimum) {
                            return <p className="text-[10px] font-bold text-amber-500 font-mono mt-1">⚠️ Error: Minimum exchange limit is 100 Diamonds</p>;
                          }
                          if (notMultipleOfTen) {
                            return <p className="text-[10px] font-bold text-cyan-400 font-mono mt-1">⚠️ Error: Amount must be a multiple of 10 Diamonds</p>;
                          }
                          return null;
                        })()
                      )}
                    </div>

                    {/* Pre-defined preset options */}
                    <div className="grid grid-cols-4 gap-1.5">
                      {[100, 500, 1000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setExchangeAmount(preset)}
                          className={`py-1 text-[9px] font-mono font-bold rounded-lg border transition ${
                            exchangeAmount === preset
                              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                              : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                          }`}
                        >
                          {preset.toLocaleString()} 💎
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          // Round down current user's diamonds to nearest multiple of 10
                          const maxDiv10 = Math.floor(currentUser.diamonds / 10) * 10;
                          setExchangeAmount(maxDiv10);
                        }}
                        className={`py-1 text-[9px] font-mono font-bold rounded-lg border transition ${
                          exchangeAmount === Math.floor(currentUser.diamonds / 10) * 10
                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/5 bg-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        All-In
                      </button>
                    </div>

                    {/* Dynamic Swap calculations Receipt */}
                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-1.5 font-mono text-[10.5px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Base Diamond Value:</span>
                        <span>-{exchangeAmount.toLocaleString()} 💎</span>
                      </div>
                      <div className="flex justify-between text-indigo-400">
                        <span>Conversion Rate:</span>
                        <span>10 Diamonds = 1 Coin</span>
                      </div>
                      <div className="flex justify-between text-white font-bold pt-1.5 text-xs border-t border-white/5 mt-1">
                        <span>Grand Coins Credit:</span>
                        <span className="text-yellow-400 flex items-center gap-0.5">
                          🪙 {Math.floor(exchangeAmount / 10).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleDiamondExchange}
                      disabled={
                        exchangeAmount <= 0 || 
                        exchangeAmount > currentUser.diamonds || 
                        exchangeAmount < 100 || 
                        exchangeAmount % 10 !== 0
                      }
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl text-[10.5px] uppercase tracking-wider transition shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5"
                    >
                      <span>Process Exchange instantly</span>
                      <span>➡️</span>
                    </button>
                  </div>

                  {/* Compact ledger of past exchange transactions */}
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <span className="text-[9.5px] font-black uppercase text-slate-500 font-mono tracking-wider block">Recent Exchanges</span>
                    
                    <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
                      {transactions.filter(tx => tx.type === 'Exchange').length === 0 ? (
                        <p className="text-[9px] text-slate-500 font-mono italic text-center py-2">No diamond exchanges executed in this session.</p>
                      ) : (
                        transactions.filter(tx => tx.type === 'Exchange').slice(0, 3).map((tx) => (
                          <div key={tx.id} className="bg-black/20 border border-white/5 p-2 rounded-lg flex justify-between items-center text-[9.5px] font-mono">
                            <div className="space-y-0.5">
                              <span className="text-slate-300 block leading-none">{tx.item}</span>
                              <span className="text-[8px] text-slate-500">{tx.timestamp}</span>
                            </div>
                            <span className="text-yellow-400 font-bold shrink-0">+{tx.cashAmount?.toLocaleString() || tx.amount.toLocaleString()} 🪙</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: AGENCY MANAGEMENT SYSTEM */}
          {currentTab === 'agency' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-purple-400" /> Agency Management & Performance Portal
                </h3>
                <p className="text-xs text-slate-400">Access metrics of your active live streaming roster, trace monthly goal achievements, and recruit independent talent.</p>
              </div>

              {/* Roster performance metrics grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Streamer Capacity</span>
                  <p className="text-2xl font-black text-white font-mono">{inviteRoster.length} / 50 <span className="text-xs text-purple-400 font-sans">Hosts</span></p>
                  <p className="text-[9px] text-slate-400 leading-normal">Official verified host profiles registered under Voco Master Pak Agency #99331.</p>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Agency Month Revenue</span>
                  <p className="text-2xl font-black text-emerald-400 font-mono">45,000 <span className="text-xs text-white">Diamonds</span></p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full w-[45%]" />
                  </div>
                  <p className="text-[9px] text-slate-400 flex justify-between font-mono">
                    <span>Target: 100K Beans</span>
                    <span>45%</span>
                  </p>
                </div>

                <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">Active Streaming Hours</span>
                  <p className="text-2xl font-black text-white font-mono">41.0 <span className="text-xs text-purple-400 font-sans">Hours</span></p>
                  <p className="text-[9px] text-slate-400 leading-normal">Total live broadcasting duration accumulated by streamers during current weekly cycle.</p>
                </div>
              </div>

              {/* Recruitment & invitation engine */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-3">
                
                {/* Recruiting invite box */}
                <div className="md:col-span-4 bg-black/30 border border-white/5 p-4 rounded-2xl space-y-4">
                  <h4 className="text-xs font-black uppercase text-white font-mono tracking-wide">Recruit Streamers (UID Invite)</h4>
                  
                  <form onSubmit={handleAgencyInvite} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase font-mono">Target Streamer Unique ID</label>
                      <input
                        type="text"
                        value={inviteUserId}
                        onChange={(e) => setInviteUserId(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-2.5 py-2 text-xs focus:outline-none font-mono"
                        placeholder="Enter ID e.g. 1001, 1002"
                      />
                      <p className="text-[8px] text-slate-500 font-mono">Invites send joining packets directly to candidate's DM message hub.</p>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Send Contract Invite</span>
                    </button>
                  </form>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-slate-400 font-mono uppercase block">Live Recruiting Trail</span>
                    <div className="space-y-1 text-[8.5px] font-mono text-slate-500 max-h-[110px] overflow-y-auto bg-black/20 p-2 rounded-lg">
                      {inviteLogs.map((log, idx) => (
                        <p key={idx} className={log.includes('ACCEPTED') ? 'text-emerald-400' : 'text-slate-500'}>{log}</p>
                      ))}
                      {inviteLogs.length === 0 && <p className="italic text-center py-1">No invitations sent yet in this session.</p>}
                    </div>
                  </div>
                </div>

                {/* active stream roster table */}
                <div className="md:col-span-8 bg-black/30 border border-white/5 p-4 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black uppercase text-white font-mono tracking-wide">Agency Registered Streamer Roster</h4>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono leading-normal">
                      <thead>
                        <tr className="border-b border-white/5 text-slate-500 text-[10px] uppercase">
                          <th className="py-2">Name / UID</th>
                          <th className="py-2 text-center">Hours</th>
                          <th className="py-2 text-right">Diamonds</th>
                          <th className="py-2 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inviteRoster.map((host) => (
                          <tr key={host.id} className="border-b border-white/5 hover:bg-white/5 transition">
                            <td className="py-2.5">
                              <p className="font-bold text-white font-sans">{host.name}</p>
                              <p className="text-[9px] text-slate-500">ID: #{host.id} • Lvl {host.level}</p>
                            </td>
                            <td className="py-2.5 text-center">
                              <p className="text-white font-bold">{host.hoursCompleted} hrs</p>
                              <p className="text-[9px] text-slate-500">Target: {host.targetHours} hrs</p>
                            </td>
                            <td className="py-2.5 text-right font-bold text-purple-400">
                              {host.diamondsEarned.toLocaleString()} 💎
                            </td>
                            <td className="py-2.5 text-center">
                              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">
                                {host.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS & TRANSACTION HISTORIES */}
          {currentTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-rose-400" /> Security Audits & Financial Ledger logs
                </h3>
                <p className="text-xs text-slate-400">Transparent system log verifying hardware safety logs, wallet password authorizations, coin recharges, and payout transfers.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Account Security Events */}
                <div className="lg:col-span-5 bg-black/30 border border-white/5 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Activity className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-black uppercase font-mono">Account Security Event Log</h4>
                  </div>
                  
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {securityLogs.map((log) => (
                      <div key={log.id} className="bg-black/20 border border-white/5 p-2.5 rounded-xl font-mono text-[10px] leading-relaxed">
                        <div className="flex justify-between items-center border-b border-white/5 pb-1 mb-1">
                          <span className="text-rose-400 font-bold uppercase text-[8px]">{log.event}</span>
                          <span className="text-slate-500 text-[8px]">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-300">Device: <strong className="text-slate-400">{log.device}</strong></p>
                        <p className="text-slate-300">Location: <strong className="text-slate-400">{log.location}</strong></p>
                        <p className="text-slate-300">IP Route: <strong className="text-slate-400">{log.ip}</strong></p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Ledger Log */}
                <div className="lg:col-span-7 bg-black/30 border border-white/5 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <History className="w-4 h-4 text-amber-400" />
                      <h4 className="text-xs font-black uppercase font-mono">Financial Transaction Ledger</h4>
                    </div>
                    <span className="text-[9px] font-bold text-slate-500">Live Port 3000 Ingress</span>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="bg-black/20 border border-white/5 p-2.5 rounded-xl font-mono text-[10.5px] flex justify-between items-center">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded ${
                              tx.type === 'Purchase' ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
                            }`}>{tx.type}</span>
                            <span className="text-white font-bold font-sans text-[11px]">{tx.item}</span>
                          </div>
                          <p className="text-[9px] text-slate-500">{tx.timestamp} • ID: #{tx.id.substring(0, 10)}</p>
                        </div>

                        <div className="text-right">
                          <p className={`font-black font-mono text-[12px] ${
                            tx.type === 'Purchase' ? 'text-amber-400' : 'text-purple-400'
                          }`}>
                            {tx.type === 'Purchase' ? '+' : '-'}{tx.amount.toLocaleString()} {tx.currency}
                          </p>
                          {tx.cashAmount && (
                            <p className="text-[9px] text-slate-400 font-sans">
                              {tx.cashCurrency === 'PKR' ? 'Rs.' : '$'}{tx.cashAmount.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 6: INTEGRATED LIVE CHAT & MESSAGE SYSTEM */}
          {currentTab === 'chat' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-indigo-400" /> VocoLive Integrated Message Center
                </h3>
                <p className="text-xs text-slate-400">Direct Message 1-on-1 with streamers, co-hosts, and agency owners or view platform-wide system notification alerts.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[420px]">
                
                {/* 1-on-1 Chats Contact list */}
                <div className="lg:col-span-4 bg-black/30 border border-white/5 rounded-2xl p-3 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase font-mono block px-1">Chats & Direct Messages</span>
                    
                    <div className="space-y-1">
                      {contacts.map((contact) => {
                        const contactUnreadCount = dmMessages.filter(
                          m => m.senderId === contact.id && m.recipientId === currentUser.id && m.read !== true
                        ).length;
                        return (
                          <button
                            key={contact.id}
                            onClick={() => setActiveContactId(contact.id)}
                            className={`w-full p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition active:scale-98 ${
                              activeContactId === contact.id
                                ? 'bg-purple-500/15 border-purple-500/40 text-white'
                                : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            <div className="relative">
                              <span className="text-2xl">{contact.avatar}</span>
                              {contact.online && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-950 rounded-full animate-pulse" />
                              )}
                            </div>
                            <div className="truncate flex-1">
                              <p className="text-xs font-bold leading-tight flex justify-between items-center">
                                <span>{contact.name}</span>
                                {contactUnreadCount > 0 && (
                                  <span className="bg-red-500 text-white font-mono text-[8px] font-bold px-1.5 py-0.2 rounded-full">
                                    {contactUnreadCount}
                                  </span>
                                )}
                              </p>
                              <p className="text-[9px] text-slate-500 font-mono mt-0.5">{contact.badge}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notification Feed */}
                  <div className="pt-3 border-t border-white/5 space-y-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase font-mono block px-1 flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-purple-400" /> Alerts Feed
                    </span>
                    <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5 text-[9.5px] font-mono leading-relaxed">
                      {systemNotifications.map((notif) => (
                        <div key={notif.id} className="bg-black/25 border border-white/5 p-1.5 rounded-lg text-slate-400">
                          <p className="font-bold text-white text-[10px] flex justify-between">
                            <span>{notif.title}</span>
                            <span className="text-slate-600 font-normal text-[8px]">{notif.timestamp}</span>
                          </p>
                          <p className="text-slate-400 text-[9px] mt-0.5">{notif.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 1-on-1 Messages Thread & Input form */}
                <div className="lg:col-span-8 bg-black/30 border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden">
                  
                  {/* Header of selected contact */}
                  <div className="bg-white/5 border-b border-white/5 px-4 py-2.5 flex flex-col sm:flex-row gap-3 justify-between sm:items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {contacts.find(c => c.id === activeContactId)?.avatar || '🤵'}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-white leading-none">
                          {contacts.find(c => c.id === activeContactId)?.name || 'Danish Chat'}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          UID: #{activeContactId} • Status: <strong className="text-emerald-400">Active Node</strong>
                        </p>
                      </div>
                    </div>
                    
                    {/* Sort Order Toggles & Security Indicator */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center bg-black/50 rounded-lg p-0.5 border border-white/5 text-[9px] font-mono">
                        <button
                          onClick={() => setMsgSortOrder('oldest')}
                          className={`px-2 py-1 rounded-md font-bold transition ${
                            msgSortOrder === 'oldest'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Oldest
                        </button>
                        <button
                          onClick={() => setMsgSortOrder('newest')}
                          className={`px-2 py-1 rounded-md font-bold transition ${
                            msgSortOrder === 'newest'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                              : 'text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          Newest
                        </button>
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0">AES P2P</span>
                    </div>
                  </div>

                  {/* Local Search Bar */}
                  <div className="bg-black/40 border-b border-white/5 px-4 py-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={chatSearchQuery}
                        onChange={(e) => setChatSearchQuery(e.target.value)}
                        placeholder="Search messages by sender's name or keywords..."
                        className="w-full bg-[#111221]/80 border border-white/10 text-white rounded-lg pl-9 pr-8 py-1.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-sans placeholder-slate-500"
                      />
                      {chatSearchQuery && (
                        <button
                          onClick={() => setChatSearchQuery('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    {chatSearchQuery && (
                      <span className="text-[10px] text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 font-mono font-bold whitespace-nowrap">
                        {searchedChatMessages.length} match{searchedChatMessages.length !== 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>

                  {/* Message scroll stream */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                    {currentChatMessages.map((msg) => {
                      const isMe = msg.senderId === currentUser.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                          <div className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs relative shadow-md ${
                            isMe 
                              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-slate-950 font-bold rounded-tr-none' 
                              : 'bg-white/5 border border-white/10 text-white rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed">{msg.text}</p>
                            <span className={`text-[8px] block text-right mt-1 ${isMe ? 'text-slate-950/70' : 'text-slate-500'} font-mono`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {currentChatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                        <MessageSquare className="w-8 h-8 opacity-25 mb-1 text-purple-400 animate-pulse" />
                        <p className="italic">No direct messages exchanged yet.</p>
                        <p className="text-[9px] text-slate-600 mt-0.5">Type below to begin chatting!</p>
                      </div>
                    )}
                  </div>

                  {/* Send messaging input */}
                  <div className="p-3 bg-white/5 border-t border-white/5 flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={typedMessage}
                      onChange={(e) => setTypedMessage(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-sans"
                      placeholder="Type your secure Urdu message..."
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2.5 bg-purple-500 hover:bg-purple-400 rounded-xl text-slate-950 transition active:scale-95"
                    >
                      <Send className="w-4 h-4 fill-slate-950" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB: PROMOTE SYSTEM */}
          {currentTab === 'promote_system' && (
            <div className="space-y-6 animate-fade-in text-white">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-base font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-5 h-5 text-amber-400" /> VocoLive Creator & Arena Promotion Center
                </h3>
                <p className="text-xs text-slate-400">Promote users to high-authority roles, update entrance badges, or sponsor live voice rooms to amplify stream traffic instantly.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Panel 1: User Promotions */}
                <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-400 font-mono flex items-center gap-1">👑 Platform Identity Promotion</h4>
                    <p className="text-[10px] text-slate-400">Upgrade stream roles, allocate honorary badges, and boost authority level parameters.</p>
                  </div>

                  <form onSubmit={handlePromoteUser} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Target Creator</label>
                      <select
                        value={promoteUserId}
                        onChange={(e) => setPromoteUserId(e.target.value)}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value={currentUser.id}>👤 {currentUser.name} (You - ID: {currentUser.id})</option>
                        {mockUsers.map(u => (
                          <option key={u.id} value={u.id}>🤵 {u.name} (ID: {u.id})</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Assign New Role / Badge</label>
                        <select
                          value={promoteNewRole}
                          onChange={(e) => setPromoteNewRole(e.target.value)}
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="Host">Host</option>
                          <option value="Manager">Manager</option>
                          <option value="Reseller">Reseller</option>
                          <option value="Agency Owner">Agency Owner</option>
                          <option value="BD Owner">BD Owner</option>
                          <option value="Super Admin">Super Admin</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">VIP Badge Status</label>
                        <select
                          value={promoteVIPBadge}
                          onChange={(e) => setPromoteVIPBadge(e.target.value)}
                          className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="None">None</option>
                          <option value="Bronze VIP">Bronze VIP</option>
                          <option value="Silver VIP">Silver VIP</option>
                          <option value="Gold VIP">Gold VIP</option>
                          <option value="Diamond VIP">Diamond VIP</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Instant Level Boost</label>
                      <select
                        value={promoteLevelBoost}
                        onChange={(e) => setPromoteLevelBoost(Number(e.target.value))}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="1">+1 level</option>
                        <option value="5">+5 levels</option>
                        <option value="10">+10 levels</option>
                        <option value="25">+25 levels</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      Apply Promotion ⚡
                    </button>
                  </form>
                </div>

                {/* Panel 2: Room Boosts */}
                <div className="bg-[#14152b] border border-white/5 p-5 rounded-2xl space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-400 font-mono flex items-center gap-1">🚀 Sponsor Live Voice Rooms</h4>
                    <p className="text-[10px] text-slate-400">Boost live viewer counts, highlight the room frame with high-contrast borders, and pin it to the Discover lobby.</p>
                  </div>

                  <form onSubmit={handleBoostRoom} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Live Party Room</label>
                      <select
                        value={promoteRoomId}
                        onChange={(e) => setPromoteRoomId(e.target.value)}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none font-sans"
                      >
                        <option value="R109">✨ Sana Sufi Night Vibes (ID: R109)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Select Boost Priority Tier</label>
                      <select
                        value={promoteBoostTier}
                        onChange={(e) => setPromoteBoostTier(e.target.value)}
                        className="w-full bg-[#111221] border border-white/10 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="BRONZE">BRONZE BOOST (+100 viewers) - Cost: 200 Coins</option>
                        <option value="SPOTLIGHT">SPOTLIGHT SPOT (+300 viewers) - Cost: 500 Coins</option>
                        <option value="ELITE">GOLDEN ELITE PIN (+800 viewers) - Cost: 1000 Coins</option>
                      </select>
                    </div>

                    <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 text-[9px] font-mono text-slate-400 space-y-1">
                      <p className="text-white font-bold uppercase tracking-wider text-[10px]">Your Wallet Balance:</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-amber-400 font-bold">{currentUser.coins.toLocaleString()} Coins 🪙</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-purple-400 font-bold">{currentUser.diamonds.toLocaleString()} Diamonds 💎</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/10 cursor-pointer"
                    >
                      Activate Visibility Boost 🚀
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

          {/* TAB: AGENCY PORTAL */}
          {currentTab === 'agency_portal' && (
            <div className="animate-fade-in text-white">
              <AgencyPortal 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                addAdminLog={addAdminLog}
              />
            </div>
          )}

          {/* TAB: RESELLER PORTAL */}
          {currentTab === 'reseller_portal' && (
            <div className="animate-fade-in text-white">
              <ResellerPanel 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                addAdminLog={addAdminLog}
                onCoinsTransferred={onCoinsTransferred}
                mockUsers={mockUsers}
              />
            </div>
          )}

          {/* TAB: ADMIN PORTAL */}
          {currentTab === 'admin_portal' && (
            <div className="animate-fade-in text-white">
              <AdminPanel 
                logs={adminLogs}
                clearLogs={clearLogs}
                addAdminLog={addAdminLog}
                banUser={banUser}
                bannedUsers={bannedUsers}
                mockUsers={mockUsers}
                setMockUsers={setMockUsers || (() => {})}
              />
            </div>
          )}



        </div>

        {/* Footer info showing low-latency route in active tab */}
        <div className="border-t border-white/5 pt-3 mt-6 text-[9.5px] text-slate-500 font-mono flex flex-wrap justify-between gap-2">
          <span>Current Interface Tab: <strong className="text-purple-400 font-bold uppercase">{currentTab} Panel</strong></span>
          <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Connection Route: AES-256 Server SSL</span>
        </div>

        {/* Daily Check-In Success Modal */}
        {showCheckInSuccessModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-gradient-to-b from-[#1b1c3a] to-[#121326] border border-purple-500/30 rounded-3xl p-6 w-full max-w-sm text-center text-white shadow-2xl relative animate-fade-in">
              {/* Decorative sparkle effects */}
              <div className="absolute top-4 left-4 text-xl animate-pulse">✨</div>
              <div className="absolute top-12 right-6 text-xl animate-bounce">💎</div>
              <div className="absolute bottom-6 left-12 text-xl animate-pulse">🎉</div>

              <div className="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border border-purple-500/30 animate-pulse">
                🎁
              </div>

              <h3 className="text-lg font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500">
                Mubarak Ho! 🎉
              </h3>
              <p className="text-xs text-slate-300 font-mono uppercase tracking-widest mt-1">Daily Reward Claimed</p>

              <div className="my-5 p-4 bg-black/45 rounded-2xl border border-white/5 space-y-1">
                <p className="text-3xl font-black text-emerald-400 font-mono">+{earnedAmount}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Streamer Diamonds Added</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Your check-in streak is now <strong className="text-emerald-400">{checkInStreak} Days</strong>. Keep checking in every 24 hours to secure consecutive rewards!
              </p>

              <button
                type="button"
                onClick={() => setShowCheckInSuccessModal(false)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-md"
              >
                Awesome, Thanks!
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
