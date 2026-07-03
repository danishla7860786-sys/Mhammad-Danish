import React, { useState, useRef, useEffect } from 'react';
import { 
  User as UserIcon, Camera, Edit, Coins, Wallet, History as HistoryIcon, 
  Users, Sparkles, Shield, Settings, LogOut, X, ArrowLeft, ArrowUpRight, 
  Check, Activity, Globe, Smartphone, Bell, Landmark, FileText, CheckCircle2, ChevronRight, MessageSquare,
  Award, Trophy, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Proposal } from '../types';
import AgencyPortal from './AgencyPortal';

interface MainProfileCenterProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  proposals: Proposal[];
  setProposals: React.Dispatch<React.SetStateAction<Proposal[]>>;
  securityLogs: any[];
  setSecurityLogs: React.Dispatch<React.SetStateAction<any[]>>;
  transactionLogs: any[];
  setTransactionLogs: React.Dispatch<React.SetStateAction<any[]>>;
  addAdminLog: (log: string) => void;
  onClose?: () => void;
  isEmbedded?: boolean;
  dailyMissions: {
    voiceSeconds: number;
    chatSeconds: number;
    voiceClaimed: boolean;
    chatClaimed: boolean;
  };
  setDailyMissions: React.Dispatch<React.SetStateAction<{
    voiceSeconds: number;
    chatSeconds: number;
    voiceClaimed: boolean;
    chatClaimed: boolean;
  }>>;
  currentRoom?: any;
  setActiveTab?: (tab: string) => void;
}

export default function MainProfileCenter({
  currentUser,
  setCurrentUser,
  proposals,
  setProposals,
  securityLogs,
  setSecurityLogs,
  transactionLogs,
  setTransactionLogs,
  addAdminLog,
  onClose,
  isEmbedded = false,
  dailyMissions,
  setDailyMissions,
  currentRoom,
  setActiveTab
}: MainProfileCenterProps) {
  // In-line Edit States
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [nameInput, setNameInput] = useState(currentUser.name);
  const [bioInput, setBioInput] = useState(currentUser.bio || '');

  // File Uploader Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Proposal Submission States
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalCategory, setProposalCategory] = useState('Sufi Singer');
  const [proposalExperience, setProposalExperience] = useState('');
  const [proposalSocialLinks, setProposalSocialLinks] = useState('');
  const [proposalIntroLink, setProposalIntroLink] = useState('');

  // Settings states
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [streamQuality, setStreamQuality] = useState<'Standard' | 'High-Fidelity HD'>('High-Fidelity HD');
  const [language, setLanguage] = useState<'English' | 'Urdu (اردو)'>('English');

  // Interactive RBAC and Sub-view routing states
  const [activeSubView, setActiveSubView] = useState<'main' | 'super-manager' | 'manager' | 'wallet' | 'agency' | 'unauthorized'>('main');
  const [selectedRole, setSelectedRole] = useState<'Super Manager' | 'Manager' | 'Agency' | 'Coin Seller' | 'Reseller' | 'Standard User'>('Super Manager');
  const [transferReceiverId, setTransferReceiverId] = useState('1001');
  const [transferAmountInput, setTransferAmountInput] = useState('');
  const [activeUsersCount, setActiveUsersCount] = useState(1240);
  const [agencyEarnings, setAgencyEarnings] = useState(1450);
  const [globalMultiplier, setGlobalMultiplier] = useState('1.5x');

  // Sync internal inputs when currentUser changes
  useEffect(() => {
    setNameInput(currentUser.name);
    setBioInput(currentUser.bio || '');
  }, [currentUser]);

  // Handle Photo Upload (Base64 conversion)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCurrentUser({
          ...currentUser,
          avatar: base64String
        });
        
        // Add security log
        const newLog = {
          id: 'sec_' + Date.now(),
          event: 'Profile Photo (DP) updated',
          ip: '39.34.120.45',
          location: 'Lahore, Pakistan',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: 'Success'
        };
        setSecurityLogs(prev => [newLog, ...prev]);
        addAdminLog(`User updated profile picture via local gallery upload.`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Inline Edits
  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    setCurrentUser({ ...currentUser, name: nameInput });
    setIsEditingName(false);
    addAdminLog(`User changed display name to: "${nameInput}"`);
    
    setSecurityLogs(prev => [
      {
        id: 'sec_' + Date.now(),
        event: `Name changed to "${nameInput}"`,
        ip: '39.34.120.45',
        location: 'Lahore, Pakistan',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Secure'
      },
      ...prev
    ]);
  };

  const handleSaveBio = () => {
    setCurrentUser({ ...currentUser, bio: bioInput });
    setIsEditingBio(false);
    addAdminLog(`User changed bio status to: "${bioInput}"`);
    
    setSecurityLogs(prev => [
      {
        id: 'sec_' + Date.now(),
        event: `Bio status updated`,
        ip: '39.34.120.45',
        location: 'Lahore, Pakistan',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Secure'
      },
      ...prev
    ]);
  };

  // Submit Talent Proposal
  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalExperience.trim() || !proposalSocialLinks.trim()) {
      alert('Please fill in your stream experience and social profile links!');
      return;
    }

    const newProposal: Proposal = {
      id: 'prop_' + Date.now(),
      applicantName: currentUser.name,
      category: proposalCategory,
      experience: proposalExperience,
      socialLinks: proposalSocialLinks,
      introLink: proposalIntroLink || 'https://vocolive.io/demo/artist.mp3',
      status: 'Pending',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setProposals(prev => [newProposal, ...prev]);
    addAdminLog(`New talent proposal submitted for category: ${proposalCategory}`);
    
    // Clear form and close
    setProposalExperience('');
    setProposalSocialLinks('');
    setProposalIntroLink('');
    setShowProposalForm(false);
    alert('🎉 Your stream hosting proposal has been submitted to VocoLive Board!');
  };

  // Check if current user already has a pending or approved proposal
  const myProposal = proposals.find(p => p.applicantName === currentUser.name || p.applicantName.includes('Danish'));

  // Avatar helper
  const isImageAvatar = currentUser.avatar.startsWith('data:image') || currentUser.avatar.startsWith('http') || currentUser.avatar.startsWith('/');

  return (
    <div className={isEmbedded 
      ? "w-full max-w-2xl mx-auto bg-[#0a0b17]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl flex flex-col h-full overflow-hidden font-sans relative"
      : "absolute inset-y-0 right-0 w-full md:w-[500px] bg-[#0c0d1b] border-l border-white/10 shadow-2xl z-50 flex flex-col h-full overflow-hidden font-sans"
    }>
      
      {/* Background visual atmosphere */}
      <div className="absolute top-0 right-0 w-[80%] h-[30%] bg-purple-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[80%] h-[30%] bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Header Bar */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md relative z-10">
        {activeSubView === 'main' ? (
          isEmbedded ? (
            <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-400 tracking-wider font-sans">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>Security & Roles Hub</span>
            </div>
          ) : (
            <button 
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Live Room</span>
            </button>
          )
        ) : (
          <button 
            onClick={() => setActiveSubView('main')}
            className="flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer animate-pulse"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>⬅️ Back to Profile</span>
          </button>
        )}
        <span className="text-xs font-black uppercase tracking-widest text-indigo-400 font-mono">
          {activeSubView === 'main' ? 'Main Profile Center' : `${activeSubView.replace('-', ' ')}`}
        </span>
        {!isEmbedded && (
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
            title="Close Profile Center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 relative z-10 scrollbar-none pb-24">
        {activeSubView === 'main' ? (
          <>
        
        {/* ================= SECTION 1: IDENTITY EDIT ================= */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl relative overflow-hidden" id="identity-section">
          <div className="absolute top-0 right-0 bg-purple-500/10 px-3 py-1 rounded-bl-xl border-l border-b border-purple-500/20">
            <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-wider">Identity Edit</span>
          </div>

          <div className="flex flex-col items-center text-center space-y-3.5 pt-2">
            {/* DP Avatar Frame Container */}
            <div className="relative group cursor-pointer">
              <div className={`w-24 h-24 rounded-full overflow-hidden flex items-center justify-center border-4 relative transition-all duration-300 group-hover:brightness-90 ${currentUser.frame || 'border-purple-500'} bg-[#15162a]`}>
                {isImageAvatar ? (
                  <img 
                    src={currentUser.avatar} 
                    alt="Uploaded Avatar" 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-5xl">{currentUser.avatar}</span>
                )}
              </div>
              
              {/* DP Change Button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-full border border-purple-400 hover:scale-105 active:scale-95 transition shadow-lg shadow-purple-600/30"
                title="Upload Photo from Gallery"
              >
                <Camera className="w-4 h-4" />
              </button>
              
              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Alternative DP Selection Emojis */}
            <div className="w-full space-y-1 bg-black/20 p-2.5 rounded-xl border border-white/5">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Or Quick Select Emoji Avatar:</span>
              <div className="flex justify-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {['🤵', '👑', '🦁', '🥷', '🦄', '👸', '⚡', '🔥', '🎤'].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setCurrentUser({ ...currentUser, avatar: emoji });
                      addAdminLog(`Profile avatar changed to emoji: ${emoji}`);
                    }}
                    className={`w-8 h-8 rounded-lg bg-black/40 text-sm flex items-center justify-center transition hover:scale-110 border ${
                      currentUser.avatar === emoji ? 'border-purple-500 bg-purple-500/20' : 'border-white/5'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Click Name and Bio Edit */}
            <div className="w-full space-y-3.5 text-left">
              {/* Name Edit */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Display Username</span>
                {isEditingName ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="flex-1 bg-black/60 border border-purple-500/30 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleSaveName}
                      className="px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white hover:border-white/20 transition cursor-pointer group"
                  >
                    <span className="font-extrabold">{currentUser.name}</span>
                    <Edit className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition" />
                  </div>
                )}
              </div>

              {/* Bio Status Edit */}
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Status / Bio Quote</span>
                {isEditingBio ? (
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="flex-1 bg-black/60 border border-purple-500/30 text-white rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-none"
                    />
                    <button 
                      onClick={handleSaveBio}
                      className="px-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingBio(true)}
                    className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 hover:border-white/20 transition cursor-pointer group italic"
                  >
                    <span className="truncate">"{currentUser.bio || 'Enter short professional bio...'}"</span>
                    <Edit className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 1.5: DAILY MISSIONS & TASKS ================= */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl" id="tasks-section">
          <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400 animate-pulse" />
              <div>
                <h3 className="text-xs font-black uppercase text-white tracking-wide">Daily Missions</h3>
                <p className="text-[9px] text-indigo-400 font-mono font-bold">Earn Free Coins by Staying Active!</p>
              </div>
            </div>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-400/10 uppercase tracking-wider font-mono">
              Resets Daily
            </span>
          </div>

          <div className="space-y-4">
            {/* Task 1: Voice Room active stay */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Voice Room Active Listener
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Stay connected inside any Voice Room for at least 30 minutes.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 font-mono">
                  +300 🪙
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-indigo-400 font-bold">
                    {Math.floor((dailyMissions?.voiceSeconds || 0) / 60)} / 30 mins
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((dailyMissions?.voiceSeconds || 0) / 1800) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                <div className="flex gap-2">
                  {currentRoom ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Connected to room (Ticking...)
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        if (setActiveTab) setActiveTab('room');
                        if (onClose) onClose();
                      }}
                      className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 hover:border-indigo-500 rounded-xl text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      🎙️ Join a Room
                    </button>
                  )}

                  {/* Dev Simulation Button */}
                  <button
                    onClick={() => {
                      if (setDailyMissions) {
                        setDailyMissions(prev => ({
                          ...prev,
                          voiceSeconds: Math.min((prev.voiceSeconds || 0) + 300, 1800)
                        }));
                      }
                      addAdminLog("Developer Action: Simulated +5 mins of Voice Room connection.");
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 rounded-xl text-[9px] font-mono transition active:scale-95 cursor-pointer"
                    title="Simulate adding 5 minutes of active connection"
                  >
                    ⏩ Simulate +5 Mins
                  </button>
                </div>

                {/* Claim Button */}
                {dailyMissions?.voiceClaimed ? (
                  <button disabled className="px-3 py-1 bg-white/5 text-slate-500 border border-white/5 rounded-xl text-[10px] font-bold">
                    Claimed ✅
                  </button>
                ) : (
                  <button
                    disabled={(dailyMissions?.voiceSeconds || 0) < 1800}
                    onClick={() => {
                      // Claim Reward!
                      setCurrentUser({
                        ...currentUser,
                        coins: currentUser.coins + 300
                      });
                      if (setDailyMissions) {
                        setDailyMissions(prev => ({
                          ...prev,
                          voiceClaimed: true
                        }));
                      }
                      addAdminLog(`Claimed 300 Coins reward for Voice Room stay mission!`);
                      
                      // Inject a beautiful system transaction
                      const newTx = {
                        id: 'tx_mission_' + Date.now(),
                        type: 'Mission Reward',
                        description: 'Completed Voice Room Stay Task',
                        amount: '300 Coins',
                        flow: 'in',
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                      };
                      setTransactionLogs(prev => [newTx, ...prev]);
                    }}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition active:scale-95 cursor-pointer ${
                      (dailyMissions?.voiceSeconds || 0) >= 1800
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    Claim 300 🪙
                  </button>
                )}
              </div>
            </div>

            {/* Task 2: Active chat sending */}
            <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
                    Active Conversation Speaker
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Send messages in rooms or 1-on-1 DMs to stay active for at least 30 minutes.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-amber-400 font-mono">
                  +300 🪙
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400">Progress:</span>
                  <span className="text-pink-400 font-bold">
                    {Math.floor((dailyMissions?.chatSeconds || 0) / 60)} / 30 mins
                  </span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden border border-white/5">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(((dailyMissions?.chatSeconds || 0) / 1800) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (setActiveTab) setActiveTab('chat');
                      if (onClose) onClose();
                    }}
                    className="px-3 py-1 bg-pink-600/20 hover:bg-pink-600 text-pink-300 hover:text-white border border-pink-500/20 hover:border-pink-500 rounded-xl text-[10px] font-bold transition active:scale-95 cursor-pointer flex items-center gap-1"
                  >
                    💬 Open Chat
                  </button>

                  {/* Dev Simulation Button */}
                  <button
                    onClick={() => {
                      if (setDailyMissions) {
                        setDailyMissions(prev => ({
                          ...prev,
                          chatSeconds: Math.min((prev.chatSeconds || 0) + 300, 1800)
                        }));
                      }
                      addAdminLog("Developer Action: Simulated +5 mins of Active Messaging.");
                    }}
                    className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 rounded-xl text-[9px] font-mono transition active:scale-95 cursor-pointer"
                    title="Simulate adding 5 minutes of chat activity"
                  >
                    ⏩ Simulate +5 Mins
                  </button>
                </div>

                {/* Claim Button */}
                {dailyMissions?.chatClaimed ? (
                  <button disabled className="px-3 py-1 bg-white/5 text-slate-500 border border-white/5 rounded-xl text-[10px] font-bold">
                    Claimed ✅
                  </button>
                ) : (
                  <button
                    disabled={(dailyMissions?.chatSeconds || 0) < 1800}
                    onClick={() => {
                      // Claim Reward!
                      setCurrentUser({
                        ...currentUser,
                        coins: currentUser.coins + 300
                      });
                      if (setDailyMissions) {
                        setDailyMissions(prev => ({
                          ...prev,
                          chatClaimed: true
                        }));
                      }
                      addAdminLog(`Claimed 300 Coins reward for Active Messaging mission!`);
                      
                      // Inject a beautiful system transaction
                      const newTx = {
                        id: 'tx_mission_chat_' + Date.now(),
                        type: 'Mission Reward',
                        description: 'Completed Active Messaging Task',
                        amount: '300 Coins',
                        flow: 'in',
                        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                      };
                      setTransactionLogs(prev => [newTx, ...prev]);
                    }}
                    className={`px-3 py-1 rounded-xl text-[10px] font-black transition active:scale-95 cursor-pointer ${
                      (dailyMissions?.chatSeconds || 0) >= 1800
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                        : "bg-white/5 text-slate-500 border border-white/5 cursor-not-allowed"
                    }`}
                  >
                    Claim 300 🪙
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 2: WALLET & EARNINGS ================= */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl" id="wallet-section">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Wallet className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wide">My Wallet & Coin Balances</h3>
              <p className="text-[9px] text-slate-400 font-mono">Simulate coin purchasing and gifting logs</p>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-pink-900/20 border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-32 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] text-[100px] opacity-10 pointer-events-none select-none">🪙</div>
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 font-mono">Voco Wallet Standard</span>
              <span className="text-[11px] bg-indigo-500/20 text-indigo-300 font-extrabold px-2 py-0.5 rounded border border-indigo-400/20 uppercase tracking-wider">Level {currentUser.level}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
              <div>
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Total Gold Coins</span>
                <div className="flex items-center gap-1 font-mono text-xl font-black text-amber-400">
                  <span>🪙</span>
                  <span>{currentUser.coins.toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <span className="text-[9px] text-slate-400 font-mono block uppercase">Beans (Diamonds)</span>
                <div className="flex items-center gap-1 font-mono text-xl font-black text-purple-400">
                  <span>💎</span>
                  <span>{currentUser.diamonds.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Coins Recharge Pack Simulation */}
          <div className="bg-black/30 border border-white/5 p-3.5 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-300 uppercase font-mono">Quick Sim Recharge:</span>
              <span className="text-[8px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">20% Bonus Active</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { label: '500 Coins', coins: 500, price: 'PKR 150' },
                { label: '2,000 Coins', coins: 2000, price: 'PKR 500' },
                { label: '10,000 Coins', coins: 10000, price: 'PKR 2,000' },
                { label: '50,000 Coins', coins: 50000, price: 'PKR 8,500' }
              ].map((pack) => (
                <button
                  key={pack.coins}
                  onClick={() => {
                    setCurrentUser({ ...currentUser, coins: currentUser.coins + pack.coins });
                    const newTx = {
                      id: 'tx_sim_' + Date.now(),
                      type: 'Recharge',
                      description: `Purchased ${pack.label} via Local Wallet`,
                      amount: `+${pack.coins.toLocaleString()} Coins`,
                      flow: 'in',
                      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
                    };
                    setTransactionLogs(prev => [newTx, ...prev]);
                    addAdminLog(`Wallet recharge success: +${pack.coins} Coins simulated.`);
                    alert(`🪙 ${pack.coins.toLocaleString()} Coins recharged successfully!`);
                  }}
                  className="bg-black/40 border border-white/5 hover:border-yellow-500/40 p-2.5 rounded-xl text-left transition active:scale-95 cursor-pointer hover:bg-yellow-500/5 group"
                >
                  <p className="font-extrabold text-white group-hover:text-amber-400 transition">+{pack.coins.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-400">{pack.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1">
                <HistoryIcon className="w-3.5 h-3.5 text-indigo-400" /> Transaction History
              </span>
              <span className="text-[9px] text-slate-500 font-mono">Latest 4 Logs</span>
            </div>

            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {transactionLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-black/20 border border-white/5 rounded-xl p-2.5 text-[10px] font-mono flex justify-between items-center">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white leading-none">{log.description}</p>
                    <p className="text-[8px] text-slate-500">{log.timestamp} • {log.type}</p>
                  </div>
                  <span className={`font-black ${log.flow === 'in' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {log.amount}
                  </span>
                </div>
              ))}
              {transactionLogs.length === 0 && (
                <p className="text-[10px] text-slate-500 italic text-center py-4">No transactions logged yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: PROFESSIONAL HUB ================= */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl" id="professional-hub">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Users className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wide">Professional Hub & Agency</h3>
              <p className="text-[9px] text-slate-400 font-mono">Streamer certification and master agency metrics</p>
            </div>
          </div>

          {/* Agency Portal Panel */}
          <div className="bg-black/30 border border-indigo-500/15 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-10px] text-6xl opacity-5 pointer-events-none">🏢</div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-extrabold uppercase">Verified Agency</span>
                <h4 className="text-xs font-black text-white uppercase mt-1">Voco Master Pak Agency (ID: 99331)</h4>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center font-mono text-[10px] border-t border-white/5 pt-3">
              <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                <span className="text-slate-500 block text-[8px] font-bold">Hosts</span>
                <span className="text-white font-black">3 Verified</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                <span className="text-slate-500 block text-[8px] font-bold">Revenue</span>
                <span className="text-purple-400 font-black">45,000 💎</span>
              </div>
              <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
                <span className="text-slate-500 block text-[8px] font-bold">Active Days</span>
                <span className="text-indigo-400 font-black">18 Days</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 leading-relaxed font-sans bg-white/5 p-2.5 rounded-xl border border-white/5">
              🚀 <strong>Danish bhai</strong>, you are officially registered as the master agency partner. Your agency commission stands at <strong>12.5%</strong> of all hosts' diamonds conversions.
            </div>

            <button
              onClick={() => {
                const allowed = ['Super Manager', 'Agency'];
                if (allowed.includes(selectedRole)) {
                  setActiveSubView('agency');
                  addAdminLog(`RBAC Access GRANTED for Agency Portal from professional hub card`);
                } else {
                  setActiveSubView('unauthorized');
                  addAdminLog(`RBAC Access DENIED for Agency Portal (User is "${selectedRole}")`);
                }
              }}
              className="w-full py-2 bg-[#1b1c34] hover:bg-[#25274d] text-purple-300 font-black rounded-xl text-[10px] uppercase tracking-wider transition border border-purple-500/20 cursor-pointer flex items-center justify-center gap-1.5"
            >
              💼 Open Agency System & Cashouts
            </button>
          </div>

          {/* Submit Proposal for streamer registration */}
          <div className="bg-black/20 border border-white/5 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Apply to stream Live
                </h4>
                <p className="text-[9px] text-slate-400">Apply as an official vocalist or gaming host to receive gift cashouts</p>
              </div>
              
              <button
                type="button"
                onClick={() => setShowProposalForm(!showProposalForm)}
                className="py-1 px-3 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-extrabold rounded-lg text-[9px] uppercase tracking-wider transition cursor-pointer"
              >
                {showProposalForm ? 'Hide Form' : 'Submit Proposal'}
              </button>
            </div>

            {/* Current proposal status if any */}
            {myProposal && (
              <div className="bg-indigo-505/10 border border-indigo-500/20 p-2.5 rounded-xl text-[10px] font-mono flex justify-between items-center">
                <div className="space-y-0.5">
                  <p className="font-bold text-white">Your Category: {myProposal.category}</p>
                  <p className="text-[8px] text-slate-400">Submitted: {myProposal.timestamp}</p>
                </div>
                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  myProposal.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-300 animate-pulse'
                }`}>
                  {myProposal.status}
                </span>
              </div>
            )}

            <AnimatePresence>
              {showProposalForm && (
                <motion.form
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={handleSubmitProposal}
                  className="space-y-3.5 bg-black/40 border border-white/10 p-3.5 rounded-xl pt-3 text-xs overflow-hidden"
                >
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Stream Category</label>
                    <select
                      value={proposalCategory}
                      onChange={(e) => setProposalCategory(e.target.value)}
                      className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    >
                      <option value="Sufi Singer">🎤 Sufi Singer / Folk Vocalist</option>
                      <option value="Qawwali Host">🕌 Qawwali & Sufi Poetry Host</option>
                      <option value="Gaming DJ">🎧 Low Latency Audio DJ</option>
                      <option value="Urdu Poet">✍️ Urdu Poetry Ghazal Reader</option>
                      <option value="General Talk">💬 General Conversationalist</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Social Profile Link (Instagram/YouTube)</label>
                    <input
                      type="text"
                      placeholder="e.g. instagram.com/profile"
                      value={proposalSocialLinks}
                      onChange={(e) => setProposalSocialLinks(e.target.value)}
                      className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Portfolio Demo File Link (Drive/SoundCloud)</label>
                    <input
                      type="text"
                      placeholder="e.g. soundcloud.com/your-voice"
                      value={proposalIntroLink}
                      onChange={(e) => setProposalIntroLink(e.target.value)}
                      className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Previous Experience Description</label>
                    <textarea
                      rows={2}
                      placeholder="Describe your performing or broadcasting experience..."
                      value={proposalExperience}
                      onChange={(e) => setProposalExperience(e.target.value)}
                      className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-lg text-[9px] uppercase tracking-wider transition"
                  >
                    Submit Official Talent Proposal
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ================= SECTION 4: ROLE-BASED ACCESS CONTROL (RBAC) PORTALS ================= */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl" id="rbac-section">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wide">🛡️ Management & Security Roles (RBAC)</h3>
              <p className="text-[9px] text-slate-400 font-mono">Simulate multi-user role permissions on-the-fly</p>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="bg-gradient-to-r from-slate-900 via-[#111225] to-slate-900 border border-white/5 p-4 rounded-2xl text-center space-y-3 relative overflow-hidden">
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] font-mono font-bold text-indigo-300">
              ACTIVE SESSION
            </div>
            
            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-indigo-500/30 flex items-center justify-center text-xl mx-auto shadow-inner">
              🤵
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">{currentUser.name}</h4>
              <p className="text-[10px] font-mono text-purple-400 mt-0.5">Coins Stock: {currentUser.coins.toLocaleString()}</p>
            </div>

            {/* Simulated Active Role dropdown */}
            <div className="space-y-1.5 pt-1.5 border-t border-white/5">
              <label className="text-[8px] font-bold text-slate-500 uppercase font-mono block">Toggle Simulated Test Role:</label>
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value as any);
                  addAdminLog(`Simulated test role updated to: "${e.target.value}"`);
                }}
                className="w-full bg-[#0c0d1b] border border-indigo-500/30 text-xs text-indigo-300 rounded-xl px-3 py-2 text-center focus:ring-1 focus:ring-indigo-500 focus:outline-none font-bold uppercase cursor-pointer hover:border-indigo-400 transition"
              >
                <option value="Super Manager">👑 Super Manager (Admin / Owner)</option>
                <option value="Manager">👥 Manager (Assigned Agencies manager)</option>
                <option value="Coin Seller">💰 Coin Seller (Wholesale supply partner)</option>
                <option value="Reseller">💸 Reseller (Micro-payment supplier)</option>
                <option value="Agency">🏢 Agency (Talent guild leader)</option>
                <option value="Standard User">👤 Standard User (Basic viewer / gifter)</option>
              </select>
              <p className="text-[8px] text-slate-500 italic">Changing this role will immediately test the Protected Routes below!</p>
            </div>
          </div>

          {/* Management Menu Option list */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider">Management Menu:</span>
            
            {/* Option 1: Super Manager */}
            <button
              onClick={() => {
                const allowed = ['Super Manager'];
                if (allowed.includes(selectedRole)) {
                  setActiveSubView('super-manager');
                  addAdminLog(`RBAC Access GRANTED for Super Manager Portal`);
                } else {
                  setActiveSubView('unauthorized');
                  addAdminLog(`RBAC Access DENIED for Super Manager Portal (User is "${selectedRole}")`);
                }
              }}
              className="bg-[#131424] hover:bg-[#1b1c34] border border-white/5 hover:border-indigo-500/20 p-3 rounded-2xl text-left transition active:scale-95 cursor-pointer flex justify-between items-center group shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-white group-hover:text-indigo-400 transition block">⚙️ Super Manager Portal</span>
                <span className="text-[9px] text-slate-400 block font-mono">Required Role: Super Manager Only</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>

            {/* Option 2: Manager */}
            <button
              onClick={() => {
                const allowed = ['Super Manager', 'Manager'];
                if (allowed.includes(selectedRole)) {
                  setActiveSubView('manager');
                  addAdminLog(`RBAC Access GRANTED for Manager Dashboard`);
                } else {
                  setActiveSubView('unauthorized');
                  addAdminLog(`RBAC Access DENIED for Manager Dashboard (User is "${selectedRole}")`);
                }
              }}
              className="bg-[#131424] hover:bg-[#1b1c34] border border-white/5 hover:border-indigo-500/20 p-3 rounded-2xl text-left transition active:scale-95 cursor-pointer flex justify-between items-center group shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-white group-hover:text-indigo-400 transition block">👥 Manager Dashboard</span>
                <span className="text-[9px] text-slate-400 block font-mono">Allowed: Super Manager, Manager</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>

            {/* Option 3: Coin Seller / Reseller */}
            <button
              onClick={() => {
                const allowed = ['Super Manager', 'Coin Seller', 'Reseller'];
                if (allowed.includes(selectedRole)) {
                  setActiveSubView('wallet');
                  addAdminLog(`RBAC Access GRANTED for Coin Seller Market`);
                } else {
                  setActiveSubView('unauthorized');
                  addAdminLog(`RBAC Access DENIED for Coin Seller Market (User is "${selectedRole}")`);
                }
              }}
              className="bg-[#131424] hover:bg-[#1b1c34] border border-white/5 hover:border-indigo-500/20 p-3 rounded-2xl text-left transition active:scale-95 cursor-pointer flex justify-between items-center group shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-white group-hover:text-indigo-400 transition block">💰 Coin Seller & Reseller Market</span>
                <span className="text-[9px] text-slate-400 block font-mono">Allowed: Super Manager, Coin Seller, Reseller</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>

            {/* Option 4: Agency */}
            <button
              onClick={() => {
                const allowed = ['Super Manager', 'Agency'];
                if (allowed.includes(selectedRole)) {
                  setActiveSubView('agency');
                  addAdminLog(`RBAC Access GRANTED for Agency Portal`);
                } else {
                  setActiveSubView('unauthorized');
                  addAdminLog(`RBAC Access DENIED for Agency Portal (User is "${selectedRole}")`);
                }
              }}
              className="bg-[#131424] hover:bg-[#1b1c34] border border-white/5 hover:border-indigo-500/20 p-3 rounded-2xl text-left transition active:scale-95 cursor-pointer flex justify-between items-center group shadow-md"
            >
              <div className="space-y-1">
                <span className="text-xs font-black text-white group-hover:text-indigo-400 transition block">🏢 Agency Management</span>
                <span className="text-[9px] text-slate-400 block font-mono">Allowed: Super Manager, Agency</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition" />
            </button>
          </div>
        </section>
      </>
      ) : activeSubView === 'super-manager' ? (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <span className="text-2xl">👑</span>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Super Manager Panel</h2>
              <p className="text-[10px] text-slate-400">Welcome to the highest authority dashboard.</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
            Welcome to the highest authority dashboard. Here you can control the entire app settings and manage all Lower Managers.
          </p>

          {/* Glowing System Logs box */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-4 rounded-2xl flex items-center justify-between font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              System Logs & Server Health:
            </span>
            <span className="text-emerald-300 font-black uppercase">Online</span>
          </div>

          {/* Interactive System Controls */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Global Parameters Control:</h3>
            
            <div className="space-y-2">
              <label className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Global Coin Transfer Multiplier</label>
              <div className="grid grid-cols-4 gap-2">
                {['1.0x', '1.2x', '1.5x', '2.0x'].map((mult) => (
                  <button
                    key={mult}
                    onClick={() => {
                      setGlobalMultiplier(mult);
                      addAdminLog(`Super Manager updated global coin rate multiplier to ${mult}`);
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                      globalMultiplier === mult 
                        ? 'bg-purple-600 border border-purple-400 text-white' 
                        : 'bg-black/40 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mult}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 space-y-3">
              <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block">Server Cache Actions</span>
              <button
                type="button"
                onClick={() => {
                  addAdminLog(`Super Manager requested global CDN and memory cache purging.`);
                  alert('⚡ Cache purged successfully across all Pakistan-1 and Pakistan-2 Edge locations!');
                }}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition duration-300 shadow-md active:scale-98 cursor-pointer"
              >
                ⚡ Flush Server Caches
              </button>
            </div>
          </div>
        </div>
      ) : activeSubView === 'manager' ? (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Manager Dashboard</h2>
              <p className="text-[10px] text-slate-400">Manage assigned agencies and monitor reports</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/5">
            Manage your assigned agencies, track resellers, and monitor user reports.
          </p>

          {/* Glowing System Logs box */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold p-4 rounded-2xl flex justify-between items-center font-mono">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              Total Active Users Today:
            </span>
            <span className="text-indigo-300 font-black">{activeUsersCount.toLocaleString()} Users</span>
          </div>

          {/* Interactive Manager Controls */}
          <div className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Community Reports Queue:</h3>
              <button
                onClick={() => {
                  setActiveUsersCount(prev => prev + Math.floor(Math.random() * 80 + 30));
                  addAdminLog(`Manager triggered live metrics peak traffic recount.`);
                }}
                className="text-[8px] bg-white/5 hover:bg-white/10 text-indigo-300 font-bold px-2 py-1 rounded uppercase tracking-wider border border-white/5 cursor-pointer"
              >
                🔄 Recount Peak
              </button>
            </div>

            <div className="space-y-2 text-[10px] font-mono">
              <div className="bg-black/40 border border-white/5 p-3 rounded-xl space-y-1.5">
                <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                  <span>REPORT #812</span>
                  <span className="text-rose-400 font-extrabold">URGENT</span>
                </div>
                <p className="text-white font-semibold">User 'toxic_troll_99' reported for Roman Urdu abuse in Sufi Beats room.</p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      alert('Device toxic_troll_99 is now permanently banned!');
                      addAdminLog(`Manager banned device toxic_troll_99 for Roman Urdu abuse.`);
                    }}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-3 py-1 rounded text-[9px] uppercase tracking-wider transition cursor-pointer"
                  >
                    🚫 Ban Device
                  </button>
                  <button
                    onClick={() => alert('Report dismissed.')}
                    className="bg-white/5 hover:bg-white/10 text-slate-400 font-extrabold px-3 py-1 rounded text-[9px] uppercase tracking-wider transition border border-white/5 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeSubView === 'wallet' ? (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <span className="text-2xl">💰</span>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-wider">Coin Market Panel</h2>
              <p className="text-[10px] text-slate-400">Receive coins, manage reseller listings, and transfer bulk stocks.</p>
            </div>
          </div>

          {/* Current stock box */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-4 rounded-2xl flex justify-between items-center font-mono">
            <span className="flex items-center gap-2">
              🪙 Your Current Stock:
            </span>
            <span className="text-yellow-400 font-black text-sm">{currentUser.coins.toLocaleString()} Coins</span>
          </div>

          {/* Coin Transfer Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const amount = parseInt(transferAmountInput);
              if (!transferReceiverId || isNaN(amount) || amount <= 0) {
                alert('Please enter valid Receiver ID and transfer amount!');
                return;
              }
              if (currentUser.coins < amount) {
                alert('Insufficient coin stock for this transfer!');
                return;
              }

              // Execute transfer
              setCurrentUser({ ...currentUser, coins: currentUser.coins - amount });
              
              const newTx = {
                id: 'tx_transfer_' + Date.now(),
                type: 'Transfer Out',
                description: `Bulk Coins Transfer to ID: ${transferReceiverId}`,
                amount: `-${amount.toLocaleString()} Coins`,
                flow: 'out',
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
              };
              setTransactionLogs(prev => [newTx, ...prev]);
              addAdminLog(`Coin Seller transferred ${amount} coins successfully to ID ${transferReceiverId}.`);
              
              alert(`💰 ${amount.toLocaleString()} Coins successfully sent to ID: ${transferReceiverId}!`);
              setTransferAmountInput('');
            }}
            className="bg-black/30 border border-white/5 rounded-2xl p-4 space-y-4"
          >
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Transfer Bulk Coins</h3>
            
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Select Receiver ID</label>
              <select
                value={transferReceiverId}
                onChange={(e) => setTransferReceiverId(e.target.value)}
                className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="1001">ID: 1001 - Kamran Singer (Host)</option>
                <option value="1002">ID: 1002 - Aisha Malik (Host)</option>
                <option value="1003">ID: 1003 - Zain Ghouri (Host)</option>
                <option value="1004">ID: 1004 - Sarah (User)</option>
                <option value="8888">ID: 8888 - Sufi Beats Room Wallet</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-bold text-slate-400 uppercase font-mono">Coin Amount</label>
              <input
                type="number"
                placeholder="e.g. 5000"
                value={transferAmountInput}
                onChange={(e) => setTransferAmountInput(e.target.value)}
                className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition duration-300 active:scale-98 shadow-md cursor-pointer"
            >
              Send Coins Now 💰
            </button>
          </form>
        </div>
      ) : activeSubView === 'agency' ? (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏢</span>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Agency Portal</h2>
                <p className="text-[10px] text-slate-400 font-mono">Manage hosts & approve cashouts</p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubView('main')}
              className="text-[10px] bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded border border-white/10 text-indigo-400 hover:text-indigo-300 font-mono transition"
            >
              Back to Hub
            </button>
          </div>
          
          <AgencyPortal 
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            addAdminLog={addAdminLog}
          />
        </div>
      ) : (
        <div className="space-y-6 text-center py-8 animate-fade-in animate-pulse">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-4xl mx-auto shadow-lg shadow-rose-500/5">
            🚫
          </div>
          
          <div className="space-y-2">
            <h2 className="text-base font-black text-rose-500 uppercase tracking-widest font-sans">Access Denied</h2>
            <p className="text-xs text-slate-300 leading-relaxed font-mono px-4">
              Aapke paas is page ko dekhne ki permission nahi hai (Role Unauthorized).
            </p>
          </div>

          <div className="bg-black/30 border border-white/5 p-4 rounded-2xl text-left text-[11px] text-slate-400 space-y-2">
            <p className="font-bold text-white uppercase font-mono text-[9px] text-indigo-400">💡 Testing Security Guard Bypass:</p>
            <p>Your simulated active role is currently <strong className="text-white">"{selectedRole}"</strong>.</p>
            <p>To bypass this guard, click the button below to go back, scroll to the <strong className="text-indigo-400 font-bold">"Interactive RBAC Role Simulator"</strong> block, and select a permitted role!</p>
          </div>

          <button
            type="button"
            onClick={() => setActiveSubView('main')}
            className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer"
          >
            ⬅️ Back to Main Profile
          </button>
        </div>
        )}

        {/* ================= FOOTER SECTION: SECURITY & SYSTEM ================= */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-4 shadow-xl" id="security-footer">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
            <Shield className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-xs font-black uppercase text-white tracking-wide">Security & Audit History</h3>
              <p className="text-[9px] text-slate-400 font-mono">Check logins and critical account settings modifications</p>
            </div>
          </div>

          {/* Admin Logs / Login Activity Table */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Security Audit History:</span>
            <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
              {securityLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="bg-black/30 border border-white/5 rounded-xl p-2.5 text-[9px] font-mono flex justify-between items-start">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {log.event}
                    </p>
                    <p className="text-[8px] text-slate-500">Location: {log.location || 'Pakistan'} • IP: {log.ip}</p>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-mono shrink-0">
                    {log.timestamp.split(' ')[1] || log.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Basic settings selectors and Logout button */}
          <div className="bg-black/40 border border-white/5 rounded-xl p-3.5 space-y-3.5">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider flex items-center gap-1">
              <Settings className="w-3.5 h-3.5" /> General App Settings
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase font-mono">Sound Effects</label>
                <button
                  type="button"
                  onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                  className={`w-full py-1.5 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                    isSoundEnabled 
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                      : 'bg-black/40 border-white/5 text-slate-500'
                  }`}
                >
                  {isSoundEnabled ? '🔔 Sound Effects ON' : '🔕 Sound Effects OFF'}
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-bold text-slate-500 uppercase font-mono">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-[#111221] border border-white/10 text-white rounded-lg px-2 py-1.5 text-[10px] focus:outline-none"
                >
                  <option value="English">🌐 English (UK)</option>
                  <option value="Urdu (اردو)">🕌 Urdu (اردو)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
              <div className="text-[9px] text-slate-500 font-mono">
                <p>Engine Ver: v4.3.1 (Stable CJS)</p>
                <p>Hardware IP: 39.34.120.45</p>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={() => {
                  addAdminLog(`Super admin simulated safe logout.`);
                  alert('🚪 Simulated logout successfully! Re-routing you back cleanly.');
                  onClose?.();
                }}
                className="flex items-center gap-1.5 py-2 px-4 bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl border border-rose-500/20 text-xs font-black uppercase tracking-wider transition active:scale-95 cursor-pointer shadow-lg shadow-rose-600/5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Simulate Logout</span>
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
