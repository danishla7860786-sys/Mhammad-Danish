import React, { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User, Room } from '../types';
import { Search, MapPin, Globe, Headphones, Flame, Coins, ShieldAlert, Award, Star, Palette, ShoppingBag, Radio, RefreshCw, ShieldCheck, CheckCircle, PlusCircle, History, Trophy, Sparkles, Gift } from 'lucide-react';

interface DashboardProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  onJoinRoom: (room: Room) => void;
  addAdminLog: (log: string) => void;
  mockUsers: any[];
}

const HISTORY_ROOMS: Room[] = [
  {
    id: 'room_zain',
    title: '🎸 Live Rock & Unplugged Hits',
    host: { id: '1003', name: 'Zain (AI)', avatar: '🎸', bio: 'Guitarist & Rocker', coins: 800, diamonds: 12000, level: 38, badge: 'Host', frame: 'Crown Classic' },
    description: 'Chilling with acoustic melodies and classic rock. Send requests!',
    category: 'Music',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Urdu',
    viewers: 284,
    giftsReceived: 18500,
    seats: [],
    pk: null
  }
];

const FOLLOWED_ROOMS: Room[] = [
  {
    id: 'room_aisha',
    title: '💅 Aisha’s Late Night Melodies',
    host: { id: '1002', name: 'Aisha (AI)', avatar: '💅', bio: 'Live Singer & Entertainer', coins: 500, diamonds: 2300, level: 24, badge: 'Host', frame: 'Ruby Wing' },
    description: 'Beautiful ghazals, Sufi sessions, and pleasant chatting.',
    category: 'Music',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Punjabi',
    viewers: 512,
    giftsReceived: 24500,
    seats: [],
    pk: null
  }
];

const ADMIN_ROOMS: Room[] = [
  {
    id: 'room_official_main',
    title: '🔰 Official VocoLive Director Lounge',
    host: { id: 'admin_sys', name: 'Voco Directorate', avatar: '🛡️', bio: 'System operations desk', coins: 99999, diamonds: 99999, level: 99, badge: 'Super Admin' },
    description: 'Regional host auditions, reseller announcements, and support queries.',
    category: 'Chat',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Urdu',
    viewers: 1050,
    giftsReceived: 82000,
    seats: [],
    pk: null
  }
];

const ROOMS_MOCK: Room[] = [
  {
    id: 'room_zain',
    title: '🎸 Live Rock & Unplugged Hits',
    host: { id: '1003', name: 'Zain (AI)', avatar: '🎸', bio: 'Guitarist & Rocker', coins: 800, diamonds: 12000, level: 38, badge: 'Host', frame: 'Crown Classic' },
    description: 'Chilling with acoustic melodies and classic rock. Send requests!',
    category: 'Music',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Urdu',
    viewers: 284,
    giftsReceived: 18500,
    seats: [
      { index: 1, user: { id: '1003', name: 'Zain (AI)', avatar: '🎸', bio: '', coins: 0, diamonds: 0, level: 1, badge: 'Host' }, isMuted: false, isLocked: false },
      { index: 2, user: null, isMuted: false, isLocked: false },
      { index: 3, user: null, isMuted: false, isLocked: false }
    ],
    pk: null
  },
  {
    id: 'room_aisha',
    title: '💅 Aisha’s Late Night Melodies',
    host: { id: '1002', name: 'Aisha (AI)', avatar: '💅', bio: 'Live Singer & Entertainer', coins: 500, diamonds: 2300, level: 24, badge: 'Host', frame: 'Ruby Wing' },
    description: 'Beautiful ghazals, Sufi sessions, and pleasant chatting.',
    category: 'Music',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Punjabi',
    viewers: 512,
    giftsReceived: 24500,
    seats: [
      { index: 1, user: { id: '1002', name: 'Aisha (AI)', avatar: '💅', bio: '', coins: 0, diamonds: 0, level: 1, badge: 'Host' }, isMuted: false, isLocked: false }
    ],
    pk: null
  },
  {
    id: 'room_ayesha',
    title: '🌸 Safe Space Chat & Tea',
    host: { id: '2022', name: 'Ayesha', avatar: '🌸', bio: 'Friendly chatting lounge', coins: 100, diamonds: 4200, level: 15, badge: 'Host', frame: 'Silver Shine' },
    description: 'Let’s talk about our day! Warm vibe, deep conversations, positive energy.',
    category: 'Chat',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Urdu',
    viewers: 195,
    giftsReceived: 9200,
    seats: [],
    pk: null
  },
  {
    id: 'room_sarah',
    title: '🎧 DJ Mixes & Gaming Arena',
    host: { id: '1004', name: 'Sarah (AI)', avatar: '🎧', bio: 'Late night DJ mix', coins: 200, diamonds: 890, level: 8, badge: 'Host' },
    description: 'Electronic beats, fast matches, and high action gaming talks.',
    category: 'Gaming',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'English',
    viewers: 142,
    giftsReceived: 4100,
    seats: [],
    pk: null
  }
];

const OFFICIAL_ROOMS: Room[] = [
  {
    id: 'room_official_main',
    title: '🔰 Official VocoLive Director Lounge',
    host: { id: 'admin_sys', name: 'Voco Directorate', avatar: '🛡️', bio: 'System operations desk', coins: 99999, diamonds: 99999, level: 99, badge: 'Super Admin' },
    description: 'Regional host auditions, reseller announcements, and support queries.',
    category: 'Chat',
    privacy: 'Public',
    country: 'Pakistan 🇵🇰',
    language: 'Urdu',
    viewers: 1050,
    giftsReceived: 82000,
    seats: [],
    pk: null
  }
];

export default function Dashboard({
  currentUser,
  setCurrentUser,
  onJoinRoom,
  addAdminLog,
  mockUsers
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'Music' | 'Gaming' | 'Chat'>('all');
  
  // 3 main top tabs state
  const [mainTab, setMainTab] = useState<'ME' | 'New Room' | 'Official'>('ME');
  
  // Tab 1 (ME) sub-pages
  const [meSubTab, setMeSubTab] = useState<'History' | 'Create' | 'Following' | 'Admin'>('History');
  
  // Live Active Rooms refresh animation state
  const [isRefreshingLive, setIsRefreshingLive] = useState<boolean>(false);
  const [liveRefreshSuccess, setLiveRefreshSuccess] = useState<boolean>(false);

  const [wizardRoomName, setWizardRoomName] = useState<string>('');
  const [wizardRoomTitle, setWizardRoomTitle] = useState<string>('');

  // Top Rooms Leaderboard Metric
  const [leaderboardMetric, setLeaderboardMetric] = useState<'participants' | 'gifts' | 'hot'>('participants');

  const getLeaderboardRooms = () => {
    let list = [...ROOMS_MOCK, ...OFFICIAL_ROOMS];
    if (currentUser.myCreatedRoom) {
      if (!list.some(r => r.id === currentUser.myCreatedRoom.id)) {
        list = [currentUser.myCreatedRoom, ...list];
      }
    }

    const mapped = list.map(room => {
      const savedBoost = localStorage.getItem('voco_boosted_room_' + room.id);
      let viewers = room.viewers;
      if (savedBoost) {
        try {
          const { extraViewers } = JSON.parse(savedBoost);
          viewers += (extraViewers || 0);
        } catch (e) {}
      }
      return {
        ...room,
        viewers,
        giftsReceived: room.giftsReceived || 0
      };
    });

    if (leaderboardMetric === 'participants') {
      return mapped.sort((a, b) => b.viewers - a.viewers);
    } else if (leaderboardMetric === 'gifts') {
      return mapped.sort((a, b) => b.giftsReceived - a.giftsReceived);
    } else {
      return mapped.sort((a, b) => {
        const scoreA = (a.viewers * 10) + (a.giftsReceived / 2);
        const scoreB = (b.viewers * 10) + (b.giftsReceived / 2);
        return scoreB - scoreA;
      });
    }
  };

  // Refresh active rooms list simulator
  const handleRefreshLiveRooms = () => {
    setIsRefreshingLive(true);
    addAdminLog('Initiated fetch call for new live active rooms on port 3000...');
    setTimeout(() => {
      setIsRefreshingLive(false);
      setLiveRefreshSuccess(true);
      addAdminLog('Successfully synchronized 4 new live active rooms with active listener seats.');
      setTimeout(() => setLiveRefreshSuccess(false), 2500);
    }, 900);
  };

  // Helper filters based on tab selection
  const getFilteredRooms = () => {
    let baseList: Room[] = [];

    if (mainTab === 'ME') {
      if (meSubTab === 'History') {
        baseList = HISTORY_ROOMS;
      } else if (meSubTab === 'Following') {
        baseList = FOLLOWED_ROOMS;
      } else if (meSubTab === 'Admin') {
        baseList = ADMIN_ROOMS;
      } else if (meSubTab === 'Create') {
        if (currentUser.myCreatedRoom) {
          baseList = [currentUser.myCreatedRoom];
        } else {
          baseList = [];
        }
      }
    } else if (mainTab === 'New Room') {
      baseList = ROOMS_MOCK;
      if (currentUser.myCreatedRoom) {
        baseList = [currentUser.myCreatedRoom, ...ROOMS_MOCK.filter(r => r.id !== currentUser.myCreatedRoom.id)];
      }
    } else if (mainTab === 'Official') {
      baseList = OFFICIAL_ROOMS;
    }

    return baseList.map(room => {
      const savedBoost = localStorage.getItem('voco_boosted_room_' + room.id);
      if (savedBoost) {
        try {
          const { isPromoted, promotionType, extraViewers } = JSON.parse(savedBoost);
          return {
            ...room,
            isPromoted: isPromoted,
            promotionType: promotionType,
            viewers: room.viewers + (extraViewers || 0)
          };
        } catch (e) {}
      }
      return room;
    }).filter(room => {
      const matchesSearch = room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            room.host.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || room.category === activeTab;
      return matchesSearch && matchesTab;
    });
  };

  const handleCreateRoomSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!wizardRoomName.trim()) return;

    const newRoom: Room = {
      id: '7771',
      title: wizardRoomName.trim(),
      host: currentUser,
      description: wizardRoomTitle.trim() || 'Welcome to my active voice party!',
      category: 'Music',
      privacy: 'Public',
      country: currentUser.country || 'Pakistan 🇵🇰',
      language: 'Urdu',
      viewers: 1,
      seats: [],
      pk: null
    };

    // Update currentUser state to record room creation
    setCurrentUser({
      ...currentUser,
      hasCreatedRoom: true,
      myCreatedRoom: newRoom
    });

    addAdminLog(`Created new voice chat room: "${wizardRoomName.trim()}"`);
    setWizardRoomName('');
    setWizardRoomTitle('');

    // Auto-join the created room
    onJoinRoom(newRoom);
  };

  return (
    <div className="space-y-6" id="vocolive-lobby-dashboard">
      
      {/* 3 Main Top Level Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 max-w-md mx-auto sm:mx-0">
        {([
          { id: 'ME', label: 'ME', icon: <Award className="w-4 h-4 text-purple-400" /> },
          { id: 'New Room', label: 'New Room', icon: <Flame className="w-4 h-4 text-rose-400" /> },
          { id: 'Official', label: 'Official', icon: <ShieldCheck className="w-4 h-4 text-emerald-400" /> }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setMainTab(tab.id);
              setSearchQuery(''); // reset search query on main tab change
            }}
            className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
              mainTab === tab.id
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-indigo-600/20 font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Main Column: Discover Streams (Arena) */}
        <div className="order-1 lg:order-1 lg:col-span-8 space-y-6">
          
          {/* TAB 1: ME (Displays exactly these 4 sub-functions/pages) */}
          {mainTab === 'ME' && (
            <div className="space-y-5">
              <div className="flex border-b border-white/5 pb-2 justify-start gap-5 overflow-x-auto scrollbar-none shrink-0">
                {([
                  { id: 'History', label: 'History Page', icon: '⏳' },
                  { id: 'Create', label: 'Create Page', icon: '🚀' },
                  { id: 'Following', label: 'Following Page', icon: '💖' },
                  { id: 'Admin', label: 'Admin Page', icon: '🛡️' }
                ] as const).map((subTab) => (
                  <button
                    key={subTab.id}
                    onClick={() => setMeSubTab(subTab.id)}
                    className={`pb-2.5 text-xs font-black uppercase tracking-wider relative cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap ${
                      meSubTab === subTab.id 
                        ? 'text-white font-black' 
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <span>{subTab.icon}</span>
                    {subTab.label}
                    {meSubTab === subTab.id && (
                      <motion.div
                        layoutId="activeMeSubTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Sub-page 1: Create Page */}
              {meSubTab === 'Create' && (
                <div className="bg-gradient-to-tr from-[#161730] to-[#121326] border border-white/5 rounded-2xl p-5 space-y-4 shadow-xl">
                  {!currentUser.hasCreatedRoom ? (
                    <form onSubmit={handleCreateRoomSubmit} className="space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                          🚀 Room Creator Wizard
                        </h3>
                        <span className="text-[9px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
                          New User Setup
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed text-left">
                        Set up your own custom audio room to broadcast live audio and host PK battles with co-hosts instantly.
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wide block">Room Name:</label>
                          <input
                            type="text"
                            placeholder="Enter beautiful Room Name..."
                            value={wizardRoomName}
                            onChange={e => setWizardRoomName(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500 font-medium"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wide block">Room Topic/Title:</label>
                          <input
                            type="text"
                            placeholder="Enter Room Topic/Title description..."
                            value={wizardRoomTitle}
                            onChange={e => setWizardRoomTitle(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-slate-500 font-medium"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-600/25 transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        🚀 Create & Save My Room
                      </button>
                    </form>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                          Your Registered Room Live
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1">
                          👑 {currentUser.myCreatedRoom?.title || 'Your Live Room'}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-sans">
                          Topic: {currentUser.myCreatedRoom?.description || 'No description active'}
                        </p>
                      </div>
                      <button
                        onClick={() => onJoinRoom(currentUser.myCreatedRoom!)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1.5"
                      >
                        <span>🎙️ Enter Room</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: New Room (Display list of live active rooms where other users are sitting/active) */}
          {mainTab === 'New Room' && (
            <div className="bg-gradient-to-r from-purple-950/10 via-slate-900/40 to-indigo-950/10 border border-white/5 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-left">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500 animate-pulse" /> Live Active Rooms
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                    These active parties have real users sitting and broadcasting live audio.
                  </p>
                </div>
                
                <button
                  onClick={handleRefreshLiveRooms}
                  disabled={isRefreshingLive}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${isRefreshingLive ? 'animate-spin' : ''}`} />
                  {isRefreshingLive ? 'Fetching Active Rooms...' : 'Scan Active Rooms'}
                </button>
              </div>

              {liveRefreshSuccess && (
                <div className="p-2 bg-emerald-500/15 border border-emerald-500/20 rounded-xl text-center text-[10px] font-mono text-emerald-400 animate-fade-in">
                  ✓ Successfully updated live seat statuses and viewer counts.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Official (Display verified/official rooms & announcements) */}
          {mainTab === 'Official' && (
            <div className="bg-slate-900/50 border border-emerald-500/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2.5 text-left">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Official Security & Verification Desk
                  </h3>
                  <p className="text-[10px] text-slate-400 font-sans">
                    Strictly authorized channels and official announcements by regional VocoLive directors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">System Status Live</span>
                  </div>
                  <h4 className="text-white text-xs font-bold font-sans">Secure Mobile Billing System</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    All top-ups and coin transfers are processed directly on official partner Reseller IDs or authenticated bank gates. Keep credentials confidential.
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5 font-sans">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Reseller Notice</span>
                  </div>
                  <h4 className="text-white text-xs font-bold font-sans">Verification & Onboarding</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Only verified agencies are permitted to host official talent auditions. Apply through our Agency Onboarding Portal.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Active search filter and category header */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/5 pb-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${mainTab === 'ME' ? 'your' : mainTab === 'New Room' ? 'active' : 'official'} rooms...`}
                className="w-full bg-black/30 text-xs text-white placeholder-slate-400 rounded-full pl-9 pr-3 py-2.5 border border-white/10 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
 
            <div className="flex gap-2 text-xs font-semibold overflow-x-auto w-full sm:w-auto scrollbar-none font-sans">
              {(['all', 'Music', 'Gaming', 'Chat'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full border transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-indigo-400 text-white font-black shadow-lg shadow-indigo-600/20'
                      : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab === 'all' ? '🌐 All' : tab === 'Music' ? '🎵 Music' : tab === 'Gaming' ? '🎮 Gaming' : '💬 Chat Lounge'}
                </button>
              ))}
            </div>
          </div>
 
          {/* Sub-Tab Specific Header */}
          <div className="text-left flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-mono">
              {mainTab === 'ME' ? (
                meSubTab === 'History' ? '⏳ Recently Visited Parties' : 
                meSubTab === 'Following' ? '💖 My Favorited Rooms' : 
                meSubTab === 'Admin' ? '🛡️ Admin Privileged Rooms' : '🚀 My Self-Created Room'
              ) : mainTab === 'New Room' ? (
                '🔥 Active Group Audio Broadcasts'
              ) : (
                '🔰 Verified Official Channels'
              )}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">
              Showing {getFilteredRooms().length} Rooms
            </span>
          </div>

          {/* Streams Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {getFilteredRooms().length > 0 ? (
              getFilteredRooms().map((room) => (
                <div
                  key={room.id}
                  onClick={() => onJoinRoom(room)}
                  className={`border rounded-2xl p-5 space-y-4 transition-all duration-300 cursor-pointer group hover:shadow-xl relative overflow-hidden flex flex-col justify-between h-[210px] backdrop-blur-md ${
                    room.isPromoted 
                      ? 'border-amber-500/60 shadow-lg shadow-amber-500/5 hover:border-amber-400 hover:shadow-amber-500/10 bg-gradient-to-br from-[#1c1810] via-[#0e101f] to-[#0d0d18]' 
                      : mainTab === 'Official'
                      ? 'border-emerald-500/30 bg-[#0d1c16]/30 hover:border-emerald-400/60'
                      : 'bg-white/5 border-white/10 hover:border-purple-500/50 hover:shadow-purple-500/5'
                  }`}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

                  <div className="space-y-2 relative z-10 text-left">
                    <div className="flex justify-between items-start gap-2">
                      {room.isPromoted ? (
                        <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full border border-amber-300 uppercase tracking-wider animate-pulse flex items-center gap-1">
                          👑 PROMOTED {room.promotionType ? `• ${room.promotionType}` : ''}
                        </span>
                      ) : mainTab === 'Official' ? (
                        <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> OFFICIAL
                        </span>
                      ) : (
                        <span className="bg-purple-500/10 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-500/20 uppercase tracking-wider">
                          {room.category}
                        </span>
                      )}
                      
                      <span className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                        <Flame className="w-3.5 h-3.5 text-rose-500" /> {room.viewers} listening
                      </span>
                    </div>

                    <h4 className="text-white text-sm font-bold truncate group-hover:text-purple-400 transition leading-tight">
                      {room.title}
                    </h4>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-sans">
                      {room.description}
                    </p>

                    {/* Displays active seat occupants if in New Room tab */}
                    {mainTab === 'New Room' && room.seats && room.seats.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1 bg-black/30 px-2 py-1 rounded-xl border border-white/5 w-fit animate-fade-in font-sans">
                        <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-wider">Active Seats:</span>
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {room.seats.filter(s => s.user).map((seat, idx) => (
                            <span 
                              key={seat.user?.id || idx} 
                              title={seat.user?.name} 
                              className="w-4.5 h-4.5 rounded-full bg-slate-800 border border-slate-950 flex items-center justify-center text-[10px] shadow-sm"
                            >
                              {seat.user?.avatar}
                            </span>
                          ))}
                        </div>
                        <span className="text-[8px] text-purple-300 font-mono font-bold">({room.seats.filter(s => s.user).length} Users)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-3 border-t border-white/5 mt-auto">
                    <span className="flex items-center gap-1 font-sans">
                      👨‍💼 Host: <strong className="text-slate-200">{room.host.name.split(' ')[0]}</strong>
                    </span>
                    <span className="flex items-center gap-1 font-sans bg-black/30 px-2 py-1 rounded border border-white/5 text-slate-300">
                      <MapPin className="w-3 h-3 text-purple-400" /> {room.country}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-12 text-center bg-white/5 border border-white/5 rounded-2xl border-dashed">
                <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse mb-2.5" />
                <p className="text-slate-400 text-xs font-semibold">No active parties found in this tab.</p>
                <p className="text-slate-500 text-[10px] mt-1 font-mono">Create a custom room or adjust search queries.</p>
              </div>
            )}
          </div>

        </div>

        {/* Top Rooms Leaderboard Sidebar Column */}
        <div className="order-2 lg:col-span-4 space-y-5" id="top-rooms-leaderboard">
          <div className="bg-gradient-to-br from-[#161730] to-[#121326] border border-white/5 rounded-2xl p-4 shadow-xl space-y-4 text-left relative overflow-hidden">
            {/* Background accent light */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-500/10 blur-2xl pointer-events-none rounded-full" />
            
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400 animate-bounce" />
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    🏆 Top Rooms Leaderboard
                  </h3>
                  <p className="text-[9.5px] text-slate-400 font-mono">Real-time Voco Hot List</p>
                </div>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            </div>

            {/* Metric Selector Toggles */}
            <div className="grid grid-cols-3 gap-1 bg-black/45 p-1 rounded-xl border border-white/5">
              {(['participants', 'gifts', 'hot'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setLeaderboardMetric(metric)}
                  className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer font-sans text-center ${
                    leaderboardMetric === metric
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {metric === 'participants' ? '👥 Users' : metric === 'gifts' ? '🎁 Gifts' : '🔥 Hot'}
                </button>
              ))}
            </div>

            {/* Leaderboard list */}
            <div className="space-y-2.5 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
              {getLeaderboardRooms().map((room, index) => {
                const isTop3 = index < 3;
                const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
                const rankColor = index === 0 ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20 shadow-yellow-500/5 shadow-md' :
                                  index === 1 ? 'bg-slate-300/10 text-slate-300 border-slate-300/20' :
                                  index === 2 ? 'bg-amber-600/10 text-amber-500 border-amber-600/20' :
                                  'bg-black/30 text-slate-400 border-white/5';
                
                const hotScore = (room.viewers * 10) + (room.giftsReceived || 0) / 2;

                return (
                  <div
                    key={room.id}
                    onClick={() => onJoinRoom(room)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all duration-300 cursor-pointer group hover:bg-white/5 ${
                      isTop3 ? 'bg-white/[0.02] border-white/5' : 'bg-transparent border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Circle */}
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-mono border ${rankColor} shrink-0`}>
                        {rankBadge}
                      </div>

                      {/* Host and Room details */}
                      <div className="min-w-0 text-left">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-white group-hover:text-purple-400 transition truncate max-w-[120px] block">
                            {room.title}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 mt-0.5 text-[9.5px] text-slate-400">
                          <span className="text-slate-500 shrink-0">Host:</span>
                          <span className="font-medium text-slate-300 truncate max-w-[70px]">{room.host.name.split(' ')[0]}</span>
                          <span className="text-[8.5px] bg-white/5 px-1 py-0.2 rounded font-mono text-purple-300 shrink-0">Lvl {room.host.level || 5}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score metrics side */}
                    <div className="text-right font-mono flex flex-col justify-center shrink-0 pl-1">
                      {leaderboardMetric === 'participants' ? (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold justify-end">
                          <span>👥</span>
                          <span>{room.viewers.toLocaleString()}</span>
                        </div>
                      ) : leaderboardMetric === 'gifts' ? (
                        <div className="flex items-center gap-1 text-[11px] text-yellow-400 font-bold justify-end">
                          <span>🪙</span>
                          <span>{(room.giftsReceived || 0).toLocaleString()}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-0.5 text-[11px] text-rose-400 font-black justify-end">
                            <span>🔥</span>
                            <span>{Math.round(hotScore).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      
                      <span className="text-[8px] text-slate-500 mt-0.5">{room.country.split(' ')[1] || '🇵🇰'} Pakistan</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom system stats or call to action */}
            <div className="pt-2.5 border-t border-white/5 text-[9px] text-slate-500 flex items-center justify-between font-mono">
              <span>Updated: Real-time</span>
              <span className="text-purple-400 font-semibold flex items-center gap-0.5 animate-pulse">
                <Gift className="w-2.5 h-2.5" /> Send Gifts to rise
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
