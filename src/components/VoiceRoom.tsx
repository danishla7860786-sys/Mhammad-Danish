import { useState, useEffect, useRef, FormEvent } from 'react';
import { Mic, MicOff, Lock, Unlock, Users, Send, Gift as GiftIcon, ShieldAlert, Award, Volume2, Trophy, Swords, RefreshCw, X, Play, Pause, SkipForward, SkipBack, Music, VolumeX, Radio, Signal, MessageSquare, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, MicSeat, Gift, ChatMessage, PKBattle } from '../types';

const ROOM_THEMES = {
  'neon-night': {
    name: 'Neon Night',
    icon: '🔮',
    bgClass: 'bg-gradient-to-br from-[#0c0a24] via-[#130d2b] to-[#070514]',
    borderClass: 'border-fuchsia-500/20',
    accentClass: 'text-fuchsia-400',
    btnClass: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/20',
    tagClass: 'bg-fuchsia-500/15 border-fuchsia-500/20 text-fuchsia-300',
    accentColor: '#d946ef',
    glowClass: 'shadow-[0_0_20px_rgba(217,70,239,0.15)]',
    indicatorClass: 'bg-fuchsia-500',
    textGradientClass: 'from-fuchsia-400 to-purple-500',
    ringClass: 'ring-fuchsia-500/25 border-fuchsia-500/40',
    glassClass: 'bg-fuchsia-950/20 border-fuchsia-500/10'
  },
  'forest-calm': {
    name: 'Forest Calm',
    icon: '🌲',
    bgClass: 'bg-gradient-to-br from-[#03140d] via-[#072417] to-[#010805]',
    borderClass: 'border-emerald-500/20',
    accentClass: 'text-emerald-400',
    btnClass: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/20',
    tagClass: 'bg-emerald-500/15 border-emerald-500/20 text-emerald-300',
    accentColor: '#10b981',
    glowClass: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    indicatorClass: 'bg-emerald-500',
    textGradientClass: 'from-emerald-400 to-teal-500',
    ringClass: 'ring-emerald-500/25 border-emerald-500/40',
    glassClass: 'bg-emerald-950/20 border-emerald-500/10'
  },
  'space-voyager': {
    name: 'Space Voyager',
    icon: '🌌',
    bgClass: 'bg-gradient-to-br from-[#020c1b] via-[#051c38] to-[#01050a]',
    borderClass: 'border-cyan-500/20',
    accentClass: 'text-cyan-400',
    btnClass: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/20',
    tagClass: 'bg-cyan-500/15 border-cyan-500/20 text-cyan-300',
    accentColor: '#06b6d4',
    glowClass: 'shadow-[0_0_20px_rgba(6,182,212,0.15)]',
    indicatorClass: 'bg-cyan-500',
    textGradientClass: 'from-cyan-400 to-blue-500',
    ringClass: 'ring-cyan-500/25 border-cyan-500/40',
    glassClass: 'bg-cyan-950/20 border-cyan-500/10'
  }
};

interface VoiceRoomProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  roomId: string;
  roomTitle: string;
  roomCategory: string;
  onLeave: () => void;
  onMinimize?: () => void;
  addAdminLog: (log: string) => void;
  onUpdateRoom?: (name: string, title: string) => void;
  onMessageSent?: () => void;
}

const GIFTS: Gift[] = [
  { id: 'rose', name: 'Red Rose', cost: 1, icon: '🌹', animationType: 'sparkle', category: 'Popular' },
  { id: 'heart', name: 'Heart Beats', cost: 5, icon: '💖', animationType: 'heart-rain', category: 'Popular' },
  { id: 'crown', name: 'King Crown', cost: 100, icon: '👑', animationType: 'sparkle', category: 'Special' },
  { id: 'lucky_bag', name: 'Lucky Coin Bag', cost: 500, icon: '💰', animationType: 'lucky-bag', category: 'Interactive' },
  { id: 'car', name: 'Super Sports Car', cost: 5000, icon: '🏎️', animationType: 'sports-car', category: 'Luxury' },
  { id: 'rocket', name: 'Interstellar Rocket', cost: 10000, icon: '🚀', animationType: 'rocket', category: 'Luxury' }
];

interface Track {
  title: string;
  artist: string;
  url: string;
  duration: string;
  totalSec: number;
  emoji: string;
}

const TRACKS: Track[] = [
  { title: "Sufi Flute & Tabla", artist: "Nusrat Heritage 🕌", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: "6:12", totalSec: 372, emoji: "🕌" },
  { title: "Lofi Chai Beats", artist: "Lahore Chill ☕", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", duration: "3:44", totalSec: 224, emoji: "☕" },
  { title: "Punjab Folk Rhythm", artist: "Bhangra Fusion 🥁", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", duration: "5:02", totalSec: 302, emoji: "🥁" },
  { title: "Sitar Serenade", artist: "Classical Instrumental 🪕", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", duration: "4:18", totalSec: 258, emoji: "🪕" }
];

export default function VoiceRoom({
  currentUser,
  setCurrentUser,
  roomId,
  roomTitle,
  roomCategory,
  onLeave,
  onMinimize,
  addAdminLog,
  onUpdateRoom,
  onMessageSent
}: VoiceRoomProps) {
  // Room edit/admin states requested by user
  const [showRoomDetailsModal, setShowRoomDetailsModal] = useState<boolean>(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'info' | 'participants'>('info');
  const [participants, setParticipants] = useState<User[]>([
    { id: '1001', name: 'Kamran (Host)', avatar: '👨‍💼', bio: 'Room Owner 👑', coins: 1500, diamonds: 25000, level: 32, badge: 'Host', dp: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
    { id: '1002', name: 'Aisha (AI)', avatar: '👩‍🎤', bio: 'Bubbly singer & conversationalist 🌸', coins: 500, diamonds: 8900, level: 18, badge: 'Host', dp: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
    { id: '1003', name: 'Zain (AI)', avatar: '👨‍🎤', bio: 'Vibe master & gamer 🎮', coins: 800, diamonds: 14000, level: 25, badge: 'Manager', dp: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: '1004', name: 'Sarah (AI)', avatar: '👩‍🎨', bio: 'Host Agency Recruiter 💎', coins: 200, diamonds: 4500, level: 12, badge: 'Host', dp: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
    { id: '2022', name: 'Ayesha', avatar: '🌸', bio: 'Friendly chatting lounge', coins: 100, diamonds: 4200, level: 15, badge: 'Host' },
    { id: '3001', name: 'Hamza_Rao', avatar: '😎', bio: 'Love to chat and listen to classic rock.', coins: 1200, diamonds: 80, level: 22, badge: 'Member' },
    { id: '3002', name: 'Kiran_Singer', avatar: '🎤', bio: 'Music is my soul. Request ghazals here!', coins: 4500, diamonds: 12000, level: 31, badge: 'Host' },
    { id: '3003', name: 'Danish_Fan', avatar: '🔥', bio: 'Supporting official resellers', coins: 50, diamonds: 10, level: 8, badge: 'Member' },
    { id: '3004', name: 'Sufi_Salar', avatar: '🕌', bio: 'Peace, music, tea', coins: 900, diamonds: 350, level: 14, badge: 'Member' }
  ]);
  const [isEditingRoom, setIsEditingRoom] = useState<boolean>(false);
  const [roomAdmins, setRoomAdmins] = useState<string[]>(['User_Asad', 'User_Hamza']);
  const [blockedUsers, setBlockedUsers] = useState<string[]>(['Spammer_99', 'Abuser_01']);
  const [newAdminInput, setNewAdminInput] = useState<string>('');
  const [newBlockInput, setNewBlockInput] = useState<string>('');
  const [inputRoomName, setInputRoomName] = useState<string>(roomTitle);
  const [inputRoomTitle, setInputRoomTitle] = useState<string>(roomTitle);

  // State variables
  const [seats, setSeats] = useState<MicSeat[]>([
    { index: 0, user: { id: '1001', name: 'Kamran (Host)', avatar: '👨‍💼', bio: 'Room Owner 👑', coins: 1500, diamonds: 25000, level: 32, badge: 'Host', frame: 'border-amber-500', dp: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' }, isMuted: false, isLocked: false },
    { index: 1, user: { id: '1002', name: 'Aisha (AI)', avatar: '👩‍🎤', bio: 'Bubbly singer & conversationalist 🌸', coins: 500, diamonds: 8900, level: 18, badge: 'Host', dp: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' }, isMuted: false, isLocked: false },
    { index: 2, user: null, isMuted: false, isLocked: false },
    { index: 3, user: { id: '1003', name: 'Zain (AI)', avatar: '👨‍🎤', bio: 'Vibe master & gamer 🎮', coins: 800, diamonds: 14000, level: 25, badge: 'Manager', dp: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' }, isMuted: false, isLocked: false },
    { index: 4, user: null, isMuted: false, isLocked: false },
    { index: 5, user: null, isMuted: false, isLocked: true },
    { index: 6, user: { id: '1004', name: 'Sarah (AI)', avatar: '👩‍🎨', bio: 'Host Agency Recruiter 💎', coins: 200, diamonds: 4500, level: 12, badge: 'Host', dp: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' }, isMuted: true, isLocked: false },
    { index: 7, user: null, isMuted: false, isLocked: false }
  ]);

  const [currentSeatIndex, setCurrentSeatIndex] = useState<number | null>(null);
  const [isMicOpen, setIsMicOpen] = useState<boolean>(true);
  const isMuted = !isMicOpen;
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm1', text: 'System: Welcome to VocoLive Rooms! Standard voice latency is 180ms. Stream safely.', isSystem: true, timestamp: 'Now' },
    { id: 'm2', user: { id: '1001', name: 'Kamran', avatar: '👨‍💼', bio: '', coins: 0, diamonds: 0, level: 32, badge: 'Host' }, text: 'Slam, welcome keya sab ko! Seat number 2 and 4 are open.', timestamp: '1m ago' },
    { id: 'm3', user: { id: '1002', name: 'Aisha (AI)', avatar: '👩‍🎤', bio: '', coins: 0, diamonds: 0, level: 18, badge: 'Host' }, text: 'Hi everyone! Send some gifts to trigger the PK Battle!', timestamp: 'Just now' }
  ]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Gifting & Shop State
  const [showGiftPanel, setShowGiftPanel] = useState<boolean>(false);
  const [giftTargetSeatIndex, setGiftTargetSeatIndex] = useState<number>(0);
  const [activeGiftAnimation, setActiveGiftAnimation] = useState<Gift | null>(null);
  const [luckyBagCoins, setLuckyBagCoins] = useState<number | null>(null);

  // Dynamic Room Visual Theme States
  const [selectedTheme, setSelectedTheme] = useState<'neon-night' | 'forest-calm' | 'space-voyager'>('neon-night');
  const [showThemeSelector, setShowThemeSelector] = useState<boolean>(false);

  // PK Battle State
  const [pk, setPk] = useState<PKBattle>({
    isActive: true,
    timeLeft: 300, // 5 minutes (300 seconds)
    ourPoints: 3450,
    enemyPoints: 3100,
    ourTopGivers: [
      { name: 'Danish (Seller)', avatar: '🤵', contribution: 1500 },
      { name: 'User_4910', avatar: '😎', contribution: 850 },
      { name: 'Sarah', avatar: '👩‍🎨', contribution: 100 }
    ],
    enemyTopGivers: [
      { name: 'Sheikh_99', avatar: '👳', contribution: 1200 },
      { name: 'Aisha_Gamer', avatar: '👩‍🎤', contribution: 950 },
      { name: 'Al-Zahid', avatar: '🕋', contribution: 300 }
    ],
    enemyName: 'Desert Lions 🦁',
    enemyAvatar: '🦁'
  });
  const [pkWinner, setPkWinner] = useState<'us' | 'enemy' | 'draw' | null>(null);
  const [showPKConfig, setShowPKConfig] = useState<boolean>(false);

  // Mini-Game (Greedy Wheel) State
  const [showGame, setShowGame] = useState<boolean>(false);
  const [selectedBetSymbol, setSelectedBetSymbol] = useState<'tiger' | 'dragon' | 'phoenix' | 'panda'>('tiger');
  const [betAmount, setBetAmount] = useState<number>(50);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [spinResult, setSpinResult] = useState<string>('');
  const [wheelDegree, setWheelDegree] = useState<number>(0);

  // Music System State
  const [playingTrackIndex, setPlayingTrackIndex] = useState<number>(0);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(50);
  const [isDuckingEnabled, setIsDuckingEnabled] = useState<boolean>(true);
  const [musicProgress, setMusicProgress] = useState<number>(12);
  const [floatingFX, setFloatingFX] = useState<{ id: string; emoji: string; x: number; y: number }[]>([]);
  
  // Quick Mini-Dashboard Tabs & Actions States inside Voice Room
  const [miniDbTab, setMiniDbTab] = useState<'proposal' | 'reseller' | 'agency'>('proposal');
  const [quickTransferTargetId, setQuickTransferTargetId] = useState<string>('1001');
  const [quickTransferAmount, setQuickTransferAmount] = useState<number>(1000);

  // Agora low-latency stream management state
  const [isAgoraConnected, setIsAgoraConnected] = useState<boolean>(true);
  const [agoraSpeakerVolume, setAgoraSpeakerVolume] = useState<number>(85);
  const [isAgoraSpeakerMuted, setIsAgoraSpeakerMuted] = useState<boolean>(false);
  const [agoraLatency, setAgoraLatency] = useState<number>(24);
  const [voiceTestStatus, setVoiceTestStatus] = useState<'Normal' | 'Calibrating...' | 'Acoustics Optimal' | 'High Frequency Detected' | 'Testing Mic Level'>('Normal');
  const [lastCheckedMessage, setLastCheckedMessage] = useState<string>('Welcome to the live show! Streamer mic is fully connected.');

  // Room user profile system states
  const [selectedProfileUser, setSelectedProfileUser] = useState<User | null>(null);
  const [selectedProfileSeatIndex, setSelectedProfileSeatIndex] = useState<number | null>(null);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>(['1002', '1003']);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [editedBioValue, setEditedBioValue] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Real-time Web Audio API voice filters
  const [isEchoActive, setIsEchoActive] = useState<boolean>(false);
  const [isPitchShiftActive, setIsPitchShiftActive] = useState<boolean>(false);
  const [isRobotActive, setIsRobotActive] = useState<boolean>(false);
  const [pitchShiftSemi, setPitchShiftSemi] = useState<number>(6); // -12 to 12
  const [echoDelay, setEchoDelay] = useState<number>(0.4); // 0.1 to 1.0s
  const [echoFeedback, setEchoFeedback] = useState<number>(0.5); // 0.1 to 0.9
  const [robotFrequency, setRobotFrequency] = useState<number>(60); // 30 to 120Hz
  const [isLiveVoiceMonitoring, setIsLiveVoiceMonitoring] = useState<boolean>(false);
  const [isUsingSyntheticVoice, setIsUsingSyntheticVoice] = useState<boolean>(true); // default to synthetic because sandboxed iframe often blocks getUserMedia
  const [voiceFilterError, setVoiceFilterError] = useState<string | null>(null);

  // Web Audio API Node Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | OscillatorNode | null>(null);
  const vibratoOscRef = useRef<OscillatorNode | null>(null);
  const vibratoGainRef = useRef<GainNode | null>(null);
  const robotLfoRef = useRef<OscillatorNode | null>(null);
  const robotGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayFeedbackRef = useRef<GainNode | null>(null);
  const pitchBiquadRef = useRef<BiquadFilterNode | null>(null);
  const pitchModOscRef = useRef<OscillatorNode | null>(null);
  const pitchModGainRef = useRef<GainNode | null>(null);
  const pitchDelayRef = useRef<DelayNode | null>(null);
  const filterInputRef = useRef<GainNode | null>(null);
  const filterOutputRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const voiceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Simulated Speaking activity
  const [speakers, setSpeakers] = useState<Record<string, boolean>>({
    '1001': true,
    '1002': false,
    '1003': false
  });

  // Play/Pause real HTML5 Audio based on state
  useEffect(() => {
    if (isPlayingMusic) {
      if (!audioRef.current) {
        audioRef.current = new Audio(TRACKS[playingTrackIndex].url);
        audioRef.current.loop = true;
      } else {
        if (audioRef.current.src !== TRACKS[playingTrackIndex].url) {
          audioRef.current.src = TRACKS[playingTrackIndex].url;
        }
      }
      audioRef.current.volume = musicVolume / 100;
      audioRef.current.play().catch(err => {
        console.warn("Audio autoplay blocked by browser sandbox (requires interaction first):", err);
      });
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  }, [isPlayingMusic, playingTrackIndex]);

  // Adjust volume dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  // Handle active audio ducking when someone speaks
  useEffect(() => {
    if (!audioRef.current || !isPlayingMusic) return;
    
    // Check if anyone is speaking
    const someoneSpeaking = Object.values(speakers).some(val => val === true);
    if (someoneSpeaking && isDuckingEnabled) {
      // Duck volume to 15% of current volume
      audioRef.current.volume = (musicVolume * 0.15) / 100;
    } else {
      audioRef.current.volume = musicVolume / 100;
    }
  }, [speakers, isDuckingEnabled, musicVolume, isPlayingMusic]);

  // Progress Bar update interval
  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    if (isPlayingMusic) {
      progressTimer = setInterval(() => {
        setMusicProgress(prev => {
          const limit = TRACKS[playingTrackIndex].totalSec;
          if (prev >= limit) {
            return 0; // Loop around
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(progressTimer);
  }, [isPlayingMusic, playingTrackIndex]);

  // Track switching helper
  const selectTrack = (index: number) => {
    setPlayingTrackIndex(index);
    setMusicProgress(0);
    addAdminLog(`Music system switched track to: "${TRACKS[index].title}"`);
  };

  // Sound FX synthesizer using Web Audio API
  const playSyntheticSound = (type: string) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'clap') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'cheer') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'laughter') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(420, ctx.currentTime + 0.08);
        osc.frequency.linearRampToValueAtTime(260, ctx.currentTime + 0.16);
        osc.frequency.linearRampToValueAtTime(420, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'horn') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.setValueAtTime(205, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.7);
        osc.start();
        osc.stop(ctx.currentTime + 0.7);
      } else if (type === 'drum') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.7, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch (e) {
      console.error("Audio Synthesis Error: ", e);
    }
  };

  // Sound FX Trigger handler
  const triggerSoundFX = (type: string, emoji: string) => {
    playSyntheticSound(type);
    
    const id = Math.random().toString();
    const newFX = {
      id,
      emoji,
      x: Math.random() * 80 - 40,
      y: 0
    };
    setFloatingFX(prev => [...prev, newFX]);
    
    setTimeout(() => {
      setFloatingFX(prev => prev.filter(f => f.id !== id));
    }, 2000);

    const fxChatMessage: ChatMessage = {
      id: 'fx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      user: currentUser,
      text: `played Sound FX: ${emoji} (${type.toUpperCase()})`,
      timestamp: 'Now'
    };
    setMessages(prev => [...prev, fxChatMessage]);
    addAdminLog(`User ${currentUser.name} played Sound FX: ${emoji} (${type})`);
  };

  // Real-time Web Audio API voice filters implementation
  const cleanupAudioGraph = () => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    
    // Stop oscillators
    try {
      if (sourceNodeRef.current && sourceNodeRef.current instanceof OscillatorNode) {
        sourceNodeRef.current.stop();
      }
    } catch(e){}
    try {
      if (vibratoOscRef.current) vibratoOscRef.current.stop();
    } catch(e){}
    try {
      if (robotLfoRef.current) robotLfoRef.current.stop();
    } catch(e){}
    try {
      if (pitchModOscRef.current) pitchModOscRef.current.stop();
    } catch(e){}
    
    // Stop mic stream tracks
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }
    
    // Disconnect all
    const nodes = [
      sourceNodeRef.current,
      vibratoOscRef.current,
      vibratoGainRef.current,
      robotLfoRef.current,
      robotGainRef.current,
      delayNodeRef.current,
      delayFeedbackRef.current,
      pitchBiquadRef.current,
      pitchModOscRef.current,
      pitchModGainRef.current,
      pitchDelayRef.current,
      filterInputRef.current,
      filterOutputRef.current,
      analyserNodeRef.current
    ];
    
    nodes.forEach(node => {
      if (node) {
        try {
          node.disconnect();
        } catch(e){}
      }
    });
    
    sourceNodeRef.current = null;
    vibratoOscRef.current = null;
    vibratoGainRef.current = null;
    robotLfoRef.current = null;
    robotGainRef.current = null;
    delayNodeRef.current = null;
    delayFeedbackRef.current = null;
    pitchBiquadRef.current = null;
    pitchModOscRef.current = null;
    pitchModGainRef.current = null;
    pitchDelayRef.current = null;
    filterInputRef.current = null;
    filterOutputRef.current = null;
    analyserNodeRef.current = null;
    
    if (audioCtxRef.current) {
      try {
        if (audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close();
        }
      } catch(e){}
      audioCtxRef.current = null;
    }
  };

  const drawOscilloscope = () => {
    if (!analyserNodeRef.current || !voiceCanvasRef.current) return;
    const canvas = voiceCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const bufferLength = analyserNodeRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserNodeRef.current || !voiceCanvasRef.current) return;
      animationFrameIdRef.current = requestAnimationFrame(draw);
      
      analyserNodeRef.current.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = '#0f1020';
      ctx.fillRect(0, 0, width, height);
      
      ctx.lineWidth = 2;
      const gradient = ctx.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, '#818cf8');
      gradient.addColorStop(0.5, '#c084fc');
      gradient.addColorStop(1, '#f43f5e');
      ctx.strokeStyle = gradient;
      
      ctx.beginPath();
      
      const sliceWidth = width / bufferLength;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        
        x += sliceWidth;
      }
      
      ctx.lineTo(width, height / 2);
      ctx.stroke();
    };
    
    draw();
  };

  const setupFilterNodes = (ctx: AudioContext, inputNode: GainNode, outputNode: GainNode) => {
    let currentNode: AudioNode = inputNode;
    
    // 1. Robot Voice Filter (Ring Modulator)
    if (isRobotActive) {
      const robotGain = ctx.createGain();
      robotGain.gain.setValueAtTime(0.5, ctx.currentTime);
      
      const robotLfo = ctx.createOscillator();
      robotLfo.type = 'sine';
      robotLfo.frequency.setValueAtTime(robotFrequency, ctx.currentTime);
      robotLfo.connect(robotGain.gain);
      robotLfo.start();
      
      robotGainRef.current = robotGain;
      robotLfoRef.current = robotLfo;
      
      currentNode.connect(robotGain);
      currentNode = robotGain;
    }
    
    // 2. Pitch Shifter Filter (Modulated Delay + Formant Peak Filter)
    if (isPitchShiftActive) {
      if (isUsingSyntheticVoice && sourceNodeRef.current && sourceNodeRef.current instanceof OscillatorNode) {
        sourceNodeRef.current.detune.setValueAtTime(pitchShiftSemi * 100, ctx.currentTime);
      }
      
      const pitchBiquad = ctx.createBiquadFilter();
      pitchBiquad.type = 'peaking';
      pitchBiquad.Q.setValueAtTime(8.0, ctx.currentTime);
      if (pitchShiftSemi > 0) {
        pitchBiquad.frequency.setValueAtTime(2400, ctx.currentTime);
        pitchBiquad.gain.setValueAtTime(18, ctx.currentTime);
      } else {
        pitchBiquad.frequency.setValueAtTime(160, ctx.currentTime);
        pitchBiquad.gain.setValueAtTime(18, ctx.currentTime);
      }
      
      const pDelay = ctx.createDelay(0.5);
      pDelay.delayTime.setValueAtTime(0.02, ctx.currentTime);
      
      const pModOsc = ctx.createOscillator();
      pModOsc.type = 'sawtooth';
      pModOsc.frequency.setValueAtTime(Math.abs(pitchShiftSemi) * 15, ctx.currentTime);
      
      const pModGain = ctx.createGain();
      pModGain.gain.setValueAtTime(Math.abs(pitchShiftSemi) * 0.0012, ctx.currentTime);
      
      pModOsc.connect(pModGain);
      pModGain.connect(pDelay.delayTime);
      pModOsc.start();
      
      pitchBiquadRef.current = pitchBiquad;
      pitchModOscRef.current = pModOsc;
      pitchModGainRef.current = pModGain;
      pitchDelayRef.current = pDelay;
      
      currentNode.connect(pitchBiquad);
      pitchBiquad.connect(pDelay);
      currentNode = pDelay;
    } else {
      if (isUsingSyntheticVoice && sourceNodeRef.current && sourceNodeRef.current instanceof OscillatorNode) {
        sourceNodeRef.current.detune.setValueAtTime(0, ctx.currentTime);
      }
    }
    
    // 3. Echo Filter (Parallel delay feedback)
    if (isEchoActive) {
      const delayNode = ctx.createDelay(2.0);
      delayNode.delayTime.setValueAtTime(echoDelay, ctx.currentTime);
      
      const feedbackGain = ctx.createGain();
      feedbackGain.gain.setValueAtTime(echoFeedback, ctx.currentTime);
      
      delayNode.connect(feedbackGain);
      feedbackGain.connect(delayNode);
      
      delayNodeRef.current = delayNode;
      delayFeedbackRef.current = feedbackGain;
      
      currentNode.connect(outputNode);
      currentNode.connect(delayNode);
      delayNode.connect(outputNode);
    } else {
      currentNode.connect(outputNode);
    }
  };

  const rebuildAudioGraph = () => {
    const ctx = audioCtxRef.current;
    const inputNode = filterInputRef.current;
    const outputNode = filterOutputRef.current;
    
    if (!ctx || !inputNode || !outputNode) return;
    
    try {
      inputNode.disconnect();
    } catch(e){}
    
    const oldNodes = [
      robotLfoRef.current,
      robotGainRef.current,
      delayNodeRef.current,
      delayFeedbackRef.current,
      pitchBiquadRef.current,
      pitchModOscRef.current,
      pitchModGainRef.current,
      pitchDelayRef.current
    ];
    
    oldNodes.forEach(node => {
      if (node) {
        try {
          if (node instanceof OscillatorNode) {
            node.stop();
          }
        } catch(e){}
        try {
          node.disconnect();
        } catch(e){}
      }
    });
    
    robotLfoRef.current = null;
    robotGainRef.current = null;
    delayNodeRef.current = null;
    delayFeedbackRef.current = null;
    pitchBiquadRef.current = null;
    pitchModOscRef.current = null;
    pitchModGainRef.current = null;
    pitchDelayRef.current = null;
    
    setupFilterNodes(ctx, inputNode, outputNode);
    addAdminLog(`Live Voice Filters Rebuilt: Echo=${isEchoActive ? 'ON' : 'OFF'}, PitchShift=${isPitchShiftActive ? 'ON' : 'OFF'}, Robot=${isRobotActive ? 'ON' : 'OFF'}`);
  };

  const startVoiceFilters = async () => {
    setVoiceFilterError(null);
    try {
      cleanupAudioGraph();
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      
      const inputNode = ctx.createGain();
      filterInputRef.current = inputNode;
      const outputNode = ctx.createGain();
      filterOutputRef.current = outputNode;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserNodeRef.current = analyser;
      
      outputNode.connect(analyser);
      analyser.connect(ctx.destination);
      
      if (isUsingSyntheticVoice) {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        
        const vibrato = ctx.createOscillator();
        vibrato.frequency.value = 5.5;
        const vibGain = ctx.createGain();
        vibGain.gain.value = 8;
        
        vibrato.connect(vibGain);
        vibGain.connect(osc.frequency);
        
        vibrato.start();
        osc.start();
        
        vibratoOscRef.current = vibrato;
        vibratoGainRef.current = vibGain;
        sourceNodeRef.current = osc;
        
        osc.connect(inputNode);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        const micSource = ctx.createMediaStreamSource(stream);
        sourceNodeRef.current = micSource as any;
        micSource.connect(inputNode);
      }
      
      setupFilterNodes(ctx, inputNode, outputNode);
      drawOscilloscope();
      addAdminLog(`Live Voice Room Filters Activated: ${isUsingSyntheticVoice ? 'Synthetic Voice Demo' : 'Real Microphone'} is live with custom effects.`);
    } catch (err: any) {
      console.error("Failed to start voice filters:", err);
      let errMsg = err.message || String(err);
      if (errMsg.includes("Permission denied") || errMsg.includes("Requested device not found") || errMsg.includes("Could not start grab")) {
        errMsg = "Microphone access denied or blocked by sandbox. Use 'Synthetic Voice Demo' option instead!";
      }
      setVoiceFilterError(errMsg);
      setIsLiveVoiceMonitoring(false);
    }
  };

  useEffect(() => {
    if (isLiveVoiceMonitoring) {
      startVoiceFilters();
    } else {
      cleanupAudioGraph();
    }
    return () => {
      cleanupAudioGraph();
    };
  }, [isLiveVoiceMonitoring, isUsingSyntheticVoice]);

  useEffect(() => {
    if (isLiveVoiceMonitoring && audioCtxRef.current) {
      rebuildAudioGraph();
    }
  }, [
    isEchoActive,
    isPitchShiftActive,
    isRobotActive,
    pitchShiftSemi,
    echoDelay,
    echoFeedback,
    robotFrequency
  ]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Keep lastCheckedMessage updated with the newest incoming live chat message
    if (messages.length > 0) {
      const userMsgs = messages.filter(m => !m.isSystem);
      if (userMsgs.length > 0) {
        setLastCheckedMessage(`${userMsgs[userMsgs.length - 1].senderName}: "${userMsgs[userMsgs.length - 1].text}"`);
      }
    }
  }, [messages]);

  // Agora stream latency fluctuation simulation
  useEffect(() => {
    const rtcTimer = setInterval(() => {
      if (isAgoraConnected) {
        setAgoraLatency(prev => {
          const delta = Math.floor(Math.random() * 5) - 2;
          const nextVal = prev + delta;
          return Math.max(15, Math.min(45, nextVal));
        });
      }
    }, 3000);
    return () => clearInterval(rtcTimer);
  }, [isAgoraConnected]);

  // Speaking simulation interval
  useEffect(() => {
    const speakInterval = setInterval(() => {
      setSpeakers({
        '1001': Math.random() > 0.4,
        '1002': Math.random() > 0.5,
        '1003': Math.random() > 0.7,
        [currentUser.id]: currentSeatIndex !== null && isMicOpen ? Math.random() > 0.3 : false
      });
    }, 2000);

    return () => clearInterval(speakInterval);
  }, [currentSeatIndex, isMicOpen, currentUser.id]);

  // PK Timer Countdown
  useEffect(() => {
    if (!pk.isActive || pk.timeLeft <= 0) return;

    const timer = setInterval(() => {
      setPk(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return { ...prev, timeLeft: 0, isActive: false };
        }

        // Randomly simulate enemy points increasing to make the battle competitive!
        const isEnemyGifting = Math.random() > 0.65;
        const enemyDelta = isEnemyGifting ? Math.round(Math.random() * 150) + 10 : 0;
        
        let updatedEnemyGivers = prev.enemyTopGivers ? [...prev.enemyTopGivers] : [
          { name: 'Sheikh_99', avatar: '👳', contribution: 1200 },
          { name: 'Aisha_Gamer', avatar: '👩‍🎤', contribution: 950 },
          { name: 'Al-Zahid', avatar: '🕋', contribution: 300 }
        ];

        if (enemyDelta > 0) {
          // Select a random enemy giver to increase contribution
          const randomIndex = Math.floor(Math.random() * updatedEnemyGivers.length);
          const giver = updatedEnemyGivers[randomIndex];
          updatedEnemyGivers[randomIndex] = {
            ...giver,
            contribution: giver.contribution + Math.round(enemyDelta / 10) // 1 coin = 10 points
          };
          updatedEnemyGivers.sort((a, b) => b.contribution - a.contribution);
        }

        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
          enemyPoints: prev.enemyPoints + enemyDelta,
          enemyTopGivers: updatedEnemyGivers
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [pk.isActive, pk.timeLeft]);

  // Handle PK Battle Ending State & Logs cleanly outside of state updaters
  const pkActiveRef = useRef(false);

  useEffect(() => {
    if (pk.isActive) {
      pkActiveRef.current = true;
    } else if (pkActiveRef.current && !pk.isActive) {
      pkActiveRef.current = false;
      const winner = pk.ourPoints > pk.enemyPoints ? 'us' : pk.ourPoints < pk.enemyPoints ? 'enemy' : 'draw';
      setPkWinner(winner);
      
      setMessages(m => {
        // Prevent duplicate messages
        if (m.some(msg => msg.id.startsWith('pk-end-'))) return m;
        return [
          ...m,
          {
            id: `pk-end-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            text: `🏁 PK BATTLE ENDED! Winner: ${winner === 'us' ? 'Our Room 🎉' : winner === 'enemy' ? `${pk.enemyName} 🏆` : 'It is a DRAW! 🤝'} Final Score: ${pk.ourPoints} - ${pk.enemyPoints}`,
            isSystem: true,
            timestamp: 'Now'
          }
        ];
      });
    }
  }, [pk.isActive, pk.ourPoints, pk.enemyPoints, pk.enemyName]);

  const handleStartPK = (rivalName: string, rivalAvatar: string, durationSec: number = 300) => {
    setPk({
      isActive: true,
      timeLeft: durationSec,
      ourPoints: 0,
      enemyPoints: 0,
      ourTopGivers: [],
      enemyTopGivers: [
        { name: 'Sheikh_Al_Sani', avatar: '👳', contribution: 0 },
        { name: 'Habibi_99', avatar: '🇦🇪', contribution: 0 },
        { name: 'Sultan_Khan', avatar: '👑', contribution: 0 }
      ],
      enemyName: rivalName,
      enemyAvatar: rivalAvatar
    });
    setPkWinner(null);
    setShowPKConfig(false);

    setMessages(prev => [
      ...prev,
      {
        id: `pk-system-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        text: `⚔️ PK BATTLE STARTED! We are competing against "${rivalName}". The battle will last for ${Math.floor(durationSec / 60)} minutes. Show your support by gifting! 🎁`,
        isSystem: true,
        timestamp: 'Just now'
      }
    ]);
  };

  const openUserProfile = (user: User) => {
    // Find if this user is currently on any mic seat
    const seatIdx = seats.findIndex(s => s.user && s.user.id === user.id);
    setSelectedProfileUser(user);
    setSelectedProfileSeatIndex(seatIdx !== -1 ? seatIdx : null);
    setIsEditingBio(false);
    setEditedBioValue(user.bio || '');
  };

  const handleSendGiftToSelectedUser = () => {
    if (selectedProfileSeatIndex !== null) {
      setGiftTargetSeatIndex(selectedProfileSeatIndex);
    }
    setShowGiftPanel(true);
    setSelectedProfileUser(null);
  };

  // Join or manage mic seat action
  const handleSeatClick = (index: number) => {
    const seat = seats[index];
    if (seat.isLocked) return;

    if (seat.user) {
      // Seat is occupied - open profile system modal
      openUserProfile(seat.user);
    } else {
      // Seat is empty - Join seat
      joinSeat(index);
    }
  };

  const joinSeat = (index: number) => {
    // If user is already on another seat, leave that first
    let updatedSeats = [...seats];
    if (currentSeatIndex !== null) {
      updatedSeats[currentSeatIndex].user = null;
    }

    updatedSeats[index].user = currentUser;
    setSeats(updatedSeats);
    setCurrentSeatIndex(index);

    // Announce via chat
    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      text: `System: ${currentUser.name} sat on Mic Seat ${index + 1}`,
      isSystem: true,
      timestamp: 'Now'
    };
    setMessages(prev => [...prev, newMsg]);
    addAdminLog(`User ${currentUser.name} joined mic seat ${index + 1}`);
  };

  const leaveSeat = (index: number) => {
    let updatedSeats = [...seats];
    updatedSeats[index].user = null;
    setSeats(updatedSeats);
    setCurrentSeatIndex(null);

    const newMsg: ChatMessage = {
      id: Math.random().toString(),
      text: `System: ${currentUser.name} left Mic Seat ${index + 1}`,
      isSystem: true,
      timestamp: 'Now'
    };
    setMessages(prev => [...prev, newMsg]);
    addAdminLog(`User ${currentUser.name} left mic seat ${index + 1}`);
  };

  // Submit chat message to Express backend with Gemini AI capability
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setIsLoading(true);

    // Instantly append user message to chat log (optimistic UI)
    const optimisticMsg: ChatMessage = {
      id: 'optimistic_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      user: currentUser,
      text: userText,
      timestamp: 'Sending...'
    };
    setMessages(prev => [...prev, optimisticMsg]);
    if (onMessageSent) {
      onMessageSent();
    }

    try {
      // Determine active AI names on mic seats
      const activeCohosts = seats
        .filter(s => s.user !== null && s.user.id !== currentUser.id)
        .map(s => s.user!.name);

      const res = await fetch('/api/vocolive/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: userText,
          username: currentUser.name,
          roomId,
          activeCohosts
        })
      });

      const data = await res.json();

      // Remove optimistic message and add the real sanitized message
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== optimisticMsg.id);
        const censoredMsg: ChatMessage = {
          id: 'real_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          user: currentUser,
          text: data.censoredText,
          timestamp: 'Now'
        };
        return [...filtered, censoredMsg];
      });

      // Show system toxic warning banner if detected
      if (data.isAbusive && data.warningMessage) {
        const systemWarning: ChatMessage = {
          id: 'warn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
          text: data.warningMessage,
          isSystem: true,
          timestamp: 'Now'
        };
        setMessages(prev => [...prev, systemWarning]);
        addAdminLog(`AI Filter flagged toxic message from ${currentUser.name}: "${userText}"`);
      }

      // Append AI simulated cohost reply if clean and Gemini replied
      if (data.aiCohostReply) {
        setTimeout(() => {
          // Find the cohost speaker details
          const respondingUser = seats.find(s => s.user?.name === data.aiCohostName)?.user || {
            id: '1002',
            name: data.aiCohostName || 'Aisha (AI)',
            avatar: '👩‍🎤',
            bio: '',
            coins: 0,
            diamonds: 0,
            level: 18,
            badge: 'Host'
          };

          const aiMsg: ChatMessage = {
            id: 'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
            user: respondingUser,
            text: data.aiCohostReply,
            timestamp: 'Now'
          };
          setMessages(prev => [...prev, aiMsg]);
        }, 1200);
      }

    } catch (err) {
      console.error(err);
      // Fallback update on connection failure
      setMessages(prev => prev.map(m => m.id === optimisticMsg.id ? { ...m, timestamp: 'Now' } : m));
    } finally {
      setIsLoading(false);
    }
  };

  // Gifting process
  const sendGift = (gift: Gift) => {
    if (currentUser.coins < gift.cost) {
      alert('In-App Purchases Simulator: Insufficient Coins! Please click "Buy Coins" in the lobby to reload.');
      return;
    }

    // Determine target receiver seat user
    const targetSeat = seats.find(s => s.index === giftTargetSeatIndex);
    const receiverName = targetSeat?.user ? targetSeat.user.name : 'Host';

    // Deduct coins from user
    const updatedUser = { ...currentUser, coins: currentUser.coins - gift.cost };
    
    // If recipient is currentUser, credit currentUser diamonds
    if (targetSeat?.user && targetSeat.user.id === currentUser.id) {
      updatedUser.diamonds = updatedUser.diamonds + gift.cost;
    }
    setCurrentUser(updatedUser);

    // Add virtual diamonds to target seat user (1 coin spent = 1 diamond earned by the receiver!)
    setSeats(prevSeats => 
      prevSeats.map(seat => {
        if (seat.index === giftTargetSeatIndex && seat.user) {
          return {
            ...seat,
            user: { ...seat.user, diamonds: seat.user.diamonds + gift.cost }
          };
        }
        return seat;
      })
    );

    // Close panel and activate gift full-screen layout animation
    setShowGiftPanel(false);
    setActiveGiftAnimation(gift);

    // Auto clear gift animation after 3.5 seconds
    setTimeout(() => {
      setActiveGiftAnimation(null);
    }, 4000);

    // Drop random coins if it is a Lucky Bag
    if (gift.animationType === 'lucky-bag') {
      const luckyCoins = Math.floor(Math.random() * 120) + 10;
      setLuckyBagCoins(luckyCoins);
      setTimeout(() => setLuckyBagCoins(null), 5000);
    }

    // Increase PK points!
    if (pk.isActive) {
      setPk(prev => {
        const addedGivers = [...prev.ourTopGivers];
        const exist = addedGivers.find(g => g.name === currentUser.name);
        if (exist) {
          exist.contribution += gift.cost;
        } else {
          addedGivers.push({ name: currentUser.name, avatar: currentUser.avatar, contribution: gift.cost });
        }
        // sort top givers
        addedGivers.sort((a, b) => b.contribution - a.contribution);

        return {
          ...prev,
          ourPoints: prev.ourPoints + (gift.cost * 10), // 10 points per coin
          ourTopGivers: addedGivers
        };
      });
    }

    // Append to room messages
    const giftChatMessage: ChatMessage = {
      id: 'gift_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      user: currentUser,
      text: `sent ${gift.icon} ${gift.name} to ${receiverName}!`,
      gift: {
        name: gift.name,
        icon: gift.icon,
        count: 1,
        cost: gift.cost
      },
      timestamp: 'Now'
    };
    setMessages(prev => [...prev, giftChatMessage]);
    addAdminLog(`User ${currentUser.name} gifted ${gift.name} (${gift.cost} coins) to ${receiverName} in room ${roomTitle}`);
  };

  // Greedy Wheel Mini Game Simulation
  const handleBetWheelSpin = () => {
    if (isSpinning) return;
    if (currentUser.coins < betAmount) {
      alert('Insufficient Coins! Please choose a smaller bet or top up.');
      return;
    }

    setIsSpinning(true);
    setSpinResult('');

    // Deduct bet coins
    const updatedUser = { ...currentUser, coins: currentUser.coins - betAmount };
    setCurrentUser(updatedUser);

    const symbols: ('tiger' | 'dragon' | 'phoenix' | 'panda')[] = ['tiger', 'dragon', 'phoenix', 'panda'];
    const rolledSymbol = symbols[Math.floor(Math.random() * symbols.length)];

    // Dynamic rotation degree spin
    const baseRotation = 1440; // 4 full rotations
    const itemIndex = symbols.indexOf(rolledSymbol);
    const finalDegree = baseRotation + (itemIndex * 90) + Math.floor(Math.random() * 60 - 30);
    setWheelDegree(finalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      const isWinner = rolledSymbol === selectedBetSymbol;
      const payoutMultiplier = isWinner ? 3.5 : 0; // 3.5x payout on win
      const wonCoins = Math.round(betAmount * payoutMultiplier);

      if (isWinner) {
        setSpinResult(`🏆 YOU WON! Roll landed on: ${rolledSymbol.toUpperCase()}. Payed out +${wonCoins} Coins!`);
        setCurrentUser({ ...currentUser, coins: currentUser.coins - betAmount + wonCoins });
        addAdminLog(`User ${currentUser.name} won ${wonCoins} coins in Greedy Game (Wheel of Fortune)`);
      } else {
        setSpinResult(`❌ Roll landed on: ${rolledSymbol.toUpperCase()}. Try again!`);
        addAdminLog(`User ${currentUser.name} lost ${betAmount} coins in Greedy Game`);
      }
    }, 3000);
  };

  return (
    <div className={`relative ${ROOM_THEMES[selectedTheme].bgClass} backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[780px] transition-all duration-700`} id="live-voice-room-simulator">
      
      {/* 3D Full Screen Premium Gift Animations */}
      <AnimatePresence>
        {activeGiftAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 pointer-events-none bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Super Sports Car Animation */}
            {activeGiftAnimation.animationType === 'sports-car' && (
              <motion.div
                initial={{ x: '-150%', scale: 0.6 }}
                animate={{ x: '150%', scale: [0.6, 1.2, 1.2, 0.6] }}
                transition={{ duration: 3.5, ease: 'easeInOut' }}
                className="text-center"
              >
                <div className="text-8xl drop-shadow-[0_10px_35px_rgba(59,130,246,0.6)]">🏎️💨</div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-slate-900/90 border border-amber-500/40 text-amber-400 font-bold px-5 py-2 rounded-xl text-sm tracking-widest uppercase shadow-xl mt-4"
                >
                  👑 {currentUser.name} sent SUPER SPORTS CAR! 👑
                </motion.div>
              </motion.div>
            )}

            {/* Rocket Animation */}
            {activeGiftAnimation.animationType === 'rocket' && (
              <motion.div
                initial={{ y: '150%', scale: 0.6 }}
                animate={{ y: '-150%', scale: [0.6, 1.3, 1.3, 0.6] }}
                transition={{ duration: 3.8, ease: 'easeIn' }}
                className="text-center"
              >
                <div className="text-8xl drop-shadow-[0_-15px_35px_rgba(239,68,68,0.7)]">🚀🔥</div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ delay: 0.4, duration: 3 }}
                  className="bg-gradient-to-r from-red-500/95 to-yellow-500/95 text-white font-black px-6 py-2.5 rounded-full text-sm tracking-wider uppercase shadow-xl border border-red-400 mt-4"
                >
                  🌌 GALACTIC ROCKET LAUNCHED BY {currentUser.name}! 🌌
                </motion.div>
              </motion.div>
            )}

            {/* General Sparkle / Heart Rain Animations */}
            {activeGiftAnimation.animationType === 'sparkle' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1.4, 0], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2.5 }}
                className="text-center space-y-4"
              >
                <div className="text-9xl drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">{activeGiftAnimation.icon}</div>
                <div className="bg-slate-900/90 border border-slate-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold">
                  {currentUser.name} sent {activeGiftAnimation.name}
                </div>
              </motion.div>
            )}

            {/* Heart Rain */}
            {activeGiftAnimation.animationType === 'heart-rain' && (
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      y: '-10%',
                      x: Math.random() * window.innerWidth - (window.innerWidth / 2),
                      scale: Math.random() * 0.8 + 0.4,
                      opacity: 0.8
                    }}
                    animate={{ y: '110%', opacity: 0, rotate: Math.random() * 360 }}
                    transition={{ duration: Math.random() * 2 + 1.5, ease: 'linear' }}
                    className="absolute text-5xl"
                  >
                    💖
                  </motion.div>
                ))}
                <div className="bg-slate-900/90 text-pink-400 px-5 py-2 rounded-xl text-xs font-semibold border border-pink-500/30">
                  💖 Heart Beats cascade sent by {currentUser.name}!
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lucky Coin Bag Drop Overlay */}
      <AnimatePresence>
        {luckyBagCoins && (
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-yellow-500 to-amber-600 border border-amber-400 p-4 rounded-xl shadow-2xl text-slate-950 text-center w-72"
          >
            <div className="text-3xl">💰🎒</div>
            <h4 className="font-bold text-sm tracking-wide mt-1">LUCKY COIN BAG DROPPED!</h4>
            <p className="text-[11px] font-medium text-amber-950">Grabbed random coins from the packet!</p>
            <div className="bg-white/95 text-emerald-600 font-bold px-3 py-1.5 rounded-lg text-lg inline-block mt-2 tracking-wide shadow-inner">
              +{luckyBagCoins} COINS
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT SIDE: Live Voice Room Visual Workspace */}
      <div className="flex-1 flex flex-col p-4 space-y-4 relative h-full overflow-y-auto">
        {/* Room Header Controls */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xl font-bold">
              🎙️
            </div>
            <div
              className="cursor-pointer hover:opacity-85 transition text-left"
              onClick={() => {
                setInputRoomName(currentUser.myCreatedRoom?.name || roomTitle);
                setInputRoomTitle(currentUser.myCreatedRoom?.title || roomTitle);
                setActiveDetailsTab('participants');
                setShowRoomDetailsModal(true);
              }}
              title="Click to view Room Participants & Info"
            >
              <h3 className="text-white text-sm font-bold truncate max-w-[150px] sm:max-w-[240px] flex items-center gap-1">
                🎵 {roomTitle} <span className="text-[10px] text-yellow-500 font-normal">▾</span>
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span className={`px-1.5 py-0.5 rounded font-bold transition-all duration-500 ${ROOM_THEMES[selectedTheme].tagClass}`}>{roomCategory}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {participants.length + 1} Users</span>
                <span className="text-slate-600">ID: {roomId}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingRoom && (
              <button
                onClick={() => setShowGame(!showGame)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition ${
                  showGame 
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                🎮 Games
              </button>
            )}

            {/* Dynamic Visual Theme Selection Dropdown (Host & Admins feature) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowThemeSelector(!showThemeSelector)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all duration-500 cursor-pointer ${
                  showThemeSelector 
                    ? `${ROOM_THEMES[selectedTheme].tagClass}` 
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
                title="Change live room visual theme"
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Theme: <strong className={ROOM_THEMES[selectedTheme].accentClass}>{ROOM_THEMES[selectedTheme].name}</strong></span>
              </button>
              
              {showThemeSelector && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-950/95 border border-white/10 rounded-xl p-2.5 shadow-2xl z-50 space-y-1 text-left font-sans">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                    <span>🎨 Select Room Theme</span>
                  </div>
                  {(Object.keys(ROOM_THEMES) as Array<keyof typeof ROOM_THEMES>).map((themeKey) => {
                    const t = ROOM_THEMES[themeKey];
                    const isSelected = selectedTheme === themeKey;
                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => {
                          setSelectedTheme(themeKey);
                          setShowThemeSelector(false);
                          addAdminLog(`Room theme changed to '${t.name}' by host ${currentUser.name}`);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                            : 'text-slate-300 hover:bg-white/5 border border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span className="text-sm">{t.icon}</span>
                          <span className={isSelected ? 'font-bold text-white' : ''}>{t.name}</span>
                        </span>
                        {isSelected && <span className="text-[10px] text-purple-400">●</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            {onMinimize && (
              <button
                onClick={onMinimize}
                className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg text-xs font-semibold border border-indigo-500/20 transition flex items-center gap-1 cursor-pointer"
              >
                <span>➖</span> Minimize
              </button>
            )}
            <button
              onClick={onLeave}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white rounded-lg text-xs font-semibold border border-rose-500/20 transition cursor-pointer"
            >
              Exit Room
            </button>
          </div>
        </div>

        {/* DETAILS POPUP / MODAL (When Top-Left is Clicked) */}
        {showRoomDetailsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#15162c] border border-white/10 rounded-2xl p-6 w-full max-w-md text-white shadow-2xl relative animate-fade-in text-left">
              
              {/* Tabs header */}
              <div className="flex border-b border-white/10 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveDetailsTab('info')}
                  className={`flex-1 pb-2.5 text-xs font-black uppercase tracking-wider text-center border-b-2 transition ${
                    activeDetailsTab === 'info'
                      ? 'border-indigo-500 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ℹ️ Room Info
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDetailsTab('participants')}
                  className={`flex-1 pb-2.5 text-xs font-black uppercase tracking-wider text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                    activeDetailsTab === 'participants'
                      ? 'border-indigo-500 text-white font-extrabold'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  👥 Participants ({participants.length + 1})
                </button>
              </div>

              {activeDetailsTab === 'info' ? (
                <>
                  <div className="space-y-3.5 text-xs font-sans">
                    <p className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Name:</span>
                      <span className="font-bold text-slate-200">{currentUser.myCreatedRoom?.name || roomTitle}</span>
                    </p>
                    <p className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Title:</span>
                      <span className="font-bold text-slate-200">{currentUser.myCreatedRoom?.title || roomTitle}</span>
                    </p>
                    <p className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Room ID:</span>
                      <span className="font-mono text-indigo-300 font-bold">{roomId}</span>
                    </p>
                    <p className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-slate-400">Owner:</span>
                      <span className="font-bold text-slate-200">You ({currentUser.name})</span>
                    </p>
                  </div>
                  
                  <div className="flex gap-2.5 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingRoom(true);
                        setShowRoomDetailsModal(false);
                      }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      ✏️ Edit Room / Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRoomDetailsModal(false)}
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-black text-xs uppercase tracking-wider rounded-xl transition active:scale-95 border border-white/10 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Participants List */}
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {/* Current User themselves */}
                    <div className="flex justify-between items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{currentUser.avatar}</span>
                        <div>
                          <p className="text-xs font-bold text-indigo-300">{currentUser.name} (You)</p>
                          <p className="text-[9px] text-slate-500 uppercase font-mono">Lv.{currentUser.level} • Room Creator</p>
                        </div>
                      </div>
                      <span className="text-[10px] text-yellow-500 font-bold uppercase px-2 py-0.5 bg-yellow-500/10 rounded border border-yellow-500/20 font-mono">Owner</span>
                    </div>

                    {/* Other participants */}
                    {participants.map((p) => {
                      const isSitting = seats.some(s => s.user?.id === p.id);
                      return (
                        <div key={p.id} className="flex justify-between items-center bg-black/20 hover:bg-black/35 px-3 py-2 rounded-xl border border-white/5 transition">
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{p.avatar}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-200">{p.name}</p>
                              <p className="text-[9px] text-slate-500 uppercase font-mono">
                                Lv.{p.level} {isSitting && '• On Mic'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Kick button: visible for Room Creator / Hosts (Danish 7777 or badge Host) */}
                            {(currentUser.id === '7777' || currentUser.badge === 'Host') && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Perform Kick action
                                  addAdminLog(`Kicked participant: "${p.name}" (ID: #${p.id}) has been removed from room by Room Creator.`);
                                  
                                  const kickMsg: ChatMessage = {
                                    id: 'kick_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                                    text: `⚠️ System: Participant ${p.name} was kicked from the room by creator ${currentUser.name}.`,
                                    isSystem: true,
                                    timestamp: 'Now'
                                  };
                                  setMessages(prev => [...prev, kickMsg]);

                                  // Remove from participants list
                                  setParticipants(prev => prev.filter(u => u.id !== p.id));

                                  // Remove from seats if sitting on mic
                                  setSeats(prev => prev.map(s => s.user?.id === p.id ? { ...s, user: null } : s));

                                  // Close profile modal if viewing this participant
                                  if (selectedProfileUser?.id === p.id) {
                                    setSelectedProfileUser(null);
                                  }

                                  alert(`Successfully kicked ${p.name} from the room.`);
                                }}
                                className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-slate-950 text-[10px] font-black uppercase tracking-wider rounded border border-red-500/20 transition cursor-pointer"
                              >
                                Kick
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {participants.length === 0 && (
                      <p className="text-center text-xs text-slate-500 py-6">No other participants currently in room.</p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRoomDetailsModal(false)}
                      className="py-2 px-5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition border border-white/10 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* PREMIUM USER PROFILE SYSTEM MODAL */}
        {selectedProfileUser && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" id="room-profile-system-modal">
            <div className="bg-gradient-to-b from-[#181a30] to-[#0c0d1a] border border-indigo-500/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative">
              
              {/* Top Banner and Icons */}
              <div className="h-24 bg-gradient-to-r from-purple-900/50 to-indigo-900/50 relative overflow-hidden flex items-center justify-between px-6">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)]" />
                <span className="text-[10px] font-mono uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full relative z-10">
                  ID: {selectedProfileUser.id}
                </span>
                <button
                  onClick={() => setSelectedProfileUser(null)}
                  className="bg-black/30 hover:bg-black/55 text-slate-400 hover:text-white p-1.5 rounded-full transition relative z-10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar and Main Info Container */}
              <div className="px-6 pb-6 pt-0 -mt-10 relative text-center space-y-4">
                
                {/* Large Avatar with Premium Frame Visuals */}
                <div className="inline-block relative">
                  <div className={`w-22 h-22 rounded-full flex items-center justify-center p-1 bg-slate-950 border-2 transition-all ${
                    selectedProfileUser.frame ? selectedProfileUser.frame : 'border-slate-800'
                  }`}>
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-900">
                      {selectedProfileUser.dp ? (
                        <img 
                          src={selectedProfileUser.dp} 
                          alt={selectedProfileUser.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-4xl">{selectedProfileUser.avatar}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* VIP Badge icon if present */}
                  {selectedProfileUser.vipBadge && (
                    <div className="absolute -top-1.5 -right-1 bg-yellow-500 text-black font-extrabold text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-md animate-pulse">
                      👑 VIP
                    </div>
                  )}
                </div>

                {/* Name, Badge, and Category Tags */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5">
                    <h3 className="text-white font-extrabold text-base tracking-wide">{selectedProfileUser.name}</h3>
                    {selectedProfileUser.gender === 'Female' ? (
                      <span className="text-[10px] bg-pink-500/20 text-pink-300 border border-pink-500/20 px-1.5 py-0.2 rounded-full">♀️</span>
                    ) : selectedProfileUser.gender === 'Male' ? (
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/20 px-1.5 py-0.2 rounded-full">♂️</span>
                    ) : null}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-1.5 text-[9px] font-mono">
                    <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-black uppercase">
                      {selectedProfileUser.badge}
                    </span>
                    <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded font-bold">
                      LV.{selectedProfileUser.level}
                    </span>
                    {selectedProfileUser.family && (
                      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-bold">
                        🛡️ {selectedProfileUser.family} Family
                      </span>
                    )}
                  </div>
                </div>

                {/* Coin and Diamond Balances */}
                <div className="grid grid-cols-2 gap-2.5 bg-black/40 border border-white/5 p-2.5 rounded-2xl font-mono text-center">
                  <div className="space-y-0.5 border-r border-white/5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Coins Balance</span>
                    <span className="text-amber-400 font-bold text-xs flex items-center justify-center gap-1">
                      🪙 {selectedProfileUser.id === currentUser.id ? currentUser.coins : selectedProfileUser.coins}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Diamond Revenue</span>
                    <span className="text-rose-400 font-bold text-xs flex items-center justify-center gap-1">
                      💎 {selectedProfileUser.id === currentUser.id ? currentUser.diamonds : selectedProfileUser.diamonds}
                    </span>
                  </div>
                </div>

                {/* Bio Section */}
                <div className="text-left bg-black/30 border border-white/5 p-3 rounded-2xl space-y-1">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Biography</span>
                  {selectedProfileUser.id === currentUser.id ? (
                    isEditingBio ? (
                      <div className="space-y-2 mt-1">
                        <textarea
                          value={editedBioValue}
                          onChange={(e) => setEditedBioValue(e.target.value)}
                          maxLength={120}
                          placeholder="Type something in Urdu, English or Hindi..."
                          className="w-full text-xs text-white bg-black/40 border border-indigo-500/40 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-16"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setIsEditingBio(false)}
                            className="bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] px-2.5 py-1 rounded transition uppercase font-bold border border-white/5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              // Save Bio
                              setCurrentUser({ ...currentUser, bio: editedBioValue });
                              // Also update inside the local seat array if sitting
                              setSeats(prev => prev.map(s => s.user?.id === currentUser.id ? { ...s, user: { ...s.user!, bio: editedBioValue } } : s));
                              setSelectedProfileUser(prev => prev ? { ...prev, bio: editedBioValue } : null);
                              setIsEditingBio(false);
                              addAdminLog(`Profile Bio updated for user ${currentUser.name}`);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2.5 py-1 rounded transition uppercase font-black"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start mt-0.5">
                        <p className="text-[11px] text-slate-300 italic whitespace-pre-wrap flex-1 pr-2">
                          {currentUser.bio || 'No biography set yet. Introduce yourself!'}
                        </p>
                        <button
                          onClick={() => {
                            setEditedBioValue(currentUser.bio || '');
                            setIsEditingBio(true);
                          }}
                          className="text-[9px] text-indigo-400 hover:text-indigo-300 hover:underline uppercase font-bold shrink-0 font-mono mt-0.5"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    )
                  ) : (
                    <p className="text-[11px] text-slate-300 italic whitespace-pre-wrap">
                      {selectedProfileUser.bio || 'This user is keeping a low profile. No bio found.'}
                    </p>
                  )}
                </div>

                {/* Relationship / CP Status */}
                {selectedProfileUser.relationshipCP && (
                  <div className="bg-rose-500/10 border border-rose-500/10 px-3 py-2 rounded-2xl flex items-center justify-between text-[11px] font-medium text-rose-300">
                    <span className="flex items-center gap-1.5">❤️ Relationship Partner:</span>
                    <span className="font-extrabold flex items-center gap-1">{selectedProfileUser.relationshipCP} 💖</span>
                  </div>
                )}

                {/* Avatar Frame Shop Toggle (For current user themselves to choose styles) */}
                {selectedProfileUser.id === currentUser.id && (
                  <div className="bg-indigo-950/25 border border-indigo-500/10 p-2.5 rounded-2xl text-left space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block font-bold">Custom Visual Avatar Frames (Toggle)</span>
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { frame: 'border-white/20', label: 'Default' },
                        { frame: 'border-yellow-500 ring-2 ring-yellow-500/35 shadow-lg shadow-yellow-500/20', label: 'Gold' },
                        { frame: 'border-indigo-500 ring-2 ring-indigo-500/35 shadow-lg shadow-indigo-500/20', label: 'Galaxy' },
                        { frame: 'border-rose-500 ring-2 ring-rose-500/35 shadow-lg shadow-rose-500/20', label: 'Ruby' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            setCurrentUser({ ...currentUser, frame: item.frame });
                            // Update seat
                            setSeats(prev => prev.map(s => s.user?.id === currentUser.id ? { ...s, user: { ...s.user!, frame: item.frame } } : s));
                            setSelectedProfileUser(prev => prev ? { ...prev, frame: item.frame } : null);
                            addAdminLog(`Visual avatar frame changed to ${item.label}`);
                          }}
                          className={`p-1 rounded text-[8px] font-mono border text-center transition truncate cursor-pointer ${
                            currentUser.frame === item.frame
                              ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500'
                              : 'bg-black/35 text-slate-400 border-white/5 hover:border-white/15'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons Panel */}
                <div className="pt-2 space-y-2">
                  {selectedProfileUser.id !== currentUser.id ? (
                    <>
                      {/* Social Actions */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            // Toggle follow
                            let updatedFollows = [...followedUserIds];
                            const isFollowed = updatedFollows.includes(selectedProfileUser.id);
                            if (isFollowed) {
                              updatedFollows = updatedFollows.filter(id => id !== selectedProfileUser.id);
                              // System message
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: 'unfollow_sys_' + Date.now(),
                                  text: `System: You unfollowed ${selectedProfileUser.name}.`,
                                  isSystem: true,
                                  timestamp: 'Now'
                                }
                              ]);
                              addAdminLog(`Unfollowed user "${selectedProfileUser.name}"`);
                            } else {
                              updatedFollows.push(selectedProfileUser.id);
                              // System message
                              setMessages(prev => [
                                ...prev,
                                {
                                  id: 'follow_sys_' + Date.now(),
                                  text: `System: 🎉 You are now following ${selectedProfileUser.name}!`,
                                  isSystem: true,
                                  timestamp: 'Now'
                                }
                              ]);
                              addAdminLog(`Followed user "${selectedProfileUser.name}"`);
                            }
                            setFollowedUserIds(updatedFollows);
                          }}
                          className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                            followedUserIds.includes(selectedProfileUser.id)
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent'
                          }`}
                        >
                          {followedUserIds.includes(selectedProfileUser.id) ? '✓ Following' : '👤 Follow'}
                        </button>
                        
                        <button
                          onClick={handleSendGiftToSelectedUser}
                          className="py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide shadow-lg border border-indigo-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          🎁 Send Gift
                        </button>
                      </div>

                      {/* Moderator Commands (If current user is Owner or Admin) */}
                      {(roomAdmins.includes(currentUser.name) || currentUser.badge === 'Host') && selectedProfileSeatIndex !== null && (
                        <div className="bg-slate-950/60 p-3 rounded-2xl border border-rose-500/10 space-y-2 mt-1">
                          <span className="text-[8px] font-mono font-bold text-rose-400 uppercase tracking-widest block text-center">🛡️ MODERATOR / ADMIN TOOLS</span>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => {
                                // Toggle mute status of that seat
                                setSeats(prev => prev.map((s, i) => i === selectedProfileSeatIndex ? { ...s, isMuted: !s.isMuted } : s));
                                const seatMuted = !seats[selectedProfileSeatIndex].isMuted;
                                addAdminLog(`Seat #${selectedProfileSeatIndex + 1} (${selectedProfileUser.name}) was ${seatMuted ? 'UNMUTED' : 'MUTED'} by moderator ${currentUser.name}`);
                                setSelectedProfileUser(null);
                              }}
                              className="py-1.5 bg-rose-500/15 border border-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg text-[10px] uppercase font-bold transition cursor-pointer"
                            >
                              {seats[selectedProfileSeatIndex].isMuted ? '🔊 Unmute User' : '🔇 Mute Seat'}
                            </button>

                            <button
                              onClick={() => {
                                // Kick off seat
                                addAdminLog(`Seat #${selectedProfileSeatIndex + 1} (${selectedProfileUser.name}) was kicked off mic by moderator ${currentUser.name}`);
                                setSeats(prev => prev.map((s, i) => i === selectedProfileSeatIndex ? { ...s, user: null } : s));
                                setSelectedProfileUser(null);
                              }}
                              className="py-1.5 bg-red-600/20 border border-red-500/30 text-red-300 hover:bg-red-600/35 rounded-lg text-[10px] uppercase font-bold transition cursor-pointer"
                            >
                              💥 Kick Seat
                            </button>
                          </div>

                          {currentUser.badge === 'Host' && (
                            <button
                              onClick={() => {
                                // Toggle admin promotion
                                if (roomAdmins.includes(selectedProfileUser.name)) {
                                  setRoomAdmins(roomAdmins.filter(a => a !== selectedProfileUser.name));
                                  addAdminLog(`Demoted "${selectedProfileUser.name}" from Room Administrator list`);
                                } else {
                                  setRoomAdmins([...roomAdmins, selectedProfileUser.name]);
                                  addAdminLog(`Promoted "${selectedProfileUser.name}" to Room Administrator`);
                                }
                                setSelectedProfileUser(null);
                              }}
                              className="w-full py-1.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 rounded-lg text-[10px] uppercase font-bold transition cursor-pointer"
                            >
                              {roomAdmins.includes(selectedProfileUser.name) ? 'Demote Admin' : '⭐ Promote to Admin'}
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    /* My Own Actions */
                    <div className="space-y-2">
                      {selectedProfileSeatIndex !== null && (
                        <button
                          onClick={() => {
                            leaveSeat(selectedProfileSeatIndex);
                            setSelectedProfileUser(null);
                          }}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wide transition active:scale-95 cursor-pointer"
                        >
                          🏃 Leave Mic Seat
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedProfileUser(null)}
                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wide transition active:scale-95 cursor-pointer"
                      >
                        ✓ Close Profile
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* PREMIUM GIFT INVENTORY MODAL OVERLAY */}
        {showGiftPanel && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" id="room-gift-modal">
            <div className="bg-gradient-to-b from-[#181a30] to-[#0c0d1a] border border-indigo-500/30 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl relative p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-indigo-500/10 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1">
                  🎁 Premium Gift Inventory Panel
                </span>
                <button 
                  onClick={() => setShowGiftPanel(false)} 
                  className="bg-black/30 hover:bg-black/55 text-slate-400 hover:text-white p-1.5 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Target Receiver Selection Dropdown */}
              <div className="flex justify-between items-center bg-[#131424] border border-white/5 p-2 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">Target Receiver:</span>
                <select
                  value={giftTargetSeatIndex}
                  onChange={(e) => setGiftTargetSeatIndex(Number(e.target.value))}
                  className="bg-black/40 text-slate-200 border border-white/10 rounded px-2.5 py-1 text-[11px] focus:outline-none font-mono"
                >
                  {seats.map((seat) => seat.user && (
                    <option key={seat.index} value={seat.index}>
                      Seat {seat.index + 1}: {seat.user.name} ({seat.user.id === currentUser.id ? 'You' : seat.user.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {GIFTS.map((gift) => (
                  <div
                    key={gift.id}
                    onClick={() => sendGift(gift)}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500 rounded-2xl p-3 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-1.5 relative hover:scale-105 active:scale-95"
                  >
                    <span className="text-3xl">{gift.icon}</span>
                    <span className="text-[10px] text-slate-300 font-medium truncate w-full">{gift.name}</span>
                    <span className="text-[9px] text-amber-400 font-mono font-bold">{gift.cost} Coins</span>
                    {gift.category === 'Luxury' && (
                      <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white font-black text-[6px] px-1 rounded scale-75 uppercase tracking-wide">
                        3D
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between items-center text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono">
                <span className="text-slate-400">Your Coin Balance:</span>
                <span className="text-amber-400 font-bold">{currentUser.coins} 🪙</span>
              </div>
            </div>
          </div>
        )}

        {isEditingRoom ? (
          <div className="space-y-6 flex-1 py-2 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider">🔧 Edit Room Controls</span>
              <button
                onClick={() => setIsEditingRoom(false)}
                className="px-2.5 py-1 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 rounded-lg text-[10px] font-bold uppercase transition active:scale-95 cursor-pointer"
              >
                ⬅️ Back to Room
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateRoom) {
                  onUpdateRoom(inputRoomName, inputRoomTitle);
                } else {
                  setCurrentUser({
                    ...currentUser,
                    myCreatedRoom: {
                      ...currentUser.myCreatedRoom,
                      name: inputRoomName,
                      title: inputRoomTitle
                    }
                  });
                }
                setIsEditingRoom(false);
                addAdminLog(`Updated room details via form: "${inputRoomName}" - "${inputRoomTitle}"`);
              }}
              className="space-y-4 bg-[#14152b] p-4 rounded-xl border border-white/5 text-xs"
            >
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Update Room Name:</label>
                <input
                  type="text"
                  value={inputRoomName}
                  onChange={e => setInputRoomName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-400 block uppercase tracking-wider text-[9px] font-mono">Update Title/Description:</label>
                <input
                  type="text"
                  value={inputRoomTitle}
                  onChange={e => setInputRoomTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] uppercase tracking-widest rounded-lg transition active:scale-95 cursor-pointer"
              >
                Save Room Details
              </button>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Management */}
              <div className="bg-[#14152b]/50 border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-slate-400 uppercase tracking-wider text-[9px] font-mono mb-2">👥 Manage Room Admins</h4>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Username to add"
                      value={newAdminInput}
                      onChange={e => setNewAdminInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newAdminInput.trim()) {
                          setRoomAdmins([...roomAdmins, newAdminInput.trim()]);
                          addAdminLog(`Added admin: ${newAdminInput.trim()}`);
                          setNewAdminInput('');
                        }
                      }}
                      className="px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <ul className="space-y-1 mt-2 max-h-[110px] overflow-y-auto scrollbar-none text-[10px]">
                  {roomAdmins.map((admin, idx) => (
                    <li key={idx} className="bg-black/30 border border-white/5 px-2.5 py-1 rounded flex justify-between items-center text-slate-300">
                      <span>⭐ {admin}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setRoomAdmins(roomAdmins.filter((_, i) => i !== idx));
                          addAdminLog(`Removed admin: ${admin}`);
                        }}
                        className="text-rose-500 hover:text-rose-400 font-bold font-sans"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Block & Kick */}
              <div className="bg-[#14152b]/50 border border-white/5 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-black text-slate-400 uppercase tracking-wider text-[9px] font-mono mb-2">🚫 Block & Kick Users</h4>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      placeholder="Username to block"
                      value={newBlockInput}
                      onChange={e => setNewBlockInput(e.target.value)}
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-rose-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBlockInput.trim()) {
                          setBlockedUsers([...blockedUsers, newBlockInput.trim()]);
                          addAdminLog(`Blocked & kicked user: ${newBlockInput.trim()}`);
                          setNewBlockInput('');
                        }
                      }}
                      className="px-2.5 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                    >
                      Block
                    </button>
                  </div>
                </div>
                <ul className="space-y-1 mt-2 max-h-[110px] overflow-y-auto scrollbar-none text-[10px]">
                  {blockedUsers.map((bUser, idx) => (
                    <li key={idx} className="bg-black/30 border border-white/5 px-2.5 py-1 rounded flex justify-between items-center text-slate-300">
                      <span className="truncate max-w-[100px]">❌ {bUser}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setBlockedUsers(blockedUsers.filter((_, i) => i !== idx));
                          addAdminLog(`Unblocked user: ${bUser}`);
                        }}
                        className="text-slate-400 hover:text-white"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* PK BATTLE FEATURE MODULE */}
        {pk.isActive ? (
          <div className="bg-slate-950/60 border border-purple-500/35 rounded-2xl p-4 space-y-4 relative overflow-hidden shadow-2xl">
            {/* Visual background elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-blue-600/10 pointer-events-none" />
            
            {/* Header with timer */}
            <div className="flex justify-between items-center text-[10px] font-mono relative z-10">
              <span className="text-red-400 font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <Swords className="w-4 h-4 text-red-500 animate-pulse" /> PK BATTLE LIVE
              </span>
              <div className="flex items-center gap-1 bg-black/80 px-4 py-1.5 rounded-full font-black text-xs text-yellow-400 border border-yellow-500/20 shadow-lg shadow-yellow-500/5 animate-pulse">
                <span>⏳</span>
                <span>{Math.floor(pk.timeLeft / 60)}:{(pk.timeLeft % 60).toString().padStart(2, '0')}</span>
              </div>
              <span className="text-blue-400 font-black tracking-wider flex items-center gap-1.5 uppercase">
                ⚔️ {pk.enemyName} PK ON {pk.enemyAvatar}
              </span>
            </div>

            {/* Leading indicator */}
            <div className="text-center">
              {pk.ourPoints > pk.enemyPoints ? (
                <span className="inline-block bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-bounce">
                  👑 We Are Leading! +{pk.ourPoints - pk.enemyPoints} Pts
                </span>
              ) : pk.ourPoints < pk.enemyPoints ? (
                <span className="inline-block bg-blue-500/15 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full animate-pulse">
                  ⚠️ Enemy Leading! -{pk.enemyPoints - pk.ourPoints} Pts
                </span>
              ) : (
                <span className="inline-block bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  ⚖️ Scores Tied! Gifting determines victory!
                </span>
              )}
            </div>

            {/* Dual Progress Bar */}
            <div className="h-10 w-full bg-slate-900/80 rounded-full overflow-hidden flex border border-white/10 relative shadow-2xl">
              <motion.div
                animate={{ width: `${Math.max(10, Math.min(90, (pk.ourPoints / (pk.ourPoints + pk.enemyPoints || 1)) * 100))}%` }}
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 flex items-center px-4 relative transition-all duration-300"
              >
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-black uppercase italic text-white drop-shadow-md">RED TEAM (US)</span>
                  <span className="text-[10px] font-bold text-yellow-200 font-mono drop-shadow">{pk.ourPoints.toLocaleString()} pts</span>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white/20 to-transparent skew-x-12" />
              </motion.div>
              <div className="h-full bg-gradient-to-l from-blue-600 via-indigo-500 to-cyan-500 flex-1 flex items-center justify-end px-4 text-right transition-all duration-300">
                <div className="flex flex-col text-right">
                  <span className="text-[11px] font-black uppercase italic text-white drop-shadow-md">BLUE TEAM (THEM)</span>
                  <span className="text-[10px] font-bold text-cyan-200 font-mono drop-shadow">{pk.enemyPoints.toLocaleString()} pts</span>
                </div>
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-950 rounded-full border-2 border-yellow-500/40 flex items-center justify-center font-black text-sm italic tracking-widest text-yellow-500 shadow-xl shadow-yellow-500/10">
                VS
              </div>
            </div>

            {/* Visual Gifting Leaderboards Side-By-Side */}
            <div className="grid grid-cols-2 gap-4 pt-2 relative z-10 border-t border-white/5">
              {/* Our Top Givers */}
              <div className="space-y-2 bg-red-950/20 border border-red-500/10 p-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-400 flex items-center gap-1">
                    ❤️ OUR GIVERS
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">
                    {pk.ourTopGivers.length} Users
                  </span>
                </div>
                <div className="space-y-1.5 min-h-[64px]">
                  {pk.ourTopGivers.length > 0 ? (
                    pk.ourTopGivers.slice(0, 3).map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] bg-black/40 p-1.5 rounded border border-white/5">
                        <div className="flex items-center gap-1 truncate max-w-[70%]">
                          <span className="text-xs">{g.avatar}</span>
                          <span className="text-white font-bold truncate">{g.name}</span>
                        </div>
                        <span className="text-amber-400 font-mono font-bold">{g.contribution.toLocaleString()} 🪙</span>
                      </div>
                    ))
                  ) : (
                    <div className="h-16 flex items-center justify-center border border-dashed border-white/5 rounded text-[10px] text-slate-500 italic">
                      No points gifted yet
                    </div>
                  )}
                </div>
              </div>

              {/* Enemy Top Givers */}
              <div className="space-y-2 bg-blue-950/20 border border-blue-500/10 p-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 flex items-center gap-1">
                    💙 ENEMY GIVERS
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono font-bold">
                    {pk.enemyTopGivers?.length || 0} Users
                  </span>
                </div>
                <div className="space-y-1.5 min-h-[64px]">
                  {pk.enemyTopGivers && pk.enemyTopGivers.length > 0 ? (
                    pk.enemyTopGivers.slice(0, 3).map((g, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[10px] bg-black/40 p-1.5 rounded border border-white/5">
                        <div className="flex items-center gap-1 truncate max-w-[70%]">
                          <span className="text-xs">{g.avatar}</span>
                          <span className="text-white font-bold truncate">{g.name}</span>
                        </div>
                        <span className="text-cyan-400 font-mono font-bold">{g.contribution.toLocaleString()} 🪙</span>
                      </div>
                    ))
                  ) : (
                    <div className="h-16 flex items-center justify-center border border-dashed border-white/5 rounded text-[10px] text-slate-500 italic">
                      No enemy points
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Testing & Simulation Controls */}
            <div className="bg-black/40 border border-white/5 p-2 rounded-xl text-center space-y-1.5">
              <span className="text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">
                🧪 Developer Quick PK Simulation Tools
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setPk(prev => {
                      const updated = [...prev.ourTopGivers];
                      const exist = updated.find(g => g.name === currentUser.name);
                      if (exist) {
                        exist.contribution += 10;
                      } else {
                        updated.push({ name: currentUser.name, avatar: currentUser.avatar, contribution: 10 });
                      }
                      updated.sort((a, b) => b.contribution - a.contribution);
                      return {
                        ...prev,
                        ourPoints: prev.ourPoints + 100,
                        ourTopGivers: updated
                      };
                    });
                    addAdminLog(`Developer simulated user gifting (+100 pts)`);
                  }}
                  className="bg-red-500/20 hover:bg-red-500/35 text-red-300 py-1 px-1 rounded border border-red-500/20 active:scale-95 transition cursor-pointer"
                >
                  🎁 Gift Us (+100)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPk(prev => {
                      const updated = [...prev.ourTopGivers];
                      const exist = updated.find(g => g.name === currentUser.name);
                      if (exist) {
                        exist.contribution += 200;
                      } else {
                        updated.push({ name: currentUser.name, avatar: currentUser.avatar, contribution: 200 });
                      }
                      updated.sort((a, b) => b.contribution - a.contribution);
                      return {
                        ...prev,
                        ourPoints: prev.ourPoints + 2000,
                        ourTopGivers: updated
                      };
                    });
                    addAdminLog(`Developer simulated user luxury gifting (+2000 pts)`);
                  }}
                  className="bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 py-1 px-1 rounded border border-amber-500/20 active:scale-95 transition cursor-pointer"
                >
                  ⚡ Luxury Us (+2K)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPk(prev => {
                      const updated = prev.enemyTopGivers ? [...prev.enemyTopGivers] : [];
                      if (updated.length > 0) {
                        updated[0].contribution += 15;
                      }
                      updated.sort((a, b) => b.contribution - a.contribution);
                      return {
                        ...prev,
                        enemyPoints: prev.enemyPoints + 150,
                        enemyTopGivers: updated
                      };
                    });
                    addAdminLog(`Developer simulated rival gifting (+150 pts)`);
                  }}
                  className="bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 py-1 px-1 rounded border border-blue-500/20 active:scale-95 transition cursor-pointer"
                >
                  👹 Gift Enemy (+150)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPk(prev => {
                      const updated = prev.enemyTopGivers ? [...prev.enemyTopGivers] : [];
                      if (updated.length > 1) {
                        updated[1].contribution += 180;
                      }
                      updated.sort((a, b) => b.contribution - a.contribution);
                      return {
                        ...prev,
                        enemyPoints: prev.enemyPoints + 1800,
                        enemyTopGivers: updated
                      };
                    });
                    addAdminLog(`Developer simulated rival luxury gifting (+1800 pts)`);
                  }}
                  className="bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 py-1 px-1 rounded border border-indigo-500/20 active:scale-95 transition cursor-pointer"
                >
                  👑 Luxury Enemy (+1.8K)
                </button>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setPk(prev => ({ ...prev, timeLeft: 0, isActive: false }));
                    const winner = pk.ourPoints > pk.enemyPoints ? 'us' : pk.ourPoints < pk.enemyPoints ? 'enemy' : 'draw';
                    setPkWinner(winner);
                  }}
                  className="text-[9px] text-slate-500 hover:text-rose-400 hover:underline font-mono cursor-pointer"
                >
                  ⏩ Force End PK Battle
                </button>
              </div>
            </div>
          </div>
        ) : pkWinner ? (
          /* PK Winner Celebration Panel */
          <div className="bg-gradient-to-r from-purple-950/40 to-slate-900 border border-yellow-500/35 rounded-2xl p-5 text-center space-y-4 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(234,179,8,0.08),transparent)] pointer-events-none" />
            <div className="text-4xl animate-bounce">🏆</div>
            <div>
              <h4 className="text-yellow-400 font-black tracking-widest uppercase text-base">PK BATTLE CONCLUDED!</h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">Final Match Score: {pk.ourPoints} vs {pk.enemyPoints}</p>
            </div>

            <div className="bg-black/55 p-4 rounded-xl max-w-sm mx-auto border border-white/5 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Battle Outcome</span>
              {pkWinner === 'us' ? (
                <div className="space-y-1">
                  <h5 className="text-emerald-400 font-black text-lg animate-pulse">🎉 VICTORY FOR OUR ROOM!</h5>
                  <p className="text-[10px] text-slate-300 font-sans">Our supporters totally dominated the room! All hosts received full diamonds.</p>
                </div>
              ) : pkWinner === 'enemy' ? (
                <div className="space-y-1">
                  <h5 className="text-rose-400 font-black text-lg">💔 DEFEAT! {pk.enemyName} WON</h5>
                  <p className="text-[10px] text-slate-300 font-sans">Rival room had heavier contributors this time. Try again to claim the crown!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <h5 className="text-slate-400 font-black text-lg">⚖️ MATCH DRAWN!</h5>
                  <p className="text-[10px] text-slate-300 font-sans">Super close battle! Scores were dead even at the buzzer.</p>
                </div>
              )}
            </div>

            {/* MVPs */}
            <div className="grid grid-cols-2 gap-3 text-left font-sans text-[10px] max-w-sm mx-auto">
              <div className="bg-red-500/10 border border-red-500/10 p-2 rounded-lg">
                <span className="text-[9px] text-red-400 font-bold block uppercase mb-1">Our MVP</span>
                {pk.ourTopGivers.length > 0 ? (
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{pk.ourTopGivers[0].avatar}</span>
                    <span className="truncate">{pk.ourTopGivers[0].name}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">No supporter</span>
                )}
              </div>
              <div className="bg-blue-500/10 border border-blue-500/10 p-2 rounded-lg">
                <span className="text-[9px] text-blue-400 font-bold block uppercase mb-1">Enemy MVP</span>
                {pk.enemyTopGivers && pk.enemyTopGivers.length > 0 ? (
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{pk.enemyTopGivers[0].avatar}</span>
                    <span className="truncate">{pk.enemyTopGivers[0].name}</span>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">No supporter</span>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleStartPK(pk.enemyName, pk.enemyAvatar, 300)}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl border border-yellow-400 tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                🔄 Rematch Rival
              </button>
              <button
                type="button"
                onClick={() => {
                  setPkWinner(null);
                  setShowPKConfig(true);
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl transition active:scale-95 cursor-pointer"
              >
                Select New Opponent
              </button>
            </div>
          </div>
        ) : (
          /* PK Config Panel / Trigger Arena */
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 relative overflow-hidden shadow-2xl" id="pk-arena-launcher">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-indigo-950/20 pointer-events-none" />
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-5 h-5 text-purple-400" />
                <div>
                  <h4 className="text-white text-sm font-black uppercase tracking-wider">VocoLive PK Battle Arena</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Launch a high-energy 5-minute gifting contest with a live opposing room!</p>
                </div>
              </div>
              <span className="text-[9px] bg-purple-500/15 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold text-purple-300 tracking-wider uppercase">
                Ready to Battle
              </span>
            </div>

            {/* Choose Rival Room */}
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
                Select Rival Live Room Challenge
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
                {[
                  { name: 'Dubai Royals 👑', avatar: '👑', desc: 'Arab High rollers pool' },
                  { name: 'Delhi Rockers 🎸', avatar: '🎸', desc: 'Synth music lovers' },
                  { name: 'Karachi Kings 🦁', avatar: '🦁', desc: 'Loyal roaring squads' },
                  { name: 'Riyal Club 🇸🇦', avatar: '🇸🇦', desc: 'Saudi Diamond Kings' }
                ].map((rival) => (
                  <button
                    key={rival.name}
                    type="button"
                    onClick={() => {
                      setPk({
                        isActive: false,
                        timeLeft: 300,
                        ourPoints: 0,
                        enemyPoints: 0,
                        ourTopGivers: [],
                        enemyTopGivers: [
                          { name: 'Sheikh_Al_Sani', avatar: '👳', contribution: 0 },
                          { name: 'Habibi_99', avatar: '🇦🇪', contribution: 0 },
                          { name: 'Sultan_Khan', avatar: '👑', contribution: 0 }
                        ],
                        enemyName: rival.name,
                        enemyAvatar: rival.avatar
                      });
                    }}
                    className={`p-3 border rounded-xl flex flex-col items-center justify-center text-center gap-1.5 transition active:scale-95 cursor-pointer ${
                      pk.enemyName === rival.name
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-xl font-bold'
                        : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-2xl">{rival.avatar}</span>
                    <span className="text-[11px] font-bold block">{rival.name}</span>
                    <span className="text-[8px] text-slate-500 font-mono italic block leading-none">{rival.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Config Duration & Trigger button */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-2 border-t border-white/5">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                <span>⏱️ Timer:</span>
                <strong className="text-white bg-white/5 border border-white/5 px-2.5 py-1 rounded font-bold">5 Minutes (300 Seconds)</strong>
              </div>
              <button
                type="button"
                onClick={() => handleStartPK(pk.enemyName || 'Dubai Royals 👑', pk.enemyAvatar || '👑', 300)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs px-6 py-2.5 rounded-xl border border-purple-400/30 tracking-wider shadow-lg shadow-purple-600/10 transition active:scale-95 flex items-center justify-center gap-1.5 uppercase cursor-pointer"
              >
                <Swords className="w-4 h-4 text-white" /> Start 5-Min PK Battle
              </button>
            </div>
          </div>
        )}

        {/* AGORA LOW-LATENCY STREAM & MIC MANAGER */}
        <div className="bg-slate-950/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-4 space-y-4 relative overflow-hidden shadow-2xl animate-fade-in" id="agora-stream-manager">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-transparent to-purple-600/10 pointer-events-none" />
          
          {/* Header */}
          <div className="flex justify-between items-center relative z-10 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
                <Radio className={`w-4 h-4 ${isAgoraConnected ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Agora RTC Stream Engine</h4>
                <p className="text-[9px] text-indigo-300 font-mono">Channel: <span className="text-white">vocolive-{roomId}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isAgoraConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
              <span className="text-[10px] font-bold font-mono text-slate-400">
                {isAgoraConnected ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
          </div>

          {/* Connection Stats Block */}
          <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono relative z-10">
            <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
              <span className="text-slate-500 block uppercase text-[8px] font-bold">Latency</span>
              <span className={`font-black ${isAgoraConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isAgoraConnected ? `${agoraLatency}ms` : '—'}
              </span>
            </div>
            <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
              <span className="text-slate-500 block uppercase text-[8px] font-bold">Codec</span>
              <span className="text-white font-black">OPUS-48k</span>
            </div>
            <div className="bg-black/40 border border-white/5 p-2 rounded-xl">
              <span className="text-slate-500 block uppercase text-[8px] font-bold">Audio Mode</span>
              <span className="text-indigo-400 font-black">Stereo HQ</span>
            </div>
          </div>

          {/* Mic Level & Speaker Controls */}
          <div className="space-y-3 relative z-10 bg-black/30 border border-white/5 p-3 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              
              {/* Mic Control */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => {
                    if (currentSeatIndex === null) {
                      addAdminLog("Cannot speak: Please join a microphone seat first!");
                      setVoiceTestStatus('Testing Mic Level');
                      setTimeout(() => setVoiceTestStatus('Normal'), 2000);
                      return;
                    }
                    setIsMicOpen(!isMicOpen);
                    addAdminLog(`Microphone toggled: ${isMicOpen ? 'MUTED' : 'UNMUTED'} via Agora Stream Board`);
                  }}
                  className={`p-2.5 rounded-xl border transition-all transform active:scale-95 ${
                    !isMicOpen || currentSeatIndex === null
                      ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                      : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 shadow-lg shadow-emerald-500/10'
                  }`}
                  title={isMicOpen ? 'Mute Mic' : 'Unmute Mic'}
                >
                  {!isMicOpen || currentSeatIndex === null ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 animate-pulse" />}
                </button>
                <div className="flex-1 sm:flex-initial">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">My Mic Status</span>
                    {currentSeatIndex === null && (
                      <span className="text-[8px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-bold uppercase">NOT ON MIC SEAT</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {currentSeatIndex !== null
                      ? isMicOpen 
                        ? '🟢 Speaking Live on Seat #' + (currentSeatIndex + 1)
                        : '🔴 Muted on Seat #' + (currentSeatIndex + 1)
                      : '⚠️ Click a mic seat above to start speaking'}
                  </p>
                </div>
              </div>

              {/* Speaker Output Control */}
              <div className="w-full sm:w-44 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <button 
                    onClick={() => setIsAgoraSpeakerMuted(!isAgoraSpeakerMuted)}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    {isAgoraSpeakerMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>Output Volume</span>
                  </button>
                  <span className="text-white font-bold">{isAgoraSpeakerMuted ? 'Muted' : `${agoraSpeakerVolume}%`}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isAgoraSpeakerMuted}
                  value={isAgoraSpeakerMuted ? 0 : agoraSpeakerVolume}
                  onChange={(e) => setAgoraSpeakerVolume(Number(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
                />
              </div>
            </div>

            {/* Simulated Live Microphone Audio Waves (Decibel Meter) */}
            <div className="space-y-1 border-t border-white/5 pt-2.5">
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                <span>🎤 INPUT GAIN DECIbels (DB)</span>
                <span className="text-indigo-400">{isMicOpen && currentSeatIndex !== null && isAgoraConnected ? '-14.5 dB (Optimal)' : '-INF dB (Muted)'}</span>
              </div>
              <div className="flex items-end gap-1 h-6 pt-1">
                {[...Array(24)].map((_, i) => {
                  const isGainActive = isMicOpen && currentSeatIndex !== null && isAgoraConnected;
                  return (
                    <motion.div
                      key={i}
                      animate={isGainActive ? {
                        height: [
                          `${Math.max(10, Math.random() * 100)}%`,
                          `${Math.max(10, Math.random() * 100)}%`,
                          `${Math.max(10, Math.random() * 100)}%`
                        ]
                      } : { height: '10%' }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.4 + (i % 3) * 0.1,
                        ease: 'easeInOut'
                      }}
                      className={`flex-1 rounded-sm transition-all duration-300 ${
                        isGainActive
                          ? i < 16 
                            ? 'bg-gradient-to-t from-indigo-500 to-purple-500' 
                            : 'bg-gradient-to-t from-purple-500 to-rose-500'
                          : 'bg-slate-800'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* LIVE INCOMING MESSAGE MONITOR & CHECKER */}
          <div className="bg-black/45 border border-indigo-500/10 rounded-xl p-3 space-y-2 relative z-10">
            <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
              <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Real-time Message Monitor
              </span>
              <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                {voiceTestStatus}
              </span>
            </div>

            {/* Current Message View Box */}
            <div className="bg-black/60 p-2.5 rounded-lg border border-white/5">
              <span className="text-[9px] text-slate-500 font-mono block mb-1 uppercase tracking-wider">Latest Live Room Message:</span>
              <p className="text-[11px] text-white font-sans leading-snug break-words italic">
                {lastCheckedMessage}
              </p>
            </div>

            {/* Actions for Message Monitor */}
            <div className="flex gap-2 items-center justify-between text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  setVoiceTestStatus('Calibrating...');
                  addAdminLog(`Agora audio check: Text-To-Speech verification started for message`);
                  setTimeout(() => {
                    setVoiceTestStatus('Acoustics Optimal');
                    // Play simulated chime via default audio ref
                    if (audioRef.current) {
                      addAdminLog(`Agora Speaker self-test pass!`);
                    }
                  }, 1200);
                }}
                className="bg-indigo-500/20 hover:bg-indigo-500/35 text-indigo-300 py-1.5 px-3 rounded-lg border border-indigo-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1"
              >
                🔊 Check Sound & TTS Test
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setIsAgoraConnected(!isAgoraConnected);
                  addAdminLog(`Agora stream connection status toggled: ${!isAgoraConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
                }}
                className={`py-1.5 px-3 rounded-lg border transition cursor-pointer font-bold ${
                  isAgoraConnected 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                    : 'bg-emerald-500/20 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                }`}
              >
                {isAgoraConnected ? '🔌 Cut Agora' : '⚡ Join Stream'}
              </button>
            </div>
          </div>
        </div>

        {/* REAL-TIME AUDIO & VOICE FILTERS (WEB AUDIO API) */}
        <div className="bg-slate-950/60 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-4 space-y-4 relative overflow-hidden shadow-2xl animate-fade-in" id="voice-filter-control-panel">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
          
          {/* Header */}
          <div className="flex justify-between items-center relative z-10 border-b border-white/5 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                <Radio className={`w-4 h-4 ${isLiveVoiceMonitoring ? 'animate-pulse' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Host Voice Filter Panel</h4>
                <p className="text-[9px] text-purple-300 font-mono">Web Audio API Pipeline • Dual-Channel Synthesis</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLiveVoiceMonitoring(!isLiveVoiceMonitoring);
                }}
                className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-all duration-300 active:scale-95 cursor-pointer border ${
                  isLiveVoiceMonitoring
                    ? 'bg-purple-500 text-white border-purple-400 shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                }`}
              >
                {isLiveVoiceMonitoring ? '🛑 STOP FX GRAPH' : '⚡ RUN FX GRAPH'}
              </button>
            </div>
          </div>

          {/* Voice Source Select & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 text-[10px] font-mono">
            {/* Input Selection */}
            <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl space-y-1.5">
              <span className="text-slate-400 block uppercase text-[8px] font-black tracking-wider">Audio Source Input</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsUsingSyntheticVoice(false);
                    if (!isLiveVoiceMonitoring) {
                      setIsLiveVoiceMonitoring(true);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center font-bold border transition ${
                    !isUsingSyntheticVoice
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🎤 Real Mic
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUsingSyntheticVoice(true);
                    if (!isLiveVoiceMonitoring) {
                      setIsLiveVoiceMonitoring(true);
                    }
                  }}
                  className={`py-1.5 px-2 rounded-lg text-center font-bold border transition ${
                    isUsingSyntheticVoice
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-black/40 border-white/5 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  🤖 Vocal Synth
                </button>
              </div>
            </div>

            {/* Live Pipeline Map */}
            <div className="bg-black/30 border border-white/5 p-2.5 rounded-xl space-y-1">
              <span className="text-slate-400 block uppercase text-[8px] font-black tracking-wider">Audio Routing Graph</span>
              <div className="text-[9px] text-slate-300 truncate font-mono bg-black/60 py-1 px-2 rounded border border-white/5">
                {isLiveVoiceMonitoring ? (
                  <span className="text-emerald-400">
                    {isUsingSyntheticVoice ? 'Oscillator' : 'Mic'} 
                    {isRobotActive ? ' ➔ RingMod' : ''}
                    {isPitchShiftActive ? ' ➔ PitchShifter' : ''}
                    {isEchoActive ? ' ➔ EchoDelay' : ''} ➔ Analyser ➔ Output
                  </span>
                ) : (
                  <span className="text-slate-500">Pipeline Offline • Click Run to activate</span>
                )}
              </div>
              {voiceFilterError && (
                <p className="text-[8px] text-rose-400 font-bold truncate leading-tight mt-1">⚠️ {voiceFilterError}</p>
              )}
            </div>
          </div>

          {/* Canvas Waveform Visualizer */}
          <div className="bg-black/50 border border-white/5 p-2 rounded-xl relative overflow-hidden z-10">
            <div className="absolute top-1.5 right-2 text-[7px] font-mono text-slate-500 uppercase tracking-widest z-20 pointer-events-none">
              Live Waveform Oscilloscope
            </div>
            <canvas
              ref={voiceCanvasRef}
              width={480}
              height={70}
              className="w-full h-[65px] rounded-lg block bg-[#0f1020]"
            />
          </div>

          {/* Interactive Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10 text-[10px] font-mono">
            
            {/* Robot Filter Column */}
            <div className={`p-3 rounded-xl border transition-all ${
              isRobotActive 
                ? 'bg-purple-500/10 border-purple-500/35' 
                : 'bg-black/20 border-white/5'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  🤖 Robot Mode
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsRobotActive(!isRobotActive);
                    if (!isLiveVoiceMonitoring) setIsLiveVoiceMonitoring(true);
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    isRobotActive 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {isRobotActive ? 'Active' : 'Disabled'}
                </button>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal mb-2.5">
                Applies ring modulation multiplication with a low-frequency carrier sine wave to create a metallic buzz.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[8px]">
                  <span>Carrier Frequency:</span>
                  <span className="text-purple-400 font-bold">{robotFrequency} Hz</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="5"
                  value={robotFrequency}
                  onChange={(e) => setRobotFrequency(Number(e.target.value))}
                  disabled={!isRobotActive}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-purple-500 disabled:opacity-30"
                />
              </div>
            </div>

            {/* Pitch Shift Filter Column */}
            <div className={`p-3 rounded-xl border transition-all ${
              isPitchShiftActive 
                ? 'bg-indigo-500/10 border-indigo-500/35' 
                : 'bg-black/20 border-white/5'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  🐿️ Pitch Shift
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsPitchShiftActive(!isPitchShiftActive);
                    if (!isLiveVoiceMonitoring) setIsLiveVoiceMonitoring(true);
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    isPitchShiftActive 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {isPitchShiftActive ? 'Active' : 'Disabled'}
                </button>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal mb-2.5">
                Adjusts detune pitch rates and vocal resonant peak formants for squeaky chipmunk or deep booming voice.
              </p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-400 text-[8px]">
                  <span>Transpose:</span>
                  <span className="text-indigo-400 font-bold">
                    {pitchShiftSemi > 0 ? `+${pitchShiftSemi}` : pitchShiftSemi} Semitones
                  </span>
                </div>
                <input
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={pitchShiftSemi}
                  onChange={(e) => setPitchShiftSemi(Number(e.target.value))}
                  disabled={!isPitchShiftActive}
                  className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-indigo-500 disabled:opacity-30"
                />
              </div>
            </div>

            {/* Echo/Delay Filter Column */}
            <div className={`p-3 rounded-xl border transition-all ${
              isEchoActive 
                ? 'bg-emerald-500/10 border-emerald-500/35' 
                : 'bg-black/20 border-white/5'
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  🔁 Echo Delay
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsEchoActive(!isEchoActive);
                    if (!isLiveVoiceMonitoring) setIsLiveVoiceMonitoring(true);
                  }}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    isEchoActive 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {isEchoActive ? 'Active' : 'Disabled'}
                </button>
              </div>
              <p className="text-[8px] text-slate-400 leading-normal mb-2.5">
                Splits audio paths to feed real-time signal into an adjustable delay line with customizable gain feedback.
              </p>
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[8px]">
                    <span>Delay Time:</span>
                    <span className="text-emerald-400 font-bold">{echoDelay}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={echoDelay}
                    onChange={(e) => setEchoDelay(Number(e.target.value))}
                    disabled={!isEchoActive}
                    className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-400 text-[8px]">
                    <span>Feedback Gain:</span>
                    <span className="text-emerald-400 font-bold">{Math.round(echoFeedback * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.8"
                    step="0.05"
                    value={echoFeedback}
                    onChange={(e) => setEchoFeedback(Number(e.target.value))}
                    disabled={!isEchoActive}
                    className="w-full h-1 bg-white/10 rounded appearance-none cursor-pointer accent-emerald-500 disabled:opacity-30"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* MULTI-FUNCTIONAL ROOM MUSIC SYSTEM & SOUNDBOARD */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-4 relative overflow-hidden shadow-2xl" id="room-music-system">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 pointer-events-none" />
          
          {/* Header */}
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                <Music className={`w-4 h-4 ${isPlayingMusic ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">Live BGM & Soundboard Controls</h4>
                <p className="text-[9px] text-slate-400 font-mono">Stream High-Fidelity Audio • Auto Mic Ducking</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                isPlayingMusic 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-white/5 text-slate-400'
              }`}>
                {isPlayingMusic ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    BGM On-Air
                  </>
                ) : 'BGM Standby'}
              </span>
            </div>
          </div>

          {/* Player controls row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10 border-t border-b border-white/5 py-3">
            {/* Album art Spinning Vinyl & Track Metadata */}
            <div className="md:col-span-5 flex items-center gap-3">
              <div className="relative">
                {/* Visual Audio Wave Rings */}
                {isPlayingMusic && (
                  <div className="absolute -inset-1 rounded-full bg-purple-500/10 border border-purple-500/30 animate-ping" />
                )}
                
                {/* Vinyl Disc */}
                <motion.div
                  animate={isPlayingMusic ? { rotate: 360 } : {}}
                  transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-neutral-900 via-zinc-800 to-neutral-900 border border-zinc-700 flex items-center justify-center shadow-md relative"
                >
                  <div className="w-4 h-4 rounded-full bg-purple-600 border border-zinc-950 flex items-center justify-center animate-pulse">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                  <span className="absolute text-xs font-mono top-1 left-1">🎵</span>
                </motion.div>
              </div>

              <div className="overflow-hidden">
                <p className="text-white font-bold text-xs truncate">{TRACKS[playingTrackIndex].title}</p>
                <p className="text-purple-400 text-[10px] font-mono truncate">{TRACKS[playingTrackIndex].artist}</p>
              </div>
            </div>

            {/* Standard Audio Playback Controls & Progress */}
            <div className="md:col-span-7 space-y-1.5">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <button
                  onClick={() => selectTrack((playingTrackIndex - 1 + TRACKS.length) % TRACKS.length)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                  title="Previous"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                  className={`p-2 rounded-full text-slate-950 font-black transition transform active:scale-95 ${
                    isPlayingMusic 
                      ? 'bg-purple-400 hover:bg-purple-300 shadow-lg shadow-purple-500/20' 
                      : 'bg-white hover:bg-slate-100 shadow-md'
                  }`}
                  title={isPlayingMusic ? 'Pause' : 'Play'}
                >
                  {isPlayingMusic ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
                </button>

                <button
                  onClick={() => selectTrack((playingTrackIndex + 1) % TRACKS.length)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                  title="Next"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1 text-[9px] font-mono text-slate-500 whitespace-nowrap pl-2">
                  <span>{formatTime(musicProgress)}</span>
                  <span>/</span>
                  <span>{TRACKS[playingTrackIndex].duration}</span>
                </div>
              </div>

              {/* Interactive Progress Bar */}
              <div className="relative w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const width = rect.width;
                const pct = clickX / width;
                setMusicProgress(Math.floor(pct * TRACKS[playingTrackIndex].totalSec));
              }}>
                <div
                  className="h-full bg-purple-500"
                  style={{ width: `${(musicProgress / TRACKS[playingTrackIndex].totalSec) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Volume, Ducking & Interactive Soundboard Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative z-10">
            {/* Sound Level Slider & Auto-Ducking */}
            <div className="md:col-span-5 space-y-2 font-mono text-[10px]">
              <div className="flex justify-between items-center text-slate-400">
                <span className="flex items-center gap-1">
                  {musicVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-purple-400" />}
                  BGM Volume: <strong>{musicVolume}%</strong>
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              
              <button
                onClick={() => setIsDuckingEnabled(!isDuckingEnabled)}
                className={`w-full py-1 px-2.5 rounded-lg border text-[9px] font-bold uppercase transition flex items-center justify-between ${
                  isDuckingEnabled 
                    ? 'bg-purple-500/10 border-purple-500/40 text-purple-300' 
                    : 'bg-black/20 border-white/5 text-slate-500'
                }`}
                title="Lowers BGM automatically when co-hosts start speaking"
              >
                <span>🎙️ Mic Smart Auto-Ducking</span>
                <span className={isDuckingEnabled ? 'text-purple-400' : 'text-slate-600'}>
                  {isDuckingEnabled ? 'ACTIVE (90ms)' : 'OFF'}
                </span>
              </button>
            </div>

            {/* Premium Host Soundboard Grid (Sound FX) */}
            <div className="md:col-span-7 space-y-1.5 relative">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                🔊 Live Soundboard FX (Mic Broadcast)
              </span>
              
              {/* Grid of Sound Effects */}
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  { type: 'clap', label: 'Taali', emoji: '👏' },
                  { type: 'cheer', label: 'Dhol', emoji: '🎉' },
                  { type: 'laughter', label: 'Qahqaha', emoji: '😂' },
                  { type: 'horn', label: 'Bhopu', emoji: '🎺' },
                  { type: 'bell', label: 'Ghanti', emoji: '🔔' },
                  { type: 'drum', label: 'Dhamaka', emoji: '🥁' }
                ].map((fx) => (
                  <button
                    key={fx.type}
                    onClick={() => triggerSoundFX(fx.type, fx.emoji)}
                    className="p-1.5 bg-white/5 border border-white/5 hover:border-purple-500/30 rounded-lg text-center transition flex flex-col items-center justify-center hover:scale-105"
                  >
                    <span className="text-base">{fx.emoji}</span>
                    <span className="text-[7px] text-slate-400 truncate w-full mt-0.5">{fx.label}</span>
                  </button>
                ))}
              </div>

              {/* Floating FX container */}
              <AnimatePresence>
                {floatingFX.map((fx) => (
                  <motion.div
                    key={fx.id}
                    initial={{ y: 20, opacity: 0, scale: 0.5 }}
                    animate={{ y: -120, opacity: [0, 1, 1, 0], scale: [0.5, 1.5, 1.5, 0.8] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, ease: 'easeOut' }}
                    className="absolute bottom-6 left-1/2 text-2xl z-50 pointer-events-none drop-shadow-md font-bold"
                    style={{ marginLeft: `${fx.x}px` }}
                  >
                    {fx.emoji}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 8 MIC SEATS GRID */}
        <div className="grid grid-cols-4 gap-6 py-4 relative z-10">
          {seats.map((seat, idx) => {
            const isHostSeat = idx === 0;
            const displayedUser = seat.user && seat.user.id === currentUser.id ? currentUser : seat.user;
            const seatIsMuted = displayedUser
              ? displayedUser.id === currentUser.id
                ? !isMicOpen
                : seat.isMuted
              : false;
            const isSpeaking = displayedUser && speakers[displayedUser.id] && !seatIsMuted;

            return (
              <div
                key={seat.index}
                onClick={() => handleSeatClick(idx)}
                className="flex flex-col items-center justify-center cursor-pointer select-none group transition-all duration-300 hover:scale-105"
              >
                {/* Visual Seat Ring */}
                <div className="relative">
                  {/* Bouncing Audio Wave Ring */}
                  {isSpeaking && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className={`absolute -inset-1 rounded-full border-2 ${
                        isHostSeat ? 'bg-yellow-500/20 border-yellow-500' : 'bg-emerald-500/20 border-emerald-500'
                      }`}
                    />
                  )}

                  <div
                    className={`w-18 h-18 rounded-full flex items-center justify-center text-3xl relative z-10 border-2 transition-all duration-300 ${
                      displayedUser
                        ? !seatIsMuted
                          ? 'border-emerald-500 ring-4 ring-emerald-400/60 shadow-[0_0_20px_rgba(16,185,129,0.75)] animate-pulse bg-slate-900'
                          : isHostSeat
                            ? 'border-yellow-500 ring-4 ring-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.4)] bg-gradient-to-b from-indigo-900 to-[#131424]'
                            : displayedUser.id === currentUser.id
                              ? 'border-rose-500 bg-slate-900 ring-4 ring-rose-500/20'
                              : displayedUser.frame 
                                ? `${displayedUser.frame} bg-slate-900`
                                : 'border-white/20 bg-slate-900 group-hover:border-white/40'
                        : seat.isLocked
                          ? 'border-white/10 bg-white/5 backdrop-blur-md text-white/20'
                          : 'border-dashed border-white/10 hover:border-white/30 bg-white/5 backdrop-blur-md text-white/40'
                    }`}
                  >
                    {displayedUser ? (
                      <div className="relative w-full h-full rounded-full flex items-center justify-center overflow-hidden">
                        {isHostSeat && !displayedUser.dp && (
                          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-purple-800/20 opacity-80" />
                        )}
                        {displayedUser.dp ? (
                          <img 
                            src={displayedUser.dp} 
                            alt={displayedUser.name} 
                            className="w-full h-full object-cover rounded-full" 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <span className="relative z-10 text-2xl">{displayedUser.avatar}</span>
                        )}

                        {/* Muted overlay icon if muted */}
                        {seatIsMuted && (
                          <div className="absolute inset-0 bg-red-950/80 rounded-full flex flex-col items-center justify-center z-20 border-2 border-red-500/50 animate-pulse">
                            <span className="text-base select-none">🔇</span>
                            <span className="text-[7.5px] text-red-400 font-extrabold uppercase tracking-wider mt-0.5">Muted</span>
                          </div>
                        )}
                      </div>
                    ) : seat.isLocked ? (
                      <span className="text-xl">🔒</span>
                    ) : (
                      <span className="text-xl font-light text-white/30 group-hover:text-white/60">+</span>
                    )}

                    {/* Host Badge Overlay */}
                    {isHostSeat && (
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider scale-95 z-20">
                        Host
                      </div>
                    )}

                    {/* Mic status badge overlay */}
                    {displayedUser && (
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full flex items-center justify-center border border-slate-950 z-20 ${
                        seatIsMuted ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}>
                        {seatIsMuted ? (
                          <MicOff className="w-2.5 h-2.5 text-white" />
                        ) : (
                          <Mic className="w-2.5 h-2.5 text-slate-950" />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Speaker Label */}
                <span className={`text-[10px] text-center font-bold mt-2.5 truncate w-16 block ${
                  displayedUser
                    ? isHostSeat
                      ? 'text-yellow-400 font-black'
                      : displayedUser.id === currentUser.id
                        ? 'text-indigo-400'
                        : 'text-slate-200'
                    : 'text-slate-500'
                }`}>
                  {displayedUser ? displayedUser.name.split(' ')[0] : `Seat ${idx + 1}`}
                </span>

                {/* Level badge if user is sitting */}
                {displayedUser && (
                  <span className={`text-[8px] font-bold px-1 rounded border font-mono mt-1 scale-90 ${
                    isHostSeat
                      ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    LV.{displayedUser.level}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* LIVE ROOM MINI DASHBOARD SUITE (Proposal, Coins & Agency) */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xl" id="room-mini-hud">
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400">📊</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">Room live Control Suite</h4>
            </div>
            
            {/* Tab switch buttons */}
            <div className="flex gap-1">
              {[
                { id: 'proposal', label: '📋 Proposal' },
                { id: 'reseller', label: '🪙 Coins Reseller' },
                { id: 'agency', label: '🌹 Agency Info' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setMiniDbTab(tab.id as any)}
                  className={`px-2 py-1 rounded text-[9px] font-bold transition uppercase ${
                    miniDbTab === tab.id
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'bg-black/20 text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab contents */}
          <div className="text-xs leading-relaxed text-slate-300">
            {miniDbTab === 'proposal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Interactive Project Proposal</p>
                  <p className="text-white font-bold text-xs mt-1">Live Voice App Cost: <span className="text-purple-400">$2,500 - $3,500</span></p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Approx. 7.5 - 10 Lakh PKR. Features modern UI, low latency audio rooms, synthetic soundboards, greedy wheel, profile frame shops, and live agencies.</p>
                </div>
                <div className="space-y-1 text-[11px] font-mono border-t md:border-t-0 md:border-l border-white/5 pt-2 md:pt-0 md:pl-3">
                  <p className="text-purple-400 font-bold">Estimated Phases:</p>
                  <p>• Phase 1-2: UI Design & Low-Latency Audio (8 Days)</p>
                  <p>• Phase 3: Interactive Gifting & Games (10 Days)</p>
                  <p>• Phase 4: Agency & Admin Suite (15 Days)</p>
                  <button 
                    onClick={() => alert("Simulation: Proposal configuration request saved! Danish (Owner) has been notified.")}
                    className="w-full mt-1.5 py-1 bg-purple-500 text-slate-950 font-black rounded text-[9px] uppercase tracking-wider hover:bg-purple-400 transition"
                  >
                    Get Premium Android Quote
                  </button>
                </div>
              </div>
            )}

            {miniDbTab === 'reseller' && (
              <div className="space-y-2 bg-black/20 p-2.5 rounded-lg border border-white/5">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center text-[11px] text-slate-400 font-mono border-b border-white/5 pb-1">
                  <span>Authorized Coin Partner: <strong className="text-white">Danish Reseller Ltd 🇵🇰</strong></span>
                  <span className="text-amber-400 font-bold">Rate: 100,000 Coins = $1,000 USD (Includes 5% Bonus)</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 pt-1.5 text-[11px]">
                  <span className="text-slate-400 font-mono">Transfer Coins:</span>
                  <select
                    value={quickTransferTargetId}
                    onChange={(e) => setQuickTransferTargetId(e.target.value)}
                    className="bg-[#0e0f1d] border border-white/10 text-white rounded px-2 py-1 text-[10px]"
                  >
                    <option value="1001">Kamran (Host) - Seat 1</option>
                    <option value="1002">Aisha (AI) - Seat 2</option>
                    <option value="1003">Zain (AI) - Seat 3</option>
                    <option value="7777">Danish (Self) - ID 7777</option>
                  </select>

                  <select
                    value={quickTransferAmount}
                    onChange={(e) => setQuickTransferAmount(Number(e.target.value))}
                    className="bg-[#0e0f1d] border border-white/10 text-amber-400 rounded px-2 py-1 text-[10px] font-bold"
                  >
                    <option value="500">🪙 500 Coins</option>
                    <option value="1000">🪙 1,000 Coins</option>
                    <option value="5000">🪙 5,000 Coins</option>
                  </select>

                  <button
                    onClick={() => {
                      if (currentUser.coins < quickTransferAmount) {
                        alert("Error: Insufficient coins in your VocoLive wallet! Please use the top-up shop.");
                        return;
                      }
                      
                      // Subtract coins
                      setCurrentUser({ ...currentUser, coins: currentUser.coins - quickTransferAmount });
                      
                      // Add to logs and trigger a custom chat announcement
                      const targetName = quickTransferTargetId === '1001' ? 'Kamran' : quickTransferTargetId === '1002' ? 'Aisha' : quickTransferTargetId === '1003' ? 'Zain' : 'Danish';
                      addAdminLog(`Coin reseller quick transfer: ${quickTransferAmount} Coins sent to ID #${quickTransferTargetId} (${targetName})`);
                      
                      const transferMsg: ChatMessage = {
                        id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                        text: `💎 Coin Reseller: Danish sent ${quickTransferAmount} Coins to ${targetName}!`,
                        isSystem: true,
                        timestamp: 'Now'
                      };
                      setMessages(prev => [...prev, transferMsg]);
                      
                      alert(`Transfer Successful!\nSent ${quickTransferAmount.toLocaleString()} Coins to ${targetName} instantly!`);
                    }}
                    className="bg-yellow-500 text-slate-950 font-black px-3 py-1 rounded text-[10px] uppercase hover:bg-yellow-400 transition"
                  >
                    Transfer Instantly
                  </button>
                </div>
              </div>
            )}

            {miniDbTab === 'agency' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-black/20 p-2.5 rounded-lg border border-white/5 text-[11px] font-mono">
                <div className="space-y-0.5">
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Master Agency 🇵🇰</p>
                  <p className="text-white font-bold">Voco Master Pak</p>
                  <p className="text-slate-400">ID: #99331</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Host Commissions</p>
                  <p className="text-emerald-400 font-bold">60% Net Share</p>
                  <p className="text-slate-400">Weekly Payouts</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 font-bold uppercase text-[9px]">Agency Goal</p>
                  <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full w-[45%]" style={{ width: '45%' }} />
                  </div>
                  <p className="text-slate-400 text-[9px] flex justify-between">
                    <span>45,000 / 100K Dia</span>
                    <span className="text-purple-400 font-bold">45%</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* QUICK INTERACTIVE CHAT BUBBLES SYSTEM (FAST CHAT) */}
        <div className="space-y-1.5 relative z-10" id="quick-chat-bubbles">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
            💬 Quick Urdu Chat Bubbles (Tap to Send instantly)
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-[70px] overflow-y-auto pr-1">
            {[
              { text: "Assalam-o-Alaikum dosto! 🕌", label: "Salam" },
              { text: "Wah! Kya sufi dhol beats hain! 🥁", label: "Beats" },
              { text: "Host dhol ya shahnai bajao! 🎺", label: "Instrument" },
              { text: "Bhai, coin reseller ka rate kya ha? 🪙", label: "Rate" },
              { text: "Mera coin balance transfer karo! 🙏", label: "Coins" },
              { text: "Greedy Game wheel spin karo jackpot ke liye! 🎰", label: "Greedy" },
              { text: "3D Super Car send kar rha hoon taiyar raho! 🏎️💨", label: "Car Alert" },
              { text: "Ludo match shuru karo host! 🏆", label: "Ludo" }
            ].map((bubble, idx) => (
              <button
                key={idx}
                type="button"
                onClick={async () => {
                  // Instant append
                  const optMsg: ChatMessage = {
                    id: 'bubble_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                    user: currentUser,
                    text: bubble.text,
                    timestamp: 'Now'
                  };
                  setMessages(prev => [...prev, optMsg]);
                  if (onMessageSent) {
                    onMessageSent();
                  }
                  addAdminLog(`Quick bubble chat from ${currentUser.name}: "${bubble.text}"`);

                  // Also simulate trigger reply from co-hosts
                  setTimeout(() => {
                    const replies = [
                      "Walaikum Assalam! Welcome to Pakistan Sufi room.",
                      "Bilkul sahi dhol bajaya!",
                      "JazzCash top-up rates best hain reseller panel per.",
                      "Greedy wheel spin 500 coins se karo!"
                    ];
                    const randomReply = replies[Math.floor(Math.random() * replies.length)];
                    const replyingUser = seats.find(s => s.user !== null && s.user.id !== currentUser.id)?.user || {
                      id: '1001',
                      name: 'Kamran (Host)',
                      avatar: '👨‍💼',
                      bio: '',
                      coins: 0,
                      diamonds: 0,
                      level: 32,
                      badge: 'Host'
                    };
                    const aiMsg: ChatMessage = {
                      id: 'ai_bubble_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
                      user: replyingUser,
                      text: randomReply,
                      timestamp: 'Now'
                    };
                    setMessages(prev => [...prev, aiMsg]);
                  }, 1200);
                }}
                className="bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/10 rounded-full px-2.5 py-1 text-[10px] text-slate-300 hover:text-white transition flex items-center gap-1 active:scale-95 shrink-0"
              >
                <span>💬</span>
                <span>{bubble.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GREEDY mini-game or standard panels */}
        {showGame && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-slate-900/95 border border-amber-500/30 rounded-xl p-4 space-y-3 relative z-20"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                🎰 Greedy Wheel of Fortune (Bet & Win)
              </span>
              <button onClick={() => setShowGame(false)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Betting symbols selection */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Select Bet Target (Payout: 3.5x)</span>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-bold font-mono">
                  {(['tiger', 'dragon', 'phoenix', 'panda'] as const).map((sym) => (
                    <button
                      key={sym}
                      onClick={() => setSelectedBetSymbol(sym)}
                      className={`p-2 rounded-lg border text-center transition ${
                        selectedBetSymbol === sym
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      {sym === 'tiger' && '🐯 TIGER'}
                      {sym === 'dragon' && '🐉 DRAGON'}
                      {sym === 'phoenix' && '🦅 PHOENIX'}
                      {sym === 'panda' && '🐼 PANDA'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spin & Wheel Visualizer */}
              <div className="flex flex-col items-center justify-center space-y-2">
                {/* Spinning Circle Dial */}
                <div className="relative w-16 h-16 rounded-full border-4 border-amber-500/40 flex items-center justify-center bg-slate-950 overflow-hidden shadow-inner">
                  <motion.div
                    animate={{ rotate: wheelDegree }}
                    transition={{ duration: isSpinning ? 3 : 0, ease: 'easeOut' }}
                    className="absolute inset-1 rounded-full border border-dashed border-amber-500/20 flex items-center justify-center text-[10px]"
                  >
                    🎯
                  </motion.div>
                  <div className="absolute top-0 w-1.5 h-4 bg-red-500 z-10 rounded-full" />
                </div>

                {/* Bet quantity controls */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono">
                  <span className="text-slate-500">Bet:</span>
                  {[50, 100, 500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setBetAmount(amt)}
                      className={`px-1.5 py-0.5 rounded transition ${
                        betAmount === amt ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {spinResult && (
              <div className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-center text-[11px] font-bold text-amber-300 font-mono">
                {spinResult}
              </div>
            )}

            <button
              onClick={handleBetWheelSpin}
              disabled={isSpinning}
              className={`w-full py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition ${
                isSpinning
                  ? 'bg-slate-800 text-slate-600 border border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 hover:from-amber-400 hover:to-yellow-400 font-black shadow-lg border border-amber-300'
              }`}
            >
              {isSpinning ? 'SPINNING GREEDY WHEEL...' : `SPIN WHEEL WITH ${betAmount} COINS`}
            </button>
          </motion.div>
        )}

        {/* Room Mute/Seat Controls on Footer */}
        <div className="flex gap-2 bg-white/5 p-2.5 rounded-xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setIsMicOpen(!isMicOpen)}
            disabled={currentSeatIndex === null}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition ${
              currentSeatIndex === null
                ? 'bg-black/20 border-white/5 text-slate-600 cursor-not-allowed'
                : !isMicOpen
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500 text-emerald-400 hover:bg-emerald-500/20'
            }`}
          >
            {!isMicOpen ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            {!isMicOpen ? 'Muted 🔇' : 'Speaking Live 🎙️'}
          </button>

          <button
            onClick={() => setShowGiftPanel(!showGiftPanel)}
            className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:from-purple-500 hover:to-indigo-500 shadow-lg border border-indigo-400/30 transition"
          >
            <GiftIcon className="w-4 h-4" /> Send Gift
          </button>
        </div>
        </>
        )}
      </div>

      {/* RIGHT SIDE: Real-Time Chat & Gifting Sidebar Panel */}
      <div className="w-full md:w-80 bg-black/45 border-t md:border-t-0 md:border-l border-white/5 flex flex-col h-[320px] md:h-full overflow-hidden backdrop-blur-md">
        
        {/* Active room chat log */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2 font-sans text-xs flex flex-col justify-end">
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className="leading-relaxed">
                {msg.isSystem ? (
                  <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60 text-[10px] text-slate-400 font-mono flex gap-1.5 items-start">
                    <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-900">
                    <div className="flex items-center gap-1.5 font-mono text-[9px]">
                      <button
                        type="button"
                        onClick={() => msg.user && openUserProfile(msg.user)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 transition cursor-pointer text-left focus:outline-none"
                      >
                        <span>{msg.user?.avatar}</span>
                        <span className="underline decoration-indigo-500/30 hover:decoration-indigo-400">{msg.user?.name}:</span>
                      </button>
                      {msg.user?.badge && msg.user.badge !== 'Guest' && (
                        <span className="bg-indigo-500/10 text-indigo-400 px-1 rounded scale-90 border border-indigo-500/20 uppercase font-black">
                          {msg.user.badge}
                        </span>
                      )}
                    </div>
                    {msg.gift ? (
                      <p className="text-slate-300 font-bold mt-0.5 pl-3">
                        {msg.text} <span className="text-amber-400 font-extrabold">{msg.gift.icon}</span>
                      </p>
                    ) : (
                      <p className="text-slate-300 mt-0.5 whitespace-pre-wrap">{msg.text}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Chat input form with AI trigger */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2 relative z-10">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? 'Gemini filtering...' : 'Enter message in Urdu/Hindi/English...'}
            className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs rounded-lg px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-lg transition disabled:opacity-50 flex items-center justify-center"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>

      </div>
    </div>
  );
}
