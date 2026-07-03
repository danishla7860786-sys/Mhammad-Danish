import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Radio, Users, Landmark, Coins, ShieldAlert, Award, 
  Sparkles, Settings, MessageSquare, Shield, HelpCircle,
  Menu, Bell, ChevronRight, Terminal, UserCheck, Trophy, Clock,
  Minimize2, Maximize2, X
} from 'lucide-react';
import { User, Room, Proposal, DMMessage, SystemNotification } from './types';
import Dashboard from './components/Dashboard';
import VoiceRoom from './components/VoiceRoom';
import ProfileHub from './components/ProfileHub';
import AgencyPortal from './components/AgencyPortal';
import ResellerPanel from './components/ResellerPanel';
import AdminPanel from './components/AdminPanel';
import BudgetEstimator from './components/BudgetEstimator';

export default function App() {
  // --- CORE SYSTEM STATES ---
  const [currentUser, setCurrentUser] = useState<User>({
    id: '7777',
    name: 'Danish (Verified Seller)',
    avatar: '🤵',
    bio: 'Official Reseller & VocoLive Representative 💎 | Fast & Secure Coin Deliveries via JazzCash/EasyPaisa.',
    coins: 150000,
    diamonds: 28500,
    level: 42,
    badge: 'Reseller',
    frame: 'border-indigo-500 shadow-[0_0_10px_#6366f1]',
    vipBadge: 'SVIP',
    family: 'Pakistan Stars 🇵🇰',
    relationshipCP: 'Aisha (Singer)',
    gender: 'Male',
    age: 26,
    country: 'Pakistan 🇵🇰',
    dp: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'BD Owner',
    hasCreatedRoom: false,
    myCreatedRoom: null
  });

  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isRoomMinimized, setIsRoomMinimized] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('discover'); // 'discover' | 'agency' | 'reseller' | 'admin' | 'profile' | 'budget'
  const [showAdminLogsPanel, setShowAdminLogsPanel] = useState<boolean>(true);

  // --- SUB-DATABASES ---
  const [proposals, setProposals] = useState<Proposal[]>([
    { id: 'prop_1', applicantName: 'Kiran Shah', category: 'Music Singer', experience: '2 Years on Bigo & Yalla', socialLinks: 'instagram.com/kiran_music', introLink: 'vocolive.com/intros/kiran.mp3', status: 'Pending', timestamp: '10m ago' },
    { id: 'prop_2', applicantName: 'Sana Khan', category: 'Urdu Poetry Voice', experience: '1 Year on StarMaker', socialLinks: 'youtube.com/poetry_sana', introLink: 'vocolive.com/intros/sana.mp3', status: 'Approved', timestamp: 'Yesterday' }
  ]);

  const [dmMessages, setDmMessages] = useState<DMMessage[]>([
    { id: 'dm_1', senderId: '1001', senderName: 'Kamran (Host)', senderAvatar: '👨‍💼', recipientId: '7777', text: 'Slam Danish bhai, standard rate kya chal raha hai coins transfer ka?', timestamp: '5m ago', read: false },
    { id: 'dm_2', senderId: '7777', senderName: 'Danish (Verified Seller)', senderAvatar: '🤵', recipientId: '1001', text: 'Walaikum Slam Kamran bhai! 1,000 Coins are for 280 PKR ($1.00 USD). Standard mobile wallet rates apply.', timestamp: '4m ago' }
  ]);

  const [systemNotifications, setSystemNotifications] = useState<SystemNotification[]>([
    { id: 'nt_1', title: 'System Security Verification', text: 'Reseller credentials verified successfully. Secure PIN prompt active.', type: 'official', timestamp: '30m ago', read: false },
    { id: 'nt_2', title: 'Verified Reseller Badge Assigned', text: 'Welcome to the official VocoLive partner network! You can now dispense bulk coins directly to IDs.', type: 'official', timestamp: '2h ago', read: true }
  ]);

  const [transactionLogs, setTransactionLogs] = useState<any[]>([
    { id: 'tx_1', resellerId: '7777', resellerName: 'Danish', targetUserId: '1001', amount: 5000, type: 'Transfer Out', timestamp: '10m ago' },
    { id: 'tx_2', resellerId: '7777', resellerName: 'Danish', targetUserId: '1003', amount: 12500, type: 'Transfer Out', timestamp: '1h ago' }
  ]);

  const [securityLogs, setSecurityLogs] = useState<any[]>([
    { id: 'sec_1', userId: '7777', action: 'Coin Transfer Completed', detail: 'Transferred 5,000 Coins to ID: 1001', device: 'Infinix Hot 12', ip: '110.33.201.44', timestamp: '10m ago' },
    { id: 'sec_2', userId: '7777', action: 'IP Authentication Pass', detail: 'Verification of Lahore Region node completed', device: 'Infinix Hot 12', ip: '110.33.201.44', timestamp: '2h ago' }
  ]);

  const [adminLogs, setAdminLogs] = useState<string[]>([
    'VocoLive server boot sequence initialised successfully on port 3000.',
    'Latency stabilizer active: simulated ping round-trip is 180ms.',
    'Agora & Zego audio streams buffer loaded: 0 lost packets.'
  ]);

  const [bannedUsers, setBannedUsers] = useState<string[]>([
    'Spammer_99',
    'Abuser_321'
  ]);

  const [dailyMissions, setDailyMissions] = useState({
    voiceSeconds: 15,
    chatSeconds: 8,
    voiceClaimed: false,
    chatClaimed: false
  });

  const [mockUsers, setMockUsers] = useState<any[]>([
    { id: '1001', name: 'Kamran (Host)', coins: 1500 },
    { id: '1002', name: 'Aisha (AI)', coins: 500 },
    { id: '1003', name: 'Zain (AI)', coins: 800 },
    { id: '1004', name: 'Sarah (AI)', coins: 200 },
    { id: '2022', name: 'Ayesha', coins: 100 }
  ]);

  // --- LOG SIMULATION AND ACTIONS ---
  const addAdminLog = (log: string) => {
    const time = new Date().toLocaleTimeString();
    setAdminLogs(prev => [`[${time}] ${log}`, ...prev]);
  };

  const clearLogs = () => {
    setAdminLogs([]);
  };

  const banUser = (userId: string) => {
    if (!bannedUsers.includes(userId)) {
      setBannedUsers(prev => [...prev, userId]);
      addAdminLog(`Permanently hardware banned Device ID / User: "${userId}"`);
    }
  };

  const handleCoinsTransferred = (targetId: string, amount: number) => {
    // Deduct coins from reseller
    setCurrentUser(prev => ({ ...prev, coins: prev.coins - amount }));
    // Update local mock user coins
    setMockUsers(prev => prev.map(u => u.id === targetId ? { ...u, coins: u.coins + amount } : u));
    
    const targetUser = mockUsers.find(u => u.id === targetId) || { name: 'Direct Top-Up' };
    const newTx = {
      id: 'tx_' + Date.now(),
      resellerId: currentUser.id,
      resellerName: currentUser.name,
      targetUserId: targetId,
      targetUserName: targetUser.name,
      amount,
      timestamp: 'Just now'
    };

    setTransactionLogs(prev => [newTx, ...prev]);
    setSecurityLogs(prev => [
      {
        id: 'sec_' + Date.now(),
        userId: currentUser.id,
        action: 'Coin Transfer Dispensed',
        detail: `Sent ${amount.toLocaleString()} Coins to ID: ${targetId} (${targetUser.name})`,
        device: 'Infinix Hot 12',
        ip: '110.33.201.44',
        timestamp: 'Just now'
      },
      ...prev
    ]);

    addAdminLog(`Reseller processed Coin dispatch: ${amount.toLocaleString()} Coins to Target ID "${targetId}"`);
  };

  const handleJoinRoom = (room: Room) => {
    setCurrentRoom(room);
    setIsRoomMinimized(false);
    addAdminLog(`User "${currentUser.name}" connected to Voice Party: "${room.title}" (Room ID: #${room.id})`);
  };

  const handleLeaveRoom = () => {
    if (currentRoom) {
      addAdminLog(`User "${currentUser.name}" disconnected from Voice Party: "${currentRoom.title}"`);
      setCurrentRoom(null);
      setIsRoomMinimized(false);
    }
  };

  const handleUpdateRoom = (name: string, title: string) => {
    if (currentRoom) {
      setCurrentRoom({
        ...currentRoom,
        title: name,
        description: title
      });
      addAdminLog(`Host updated active room details: "${name}" - "${title}"`);
    }
  };

  // Simulated timer for daily missions
  useEffect(() => {
    const interval = setInterval(() => {
      setDailyMissions(prev => {
        let voice = prev.voiceSeconds;
        let chat = prev.chatSeconds;
        
        if (currentRoom) {
          voice = Math.min(60, voice + 1);
        }
        
        // Randomly simulate typing in background
        if (Math.random() > 0.7) {
          chat = Math.min(45, chat + 1);
        }

        return {
          ...prev,
          voiceSeconds: voice,
          chatSeconds: chat
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRoom]);

  const unreadDMsCount = dmMessages.filter(
    m => m.recipientId === currentUser.id && m.read !== true
  ).length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col antialiased">
      
      {/* HEADER BAR */}
      <header className="bg-slate-950 border-b border-slate-800 h-16 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wide text-white flex items-center gap-1.5 font-mono">
              VocoLive <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-bold px-1.5 py-0.5 rounded tracking-normal uppercase font-sans">v1.2 Beta</span>
            </span>
          </div>
        </div>

        {/* TOP CURRENCIES & USER QUICK PREVIEW */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden sm:flex items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-mono text-xs">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-amber-400 font-bold">{currentUser.coins.toLocaleString()}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-mono text-xs">
              <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
              <span className="text-pink-400 font-bold">{currentUser.diamonds.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-3 md:pl-6">
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center text-sm overflow-hidden">
              <span className="font-bold">{currentUser.avatar}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-black text-white">{currentUser.name}</p>
              <p className="text-[9px] font-mono text-slate-500 uppercase flex items-center gap-1">
                Lv.{currentUser.level} • <span className="text-yellow-400">{currentUser.badge}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BODY CONTENT - LAYOUT SPLIT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (DESKTOP) */}
        <nav className="hidden lg:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-4 justify-between z-20">
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase font-bold px-3 block mb-3 font-mono tracking-wider">Main Arena Navigation</span>
            
            {[
              { id: 'discover', label: 'Streaming Discover', icon: Radio, desc: 'Live Voice Rooms list' },
              { id: 'chat', label: 'Message Hub', icon: MessageSquare, desc: 'Secure DMs & alerts', badge: unreadDMsCount || undefined },
              { id: 'profile', label: 'My VIP Profile', icon: UserCheck, desc: 'Badges & rewards' }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (currentRoom) {
                      setIsRoomMinimized(true);
                    }
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-left transition relative group cursor-pointer ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <p className="text-xs font-black tracking-wide">{tab.label}</p>
                    <p className={`text-[9px] font-mono mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>{tab.desc}</p>
                  </div>
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-500 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {isActive && !tab.badge && (
                    <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* SIDEBAR ADMIN PANEL TOGGLE */}
          <div className="border-t border-slate-800 pt-4 space-y-2.5">
            <button
              onClick={() => setShowAdminLogsPanel(!showAdminLogsPanel)}
              className="w-full flex items-center justify-between text-left text-slate-400 hover:text-white px-3 py-1.5 rounded text-[11px] font-mono"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" /> Live Audit Panel
              </span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${showAdminLogsPanel ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'}`}>
                {showAdminLogsPanel ? 'ON' : 'OFF'}
              </span>
            </button>
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 text-[10px] text-slate-500">
              <p className="font-bold text-slate-400 mb-1">Local Simulation Mode</p>
              <p className="leading-relaxed">This prototype simulates fully integrated backend mechanisms without exposing production API keys.</p>
            </div>
          </div>
        </nav>

        {/* MAIN DISPLAY AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-900 flex flex-col relative pb-20 lg:pb-0">
          
          <AnimatePresence mode="wait">
            {(!currentRoom || isRoomMinimized) ? (
              // TAB VIEWS
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-6 lg:p-8 flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full"
              >
                
                {/* IN-APP ANNOUNCEMENT ROW */}
                <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 border border-indigo-500/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-24 bg-indigo-500/5 blur-[40px] pointer-events-none rounded-full" />
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xl">
                      📢
                    </span>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wide">VocoLive Live Broadcast Platform</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Agora voice latency optimizer configured at 180ms. Stream securely on Pakistan node.</p>
                    </div>
                  </div>
                  
                  {/* Currency counter for mobile screens */}
                  <div className="sm:hidden flex items-center gap-2 mt-1">
                    <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1 font-mono text-[10px]">
                      <Coins className="w-3 h-3 text-amber-500" />
                      <span className="text-amber-400 font-bold">{currentUser.coins.toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 px-3 py-1 rounded-full flex items-center gap-1 font-mono text-[10px]">
                      <Sparkles className="w-3 h-3 text-pink-500 animate-pulse" />
                      <span className="text-pink-400 font-bold">{currentUser.diamonds.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* ACTIVE TAB RENDERER */}
                {activeTab === 'discover' && (
                  <Dashboard 
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    onJoinRoom={handleJoinRoom}
                    addAdminLog={addAdminLog}
                    mockUsers={mockUsers}
                  />
                )}

                {(activeTab === 'profile' || activeTab === 'chat') && (
                  <ProfileHub 
                    currentUser={currentUser}
                    setCurrentUser={setCurrentUser}
                    proposals={proposals}
                    setProposals={setProposals}
                    dmMessages={dmMessages}
                    setDmMessages={setDmMessages}
                    systemNotifications={systemNotifications}
                    setSystemNotifications={setSystemNotifications}
                    transactions={transactionLogs}
                    setTransactions={setTransactionLogs}
                    securityLogs={securityLogs}
                    setSecurityLogs={setSecurityLogs}
                    addAdminLog={addAdminLog}
                    mockUsers={mockUsers}
                    setMockUsers={setMockUsers}
                    onCoinsTransferred={handleCoinsTransferred}
                    adminLogs={adminLogs}
                    clearLogs={clearLogs}
                    banUser={banUser}
                    bannedUsers={bannedUsers}
                    initialTab={activeTab === 'chat' ? 'chat' : undefined}
                  />
                )}

              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Voice Room container (Single-instance keeps mounted to prevent audio drops) */}
          {currentRoom && (
            <div className={isRoomMinimized ? 'pointer-events-none opacity-0 h-0 w-0 overflow-hidden absolute' : 'flex-1 flex flex-col min-h-[calc(100vh-4rem)] lg:min-h-0'}>
              <div className="bg-slate-950/60 border-b border-slate-800 py-2.5 px-4 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Active Audio Session:</span>
                  <strong className="text-yellow-400">{currentRoom.title}</strong>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setIsRoomMinimized(true)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" /> Minimize Room
                  </button>
                  <button
                    onClick={handleLeaveRoom}
                    className="text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Exit Room <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <VoiceRoom 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                roomId={currentRoom.id}
                roomTitle={currentRoom.title}
                roomCategory={currentRoom.category}
                onLeave={handleLeaveRoom}
                onMinimize={() => setIsRoomMinimized(true)}
                addAdminLog={addAdminLog}
                onUpdateRoom={handleUpdateRoom}
                onMessageSent={() => addAdminLog(`Message typed in Voice Room Room Chat Feed`)}
              />
            </div>
          )}

          {/* Minimised Round Circle Floating Indicator (Gole niche show hojaye) */}
          {currentRoom && isRoomMinimized && (
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center gap-2"
            >
              <div 
                onClick={() => setIsRoomMinimized(false)}
                className="cursor-pointer bg-gradient-to-tr from-purple-600 via-indigo-600 to-indigo-700 text-white rounded-full p-4 shadow-2xl shadow-indigo-500/30 border border-white/20 flex items-center justify-center relative group w-14 h-14 animate-pulse"
                title={`Click to maximize: ${currentRoom.title}`}
              >
                {/* Pulsing ring */}
                <span className="absolute -inset-1 rounded-full bg-indigo-500/30 animate-ping opacity-75" />
                
                {/* Animated Equalizer Waves */}
                <div className="absolute -top-1 -right-1 flex gap-0.5 items-end bg-slate-950 border border-indigo-500/40 px-1 py-0.5 rounded-full text-[8px] scale-90">
                  <span className="w-0.5 h-2.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-0.5 h-3.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                  <span className="w-0.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>

                {/* Room Host/Category Emoji */}
                <span className="text-xl relative z-10 select-none">
                  {currentRoom.category === 'Music' ? '🎵' : currentRoom.category === 'Gaming' ? '🎮' : '💬'}
                </span>

                {/* Tooltip / Title on hover */}
                <div className="absolute right-16 bg-slate-950/95 border border-slate-800 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none shadow-xl flex items-center gap-1.5 font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>{currentRoom.title}</span>
                </div>
              </div>

              {/* Close button to Exit room directly */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeaveRoom();
                }}
                className="bg-slate-900 hover:bg-rose-600 text-slate-400 hover:text-white rounded-full p-1.5 border border-slate-800 shadow-lg transition active:scale-90"
                title="Exit Active Room"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}
        </main>

        {/* SIDE LIVE AUDIT LOGS BAR PANEL (DESKTOP) */}
        {showAdminLogsPanel && (!currentRoom || isRoomMinimized) && (
          <aside className="hidden xl:flex flex-col w-80 bg-slate-950 border-l border-slate-800 p-4 justify-between z-10">
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3 mb-3">
                <span className="text-[10px] text-slate-500 uppercase font-black font-mono tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-4.5 h-4.5 text-indigo-400" /> Live Simulated System Logs
                </span>
                <button 
                  onClick={clearLogs}
                  className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 px-2 py-1 rounded hover:text-white transition cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 font-mono text-[10px] pr-1 scrollbar-thin">
                {adminLogs.length === 0 ? (
                  <p className="text-slate-600 italic text-center pt-8">No simulated security logs recorded yet.</p>
                ) : (
                  adminLogs.map((log, index) => (
                    <div key={index} className="p-2 bg-slate-900 border border-slate-850 rounded-xl leading-relaxed text-slate-400 hover:text-slate-200 transition">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 mt-3 text-[10px] font-mono text-slate-500">
              <div className="flex justify-between">
                <span>Memory usage:</span>
                <span className="text-slate-400">42MB / 128MB</span>
              </div>
              <div className="flex justify-between mt-1.5">
                <span>RTC Server Connection:</span>
                <span className="text-emerald-400 font-bold">● Active 180ms</span>
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR (MOBILE VIEWS) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-950 border-t border-slate-800 flex justify-around items-center z-30 shadow-2xl backdrop-blur-md bg-opacity-95 px-2">
        {[
          { id: 'discover', label: 'Arena', icon: Radio },
          { id: 'chat', label: 'Chat', icon: MessageSquare, badge: unreadDMsCount || undefined },
          { id: 'profile', label: 'Profile', icon: UserCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && (!currentRoom || isRoomMinimized);
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (currentRoom) {
                  setIsRoomMinimized(true);
                }
              }}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-center transition cursor-pointer relative ${
                isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white font-mono text-[8px] font-bold px-1.5 py-0.2 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">{tab.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}
